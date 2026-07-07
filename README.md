<div align="center">

# 🧠 CodeSageAI

**AI-Powered Code Review & Pull Request Analysis Platform**

<img src="./CodeSageAI.png" alt="CodeSageAI Banner" width="800" style="border-radius: 12px; margin: 20px 0; box-shadow: 0 4px 30px rgba(0,0,0,0.15);" />

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

*CodeSageAI acts as your senior engineering partner, analyzing GitHub Pull Requests with 8 specialized AI agents to detect bugs, security vulnerabilities, and performance issues while generating human-like review comments.*

[Live Demo](#) · [Report Bug](https://github.com/prashant-sagar-shakya/CodeSageAI/issues) · [Request Feature](https://github.com/prashant-sagar-shakya/CodeSageAI/issues)

</div>

---

## 🚀 Overview

**CodeSageAI** is a robust platform designed to elevate code quality through autonomous, AI-driven reviews. Simply connect your GitHub account, select a repository, and let our multi-agent architecture dive deep into your codebase. It simulates a senior engineer's review process, catching issues that traditional linters miss, and providing actionable, inline fix suggestions.

### 🎯 Target Audience
- **Software Engineers:** Automate code reviews with actionable insights.
- **Open Source Contributors:** Ensure PRs meet high-quality standards before merging.
- **Team Leads:** Monitor project health, technical debt, and team coding practices.
- **Startups:** Ship features faster with AI-assisted code validation.
- **Students & Interview Candidates:** Learn industry best practices and write production-grade code.

---

## ✨ Key Features

- **Multi-Agent Intelligence:** 8 specialized agents working in parallel for comprehensive analysis.
- **GitHub Integration:** Seamlessly fetch branches and Pull Requests.
- **GitHub-style Code Diff Viewer:** Review inline AI comments right within the code diff.
- **Premium UI/UX:** Stunning Dark/Light mode interface with glassmorphism, built on Next.js 15 & Tailwind v4.
- **Interactive Dashboards:** Real-time charts, score rings, and repository health radars.
- **Detailed Reporting:** Exportable PDF, Markdown, and HTML reports summarizing security, performance, and maintainability scores.

---

## 🤖 Multi-Agent Architecture

Our platform utilizes specialized agents to analyze your codebase from every angle:

1. 📂 **Repository Analyzer Agent:** Understands folder structure, tech stack, dependencies, and core files.
2. 💻 **Code Quality Agent:** Enforces SOLID principles, checks naming conventions, and spots duplicate/dead code.
3. 🐛 **Bug Detection Agent:** Identifies null pointers, infinite loops, memory leaks, and async/promise errors.
4. 🛡️ **Security Agent:** Conducts OWASP Top 10 checks (SQLi, XSS, CSRF, hardcoded secrets, JWT issues).
5. ⚡ **Performance Agent:** Optimizes slow loops, catches N+1 queries, and analyzes algorithm complexity.
6. 📄 **Documentation Agent:** Generates missing comments, API documentation, and README enhancements.
7. 🧪 **Testing Agent:** Suggests unit, integration, and edge-case tests, along with mocking strategies.
8. ♻️ **Refactoring Agent:** Recommends design patterns, cleaner architecture, and method extraction.

---

## 💻 Tech Stack

### Frontend (Phase 1)
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **UI Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Charts:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)

### Backend & AI (Upcoming Phase 2)
- **Framework:** Python, FastAPI
- **AI/LLM:** LangGraph, LangChain, OpenAI / Google Gemini
- **Database:** PostgreSQL, Redis
- **Infrastructure:** Docker, GitHub Actions

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.17.0 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/prashant-sagar-shakya/CodeSageAI.git
   cd CodeSageAI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application running.

---

## 📸 Platform Highlights

*(Add your screenshots here once deployed)*

- **Landing Page:** Animated, premium introduction to the platform.
- **Dashboard:** Interactive health metrics and activity feeds.
- **PR Review View:** Split-diff viewer with multi-agent status panels and issue cards.
- **Reports:** Comprehensive score breakdowns and export options.

---

## 🤝 Contributing

Contributions are always welcome! Whether it's reporting a bug, suggesting a feature, or writing code.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <b>Built with ❤️ for developers who care about code quality.</b>
</div>
