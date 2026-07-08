import httpx
import json
import logging
import asyncio
from app.config import settings

logger = logging.getLogger(__name__)

# Standard JSON schema for code review findings returned by Gemini
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

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        # Keep client initialized for connection pooling
        self.client = httpx.AsyncClient(timeout=90.0)

    async def generate_json(self, prompt: str, schema: dict = None, model: str = "gemini-2.5-flash") -> list:
        """Call Gemini API requesting a structured JSON response matching schema, with retry for 429."""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
        
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseMimeType": "application/json"}
        }
        
        if schema:
            payload["generationConfig"]["responseSchema"] = schema
            
        max_retries = 3
        base_delay = 5
        
        for attempt in range(max_retries):
            try:
                response = await self.client.post(url, json=payload)
                if response.status_code == 429:
                    if attempt < max_retries - 1:
                        delay = base_delay * (2 ** attempt)
                        logger.warning(f"Gemini API 429 Rate Limit hit. Retrying in {delay} seconds...")
                        await asyncio.sleep(delay)
                        continue
                    else:
                        logger.error("Gemini API Rate Limit hit max retries.")
                        raise Exception("Gemini API 429 Too Many Requests - Max retries exceeded")
                
                response.raise_for_status()
                data = response.json()
                
                if "candidates" in data and len(data["candidates"]) > 0:
                    parts = data["candidates"][0]["content"]["parts"]
                    if parts and "text" in parts[0]:
                        text = parts[0]["text"]
                        return json.loads(text)
                return []
                
            except httpx.HTTPError as e:
                logger.error(f"Gemini API HTTP Error: {e}")
                if attempt == max_retries - 1:
                    raise
            except Exception as e:
                logger.error(f"Gemini API JSON generation failed: {e}")
                raise
                
    async def generate_text(self, prompt: str, model: str = "gemini-2.5-flash") -> str:
        """Call Gemini API requesting raw text responses, with retry for 429."""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        
        max_retries = 3
        base_delay = 5
        
        for attempt in range(max_retries):
            try:
                response = await self.client.post(url, json=payload)
                if response.status_code == 429:
                    if attempt < max_retries - 1:
                        delay = base_delay * (2 ** attempt)
                        logger.warning(f"Gemini API text 429 Rate Limit hit. Retrying in {delay} seconds...")
                        await asyncio.sleep(delay)
                        continue
                    else:
                        logger.error("Gemini API Rate Limit hit max retries.")
                        raise Exception("Gemini API 429 Too Many Requests - Max retries exceeded")
                        
                response.raise_for_status()
                data = response.json()
                if "candidates" in data and len(data["candidates"]) > 0:
                    parts = data["candidates"][0]["content"]["parts"]
                    if parts and "text" in parts[0]:
                        return parts[0]["text"]
                return ""
            except httpx.HTTPError as e:
                logger.error(f"Gemini API text HTTP Error: {e}")
                if attempt == max_retries - 1:
                    raise
            except Exception as e:
                logger.error(f"Gemini API text generation failed: {e}")
                raise
                
    async def close(self):
        await self.client.aclose()

# Global Singleton
gemini_service = GeminiService()
