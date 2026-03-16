# 🚀 Contributor Setup Guide

This guide will help you get CrowdFundX running locally for development and contribution.

## 📋 Prerequisites

### Required Software
- **Node.js** 18+ - [Download](https://nodejs.org/)
- **npm** 8+ (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **Docker** & **Docker Compose** - [Download](https://www.docker.com/)

### Development Tools (Recommended)
- **VS Code** with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - Rust Analyzer (for smart contracts)
  - Docker
- **Stellar Wallet**: [Freighter](https://www.freighter.app/) or [Albedo](https://albedo.link/)

## 🛠️ Quick Start

### 1. Fork & Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/CrowdFundX.git
cd CrowdFundX

# Add upstream remote
git remote add upstream https://github.com/original-org/CrowdFundX.git
```

### 2. Install Dependencies

```bash
# Install all project dependencies at once
npm run install:all

# Or install manually for each part:
cd backend && npm install
cd ../frontend && npm install
cd ../smart-contracts && cargo build
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
# Minimum required for development:
# - STELLAR_NETWORK=testnet
# - MONGODB_URI=mongodb://localhost:27017/crowdfundx_test
# - REDIS_URL=redis://localhost:6379
```

### 4. Start Development Services

```bash
# Start databases and services with Docker
docker-compose up -d mongodb redis ipfs

# Wait 10 seconds for services to start
sleep 10

# Start all development servers
npm run dev
```

### 5. Verify Setup

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/health
- **IPFS Gateway**: http://localhost:8080

## 🏗️ Project Architecture

### Backend (Node.js + Express)
```bash
cd backend
npm run dev          # Start development server
npm test             # Run tests
npm run lint         # Check code style
```

### Frontend (React + TypeScript)
```bash
cd frontend
npm start            # Start development server
npm test             # Run tests
npm run lint         # Check code style
```

### Smart Contracts (Rust + Soroban)
```bash
cd smart-contracts
cargo test           # Run tests
cargo build          # Build contracts
cargo clippy         # Lint code
```

## 🧪 Running Tests

### All Tests
```bash
npm test              # Run all project tests
```

### Individual Test Suites
```bash
npm run test:backend     # Backend API tests
npm run test:frontend    # Frontend component tests
npm run test:contracts   # Smart contract tests
npm run test:e2e        # End-to-end tests
```

### Test Coverage
```bash
npm run test:coverage    # Generate coverage reports
```

## 🐛 Common Issues & Solutions

### Port Already in Use
```bash
# Kill processes on ports 3000, 3001, 27017, 6379
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:27017 | xargs kill -9
lsof -ti:6379 | xargs kill -9
```

### MongoDB Connection Issues
```bash
# Restart MongoDB container
docker-compose restart mongodb

# Check MongoDB logs
docker-compose logs mongodb
```

### Node Module Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Rust/Soroban Issues
```bash
# Update Rust toolchain
rustup update

# Install Soroban CLI
cargo install soroban-cli --locked

# Rebuild contracts
cd smart-contracts
cargo clean
cargo build
```

## 🔄 Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes
- Write code following project standards
- Add tests for new functionality
- Update documentation if needed

### 3. Test Changes
```bash
npm run lint          # Check code style
npm test              # Run all tests
npm run build         # Ensure everything builds
```

### 4. Commit & Push
```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 5. Create Pull Request
- Go to GitHub and create PR
- Fill out PR template
- Wait for code review

## 📁 Key Files & Directories

### Configuration Files
- `.env` - Environment variables
- `package.json` - Root package configuration
- `docker-compose.yml` - Development services
- `vite.config.ts` - Frontend build configuration

### Source Code
- `backend/src/` - Backend API source
- `frontend/src/` - Frontend React source
- `smart-contracts/` - Stellar smart contracts

### Tests
- `backend/tests/` - Backend tests
- `frontend/src/__tests__/` - Frontend tests
- `tests/` - Integration & E2E tests

## 🔧 Development Tips

### Code Quality
- Run `npm run lint` before committing
- Use `npm run format` to format code
- Write tests for new features
- Keep functions small and focused

### Performance
- Use React.memo for expensive components
- Implement pagination for large lists
- Optimize smart contract gas usage
- Use caching for API responses

### Security
- Validate all user inputs
- Use environment variables for secrets
- Follow Stellar security best practices
- Audit smart contract code

## 📚 Learning Resources

### Stellar Development
- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/)
- [Stellar SDK](https://github.com/stellar/js-stellar-sdk)

### React & TypeScript
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)

### Node.js & Express
- [Express Documentation](https://expressjs.com/)
- [MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/)
- [Redis Node.js Client](https://github.com/redis/node-redis)

## 🤝 Getting Help

### Internal Resources
- **CONTRIBUTING.md** - Detailed contribution guidelines
- **Issue Templates** - Bug reports and feature requests
- **Documentation** - API and smart contract docs

### Community
- **Discord**: [Join our server](https://discord.gg/crowdfundx)
- **GitHub Discussions**: [Ask questions](https://github.com/your-org/CrowdFundX/discussions)
- **Issues**: [Report bugs](https://github.com/your-org/CrowdFundX/issues)

## 🎯 First Contribution Ideas

Looking for ways to contribute? Try these:

1. **Fix a bug** - Check issues with "good first issue" label
2. **Add tests** - Improve test coverage
3. **Documentation** - Improve README or add tutorials
4. **UI improvements** - Enhance user experience
5. **Performance** - Optimize existing code

## ✅ Pre-Commit Checklist

Before submitting your PR, ensure:

- [ ] All tests pass (`npm test`)
- [ ] Code is linted (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Documentation is updated
- [ ] Tests cover new functionality
- [ ] No sensitive data in code
- [ ] PR description is complete

---

Happy coding! 🚀 If you need help, don't hesitate to reach out.
