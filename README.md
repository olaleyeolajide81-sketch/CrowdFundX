# CrowdFundX - Decentralized Crowdfunding Platform

A Web3 crowdfunding platform built on the Stellar blockchain, enabling transparent and efficient fundraising for creators, entrepreneurs, and organizations.

## 🌟 Features

- **Decentralized Campaigns**: Create and manage crowdfunding campaigns with smart contracts
- **Multi-Asset Support**: Accept contributions in XLM and other Stellar assets
- **Reward System**: Automated reward distribution based on contribution tiers
- **Governance**: Community voting for campaign decisions
- **Transparent Fund Management**: Secure escrow and milestone-based releases
- **Low Transaction Fees**: Leverage Stellar's cost-effective network

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │   Backend API   │    │  Stellar Network│
│   (React/Vue)   │◄──►│   (Node.js)     │◄──►│  (Soroban SC)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌─────────┐            ┌─────────┐            ┌─────────┐
    │ IPFS    │            │ Database│            │ Horizon │
    │ Storage │            │(MongoDB)│            │ API     │
    └─────────┘            └─────────┘            └─────────┘
```
```

## 📁 Project Structure

```
CrowdFundX/
├── smart-contracts/          # Stellar Soroban contracts
│   ├── campaigns/            # Campaign management contracts
│   ├── governance/           # Voting and governance contracts
│   └── utils/                # Utility contracts
├── backend/                  # Node.js API server
│   ├── src/
│   │   ├── controllers/      # API endpoints
│   │   ├── services/         # Business logic
│   │   ├── models/           # Database models
│   │   ├── middleware/       # Auth, validation
│   │   └── utils/            # Stellar SDK utilities
│   └── tests/                # Backend tests
├── frontend/                 # Web application
│   ├── src/
│   │   ├── components/       # React/Vue components
│   │   ├── pages/            # Application pages
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API calls
│   │   └── utils/            # Helper functions
│   └── public/               # Static assets
├── mobile/                   # React Native app (optional)
├── scripts/                  # Deployment and utility scripts
├── docs/                     # Documentation
├── tests/                    # Integration tests
├── docker/                   # Docker configurations
└── stellar-config/          # Stellar network configurations
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Rust (for Soroban contracts)
- Docker (optional)
- Stellar wallet (Freighter, Albedo, etc.)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/olaleyeolajide81-sketch/CrowdFundX.git
cd CrowdFundX
```

2. **Install dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install contract dependencies
cd ../smart-contracts
cargo build
```

3. **Environment setup**
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

4. **Deploy smart contracts**
```bash
cd scripts
node deploy_contracts.js --network testnet
```

5. **Start the development servers**
```bash
# Start backend
cd backend
npm run dev

# Start frontend (in another terminal)
cd frontend
npm start
```

## 📚 Documentation

- [Project Breakdown](./CrowdFundX_Project_Breakdown.md) - Detailed project overview
- [Smart Contracts](./CrowdFundX_Stellar_Smart_Contracts.md) - Stellar contract documentation
- [API Reference](./docs/api_reference.md) - Backend API documentation
- [User Guide](./docs/user_guide.md) - Platform usage guide

## 🔧 Development

### Smart Contract Development

Contracts are written in Rust using Soroban:

```bash
cd smart-contracts
cargo build --target wasm32-unknown-unknown
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/contract.wasm
```

### Backend Development

Node.js API with Express:

```bash
cd backend
npm run dev        # Development server
npm test          # Run tests
npm run build     # Production build
```

### Frontend Development

React application:

```bash
cd frontend
npm start         # Development server
npm test          # Run tests
npm run build     # Production build
```

## 🧪 Testing

### Run all tests
```bash
npm run test:all
```

### Contract tests
```bash
cd smart-contracts
cargo test
```

### API tests
```bash
cd backend
npm run test:api
```

### E2E tests
```bash
cd tests/e2e_tests
npm test
```

## 🚀 Deployment

### Smart Contracts
```bash
cd scripts
node deploy_contracts.js --network mainnet
```

### Backend
```bash
cd backend
npm run build
docker build -t crowdfundx-backend .
docker push your-registry/crowdfundx-backend
```

### Frontend
```bash
cd frontend
npm run build
# Deploy to Vercel, Netlify, or your preferred hosting
```

## 🔐 Security

- Smart contracts audited by [Security Firm]
- Multi-signature wallet support
- KYC/AML compliance integration
- Regular security updates and patches

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@crowdfundx.io
- 💬 Discord: [Join our community](https://discord.gg/crowdfundx)
- 📖 Documentation: [docs.crowdfundx.io](https://docs.crowdfundx.io)

## 🙏 Acknowledgments

- Stellar Development Foundation for the amazing blockchain infrastructure
- Soroban team for the smart contract platform
- Our amazing community and contributors

---

Built with ❤️ on Stellar
