// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ConcordVoting
 * @author Concord Governance Team
 * @notice Lightweight, gas-optimized proposal voting contract deployed on BotChain Testnet (Chain ID: 968).
 * @dev Enforces 1-address-1-vote per proposal with support for For / Against / Abstain,
 *      optional owner-managed allowlist, and finalization by simple majority with configurable quorum.
 */
contract ConcordVoting is Ownable {
    // -------------------------------------------------------------------------
    // Types & Enums
    // -------------------------------------------------------------------------

    /// @notice Possible vote choices
    enum VoteType {
        Against, // 0
        For,     // 1
        Abstain  // 2
    }

    /// @notice Lifecycle state of a proposal
    enum ProposalState {
        Pending,   // Voting has not started
        Active,    // Voting is currently ongoing
        Ended,     // Voting period ended, awaiting finalization
        Passed,    // Finalized and passed quorum & simple majority
        Rejected   // Finalized and failed quorum or simple majority
    }

    /// @notice Voter receipt to track participation and choice
    /// @dev Packs into a single byte storage slot per voter
    struct Receipt {
        bool hasVoted;     // 1 byte
        VoteType support;  // 1 byte (enum uint8)
    }

    /// @notice Core proposal struct packed for storage slot efficiency
    /// @dev Slot 0: proposer (20B) + startTime (4B) + endTime (4B) + finalized (1B) + passed (1B) + exists (1B) = 31 bytes
    ///      Slot 1: forVotes (4B) + againstVotes (4B) + abstainVotes (4B) + quorum (4B) = 16 bytes
    ///      Slot 2: title (dynamic string)
    ///      Slot 3: description (dynamic string)
    struct Proposal {
        // --- Slot 0 (31 / 32 bytes) ---
        address proposer;
        uint32 startTime;
        uint32 endTime;
        bool finalized;
        bool passed;
        bool exists;
        // --- Slot 1 (16 / 32 bytes) ---
        uint32 forVotes;
        uint32 againstVotes;
        uint32 abstainVotes;
        uint32 quorum;
        // --- Dynamic Slots ---
        string title;
        string description;
    }

    // -------------------------------------------------------------------------
    // State Variables
    // -------------------------------------------------------------------------

    /// @notice Total proposals created so far
    uint256 public proposalCount;

    /// @notice Global toggle for voter allowlist (false = open to all wallets)
    bool public allowlistEnabled;

    /// @notice Default quorum required for new proposals if not overridden
    uint32 public defaultQuorum;

    /// @notice Registered voters mapping when allowlist is active
    mapping(address voter => bool isAllowed) public allowlist;

    /// @notice Proposal storage by ID (1-indexed)
    mapping(uint256 proposalId => Proposal) internal _proposals;

    /// @notice Voter receipts by proposal ID and voter address
    mapping(uint256 proposalId => mapping(address voter => Receipt)) public receipts;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    /// @notice Emitted when a new proposal is created by owner
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint32 startTime,
        uint32 endTime,
        uint32 quorum
    );

    /// @notice Emitted when an eligible address casts a vote
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        VoteType support,
        uint32 forVotes,
        uint32 againstVotes,
        uint32 abstainVotes
    );

    /// @notice Emitted when a proposal is finalized after its end time
    event ProposalFinalized(
        uint256 indexed proposalId,
        bool passed,
        uint32 forVotes,
        uint32 againstVotes,
        uint32 abstainVotes
    );

    /// @notice Emitted when allowlist enforcement is enabled or disabled
    event AllowlistStatusToggled(bool indexed enabled);

    /// @notice Emitted when an account's allowlist status changes
    event AllowlistMemberUpdated(address indexed account, bool indexed status);

    /// @notice Emitted when default proposal quorum is updated
    event DefaultQuorumUpdated(uint32 oldQuorum, uint32 newQuorum);

    // -------------------------------------------------------------------------
    // Custom Errors
    // -------------------------------------------------------------------------

    error ProposalNotFound(uint256 proposalId);
    error VotingNotStarted(uint256 proposalId, uint256 currentTime, uint256 startTime);
    error VotingEnded(uint256 proposalId, uint256 currentTime, uint256 endTime);
    error VotingNotEnded(uint256 proposalId, uint256 currentTime, uint256 endTime);
    error AlreadyVoted(uint256 proposalId, address voter);
    error AlreadyFinalized(uint256 proposalId);
    error InvalidTimeRange(uint256 startTime, uint256 endTime);
    error EmptyProposalTitle();
    error NotAllowlisted(address voter);
    error InvalidVoteType(uint8 voteType);
    error ZeroAddress();

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    /**
     * @notice Initializes the Concord voting contract
     * @param initialOwner Owner address with administrative rights
     * @param _allowlistEnabled Whether voting is initially restricted to allowlisted wallets
     * @param _defaultQuorum Minimum total votes required to pass a proposal by default
     */
    constructor(
        address initialOwner,
        bool _allowlistEnabled,
        uint32 _defaultQuorum
    ) Ownable(initialOwner) {
        if (initialOwner == address(0)) revert ZeroAddress();
        allowlistEnabled = _allowlistEnabled;
        defaultQuorum = _defaultQuorum;
    }

    // -------------------------------------------------------------------------
    // Proposal Management (Admin / Owner)
    // -------------------------------------------------------------------------

    /**
     * @notice Creates a new governance proposal
     * @dev Only callable by the contract owner. Times are Unix timestamps in seconds.
     * @param title Short title of the proposal
     * @param description Detailed proposal markdown or plain text
     * @param startTime Unix timestamp when voting begins (must be >= current block.timestamp)
     * @param endTime Unix timestamp when voting concludes (must be > startTime)
     * @param quorum Minimum total votes required for this proposal (0 = simple majority only)
     * @return proposalId The ID of the freshly created proposal
     */
    function createProposal(
        string calldata title,
        string calldata description,
        uint32 startTime,
        uint32 endTime,
        uint32 quorum
    ) external onlyOwner returns (uint256 proposalId) {
        if (bytes(title).length == 0) revert EmptyProposalTitle();
        if (startTime < block.timestamp || endTime <= startTime) {
            revert InvalidTimeRange(startTime, endTime);
        }

        unchecked {
            proposalId = ++proposalCount;
        }

        uint32 effectiveQuorum = quorum == 0 ? defaultQuorum : quorum;

        Proposal storage p = _proposals[proposalId];
        p.proposer = msg.sender;
        p.startTime = startTime;
        p.endTime = endTime;
        p.finalized = false;
        p.passed = false;
        p.exists = true;
        p.forVotes = 0;
        p.againstVotes = 0;
        p.abstainVotes = 0;
        p.quorum = effectiveQuorum;
        p.title = title;
        p.description = description;

        emit ProposalCreated(
            proposalId,
            msg.sender,
            title,
            startTime,
            endTime,
            effectiveQuorum
        );
    }

    // -------------------------------------------------------------------------
    // Voting Operations
    // -------------------------------------------------------------------------

    /**
     * @notice Casts a single vote for a specified proposal
     * @dev Enforces 1 vote per address, checks active voting window, and allowlist if enabled
     * @param proposalId The ID of the target proposal
     * @param support VoteType enum choice: 0 = Against, 1 = For, 2 = Abstain
     */
    function castVote(uint256 proposalId, VoteType support) external {
        Proposal storage p = _proposals[proposalId];
        if (!p.exists) revert ProposalNotFound(proposalId);

        // Allowlist check
        if (allowlistEnabled && !allowlist[msg.sender]) {
            revert NotAllowlisted(msg.sender);
        }

        // Timing checks
        if (block.timestamp < p.startTime) {
            revert VotingNotStarted(proposalId, block.timestamp, p.startTime);
        }
        if (block.timestamp > p.endTime) {
            revert VotingEnded(proposalId, block.timestamp, p.endTime);
        }

        // Double voting prevention
        if (receipts[proposalId][msg.sender].hasVoted) {
            revert AlreadyVoted(proposalId, msg.sender);
        }

        // Validate vote type
        if (uint8(support) > uint8(VoteType.Abstain)) {
            revert InvalidVoteType(uint8(support));
        }

        // Record voter receipt
        receipts[proposalId][msg.sender] = Receipt({
            hasVoted: true,
            support: support
        });

        // Tally vote count
        if (support == VoteType.For) {
            p.forVotes += 1;
        } else if (support == VoteType.Against) {
            p.againstVotes += 1;
        } else {
            p.abstainVotes += 1;
        }

        emit VoteCast(
            proposalId,
            msg.sender,
            support,
            p.forVotes,
            p.againstVotes,
            p.abstainVotes
        );
    }

    // -------------------------------------------------------------------------
    // Finalization
    // -------------------------------------------------------------------------

    /**
     * @notice Finalizes a proposal once its voting window has closed
     * @dev Permissionless: anyone can trigger finalization to settle proposal outcome
     * @param proposalId The ID of the proposal to finalize
     */
    function finalizeProposal(uint256 proposalId) external {
        Proposal storage p = _proposals[proposalId];
        if (!p.exists) revert ProposalNotFound(proposalId);
        if (p.finalized) revert AlreadyFinalized(proposalId);
        if (block.timestamp <= p.endTime) {
            revert VotingNotEnded(proposalId, block.timestamp, p.endTime);
        }

        p.finalized = true;

        uint32 totalVotes = p.forVotes + p.againstVotes + p.abstainVotes;
        bool quorumMet = totalVotes >= p.quorum;
        bool simpleMajority = p.forVotes > p.againstVotes;

        // Proposal passes if quorum is satisfied and For votes strictly exceed Against votes
        bool isPassed = quorumMet && simpleMajority;
        p.passed = isPassed;

        emit ProposalFinalized(
            proposalId,
            isPassed,
            p.forVotes,
            p.againstVotes,
            p.abstainVotes
        );
    }

    // -------------------------------------------------------------------------
    // View Functions (Frontend Helpers)
    // -------------------------------------------------------------------------

    /**
     * @notice Computes dynamic current state of a proposal
     * @param proposalId The ID of the proposal
     * @return ProposalState enum representing current lifecycle state
     */
    function state(uint256 proposalId) public view returns (ProposalState) {
        Proposal storage p = _proposals[proposalId];
        if (!p.exists) revert ProposalNotFound(proposalId);

        if (p.finalized) {
            return p.passed ? ProposalState.Passed : ProposalState.Rejected;
        }

        if (block.timestamp < p.startTime) {
            return ProposalState.Pending;
        }

        if (block.timestamp <= p.endTime) {
            return ProposalState.Active;
        }

        return ProposalState.Ended;
    }

    /**
     * @notice Retrieves full proposal details
     * @param proposalId The ID of the proposal
     */
    function getProposal(uint256 proposalId)
        external
        view
        returns (
            address proposer,
            string memory title,
            string memory description,
            uint32 startTime,
            uint32 endTime,
            uint32 forVotes,
            uint32 againstVotes,
            uint32 abstainVotes,
            uint32 quorum,
            bool finalized,
            bool passed,
            ProposalState currentState
        )
    {
        Proposal storage p = _proposals[proposalId];
        if (!p.exists) revert ProposalNotFound(proposalId);

        return (
            p.proposer,
            p.title,
            p.description,
            p.startTime,
            p.endTime,
            p.forVotes,
            p.againstVotes,
            p.abstainVotes,
            p.quorum,
            p.finalized,
            p.passed,
            state(proposalId)
        );
    }

    /**
     * @notice Quick getter for vote counts and total participation
     */
    function getProposalVotes(uint256 proposalId)
        external
        view
        returns (
            uint32 forVotes,
            uint32 againstVotes,
            uint32 abstainVotes,
            uint32 totalVotes
        )
    {
        Proposal storage p = _proposals[proposalId];
        if (!p.exists) revert ProposalNotFound(proposalId);

        forVotes = p.forVotes;
        againstVotes = p.againstVotes;
        abstainVotes = p.abstainVotes;
        totalVotes = forVotes + againstVotes + abstainVotes;
    }

    /**
     * @notice Checks if an address has voted on a proposal and their choice
     */
    function getReceipt(uint256 proposalId, address voter)
        external
        view
        returns (bool hasVoted, VoteType support)
    {
        Receipt storage r = receipts[proposalId][voter];
        return (r.hasVoted, r.support);
    }

    // -------------------------------------------------------------------------
    // Admin Configuration
    // -------------------------------------------------------------------------

    /**
     * @notice Enables or disables voter allowlist restriction
     * @param enabled True to restrict voting to allowlisted addresses only
     */
    function setAllowlistEnabled(bool enabled) external onlyOwner {
        allowlistEnabled = enabled;
        emit AllowlistStatusToggled(enabled);
    }

    /**
     * @notice Adds or removes multiple addresses from voter allowlist
     * @param accounts Array of addresses to update
     * @param status True to allowlist, false to revoke
     */
    function setAllowlist(address[] calldata accounts, bool status) external onlyOwner {
        uint256 len = accounts.length;
        for (uint256 i = 0; i < len; ) {
            address account = accounts[i];
            if (account == address(0)) revert ZeroAddress();
            allowlist[account] = status;
            emit AllowlistMemberUpdated(account, status);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Updates the default quorum applied to subsequent proposals
     * @param newQuorum New default quorum vote count
     */
    function setDefaultQuorum(uint32 newQuorum) external onlyOwner {
        emit DefaultQuorumUpdated(defaultQuorum, newQuorum);
        defaultQuorum = newQuorum;
    }
}
