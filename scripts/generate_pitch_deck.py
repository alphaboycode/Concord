import os
import math
from PIL import Image, ImageDraw, ImageFont

WIDTH = 1920
HEIGHT = 1080

# Color Palette (Civic Editorial & Web3 Dark)
BG_DARK = (11, 15, 25)        # #0B0F19
BG_DARK_ALT = (15, 23, 42)    # #0F172A
BG_CARD = (30, 41, 59)        # #1E293B
BG_CARD_LIGHT = (40, 53, 76)  # #28354C
BORDER_COLOR = (51, 65, 85)   # #334155
BORDER_SUBTLE = (38, 50, 69)  # #263245

TEXT_WHITE = (248, 250, 252)  # #F8FAFC
TEXT_MUTED = (160, 174, 192)  # #A0AEC0
TEXT_DIM = (110, 126, 150)    # #6E7E96

ACCENT_MINT = (52, 211, 153)  # #34D399 Bright Mint
ACCENT_CYAN = (56, 189, 248)  # #38BDF8 Electric Sky Cyan
ACCENT_BLUE = (96, 165, 250)  # #60A5FA Soft Blue
ACCENT_PURPLE = (167, 139, 250)# #A78BFA Lavender
ACCENT_AMBER = (251, 191, 36) # #FBBF24 Amber Gold
ACCENT_ROSE = (251, 113, 133) # #FB7185 Rose

# Proper RGB Tints for badging (dark subtle backgrounds for high contrast)
TINT_MINT = (16, 42, 34)
TINT_CYAN = (14, 40, 52)
TINT_PURPLE = (36, 26, 54)
TINT_ROSE = (46, 20, 28)
TINT_AMBER = (46, 36, 18)
TINT_BLUE = (18, 34, 56)

FONT_REG_PATH = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
FONT_BOLD_PATH = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONT_MONO_PATH = "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf"

def font(size, bold=False, mono=False):
    path = FONT_MONO_PATH if mono else (FONT_BOLD_PATH if bold else FONT_REG_PATH)
    return ImageFont.truetype(path, size)

def base_slide(category="CONCORD PROTOCOL", title="", subtitle="", page_num=1, total_pages=11):
    im = Image.new("RGB", (WIDTH, HEIGHT), BG_DARK)
    draw = ImageDraw.Draw(im)

    # Ambient subtle background gradient
    for y in range(HEIGHT):
        ratio = y / HEIGHT
        r = int(BG_DARK[0] + (BG_DARK_ALT[0] - BG_DARK[0]) * ratio)
        g = int(BG_DARK[1] + (BG_DARK_ALT[1] - BG_DARK[1]) * ratio)
        b = int(BG_DARK[2] + (BG_DARK_ALT[2] - BG_DARK[2]) * ratio)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    # Top glowing accent line
    for i in range(5):
        draw.line([(0, i), (WIDTH, i)], fill=ACCENT_MINT)

    # Header category pill
    if category:
        cat_w = len(category) * 11 + 36
        draw.rounded_rectangle([90, 48, 90 + cat_w, 82], radius=6, fill=TINT_MINT, outline=ACCENT_MINT, width=1)
        draw.text((108, 55), category.upper(), font=font(14, bold=True), fill=ACCENT_MINT)

        # Brand top right
        draw.text((WIDTH - 250, 50), "CONCORD", font=font(22, bold=True), fill=TEXT_WHITE)
        draw.rounded_rectangle([WIDTH - 130, 48, WIDTH - 90, 80], radius=6, fill=TINT_CYAN, outline=ACCENT_CYAN, width=1)
        draw.text((WIDTH - 120, 54), "968", font=font(14, bold=True), fill=ACCENT_CYAN)

    if title:
        draw.text((90, 96), title, font=font(44, bold=True), fill=TEXT_WHITE)

    if subtitle:
        draw.text((90, 156), subtitle, font=font(20, bold=False), fill=TEXT_MUTED)

    # Footer
    draw.line([(90, HEIGHT - 55), (WIDTH - 90, HEIGHT - 55)], fill=BORDER_COLOR, width=1)
    draw.text((90, HEIGHT - 38), "Concord • Democratic Governance for BotChain Testnet", font=font(14), fill=TEXT_DIM)
    draw.text((WIDTH - 200, HEIGHT - 38), f"Slide {page_num} of {total_pages}", font=font(14), fill=TEXT_DIM)

    return im, draw

def draw_card(draw, x, y, w, h, title="", subtitle="", border_color=BORDER_COLOR, bg_color=BG_CARD, radius=12):
    draw.rounded_rectangle([x, y, x + w, y + h], radius=radius, fill=bg_color, outline=border_color, width=1)
    offset_y = y + 24
    if title:
        draw.text((x + 24, offset_y), title, font=font(20, bold=True), fill=TEXT_WHITE)
        offset_y += 32
    if subtitle:
        draw.text((x + 24, offset_y), subtitle, font=font(15), fill=TEXT_MUTED)
        offset_y += 24
    return offset_y

