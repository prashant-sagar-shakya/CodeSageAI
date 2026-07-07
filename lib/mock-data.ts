// ============================================================
// CodeSageAI — Comprehensive Mock Data
// ============================================================

import {
  Repository, Branch, PullRequest, Agent, ReviewIssue, ReviewScores,
  ReviewReport, FileNode, FileDiff, DiffLine, DashboardStats,
  ActivityItem, CommonIssue, ChartDataPoint, User
} from './types';

// ---- Mock User ----
export const mockUser: User = {
  id: 'u-001',
  name: 'Prashant Kumar',
  email: 'prashant@codesageai.dev',
  avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Prashant',
  githubUsername: 'prashant-dev',
};

// ---- Mock Repositories ----
export const mockRepositories: Repository[] = [
  {
    id: 'r-001',
    name: 'next-ecommerce',
    fullName: 'prashant-dev/next-ecommerce',
    description: 'A full-stack e-commerce platform built with Next.js 15, Stripe, and PostgreSQL',
    language: 'TypeScript',
    stars: 2847,
    forks: 412,
    openIssues: 23,
    lastUpdated: '2026-07-07T10:30:00Z',
    isPrivate: false,
    techStack: ['Next.js', 'React', 'PostgreSQL', 'Stripe', 'Tailwind'],
    healthScore: 87,
    avatar: 'https://api.dicebear.com/9.x/identicon/svg?seed=next-ecommerce',
    url: 'https://github.com/prashant-dev/next-ecommerce',
  },
  {
    id: 'r-002',
    name: 'ai-chatbot-api',
    fullName: 'prashant-dev/ai-chatbot-api',
    description: 'RESTful API for an AI-powered chatbot using LangChain and FastAPI',
    language: 'Python',
    stars: 1256,
    forks: 189,
    openIssues: 8,
    lastUpdated: '2026-07-06T15:20:00Z',
    isPrivate: false,
    techStack: ['FastAPI', 'LangChain', 'Redis', 'Docker', 'PostgreSQL'],
    healthScore: 92,
    avatar: 'https://api.dicebear.com/9.x/identicon/svg?seed=ai-chatbot',
    url: 'https://github.com/prashant-dev/ai-chatbot-api',
  },
  {
    id: 'r-003',
    name: 'react-dashboard-kit',
    fullName: 'prashant-dev/react-dashboard-kit',
    description: 'A premium React dashboard component library with 50+ pre-built components',
    language: 'TypeScript',
    stars: 5621,
    forks: 823,
    openIssues: 15,
    lastUpdated: '2026-07-05T09:15:00Z',
    isPrivate: false,
    techStack: ['React', 'TypeScript', 'Storybook', 'Vitest', 'CSS Modules'],
    healthScore: 78,
    avatar: 'https://api.dicebear.com/9.x/identicon/svg?seed=dashboard-kit',
    url: 'https://github.com/prashant-dev/react-dashboard-kit',
  },
  {
    id: 'r-004',
    name: 'microservices-backend',
    fullName: 'prashant-dev/microservices-backend',
    description: 'Event-driven microservices architecture with Node.js, RabbitMQ, and MongoDB',
    language: 'JavaScript',
    stars: 934,
    forks: 156,
    openIssues: 31,
    lastUpdated: '2026-07-04T22:45:00Z',
    isPrivate: true,
    techStack: ['Node.js', 'Express', 'RabbitMQ', 'MongoDB', 'Docker'],
    healthScore: 65,
    avatar: 'https://api.dicebear.com/9.x/identicon/svg?seed=microservices',
    url: 'https://github.com/prashant-dev/microservices-backend',
  },
  {
    id: 'r-005',
    name: 'rust-web-framework',
    fullName: 'prashant-dev/rust-web-framework',
    description: 'A lightweight, blazing-fast web framework built in Rust with async/await',
    language: 'Rust',
    stars: 3412,
    forks: 267,
    openIssues: 12,
    lastUpdated: '2026-07-03T14:00:00Z',
    isPrivate: false,
    techStack: ['Rust', 'Tokio', 'Serde', 'SQLx'],
    healthScore: 94,
    avatar: 'https://api.dicebear.com/9.x/identicon/svg?seed=rust-web',
    url: 'https://github.com/prashant-dev/rust-web-framework',
  },
  {
    id: 'r-006',
    name: 'flutter-fintech-app',
    fullName: 'prashant-dev/flutter-fintech-app',
    description: 'Cross-platform fintech application with biometric auth and real-time transactions',
    language: 'Dart',
    stars: 1789,
    forks: 301,
    openIssues: 19,
    lastUpdated: '2026-07-02T11:30:00Z',
    isPrivate: true,
    techStack: ['Flutter', 'Dart', 'Firebase', 'Stripe', 'GraphQL'],
    healthScore: 71,
    avatar: 'https://api.dicebear.com/9.x/identicon/svg?seed=fintech',
    url: 'https://github.com/prashant-dev/flutter-fintech-app',
  },
];

