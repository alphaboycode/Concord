import { defineChain } from "viem";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

/**
 * BotChain Testnet Definition
 * Chain ID: 968
 * Native Currency: BOT (18 Decimals)
 * RPC: https://rpc.bohr.life
 * Explorer: https://scan.bohr.life
 */
export const botchain = defineChain({
  id: 968,
  name: "BotChain Testnet",
  nativeCurrency: {
    name: "BOT",
    symbol: "BOT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.bohr.life"],
    },
  },
  blockExplorers: {
    default: {
      name: "BotChain Scan",
      url: "https://scan.bohr.life",
    },
  },
  testnet: true,
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
// Replace the address below with your deployed ConcordVoting address.
// LINE 49: Update this value after running `forge script script/Deploy.s.sol ...`
// =============================================================================
export const CONTRACT_ADDRESS = "0xcEEfCA9caAFB95cdC6CC467A290C2de02E37224B" as `0x${string}`;

/**
 * Explorer URL helpers
 */
export const txUrl = (hash: string): string => `https://scan.bohr.life/tx/${hash}`;
export const addressUrl = (addr: string): string => `https://scan.bohr.life/address/${addr}`;

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
    [botchain.id]: http("https://rpc.bohr.life"),
    [anvil.id]: http("http://127.0.0.1:8545"),
  },
});
