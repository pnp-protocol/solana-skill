#!/usr/bin/env npx ts-node
/**
 * Create a prediction market on Solana
 * Run with --help for usage
 */

import { PNPClient } from "pnp-sdk";
import { PublicKey } from "@solana/web3.js";

// Token addresses on Solana Mainnet
const TOKENS: Record<string, { address: string; decimals: number }> = {
  USDC: { address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6 },
  USDT: { address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6 },
  SOL: { address: "So11111111111111111111111111111111111111112", decimals: 9 },
};

interface Args {
  question: string;
  durationHours: number;
  liquidity: string;
  collateral: string;
  decimals?: number;
  help?: boolean;
  marketType: "v2" | "p2p";
  side: "yes" | "no";
}

function printHelp(): void {
  console.log(`
PNP Markets (Solana) - Create Prediction Market

USAGE:
  npx ts-node create-market.ts [OPTIONS]

REQUIRED:
  --question <string>       The prediction question
  --duration <hours>        Trading duration in hours
  --liquidity <amount>      Initial liquidity amount

OPTIONAL:
  --collateral <token>      Collateral token: USDC (default), USDT, SOL, or mint address
  --decimals <number>       Token decimals (auto-detected for known tokens)
  --type <v2|p2p>           Market type: v2 (AMM, default) or p2p
  --side <yes|no>           For P2P markets only: which side to take (default: yes)
  --help                    Show this help message

ENVIRONMENT:
  PRIVATE_KEY               Solana wallet private key (base58 encoded)
  RPC_URL                   Solana RPC endpoint (optional, defaults to mainnet)

EXAMPLES:
  # Create V2 AMM market with USDC (default)
  npx ts-node create-market.ts \\
    --question "Will ETH reach $10k by Dec 2025?" \\
    --duration 168 \\
    --liquidity 100

  # Create P2P market betting YES
  npx ts-node create-market.ts \\
    --question "Will our token hit 1000 holders?" \\
    --duration 720 \\
    --liquidity 1000 \\
    --type p2p \\
    --side yes

  # Create market with custom token
  npx ts-node create-market.ts \\
    --question "Will proposal pass?" \\
    --duration 168 \\
    --liquidity 1000 \\
    --collateral <mint_address> \\
    --decimals 9
`);
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const parsed: Partial<Args> = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--help":
      case "-h":
        parsed.help = true;
        break;
      case "--question":
        parsed.question = args[++i];
        break;
      case "--duration":
        parsed.durationHours = parseInt(args[++i], 10);
        break;
      case "--liquidity":
        parsed.liquidity = args[++i];
        break;
      case "--collateral":
        parsed.collateral = args[++i];
        break;
      case "--decimals":
        parsed.decimals = parseInt(args[++i], 10);
        break;
      case "--type":
        parsed.marketType = args[++i] as "v2" | "p2p";
        break;
      case "--side":
        parsed.side = args[++i]?.toLowerCase() as "yes" | "no";
        break;
    }
  }

  return {
    question: parsed.question || "",
    durationHours: parsed.durationHours || 0,
    liquidity: parsed.liquidity || "0",
    collateral: parsed.collateral || "USDC",
    decimals: parsed.decimals,
    help: parsed.help,
    marketType: parsed.marketType || "v2",
    side: parsed.side || "yes",
  };
}

async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  // Validate required args
  if (!args.question) {
    console.error("Error: --question is required");
    printHelp();
    process.exit(1);
  }
  if (!args.durationHours || args.durationHours <= 0) {
    console.error("Error: --duration must be a positive number");
    process.exit(1);
  }
  if (!args.liquidity || parseFloat(args.liquidity) <= 0) {
    console.error("Error: --liquidity must be a positive number");
    process.exit(1);
  }
  if (!process.env.PRIVATE_KEY) {
    console.error("Error: PRIVATE_KEY environment variable is required");
    process.exit(1);
  }

  // Resolve collateral token
  let collateralMint: PublicKey;
  let decimals: number;

  if (TOKENS[args.collateral.toUpperCase()]) {
    const token = TOKENS[args.collateral.toUpperCase()];
    collateralMint = new PublicKey(token.address);
    decimals = args.decimals ?? token.decimals;
  } else {
    try {
      collateralMint = new PublicKey(args.collateral);
      decimals = args.decimals ?? 9;
    } catch {
      console.error(`Error: Invalid token "${args.collateral}". Use USDC, USDT, SOL, or a valid mint address.`);
      process.exit(1);
    }
  }

  // Initialize client
  const rpcUrl = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
  const client = new PNPClient(rpcUrl, process.env.PRIVATE_KEY);

  // Calculate parameters
  const endTime = BigInt(Math.floor(Date.now() / 1000) + args.durationHours * 3600);
  const liquidityAmount = BigInt(Math.floor(parseFloat(args.liquidity) * Math.pow(10, decimals)));

  console.log("\n🎯 Creating Prediction Market on Solana\n");
  console.log(`Question:    ${args.question}`);
  console.log(`Duration:    ${args.durationHours} hours`);
  console.log(`End Time:    ${new Date(Number(endTime) * 1000).toISOString()}`);
  console.log(`Liquidity:   ${args.liquidity} tokens`);
  console.log(`Collateral:  ${collateralMint.toBase58()}`);
  console.log(`Market Type: ${args.marketType.toUpperCase()}`);
  if (args.marketType === "p2p") {
    console.log(`Side:        ${args.side.toUpperCase()}`);
  }
  console.log("");

  try {
    let marketAddress: string;
    let signature: string;

    if (args.marketType === "p2p") {
      // Create P2P market
      const result = await client.createP2PMarketGeneral({
        question: args.question,
        initialAmount: liquidityAmount,
        side: args.side,
        creatorSideCap: liquidityAmount * 5n, // 5x cap
        endTime,
        collateralTokenMint: collateralMint,
      });
      marketAddress = result.market;
      signature = result.signature;
    } else {
      // Create V2 AMM market
      const result = await client.market!.createMarket({
        question: args.question,
        endTime,
        initialLiquidity: liquidityAmount,
        baseMint: collateralMint,
      });
      marketAddress = result.market.toBase58();
      signature = result.signature || "";
    }

    console.log("✅ Market Created!\n");
    console.log(`Market:    ${marketAddress}`);
    console.log(`Signature: ${signature}`);
    console.log(`\nSolscan:   https://solscan.io/tx/${signature}`);

    // Output JSON for programmatic use
    console.log("\n--- JSON OUTPUT ---");
    console.log(JSON.stringify({
      market: marketAddress,
      signature,
      endTime: endTime.toString(),
      marketType: args.marketType,
    }, null, 2));

  } catch (error: any) {
    console.error("\n❌ Failed:", error.message);
    process.exit(1);
  }
}

main();