// ---- Mock Branches ----
export const mockBranches: Branch[] = [
  { name: 'main', isDefault: true, lastCommit: 'feat: add payment gateway integration', lastCommitDate: '2026-07-07T10:30:00Z' },
  { name: 'develop', isDefault: false, lastCommit: 'fix: resolve cart calculation bug', lastCommitDate: '2026-07-06T15:20:00Z' },
  { name: 'feature/auth-v2', isDefault: false, lastCommit: 'feat: implement OAuth2 with PKCE', lastCommitDate: '2026-07-05T09:15:00Z' },
  { name: 'feature/search', isDefault: false, lastCommit: 'feat: add elasticsearch integration', lastCommitDate: '2026-07-04T22:45:00Z' },
  { name: 'hotfix/security-patch', isDefault: false, lastCommit: 'fix: patch XSS vulnerability in comments', lastCommitDate: '2026-07-03T14:00:00Z' },
];

// ---- Mock Pull Requests ----
export const mockPullRequests: PullRequest[] = [
  {
    id: 'pr-001',
    number: 142,
    title: 'feat: Implement Stripe payment gateway with webhook handlers',
    description: 'Adds complete Stripe integration including checkout sessions, webhook handling for payment events, and refund processing.',
    status: 'open',
    author: 'prashant-dev',
    authorAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Prashant',
    createdAt: '2026-07-07T08:00:00Z',
    updatedAt: '2026-07-07T10:30:00Z',
    additions: 847,
    deletions: 123,
    changedFiles: 14,
    baseBranch: 'main',
    headBranch: 'feature/stripe-payment',
    labels: ['enhancement', 'payment', 'needs-review'],
  },
  {
    id: 'pr-002',
    number: 141,
    title: 'fix: Resolve race condition in cart checkout flow',
    description: 'Fixes a critical race condition where concurrent checkout requests could result in double charges.',
    status: 'open',
    author: 'alex-smith',
    authorAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alex',
    createdAt: '2026-07-06T14:00:00Z',
    updatedAt: '2026-07-06T16:45:00Z',
    additions: 234,
    deletions: 89,
    changedFiles: 6,
    baseBranch: 'main',
    headBranch: 'fix/cart-race-condition',
    labels: ['bug', 'critical', 'cart'],
  },
  {
    id: 'pr-003',
    number: 140,
    title: 'feat: Add product search with Elasticsearch',
    description: 'Implements full-text search with fuzzy matching, filters, and autocomplete using Elasticsearch.',
    status: 'merged',
    author: 'sarah-dev',
    authorAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sarah',
    createdAt: '2026-07-04T10:00:00Z',
    updatedAt: '2026-07-05T14:30:00Z',
    additions: 1234,
    deletions: 67,
    changedFiles: 18,
    baseBranch: 'main',
    headBranch: 'feature/elasticsearch-search',
    labels: ['enhancement', 'search'],
  },
  {
    id: 'pr-004',
    number: 139,
    title: 'chore: Upgrade dependencies and fix security vulnerabilities',
    description: 'Updates all npm packages to latest versions and resolves 3 high-severity security advisories.',
    status: 'merged',
    author: 'prashant-dev',
    authorAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Prashant',
    createdAt: '2026-07-03T09:00:00Z',
    updatedAt: '2026-07-03T11:00:00Z',
    additions: 456,
    deletions: 389,
    changedFiles: 4,
    baseBranch: 'main',
    headBranch: 'chore/upgrade-deps',
    labels: ['dependencies', 'security'],
  },
  {
    id: 'pr-005',
    number: 138,
    title: 'feat: Implement user authentication with OAuth2 and PKCE',
    description: 'Complete auth system with GitHub, Google OAuth, magic links, session management, and RBAC.',
    status: 'closed',
    author: 'mike-johnson',
    authorAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Mike',
    createdAt: '2026-07-01T16:00:00Z',
    updatedAt: '2026-07-02T09:00:00Z',
    additions: 2100,
    deletions: 150,
    changedFiles: 22,
    baseBranch: 'main',
    headBranch: 'feature/auth-v2',
    labels: ['enhancement', 'auth', 'breaking-change'],
  },
];

