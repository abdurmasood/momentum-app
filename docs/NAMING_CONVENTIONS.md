# GitHub Repository Naming Conventions

## Overview

This document outlines the naming conventions for GitHub repositories in the Momentum ecosystem. Following these conventions ensures consistency, maintainability, and easy discovery of related repositories.

## General Naming Pattern

```
{product}-{component}-{technology?}
```

### Pattern Breakdown

- **`{product}`** - The product name (e.g., `momentum`)
- **`{component}`** - The functional component or service (e.g., `api`, `web`, `auth`)
- **`{technology}`** - Optional technology stack identifier (e.g., `node`, `go`, `python`)

## Core Principles

1. **Product Prefix**: All repositories must start with `momentum-` to ensure grouping and easy discovery
2. **Lowercase Only**: Use only lowercase letters for consistency
3. **Hyphen Separators**: Use hyphens (`-`) to separate words, never underscores or camelCase
4. **Concise Descriptors**: Keep component names short but descriptive
5. **No Version Numbers**: Avoid version numbers in repo names (use tags/branches instead)
6. **Technology Suffix**: Only add technology identifier when multiple implementations exist

## Repository Structure

### Core Repositories

| Repository Name | Purpose | Technology Stack |
|----------------|---------|------------------|
| `momentum-web` | Marketing website & landing pages | Next.js, React, TypeScript |
| `momentum-app` | Main dashboard application | Next.js 15, React 19, WebGL |
| `momentum-api` | Core backend API service | Node.js/Express or Go |
| `momentum-auth` | Authentication & authorization service | Node.js, JWT |

### Service Repositories

| Repository Name | Purpose |
|----------------|---------|
| `momentum-workers` | Background jobs and task processing |
| `momentum-websocket` | Real-time communication service |
| `momentum-notifications` | Notification service (email, push, in-app) |
| `momentum-analytics` | Analytics and telemetry service |
| `momentum-ml` | Machine learning and AI services |

### Infrastructure & Tools

| Repository Name | Purpose |
|----------------|---------|
| `momentum-infra` | Infrastructure as code (Terraform, K8s) |
| `momentum-config` | Shared configuration and secrets management |
| `momentum-docs` | Documentation and guides |
| `momentum-cli` | Command-line tools |

### Client Libraries & SDKs

| Repository Name | Purpose |
|----------------|---------|
| `momentum-sdk-js` | JavaScript/TypeScript SDK |
| `momentum-sdk-python` | Python SDK |
| `momentum-sdk-go` | Go SDK |
| `momentum-sdk-swift` | iOS/Swift SDK |
| `momentum-sdk-kotlin` | Android/Kotlin SDK |

### Mobile Applications

| Repository Name | Purpose |
|----------------|---------|
| `momentum-ios` | iOS mobile application |
| `momentum-android` | Android mobile application |
| `momentum-mobile` | React Native cross-platform app |

## Special Cases

### Multiple Implementations

When multiple implementations of the same component exist, add the technology identifier:

```
momentum-api-node      # Node.js implementation
momentum-api-go        # Go implementation
momentum-api-rust      # Rust implementation
```

### Microservices

For microservice architectures, maintain the pattern but be specific:

```
momentum-service-user     # User management service
momentum-service-payment  # Payment processing service
momentum-service-search   # Search service
```

### Internal Tools

For internal-only tools and utilities:

```
momentum-internal-admin   # Internal admin dashboard
momentum-internal-tools   # Internal tooling
```

## Repository Descriptions

Each repository should have a clear, concise description following this pattern:

```
[Emoji] [Product] [Component] - [Brief description]
```

### Examples

- 🚀 **Momentum Web** - Marketing website and landing pages
- 💫 **Momentum App** - Interactive dashboard with WebGL visualizations
- ⚡ **Momentum API** - Core backend service powering the Momentum platform
- 🔐 **Momentum Auth** - Authentication and authorization service
- 📊 **Momentum Analytics** - Analytics and telemetry collection service

## Repository Topics/Tags

Add consistent GitHub topics to improve discoverability:

### Common Topics
- `momentum`
- `momentum-platform`
- Component-specific: `api`, `frontend`, `backend`, `mobile`
- Technology-specific: `nextjs`, `react`, `typescript`, `nodejs`, `go`
- Purpose-specific: `authentication`, `analytics`, `websocket`

## Migration Strategy

For existing repositories that don't follow these conventions:

1. **Create new repository** with the correct name
2. **Migrate code** using Git remote operations
3. **Update dependencies** in other repos
4. **Archive old repository** with redirect notice
5. **Update documentation** and CI/CD pipelines

### Migration Example

```bash
# Clone existing repo
git clone https://github.com/username/old-repo-name
cd old-repo-name

# Add new remote
git remote add new-origin https://github.com/username/momentum-component

# Push to new repository
git push new-origin main

# Update origin
git remote set-url origin https://github.com/username/momentum-component
```

## Repository Settings

### Recommended Settings

- **Branch Protection**: Enable for `main` branch
- **Required Reviews**: At least 1 review for PRs
- **Automated Testing**: CI must pass before merge
- **Issue Templates**: Use consistent templates across repos
- **PR Templates**: Standardize PR descriptions

### Access Control

- **Public vs Private**: Core platform repos should be private initially
- **Team Access**: Use GitHub teams for access management
- **External Collaborators**: Document in README if applicable

## Examples in Practice

### Good Examples ✅

```
momentum-web
momentum-api
momentum-auth
momentum-sdk-js
momentum-service-payment
momentum-ios
```

### Bad Examples ❌

```
MomentumWeb           # Wrong case
momentum_api          # Wrong separator
momentum-backend-v2   # Version in name
momentum              # Too generic
web                   # Missing product prefix
momentum-new-api      # Ambiguous modifier
```

## Enforcement

### Automated Checks

Consider implementing:
- GitHub organization rules for repository naming
- Pre-commit hooks in development
- CI/CD validation for cross-repo references

### Code Review Guidelines

Reviewers should verify:
- Repository references in documentation follow conventions
- Import paths and dependencies use correct names
- CI/CD configurations reference correct repository names

## Future Considerations

As the platform grows, consider:
- Namespace prefixes for large service groups (e.g., `momentum-ml-training`, `momentum-ml-inference`)
- Geographic identifiers for region-specific deployments (e.g., `momentum-api-us-east`)
- Environment-specific repos if needed (avoid when possible, use branches/tags instead)

## Questions & Updates

For questions about naming conventions or to propose changes:
1. Open an issue in `momentum-docs`
2. Tag with `naming-convention`
3. Get team consensus before implementing changes

---

*Last Updated: December 2024*
*Version: 1.0.0*