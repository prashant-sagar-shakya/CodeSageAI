import asyncio
import time
import logging
from typing import Dict, List, Any, TypedDict, Annotated, Optional, Callable
import operator
from langgraph.graph import StateGraph, END
from app.services.huggingface_service import huggingface_service, ISSUE_ARRAY_SCHEMA
from app.services.smart_scanner import smart_scanner_service
from app.agents.prompts import SYSTEM_CONTEXT, AGENT_PROMPTS

logger = logging.getLogger(__name__)

# Define the State for the LangGraph pipeline
class ReviewState(TypedDict):
    repo_structure: str
    diffs: str
    files_summary: str
    tech_stack: str
    # Use Annotated with operator.add so parallel nodes can append to the issues list
    issues: Annotated[List[Dict[str, Any]], operator.add]

# Agent steps for progress tracking (exposed for external use)
AGENT_STEPS = [
    {"name": "repository_analyzer", "label": "Repository Analyzer", "weight": 10},
    {"name": "code_health", "label": "Code Health Agent", "weight": 30},
    {"name": "reliability", "label": "Reliability Agent", "weight": 30},
    {"name": "security", "label": "Security Agent", "weight": 25},
    {"name": "smart_scan", "label": "Smart Scanner (AI Fallback)", "weight": 5},
]

