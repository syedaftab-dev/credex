# TESTS

## Test Suite Overview
The core logic of the CredX AI Spend Audit tool is tested via Vitest. The focus is on the **Audit Engine** to ensure that financial recommendations are accurate and defensible.

## How to Run Tests
```bash
npm run test
# or
npx vitest run
```

## List of Tests

### Audit Engine (`lib/audit-engine.test.ts`)
1. **Oversized Plan Detection**: Verified that the engine suggests switching from a $40 Team plan to a $20 Pro plan if the team size is only 1 user.
2. **Redundancy Detection**: Verified that if a user has both Claude and ChatGPT for the "general" use case, one is flagged as redundant and savings are calculated accordingly.
3. **High Savings Trigger**: Verified that `showCredex` becomes true when total monthly savings exceed $500.
4. **Healthy Spend Detection**: Verified that `isHealthy` is true when savings are below $100, providing an honest user experience.
5. **Annual Calculation**: Verified that annual savings are exactly 12x the monthly savings.
6. **Paid-Only Recommendations**: Verified that the engine does NOT suggest a $0 Free/Hobby plan to a user on a paid plan, ensuring business-grade recommendations.
7. **Multiple Use Cases**: Verified that tools for different use cases (e.g. Coding vs Research) are NOT marked as redundant even if both are expensive.

## CI/CD Integration
Tests are automatically run on every push to the `main` branch via GitHub Actions. Deployment to Vercel is blocked if tests fail.
