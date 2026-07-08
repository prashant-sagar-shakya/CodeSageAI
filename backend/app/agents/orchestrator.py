import asyncio
import time
import logging
from typing import Dict, List, Any
from app.services.gemini_service import gemini_service, ISSUE_ARRAY_SCHEMA
from app.agents.prompts import SYSTEM_CONTEXT, AGENT_PROMPTS

logger = logging.getLogger(__name__)

class CodeReviewOrchestrator:
    def __init__(self):
        self.gemini = gemini_service

    async def analyze_repository(self, repo_structure: str, files_summary: str) -> Dict[str, Any]:
        """Analyze repository frameworks, tech stack, and general architecture."""
        prompt = AGENT_PROMPTS["Repository Analyzer"].format(
            repo_structure=repo_structure,
            files_changed_summary=files_summary
        )
        full_prompt = f"{SYSTEM_CONTEXT}\n{prompt}"
        
        # Ask Gemini to generate a text summary of the architecture and technology
        tech_stack_summary = await self.gemini.generate_text(full_prompt, model="gemini-2.5-flash")
        return {"tech_stack": tech_stack_summary}

    async def run_agent(self, agent_name: str, diffs: str) -> List[Dict[str, Any]]:
        """Run a single LLM code-review agent over the PR diffs."""
        if agent_name not in AGENT_PROMPTS:
            return []
            
        logger.info(f"Starting review process for agent: {agent_name}")
        prompt = AGENT_PROMPTS[agent_name].format(diffs=diffs)
        full_prompt = f"{SYSTEM_CONTEXT}\n{prompt}"
        
        # Call the Gemini JSON API to fetch structured code issue objects
        findings = await self.gemini.generate_json(
            prompt=full_prompt,
            schema=ISSUE_ARRAY_SCHEMA,
            model="gemini-2.5-flash"
        )
        
        # Inject the agent category name directly to each item
        for finding in findings:
            finding["agent"] = agent_name
            
        logger.info(f"Completed agent: {agent_name} - Discovered {len(findings)} issue(s)")
        return findings

    async def run_full_review(self, repo_structure: str, diffs: str, files_summary: str) -> Dict[str, Any]:
        """Orchestrate parallel multi-agent analysis and aggregate scores/comments."""
        start_time = time.time()
        
        # 1. Run Repository Tech Stack Analyzer
        repo_analysis = await self.analyze_repository(repo_structure, files_summary)
        
        # 2. Run the 7 code-review agents in parallel
        agents_to_run = [
            "Code Quality",
            "Bug Detection",
            "Security",
            "Performance",
            "Documentation",
            "Testing",
            "Refactoring"
        ]
        
        tasks = [self.run_agent(agent, diffs) for agent in agents_to_run]
        results = await asyncio.gather(*tasks)
        
        # Flatten issues list from all parallel runs
        all_issues = []
        for agent_issues in results:
            all_issues.extend(agent_issues)
            
        # 3. Calculate metrics and final scores
        scores = self.calculate_scores(all_issues)
        
        duration_sec = time.time() - start_time
        duration_str = f"{int(duration_sec // 60)}m {int(duration_sec % 60)}s"
        
        return {
            "tech_stack": repo_analysis.get("tech_stack", ""),
            "issues": all_issues,
            "scores": scores,
            "duration": duration_str,
            "total_issues": len(all_issues)
        }

    def calculate_scores(self, issues: List[Dict[str, Any]]) -> Dict[str, int]:
        """Calculate quality scores based on discovered issues and their severity weight."""
        scores = {
            "security": 100,
            "performance": 100,
            "readability": 100,
            "testing": 100,
            "documentation": 100,
            "maintainability": 100
        }
        
        # Severity weights deduction mapping
        deductions = {
            "critical": 15,
            "warning": 8,
            "info": 3,
            "suggestion": 1
        }
        
        for issue in issues:
            agent = issue.get("agent")
            severity = issue.get("severity", "info").lower()
            penalty = deductions.get(severity, 3)
            
            # Map agent findings to score categories
            if agent == "Security":
                scores["security"] -= penalty
            elif agent == "Performance":
                scores["performance"] -= penalty
            elif agent == "Code Quality":
                scores["readability"] -= penalty
            elif agent == "Testing":
                scores["testing"] -= penalty
            elif agent == "Documentation":
                scores["documentation"] -= penalty
            elif agent == "Refactoring":
                scores["maintainability"] -= penalty
            elif agent == "Bug Detection":
                # Bugs impact both the maintainability rating and test stability
                scores["maintainability"] -= (penalty // 2)
                scores["testing"] -= (penalty // 2)
                
        # Clamp scores between 20 and 100
        for cat in scores:
            scores[cat] = max(20, min(100, scores[cat]))
            
        # Calculate overall score
        scores["overall"] = sum(scores.values()) // len(scores)
        return scores

# Global Singleton
orchestrator = CodeReviewOrchestrator()
