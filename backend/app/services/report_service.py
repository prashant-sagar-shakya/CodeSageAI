import logging
from typing import Any
from jinja2 import Template

logger = logging.getLogger(__name__)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CodeSageAI Review Report - {{ review.pr_title }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #0a0e1a;
            color: #f1f5f9;
            margin: 0;
            padding: 40px;
            line-height: 1.6;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: #111827;
            border: 1px solid #1e293b;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .header {
            border-bottom: 1px solid #1e293b;
            padding-bottom: 24px;
            margin-bottom: 32px;
        }
        h1 { margin: 0 0 10px 0; font-size: 28px; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .score-grid {
            display: grid;
            grid-template-columns: 2fr 3fr;
            gap: 24px;
            margin-bottom: 32px;
        }
        .overall-score-card {
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .score-value {
            font-size: 64px;
            font-weight: 800;
            color: #6366f1;
            line-height: 1;
            margin: 12px 0;
        }
        .breakdown-card {
            background: #1f2937;
            border: 1px solid #374151;
            border-radius: 12px;
            padding: 24px;
        }
        .breakdown-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .issue-card {
            background: #1a2238;
            border: 1px solid #1e293b;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .severity-critical { border-left: 4px solid #ef4444; }
        .severity-warning { border-left: 4px solid #f59e0b; }
        .severity-info { border-left: 4px solid #3b82f6; }
        .severity-suggestion { border-left: 4px solid #10b981; }
        .code-block {
            background: #0d1117;
            color: #e6edf3;
            padding: 14px;
            font-family: "JetBrains Mono", Consolas, monospace;
            font-size: 13px;
            border-radius: 6px;
            overflow-x: auto;
            border: 1px solid #30363d;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CodeSageAI Reports</h1>
            <p style={{ margin: 0, color: '#94a3b8' }}>Repository: <strong>{{ review.repository.name }}</strong> &middot; Pull Request: #{{ review.pr_number }}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>PR Title: {{ review.pr_title }}</p>
        </div>
        
        <div class="score-grid">
            <div class="overall-score-card">
                <div style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Overall Quality Score</div>
                <div class="score-value">{{ review.overall_score }}</div>
                <div style="font-size: 13px; color: #64748b;">Generated in {{ review.duration }}</div>
            </div>
            <div class="breakdown-card">
                <h3 style="margin-top: 0; font-size: 15px; border-bottom: 1px solid #374151; padding-bottom: 8px;">Category Breakdown</h3>
                <div class="breakdown-row"><span>Security</span><strong>{{ review.security_score }}/100</strong></div>
                <div class="breakdown-row"><span>Performance</span><strong>{{ review.performance_score }}/100</strong></div>
                <div class="breakdown-row"><span>Readability</span><strong>{{ review.readability_score }}/100</strong></div>
                <div class="breakdown-row"><span>Testing</span><strong>{{ review.testing_score }}/100</strong></div>
                <div class="breakdown-row"><span>Documentation</span><strong>{{ review.documentation_score }}/100</strong></div>
                <div class="breakdown-row"><span>Maintainability</span><strong>{{ review.maintainability_score }}/100</strong></div>
            </div>
        </div>
        
        <h2>Discovered Issues ({{ review.issues|length }})</h2>
        {% for issue in review.issues %}
        <div class="issue-card severity-{{ issue.severity }}">
            <h3 style="margin-top:0; font-size: 16px;">{{ issue.title }}</h3>
            <div style="font-size: 12px; color: #94a3b8; margin-bottom: 12px;">
                File: <code>{{ issue.file_path }}</code> (Line {{ issue.line_number }}) &middot;
                Severity: <span style="text-transform: uppercase;">{{ issue.severity }}</span> &middot;
                Agent: {{ issue.agent }}
            </div>
            <p style="font-size: 14px; color: #cbd5e1;">{{ issue.description }}</p>
            <p style="font-size: 14px; color: #94a3b8;"><strong>How to Fix:</strong> {{ issue.how_to_fix }}</p>
            
            <h4 style="font-size: 13px; margin-bottom: 6px;">Original Code:</h4>
            <pre class="code-block">{{ issue.code_before }}</pre>
            
            <h4 style="font-size: 13px; margin-bottom: 6px;">Suggested Remediations:</h4>
            <pre class="code-block">{{ issue.code_after }}</pre>
        </div>
        {% endfor %}
    </div>
</body>
</html>
"""

class ReportService:
    def generate_html(self, review: Any) -> str:
        """Render standard HTML document report based on Jinja templates."""
        template = Template(HTML_TEMPLATE)
        return template.render(review=review)

    def generate_markdown(self, review: Any) -> str:
        """Format full markdown document mapping review aggregates and issue files."""
        md = f"# CodeSageAI Review Report: {review.repository.full_name} — PR #{review.pr_number}\n\n"
        md += f"**PR Title**: {review.pr_title}  \n"
        md += f"**Overall Quality Score**: **{review.overall_score}/100**  \n"
        md += f"**Review Date**: {review.created_at.strftime('%Y-%m-%d %H:%M:%S')}  \n"
        md += f"**Duration**: {review.duration}  \n\n"
        
        md += "## Score Breakdown\n\n"
        md += f"| Category | Score |\n| --- | --- |\n"
        md += f"| Security | {review.security_score}/100 |\n"
        md += f"| Performance | {review.performance_score}/100 |\n"
        md += f"| Readability | {review.readability_score}/100 |\n"
        md += f"| Testing | {review.testing_score}/100 |\n"
        md += f"| Documentation | {review.documentation_score}/100 |\n"
        md += f"| Maintainability | {review.maintainability_score}/100 |\n\n"
        
        md += f"## Discovered Issues ({len(review.issues)})\n\n"
        
        for idx, issue in enumerate(review.issues, 1):
            severity_emoji = "🔴" if issue.severity == "critical" else "🟠" if issue.severity == "warning" else "🟡" if issue.severity == "info" else "🟢"
            md += f"### {idx}. {severity_emoji} {issue.title}\n\n"
            md += f"- **Agent**: {issue.agent}\n"
            md += f"- **File**: `{issue.file_path}` (Line {issue.line_number})\n"
            md += f"- **Severity**: {issue.severity.upper()} | **Confidence**: {issue.confidence}%\n"
            md += f"- **Category**: {issue.category}\n\n"
            md += f"**Description**:\n{issue.description}\n\n"
            md += f"**How to Fix**:\n{issue.how_to_fix}\n\n"
            md += "**Original Code**:\n"
            md += f"```typescript\n{issue.code_before}\n```\n\n"
            md += "**Suggested Fix**:\n"
            md += f"```typescript\n{issue.code_after}\n```\n\n"
            md += "---\n\n"
            
        return md

    def generate_pdf(self, review: Any) -> bytes:
        """Generate PDF report using WeasyPrint with graceful HTML fallback."""
        html_content = self.generate_html(review)
        try:
            from weasyprint import HTML
            return HTML(string=html_content).write_pdf()
        except Exception as e:
            logger.warning(f"WeasyPrint PDF compiler unavailable: {e}. Falling back to standard HTML encoding bytes.")
            return html_content.encode('utf-8')

# Global Singleton
report_service = ReportService()
