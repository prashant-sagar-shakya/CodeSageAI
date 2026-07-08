import asyncio
import logging
from typing import Optional
from celery import Celery
from app.config import settings
from app.services.review_service import review_service

logger = logging.getLogger(__name__)

# Configure Celery
celery_app = Celery(
    "codesage_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Enable connection pool limit configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task(name="tasks.process_review")
def process_review_celery_task(review_id: int, installation_id: Optional[int] = None):
    """Celery task executing the multi-agent PR review process."""
    logger.info(f"Celery executing review task ID: {review_id}")
    try:
        # Resolve running async task loop under Celery sync context
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
        loop.run_until_complete(
            review_service.process_pr_review(review_id, installation_id)
        )
    except Exception as e:
        logger.error(f"Celery task processing review ID {review_id} failed: {e}")

def dispatch_review_task(review_id: int, installation_id: Optional[int] = None, background_tasks = None) -> str:
    """
    Orchestrate running background reviews.
    Uses Celery queue if Redis is configured, otherwise falls back to FastAPI BackgroundTasks or asyncio.
    """
    try:
        if settings.REDIS_URL and settings.REDIS_URL.startswith("redis"):
            # Attempt dispatching to Celery
            process_review_celery_task.delay(review_id, installation_id)
            logger.info(f"Dispatched review task {review_id} to Celery worker queue.")
            return "celery"
    except Exception as e:
        logger.warning(f"Failed to submit task to Celery queue: {e}. Falling back to in-memory workers.")

    if background_tasks:
        background_tasks.add_task(
            review_service.process_pr_review, review_id, installation_id
        )
        logger.info(f"Dispatched review task {review_id} to FastAPI BackgroundTasks pool.")
        return "background_tasks"

    # Async loop trigger
    asyncio.create_task(
        review_service.process_pr_review(review_id, installation_id)
    )
    logger.info(f"Dispatched review task {review_id} to inline asyncio event loop.")
    return "asyncio"