// ---- Mock Agents ----
export const mockAgents: Agent[] = [
  { name: 'Repository Analyzer', status: 'complete', progress: 100, findings: 5, icon: 'FolderSearch', color: '#6366f1', description: 'Repository structure analyzed' },
  { name: 'Code Quality', status: 'complete', progress: 100, findings: 12, icon: 'Code2', color: '#8b5cf6', description: 'Code quality checks complete' },
  { name: 'Bug Detection', status: 'complete', progress: 100, findings: 4, icon: 'Bug', color: '#ef4444', description: 'Bug detection complete' },
  { name: 'Security', status: 'complete', progress: 100, findings: 3, icon: 'Shield', color: '#f59e0b', description: 'Security audit complete' },
  { name: 'Performance', status: 'complete', progress: 100, findings: 7, icon: 'Zap', color: '#10b981', description: 'Performance analysis complete' },
  { name: 'Documentation', status: 'complete', progress: 100, findings: 8, icon: 'FileText', color: '#06b6d4', description: 'Documentation review complete' },
  { name: 'Testing', status: 'complete', progress: 100, findings: 6, icon: 'TestTube2', color: '#ec4899', description: 'Test coverage analysis complete' },
  { name: 'Refactoring', status: 'complete', progress: 100, findings: 5, icon: 'RefreshCw', color: '#f97316', description: 'Refactoring suggestions ready' },
];

// ---- Mock Review Scores ----
export const mockScores: ReviewScores = {
  security: 90,
  performance: 82,
  readability: 94,
  testing: 65,
  documentation: 72,
  maintainability: 89,
  overall: 82,
};

