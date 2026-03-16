# Contributing to CrowdFundX

Thank you for your interest in contributing to CrowdFundX! This document provides guidelines and information to help you get started.

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Rust** 1.70.0+ (for smart contracts)
- **Docker** and Docker Compose
- **Git**
- A **Stellar wallet** (Freighter, Albedo, etc.)

### Development Setup

1. **Fork the Repository**
   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/CrowdFundX.git
   cd CrowdFundX
   ```

2. **Install Dependencies**
   ```bash
   # Install all project dependencies
   npm run install:all
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit the environment file with your configuration
   nano .env
   ```

4. **Start Development Services**
   ```bash
   # Start databases and services with Docker
   docker-compose up -d mongodb redis ipfs
   
   # Start development servers
   npm run dev
   ```

## 🏗️ Project Structure

```
CrowdFundX/
├── smart-contracts/          # Stellar Soroban contracts
│   ├── campaigns/            # Campaign management
│   ├── governance/           # Voting system
│   └── utils/                # Utility contracts
├── backend/                  # Node.js API server
│   ├── src/
│   │   ├── controllers/      # API endpoints
│   │   ├── services/         # Business logic
│   │   ├── models/           # Database models
│   │   ├── middleware/       # Auth, validation
│   │   └── utils/            # Stellar utilities
│   └── tests/                # Backend tests
├── frontend/                 # React web app
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Application pages
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API calls
│   │   └── utils/            # Helper functions
│   └── public/               # Static assets
├── mobile/                   # React Native app
├── scripts/                  # Deployment utilities
├── docs/                     # Documentation
└── tests/                    # Integration tests
```

## 🛠️ Development Workflow

### 1. Create a Feature Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Your Changes

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run tests for specific parts
npm run test:backend
npm run test:frontend
npm run test:contracts

# Run linting
npm run lint

# Format code
npm run format
```

### 4. Submit Your Pull Request

1. Push your branch to your fork
2. Create a pull request against the `main` branch
3. Fill out the pull request template
4. Wait for code review and CI checks

## 📝 Coding Standards

### General Guidelines

- **Use TypeScript** for type safety
- **Follow ESLint** configuration
- **Write meaningful comments** for complex logic
- **Keep functions small** and focused
- **Use descriptive variable and function names**

### Frontend (React)

- Use **functional components** with hooks
- Follow **React best practices**
- Use **Tailwind CSS** for styling
- Implement **responsive design**
- Add **loading states** and **error handling**

### Backend (Node.js)

- Use **async/await** for asynchronous code
- Implement **proper error handling**
- Use **express-validator** for input validation
- Add **JSDoc** comments for API endpoints
- Follow **RESTful** API design principles

### Smart Contracts (Rust)

- Follow **Rust naming conventions**
- Use **proper error handling** with `Result`
- Add **comprehensive tests**
- Document **public functions**
- Consider **gas optimization**

## 🧪 Testing

### Unit Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Smart contract tests
cd smart-contracts && cargo test
```

### Integration Tests

```bash
# End-to-end tests
cd tests/e2e_tests && npm test
```

### Test Coverage

- Aim for **80%+ code coverage**
- Test **happy paths** and **error scenarios**
- Include **edge cases** in tests
- Use **mocks** for external dependencies

## 📋 Pull Request Process

### Before Submitting

1. **Run all tests** and ensure they pass
2. **Fix any linting errors**
3. **Update documentation** if needed
4. **Rebase** your branch if necessary

### Pull Request Template

Use the provided pull request template and include:

- **Description** of changes
- **Testing** performed
- **Screenshots** for UI changes
- **Breaking changes** (if any)
- **Related issues**

### Code Review

- All PRs require **at least one approval**
- Address **review feedback** promptly
- Keep **discussions constructive**
- **Update PR** based on feedback

## 🐛 Bug Reports

When reporting bugs, please:

1. **Search existing issues** first
2. Use the **bug report template**
3. Provide **detailed reproduction steps**
4. Include **environment information**
5. Add **screenshots** or **error messages**

## ✨ Feature Requests

For new features:

1. **Check roadmap** and existing issues
2. Use the **feature request template**
3. Provide **clear use cases**
4. Consider **implementation complexity**
5. Discuss **trade-offs**

## 🔧 Development Tools

### Recommended Extensions

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Rust Analyzer** - Rust development
- **Docker** - Container management

### Useful Commands

```bash
# Development
npm run dev                    # Start all dev servers
npm run dev:backend           # Start backend only
npm run dev:frontend          # Start frontend only

# Building
npm run build                  # Build all projects
npm run build:backend         # Build backend
npm run build:frontend        # Build frontend

# Testing
npm test                      # Run all tests
npm run test:watch           # Watch mode
npm run test:coverage        # Coverage report

# Smart Contracts
cd smart-contracts
cargo build                  # Build contracts
cargo test                   # Test contracts
cargo clippy                 # Lint contracts
```

## 📚 Documentation

- **API Documentation**: `docs/api_reference.md`
- **Smart Contracts**: `CrowdFundX_Stellar_Smart_Contracts.md`
- **User Guide**: `docs/user_guide.md`

## 🤝 Community

- **Discord**: [Join our community](https://discord.gg/crowdfundx)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/CrowdFundX/discussions)
- **Twitter**: [@CrowdFundX](https://twitter.com/CrowdFundX)

## 📄 License

By contributing to CrowdFundX, you agree that your contributions will be licensed under the **MIT License**.

## 🙏 Recognition

Contributors are recognized in:

- **README.md** - Core contributors
- **Release notes** - Feature contributions
- **Community highlights** - Outstanding contributions

## 🆘 Getting Help

If you need help:

1. Check **existing documentation**
2. Search **GitHub issues**
3. Ask in **Discord discussions**
4. Create a **help wanted issue**

---

Thank you for contributing to CrowdFundX! 🚀
