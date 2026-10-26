// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ConcordVoting} from "../src/ConcordVoting.sol";

/**
 * @title DeployScript
 * @notice Foundry deployment script for ConcordVoting on BotChain Mainnet (Chain ID: 677)
 * @dev Deploys using the cast keystore account `concord`:
 *      forge script script/Deploy.s.sol --rpc-url botchain --chain-id 677 --account concord --password papa4mama4 --broadcast
 *      Add `--legacy` if BotChain RPC does not support EIP-1559 transactions:
 *      forge script script/Deploy.s.sol --rpc-url botchain --chain-id 677 --account concord --password papa4mama4 --broadcast --legacy
 */
contract DeployScript is Script {

    address constant DEPLOYER = 0xeB2b407681D788eDdb88Cd3ae6051dB146d694a1;


    function run() external returns (ConcordVoting voting) {
        console.log("--------------------------------------------------");
        console.log("Deploying ConcordVoting to BotChain Mainnet (ID 677)");
        console.log("Using Cast Keystore Account: concord");
        console.log("--------------------------------------------------");

        // vm.startBroadcast() without arguments automatically uses the account
        // passed on the CLI via `--account concord`
        vm.startBroadcast();

        console.log("DEPLOYER address:", DEPLOYER);

        // Parameters:
        // initialOwner: DEPLOYER (the concord account)
        // allowlistEnabled: false (open to any wallet by default)
        // defaultQuorum: 1 (minimum 1 vote required)
        voting = new ConcordVoting(
            DEPLOYER,
            false,
            1
        );

        vm.stopBroadcast();

        console.log("==================================================");
        console.log("SUCCESS: ConcordVoting deployed at:");
        console.log(address(voting));
        console.log("==================================================");
        console.log("NEXT STEP: Update src/config.ts line 49 with this address:");
        console.log("export const CONTRACT_ADDRESS = \"%s\";", address(voting));
        console.log("View contract on explorer: https://scan.botchain.ai/address/%s", address(voting));
        console.log("==================================================");

        return voting;
    }
}
