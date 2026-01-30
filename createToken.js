import {
  Connection,
  Keypair,
  clusterApiUrl,
  PublicKey,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import fs from "fs";

// Load wallet keypair
const secretKey = JSON.parse(fs.readFileSync("wallet.json"));
const payer = Keypair.fromSecretKey(Uint8Array.from(secretKey));

// Connect to Solana (devnet)
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

async function createToken() {
  console.log("🚀 Creating token...");

  // Create token mint
  const mint = await createMint(
    connection,
    payer,
    payer.publicKey, // mint authority
    null,             // freeze authority
    9                 // decimals
  );

  console.log("✅ Token Mint:", mint.toBase58());

  // Create token account
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );

  // Mint supply
  const amount = 1_000_000_000; // 1 token (9 decimals)
  await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    payer.publicKey,
    amount
  );

  console.log("💰 Token Account:", tokenAccount.address.toBase58());
  console.log("🎉 Token minted successfully!");
}

createToken();
