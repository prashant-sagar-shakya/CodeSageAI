# ============================================================
# CodeSageAI — Agent Prompts
# ============================================================

SYSTEM_CONTEXT = """
You are CodeSageAI, an expert senior software developer and security auditor.
You are reviewing changes in a Pull Request (PR).
You must analyze the files, the file contents, and the diffs to find issues.
"""

AGENT_PROMPTS = {
    "Repository Analyzer": """
Analyze this repository structure, tech stack, and dependencies.
Identify the main frameworks, database, libraries, and design patterns used.
Output a JSON summary describing the tech stack and structural overview.

Directory Structure:
{repo_structure}

Files Changed:
{files_changed_summary}
""",

    "Code Quality": """
Review the code changes for code quality and maintainability.
Focus on:
1. SOLID principles.
2. Code duplication and dead code.
3. Function/Class sizing (large functions, complex control flows).
4. Bad variable/naming conventions.
5. Unused imports.
6. Cyclomatic complexity.

Review only the modified files and lines in the diff below.
Return a JSON array of issues conforming to the specified schema.

Files and Diffs:
{diffs}
""",

    "Bug Detection": """
Review the code changes for potential bugs and logical errors.
Focus on:
1. Null pointer risks, undefined object access, optionals.
2. Array index errors, off-by-one errors.
3. Infinite loops or recursive overflows.
4. Async/await mistakes, unhandled promise rejections.
5. Bad exception handling (empty try/catch, swallowing exceptions).
6. Resource leaks (file descriptors, sockets, streams not closed).

Review only the modified files and lines in the diff below.
Return a JSON array of issues conforming to the specified schema.

Files and Diffs:
{diffs}
""",

    "Security": """
Review the code changes for security vulnerabilities and compliance issues (OWASP).
Focus on:
1. SQL Injection, Command Injection, XPath Injection.
2. Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF).
3. SSRF, Path Traversal.
4. Hardcoded secrets, API keys, passwords, private certificates.
5. Weak authentication/authorization mechanisms.
6. Insecure JWT configuration or weak cryptography.

Review only the modified files and lines in the diff below.
Return a JSON array of issues conforming to the specified schema.

Files and Diffs:
{diffs}
""",

    "Performance": """
Review the code changes for performance and efficiency bottlenecks.
Focus on:
1. Slow loops, redundant iterations.
2. N+1 query patterns in database interactions.
3. Unnecessary API requests or duplicate fetch calls.
4. Large database scans or lack of indexing suggestion.
5. Algorithmic complexity issues (e.g., nested loops with O(n²) or worse).
6. Memory allocations or potential memory leaks in loops.

Review only the modified files and lines in the diff below.
Return a JSON array of issues conforming to the specified schema.

Files and Diffs:
{diffs}
""",

    "Documentation": """
Review the code changes for documentation completeness.
Focus on:
1. Missing JSDoc, docstrings, or parameter descriptions for public functions.
2. Missing or outdated comments in complex blocks.
3. Inaccurate function descriptions.
4. Opportunities for API signature documentation.

Review only the modified files and lines in the diff below.
Return a JSON array of issues conforming to the specified schema.

Files and Diffs:
{diffs}
""",

    "Testing": """
Review the code changes for testability and suggest automated tests.
Focus on:
1. Missing unit tests for complex business logic.
2. Suggesting specific edge cases and negative test cases.
3. Suggesting mock strategies for external services.
4. Identifying components that are hard to test and need decoupling.

Review only the modified files and lines in the diff below.
Return a JSON array of issues conforming to the specified schema.

Files and Diffs:
{diffs}
""",

    "Refactoring": """
Review the code changes for design patterns and clean architecture.
Focus on:
1. Applying creational, structural, or behavioral design patterns (e.g., Factory, Strategy).
2. Extracting small, focused helper methods.
3. Decoupling tight dependencies.
4. Improving folder or modular structure.
5. Adhering to Clean Architecture / Clean Code guidelines.

Review only the modified files and lines in the diff below.
Return a JSON array of issues conforming to the specified schema.

Files and Diffs:
{diffs}
"""
}
