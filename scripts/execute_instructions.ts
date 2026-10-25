import {
  createWalletClient,
  createPublicClient,
  http,
  parseEther,
  formatEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs";
import path from "path";
import { botchain, CONTRACT_ADDRESS } from "../src/config";
import { VotingABI } from "../src/abi/Voting";

// 1. Read .env file directly
const envPath = path.resolve(__dirname, "../.env");
const envContent = fs.readFileSync(envPath, "utf8");

function getEnvVar(name: string): string {
  const match = envContent.match(new RegExp(`^${name}=(.*)$`, "m"));
  if (!match) throw new Error(`Missing ${name} in .env`);
  return match[1].trim();
}

const WALLET_1_KEY = getEnvVar("WALLET_1_PRIVATE_KEY") as `0x${string}`;
const WALLET_2_KEY = getEnvVar("WALLET_2_PRIVATE_KEY") as `0x${string}`;
const WALLET_3_KEY = getEnvVar("WALLET_3_PRIVATE_KEY") as `0x${string}`;

// Concord Deployer / Owner Account
const CONCORD_KEY =
  "0xa2b24d52a50b5f8d6198278b26fe0bda7f9353415315945b320b86b4dfe62f45" as const;

const concordAccount = privateKeyToAccount(CONCORD_KEY);
const wallet1Account = privateKeyToAccount(WALLET_1_KEY);
const wallet2Account = privateKeyToAccount(WALLET_2_KEY);
const wallet3Account = privateKeyToAccount(WALLET_3_KEY);

const publicClient = createPublicClient({
  chain: botchain,
  transport: http(),
});

const concordClient = createWalletClient({
  account: concordAccount,
  chain: botchain,
  transport: http(),
});

const wallet1Client = createWalletClient({
  account: wallet1Account,
  chain: botchain,
  transport: http(),
});

const wallet2Client = createWalletClient({
  account: wallet2Account,
  chain: botchain,
  transport: http(),
});

const wallet3Client = createWalletClient({
  account: wallet3Account,
  chain: botchain,
  transport: http(),
});

// The 6 proposals specified in instructions.txt
const ALL_PROPOSALS = [
  {
    id: 1,
    title: "1. Add a community faucet",
    description:
      "Set up a faucet so new users can get test BOT to try the dapp.",
  },
  {
    id: 2,
    title: "2. Launch a weekly community call",
    description:
      "Hold a weekly voice or video call to discuss updates and answer questions.",
  },
  {
    id: 3,
    title: "3. Create a bug bounty pool",
    description:
      "Set aside a small fund to reward people who find and report bugs.",
  },
  {
    id: 4,
    title: "4. Translate the docs into 3 languages",
    description:
      "Translate the guides and FAQ to make the project easier to join.",
  },
  {
    id: 5,
    title: "5. Redesign the project website",
    description:
      "Refresh the website with a cleaner layout and simpler onboarding.",
  },
  {
    id: 6,
    title: "6. Hold a hackathon",
    description:
      "Run a 2-week online hackathon with prizes for the best apps built on BotChain.",
  },
];

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForTx(hash: `0x${string}`) {
  console.log(`  Tx Hash: ${hash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`  Included in block ${receipt.blockNumber} (status: ${receipt.status})`);
  await sleep(2000);
  return receipt;
}

async function main() {
  console.log("==================================================");
  console.log("EXECUTING instructions.txt ON BOTCHAIN TESTNET");
  console.log("Contract Address:", CONTRACT_ADDRESS);
  console.log("Concord Wallet (Deployer):", concordAccount.address);
  console.log("Wallet 1:", wallet1Account.address);
  console.log("Wallet 2:", wallet2Account.address);
  console.log("Wallet 3:", wallet3Account.address);
  console.log("==================================================");

  const initialBalance = await publicClient.getBalance({
    address: concordAccount.address,
  });
  console.log("Concord Balance:", formatEther(initialBalance), "BOT");

  // Step 1: Send 0.1 BOT each to the 3 wallets
  console.log("\n[Step 1] Sending 0.1 BOT each to Wallet 1, Wallet 2, Wallet 3...");
  const wallets = [
    { num: 1, account: wallet1Account, client: wallet1Client },
    { num: 2, account: wallet2Account, client: wallet2Client },
    { num: 3, account: wallet3Account, client: wallet3Client },
  ];

  for (const w of wallets) {
    const bal = await publicClient.getBalance({ address: w.account.address });
    console.log(
      `Wallet ${w.num} (${w.account.address}) current balance: ${formatEther(bal)} BOT`
    );
    console.log(`Sending 0.1 BOT to Wallet ${w.num}...`);
    const hash = await concordClient.sendTransaction({
      to: w.account.address,
      value: parseEther("0.1"),
    });
    await waitForTx(hash);
  }

  // Step 2: Ensure 6 proposals exist with 2 proposals per wallet
  console.log("\n[Step 2] Checking and Creating Proposals (2 from each wallet)...");

  let currentOwner = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: "owner",
  });
  console.log(`Current contract owner: ${currentOwner}`);

  let proposalCount = Number(
    await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: VotingABI,
      functionName: "proposalCount",
    })
  );
  console.log(`Current on-chain proposal count: ${proposalCount}`);

  // Display existing proposals
  for (let i = 1; i <= proposalCount; i++) {
    const p = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: VotingABI,
      functionName: "getProposal",
      args: [BigInt(i)],
    });
    console.log(`Existing P#${i}: Proposer=${p[0]} Title="${p[1]}"`);
  }

  // We need 6 proposals total.
  // In the current state:
  // P#1: Proposer=Wallet 1, Title="2. Launch a weekly community call"
  // P#2: Proposer=Wallet 2, Title="4. Translate the docs into 3 languages"
  // To reach 2 proposals per wallet:
  // Wallet 1 creates P#3: "1. Add a community faucet"
  // Wallet 2 creates P#4: "3. Create a bug bounty pool"
  // Wallet 3 creates P#5: "5. Redesign the project website"
  // Wallet 3 creates P#6: "6. Hold a hackathon"

  const getTimestamps = async () => {
    const block = await publicClient.getBlock();
    const startTime = Number(block.timestamp) + 15; // 15 seconds in future to ensure safety
    const endTime = startTime + 7 * 86400; // 7 days
    return { startTime, endTime };
  };

  let maxStartTime = 0;

  // Wallet 1 creates Proposal #3 if count < 3
  if (proposalCount < 3) {
    if (currentOwner.toLowerCase() !== wallet1Account.address.toLowerCase()) {
      console.log(`Transferring ownership from ${currentOwner} to Wallet 1...`);
      const activeOwnerClient =
        currentOwner.toLowerCase() === concordAccount.address.toLowerCase()
          ? concordClient
          : currentOwner.toLowerCase() === wallet2Account.address.toLowerCase()
          ? wallet2Client
          : wallet3Client;

      const ownTx = await activeOwnerClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: VotingABI,
        functionName: "transferOwnership",
        args: [wallet1Account.address],
      });
      await waitForTx(ownTx);
      currentOwner = wallet1Account.address;
    }

    const p = ALL_PROPOSALS[0]; // "1. Add a community faucet"
    const { startTime, endTime } = await getTimestamps();
    if (startTime > maxStartTime) maxStartTime = startTime;
    console.log(`Wallet 1 creating Proposal #3: "${p.title}"...`);
    const tx = await wallet1Client.writeContract({
      address: CONTRACT_ADDRESS,
      abi: VotingABI,
      functionName: "createProposal",
      args: [p.title, p.description, startTime, endTime, 1],
    });
    await waitForTx(tx);
    proposalCount = 3;
  }

  // Wallet 2 creates Proposal #4 if count < 4
  if (proposalCount < 4) {
    if (currentOwner.toLowerCase() !== wallet2Account.address.toLowerCase()) {
      console.log(`Transferring ownership from Wallet 1 to Wallet 2...`);
      const ownTx = await wallet1Client.writeContract({
        address: CONTRACT_ADDRESS,
        abi: VotingABI,
        functionName: "transferOwnership",
        args: [wallet2Account.address],
      });
      await waitForTx(ownTx);
      currentOwner = wallet2Account.address;
    }

    const p = ALL_PROPOSALS[2]; // "3. Create a bug bounty pool"
    const { startTime, endTime } = await getTimestamps();
    if (startTime > maxStartTime) maxStartTime = startTime;
    console.log(`Wallet 2 creating Proposal #4: "${p.title}"...`);
    const tx = await wallet2Client.writeContract({
      address: CONTRACT_ADDRESS,
      abi: VotingABI,
      functionName: "createProposal",
      args: [p.title, p.description, startTime, endTime, 1],
    });
    await waitForTx(tx);
    proposalCount = 4;
  }

  // Wallet 3 creates Proposal #5 and #6 if count < 6
  if (proposalCount < 6) {
    if (currentOwner.toLowerCase() !== wallet3Account.address.toLowerCase()) {
      console.log(`Transferring ownership from Wallet 2 to Wallet 3...`);
      const ownTx = await wallet2Client.writeContract({
        address: CONTRACT_ADDRESS,
        abi: VotingABI,
        functionName: "transferOwnership",
        args: [wallet3Account.address],
      });
      await waitForTx(ownTx);
      currentOwner = wallet3Account.address;
    }

    if (proposalCount < 5) {
      const p = ALL_PROPOSALS[4]; // "5. Redesign the project website"
      const { startTime, endTime } = await getTimestamps();
      if (startTime > maxStartTime) maxStartTime = startTime;
      console.log(`Wallet 3 creating Proposal #5: "${p.title}"...`);
      const tx = await wallet3Client.writeContract({
        address: CONTRACT_ADDRESS,
        abi: VotingABI,
        functionName: "createProposal",
        args: [p.title, p.description, startTime, endTime, 1],
      });
      await waitForTx(tx);
      proposalCount = 5;
    }

    if (proposalCount < 6) {
      const p = ALL_PROPOSALS[5]; // "6. Hold a hackathon"
      const { startTime, endTime } = await getTimestamps();
      if (startTime > maxStartTime) maxStartTime = startTime;
      console.log(`Wallet 3 creating Proposal #6: "${p.title}"...`);
      const tx = await wallet3Client.writeContract({
        address: CONTRACT_ADDRESS,
        abi: VotingABI,
        functionName: "createProposal",
        args: [p.title, p.description, startTime, endTime, 1],
      });
      await waitForTx(tx);
      proposalCount = 6;
    }

    // Return ownership to Concord deployer
    console.log(`Wallet 3 returning ownership to Concord deployer...`);
    const ownTx = await wallet3Client.writeContract({
      address: CONTRACT_ADDRESS,
      abi: VotingABI,
      functionName: "transferOwnership",
      args: [concordAccount.address],
    });
    await waitForTx(ownTx);
    currentOwner = concordAccount.address;
    console.log(`Ownership successfully returned to Concord: ${currentOwner}`);
  }

  // Verify all proposals are active for voting
  console.log("\nChecking proposal voting start times...");
  let latestBlock = await publicClient.getBlock();
  let latestTimestamp = Number(latestBlock.timestamp);
  console.log(`Current block timestamp: ${latestTimestamp}`);

  for (let id = 1; id <= 6; id++) {
    const p = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: VotingABI,
      functionName: "getProposal",
      args: [BigInt(id)],
    });
    if (Number(p[3]) > maxStartTime) {
      maxStartTime = Number(p[3]);
    }
  }

  if (latestTimestamp <= maxStartTime) {
    const waitSecs = maxStartTime - latestTimestamp + 2;
    console.log(`Waiting ${waitSecs} seconds for all proposal start times to become active...`);
    await sleep(waitSecs * 1000);
  }

  // Step 3: Voting on all 6 proposals from all 3 wallets
  console.log("\n[Step 3] Casting Votes on All 6 Proposals from each of the 3 wallets...");

  // Vote choices: 0 = Against, 1 = For, 2 = Abstain
  const votesW1 = [1, 1, 1, 0, 1, 2];
  const votesW2 = [1, 0, 1, 1, 0, 1];
  const votesW3 = [2, 1, 1, 1, 1, 0];

  const voters = [
    { name: "Wallet 1", client: wallet1Client, account: wallet1Account, choices: votesW1 },
    { name: "Wallet 2", client: wallet2Client, account: wallet2Account, choices: votesW2 },
    { name: "Wallet 3", client: wallet3Client, account: wallet3Account, choices: votesW3 },
  ];

  for (const voter of voters) {
    console.log(`\n--- ${voter.name} (${voter.account.address}) Voting on 6 Proposals ---`);
    for (let proposalId = 1; proposalId <= 6; proposalId++) {
      // Check if already voted
      const receipt = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: VotingABI,
        functionName: "getReceipt",
        args: [BigInt(proposalId), voter.account.address],
      });

      if (receipt[0]) {
        const recordedChoice =
          receipt[1] === 1 ? "FOR" : receipt[1] === 0 ? "AGAINST" : "ABSTAIN";
        console.log(
          `  Proposal #${proposalId}: Already voted (${recordedChoice}). Skipping.`
        );
        continue;
      }

      const choice = voter.choices[proposalId - 1];
      const choiceName =
        choice === 1 ? "FOR" : choice === 0 ? "AGAINST" : "ABSTAIN";

      console.log(
        `  ${voter.name} casting vote "${choiceName}" on Proposal #${proposalId}...`
      );

      const hash = await voter.client.writeContract({
        address: CONTRACT_ADDRESS,
        abi: VotingABI,
        functionName: "castVote",
        args: [BigInt(proposalId), choice],
      });
      await waitForTx(hash);
    }
  }

  // Final Summary & Verification
  console.log("\n==================================================");
  console.log("FINAL STATUS VERIFICATION");
  console.log("==================================================");

  const finalProposalCount = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: "proposalCount",
  });
  console.log("Final On-Chain Proposal Count:", finalProposalCount.toString());

  for (let id = 1; id <= Number(finalProposalCount); id++) {
    const p = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: VotingABI,
      functionName: "getProposal",
      args: [BigInt(id)],
    });
    console.log(
      `Proposal #${id}: "${p[1]}" | For: ${p[5]}, Against: ${p[6]}, Abstain: ${p[7]} | State: ${p[11]}`
    );
  }

  const txCountW1 = await publicClient.getTransactionCount({
    address: wallet1Account.address,
  });
  const txCountW2 = await publicClient.getTransactionCount({
    address: wallet2Account.address,
  });
  const txCountW3 = await publicClient.getTransactionCount({
    address: wallet3Account.address,
  });

  const balW1 = await publicClient.getBalance({ address: wallet1Account.address });
  const balW2 = await publicClient.getBalance({ address: wallet2Account.address });
  const balW3 = await publicClient.getBalance({ address: wallet3Account.address });

  console.log("\nWallet Summary:");
  console.log(
    `Wallet 1 (${wallet1Account.address}): ${txCountW1} txs, Balance: ${formatEther(balW1)} BOT`
  );
  console.log(
    `Wallet 2 (${wallet2Account.address}): ${txCountW2} txs, Balance: ${formatEther(balW2)} BOT`
  );
  console.log(
    `Wallet 3 (${wallet3Account.address}): ${txCountW3} txs, Balance: ${formatEther(balW3)} BOT`
  );
  console.log("==================================================");
}

main().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});