// ---- Mock Review Issues ----
export const mockIssues: ReviewIssue[] = [
  {
    id: 'issue-001',
    agent: 'Security',
    severity: 'critical',
    title: 'SQL Injection vulnerability in user search',
    description: 'The search query is being interpolated directly into the SQL string without parameterization.',
    file: 'src/services/userService.ts',
    line: 42,
    endLine: 48,
    explanation: 'String interpolation in SQL queries allows attackers to inject malicious SQL commands. This can lead to unauthorized data access, data modification, or complete database compromise.',
    howToFix: 'Use parameterized queries or an ORM method that automatically escapes inputs. Never concatenate user input directly into SQL strings.',
    codeBefore: `const query = \`SELECT * FROM users WHERE name LIKE '%\${searchTerm}%'\`;
const result = await db.raw(query);`,
    codeAfter: `const result = await db('users')
  .where('name', 'like', \`%\${searchTerm}%\`)
  .select('*');`,
    confidence: 98,
    category: 'OWASP A03:2021 - Injection',
    rule: 'SEC-001',
  },
  {
    id: 'issue-002',
    agent: 'Bug Detection',
    severity: 'critical',
    title: 'Null reference error in payment processing',
    description: 'The payment result object is accessed without null checking, which will crash when payment gateway returns an error.',
    file: 'src/services/paymentService.ts',
    line: 87,
    endLine: 92,
    explanation: 'When the Stripe API call fails or returns an unexpected response, `result.data.charge` will throw a TypeError because `result.data` may be undefined.',
    howToFix: 'Add null/undefined checks with optional chaining and proper error handling.',
    codeBefore: `const charge = result.data.charge;
const amount = charge.amount;
await updateOrder(orderId, charge.id);`,
    codeAfter: `const charge = result?.data?.charge;
if (!charge) {
  throw new PaymentError('Payment processing failed: no charge data');
}
const amount = charge.amount;
await updateOrder(orderId, charge.id);`,
    confidence: 95,
    category: 'Null Safety',
    rule: 'BUG-001',
  },
  {
    id: 'issue-003',
    agent: 'Performance',
    severity: 'warning',
    title: 'N+1 query pattern in product listing',
    description: 'Each product fetches its category individually inside a loop, causing N+1 database queries.',
    file: 'src/controllers/productController.ts',
    line: 34,
    endLine: 42,
    explanation: 'For 100 products, this pattern generates 101 database queries (1 for products + 100 for categories). This significantly degrades response time and database performance.',
    howToFix: 'Use eager loading or a JOIN query to fetch products with their categories in a single query.',
    codeBefore: `const products = await Product.findAll();
for (const product of products) {
  product.category = await Category.findById(product.categoryId);
}`,
    codeAfter: `const products = await Product.findAll({
  include: [{ model: Category, as: 'category' }]
});`,
    confidence: 92,
    category: 'Database Performance',
    rule: 'PERF-001',
  },
  {
    id: 'issue-004',
    agent: 'Code Quality',
    severity: 'warning',
    title: 'Function exceeds 80 lines — violates Single Responsibility',
    description: 'The `processOrder` function handles validation, payment, inventory, email, and logging — all in 127 lines.',
    file: 'src/services/orderService.ts',
    line: 15,
    endLine: 142,
    explanation: 'Large functions that handle multiple responsibilities are harder to test, debug, and maintain. They violate the Single Responsibility Principle (SRP) of SOLID.',
    howToFix: 'Break the function into smaller, focused functions: validateOrder(), processPayment(), updateInventory(), sendConfirmation().',
    codeBefore: `async function processOrder(order: Order) {
  // 127 lines of validation, payment, inventory, email...
}`,
    codeAfter: `async function processOrder(order: Order) {
  await validateOrder(order);
  const payment = await processPayment(order);
  await updateInventory(order.items);
  await sendConfirmationEmail(order, payment);
  await logOrderEvent(order.id, 'completed');
}`,
    confidence: 88,
    category: 'SOLID Principles',
    rule: 'CQ-001',
  },
  {
    id: 'issue-005',
    agent: 'Security',
    severity: 'critical',
    title: 'Hardcoded API secret key in source code',
    description: 'Stripe secret key is hardcoded directly in the configuration file.',
    file: 'src/config/stripe.ts',
    line: 3,
    explanation: 'Hardcoded secrets in source code can be exposed through version control, logs, or error messages. This is a critical security vulnerability.',
    howToFix: 'Use environment variables to store secrets. Add the variable to .env and access it via process.env.',
    codeBefore: `const stripeConfig = {
  secretKey: 'sk_live_abc123xyz789',
  webhookSecret: 'whsec_abc123',
};`,
    codeAfter: `const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
};`,
    confidence: 99,
    category: 'Secrets Management',
    rule: 'SEC-002',
  },
  {
    id: 'issue-006',
    agent: 'Testing',
    severity: 'info',
    title: 'Missing unit tests for paymentService',
    description: 'The payment service has 0% test coverage. Critical business logic should be tested.',
    file: 'src/services/paymentService.ts',
    line: 1,
    explanation: 'Payment processing is critical business logic that handles real money. Without tests, regressions or bugs could cause financial losses or customer issues.',
    howToFix: 'Add unit tests for all payment scenarios including success, failure, refunds, and edge cases.',
    codeBefore: `// No test file exists for paymentService`,
    codeAfter: `describe('PaymentService', () => {
  it('should process payment successfully', async () => {
    const mockCharge = { id: 'ch_123', amount: 5000 };
    jest.spyOn(stripe.charges, 'create').mockResolvedValue(mockCharge);
    const result = await processPayment(mockOrder);
    expect(result.chargeId).toBe('ch_123');
  });

  it('should handle payment failure gracefully', async () => {
    jest.spyOn(stripe.charges, 'create').mockRejectedValue(new Error('Card declined'));
    await expect(processPayment(mockOrder)).rejects.toThrow('Card declined');
  });
});`,
    confidence: 100,
    category: 'Test Coverage',
    rule: 'TEST-001',
  },
  {
    id: 'issue-007',
    agent: 'Documentation',
    severity: 'suggestion',
    title: 'Missing JSDoc for public API functions',
    description: 'Public functions in the API layer lack documentation comments.',
    file: 'src/controllers/productController.ts',
    line: 10,
    explanation: 'Public API functions should be documented for other developers and for auto-generated API documentation. Missing docs increase onboarding time.',
    howToFix: 'Add JSDoc comments with @param, @returns, and @throws tags.',
    codeBefore: `export async function getProducts(req: Request, res: Response) {`,
    codeAfter: `/**
 * Retrieves a paginated list of products with optional filtering.
 * @param req - Express request with query params: page, limit, category, search
 * @returns JSON response with products array and pagination metadata
 * @throws {400} If pagination params are invalid
 * @throws {500} If database query fails
 */
export async function getProducts(req: Request, res: Response) {`,
    confidence: 85,
    category: 'API Documentation',
    rule: 'DOC-001',
  },
  {
    id: 'issue-008',
    agent: 'Refactoring',
    severity: 'suggestion',
    title: 'Consider Strategy Pattern for payment providers',
    description: 'Switch statement for payment providers can be replaced with the Strategy Pattern for better extensibility.',
    file: 'src/services/paymentService.ts',
    line: 55,
    endLine: 78,
    explanation: 'Using switch/case for different payment providers violates the Open/Closed Principle. Adding new providers requires modifying existing code.',
    howToFix: 'Create a PaymentStrategy interface and implement it for each provider (Stripe, PayPal, etc.).',
    codeBefore: `switch (provider) {
  case 'stripe':
    return processStripePayment(order);
  case 'paypal':
    return processPayPalPayment(order);
  case 'razorpay':
    return processRazorpayPayment(order);
  default:
    throw new Error('Unknown provider');
}`,
    codeAfter: `interface PaymentStrategy {
  processPayment(order: Order): Promise<PaymentResult>;
}

class StripePayment implements PaymentStrategy { /* ... */ }
class PayPalPayment implements PaymentStrategy { /* ... */ }

const strategies: Record<string, PaymentStrategy> = {
  stripe: new StripePayment(),
  paypal: new PayPalPayment(),
};

return strategies[provider].processPayment(order);`,
    confidence: 82,
    category: 'Design Patterns',
    rule: 'REF-001',
  },
  {
    id: 'issue-009',
    agent: 'Performance',
    severity: 'warning',
    title: 'Nested loops causing O(n²) complexity',
    description: 'Nested iteration over products and orders creates quadratic time complexity.',
    file: 'src/utils/analytics.ts',
    line: 23,
    endLine: 35,
    explanation: 'For 1000 products and 1000 orders, this code performs 1,000,000 iterations. This will be extremely slow as data grows.',
    howToFix: 'Use a HashMap (object/Map) to achieve O(n) lookup instead of nested loops.',
    codeBefore: `for (const product of products) {
  for (const order of orders) {
    if (order.productId === product.id) {
      product.totalSales += order.amount;
    }
  }
}`,
    codeAfter: `const orderMap = new Map<string, number>();
for (const order of orders) {
  const current = orderMap.get(order.productId) || 0;
  orderMap.set(order.productId, current + order.amount);
}
for (const product of products) {
  product.totalSales = orderMap.get(product.id) || 0;
}`,
    confidence: 94,
    category: 'Algorithm Complexity',
    rule: 'PERF-002',
  },
  {
    id: 'issue-010',
    agent: 'Bug Detection',
    severity: 'warning',
    title: 'Unhandled promise rejection in async middleware',
    description: 'Async express middleware does not catch errors, leading to unhandled promise rejections.',
    file: 'src/middleware/auth.ts',
    line: 12,
    endLine: 20,
    explanation: 'Express does not automatically catch errors in async route handlers. Unhandled promise rejections can crash the Node.js process in production.',
    howToFix: 'Wrap async middleware in a try-catch block or use an asyncHandler wrapper.',
    codeBefore: `export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;
  const user = await verifyToken(token);
  req.user = user;
  next();
};`,
    codeAfter: `export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const user = await verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};`,
    confidence: 91,
    category: 'Error Handling',
    rule: 'BUG-002',
  },
];

