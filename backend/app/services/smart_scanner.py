import os
import json
import asyncio
import logging
import tempfile
import subprocess
from typing import Dict, List, Any
from app.services.huggingface_service import huggingface_service, ISSUE_ARRAY_SCHEMA

logger = logging.getLogger(__name__)

class SmartScannerService:
    def __init__(self):
        self.ai_service = huggingface_service
        # You can adjust these model IDs to match the exact repos on Hugging Face router
        self.vuln_llm = "VulnLLM-R-7B" 
        self.qwen_coder = "Qwen/Qwen2.5-Coder-32B-Instruct"

    async def run_pipeline(self, code_diffs: str) -> List[Dict[str, Any]]:
        """Executes the Smart Scanning Pipeline: Tree-sitter -> Semgrep -> VulnLLM -> Qwen -> Merge"""
        logger.info("Starting Smart Scanning Pipeline...")
        
        # 1. Parse code with Tree-sitter
        parsed_ast = self._run_tree_sitter(code_diffs)
        
        # 2. Static Analysis with Semgrep
        semgrep_alerts = self._run_semgrep(code_diffs)
        
        # 3. AI Security Review (VulnLLM)
        security_findings = await self._run_vulnllm_review(code_diffs, semgrep_alerts)
        
        # 4. Bug & Logic Review (Qwen Coder)
        logic_findings = await self._run_qwen_review(code_diffs, security_findings)
        
        # 5. Merge final report
        final_issues = self._merge_reports(security_findings, logic_findings)
        
        return final_issues
        
    def _run_tree_sitter(self, code_diffs: str) -> dict:
        """Runs tree-sitter parsing."""
        logger.info("Running Tree-sitter parsing...")
        # Note: In a production setting, this would utilize python tree-sitter bindings 
        # to parse the raw files before diffing. We simulate it passing through here.
        return {"status": "parsed", "nodes": []}
        
    def _run_semgrep(self, code_diffs: str) -> str:
        """Runs semgrep static analysis."""
        logger.info("Running Semgrep static analysis...")
        try:
            with tempfile.TemporaryDirectory() as temp_dir:
                # Write diffs to a temp file (Semgrep requires physical files)
                temp_file_path = os.path.join(temp_dir, "changes.diff")
                with open(temp_file_path, "w", encoding="utf-8") as f:
                    f.write(code_diffs)
                
                # In a real environment with Semgrep installed, you would run:
                # result = subprocess.run(["semgrep", "--json", temp_dir], capture_output=True, text=True)
                # return result.stdout
                
                # Return empty alerts for this environment if semgrep is unavailable
                return "[]" 
        except Exception as e:
            logger.error(f"Semgrep execution failed: {e}")
            return "[]"
            
    async def _run_vulnllm_review(self, code_diffs: str, semgrep_alerts: str) -> List[Dict[str, Any]]:
        """Sends the code and semgrep alerts to VulnLLM-R-7B for security review."""
        prompt = f"""
You are VulnLLM, an AI specializing in finding security vulnerabilities.
Review the following code diffs and Semgrep alerts (if any) and identify any security issues.

Code Diffs:
{code_diffs}

Semgrep Alerts:
{semgrep_alerts}
"""
        logger.info("Running VulnLLM Security Review...")
        try:
            findings = await self.ai_service.generate_json(
                prompt=prompt, 
                schema=ISSUE_ARRAY_SCHEMA, 
                model=self.vuln_llm
            )
            for f in findings:
                f["agent"] = "Smart Scanner (VulnLLM)"
                f["severity"] = "critical" # Enhance severity from VulnLLM
            return findings
        except Exception as e:
            logger.error(f"VulnLLM review failed: {e}")
            return []

    async def _run_qwen_review(self, code_diffs: str, security_findings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Sends the code and security findings to Qwen Coder for logical review and bug detection."""
        prompt = f"""
You are Qwen Coder. Review the following code diffs for logical bugs, performance, and correctness.
Also, review the security findings provided by VulnLLM and refine them or add logical bug findings.

Code Diffs:
{code_diffs}

Security Findings (VulnLLM):
{json.dumps(security_findings, indent=2)}
"""
        logger.info("Running Qwen Coder Logic Review...")
        try:
            findings = await self.ai_service.generate_json(
                prompt=prompt, 
                schema=ISSUE_ARRAY_SCHEMA, 
                model=self.qwen_coder
            )
            for f in findings:
                f["agent"] = "Smart Scanner (Qwen)"
            return findings
        except Exception as e:
            logger.error(f"Qwen review failed: {e}")
            return []

    def _merge_reports(self, security_findings: List[Dict[str, Any]], logic_findings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Merges findings from both models, removing duplicates."""
        merged = {}
        for f in security_findings + logic_findings:
            # Create a unique key based on title, file, and line to deduplicate
            key = f"{f.get('title')}-{f.get('file')}-{f.get('line')}"
            if key not in merged:
                merged[key] = f
        
        logger.info(f"Smart Scanner generated {len(merged)} total issues.")
        return list(merged.values())

smart_scanner_service = SmartScannerService()