class CodeReviewOrchestrator:
    def __init__(self):
        self.huggingface = huggingface_service
        self.graph = self._build_graph()
        # Progress callback — set by review_service before each run
        self._progress_callback: Optional[Callable] = None

    def _build_graph(self):
        """Construct the LangGraph StateGraph for consolidated multi-agent execution."""
        workflow = StateGraph(ReviewState)
        
        from functools import partial
        
        # 3 consolidated agent nodes + repo analyzer + conditional smart scan
        workflow.add_node("repository_analyzer", self._node_analyze_repository)
        workflow.add_node("code_health", partial(self._node_run_agent, agent_name="Code Health"))
        workflow.add_node("reliability", partial(self._node_run_agent, agent_name="Reliability"))
        workflow.add_node("security", partial(self._node_run_agent, agent_name="Security"))
        workflow.add_node("smart_scan", self._node_smart_scan)
        
        # Orchestrate: sequential execution to stay within free-tier rate limits
        workflow.set_entry_point("repository_analyzer")
        
        # Sequential execution to prevent API Rate Limits
        agents = ["code_health", "reliability", "security", "smart_scan"]
        
        prev_node = "repository_analyzer"
        for agent in agents:
            workflow.add_edge(prev_node, agent)
            prev_node = agent
            
        workflow.add_edge(prev_node, END)
            
        return workflow.compile()

    async def _report_progress(self, step_name: str, message: str):
        """Report progress to the callback if set."""
        if self._progress_callback:
            try:
                await self._progress_callback(step_name, message)
            except Exception as e:
                logger.warning(f"Progress callback failed: {e}")

    async def _node_analyze_repository(self, state: ReviewState) -> Dict[str, Any]:
        """Node: Analyze repository frameworks, tech stack, and general architecture."""
        await self._report_progress("repository_analyzer", "Analyzing repository structure & tech stack...")
        
        prompt = AGENT_PROMPTS["Repository Analyzer"].format(
            repo_structure=state["repo_structure"],
            files_changed_summary=state["files_summary"]
        )
        full_prompt = f"{SYSTEM_CONTEXT}\n{prompt}"
        
        tech_stack_summary = await self.huggingface.generate_text(full_prompt)
        
        await self._report_progress("repository_analyzer", "Repository analysis complete.")
        return {"tech_stack": tech_stack_summary}

    async def _node_run_agent(self, state: ReviewState, agent_name: str) -> Dict[str, Any]:
        """Node: Run a specific consolidated LLM code-review agent over the PR diffs."""
        if agent_name not in AGENT_PROMPTS:
            return {"issues": []}
            
        await self._report_progress(
            agent_name.lower().replace(" ", "_"),
            f"{agent_name} scanning code..."
        )
        
        logger.info(f"LangGraph Agent Node: Starting {agent_name}")
        prompt = AGENT_PROMPTS[agent_name].format(diffs=state["diffs"])
        full_prompt = f"{SYSTEM_CONTEXT}\n{prompt}"
        
        findings = await self.huggingface.generate_json(
            prompt=full_prompt,
            schema=ISSUE_ARRAY_SCHEMA
        )
        
        # Inject the agent category name
        for finding in findings:
            finding["agent"] = agent_name
            
        logger.info(f"LangGraph Agent Node: {agent_name} discovered {len(findings)} issue(s)")
        await self._report_progress(
            agent_name.lower().replace(" ", "_"),
            f"{agent_name} complete — found {len(findings)} issues."
        )
        return {"issues": findings}

    async def _node_smart_scan(self, state: ReviewState) -> Dict[str, Any]:
        """Node: Run Smart Scanner as a fallback if main agents found very few issues."""
        current_issues = state.get("issues", [])
        
        if len(current_issues) >= 3:
            logger.info(f"Smart Scan skipped — main agents already found {len(current_issues)} issues.")
            await self._report_progress("smart_scan", f"Smart Scanner skipped (already {len(current_issues)} issues found).")
            return {"issues": []}
        
        await self._report_progress("smart_scan", "Smart Scanner running fallback AI analysis...")
        logger.info("LangGraph Agent Node: Starting Smart Scan (Tree-sitter -> Semgrep -> VulnLLM -> Qwen)")
        findings = await smart_scanner_service.run_pipeline(state["diffs"])
        
        await self._report_progress("smart_scan", f"Smart Scanner complete — found {len(findings)} additional issues.")
        return {"issues": findings}

    async def run_full_review(
        self, 
        repo_structure: str, 
        diffs: str, 
        files_summary: str,
        progress_callback: Optional[Callable] = None
    ) -> Dict[str, Any]:
        """Execute the LangGraph pipeline."""
        start_time = time.time()
        self._progress_callback = progress_callback
        
        # Initialize state
        initial_state = {
            "repo_structure": repo_structure,
            "diffs": diffs,
            "files_summary": files_summary,
            "tech_stack": "",
            "issues": []
        }
        
        # Execute Graph
        logger.info("Executing LangGraph Multi-Agent Pipeline (3 consolidated agents)...")
        final_state = await self.graph.ainvoke(initial_state)
        
        all_issues = final_state.get("issues", [])
        tech_stack = final_state.get("tech_stack", "")
            
        # Calculate metrics and final scores
        scores = self.calculate_scores(all_issues)
        
        duration_sec = time.time() - start_time
        duration_str = f"{int(duration_sec // 60)}m {int(duration_sec % 60)}s"
        
        self._progress_callback = None
        
        return {
            "tech_stack": tech_stack,
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
            agent = issue.get("agent", "")
            category = issue.get("category", "").lower()
            severity = issue.get("severity", "info").lower()
            penalty = deductions.get(severity, 3)
            
            # Map consolidated agent findings to score categories
            if agent == "Security" or "security" in category or "vuln" in category.lower():
                scores["security"] -= penalty
            elif agent == "Code Health":
                if category == "documentation":
                    scores["documentation"] -= penalty
                elif category == "refactoring":
                    scores["maintainability"] -= penalty
                else:
                    scores["readability"] -= penalty
            elif agent == "Reliability":
                if category == "performance":
                    scores["performance"] -= penalty
                elif category == "testing":
                    scores["testing"] -= penalty
                else:
                    scores["maintainability"] -= (penalty // 2)
                    scores["testing"] -= (penalty // 2)
            elif "Smart Scanner" in agent:
                scores["security"] -= penalty
                
        # Clamp scores between 20 and 100
        for cat in scores:
            scores[cat] = max(20, min(100, scores[cat]))
            
        # Calculate overall score
        scores["overall"] = sum(scores.values()) // len(scores)
        return scores

# Global Singleton
orchestrator = CodeReviewOrchestrator()
