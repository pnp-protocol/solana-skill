# PNP Markets - Solana Prediction Markets

Create and trade prediction markets on Solana with any SPL token collateral.

## Quick Start

```bash
cd scripts
npm install

# Set environment
export PRIVATE_KEY=<your_solana_private_key>
export RPC_URL=https://api.mainnet-beta.solana.com

# Create a market
npx ts-node create-market.ts \
  --question "Will BTC hit $100k?" \
  --duration 168 \
  --liquidity 100

# Trade on a market
npx ts-node trade.ts --buy --market <address> --outcome YES --amount 10

# Check prices
npx ts-node trade.ts --info --market <address>
```

## Features

- **V2 AMM Markets**: Automated market making with virtual liquidity
- **P2P Markets**: Direct peer-to-peer betting
- **Any SPL Token**: Use USDC, USDT, SOL, or custom tokens as collateral
- **Fast & Cheap**: Solana's sub-second finality and low fees

## Documentation

- [SKILL.md](SKILL.md) - Complete usage guide
- [references/api-reference.md](references/api-reference.md) - SDK API documentation
- [references/examples.md](references/examples.md) - Code examples
- [references/use-cases.md](references/use-cases.md) - Use case patterns

## Requirements

- Node.js 18+
- Solana wallet with SOL for fees
- Collateral tokens (USDC, etc.)
