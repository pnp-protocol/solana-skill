# PNP Markets - Solana Prediction Markets

Create and managed prediction markets on Solana with any SPL token collateral. This skill is built using the [PNP SDK](https://www.npmjs.com/package/pnp-sdk) for Solana.

## 🚀 Quick Start

```bash
cd scripts
npm install

# Set environment
export PRIVATE_KEY=<your_solana_private_key>
export RPC_URL=https://api.mainnet-beta.solana.com

# Create a market (V2 AMM)
npx ts-node create-market.ts \
  --question "Will SOL hit $250 by end of Feb?" \
  --duration 720 \
  --liquidity 100

# Trade on a market
npx ts-node trade.ts --buy --market <address> --outcome YES --amount 10

# Check prices
npx ts-node trade.ts --info --market <address>
```

## ✨ Features

- **V2 AMM Markets**: Automated market making with virtual liquidity for instant trading.
- **P2P Markets**: Direct peer-to-peer betting with custom sides and caps.
- **Any SPL Token**: Use USDC, USDT, SOL, or any custom SPL token as collateral.
- **High Performance**: Leverages Solana's sub-second finality and ultra-low fees.
- **Custom Oracles**: Support for setting up and settling markets with custom oracle logic.

## 📊 Live Verification (Mainnet)

This codebase has been verified on Solana Mainnet:
- **Test Market**: `HxnpHygK1v7TqodWqAv6RvcEiK9zxAgw5jPZ6rskgj2E`
- **Verification Signature**: [3Uo6Z6NN...EMY1](https://solscan.io/tx/3Uo6Z6NN3hfgK9o2j6kLUjLpx7UUVhxyMTPPdGMw9dhrMZb17pXAwio1omcwdVJH7ijEr692FnqevMAMH3K8EMY1)

## 📖 Documentation

- [SKILL.md](SKILL.md) - **Complete Usage Guide** (Setup, Scripts, Troubleshooting)
- [references/api-reference.md](references/api-reference.md) - SDK API Documentation
- [references/examples.md](references/examples.md) - Advanced Code Examples
- [references/use-cases.md](references/use-cases.md) - Prediction Market Patterns

## 🛠️ Requirements

- **Node.js**: 18.x or higher
- **Wallet**: Solana wallet with SOL for transaction fees
- **Collateral**: USDC or other SPL tokens for market liquidity

---
Built with 💜 by PNP Protocol.