// ---- Mock File Tree ----
export const mockFileTree: FileNode[] = [
  {
    name: 'src',
    path: 'src',
    type: 'directory',
    children: [
      {
        name: 'controllers',
        path: 'src/controllers',
        type: 'directory',
        children: [
          { name: 'productController.ts', path: 'src/controllers/productController.ts', type: 'file', issueCount: 2, language: 'TypeScript' },
          { name: 'orderController.ts', path: 'src/controllers/orderController.ts', type: 'file', issueCount: 0, language: 'TypeScript' },
          { name: 'userController.ts', path: 'src/controllers/userController.ts', type: 'file', issueCount: 1, language: 'TypeScript' },
        ],
      },
      {
        name: 'services',
        path: 'src/services',
        type: 'directory',
        children: [
          { name: 'paymentService.ts', path: 'src/services/paymentService.ts', type: 'file', issueCount: 3, language: 'TypeScript' },
          { name: 'orderService.ts', path: 'src/services/orderService.ts', type: 'file', issueCount: 1, language: 'TypeScript' },
          { name: 'userService.ts', path: 'src/services/userService.ts', type: 'file', issueCount: 1, language: 'TypeScript' },
        ],
      },
      {
        name: 'middleware',
        path: 'src/middleware',
        type: 'directory',
        children: [
          { name: 'auth.ts', path: 'src/middleware/auth.ts', type: 'file', issueCount: 1, language: 'TypeScript' },
        ],
      },
      {
        name: 'config',
        path: 'src/config',
        type: 'directory',
        children: [
          { name: 'stripe.ts', path: 'src/config/stripe.ts', type: 'file', issueCount: 1, language: 'TypeScript' },
          { name: 'database.ts', path: 'src/config/database.ts', type: 'file', issueCount: 0, language: 'TypeScript' },
        ],
      },
      {
        name: 'utils',
        path: 'src/utils',
        type: 'directory',
        children: [
          { name: 'analytics.ts', path: 'src/utils/analytics.ts', type: 'file', issueCount: 1, language: 'TypeScript' },
          { name: 'helpers.ts', path: 'src/utils/helpers.ts', type: 'file', issueCount: 0, language: 'TypeScript' },
        ],
      },
    ],
  },
];

