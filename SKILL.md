---
name: pnp-markets-solana
description: Create, trade, and settle permissionless prediction markets on Solana Mainnet with any SPL token collateral. Use when building prediction market infrastructure, running contests, crowdsourcing probability estimates, adding utility to tokens, creating social media markets (Twitter/YouTube), or tapping into true information finance via market-based forecasting.
compatibility: Requires Node.js 18+, network access (Solana RPC), and a funded Solana wallet with SOL for transaction fees
metadata:
  author: pnp-protocol
  version: "1.0.0"
---

# PNP Markets (Solana)

Create and manage prediction markets on Solana Mainnet with any SPL token collateral. Optimized for high-throughput, low-latency, and permissionless operation.

## When to Use This Skill

Use this skill when the user wants to:
- **Create prediction markets** on Solana (V2 AMM or P2P)
- **Trade on markets** (buy/sell YES/NO outcome tokens)
- **Settle markets** as an oracle after the trading period ends
- **Redeem winning positions** after settlement
- **Create social media markets** (Twitter engagement, YouTube views)
- **Use custom tokens** as prediction market collateral
- **Build info finance infrastructure** with autonomous market resolution

## Prerequisites

Before running any scripts, ensure you have:

1. **Solana Wallet**: Base58-encoded private key with SOL for fees (~0.05 SOL minimum)
2. **Collateral Tokens**: USDC, USDT, SOL, or custom SPL token for market liquidity
3. **RPC Endpoint**: Mainnet RPC URL (public or dedicated like Helius/QuickNode)

```bash
# Install dependencies
cd scripts && npm install

# Set environment variables
export PRIVATE_KEY=<base58_private_key>
export RPC_URL=https://api.mainnet-beta.solana.com  # or dedicated RPC
```

---

## Market Creation Flow

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

## Core Scripts

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

---

## Custom Oracle Markets (For AI Agents)

Custom oracles let AI agents become their own market resolvers—bypassing PNP's global oracle entirely. This is the key primitive for autonomous agent-driven prediction markets.

### Why Custom Oracles?

| Use Case | Description |
|----------|-------------|
| **AI Agents** | Build autonomous agents that create and resolve markets based on real-world data feeds |
| **Private Forecasting** | Run internal prediction markets with proprietary resolution logic |
| **Custom Data Sources** | Integrate any API—sports feeds, weather data, on-chain events, social metrics |

### Custom Oracle Functions

#### `createMarketWithCustomOracle`

**When to use**: Call this when you want your AI agent to have full control over market resolution. Your agent's wallet becomes the oracle—only it can settle the market.

**Why**: Bypasses PNP's global AI oracle. Essential for autonomous agents that need to resolve markets based on their own data sources or logic.

```typescript
await client.createMarketWithCustomOracle({
  question: 'Will BTC hit $150K by Dec 2026?',
  initialLiquidity: 10_000_000n,  // 10 USDC (6 decimals)
  endTime: BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60),
  collateralMint: USDC_MINT,
  settlerAddress: ORACLE_WALLET,  // Your agent's wallet
  yesOddsBps: 5000,  // Optional: 50/50 odds (range: 100-9900)
});
```

#### `setMarketResolvable`

**When to use**: Call this immediately after creating a custom oracle market—within 15 minutes.

**Why**: Markets are created in a frozen state. This activates trading. If not called within 15 minutes, the market is permanently untradeable.

```typescript
await client.setMarketResolvable(marketAddress, true);
```

#### `settleMarket`

**When to use**: Call this after the market's end time when you (as the oracle) know the outcome.

**Why**: Only the designated oracle can settle. This determines which side (YES/NO) wins and allows winners to redeem.

```typescript
await client.settleMarket({
  market: marketAddress,
  yesWinner: true,  // false if NO wins
});
```

> **Critical**: After market creation, you have a **15-minute buffer window** to call `setMarketResolvable(true)`. If not activated, the market is permanently frozen.

---

## Social Media Markets

PNP provides native support for creating prediction markets linked to Twitter/X and YouTube content—ideal for social AI agents.

### Twitter Markets

#### `createMarketTwitter`

**When to use**: Call this when creating a prediction market about tweet engagement (replies, likes, retweets, views).

**Why**: Automatically links the market to a specific tweet. PNP's oracle can track tweet metrics for resolution.

