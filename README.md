# Base Batches & Sessions - Sub-Account and Spend Permission

A comprehensive implementation of Base blockchain's batch transactions, session keys, and spend permissions for secure and efficient on-chain operations.

## 🚀 Features

- **Batch Transactions**: Execute multiple transactions in a single call
- **Session Keys**: Temporary permissions for dApp interactions
- **Spend Permissions**: Granular control over token spending
- **Sub-Account Management**: Create and manage sub-accounts
- **Secure Signing**: Safe transaction signing with proper validation

## 📋 Prerequisites

- Node.js 16+ and npm/yarn
- MetaMask or similar Web3 wallet
- Access to a Base RPC endpoint
- Basic understanding of Ethereum and smart contracts

## 🛠 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Sopiloo/Day-4-Base-Batches-Sessions-sub-Account-and-Spend-Perm.git
   cd Day-4-Base-Batches-Sessions-sub-Account-and-Spend-Perm
   ```

2. Install dependencies for both backend and frontend:
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../base-spend-permission-demo
   npm install
   ```

## ⚙️ Configuration

1. Copy the example environment file and update with your values:
   ```bash
   cp backend/.env.example backend/.env
   cp base-spend-permission-demo/.env.example base-spend-permission-demo/.env.local
   ```

2. Update the following environment variables:
   ```
   PRIVATE_KEY=your_private_key
   RPC_URL=your_base_rpc_url
   SPEND_PERMISSION_MANAGER=0xYourContractAddress
   ```

## 🚦 Usage

### Starting the Backend
```bash
cd backend
node approvePermission.js
```

### Starting the Frontend
```bash
cd base-spend-permission-demo
npm run dev
```

## 📁 Project Structure

```
.
├── backend/                   # Backend services and scripts
│   ├── approvePermission.js   # Spend permission management
│   └── ...
├── base-spend-permission-demo/ # Frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   └── App.jsx           # Main application component
│   └── ...
└── base-subaccount-demo/     # Sub-account management demo
    └── ...
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