// ---- Mock File Diff ----
export const mockFileDiff: FileDiff = {
  path: 'src/services/paymentService.ts',
  additions: 45,
  deletions: 12,
  language: 'typescript',
  lines: [
    { type: 'context', content: "import Stripe from 'stripe';", oldLineNumber: 1, newLineNumber: 1 },
    { type: 'context', content: "import { Order, PaymentResult } from '../types';", oldLineNumber: 2, newLineNumber: 2 },
    { type: 'context', content: '', oldLineNumber: 3, newLineNumber: 3 },
    { type: 'remove', content: "const stripe = new Stripe('sk_live_abc123xyz789');", oldLineNumber: 4 },
    { type: 'add', content: "const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);", newLineNumber: 4, hasIssue: true, issueId: 'issue-005' },
    { type: 'context', content: '', oldLineNumber: 5, newLineNumber: 5 },
    { type: 'context', content: 'export async function processPayment(order: Order): Promise<PaymentResult> {', oldLineNumber: 6, newLineNumber: 6 },
    { type: 'remove', content: '  const result = await stripe.charges.create({', oldLineNumber: 7 },
    { type: 'remove', content: '    amount: order.total,', oldLineNumber: 8 },
    { type: 'remove', content: "    currency: 'usd',", oldLineNumber: 9 },
    { type: 'remove', content: '    source: order.paymentToken,', oldLineNumber: 10 },
    { type: 'remove', content: '  });', oldLineNumber: 11 },
    { type: 'add', content: '  try {', newLineNumber: 7 },
    { type: 'add', content: '    const result = await stripe.charges.create({', newLineNumber: 8 },
    { type: 'add', content: '      amount: order.total,', newLineNumber: 9 },
    { type: 'add', content: "      currency: 'usd',", newLineNumber: 10 },
    { type: 'add', content: '      source: order.paymentToken,', newLineNumber: 11 },
    { type: 'add', content: '    });', newLineNumber: 12 },
    { type: 'context', content: '', oldLineNumber: 12, newLineNumber: 13 },
    { type: 'remove', content: '  const charge = result.data.charge;', oldLineNumber: 13, hasIssue: true, issueId: 'issue-002' },
    { type: 'remove', content: '  const amount = charge.amount;', oldLineNumber: 14 },
    { type: 'add', content: '    const charge = result?.data?.charge;', newLineNumber: 14 },
    { type: 'add', content: '    if (!charge) {', newLineNumber: 15 },
    { type: 'add', content: "      throw new PaymentError('Payment failed: no charge data');", newLineNumber: 16 },
    { type: 'add', content: '    }', newLineNumber: 17 },
    { type: 'add', content: '    const amount = charge.amount;', newLineNumber: 18 },
    { type: 'context', content: '', oldLineNumber: 15, newLineNumber: 19 },
    { type: 'remove', content: '  await updateOrder(orderId, charge.id);', oldLineNumber: 16 },
    { type: 'add', content: '    await updateOrder(order.id, charge.id);', newLineNumber: 20 },
    { type: 'add', content: '    return { success: true, chargeId: charge.id, amount };', newLineNumber: 21 },
    { type: 'add', content: '  } catch (error) {', newLineNumber: 22 },
    { type: 'add', content: "    logger.error('Payment processing failed', { orderId: order.id, error });", newLineNumber: 23 },
    { type: 'add', content: '    throw error;', newLineNumber: 24 },
    { type: 'add', content: '  }', newLineNumber: 25 },
    { type: 'context', content: '}', oldLineNumber: 17, newLineNumber: 26 },
  ],
};

