---
name: Dependency-free mobile redirect tests
description: How to add focused routing regression tests to the Expo mobile package without introducing a test framework.
---

Use Node's built-in test runner with an `.mjs` test importing pure TypeScript helpers through Node's strip-types support. Keep the behavior under test free of React Native imports.

**Why:** The Expo package has no test framework or Node type dependency, while the workspace runtime can execute these focused tests without changing the mobile toolchain.

**How to apply:** Extract small route/redirect decisions into a dependency-free TypeScript helper, call it from the route components, and run it through the package's test script.