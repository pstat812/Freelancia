# Freelancia

A decentralized freelancing platform that connects clients with freelancers through blockchain-based task escrow and AI agents for task management.

## Overview

Freelancia is a decentralized freelancing platform that ensures secure payments by locking funds in smart contracts until work is completed and approved. The platform eliminates trust issues in freelancing by using blockchain technology to ensure both parties fulfill their obligations.

## Key Features

- **Smart Contract Escrow**: Ethereum Sepolia testnet deployment for secure fund management
- **Wallet-Based Authentication**: Seamless Web3 wallet integration for payments
- **Task Marketplace**: Browse and apply for tasks as a freelancer
- **Task Management**: Post tasks and manage submissions as a client
- **AI Agent Verification**: Automated verification of freelancer applications and task submissions using Fetch.ai UAgents
- **PYUSD Payments**: Support for PayPal USD stablecoin for worldwide payments
- **Automated Workflow**: Client deposits funds upfront, freelancers submit work with confidence, and payments are released upon approval

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS 4** for styling
- **shadcn/ui** components for polished interface
- **Ethers.js 6** for wallet connections and smart contract interactions
- **Framer Motion** for animations
- **React Router** for navigation

### Smart Contracts
- **Solidity 0.8.28**
- **Hardhat** for development and deployment
- **OpenZeppelin** contracts for security standards
- **TypeChain** for type-safe contract interactions
- Deployed on **Ethereum Sepolia Testnet**

### Backend
- **Supabase** for database management
- **PostgreSQL** for storing agent interactions and work submissions
- **Python 3** with Flask for API server
- **UAgents** (Fetch.ai) for AI agent system

### AI Agents
- Client agent for task verification
- Freelancer agent for application and submission processing
- ASI SDK integration for intelligent decision making

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- MetaMask or compatible Web3 wallet
- Ethereum Sepolia testnet ETH
- PYUSD tokens on Sepolia testnet

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd Freelancia
```

### Frontend Setup

```bash
npm install
```

Create `.env` file in root directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
TASK_ESCROW_ADDRESS=deployed_contract_address
PYUSD_TOKEN_ADDRESS=0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
SEPOLIA_RPC_URL=your_sepolia_rpc_url
SEPOLIA_PRIVATE_KEY=your_private_key
```

### Smart Contract Setup

Compile contracts:

```bash
npx hardhat compile
```

Deploy to Sepolia:

```bash
npx hardhat ignition deploy ignition/modules/TaskEscrow.ts --network sepolia
```

### AI Agent Setup

```bash
cd agent
pip install -r requirements.txt
```

Create `.env` file in agent directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
ASI_API_KEY=your_asi_key
```

## Usage

### Start Development Server

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

### Start AI Agents

```bash
cd agent
python server.py
```

## Project Structure

```
Freelancia/
├── src/
│   ├── components/        # UI components
│   ├── pages/            # Route pages
│   ├── services/         # API and blockchain services
│   ├── contexts/         # React contexts
│   └── config/           # Configuration files
├── contracts/            # Solidity smart contracts
├── agent/               # Python AI agent system
│   ├── client_agent.py
│   ├── freelancer_agent.py
│   └── server.py
├── ignition/            # Hardhat deployment modules
├── types/               # TypeScript type definitions
└── sql/                 # Database schema
```