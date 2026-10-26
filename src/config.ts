import { defineChain } from "viem";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

/**
 * BotChain Mainnet Definition
 * Chain ID: 677
 * Native Currency: BOT (18 Decimals)
 * RPC: https://rpc.botchain.ai
 * Explorer: https://scan.botchain.ai
 */
export const botchain = defineChain({
  id: 677,
  name: "BotChain Mainnet",
  nativeCurrency: {
    name: "BOT",
    symbol: "BOT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.botchain.ai"],
    },
  },
  blockExplorers: {
    default: {
      name: "BOTScan",
      url: "https://scan.botchain.ai",
    },
  },
  testnet: false,
});

/**
 * Local Anvil Chain for local development testing
 */
export const anvil = defineChain({
  id: 31337,
  name: "Anvil Local",
  nativeCurrency: {
    name: "BOT",
    symbol: "BOT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
  },
  testnet: true,
});

// =============================================================================
// CONTRACT CONFIGURATION
// Deployed ConcordVoting on BotChain Mainnet (Chain ID: 677)
// =============================================================================
export const CONTRACT_ADDRESS = "0xD84406d900abae0d6C572a5ae20f21c04Fd9AB49" as `0x${string}`;

/**
 * Explorer URL helpers
 */
export const txUrl = (hash: string): string => `https://scan.botchain.ai/tx/${hash}`;
export const addressUrl = (addr: string): string => `https://scan.botchain.ai/address/${addr}`;

/**
 * Wagmi Client Configuration
 */
export const wagmiConfig = createConfig({
  chains: [botchain, anvil],
  connectors: [
    injected({
      target: "metaMask",
    }),
  ],
  transports: {
    [botchain.id]: http("https://rpc.botchain.ai"),
    [anvil.id]: http("http://127.0.0.1:8545"),
  },
});
