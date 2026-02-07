// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StFXRP — Staked FXRP Vault
 * @notice Minimal ERC-4626-style vault: deposit FTestXRP, receive stFXRP.
 *         Exchange rate increases when owner distributes rewards.
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
}

contract StFXRP {
    string public constant name = "Staked FXRP";
    string public constant symbol = "stFXRP";

    IERC20 public immutable asset;
    address public owner;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    event RewardsDistributed(uint256 amount);

    constructor(address _asset) {
        asset = IERC20(_asset);
        owner = msg.sender;
    }

    function decimals() public view returns (uint8) {
        return asset.decimals();
    }

    // --- ERC-20 functions for stFXRP token ---

    function transfer(address to, uint256 amount) public returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    // --- Vault logic ---

    /// @notice Total FTestXRP held by the vault
    function totalAssets() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    /// @notice Convert asset amount to share amount
    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply;
        if (supply == 0) return assets;
        return (assets * supply) / totalAssets();
    }

    /// @notice Convert share amount to asset amount
    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply;
        if (supply == 0) return shares;
        return (shares * totalAssets()) / supply;
    }

    /// @notice Deposit FTestXRP, receive stFXRP
    function deposit(uint256 assets, address receiver) public returns (uint256 shares) {
        shares = convertToShares(assets);
        require(shares > 0, "zero shares");

        asset.transferFrom(msg.sender, address(this), assets);

        totalSupply += shares;
        balanceOf[receiver] += shares;

        emit Transfer(address(0), receiver, shares);
        emit Deposit(msg.sender, receiver, assets, shares);
    }

    /// @notice Convenience: deposit to msg.sender
    function deposit(uint256 assets) external returns (uint256) {
        return deposit(assets, msg.sender);
    }

    /// @notice Withdraw FTestXRP by burning stFXRP
    function withdraw(uint256 assets, address receiver, address _owner) public returns (uint256 shares) {
        shares = convertToShares(assets);

        if (msg.sender != _owner) {
            allowance[_owner][msg.sender] -= shares;
        }

        totalSupply -= shares;
        balanceOf[_owner] -= shares;

        asset.transfer(receiver, assets);

        emit Transfer(_owner, address(0), shares);
        emit Withdraw(msg.sender, receiver, _owner, assets, shares);
    }

    /// @notice Redeem stFXRP shares for FTestXRP
    function redeem(uint256 shares, address receiver, address _owner) public returns (uint256 assets) {
        assets = convertToAssets(shares);

        if (msg.sender != _owner) {
            allowance[_owner][msg.sender] -= shares;
        }

        totalSupply -= shares;
        balanceOf[_owner] -= shares;

        asset.transfer(receiver, assets);

        emit Transfer(_owner, address(0), shares);
        emit Withdraw(msg.sender, receiver, _owner, assets, shares);
    }

    /// @notice Convenience: redeem to msg.sender
    function redeem(uint256 shares) external returns (uint256) {
        return redeem(shares, msg.sender, msg.sender);
    }

    /// @notice Owner distributes extra FTestXRP as yield (increases exchange rate)
    function distributeRewards(uint256 amount) external {
        require(msg.sender == owner, "not owner");
        asset.transferFrom(msg.sender, address(this), amount);
        emit RewardsDistributed(amount);
    }
}