// ---- Mock Dashboard Stats ----
export const mockDashboardStats: DashboardStats = {
  totalReviews: 1247,
  bugsFound: 3892,
  securityIssues: 156,
  avgScore: 84,
  reviewsTrend: 12.5,
  bugsTrend: -8.3,
  securityTrend: -15.2,
  scoreTrend: 4.7,
};

// ---- Mock Chart Data ----
export const mockTrendData: ChartDataPoint[] = [
  { name: 'Jan', security: 72, performance: 68, readability: 85, testing: 45, overall: 67 },
  { name: 'Feb', security: 75, performance: 71, readability: 87, testing: 48, overall: 70 },
  { name: 'Mar', security: 78, performance: 74, readability: 88, testing: 52, overall: 73 },
  { name: 'Apr', security: 82, performance: 76, readability: 90, testing: 55, overall: 76 },
  { name: 'May', security: 85, performance: 79, readability: 91, testing: 58, overall: 78 },
  { name: 'Jun', security: 88, performance: 80, readability: 93, testing: 62, overall: 81 },
  { name: 'Jul', security: 90, performance: 82, readability: 94, testing: 65, overall: 82 },
];

export const mockIssuesByCategory: ChartDataPoint[] = [
  { name: 'Code Quality', value: 34 },
  { name: 'Security', value: 18 },
  { name: 'Performance', value: 22 },
  { name: 'Testing', value: 12 },
  { name: 'Documentation', value: 8 },
  { name: 'Refactoring', value: 6 },
];

