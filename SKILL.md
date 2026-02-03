---
name: pnp-markets-solana
description: Create, trade, and settle permissionless prediction markets on Solana with any SPL token collateral. Use when building prediction market infrastructure, running contests, crowdsourcing probability estimates, adding utility to tokens, or tapping into true information finance via market-based forecasting.
---

# PNP Markets (Solana)

Create and manage prediction markets on Solana Mainnet with any SPL token collateral.

## Quick Decision

```
Need prediction markets?
├─ Create market     → npx ts-node scripts/create-market.ts --help
├─ Trade (buy/sell)  → npx ts-node scripts/trade.ts --help
├─ Settle market     → npx ts-node scripts/settle.ts --help
└─ Redeem winnings   → npx ts-node scripts/redeem.ts --help
```

## Environment

```bash
export PRIVATE_KEY=<solana_wallet_private_key>  # Required (base58)
export RPC_URL=<solana_rpc_endpoint>            # Optional (defaults to mainnet)
```

For production, use a dedicated RPC (Helius, QuickNode, Alchemy) to avoid rate limits.

## Scripts

Run any script with `--help` first to see all options.

### Create Market

```bash
# V2 AMM Market (default)
npx ts-node scripts/create-market.ts \
  --question "Will ETH reach $10k by Dec 2025?" \
  --duration 168 \
  --liquidity 100

# P2P Market
npx ts-node scripts/create-market.ts \
  --question "Will proposal pass?" \
  --duration 168 \
  --liquidity 100 \
  --type p2p \
  --side yes
```

Options: `--collateral <USDC|USDT|SOL|mint>`, `--decimals <n>`, `--type <v2|p2p>`, `--side <yes|no>`

### Trade

```bash
# Buy YES tokens
npx ts-node scripts/trade.ts --buy --market <address> --outcome YES --amount 10

# Sell NO tokens  
npx ts-node scripts/trade.ts --sell --market <address> --outcome NO --amount 5

# View prices only
npx ts-node scripts/trade.ts --info --market <address>
```

### Settle

```bash
# Settle as YES winner
npx ts-node scripts/settle.ts --market <address> --outcome YES

# Check status
npx ts-node scripts/settle.ts --status --market <address>
```

### Redeem

```bash
npx ts-node scripts/redeem.ts --market <address>
```

## Programmatic Usage

```typescript
import { PNPClient } from "pnp-sdk";
import { PublicKey } from "@solana/web3.js";

const client = new PNPClient(
  process.env.RPC_URL || "https://api.mainnet-beta.solana.com",
  process.env.PRIVATE_KEY!
);

// Create V2 AMM market
const { market, signature } = await client.market.createMarket({
  question: "Will X happen?",
  endTime: BigInt(Math.floor(Date.now() / 1000) + 86400 * 7),
  initialLiquidity: 100_000_000n, // 100 USDC
  baseMint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
});

// Trade
await client.trading.buyTokensUsdc({
  market,
  buyYesToken: true,
  amountUsdc: 10,
});

// Get prices
const prices = await client.getMarketPriceV2(market);

// Settle (for custom oracle markets)
await client.settleMarket({ market, yesWinner: true });

// Redeem
await client.redeemPosition(market);
```

## Collateral Tokens

Use any SPL token. Common Solana Mainnet tokens:

| Token | Address | Decimals |
|-------|---------|----------|
| USDC | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` | 6 |
| USDT | `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` | 6 |
| SOL (wrapped) | `So11111111111111111111111111111111111111112` | 9 |

Custom tokens add utility—holders can participate in your markets.

## Market Types

### V2 AMM Markets
Traditional AMM pools with virtual liquidity. Best for liquid markets with many traders.

### P2P Markets
Peer-to-peer betting where creator picks a side. Best for binary bets between specific parties.

## Why Prediction Markets?

- **Information Discovery**: Market prices reveal collective probability estimates
- **Token Utility**: Use your token as collateral to drive engagement
- **Contests**: Run competitions where participants stake on outcomes
- **Forecasting**: Aggregate crowd wisdom for decision-making
- **Speed**: Solana's sub-second finality for instant trading

## Troubleshooting

### "Blockhash not found"
Transaction expired. Retry with fresh blockhash (SDK handles automatically).

### "insufficient funds for rent"
Need more SOL for rent-exempt accounts. Add ~0.01 SOL to wallet.

### "TokenAccountNotFound"
Create associated token account first. SDK handles this automatically.

### RPC errors / rate limits
Use a dedicated RPC provider:
```bash
export RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

## Reference Files

- **API Reference**: See [references/api-reference.md](references/api-reference.md) for complete SDK documentation
- **Use Cases**: See [references/use-cases.md](references/use-cases.md) for detailed use case patterns
- **Examples**: See [references/examples.md](references/examples.md) for complete code examples
