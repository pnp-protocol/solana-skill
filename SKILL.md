---
name: pnp-markets-solana
description: Create, trade, and settle permissionless prediction markets on Solana Mainnet with any SPL token collateral. Use when building prediction market infrastructure, running contests, crowdsourcing probability estimates, adding utility to tokens, or tapping into true information finance via market-based forecasting.
---

# PNP Markets (Solana)

Create and manage prediction markets on Solana Mainnet with any SPL token collateral. Optimized for high-throughput, low-latency, and permissionless operation.

## 🏗️ Market Creation Flow

Solana prediction markets support two primary architectures:

1. **V2 AMM Markets (Default)**: Use Automated Market Makers with virtual liquidity. Best for publicly traded markets.
2. **P2P Markets**: Direct peer-to-peer betting where the creator takes one side. Best for private or specific bets.

### Quick Start (CLI)

```bash
# V2 AMM Market (using 100 USDC liquidity)
npx ts-node scripts/create-market.ts \
  --question "Will Solana hit $300 in 2026?" \
  --duration 720 \
  --liquidity 100

# P2P Market (Betting YES with 50 USDC)
npx ts-node scripts/create-market.ts \
  --question "Will our team win the hackathon?" \
  --duration 168 \
  --liquidity 50 \
  --type p2p \
  --side yes
```

## ⚙️ Environment Configuration

Ensure your environment variables are set before running scripts:

```bash
export PRIVATE_KEY=<base58_private_key>  # Required for signing transactions
export RPC_URL=https://api.mainnet-beta.solana.com # Recommended: QuickNode/Helius
```

## 🛠️ Core Scripts usage

### 1. Market Operations (`create-market.ts`)
Creates a new market account on-chain.
- **Parameters**: `--question`, `--duration` (hours), `--liquidity`, `--type` (v2|p2p), `--collateral` (USDC|SOL).
- **Output**: Returns the `Market Address` and `Transaction Signature`.

### 2. Trading (`trade.ts`)
Swap collateral for YES/NO outcome tokens.
- **Buy**: `npx ts-node scripts/trade.ts --buy --market <address> --outcome YES --amount 10`
- **Info**: `npx ts-node scripts/trade.ts --info --market <address>` (Fetches current prices)

### 3. Settlement (`settle.ts`)
Determines the winner. Only callable by the designated oracle (usually the market creator).
- **Action**: `npx ts-node scripts/settle.ts --market <address> --outcome YES`

### 4. Redemption (`redeem.ts`)
Convert winning outcome tokens back into collateral.
- **Action**: `npx ts-node scripts/redeem.ts --market <address>`

## 🪙 Supported Collateral

Markets can be created with any SPL token. Pre-configured aliases:

| Alias | Mint Address | Decimals |
|-------|--------------|----------|
| **USDC** | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` | 6 |
| **SOL** | `So11111111111111111111111111111111111111112` | 9 |
| **USDT** | `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` | 6 |

## 💡 Troubleshooting (Solana Specific)

- **Simulation Failed (0x1770)**: Usually means `InvalidLiquidity`. Ensure your liquidity amount is above the minimum (usually 1 USDC or 0.05 SOL).
- **Insufficient Funds for Rent**: Creating a market accounts for ~0.01-0.02 SOL in rent. Keep at least 0.05 SOL in the wallet.
- **Blockhash not found**: Transaction took too long to reach the lead. The SDK automatically retries, but a faster RPC helps.

## 📚 Resources

- **Mainnet Explorer**: [Solscan](https://solscan.io)
- **SDK Documentation**: [references/api-reference.md](references/api-reference.md)
- **Advanced Examples**: [references/examples.md](references/examples.md)
