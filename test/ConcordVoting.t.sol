// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {ConcordVoting} from "../src/ConcordVoting.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ConcordVotingTest
 * @notice Comprehensive test suite for ConcordVoting covering:
 *         - Proposal creation & permissions
 *         - Double voting prevention
 *         - Timing boundaries (voting before start / after end)
 *         - Finalization rules (simple majority vs quorum, ties)
 *         - Allowlist toggles and access controls
 *         - Fuzz testing for vote counting and arithmetic
 */
contract ConcordVotingTest is Test {
    ConcordVoting public voting;

    address public owner = address(0xAA1);
    address public alice = address(0xAA2);
    address public bob   = address(0xAA3);
    address public charlie = address(0xAA4);
    address public eve   = address(0xAA5);

    uint32 public constant DEFAULT_QUORUM = 2;
    uint32 public constant ONE_DAY = 86400;

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint32 startTime,
        uint32 endTime,
        uint32 quorum
    );

    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        ConcordVoting.VoteType support,
        uint32 forVotes,
        uint32 againstVotes,
        uint32 abstainVotes
    );

    event ProposalFinalized(
        uint256 indexed proposalId,
        bool passed,
        uint32 forVotes,
        uint32 againstVotes,
        uint32 abstainVotes
    );

    function setUp() public {
        // Warp to realistic timestamp (e.g. 1_700_000_000)
        vm.warp(1_700_000_000);

        vm.prank(owner);
        voting = new ConcordVoting(owner, false, DEFAULT_QUORUM);
    }

    // -------------------------------------------------------------------------
    // Proposal Creation Tests
    // -------------------------------------------------------------------------

    function test_CreateProposal_Success() public {
        uint32 startTime = uint32(block.timestamp + 100);
        uint32 endTime = uint32(block.timestamp + 100 + ONE_DAY);

        vm.expectEmit(true, true, false, true);
        emit ProposalCreated(
            1,
            owner,
            "Upgrade Sequencer",
            startTime,
            endTime,
            DEFAULT_QUORUM
        );

        vm.prank(owner);
        uint256 proposalId = voting.createProposal(
            "Upgrade Sequencer",
            "Proposal to upgrade BotChain node client",
            startTime,
            endTime,
            0 // 0 fallback to default quorum
        );

        assertEq(proposalId, 1);
        assertEq(voting.proposalCount(), 1);

        (
            address proposer,
            string memory title,
            string memory description,
            uint32 sTime,
            uint32 eTime,
            uint32 forV,
            uint32 againstV,
            uint32 abstainV,
            uint32 q,
            bool fin,
            bool pass,
            ConcordVoting.ProposalState currState
        ) = voting.getProposal(1);

        assertEq(proposer, owner);
        assertEq(title, "Upgrade Sequencer");
        assertEq(description, "Proposal to upgrade BotChain node client");
        assertEq(sTime, startTime);
        assertEq(eTime, endTime);
        assertEq(forV, 0);
        assertEq(againstV, 0);
        assertEq(abstainV, 0);
        assertEq(q, DEFAULT_QUORUM);
        assertFalse(fin);
        assertFalse(pass);
        assertEq(uint8(currState), uint8(ConcordVoting.ProposalState.Pending));
    }

    function test_RevertIf_UnauthorizedCreateProposal() public {
        uint32 startTime = uint32(block.timestamp + 100);
        uint32 endTime = uint32(block.timestamp + 100 + ONE_DAY);

        vm.prank(eve);
        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                eve
            )
        );
        voting.createProposal("Rogue Proposal", "Desc", startTime, endTime, 1);
    }

    function test_RevertIf_EmptyTitle() public {
        uint32 startTime = uint32(block.timestamp + 100);
        uint32 endTime = uint32(block.timestamp + 100 + ONE_DAY);

        vm.prank(owner);
        vm.expectRevert(ConcordVoting.EmptyProposalTitle.selector);
        voting.createProposal("", "Desc", startTime, endTime, 1);
    }

    function test_RevertIf_InvalidTimeRange() public {
        // Start time in past
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(
                ConcordVoting.InvalidTimeRange.selector,
                block.timestamp - 1,
                block.timestamp + 100
            )
        );
        voting.createProposal("Title", "Desc", uint32(block.timestamp - 1), uint32(block.timestamp + 100), 1);

        // End time <= start time
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(
                ConcordVoting.InvalidTimeRange.selector,
                block.timestamp + 100,
                block.timestamp + 100
            )
        );
        voting.createProposal("Title", "Desc", uint32(block.timestamp + 100), uint32(block.timestamp + 100), 1);
    }

    // -------------------------------------------------------------------------
    // Voting Timing Tests
    // -------------------------------------------------------------------------

    function test_RevertIf_VotingBeforeStart() public {
        uint32 startTime = uint32(block.timestamp + 200);
        uint32 endTime = uint32(block.timestamp + 200 + ONE_DAY);

        vm.prank(owner);
        uint256 id = voting.createProposal("Proposal", "Desc", startTime, endTime, 1);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                ConcordVoting.VotingNotStarted.selector,
                id,
                block.timestamp,
                startTime
            )
        );
        voting.castVote(id, ConcordVoting.VoteType.For);
    }

    function test_RevertIf_VotingAfterEnd() public {
        uint32 startTime = uint32(block.timestamp + 50);
        uint32 endTime = uint32(block.timestamp + 150);

        vm.prank(owner);
        uint256 id = voting.createProposal("Proposal", "Desc", startTime, endTime, 1);

        // Warp past end time
        vm.warp(endTime + 1);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                ConcordVoting.VotingEnded.selector,
                id,
                block.timestamp,
                endTime
            )
        );
        voting.castVote(id, ConcordVoting.VoteType.For);
    }

    function test_VoteDuringActivePeriod() public {
        uint32 startTime = uint32(block.timestamp + 50);
        uint32 endTime = uint32(block.timestamp + 500);

        vm.prank(owner);
        uint256 id = voting.createProposal("Proposal", "Desc", startTime, endTime, 1);

        vm.warp(startTime + 10);
        assertEq(uint8(voting.state(id)), uint8(ConcordVoting.ProposalState.Active));

        vm.expectEmit(true, true, false, true);
        emit VoteCast(id, alice, ConcordVoting.VoteType.For, 1, 0, 0);

        vm.prank(alice);
        voting.castVote(id, ConcordVoting.VoteType.For);

        (bool hasVoted, ConcordVoting.VoteType support) = voting.getReceipt(id, alice);
        assertTrue(hasVoted);
        assertEq(uint8(support), uint8(ConcordVoting.VoteType.For));

        (uint32 forV, uint32 againstV, uint32 abstainV, uint32 totalV) = voting.getProposalVotes(id);
        assertEq(forV, 1);
        assertEq(againstV, 0);
        assertEq(abstainV, 0);
        assertEq(totalV, 1);
    }

    // -------------------------------------------------------------------------
    // Double Voting Tests
    // -------------------------------------------------------------------------

    function test_RevertIf_DoubleVoting() public {
        uint32 startTime = uint32(block.timestamp);
        uint32 endTime = uint32(block.timestamp + ONE_DAY);

        vm.prank(owner);
        uint256 id = voting.createProposal("Proposal", "Desc", startTime, endTime, 1);

        vm.prank(alice);
        voting.castVote(id, ConcordVoting.VoteType.For);

        // Second vote must revert
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                ConcordVoting.AlreadyVoted.selector,
                id,
                alice
            )
        );
        voting.castVote(id, ConcordVoting.VoteType.Against);
    }

    // -------------------------------------------------------------------------
    // Vote Choices & Receipt Tests
    // -------------------------------------------------------------------------

    function test_VoteChoicesRecordedCorrectly() public {
        uint32 startTime = uint32(block.timestamp);
        uint32 endTime = uint32(block.timestamp + ONE_DAY);

        vm.prank(owner);
        uint256 id = voting.createProposal("Tri-Vote", "Desc", startTime, endTime, 3);

        vm.prank(alice);
        voting.castVote(id, ConcordVoting.VoteType.For);

        vm.prank(bob);
        voting.castVote(id, ConcordVoting.VoteType.Against);

        vm.prank(charlie);
        voting.castVote(id, ConcordVoting.VoteType.Abstain);

        (uint32 forV, uint32 againstV, uint32 abstainV, uint32 totalV) = voting.getProposalVotes(id);
        assertEq(forV, 1);
        assertEq(againstV, 1);
        assertEq(abstainV, 1);
        assertEq(totalV, 3);

        (, ConcordVoting.VoteType aliceChoice) = voting.getReceipt(id, alice);
        (, ConcordVoting.VoteType bobChoice) = voting.getReceipt(id, bob);
        (, ConcordVoting.VoteType charlieChoice) = voting.getReceipt(id, charlie);

        assertEq(uint8(aliceChoice), uint8(ConcordVoting.VoteType.For));
        assertEq(uint8(bobChoice), uint8(ConcordVoting.VoteType.Against));
        assertEq(uint8(charlieChoice), uint8(ConcordVoting.VoteType.Abstain));
    }

    // -------------------------------------------------------------------------
    // Allowlist Tests
    // -------------------------------------------------------------------------

    function test_Allowlist_Enforcement() public {
        uint32 startTime = uint32(block.timestamp);
        uint32 endTime = uint32(block.timestamp + ONE_DAY);

        vm.prank(owner);
        uint256 id = voting.createProposal("Gated Proposal", "Desc", startTime, endTime, 1);

        // Enable allowlist
        vm.prank(owner);
        voting.setAllowlistEnabled(true);
        assertTrue(voting.allowlistEnabled());

        // Alice is not allowlisted -> reverts
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(ConcordVoting.NotAllowlisted.selector, alice)
        );
        voting.castVote(id, ConcordVoting.VoteType.For);

        // Owner allowlists Alice
        address[] memory toAllow = new address[](1);
        toAllow[0] = alice;

        vm.prank(owner);
        voting.setAllowlist(toAllow, true);
        assertTrue(voting.allowlist(alice));

        // Alice can now vote
        vm.prank(alice);
        voting.castVote(id, ConcordVoting.VoteType.For);

        // Bob is still not allowlisted
        vm.prank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(ConcordVoting.NotAllowlisted.selector, bob)
        );
        voting.castVote(id, ConcordVoting.VoteType.Against);

        // Owner disables allowlist -> Bob can now vote
        vm.prank(owner);
        voting.setAllowlistEnabled(false);

        vm.prank(bob);
        voting.castVote(id, ConcordVoting.VoteType.Against);
    }

    // -------------------------------------------------------------------------
    // Finalization Tests
    // -------------------------------------------------------------------------

    function test_RevertIf_FinalizingBeforeEndTime() public {
        uint32 startTime = uint32(block.timestamp);
        uint32 endTime = uint32(block.timestamp + ONE_DAY);

        vm.prank(owner);
        uint256 id = voting.createProposal("Early Finalize", "Desc", startTime, endTime, 1);

        vm.expectRevert(
            abi.encodeWithSelector(
                ConcordVoting.VotingNotEnded.selector,
                id,
                block.timestamp,
                endTime
            )
        );
        voting.finalizeProposal(id);
    }

    function test_Finalize_Passed_SimpleMajorityAndQuorum() public {
        uint32 startTime = uint32(block.timestamp);
        uint32 endTime = uint32(block.timestamp + ONE_DAY);

        vm.prank(owner);
        uint256 id = voting.createProposal("Pass Me", "Desc", startTime, endTime, 2);

        vm.prank(alice);
        voting.castVote(id, ConcordVoting.VoteType.For);

        vm.prank(bob);
        voting.castVote(id, ConcordVoting.VoteType.For);

        // Warp past end
        vm.warp(endTime + 1);

        // Anyone can finalize
        vm.expectEmit(true, false, false, true);
        emit ProposalFinalized(id, true, 2, 0, 0);

        vm.prank(eve); // permissionless caller
        voting.finalizeProposal(id);

        assertEq(uint8(voting.state(id)), uint8(ConcordVoting.ProposalState.Passed));
    }

    function test_Finalize_Rejected_QuorumNotMet() public {
        uint32 startTime = uint32(block.timestamp);
        uint32 endTime = uint32(block.timestamp + ONE_DAY);

        // Quorum is 3
        vm.prank(owner);
        uint256 id = voting.createProposal("High Quorum", "Desc", startTime, endTime, 3);

        // Only 2 votes cast (For = 2, Against = 0)
        vm.prank(alice);
        voting.castVote(id, ConcordVoting.VoteType.For);

        vm.prank(bob);
        voting.castVote(id, ConcordVoting.VoteType.For);

        vm.warp(endTime + 1);

        vm.prank(eve);
        voting.finalizeProposal(id);

        // Rejected because totalVotes (2) < quorum (3)
        assertEq(uint8(voting.state(id)), uint8(ConcordVoting.ProposalState.Rejected));
    }

    function test_Finalize_Rejected_AgainstMajority() public {
        uint32 startTime = uint32(block.timestamp);
        uint32 endTime = uint32(block.timestamp + ONE_DAY);

        vm.prank(owner);
        uint256 id = voting.createProposal("Contested", "Desc", startTime, endTime, 2);

        vm.prank(alice);
        voting.castVote(id, ConcordVoting.VoteType.For);

        vm.prank(bob);
        voting.castVote(id, ConcordVoting.VoteType.Against);

        vm.prank(charlie);
        voting.castVote(id, ConcordVoting.VoteType.Against);

        vm.warp(endTime + 1);

        vm.prank(eve);
        voting.finalizeProposal(id);

        // Rejected because For (1) < Against (2)
        assertEq(uint8(voting.state(id)), uint8(ConcordVoting.ProposalState.Rejected));
    }

    function test_Finalize_Rejected_TieVote() public {
        uint32 startTime = uint32(block.timestamp);
        uint32 endTime = uint32(block.timestamp + ONE_DAY);

        vm.prank(owner);
        uint256 id = voting.createProposal("Tie Vote", "Desc", startTime, endTime, 2);

        vm.prank(alice);
        voting.castVote(id, ConcordVoting.VoteType.For);

        vm.prank(bob);
        voting.castVote(id, ConcordVoting.VoteType.Against);

        vm.warp(endTime + 1);

        vm.prank(eve);
        voting.finalizeProposal(id);

        // Rejected on tie (strictly requires forVotes > againstVotes)
        assertEq(uint8(voting.state(id)), uint8(ConcordVoting.ProposalState.Rejected));
    }

    function test_RevertIf_AlreadyFinalized() public {
        uint32 startTime = uint32(block.timestamp);
        uint32 endTime = uint32(block.timestamp + ONE_DAY);

        vm.prank(owner);
        uint256 id = voting.createProposal("Finalize Once", "Desc", startTime, endTime, 1);

        vm.warp(endTime + 1);
        voting.finalizeProposal(id);

        vm.expectRevert(
            abi.encodeWithSelector(ConcordVoting.AlreadyFinalized.selector, id)
        );
        voting.finalizeProposal(id);
    }

    // -------------------------------------------------------------------------
    // Fuzz Tests for Vote Counting
    // -------------------------------------------------------------------------

    function testFuzz_VoteCounting(
        uint8 forCount,
        uint8 againstCount,
        uint8 abstainCount
    ) public {
        // Bound voters to reasonable range to keep execution fast
        uint256 boundedFor = bound(forCount, 0, 30);
        uint256 boundedAgainst = bound(againstCount, 0, 30);
        uint256 boundedAbstain = bound(abstainCount, 0, 30);

        uint32 startTime = uint32(block.timestamp);
        uint32 endTime = uint32(block.timestamp + ONE_DAY);
        uint32 quorum = 10;

        vm.prank(owner);
        uint256 id = voting.createProposal("Fuzz Test", "Desc", startTime, endTime, quorum);

        uint256 voterIndex = 1;

        // Cast For votes
        for (uint256 i = 0; i < boundedFor; i++) {
            address voter = address(uint160(0x1000 + voterIndex++));
            vm.prank(voter);
            voting.castVote(id, ConcordVoting.VoteType.For);
        }

        // Cast Against votes
        for (uint256 i = 0; i < boundedAgainst; i++) {
            address voter = address(uint160(0x1000 + voterIndex++));
            vm.prank(voter);
            voting.castVote(id, ConcordVoting.VoteType.Against);
        }

        // Cast Abstain votes
        for (uint256 i = 0; i < boundedAbstain; i++) {
            address voter = address(uint160(0x1000 + voterIndex++));
            vm.prank(voter);
            voting.castVote(id, ConcordVoting.VoteType.Abstain);
        }

        (uint32 forV, uint32 againstV, uint32 abstainV, uint32 totalV) = voting.getProposalVotes(id);

        assertEq(forV, boundedFor);
        assertEq(againstV, boundedAgainst);
        assertEq(abstainV, boundedAbstain);
        assertEq(totalV, boundedFor + boundedAgainst + boundedAbstain);

        // Warp past end time and finalize
        vm.warp(endTime + 1);
        voting.finalizeProposal(id);

        bool expectedPassed = (totalV >= quorum) && (boundedFor > boundedAgainst);
        if (expectedPassed) {
            assertEq(uint8(voting.state(id)), uint8(ConcordVoting.ProposalState.Passed));
        } else {
            assertEq(uint8(voting.state(id)), uint8(ConcordVoting.ProposalState.Rejected));
        }
    }
}