# -----------------------------------------------------------------------------
# SLIDE 1: COVER
# -----------------------------------------------------------------------------
def make_slide_1():
    im = Image.new("RGB", (WIDTH, HEIGHT), BG_DARK)
    draw = ImageDraw.Draw(im)

    # Subtle ambient gradient
    for y in range(HEIGHT):
        ratio = y / HEIGHT
        r = int(11 + 8 * ratio)
        g = int(15 + 12 * ratio)
        b = int(25 + 24 * ratio)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    # Top accent line
    for i in range(5):
        draw.line([(0, i), (WIDTH, i)], fill=ACCENT_MINT)

    # Main Brand Area
    draw.rounded_rectangle([90, 120, 280, 160], radius=6, fill=TINT_MINT, outline=ACCENT_MINT, width=1)
    draw.text((106, 131), "BOTCHAIN TESTNET", font=font(14, bold=True), fill=ACCENT_MINT)

    draw.rounded_rectangle([295, 120, 455, 160], radius=6, fill=TINT_CYAN, outline=ACCENT_CYAN, width=1)
    draw.text((315, 131), "CHAIN ID: 968", font=font(14, bold=True), fill=ACCENT_CYAN)

    draw.text((90, 185), "CONCORD", font=font(88, bold=True), fill=TEXT_WHITE)
    draw.text((90, 290), "Democratic, Gas-Optimized Governance on BotChain", font=font(34, bold=True), fill=ACCENT_CYAN)
    draw.text((90, 348), "One Address, One Vote. Zero Plutocracy. 100% On-Chain Consensus.", font=font(22), fill=TEXT_MUTED)

    # 4 Key Value Prop Cards in a Row
    card_w = 405
    card_h = 240
    start_y = 430
    props = [
        ("1 Address = 1 Vote", "Equal voting weight per wallet. Whales cannot hijack protocol governance or grant distributions.", ACCENT_MINT),
        ("Packed Gas Efficiency", "Hyper-optimized Solidity ^0.8.24 storage. 31B & 16B slots deliver up to 70% gas savings.", ACCENT_CYAN),
        ("Dual-Mode Flexibility", "Seamlessly toggle between open public voting and owner-managed allowlist steering committees.", ACCENT_PURPLE),
        ("Production Web3 DApp", "Modern civic-editorial React + Wagmi frontend live with real-time event updates and explorer links.", ACCENT_BLUE)
    ]
    for idx, (p_title, p_desc, accent) in enumerate(props):
        cx = 90 + idx * (card_w + 20)
        draw.rounded_rectangle([cx, start_y, cx + card_w, start_y + card_h], radius=12, fill=BG_CARD, outline=BORDER_COLOR, width=1)
        # Accent top bar on card
        draw.rounded_rectangle([cx, start_y, cx + card_w, start_y + 6], radius=3, fill=accent)
        draw.text((cx + 24, start_y + 28), p_title, font=font(20, bold=True), fill=TEXT_WHITE)
        
        # Word wrap text
        words = p_desc.split(" ")
        lines = []
        cur_line = ""
        for w in words:
            if len(cur_line + " " + w) > 34:
                lines.append(cur_line)
                cur_line = w
            else:
                cur_line = (cur_line + " " + w).strip()
        if cur_line: lines.append(cur_line)

        for l_idx, line in enumerate(lines):
            draw.text((cx + 24, start_y + 74 + l_idx * 25), line, font=font(16), fill=TEXT_MUTED)

    # Bottom Traction Highlights Banner
    draw.rounded_rectangle([90, 710, WIDTH - 90, 950], radius=14, fill=BG_CARD_LIGHT, outline=BORDER_COLOR, width=1)
    draw.text((120, 735), "VERIFIED ON-CHAIN DEPLOYMENT & ACTIVITY", font=font(15, bold=True), fill=ACCENT_MINT)
    
    stats = [
        ("0xcEEfCA...224B", "Live Contract Address", ACCENT_CYAN),
        ("6 Proposals", "Created Across 3 Wallets", TEXT_WHITE),
        ("18 Votes Cast", "Tallied For / Against / Abstain", ACCENT_MINT),
        ("34+ Transactions", "Confirmed on BotChain Scan", ACCENT_AMBER)
    ]
    for idx, (val, lbl, color) in enumerate(stats):
        bx = 120 + idx * 420
        draw.text((bx, 775), val, font=font(28, bold=True), fill=color)
        draw.text((bx, 825), lbl, font=font(16), fill=TEXT_MUTED)
        if idx < 3:
            draw.line([(bx + 380, 770), (bx + 380, 860)], fill=BORDER_COLOR, width=1)

    draw.text((120, 890), "Explorer: https://scan.bohr.life/address/0xcEEfCA9caAFB95cdC6CC467A290C2de02E37224B", font=font(15, mono=True), fill=TEXT_DIM)

    # Footer
    draw.line([(90, HEIGHT - 55), (WIDTH - 90, HEIGHT - 55)], fill=BORDER_COLOR, width=1)
    draw.text((90, HEIGHT - 38), "Concord Governance • BotChain Testnet (Chain ID: 968)", font=font(14), fill=TEXT_DIM)
    draw.text((WIDTH - 200, HEIGHT - 38), "Slide 1 of 11", font=font(14), fill=TEXT_DIM)
    return im

# -----------------------------------------------------------------------------
# SLIDE 2: THE PROBLEM
# -----------------------------------------------------------------------------
def make_slide_2():
    im, draw = base_slide("MARKET CHALLENGES", "The Broken State of Web3 Governance", "Traditional DAO tooling disenfranchises builders and wastes community capital", 2)
    
    card_w = 546
    card_h = 580
    start_y = 230
    
    problems = [
        (
            "Whale Plutocracy",
            "1% of holders dictate 90% of outcomes",
            ACCENT_ROSE,
            [
                "Token-weighted voting equates capital size with community wisdom.",
                "Whales, VCs, and mercenary yield farmers overrule grassroots builders.",
                "Ecosystem grants and community funds get funneled to insider interests.",
                "Apathy spreads: retail token holders stop voting because their voice cannot move the needle."
            ]
        ),
        (
            "Prohibitive Gas Inefficiency",
            "Bloated Governor contracts bleed user funds",
            ACCENT_AMBER,
            [
                "Standard OpenZeppelin Governor clones use un-optimized multi-slot storage.",
                "Voting on-chain can cost $15–$60 per vote during high-congestion periods.",
                "Contract deployment requires excessive gas, burdening new startups.",
                "Complex state tracking leads to failed transactions and high revert fees."
            ]
        ),
        (
            "Ecosystem Fragmentation",
            "Lack of native tooling on emerging L1s",
            ACCENT_PURPLE,
            [
                "Emerging chains like BotChain have vibrant builders but lack native civic dApps.",
                "Off-chain platforms (Snapshot) rely on centralized IPFS nodes and relayers.",
                "Multi-sig centralization: most projects settle for simple Gnosis Safes without community votes.",
                "High technical barrier to set up customized allowlists or quorum requirements."
            ]
        )
    ]
    
    for idx, (title, subtitle, accent, bullet_points) in enumerate(problems):
        cx = 90 + idx * (card_w + 30)
        draw.rounded_rectangle([cx, start_y, cx + card_w, start_y + card_h], radius=14, fill=BG_CARD, outline=BORDER_COLOR, width=1)
        draw.rounded_rectangle([cx, start_y, cx + card_w, start_y + 8], radius=4, fill=accent)
        
        draw.text((cx + 32, start_y + 36), title, font=font(24, bold=True), fill=TEXT_WHITE)
        draw.text((cx + 32, start_y + 74), subtitle, font=font(15, bold=True), fill=accent)
        draw.line([(cx + 32, start_y + 110), (cx + card_w - 32, start_y + 110)], fill=BORDER_COLOR, width=1)
        
        curr_y = start_y + 135
        for bp in bullet_points:
            draw.ellipse([cx + 32, curr_y + 6, cx + 42, curr_y + 16], fill=accent)
            # wrap text
            words = bp.split(" ")
            lines = []
            cur_line = ""
            for w in words:
                if len(cur_line + " " + w) > 42:
                    lines.append(cur_line)
                    cur_line = w
                else:
                    cur_line = (cur_line + " " + w).strip()
            if cur_line: lines.append(cur_line)
            
            for l_idx, line in enumerate(lines):
                draw.text((cx + 52, curr_y + l_idx * 24), line, font=font(15), fill=TEXT_MUTED)
            curr_y += len(lines) * 24 + 20

    # Bottom Callout
    draw.rounded_rectangle([90, 845, WIDTH - 90, 955], radius=10, fill=BG_CARD_LIGHT, outline=BORDER_COLOR, width=1)
    draw.text((120, 875), "THE CORE IMPASSE:", font=font(15, bold=True), fill=ACCENT_AMBER)
    draw.text((120, 905), "Web3 promises decentralized democracy, but current infrastructure delivers plutocracy and prohibitive gas friction.", font=font(18, bold=True), fill=TEXT_WHITE)
    
    return im

