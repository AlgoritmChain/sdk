import express from "express";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";

import {
  Connection,
  Keypair,
  PublicKey,
} from "@solana/web3.js";

import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Load wallet
const secretKey = JSON.parse(fs.readFileSync("wallet.json"));
const payer = Keypair.fromSecretKey(Uint8Array.from(secretKey));

// Solana connection
const connection = new Connection(process.env.RPC_URL, "confirmed");

// Create Token Endpoint
app.post("/create-token", async (req, res) => {
  try {
    const { supply, decimals } = req.body;

    if (!supply) {
      return res.status(400).json({ error: "Supply required" });
    }

    console.log("🚀 Creating token...");

    const mint = await createMint(
      connection,
      payer,
      payer.publicKey,
      null,
      decimals || 9
    );

    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
    );

    await mintTo(
      connection,
      payer,
      mint,
      tokenAccount.address,
      payer.publicKey,
      supply * Math.pow(10, decimals || 9)
    );

    res.json({
      success: true,
      mint: mint.toBase58(),
      tokenAccount: tokenAccount.address.toBase58(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Token creation failed" });
  }
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`⚡ Algoritm API running on port ${process.env.PORT}`);
});
