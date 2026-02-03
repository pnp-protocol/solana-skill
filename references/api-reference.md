# PNP SDK API Reference (Solana)

Complete API documentation for the PNP Protocol SDK on Solana.

## Installation

```bash
npm install pnp-sdk @solana/web3.js
```

## PNPClient

Main entry point for all operations.

```typescript
import { PNPClient } from "pnp-sdk";

// Read-only client
const readOnlyClient = new PNPClient("https://api.mainnet-beta.solana.com");

// Client with signing capabilities
const client = new PNPClient(
  "https://api.mainnet-beta.solana.com",
  process.env.PRIVATE_KEY  // base58 encoded private key
);
```

## Market Creation

### createMarket (V2 AMM)

Create a new V2 AMM prediction market.

```typescript
import { PublicKey } from "@solana/web3.js";

const { market, signature } = await client.market.createMarket({
  question: "Will X happen?",
  endTime: BigInt(Math.floor(Date.now() / 1000) + 86400 * 7),
  initialLiquidity: 100_000_000n, // 100 USDC (6 decimals)
  baseMint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
});
```

**Returns:**
- `market`: Market PublicKey
- `signature`: Transaction signature

### createP2PMarketGeneral

Create a P2P (peer-to-peer) prediction market.

```typescript
const { market, signature } = await client.createP2PMarketGeneral({
  question: "Will X happen?",
  initialAmount: 1_000_000n,
  side: "yes", // or "no"
  creatorSideCap: 5_000_000n,
  endTime: BigInt(Math.floor(Date.now() / 1000) + 86400 * 7),
  collateralTokenMint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
});
```

## Market Info

### getMarketInfo

Get market details.

```typescript
const info = await client.getMarketInfo(marketPubkey);
// Returns:
// {
//   endTime: bigint,
//   isSettled: boolean,
//   yesWinner: boolean,
//   collateralMint: PublicKey,
//   ...
// }
```

### getMarketPriceV2

Get current YES/NO token prices.

```typescript
const prices = await client.getMarketPriceV2(marketPubkey);
// Returns:
// {
//   yesPrice: number,  // e.g., 0.65
//   noPrice: number,   // e.g., 0.35
// }
```

## Trading Module

### buyTokensUsdc

Buy outcome tokens with USDC collateral.

```typescript
const { signature } = await client.trading.buyTokensUsdc({
  market: marketPubkey,
  buyYesToken: true,  // or false for NO
  amountUsdc: 10,     // 10 USDC
});
```

### sellTokensUsdc

Sell outcome tokens for USDC collateral.

```typescript
const { signature } = await client.trading.sellTokensUsdc({
  market: marketPubkey,
  sellYesToken: true,
  amountTokens: 10_000_000_000_000_000_000n, // 10 tokens (18 decimals)
});
```

### tradeP2PMarket

Trade on P2P markets.

```typescript
const { signature } = await client.tradeP2PMarket({
  market: marketPubkey,
  side: "yes",
  amount: 10_000_000n,
});
```

## Settlement

### settleMarket

Settle a market with the winning outcome (for custom oracle markets).

```typescript
const { signature } = await client.settleMarket({
  market: marketPubkey,
  yesWinner: true,
});
```

### setMarketResolvable

Enable resolution for custom oracle markets (15-minute buffer required).

```typescript
const { signature } = await client.setMarketResolvable({
  market: marketPubkey,
  resolvable: true,
});
```

## Redemption

### redeemPosition

Redeem winning tokens for collateral.

```typescript
const { signature } = await client.redeemPosition(marketPubkey);
```

## Token Addresses (Solana Mainnet)

| Token | Address | Decimals |
|-------|---------|----------|
| USDC | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` | 6 |
| USDT | `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` | 6 |
| SOL (wrapped) | `So11111111111111111111111111111111111111112` | 9 |

## Error Handling

```typescript
try {
  await client.market.createMarket({ ... });
} catch (error: any) {
  if (error.message.includes("insufficient funds")) {
    // Not enough SOL or collateral
  } else if (error.message.includes("Blockhash")) {
    // Transaction expired, retry
  } else if (error.message.includes("TokenAccountNotFound")) {
    // Need to create ATA first
  }
}
```

## RPC Providers

For production, use dedicated RPC:

```bash
# Helius
export RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

# QuickNode
export RPC_URL=https://your-endpoint.solana-mainnet.quiknode.pro/YOUR_KEY

# Alchemy
export RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY
```