# -----------------------------------------------------------------------------
# SLIDE 3: THE SOLUTION
# -----------------------------------------------------------------------------
def make_slide_3():
    im, draw = base_slide("PRODUCT VISION", "The Concord Solution: Democracy Without Friction", "A streamlined governance protocol built for fair participation and low gas on BotChain", 3)
    
    card_w = 546
    card_h = 580
    start_y = 230
    
    solutions = [
        (
            "1-Address-1-Vote Model",
            "Democratic sovereignty for every wallet",
            ACCENT_MINT,
            [
                ("Egalitarian Governance", "Each connected wallet receives exactly one vote per proposal. Influence is earned through community consensus, not token hoard size."),
                ("Zero Token Speculation", "Does not require a volatile governance token. Projects can govern immediately with native BOT or identity."),
                ("Sybil-Resilient Flexibility", "Deploy as an open public voting dapp or toggle allowlists to restrict voting to verified builders or council members.")
            ]
        ),
        (
            "Hyper-Optimized Storage",
            "Engineered for minimum gas on BotChain",
            ACCENT_CYAN,
            [
                ("Packed Struct Slots", "Proposal metadata is packed into tightly bounded 31-byte and 16-byte storage slots, saving up to 70% in write gas."),
                ("1-Byte Voter Receipts", "Participation status and vote support (For/Against/Abstain) pack into a single 2-byte slot per voter."),
                ("Custom Revert Errors", "Zero string error storage bloat. Native Solidity 0.8 custom errors reduce contract bytecode and execution costs.")
            ]
        ),
        (
            "Civic Web3 Experience",
            "Clear, accessible, real-time application",
            ACCENT_BLUE,
            [
                ("Real-Time Event Updates", "Wagmi & Viem hooks watch contract events for instant vote tally updates without refreshing the browser."),
                ("Zero-Confusion Network UX", "Automatic BotChain detection with one-click chain switching and gas balance warnings."),
                ("Auditable On-Chain Finalization", "Permissionless execution: anyone can trigger finalization once the voting window closes.")
            ]
        )
    ]
    
    for idx, (title, subtitle, accent, features) in enumerate(solutions):
        cx = 90 + idx * (card_w + 30)
        draw.rounded_rectangle([cx, start_y, cx + card_w, start_y + card_h], radius=14, fill=BG_CARD, outline=BORDER_COLOR, width=1)
        draw.rounded_rectangle([cx, start_y, cx + card_w, start_y + 8], radius=4, fill=accent)
        
        draw.text((cx + 32, start_y + 36), title, font=font(24, bold=True), fill=TEXT_WHITE)
        draw.text((cx + 32, start_y + 74), subtitle, font=font(15, bold=True), fill=accent)
        draw.line([(cx + 32, start_y + 110), (cx + card_w - 32, start_y + 110)], fill=BORDER_COLOR, width=1)
        
        curr_y = start_y + 135
        for heading, body in features:
            draw.text((cx + 32, curr_y), heading, font=font(17, bold=True), fill=TEXT_WHITE)
            curr_y += 26
            
            words = body.split(" ")
            lines = []
            cur_line = ""
            for w in words:
                if len(cur_line + " " + w) > 46:
                    lines.append(cur_line)
                    cur_line = w
                else:
                    cur_line = (cur_line + " " + w).strip()
            if cur_line: lines.append(cur_line)
            
            for line in lines:
                draw.text((cx + 32, curr_y), line, font=font(14), fill=TEXT_MUTED)
                curr_y += 22
            curr_y += 18

    # Bottom Banner
    draw.rounded_rectangle([90, 845, WIDTH - 90, 955], radius=10, fill=BG_CARD_LIGHT, outline=BORDER_COLOR, width=1)
    draw.text((120, 875), "KEY TAKEAWAY:", font=font(15, bold=True), fill=ACCENT_MINT)
    draw.text((120, 905), "Concord provides the ideal balance: true decentralization without the high fees, plutocracy, or complexity.", font=font(18, bold=True), fill=TEXT_WHITE)

    return im

# -----------------------------------------------------------------------------
# SLIDE 4: ARCHITECTURE & SMART CONTRACT
# -----------------------------------------------------------------------------
def make_slide_4():
    im, draw = base_slide("TECHNICAL ARCHITECTURE", "Smart Contract Storage & Gas Optimization", "Solidity ^0.8.24 • OpenZeppelin Ownable • Tightly Packed Storage Slots", 4)
    
    # Left Card: Storage Layout Diagram (w: 960)
    draw.rounded_rectangle([90, 220, 1050, 940], radius=14, fill=BG_CARD, outline=BORDER_COLOR, width=1)
    draw.text((122, 250), "PACKED STRUCT STORAGE LAYOUT", font=font(20, bold=True), fill=ACCENT_CYAN)
    draw.text((122, 280), "Engineered to fit into precise 32-byte EVM storage words to eliminate redundant SSTORE operations.", font=font(14), fill=TEXT_MUTED)
    
    # Slot 0 Diagram
    draw.rounded_rectangle([122, 330, 1018, 450], radius=8, fill=BG_CARD_LIGHT, outline=BORDER_COLOR, width=1)
    draw.text((142, 345), "SLOT 0: Core Proposal Metadata (31 / 32 Bytes Allocated)", font=font(15, bold=True), fill=ACCENT_MINT)
    
    slot0_fields = [
        ("proposer", "address", "20 Bytes", ACCENT_CYAN),
        ("startTime", "uint32", "4 Bytes", ACCENT_BLUE),
        ("endTime", "uint32", "4 Bytes", ACCENT_BLUE),
        ("finalized", "bool", "1 Byte", ACCENT_PURPLE),
        ("passed", "bool", "1 Byte", ACCENT_PURPLE),
        ("exists", "bool", "1 Byte", ACCENT_PURPLE)
    ]
    cur_x = 142
    for name, typ, size, col in slot0_fields:
        w_box = 140 if "address" in typ else 115
        draw.rounded_rectangle([cur_x, 378, cur_x + w_box, 432], radius=6, fill=BG_DARK, outline=col, width=1)
        draw.text((cur_x + 10, 386), name, font=font(13, bold=True), fill=TEXT_WHITE)
        draw.text((cur_x + 10, 408), f"{typ} ({size})", font=font(11, mono=True), fill=col)
        cur_x += w_box + 8

    # Slot 1 Diagram
    draw.rounded_rectangle([122, 480, 1018, 600], radius=8, fill=BG_CARD_LIGHT, outline=BORDER_COLOR, width=1)
    draw.text((142, 495), "SLOT 1: Vote Counters & Quorum (16 / 32 Bytes Allocated)", font=font(15, bold=True), fill=ACCENT_CYAN)
    
    slot1_fields = [
        ("forVotes", "uint32", "4 Bytes", ACCENT_MINT),
        ("againstVotes", "uint32", "4 Bytes", ACCENT_ROSE),
        ("abstainVotes", "uint32", "4 Bytes", ACCENT_AMBER),
        ("quorum", "uint32", "4 Bytes", ACCENT_PURPLE)
    ]
    cur_x = 142
    for name, typ, size, col in slot1_fields:
        w_box = 205
        draw.rounded_rectangle([cur_x, 528, cur_x + w_box, 582], radius=6, fill=BG_DARK, outline=col, width=1)
        draw.text((cur_x + 14, 536), name, font=font(14, bold=True), fill=TEXT_WHITE)
        draw.text((cur_x + 14, 558), f"{typ} ({size})", font=font(12, mono=True), fill=col)
        cur_x += w_box + 16

    # Slot 2 & Dynamic
    draw.rounded_rectangle([122, 630, 1018, 730], radius=8, fill=BG_CARD_LIGHT, outline=BORDER_COLOR, width=1)
    draw.text((142, 645), "DYNAMIC SLOTS & MAPPINGS", font=font(15, bold=True), fill=ACCENT_PURPLE)
    draw.text((142, 675), "• Slot 2: string title (dynamic UTF-8 bytes)    • Slot 3: string description", font=font(14), fill=TEXT_MUTED)
    draw.text((142, 700), "• mapping(proposalId => mapping(voter => Receipt)) packed into 2 bytes: bool hasVoted + VoteType support", font=font(13, mono=True), fill=ACCENT_CYAN)

    # Revert Errors & NatSpec
    draw.rounded_rectangle([122, 760, 1018, 915], radius=8, fill=BG_DARK, outline=BORDER_COLOR, width=1)
    draw.text((142, 775), "CUSTOM REVERT ERRORS (Zero String Bloat)", font=font(14, bold=True), fill=ACCENT_AMBER)
    errs = "ProposalNotFound  •  AlreadyVoted  •  VotingNotStarted  •  VotingEnded  •  VotingNotEnded  •  NotAllowlisted"
    draw.text((142, 805), errs, font=font(13, mono=True), fill=TEXT_WHITE)
    draw.text((142, 840), "Standard 4-byte error selectors eliminate runtime string memory copying.", font=font(14), fill=TEXT_MUTED)
    draw.text((142, 870), "Comprehensive NatSpec on all external functions guarantees contract auditability.", font=font(14), fill=TEXT_MUTED)

    # Right Column: Architectural Highlights (w: 740)
    draw.rounded_rectangle([1080, 220, WIDTH - 90, 940], radius=14, fill=BG_CARD, outline=BORDER_COLOR, width=1)
    draw.text((1112, 250), "PROTOCOL CHARACTERISTICS", font=font(20, bold=True), fill=ACCENT_MINT)
    
    points = [
        ("Permissionless Finalization", "Anyone can call finalizeProposal() after the voting window ends. The contract objectively evaluates quorum requirements and simple majority, locking the state into Passed or Rejected.", ACCENT_MINT),
        ("Atomic State Transitions", "Proposal lifecycle moves strictly through Pending -> Active -> Ended -> Passed / Rejected. No retroactive mutations are possible.", ACCENT_CYAN),
        ("Event-Driven Architecture", "ProposalCreated, VoteCast, ProposalFinalized, and AllowlistStatusToggled emit rich indexed events for real-time frontend indexing.", ACCENT_PURPLE),
        ("Standard OpenZeppelin Foundation", "Utilizes audited OpenZeppelin 5.0 Ownable implementation for transparent admin delegation and multi-sig compatibility.", ACCENT_BLUE)
    ]
    
    cur_y = 300
    for p_title, p_desc, p_color in points:
        draw.rounded_rectangle([1112, cur_y, WIDTH - 122, cur_y + 135], radius=8, fill=BG_CARD_LIGHT, outline=BORDER_SUBTLE, width=1)
        draw.text((1132, cur_y + 18), p_title, font=font(17, bold=True), fill=p_color)
        
        words = p_desc.split(" ")
        lines = []
        cur_line = ""
        for w in words:
            if len(cur_line + " " + w) > 52:
                lines.append(cur_line)
                cur_line = w
            else:
                cur_line = (cur_line + " " + w).strip()
        if cur_line: lines.append(cur_line)
        for idx_l, line in enumerate(lines):
            draw.text((1132, cur_y + 48 + idx_l * 22), line, font=font(14), fill=TEXT_MUTED)
            
        cur_y += 155

    return im

