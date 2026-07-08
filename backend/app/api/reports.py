from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import HTMLResponse, Response
from sqlmodel import Session
from app.core.database import get_session
from app.models.pr_review import PRReview
from app.services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/{review_id}")
def download_report(
    review_id: int, 
    format: str = Query("html", enum=["html", "pdf", "markdown"]),
    db: Session = Depends(get_session)
):
    """Download review summaries in HTML, Markdown, or PDF format."""
    review = db.get(PRReview, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    if format == "html":
        html_content = report_service.generate_html(review)
        return HTMLResponse(content=html_content)
        
    elif format == "markdown":
        md_content = report_service.generate_markdown(review)
        return Response(
            content=md_content,
            media_type="text/markdown",
            headers={"Content-Disposition": f"attachment; filename=review_report_{review_id}.md"}
        )
        
    elif format == "pdf":
        pdf_bytes = report_service.generate_pdf(review)
        # Check if WeasyPrint failed and returned html fallback bytes
        is_html = pdf_bytes.startswith(b"<!DOCTYPE html>")
        media_type = "text/html" if is_html else "application/pdf"
        ext = "html" if is_html else "pdf"
        
        return Response(
            content=pdf_bytes,
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename=review_report_{review_id}.{ext}"}
        )