```typescript
await client.createMarketTwitter({
  question: 'Will this tweet cross 5000 replies?',
  tweetUrl: 'https://x.com/username/status/123456789',
  initialLiquidity: 1_000_000n,  // 1 USDC
  endTime: BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60),
  collateralTokenMint: USDC_MINT,
});
```

**Supported URL formats:**
- `https://x.com/username/status/123456789`
- `https://twitter.com/username/status/123456789`

### YouTube Markets

#### `createMarketYoutube`

**When to use**: Call this when creating a prediction market about video performance (views, likes, subscribers).

**Why**: Automatically links the market to a specific YouTube video. PNP's oracle can track video metrics for resolution.

```typescript
await client.createMarketYoutube({
  question: 'Will this video cross 1B views?',
  youtubeUrl: 'https://youtu.be/VIDEO_ID',
  initialLiquidity: 1_000_000n,  // 1 USDC
  endTime: BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60),
  collateralTokenMint: USDC_MINT,
});
```

**Supported URL formats:**
- `https://youtu.be/VIDEO_ID`
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://www.youtube.com/watch?v=VIDEO_ID`

### Social Market Use Cases

- **Engagement Prediction**: Bet on whether a tweet will go viral
- **Content Performance**: Predict video view counts
- **Influencer Markets**: Create markets around creator milestones
- **Trend Detection**: Use market prices as signals for trending content

---

## Supported Collateral

Markets can be created with any SPL token. Pre-configured aliases:

| Alias | Mint Address | Decimals |
|-------|--------------|----------|
| **USDC** | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` | 6 |
| **SOL** | `So11111111111111111111111111111111111111112` | 9 |
| **USDT** | `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` | 6 |

## Script Quick Reference

| Script | Purpose | Key Arguments |
|--------|---------|---------------|
| `create-market.ts` | Create new prediction market | `--question`, `--duration` (hours), `--liquidity`, `--type` (v2/p2p) |
| `trade.ts` | Buy/sell outcome tokens | `--buy`/`--sell`, `--market`, `--outcome` (YES/NO), `--amount` |
| `trade.ts --info` | Check market prices | `--market` (read-only, no wallet needed) |
| `settle.ts` | Resolve market as oracle | `--market`, `--outcome` (YES/NO) |
| `redeem.ts` | Claim winnings after settlement | `--market` |

---

## Common Errors & Recovery

| Error | Cause | Solution |
|-------|-------|----------|
| `0x1770 (InvalidLiquidity)` | Liquidity below minimum | Use ≥1 USDC or ≥0.05 SOL |
| `Insufficient funds for rent` | Not enough SOL for account creation | Ensure ≥0.05 SOL in wallet |
| `Blockhash not found` | Transaction expired before confirmation | Retry; use faster RPC (Helius/QuickNode) |
| `15-minute buffer expired` | Didn't call `setMarketResolvable` in time | Market is permanently frozen; create new one |
| `TokenAccountNotFound` | Missing Associated Token Account | SDK auto-creates, but ensure SOL for rent |
| `Oracle mismatch` | Wrong wallet trying to settle | Only designated oracle can settle |
| `Market not ended` | Trying to settle before end time | Wait until market's `endTime` passes |

---

## SDK Quick Reference

| Method | When to Use |
|--------|-------------|
| `createMarketWithCustomOracle({...})` | When your agent needs to be the oracle and control resolution |
| `setMarketResolvable(market, true)` | Immediately after creating custom oracle market (within 15 min) |
| `settleMarket({market, yesWinner})` | After market ends, to declare the winner as oracle |
| `createMarketTwitter({...})` | When creating markets about tweet engagement |
| `createMarketYoutube({...})` | When creating markets about video performance |
| `market.createMarket({...})` | For standard V2 AMM markets (PNP oracle resolves) |
| `createP2PMarketGeneral({...})` | When taking a position on one side of the bet |
| `trading.buyTokensUsdc({...})` | To buy YES/NO outcome tokens |
| `redeemPosition(market)` | After settlement, to convert winning tokens to collateral |
| `getMarketPriceV2(market)` | To fetch current prices (read-only, no wallet needed) |
| `fetchMarket(market)` | To get on-chain market data |

---

## Resources

- **Mainnet Explorer**: [Solscan](https://solscan.io)
- **PNP SDK Docs**: [https://docs.pnp.exchange/pnp-sdk](https://docs.pnp.exchange/pnp-sdk)
- **SDK Documentation**: [references/api-reference.md](references/api-reference.md)
- **Advanced Examples**: [references/examples.md](references/examples.md)