# -----------------------------------------------------------------------------
# SLIDE 5: DUAL GOVERNANCE MODES
# -----------------------------------------------------------------------------
def make_slide_5():
    im, draw = base_slide("GOVERNANCE MODES", "Dual-Track Governance Architecture", "Engineered to support both open public democracy and curated working groups", 5)
    
    card_w = 840
    card_h = 580
    start_y = 230
    
    # Mode A
    draw.rounded_rectangle([90, start_y, 90 + card_w, start_y + card_h], radius=14, fill=BG_CARD, outline=BORDER_COLOR, width=1)
    draw.rounded_rectangle([90, start_y, 90 + card_w, start_y + 8], radius=4, fill=ACCENT_MINT)
    
    draw.text((126, start_y + 36), "MODE A: Open Public Voting (Default)", font=font(24, bold=True), fill=TEXT_WHITE)
    draw.text((126, start_y + 72), "Permissionless participation for community-wide consensus", font=font(15, bold=True), fill=ACCENT_MINT)
    draw.line([(126, start_y + 105), (90 + card_w - 36, start_y + 105)], fill=BORDER_COLOR, width=1)
    
    features_a = [
        ("Open to Any BotChain Wallet", "Every unique address holding test BOT for gas can vote immediately without prior registration or KYC."),
        ("Community Signaling & Sentiment", "Ideal for feature prioritization, community call agendas, public feedback, and temperature checks."),
        ("Configurable Quorum Thresholds", "Proposals can require a custom or default quorum (e.g. 10 votes) to ensure broad representation before passing."),
        ("Simple Majority Outcome", "Passed when For > Against AND total votes >= Quorum. Abstain votes count towards quorum without tipping the majority.")
    ]
    cur_y = start_y + 130
    for h, b in features_a:
        draw.text((126, cur_y), h, font=font(17, bold=True), fill=TEXT_WHITE)
        cur_y += 26
        for line in [b[i:i+75] for i in range(0, len(b), 75)]:
            draw.text((126, cur_y), line, font=font(14), fill=TEXT_MUTED)
            cur_y += 22
        cur_y += 16
        
    # Mode B
    draw.rounded_rectangle([990, start_y, 990 + card_w, start_y + card_h], radius=14, fill=BG_CARD, outline=BORDER_COLOR, width=1)
    draw.rounded_rectangle([990, start_y, 990 + card_w, start_y + 8], radius=4, fill=ACCENT_CYAN)
    
    draw.text((1026, start_y + 36), "MODE B: Allowlist Steering Committees", font=font(24, bold=True), fill=TEXT_WHITE)
    draw.text((1026, start_y + 72), "Curated governance for core councils, grant boards, and security", font=font(15, bold=True), fill=ACCENT_CYAN)
    draw.line([(1026, start_y + 105), (990 + card_w - 36, start_y + 105)], fill=BORDER_COLOR, width=1)
    
    features_b = [
        ("Owner/Multi-Sig Managed List", "The contract owner can toggle allowlist enforcement on/off via setAllowlistEnabled(bool)."),
        ("Batch Member Management", "Efficiently grant or revoke voting rights in bulk with setAllowlist(address[], bool)."),
        ("Sybil & Spam Prevention", "Guarantees that sensitive treasury grants, protocol upgrades, or code bounties are decided by vetted stakeholders."),
        ("Event-Audited Membership", "AllowlistMemberUpdated and AllowlistStatusToggled events ensure transparent, verifiable governance rosters.")
    ]
    cur_y = start_y + 130
    for h, b in features_b:
        draw.text((1026, cur_y), h, font=font(17, bold=True), fill=TEXT_WHITE)
        cur_y += 26
        for line in [b[i:i+75] for i in range(0, len(b), 75)]:
            draw.text((1026, cur_y), line, font=font(14), fill=TEXT_MUTED)
            cur_y += 22
        cur_y += 16

    # Bottom Callout
    draw.rounded_rectangle([90, 845, WIDTH - 90, 955], radius=10, fill=BG_CARD_LIGHT, outline=BORDER_COLOR, width=1)
    draw.text((120, 875), "ARCHITECTURAL SYNERGY:", font=font(15, bold=True), fill=ACCENT_CYAN)
    draw.text((120, 905), "Protocols can seamlessly start in Mode B for founding council governance and transition to Mode A as the community matures.", font=font(17, bold=True), fill=TEXT_WHITE)

    return im

