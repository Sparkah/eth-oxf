// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FlareBet — FTSO-Resolved Prediction Markets
 * @notice Binary outcome prediction markets using native C2FLR.
 *         Markets resolve trustlessly via Flare's FTSO price oracle.
 */

interface IContractRegistry {
    function getContractAddressByName(string calldata _name) external view returns (address);
}

interface IFtsoV2 {
    function getFeedByIdInWei(bytes21 _feedId) external payable returns (uint256 _value, uint64 _timestamp);
}

contract FlareBet {
    struct Market {
        string question;
        bytes21 feedId;
        uint256 targetPrice;    // 18 decimals (wei format from FTSO)
        uint256 deadline;       // block.timestamp after which resolve() can be called
        uint256 yesPool;
        uint256 noPool;
        uint256 resolvedPrice;  // set on resolution
        bool resolved;
        bool outcome;           // true = YES won
        address creator;
    }

    IContractRegistry public immutable registry;

    uint256 public nextMarketId;
    mapping(uint256 => Market) public markets;
    // marketId => user => YES bet amount
    mapping(uint256 => mapping(address => uint256)) public yesBets;
    // marketId => user => NO bet amount
    mapping(uint256 => mapping(address => uint256)) public noBets;
    // marketId => user => claimed
    mapping(uint256 => mapping(address => bool)) public claimed;

    event MarketCreated(uint256 indexed marketId, string question, bytes21 feedId, uint256 targetPrice, uint256 deadline, address creator);
    event BetPlaced(uint256 indexed marketId, address indexed user, bool isYes, uint256 amount);
    event MarketResolved(uint256 indexed marketId, bool outcome, uint256 resolvedPrice);
    event Claimed(uint256 indexed marketId, address indexed user, uint256 payout);

    constructor(address _registry) {
        registry = IContractRegistry(_registry);
    }

    function createMarket(
        bytes21 _feedId,
        uint256 _targetPrice,
        uint256 _deadline,
        string calldata _question
    ) external returns (uint256 marketId) {
        require(_deadline > block.timestamp, "deadline must be in the future");
        require(_targetPrice > 0, "target price must be > 0");

        marketId = nextMarketId++;
        Market storage m = markets[marketId];
        m.question = _question;
        m.feedId = _feedId;
        m.targetPrice = _targetPrice;
        m.deadline = _deadline;
        m.creator = msg.sender;

        emit MarketCreated(marketId, _question, _feedId, _targetPrice, _deadline, msg.sender);
    }

    function bet(uint256 _marketId, bool _isYes) external payable {
        Market storage m = markets[_marketId];
        require(!m.resolved, "market already resolved");
        require(block.timestamp < m.deadline, "market expired");
        require(msg.value > 0, "must send value");

        if (_isYes) {
            m.yesPool += msg.value;
            yesBets[_marketId][msg.sender] += msg.value;
        } else {
            m.noPool += msg.value;
            noBets[_marketId][msg.sender] += msg.value;
        }

        emit BetPlaced(_marketId, msg.sender, _isYes, msg.value);
    }

    function resolve(uint256 _marketId) external {
        Market storage m = markets[_marketId];
        require(!m.resolved, "already resolved");
        require(block.timestamp >= m.deadline, "not yet expired");

        // Get FtsoV2 address from ContractRegistry
        address ftsoV2 = registry.getContractAddressByName("FtsoV2");
        require(ftsoV2 != address(0), "FtsoV2 not found");

        // Fetch price in wei (18 decimals)
        (uint256 price, ) = IFtsoV2(ftsoV2).getFeedByIdInWei(m.feedId);

        m.resolvedPrice = price;
        m.resolved = true;
        m.outcome = price >= m.targetPrice;

        emit MarketResolved(_marketId, m.outcome, price);
    }

    function claim(uint256 _marketId) external {
        Market storage m = markets[_marketId];
        require(m.resolved, "not resolved");
        require(!claimed[_marketId][msg.sender], "already claimed");

        claimed[_marketId][msg.sender] = true;

        uint256 payout = calculatePayout(_marketId, msg.sender);
        require(payout > 0, "nothing to claim");

        (bool ok, ) = msg.sender.call{value: payout}("");
        require(ok, "transfer failed");

        emit Claimed(_marketId, msg.sender, payout);
    }

    function calculatePayout(uint256 _marketId, address _user) public view returns (uint256) {
        Market storage m = markets[_marketId];
        if (!m.resolved) return 0;

        uint256 totalPool = m.yesPool + m.noPool;
        if (totalPool == 0) return 0;

        if (m.outcome) {
            // YES won
            uint256 userYes = yesBets[_marketId][_user];
            if (m.yesPool == 0) {
                // No YES bettors — refund NO bettors
                return noBets[_marketId][_user];
            }
            return (userYes * totalPool) / m.yesPool;
        } else {
            // NO won
            uint256 userNo = noBets[_marketId][_user];
            if (m.noPool == 0) {
                // No NO bettors — refund YES bettors
                return yesBets[_marketId][_user];
            }
            return (userNo * totalPool) / m.noPool;
        }
    }

    /// @notice Read full market data (the auto-generated getter for structs is awkward)
    function getMarket(uint256 _marketId) external view returns (
        string memory question,
        bytes21 feedId,
        uint256 targetPrice,
        uint256 deadline,
        uint256 yesPool,
        uint256 noPool,
        uint256 resolvedPrice,
        bool resolved,
        bool outcome,
        address creator
    ) {
        Market storage m = markets[_marketId];
        return (m.question, m.feedId, m.targetPrice, m.deadline, m.yesPool, m.noPool, m.resolvedPrice, m.resolved, m.outcome, m.creator);
    }

    receive() external payable {}
}
