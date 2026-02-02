# PNP Markets Skill

Create, trade, and settle **permissionless prediction markets** on Base with any ERC20 collateral. This skill enables AI agents to build prediction market infrastructure, run contests, crowdsource probability estimates, add utility to tokens, and tap into true information finance via market-based forecasting.

## Quick Install for Agents

Incorporate permissionless prediction markets into your agent workflow with either command:

```bash
# Using Skills
npx skills add pnp-protocol/skills

# Using Clawhub
npx clawhub@latest install proxima424/create-prediction-markets
```

## What Are Prediction Markets?

Prediction markets are financial instruments that aggregate collective intelligence into probability estimates. Market prices reveal crowd beliefs about uncertain events, enabling:

- **Information Discovery** — Market prices reveal collective probability estimates
- **Token Utility** — Use your token as collateral to drive engagement
- **Contests** — Run competitions where participants stake on outcomes
- **Forecasting** — Aggregate crowd wisdom for decision-making

## Quick Start

### Environment Setup

```bash
export PRIVATE_KEY=<wallet_private_key>    # Required
export RPC_URL=<base_rpc_endpoint>         # Optional (defaults to public RPC)
```

For production, use a dedicated RPC (Alchemy, QuickNode) to avoid rate limits.

### Decision Tree

```
Need prediction markets?
├─ Create market     → npx ts-node scripts/create-market.ts --help
├─ Trade (buy/sell)  → npx ts-node scripts/trade.ts --help
├─ Settle market     → npx ts-node scripts/settle.ts --help
└─ Redeem winnings   → npx ts-node scripts/redeem.ts --help
```

## Usage Examples

### Create a Market

```bash
npx ts-node scripts/create-market.ts \
  --question "Will ETH reach $10k by Dec 2025?" \
  --duration 168 \
  --liquidity 100
```

Options: `--collateral <USDC|WETH|address>`, `--decimals <n>`

### Trade

```bash
# Buy YES tokens
npx ts-node scripts/trade.ts --buy --condition 0x... --outcome YES --amount 10

# Sell NO tokens  
npx ts-node scripts/trade.ts --sell --condition 0x... --outcome NO --amount 5 --decimals 18

# View prices only
npx ts-node scripts/trade.ts --info --condition 0x...
```

### Settle

```bash
# Settle as YES winner
npx ts-node scripts/settle.ts --condition 0x... --outcome YES

# Check status
npx ts-node scripts/settle.ts --status --condition 0x...
```

### Redeem Winnings

```bash
npx ts-node scripts/redeem.ts --condition 0x...
```

## Programmatic Usage

```typescript
import { PNPClient } from "pnp-evm";
import { ethers } from "ethers";

const client = new PNPClient({
  rpcUrl: process.env.RPC_URL || "https://mainnet.base.org",
  privateKey: process.env.PRIVATE_KEY!,
});

// Create market
const { conditionId } = await client.market.createMarket({
  question: "Will X happen?",
  endTime: Math.floor(Date.now() / 1000) + 86400 * 7,
  initialLiquidity: ethers.parseUnits("100", 6).toString(),
});

// Trade
await client.trading.buy(conditionId, ethers.parseUnits("10", 6), "YES");

// Settle (after endTime)
const tokenId = await client.trading.getTokenId(conditionId, "YES");
await client.market.settleMarket(conditionId, tokenId);

// Redeem
await client.redemption.redeem(conditionId);
```

## Supported Collateral Tokens

Use any ERC20. Common Base Mainnet tokens:

| Token | Address | Decimals |
|-------|---------|----------|
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | 6 |
| WETH | `0x4200000000000000000000000000000000000006` | 18 |
| cbETH | `0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22` | 18 |

Custom tokens add utility—holders can participate in your markets.

## Contract Addresses (Base Mainnet)

| Contract | Address |
|----------|---------|
| PNP Factory | `0x5E5abF8a083a8E0c2fBf5193E711A61B1797e15A` |
| Fee Manager | `0x6f1BffB36aC53671C9a409A0118cA6fee2b2b462` |

## Documentation

- **[API Reference](references/api-reference.md)** — Complete SDK documentation
- **[Use Cases](references/use-cases.md)** — Detailed use case patterns
- **[Examples](references/examples.md)** — Complete code examples

## Troubleshooting

| Error | Solution |
|-------|----------|
| `ERC20: transfer amount exceeds allowance` | Approval transaction hasn't confirmed yet. Wait 5-10 seconds and retry. |
| `Market doesn't exist` | Market creation may have failed or is pending. Verify on BaseScan. |
| `over rate limit` / RPC errors | Use a dedicated RPC provider (`export RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY`) |

## License

MIT