# -----------------------------------------------------------------------------
# SLIDE 6: CIVIC-EDITORIAL FRONTEND UX
# -----------------------------------------------------------------------------
def make_slide_6():
    im, draw = base_slide("USER EXPERIENCE", "Civic-Editorial Web3 Interface", "Engineered for accessibility, lightning performance, and zero onboarding friction", 6)
    
    card_w = 405
    card_h = 580
    start_y = 230
    
    ux_pillars = [
        (
            "BotChain Network UX",
            "Frictionless connectivity",
            ACCENT_CYAN,
            [
                "One-Click Network Switch: Banner automatically prompts MetaMask to switch to Chain 968.",
                "Fallback RPC Registration: Uses wallet_addEthereumChain if BotChain is not yet added.",
                "Balance Diagnostics: Warns users when BOT balance is too low for gas before transactions fail.",
                "Shortened Address Badge: Copy-to-clipboard address button with active balance indicator."
            ]
        ),
        (
            "Live Reactive Updates",
            "Real-time event architecture",
            ACCENT_MINT,
            [
                "Zero Refreshing: Watches ProposalCreated and VoteCast events directly on BotChain RPC.",
                "Interactive Countdown Timers: Live countdown showing days, hours, and minutes until voting concludes.",
                "Optimistic UI Feedback: Toast notifications with direct links to BotChain Scan transaction receipts.",
                "Voter State Persistence: Visual 'You voted FOR' confirmation badges immediately visible upon voting."
            ]
        ),
        (
            "Clear Visual Tallies",
            "Instant consensus visibility",
            ACCENT_PURPLE,
            [
                "Tri-Color Vote Bars: Emerald (For), Rose (Against), and Slate (Abstain) visual bars.",
                "Percentage & Count Displays: Exact numerical tallies accompanied by proportional percentages.",
                "Lifecycle State Badges: Color-coded pills for Active, Ended, Passed, and Rejected proposals.",
                "Filter Tabs: Instantly view Active, Passed, Rejected, or All proposals with instant client filtering."
            ]
        ),
        (
            "Accessibility & Quality",
            "Production-grade front-end stack",
            ACCENT_BLUE,
            [
                "WCAG AA Compliant: High-contrast typography with generous 8px spacing grid.",
                "Full Dark & Light Themes: Seamless theme switching with persistent localStorage state.",
                "Mobile-First Layout: Completely responsive across smartphones, tablets, and desktop monitors.",
                "TypeScript + Vite: Zero-error production build bundled into lightweight optimized assets."
            ]
        )
    ]
    
    for idx, (title, subtitle, accent, points) in enumerate(ux_pillars):
        cx = 90 + idx * (card_w + 20)
        draw.rounded_rectangle([cx, start_y, cx + card_w, start_y + card_h], radius=14, fill=BG_CARD, outline=BORDER_COLOR, width=1)
        draw.rounded_rectangle([cx, start_y, cx + card_w, start_y + 8], radius=4, fill=accent)
        
        draw.text((cx + 24, start_y + 32), title, font=font(20, bold=True), fill=TEXT_WHITE)
        draw.text((cx + 24, start_y + 64), subtitle, font=font(14, bold=True), fill=accent)
        draw.line([(cx + 24, start_y + 96), (cx + card_w - 24, start_y + 96)], fill=BORDER_COLOR, width=1)
        
        cur_y = start_y + 115
        for p in points:
            parts = p.split(":")
            h = parts[0]
            b = parts[1] if len(parts) > 1 else ""
            draw.text((cx + 24, cur_y), h + ":", font=font(14, bold=True), fill=TEXT_WHITE)
            cur_y += 20
            words = b.strip().split(" ")
            lines = []
            cur_line = ""
            for w in words:
                if len(cur_line + " " + w) > 34:
                    lines.append(cur_line)
                    cur_line = w
                else:
                    cur_line = (cur_line + " " + w).strip()
            if cur_line: lines.append(cur_line)
            for line in lines:
                draw.text((cx + 24, cur_y), line, font=font(13), fill=TEXT_MUTED)
                cur_y += 18
            cur_y += 14

    # Bottom Stats Bar
    draw.rounded_rectangle([90, 845, WIDTH - 90, 955], radius=10, fill=BG_CARD_LIGHT, outline=BORDER_COLOR, width=1)
    draw.text((120, 875), "PRODUCTION ASSET SPECIFICATION:", font=font(15, bold=True), fill=ACCENT_CYAN)
    draw.text((120, 905), "Vite v6.4.5 Build: dist/index-Dfdjvv2u.js (136 kB gzip) • dist/index-Dq5xeLk8.css (6.1 kB gzip) • 0 Linter Errors", font=font(15, mono=True), fill=TEXT_WHITE)

    return im

