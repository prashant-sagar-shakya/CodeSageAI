import json
from sqlmodel import Session, select
from app.core.database import engine
from app.models.repo import Repository
from app.models.pr_review import PRReview
from app.services.huggingface_service import HuggingFaceService

huggingface_service = HuggingFaceService()

class SageAgent:
    async def chat(self, user_id: int, message: str, history: list = None) -> str:
        """Process a chat message using Hugging Face, enriched with user's repository data."""
        # 1. Fetch user context from DB
        context_str = ""
        with Session(engine) as db:
            statement = select(Repository).where(Repository.owner_id == user_id)
            repos = db.exec(statement).all()
            
            repo_summaries = []
            for repo in repos:
                reviews_statement = select(PRReview).where(PRReview.repository_id == repo.id).order_by(PRReview.created_at.desc()).limit(5)
                recent_reviews = db.exec(reviews_statement).all()
                
                reviews_data = []
                for rv in recent_reviews:
                    reviews_data.append({
                        "id": rv.id,
                        "type": rv.review_type,
                        "title": rv.pr_title,
                        "status": rv.status,
                        "health_score": rv.overall_score
                    })
                    
                repo_summaries.append({
                    "name": repo.full_name,
                    "language": repo.language,
                    "health_score": repo.health_score,
                    "stars": repo.stars,
                    "recent_reviews": reviews_data
                })
                
            context_str = json.dumps(repo_summaries, indent=2)

        # 2. Build Prompt
        system_prompt = f"""
You are Sage, the official AI Assistant for CodeSageAI.
Your role is to help the user understand their code quality, GitHub repositories, pull requests, and how to use the CodeSageAI platform.
Be highly professional, friendly, and act as a senior developer. 
When providing steps or instructions, ALWAYS use well-formatted Markdown with UI elements like bold text, bullet points, and code blocks to make it look premium.

Here is the current real-time data about the user's GitHub repositories tracked in CodeSageAI:
{context_str}

Use this data to answer any questions they have about their repositories, recent PRs, or overall health scores.
If they ask a general programming question, answer it accurately.
"""

        # Append history
        full_prompt = system_prompt + "\n\nConversation History:\n"
        if history:
            for msg in history:
                role = "User" if msg.get("role") == "user" else "Sage"
                full_prompt += f"{role}: {msg.get('content')}\n"
                
        full_prompt += f"\nUser: {message}\nSage:"

        # 3. Call Hugging Face
        response_text = await huggingface_service.generate_text(full_prompt)
        return response_text

    async def generate_title(self, message: str) -> str:
        """Generate a short 3-5 word title for a chat based on the first message."""
        prompt = f"Generate a very concise, short title (maximum 3 to 5 words) that summarizes the following message. Return ONLY the title, no quotes, no extra text. Message: '{message}'"
        title = await huggingface_service.generate_text(prompt)
        return title.strip().strip('"').strip("'")

sage_agent = SageAgent()
