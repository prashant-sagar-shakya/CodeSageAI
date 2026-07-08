import asyncio
import time
import logging
from typing import Dict, List, Any, TypedDict, Annotated
import operator
from langgraph.graph import StateGraph, END
from app.services.gemini_service import gemini_service, ISSUE_ARRAY_SCHEMA
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

class CodeReviewOrchestrator:
    def __init__(self):
        self.gemini = gemini_service
        self.graph = self._build_graph()

    def _build_graph(self):
        """Construct the LangGraph StateGraph for multi-agent execution."""
        workflow = StateGraph(ReviewState)
        
        from functools import partial
        
        # Define the nodes with partials to preserve async context for LangGraph
        workflow.add_node("repository_analyzer", self._node_analyze_repository)
        workflow.add_node("code_quality", partial(self._node_run_agent, agent_name="Code Quality"))
        workflow.add_node("bug_detection", partial(self._node_run_agent, agent_name="Bug Detection"))
        workflow.add_node("security", partial(self._node_run_agent, agent_name="Security"))
        workflow.add_node("performance", partial(self._node_run_agent, agent_name="Performance"))
        workflow.add_node("documentation", partial(self._node_run_agent, agent_name="Documentation"))
        workflow.add_node("testing", partial(self._node_run_agent, agent_name="Testing"))
        workflow.add_node("refactoring", partial(self._node_run_agent, agent_name="Refactoring"))
        
        # Orchestrate the execution flow
        workflow.set_entry_point("repository_analyzer")
        
        # Sequential execution to prevent Gemini API 429 Rate Limits
        agents = [
            "code_quality", "bug_detection", "security", 
            "performance", "documentation", "testing", "refactoring"
        ]
        
        prev_node = "repository_analyzer"
        for agent in agents:
            workflow.add_edge(prev_node, agent)
            prev_node = agent
            
        workflow.add_edge(prev_node, END)
            
        return workflow.compile()

    async def _node_analyze_repository(self, state: ReviewState) -> Dict[str, Any]:
        """Node: Analyze repository frameworks, tech stack, and general architecture."""
        prompt = AGENT_PROMPTS["Repository Analyzer"].format(
            repo_structure=state["repo_structure"],
            files_changed_summary=state["files_summary"]
        )
        full_prompt = f"{SYSTEM_CONTEXT}\n{prompt}"
        
        tech_stack_summary = await self.gemini.generate_text(full_prompt, model="gemini-2.5-flash")
        return {"tech_stack": tech_stack_summary}

    async def _node_run_agent(self, state: ReviewState, agent_name: str) -> Dict[str, Any]:
        """Node: Run a specific LLM code-review agent over the PR diffs."""
        if agent_name not in AGENT_PROMPTS:
            return {"issues": []}
            
        logger.info(f"LangGraph Agent Node: Starting {agent_name}")
        prompt = AGENT_PROMPTS[agent_name].format(diffs=state["diffs"])
        full_prompt = f"{SYSTEM_CONTEXT}\n{prompt}"
        
        findings = await self.gemini.generate_json(
            prompt=full_prompt,
            schema=ISSUE_ARRAY_SCHEMA,
            model="gemini-2.5-flash"
        )
        
        # Inject the agent category name
        for finding in findings:
            finding["agent"] = agent_name
            
        logger.info(f"LangGraph Agent Node: {agent_name} discovered {len(findings)} issue(s)")
        return {"issues": findings}

    async def run_full_review(self, repo_structure: str, diffs: str, files_summary: str) -> Dict[str, Any]:
        """Execute the LangGraph pipeline."""
        start_time = time.time()
        
        # Initialize state
        initial_state = {
            "repo_structure": repo_structure,
            "diffs": diffs,
            "files_summary": files_summary,
            "tech_stack": "",
            "issues": []
        }
        
        # Execute Graph
        logger.info("Executing LangGraph Multi-Agent Pipeline...")
        # Note: LangGraph's ainvoke executes parallel paths automatically!
        final_state = await self.graph.ainvoke(initial_state)
        
        all_issues = final_state.get("issues", [])
        tech_stack = final_state.get("tech_stack", "")
            
        # Calculate metrics and final scores
        scores = self.calculate_scores(all_issues)
        
        duration_sec = time.time() - start_time
        duration_str = f"{int(duration_sec // 60)}m {int(duration_sec % 60)}s"
        
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