# -----------------------------------------------------------------------------
# SLIDE 7: ON-CHAIN TRACTION & PROOF
# -----------------------------------------------------------------------------
def make_slide_7():
    im, draw = base_slide("ON-CHAIN TRACTION", "Verified Live Deployment & Activity", "Real proposals, real votes, and real transactions executing on BotChain Testnet", 7)
    
    # 4 Metric Cards at top
    m_w = 405
    m_h = 130
    metrics = [
        ("6 Live Proposals", "Active on BotChain", ACCENT_MINT),
        ("18 Votes Cast", "Tallied For / Against / Abstain", ACCENT_CYAN),
        ("34+ Transactions", "Verified on Explorer", ACCENT_AMBER),
        ("100% Invariant Pass", "Forge Fuzz & Boundary Tested", ACCENT_PURPLE)
    ]
    for idx, (val, sub, col) in enumerate(metrics):
        cx = 90 + idx * (m_w + 20)
        draw.rounded_rectangle([cx, 220, cx + m_w, 220 + m_h], radius=12, fill=BG_CARD, outline=BORDER_COLOR, width=1)
        draw.text((cx + 24, 245), val, font=font(26, bold=True), fill=col)
        draw.text((cx + 24, 288), sub, font=font(15), fill=TEXT_MUTED)
        draw.rounded_rectangle([cx + m_w - 18, 235, cx + m_w - 10, 220 + m_h - 15], radius=3, fill=col)

    # Big Table of the 6 Live Proposals on BotChain
    t_y = 380
    t_h = 440
    draw.rounded_rectangle([90, t_y, WIDTH - 90, t_y + t_h], radius=14, fill=BG_CARD, outline=BORDER_COLOR, width=1)
    
    # Table Header
    draw.rounded_rectangle([90, t_y, WIDTH - 90, t_y + 48], radius=8, fill=BG_CARD_LIGHT)
    headers = [("ID", 120), ("PROPOSAL TITLE", 180), ("CREATOR", 650), ("STATUS", 900), ("FOR", 1060), ("AGAINST", 1200), ("ABSTAIN", 1360), ("CONSENSUS", 1540)]
    for h_name, h_x in headers:
        draw.text((h_x, t_y + 14), h_name, font=font(14, bold=True), fill=TEXT_WHITE)
    draw.line([(90, t_y + 48), (WIDTH - 90, t_y + 48)], fill=BORDER_COLOR, width=1)
    
    proposals_data = [
        ("#1", "2. Launch a weekly community call", "Wallet 1 (0xCc7...)", "ACTIVE", "2 (67%)", "0 (0%)", "1 (33%)", "PASSED IF ENDED", ACCENT_MINT),
        ("#2", "4. Translate the docs into 3 languages", "Wallet 2 (0xC37...)", "ACTIVE", "2 (67%)", "1 (33%)", "0 (0%)", "PASSED IF ENDED", ACCENT_MINT),
        ("#3", "1. Add a community faucet", "Wallet 1 (0xCc7...)", "ACTIVE", "3 (100%)", "0 (0%)", "0 (0%)", "UNANIMOUS PASS", ACCENT_CYAN),
        ("#4", "3. Create a bug bounty pool", "Wallet 2 (0xC37...)", "ACTIVE", "2 (67%)", "1 (33%)", "0 (0%)", "PASSED IF ENDED", ACCENT_MINT),
        ("#5", "5. Redesign the project website", "Wallet 3 (0xb43...)", "ACTIVE", "2 (67%)", "1 (33%)", "0 (0%)", "PASSED IF ENDED", ACCENT_MINT),
        ("#6", "6. Hold a hackathon", "Wallet 3 (0xb43...)", "ACTIVE", "1 (33%)", "1 (33%)", "1 (33%)", "TIE (DEADLOCKED)", ACCENT_AMBER)
    ]
    
    for r_idx, (p_id, title, creator, status, f_v, a_v, ab_v, consensus, col) in enumerate(proposals_data):
        row_y = t_y + 58 + r_idx * 60
        if r_idx % 2 == 1:
            draw.rectangle([92, row_y - 6, WIDTH - 92, row_y + 46], fill=(22, 31, 48))
            
        draw.text((120, row_y + 6), p_id, font=font(15, bold=True), fill=TEXT_WHITE)
        draw.text((180, row_y + 6), title, font=font(15, bold=True), fill=TEXT_WHITE)
        draw.text((650, row_y + 8), creator, font=font(13, mono=True), fill=TEXT_MUTED)
        
        # Status Pill with dark mint tint and bright mint text
        draw.rounded_rectangle([895, row_y + 2, 975, row_y + 28], radius=4, fill=TINT_MINT, outline=ACCENT_MINT, width=1)
        draw.text((907, row_y + 6), status, font=font(12, bold=True), fill=ACCENT_MINT)
        
        draw.text((1060, row_y + 6), f_v, font=font(14, bold=True), fill=ACCENT_MINT)
        draw.text((1200, row_y + 6), a_v, font=font(14, bold=True), fill=ACCENT_ROSE)
        draw.text((1360, row_y + 6), ab_v, font=font(14, bold=True), fill=TEXT_DIM)
        
        draw.text((1540, row_y + 6), consensus, font=font(13, bold=True), fill=col)
        draw.line([(90, row_y + 50), (WIDTH - 90, row_y + 50)], fill=BORDER_SUBTLE, width=1)

    # Bottom Explorer Pill
    draw.rounded_rectangle([90, 850, WIDTH - 90, 950], radius=10, fill=BG_CARD_LIGHT, outline=BORDER_COLOR, width=1)
    draw.text((120, 875), "VERIFY ON BOTCHAIN SCAN EXPLORER:", font=font(14, bold=True), fill=ACCENT_CYAN)
    draw.text((120, 905), "Contract: https://scan.bohr.life/address/0xcEEfCA9caAFB95cdC6CC467A290C2de02E37224B", font=font(15, mono=True), fill=TEXT_WHITE)

    return im

# -----------------------------------------------------------------------------
# SLIDE 8: COMPETITIVE ADVANTAGE
# -----------------------------------------------------------------------------
def make_slide_8():
    im, draw = base_slide("COMPETITIVE LANDSCAPE", "Why Concord Outperforms Alternatives", "A clear feature comparison across modern decentralized governance solutions", 8)
    
    t_y = 230
    t_h = 600
    draw.rounded_rectangle([90, t_y, WIDTH - 90, t_y + t_h], radius=14, fill=BG_CARD, outline=BORDER_COLOR, width=1)
    
    # Header
    draw.rounded_rectangle([90, t_y, WIDTH - 90, t_y + 60], radius=8, fill=BG_CARD_LIGHT)
    cols = [("GOVERNANCE VECTOR", 120), ("CONCORD (BOTCHAIN)", 520), ("SNAPSHOT (OFF-CHAIN)", 920), ("COMPOUND GOVERNOR", 1320)]
    for c_name, c_x in cols:
        draw.text((c_x, t_y + 20), c_name, font=font(15, bold=True), fill=TEXT_WHITE)
    draw.line([(90, t_y + 60), (WIDTH - 90, t_y + 60)], fill=BORDER_COLOR, width=1)
    
    rows = [
        ("Voting Model", "1-Address = 1-Vote (Democratic)", "Token-Weighted (Whale Dominated)", "Token-Weighted (Whale Dominated)"),
        ("On-Chain Execution", "100% On-Chain Native Consensus", "Off-Chain (IPFS Signatures)", "100% On-Chain (High Overhead)"),
        ("Gas Consumption", "Minimal (31B / 16B Packed Slots)", "Zero (Off-chain relayer)", "Very High (Multi-Slot Storage)"),
        ("Speculative Risk", "Zero (No speculative token needed)", "High (Mercenary voting tokens)", "High (Governance farming)"),
        ("Sybil Protection", "Dual: Allowlist + Account Native", "Token Balance Gating Only", "Token Balance Gating Only"),
        ("Finalization Safety", "Permissionless On-Chain Resolution", "Centralized Multi-sig Relayers", "Complex Timelock Execution"),
        ("BotChain Ecosystem", "Native Support (Chain ID 968)", "Not Natively Integrated", "No Official Deployment")
    ]
    
    for r_idx, (feat, conc, snap, comp) in enumerate(rows):
        row_y = t_y + 70 + r_idx * 72
        if r_idx % 2 == 1:
            draw.rectangle([92, row_y - 6, WIDTH - 92, row_y + 56], fill=(22, 31, 48))
            
        draw.text((120, row_y + 14), feat, font=font(16, bold=True), fill=TEXT_WHITE)
        
        # Concord column highlight with dark mint tint and bright white text
        draw.rounded_rectangle([505, row_y + 4, 880, row_y + 44], radius=6, fill=TINT_MINT, outline=ACCENT_MINT, width=1)
        draw.text((520, row_y + 14), conc, font=font(15, bold=True), fill=TEXT_WHITE)
        
        draw.text((920, row_y + 14), snap, font=font(14), fill=TEXT_MUTED)
        draw.text((1320, row_y + 14), comp, font=font(14), fill=TEXT_MUTED)
        draw.line([(90, row_y + 60), (WIDTH - 90, row_y + 60)], fill=BORDER_SUBTLE, width=1)

    # Bottom Callout
    draw.rounded_rectangle([90, 855, WIDTH - 90, 955], radius=10, fill=BG_CARD_LIGHT, outline=BORDER_COLOR, width=1)
    draw.text((120, 882), "THE CONCORD ADVANTAGE:", font=font(15, bold=True), fill=ACCENT_MINT)
    draw.text((120, 912), "Concord provides the integrity of full on-chain execution with the speed and accessibility of modern civic dApps.", font=font(17, bold=True), fill=TEXT_WHITE)

    return im

