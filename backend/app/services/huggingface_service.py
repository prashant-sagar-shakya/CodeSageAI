import httpx
import json
import logging
import asyncio
from app.config import settings

logger = logging.getLogger(__name__)

# Standard JSON schema for code review findings
ISSUE_ARRAY_SCHEMA = {
    "type": "ARRAY",
    "items": {
        "type": "OBJECT",
        "properties": {
            "title": {"type": "STRING"},
            "description": {"type": "STRING"},
            "severity": {
                "type": "STRING", 
                "enum": ["critical", "warning", "info", "suggestion"]
            },
            "file": {"type": "STRING"},
            "line": {"type": "INTEGER"},
            "explanation": {"type": "STRING"},
            "how_to_fix": {"type": "STRING"},
            "code_before": {"type": "STRING"},
            "code_after": {"type": "STRING"},
            "confidence": {"type": "INTEGER"},
            "category": {"type": "STRING"}
        },
        "required": [
            "title", "description", "severity", "file", "line", 
            "explanation", "how_to_fix", "code_before", "code_after", 
            "confidence", "category"
        ]
    }
}

class HuggingFaceService:
    def __init__(self):
        self.api_key = settings.HUGGINGFACE_API_KEY
        self.api_url = settings.HUGGINGFACE_API_URL
        self.client = httpx.AsyncClient(timeout=120.0)
        self._semaphore = None
        self._last_request_time = 0

    async def _get_semaphore(self):
        if self._semaphore is None:
            self._semaphore = asyncio.Semaphore(2)
        return self._semaphore

    async def _wait_for_rate_limit(self):
        """Ensure at least 3 seconds between requests (free tier is ~20 RPM)."""
        now = asyncio.get_event_loop().time()
        time_since_last = now - self._last_request_time
        if time_since_last < 3.0:
            await asyncio.sleep(3.0 - time_since_last)
        self._last_request_time = asyncio.get_event_loop().time()

    def _check_billing_error(self, response: httpx.Response) -> bool:
        """Check for 402/403 billing/permission errors. Returns True if it's a billing error."""
        if response.status_code in (402, 403):
            try:
                detail = response.json().get("error", response.text)
            except Exception:
                detail = response.text
            logger.warning(
                f"Hugging Face billing/permission error ({response.status_code}): {detail}. "
                f"Returning empty results instead of crashing."
            )
            return True
        return False

    async def generate_json(self, prompt: str, schema: dict = None, model: str = "Qwen/Qwen2.5-Coder-32B-Instruct") -> list:
        """Call Hugging Face API requesting a structured JSON response, with retry for 429."""
        url = self.api_url
        
        system_prompt = "You are a helpful coding assistant. You must respond in valid JSON format only, without any conversational text."
        if schema:
            system_prompt += f"\nReturn a JSON array exactly matching this schema:\n{json.dumps(schema)}"
            
        hf_model = model if "gemini" not in model else "Qwen/Qwen2.5-Coder-32B-Instruct"
        
        payload = {
            "model": hf_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ]
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
            
        max_retries = 4
        base_delay = 5
        sem = await self._get_semaphore()
        
        for attempt in range(max_retries):
            try:
                async with sem:
                    await self._wait_for_rate_limit()
                    response = await self.client.post(url, json=payload, headers=headers)
                
                # Gracefully handle billing/permission errors    
                if self._check_billing_error(response):
                    return []
                    
                if response.status_code == 429:
                    if attempt < max_retries - 1:
                        delay = base_delay * (1.5 ** attempt)
                        logger.warning(f"Hugging Face API 429 Rate Limit hit. Retrying in {delay}s...")
                        await asyncio.sleep(delay)
                        continue
                    else:
                        logger.error("Hugging Face API Rate Limit hit max retries.")
                        return []
                
                response.raise_for_status()
                data = response.json()
                
                if "choices" in data and len(data["choices"]) > 0:
                    text = data["choices"][0]["message"]["content"].strip()
                    if text.startswith("```json"):
                        text = text[7:]
                    elif text.startswith("```"):
                        text = text[3:]
                    if text.endswith("```"):
                        text = text[:-3]
                    return json.loads(text.strip())
                return []
                
            except httpx.HTTPError as e:
                logger.error(f"Hugging Face API HTTP Error: {e}")
                if attempt == max_retries - 1:
                    return []
            except json.JSONDecodeError as e:
                logger.error(f"Hugging Face API returned invalid JSON: {e}")
                return []
            except Exception as e:
                logger.error(f"Hugging Face API JSON generation failed: {e}")
                if attempt == max_retries - 1:
                    return []
                await asyncio.sleep(2)
        return []
                
    async def generate_text(self, prompt: str, model: str = "Qwen/Qwen2.5-Coder-32B-Instruct") -> str:
        """Call Hugging Face API requesting raw text responses, with retry for 429."""
        url = self.api_url
        hf_model = model if "gemini" not in model else "Qwen/Qwen2.5-Coder-32B-Instruct"
        payload = {
            "model": hf_model,
            "messages": [{"role": "user", "content": prompt}]
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        max_retries = 4
        base_delay = 5
        sem = await self._get_semaphore()
        
        for attempt in range(max_retries):
            try:
                async with sem:
                    await self._wait_for_rate_limit()
                    response = await self.client.post(url, json=payload, headers=headers)
                
                # Gracefully handle billing/permission errors    
                if self._check_billing_error(response):
                    return ""
                    
                if response.status_code == 429:
                    if attempt < max_retries - 1:
                        delay = base_delay * (1.5 ** attempt)
                        logger.warning(f"Hugging Face API text 429 Rate Limit hit. Retrying in {delay}s...")
                        await asyncio.sleep(delay)
                        continue
                    else:
                        logger.error("Hugging Face API Rate Limit hit max retries.")
                        return ""

                response.raise_for_status()
                data = response.json()
                if "choices" in data and len(data["choices"]) > 0:
                    return data["choices"][0]["message"]["content"]
                return ""
            except httpx.HTTPError as e:
                logger.error(f"Hugging Face API text HTTP Error: {e}")
                if attempt == max_retries - 1:
                    return ""
            except Exception as e:
                logger.error(f"Hugging Face API text generation failed: {e}")
                if attempt == max_retries - 1:
                    return ""
                await asyncio.sleep(2)
        return ""
                
    async def close(self):
        await self.client.aclose()

# Global Singleton
huggingface_service = HuggingFaceService()