// ---- Mock Common Issues ----
export const mockCommonIssues: CommonIssue[] = [
  { name: 'Missing Error Handling', count: 247, percentage: 82, severity: 'warning' },
  { name: 'Unused Imports', count: 189, percentage: 74, severity: 'info' },
  { name: 'Missing Type Annotations', count: 156, percentage: 68, severity: 'info' },
  { name: 'SQL Injection Risk', count: 34, percentage: 45, severity: 'critical' },
  { name: 'N+1 Query Pattern', count: 89, percentage: 56, severity: 'warning' },
  { name: 'Hardcoded Secrets', count: 12, percentage: 15, severity: 'critical' },
  { name: 'Missing Unit Tests', count: 134, percentage: 62, severity: 'suggestion' },
  { name: 'Complex Functions (>50 lines)', count: 78, percentage: 51, severity: 'warning' },
];

// ---- Mock Activity Feed ----
export const mockActivity: ActivityItem[] = [
  { id: 'act-001', type: 'review_complete', message: 'Review completed for PR #142 in next-ecommerce', timestamp: '2026-07-07T10:30:00Z', icon: 'CheckCircle2', color: '#10b981' },
  { id: 'act-002', type: 'issue_found', message: '3 critical security issues found in ai-chatbot-api', timestamp: '2026-07-07T09:15:00Z', icon: 'AlertTriangle', color: '#ef4444' },
  { id: 'act-003', type: 'pr_merged', message: 'PR #140 merged in next-ecommerce after review', timestamp: '2026-07-06T16:45:00Z', icon: 'GitMerge', color: '#8b5cf6' },
  { id: 'act-004', type: 'repo_added', message: 'New repository flutter-fintech-app connected', timestamp: '2026-07-06T14:00:00Z', icon: 'Plus', color: '#06b6d4' },
  { id: 'act-005', type: 'review_complete', message: 'Review completed for PR #139 in next-ecommerce', timestamp: '2026-07-05T11:30:00Z', icon: 'CheckCircle2', color: '#10b981' },
  { id: 'act-006', type: 'issue_found', message: '1 memory leak detected in microservices-backend', timestamp: '2026-07-05T09:00:00Z', icon: 'AlertTriangle', color: '#f59e0b' },
  { id: 'act-007', type: 'review_complete', message: 'Full security audit for rust-web-framework passed', timestamp: '2026-07-04T15:20:00Z', icon: 'Shield', color: '#10b981' },
];

// ---- Mock Review Report ----
export const mockReport: ReviewReport = {
  id: 'report-001',
  repositoryName: 'next-ecommerce',
  prNumber: 142,
  prTitle: 'feat: Implement Stripe payment gateway with webhook handlers',
  scores: mockScores,
  issues: mockIssues,
  agents: mockAgents,
  createdAt: '2026-07-07T10:30:00Z',
  duration: '2m 34s',
  totalFiles: 14,
  totalLines: 970,
};

// ---- Radar Chart Data ----
export const mockRadarData = [
  { subject: 'Security', score: 90, fullMark: 100 },
  { subject: 'Performance', score: 82, fullMark: 100 },
  { subject: 'Readability', score: 94, fullMark: 100 },
  { subject: 'Testing', score: 65, fullMark: 100 },
  { subject: 'Docs', score: 72, fullMark: 100 },
  { subject: 'Maintain.', score: 89, fullMark: 100 },
];

// ---- Mock Review History ----
export const mockReviewHistory = [
  { id: 'rh-001', repo: 'next-ecommerce', pr: '#142', score: 82, issues: 10, date: '2026-07-07T10:30:00Z', status: 'complete' as const },
  { id: 'rh-002', repo: 'ai-chatbot-api', pr: '#87', score: 91, issues: 4, date: '2026-07-06T15:20:00Z', status: 'complete' as const },
  { id: 'rh-003', repo: 'react-dashboard-kit', pr: '#234', score: 76, issues: 15, date: '2026-07-05T09:15:00Z', status: 'complete' as const },
  { id: 'rh-004', repo: 'microservices-backend', pr: '#56', score: 63, issues: 22, date: '2026-07-04T22:45:00Z', status: 'complete' as const },
  { id: 'rh-005', repo: 'rust-web-framework', pr: '#189', score: 95, issues: 2, date: '2026-07-03T14:00:00Z', status: 'complete' as const },
];