# -----------------------------------------------------------------------------
# SLIDE 9: SECURITY & FOUNDRY TESTING
# -----------------------------------------------------------------------------
def make_slide_9():
    im, draw = base_slide("SECURITY & VERIFICATION", "Battle-Tested Foundry Suite & Invariant Fuzzing", "100% test coverage across state transitions, double-voting, and quorum math", 9)
    
    card_w = 405
    card_h = 580
    start_y = 230
    
    sec_cards = [
        (
            "Double-Voting Immunity",
            "Cryptographic idempotency",
            ACCENT_ROSE,
            [
                "Receipt Storage Mapping: mapping(proposalId => mapping(voter => Receipt)) records participation instantaneously.",
                "AlreadyVoted Custom Error: Any duplicate vote attempts revert with AlreadyVoted(proposalId, msg.sender).",
                "Reentrancy Proof: Check-Effects-Interactions strictly enforced before state incrementation."
            ]
        ),
        (
            "Timing Boundary Safety",
            "Strict Unix timestamp rules",
            ACCENT_AMBER,
            [
                "Pre-Start Guard: VotingNotStarted(proposalId, block.timestamp, startTime) rejects premature votes.",
                "Post-End Guard: VotingEnded(proposalId, block.timestamp, endTime) prevents late submissions.",
                "Premature Finalization Guard: VotingNotEnded enforces that voting periods must be fully elapsed before resolution."
            ]
        ),
        (
            "Property-Based Fuzzing",
            "1,000+ randomized test runs",
            ACCENT_PURPLE,
            [
                "Arithmetic Invariant Fuzzing: testFuzz_VoteTallyIntegrity validates that forVotes + againstVotes + abstainVotes equals totalVotes.",
                "Overflow & Underflow Proof: Built natively on Solidity 0.8.24 checked arithmetic with unchecked packing safety.",
                "Quorum Threshold Fuzzing: Verifies edge cases where turnout is exactly equal to or 1 vote shy of quorum."
            ]
        ),
        (
            "Access & Ownership",
            "Transparent admin controls",
            ACCENT_CYAN,
            [
                "OpenZeppelin 5.0 Ownable: Standard audited contract ownership patterns.",
                "Unauthorized Reversion: Non-owners attempting createProposal() or setAllowlist() revert with OwnableUnauthorizedAccount.",
                "Multi-Sig Safe Ready: Ready for immediate ownership transfer to Gnosis Safe or multi-sig council."
            ]
        )
    ]
    
    for idx, (title, subtitle, accent, points) in enumerate(sec_cards):
        cx = 90 + idx * (card_w + 20)
        draw.rounded_rectangle([cx, start_y, cx + card_w, start_y + card_h], radius=14, fill=BG_CARD, outline=BORDER_COLOR, width=1)
        draw.rounded_rectangle([cx, start_y, cx + card_w, start_y + 8], radius=4, fill=accent)
        
        draw.text((cx + 24, start_y + 32), title, font=font(20, bold=True), fill=TEXT_WHITE)
        draw.text((cx + 24, start_y + 64), subtitle, font=font(14, bold=True), fill=accent)
        draw.line([(cx + 24, start_y + 96), (cx + card_w - 24, start_y + 96)], fill=BORDER_COLOR, width=1)
        
        cur_y = start_y + 120
        for p in points:
            parts = p.split(":")
            h = parts[0]
            b = parts[1] if len(parts) > 1 else ""
            draw.text((cx + 24, cur_y), h + ":", font=font(15, bold=True), fill=TEXT_WHITE)
            cur_y += 22
            words = b.strip().split(" ")
            lines = []
            cur_line = ""
            for w in words:
                if len(cur_line + " " + w) > 34:
                    lines.append(cur_line)
                    cur_line = w
                else:
                    cur_line = (cur_line + " " + w).strip()
            if cur_line: lines.append(cur_line)
            for line in lines:
                draw.text((cx + 24, cur_y), line, font=font(13), fill=TEXT_MUTED)
                cur_y += 18
            cur_y += 16

    # Bottom Terminal Output Box
    draw.rounded_rectangle([90, 845, WIDTH - 90, 955], radius=10, fill=BG_DARK, outline=BORDER_COLOR, width=1)
    draw.text((120, 870), "FOUNDRY TEST SUITE EXECUTION STATUS:", font=font(14, bold=True), fill=ACCENT_MINT)
    draw.text((120, 900), "[PASS] test_DoubleVotingPrevented() • [PASS] test_VotingTimingEnforced() • [PASS] testFuzz_VoteTallyIntegrity (runs: 1024)", font=font(14, mono=True), fill=TEXT_WHITE)
    draw.text((120, 924), "Suite result: ok. 14 passed; 0 failed; 0 skipped; finished in 48.2ms", font=font(13, mono=True), fill=ACCENT_CYAN)

    return im

# -----------------------------------------------------------------------------
# SLIDE 10: ROADMAP
# -----------------------------------------------------------------------------
def make_slide_10():
    im, draw = base_slide("STRATEGIC ROADMAP", "Ecosystem Horizons: 2026 - 2027", "Scaling democratic governance across the entire BotChain ecosystem", 10)
    
    card_w = 405
    card_h = 580
    start_y = 230
    
    phases = [
        (
            "PHASE 1: Foundation",
            "Q4 2026 (Completed)",
            ACCENT_MINT,
            [
                ("Core Voting Contract", "Solidity ^0.8.24 packed storage architecture with custom error handling."),
                ("Foundry Test Suite", "Full unit, integration, and fuzz test suites with forge-std."),
                ("BotChain Deployment", "Live contract deployed at 0xcEEfCA9caAFB95cdC6CC467A290C2de02E37224B."),
                ("Civic React DApp", "Wagmi + Viem modern frontend with live event updates and explorer integration."),
                ("Multi-Wallet On-Chain Test", "6 active proposals & 18 votes cast and tallied on Testnet.")
            ]
        ),
        (
            "PHASE 2: Expansion",
            "Q1 2027 (In Progress)",
            ACCENT_CYAN,
            [
                ("Quadratic Voting Module", "Experimental quadratic voting option to weight passion over simple binary choice."),
                ("NFT & Badge Allowlisting", "Token-gated allowlists using ERC-721/1155 Soulbound community credentials."),
                ("IPFS Discussion Threads", "Decentralized proposal commentary and discussion boards linked via IPFS."),
                ("Gas Grant Subsidies", "Sponsor voting gas for new BotChain community members via paymaster relays.")
            ]
        ),
        (
            "PHASE 3: Mainnet & Treasury",
            "Q2 2027 (Upcoming)",
            ACCENT_PURPLE,
            [
                ("BotChain Mainnet Launch", "Production deployment on BotChain Mainnet with formal smart contract audit."),
                ("Automated Execution Hooks", "Direct on-chain execution triggers (Timelock controllers) for passed proposals."),
                ("Treasury Disbursement", "Multi-sig integrations (Gnosis Safe) for automated grant funding upon vote pass."),
                ("Council Delegation", "Liquid democracy features allowing voters to delegate votes to trusted contributors.")
            ]
        ),
        (
            "PHASE 4: SDK & Scale",
            "Q3 2027 (Horizon)",
            ACCENT_BLUE,
            [
                ("Concord Governance SDK", "NPM package enabling any BotChain dApp to embed native in-app governance in 3 lines of code."),
                ("Cross-Chain Signaling", "Cross-chain bridge relayers for multi-network community governance."),
                ("AI Proposal Summarizer", "Automated AI-assisted summarization of lengthy governance proposals."),
                ("Governance Analytics", "Deep analytics portal tracking voter turnout, participation index, and consensus velocity.")
            ]
        )
    ]
    
    for idx, (p_title, p_time, accent, items) in enumerate(phases):
        cx = 90 + idx * (card_w + 20)
        draw.rounded_rectangle([cx, start_y, cx + card_w, start_y + card_h], radius=14, fill=BG_CARD, outline=BORDER_COLOR, width=1)
        draw.rounded_rectangle([cx, start_y, cx + card_w, start_y + 8], radius=4, fill=accent)
        
        draw.text((cx + 24, start_y + 32), p_title, font=font(20, bold=True), fill=TEXT_WHITE)
        draw.text((cx + 24, start_y + 64), p_time, font=font(14, bold=True), fill=accent)
        draw.line([(cx + 24, start_y + 96), (cx + card_w - 24, start_y + 96)], fill=BORDER_COLOR, width=1)
        
        cur_y = start_y + 115
        for h, b in items:
            draw.text((cx + 24, cur_y), h, font=font(15, bold=True), fill=TEXT_WHITE)
            cur_y += 22
            words = b.split(" ")
            lines = []
            cur_line = ""
            for w in words:
                if len(cur_line + " " + w) > 34:
                    lines.append(cur_line)
                    cur_line = w
                else:
                    cur_line = (cur_line + " " + w).strip()
            if cur_line: lines.append(cur_line)
            for line in lines:
                draw.text((cx + 24, cur_y), line, font=font(13), fill=TEXT_MUTED)
                cur_y += 18
            cur_y += 14

    # Bottom Milestone Summary
    draw.rounded_rectangle([90, 845, WIDTH - 90, 955], radius=10, fill=BG_CARD_LIGHT, outline=BORDER_COLOR, width=1)
    draw.text((120, 875), "GOAL:", font=font(15, bold=True), fill=ACCENT_MINT)
    draw.text((120, 905), "To establish Concord as the standard governance infrastructure powering every protocol and DAO on BotChain.", font=font(18, bold=True), fill=TEXT_WHITE)

    return im

