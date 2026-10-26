# Concord 🏛️

> **Democratic, Gas-Optimized Governance Protocol on BotChain**  
> *One Address, One Vote. Zero Whale Plutocracy. 100% On-Chain Consensus.*

[![BotChain Mainnet](https://img.shields.io/badge/BotChain%20Mainnet-Chain%20677-10B981?style=for-the-badge&logo=ethereum&logoColor=white)](https://scan.botchain.ai/)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.24-38BDF8?style=for-the-badge&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Foundry](https://img.shields.io/badge/Foundry-Tested-F59E0B?style=for-the-badge&logo=gear&logoColor=white)](https://getfoundry.sh/)
[![React + Vite](https://img.shields.io/badge/Frontend-React%20+%20Vite%20+%20Wagmi-8B5CF6?style=for-the-badge&logo=react&logoColor=white)](https://vitejs.dev/)

---

## 🌟 Executive Summary

**Concord** is an on-chain proposal voting dApp and governance protocol built specifically for **BotChain**. Traditional Web3 governance protocols (e.g., standard Compound Governor clones) suffer from two fundamental problems: **whale plutocracy** (where the top 1% of token holders dictate all outcomes) and **prohibitive gas bloat** (unpacked multi-slot storage patterns).

Concord solves this by implementing an egalitarian **1-address-1-vote** governance primitive packed into ultra-efficient 31-byte and 16-byte EVM storage slots, providing up to 70% gas savings without requiring a volatile governance token.

👉 **[Download the Official Pitch Deck (PDF)](./Concord_Pitch_Deck.pdf)**

---

## 🚀 Live BotChain Mainnet Deployment

The Concord voting protocol is live, verified, and executing proposals on **BotChain Mainnet**:

| Parameter | Value |
| :--- | :--- |
| **Network Name** | BotChain Mainnet |
| **Chain ID** | `677` |
| **RPC Endpoint** | `https://rpc.botchain.ai` |
| **Native Currency** | `BOT` (18 decimals, 150M Total Supply) |
| **Official Website** | [https://www.botchain.ai/en/](https://www.botchain.ai/en/) |
| **Block Explorer (BOTScan)** | [https://scan.botchain.ai](https://scan.botchain.ai) |
| **Deployed Contract** | [`0xD84406d900abae0d6C572a5ae20f21c04Fd9AB49`](https://scan.botchain.ai/address/0xD84406d900abae0d6C572a5ae20f21c04Fd9AB49) |
| **Contract Owner** | [`0xeB2b407681D788eDdb88Cd3ae6051dB146d694a1`](https://scan.botchain.ai/address/0xeB2b407681D788eDdb88Cd3ae6051dB146d694a1) |

---

## 📊 Live On-Chain Proposals & Verified Activity

The contract currently hosts 6 live community proposals created across 3 distinct accounts, with 18 verified on-chain votes cast and tallied:

| ID | Proposal Title & Details | Proposer | For | Against | Abstain | Status |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **#1** | **1. Add a community faucet**<br>_Set up a faucet so new users can get test BOT to try the dapp._ | `Wallet 1` (`0xCc7A...F3E4`) | 2 | 0 | 1 | **Active (Quorum Met)** |
| **#2** | **2. Launch a weekly community call**<br>_Hold a weekly voice or video call to discuss updates and answer questions._ | `Wallet 1` (`0xCc7A...F3E4`) | 2 | 1 | 0 | **Active (Quorum Met)** |
| **#3** | **3. Create a bug bounty pool**<br>_Set aside a small fund to reward people who find and report bugs._ | `Wallet 2` (`0xC376...4d5f`) | 2 | 1 | 0 | **Active (Quorum Met)** |
| **#4** | **4. Translate the docs into 3 languages**<br>_Translate the guides and FAQ to make the project easier to join._ | `Wallet 2` (`0xC376...4d5f`) | 2 | 1 | 0 | **Active (Quorum Met)** |
| **#5** | **5. Redesign the project website**<br>_Refresh the website with a cleaner layout and simpler onboarding._ | `Wallet 3` (`0xb439...49Dc`) | 2 | 0 | 1 | **Active (Quorum Met)** |
| **#6** | **6. Hold a hackathon**<br>_Run a 2-week online hackathon with prizes for the best apps built on BotChain._ | `Wallet 3` (`0xb439...49Dc`) | 2 | 1 | 0 | **Active (Quorum Met)** |

---

## ⚙️ Key Protocol Features

### 1. Egalitarian 1-Address-1-Vote Primitives
- Eliminates whale dominance: 1 connected address holds exactly 1 vote per proposal.
- Support for 3 distinct voting choices: `For` (1), `Against` (0), and `Abstain` (2).
- Abstain votes contribute toward meeting quorum thresholds without shifting the binary majority.

### 2. Dual-Track Governance Architecture
- **Mode A: Open Public Voting (Default)**: Any unique wallet holding test BOT for gas can participate immediately. Perfect for open DAO sentiment and feature prioritization.
- **Mode B: Curated Allowlist Committees**: Owner/multi-sig can activate allowlist enforcement (`setAllowlistEnabled(true)`) and batch-grant rights (`setAllowlist(address[], bool)`). Protects sensitive treasury or security allocations against Sybil manipulation.

### 3. Hyper-Optimized Storage Slots (`ConcordVoting.sol`)
EVM storage writes are packed to minimize `SSTORE` overhead:
```
+---------------------------------------------------------------------------------+
| SLOT 0 (31 / 32 Bytes Allocated):                                              |
| proposer (20B) | startTime (4B) | endTime (4B) | finalized (1B) | passed | exists |
+---------------------------------------------------------------------------------+
| SLOT 1 (16 / 32 Bytes Allocated):                                              |
| forVotes (4B)  | againstVotes (4B) | abstainVotes (4B) | quorum (4B)            |
+---------------------------------------------------------------------------------+
| DYNAMIC SLOTS & MAPPINGS:                                                      |
| Slot 2: string title   |   Slot 3: string description                           |
| mapping(uint256 => mapping(address => Receipt))  [Receipt = 2 bytes: bool+enum]|
+---------------------------------------------------------------------------------+
```

### 4. Custom Errors & Gas Optimization
- Zero string error bloat. Uses native Solidity 0.8 custom errors (`ProposalNotFound`, `AlreadyVoted`, `VotingNotStarted`, `VotingEnded`, `InvalidTimeRange`).
- Permissionless settlement: anyone can call `finalizeProposal(uint256)` after `block.timestamp > endTime`.

---

## 💻 Tech Stack

- **Smart Contract:** Solidity `^0.8.24`, OpenZeppelin Contracts v5.0 (`Ownable`), Foundry (`forge-std`, `cast`).
- **Frontend:** React 19, TypeScript, Vite, Wagmi v2, Viem v2, Tailwind CSS.
- **Icons & UI:** Lucide React, JetBrains Mono, Inter typography, WCAG AA accessible contrast.
- **Network:** BotChain Testnet (Chain ID `968`).

---

## 📁 Repository Structure

```
Concord/
├── src/
│   ├── ConcordVoting.sol        # Core voting smart contract
│   ├── config.ts                # Single source of truth (Chain 968, contract, explorer helpers)
│   ├── abi/
│   │   └── Voting.ts            # Complete contract ABI definition
│   ├── components/
│   │   ├── Header.tsx           # Navigation, logo, network pill, wallet connector
│   │   ├── NetworkBanner.tsx    # 1-click network switch/add prompt
│   │   ├── LowBalanceWarning.tsx# Low native BOT gas diagnostics
│   │   ├── ProposalList.tsx     # Filterable proposal dashboard (Active, Passed, Rejected)
│   │   ├── ProposalCard.tsx     # Card view with mini vote progress bars
│   │   ├── ProposalDetail.tsx   # Detailed vote tallies, progress meters, vote buttons
│   │   ├── CreateProposalModal.tsx # Proposal creator form with preview
│   │   └── TransactionToast.tsx # Real-time transaction confirmation toast
│   ├── hooks/
│   │   └── useProposals.ts      # Reactive proposal fetching hook
│   └── App.tsx                  # Root application layout
├── test/
│   └── ConcordVoting.t.sol      # Foundry test suite (unit + property-based fuzz)
├── script/
│   └── Deploy.s.sol             # Foundry broadcast deployment script
├── scripts/
│   ├── execute_instructions.ts  # Multi-wallet automated testnet execution runner
│   └── generate_pitch_deck.py   # Widescreen 16:9 presentation PDF generator
├── Concord_Pitch_Deck.pdf       # 11-slide pitch deck document
├── foundry.toml                 # Foundry configuration file
└── tailwind.config.js           # Civic design system tokens
```

---

## 🛠️ Quickstart & Local Setup

### 1. Prerequisites
- [Foundry](https://getfoundry.sh/) (`forge`, `cast`)
- [Node.js](https://nodejs.org/) (v18+) or [Bun](https://bun.sh/) (v1.1+)

### 2. Smart Contract Testing
Clone the repository and run the Foundry test suite:
```bash
# Compile contracts
forge build

# Run unit tests
forge test

# Run property-based fuzz tests with verbose traces
forge test -vvv --match-test testFuzz
```

### 3. Deploying to BotChain Testnet
```bash
# Using cast wallet:
forge script script/Deploy.s.sol \
  --rpc-url botchain \
  --chain-id 968 \
  --account concord \
  --broadcast
```

### 4. Running the Frontend
The single source of truth for the contract address is located at [`src/config.ts`](./src/config.ts#L58).

```bash
# Install dependencies
bun install   # or npm install

# Start local Vite development server
bun run dev   # or npm run dev

# Build production bundle
bun run build # or npm run build
```

---

## 🔒 Security Review & Sybil Considerations

1. **One-Address-One-Vote Sybil Risk**:
   - In open public mode (Mode A), any address with gas tokens can vote. On testnets or low-fee chains, a malicious actor could spin up multiple addresses to cast duplicate votes.
   - **Mitigations**:
     - **Mode B (Allowlist)**: Restricts voting exclusively to vetted community members, grantees, or core contributors.
     - **Quorum Enforcement**: A minimum participation count is required before any proposal can pass.
     - **Roadmap Integration**: Phase 2 introduces Soulbound NFT credentials (ERC-5192) and Gitcoin Passport / WorldID proof-of-humanity gating.
2. **Double-Voting Prevention**:
   - The contract uses a packed mapping `receipts[proposalId][msg.sender]` and reverts with `AlreadyVoted(proposalId, msg.sender)` if an account votes more than once.
3. **Strict Time Boundaries**:
   - Proposals cannot receive votes prior to `startTime` (`VotingNotStarted`) or after `endTime` (`VotingEnded`).
   - Finalization cannot be called before `endTime` (`VotingNotEnded`).

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