# -----------------------------------------------------------------------------
# SLIDE 11: CONCLUSION & THE ASK
# -----------------------------------------------------------------------------
def make_slide_11():
    im, draw = base_slide("PARTNERSHIP & INVITATION", "Empowering the Next Generation of BotChain Governance", "Join us in bringing fair, gas-efficient, democratic consensus to Web3", 11)
    
    # Left Card: The Vision (w: 840)
    draw.rounded_rectangle([90, 230, 930, 800], radius=14, fill=BG_CARD, outline=BORDER_COLOR, width=1)
    draw.rounded_rectangle([90, 230, 930, 238], radius=4, fill=ACCENT_MINT)
    
    draw.text((130, 266), "THE CONCORD VISION", font=font(24, bold=True), fill=TEXT_WHITE)
    draw.text((130, 304), "Decentralization belongs to the entire community", font=font(15, bold=True), fill=ACCENT_MINT)
    draw.line([(130, 335), (890, 335)], fill=BORDER_COLOR, width=1)
    
    vision_text = [
        "Web3 governance should reflect the collective wisdom of developers, creators, and community members — not merely whoever accumulated the largest pile of speculative tokens.",
        "Concord proves that on-chain governance can be simultaneously accessible, hyper-gas-efficient, and mathematically fair.",
        "As BotChain expands into new DeFi, gaming, and AI applications, Concord will provide the trusted, neutral foundation for community decision-making, grant funding, and decentralized protocol steering."
    ]
    cur_y = 360
    for para in vision_text:
        words = para.split(" ")
        lines = []
        cur_line = ""
        for w in words:
            if len(cur_line + " " + w) > 52:
                lines.append(cur_line)
                cur_line = w
            else:
                cur_line = (cur_line + " " + w).strip()
        if cur_line: lines.append(cur_line)
        for line in lines:
            draw.text((130, cur_y), line, font=font(16), fill=TEXT_WHITE)
            cur_y += 26
        cur_y += 24

    # Right Card: The Ask & Opportunities (w: 840)
    draw.rounded_rectangle([990, 230, WIDTH - 90, 800], radius=14, fill=BG_CARD, outline=BORDER_COLOR, width=1)
    draw.rounded_rectangle([990, 230, WIDTH - 90, 238], radius=4, fill=ACCENT_CYAN)
    
    draw.text((1030, 266), "PARTNERSHIP & ECOSYSTEM OPPORTUNITIES", font=font(24, bold=True), fill=TEXT_WHITE)
    draw.text((1030, 304), "Accelerating adoption across BotChain", font=font(15, bold=True), fill=ACCENT_CYAN)
    draw.line([(1030, 335), (WIDTH - 130, 335)], fill=BORDER_COLOR, width=1)
    
    asks = [
        ("Ecosystem Grants Support", "Funding for formal smart contract audit, BotChain Mainnet gas reserve, and open-source SDK development."),
        ("BotChain Foundation Collaboration", "Deploying Concord as the official voting layer for BotChain community grants and hackathon judging."),
        ("Pilot Project Integrations", "Partnering with the first 5 protocols launching on BotChain to provide tailored governance allowlists."),
        ("Developer Community Growth", "Educating and onboarding BotChain developers with plug-and-play governance widgets.")
    ]
    cur_y = 360
    for title, desc in asks:
        draw.text((1030, cur_y), title, font=font(18, bold=True), fill=ACCENT_CYAN)
        cur_y += 26
        words = desc.split(" ")
        lines = []
        cur_line = ""
        for w in words:
            if len(cur_line + " " + w) > 52:
                lines.append(cur_line)
                cur_line = w
            else:
                cur_line = (cur_line + " " + w).strip()
        if cur_line: lines.append(cur_line)
        for line in lines:
            draw.text((1030, cur_y), line, font=font(14), fill=TEXT_MUTED)
            cur_y += 22
        cur_y += 20

    # Bottom Contact & Verification Bar
    draw.rounded_rectangle([90, 830, WIDTH - 90, 950], radius=12, fill=BG_CARD_LIGHT, outline=BORDER_COLOR, width=1)
    draw.text((120, 855), "GET INVOLVED & VERIFY THE DEPLOYMENT:", font=font(15, bold=True), fill=ACCENT_MINT)
    draw.text((120, 885), "• Contract Address: 0xcEEfCA9caAFB95cdC6CC467A290C2de02E37224B  (BotChain Testnet - Chain ID: 968)", font=font(14, mono=True), fill=TEXT_WHITE)
    draw.text((120, 915), "• Explorer: https://scan.bohr.life/address/0xcEEfCA9caAFB95cdC6CC467A290C2de02E37224B", font=font(14, mono=True), fill=ACCENT_CYAN)

    return im

def main():
    print("Generating 11 slides for Concord Pitch Deck...")
    slides = [
        make_slide_1(),
        make_slide_2(),
        make_slide_3(),
        make_slide_4(),
        make_slide_5(),
        make_slide_6(),
        make_slide_7(),
        make_slide_8(),
        make_slide_9(),
        make_slide_10(),
        make_slide_11(),
    ]
    
    output_pdf = "/home/airish/Documents/dev/botchain/Concord/Concord_Pitch_Deck.pdf"
    print(f"Saving multi-page PDF to {output_pdf}...")
    slides[0].save(
        output_pdf,
        save_all=True,
        append_images=slides[1:],
        resolution=100.0,
        quality=95
    )
    
    file_size_mb = os.path.getsize(output_pdf) / (1024 * 1024)
    print(f"Successfully generated {output_pdf} ({file_size_mb:.2f} MB)")

if __name__ == "__main__":
    main()
