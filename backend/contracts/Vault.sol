// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import {ERC20} from "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./Strategy.sol";

contract Vault is ERC20 {

    receive() external payable {}

    address public owner;
    Strategy private strategy;
    uint256 performanceFee = 10; // % of taken fee
    uint256 startValue; // balance before epoch start

    uint256 EpochStartingTime = 0; // time when the epoch had started
    uint256 private TimeForDeposit = 24 hours; // time you have for deposition

    constructor() ERC20("Liquidity Provider Token", "LP-TKN") {
        // token = IERC20(token_);
        owner = msg.sender;
        strategy = new Strategy(address(this));

    }

    //Check if msg.sender is owner
    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the Owner!");
        _;
    }

    //Check if time when you calling a function is within the epoch
    modifier openVaultForDepositsAndWithdraw(){
        require(
            ((EpochStartingTime + TimeForDeposit) >= block.timestamp) && (EpochStartingTime <= block.timestamp), 
            "Epoch not started!"
        );
        _;
    } 

    /**@notice owner starts epoch by calling this function
    * `EpochStartingTime` variable saves the timestamp at wich the epoch started
    *  Epoch lasts for 24 hours in our context.
    *  During this time you able to deposit and withdraw
    */
    function startEpoch() external onlyOwner {
        EpochStartingTime = block.timestamp;
    }

    /** @notice function `setTimeForDeposit` if you want to correct how long epoch lasts
    *   @param _time epoch-length time
    */
    function setTimeForDeposit(uint256 _time) external onlyOwner{
        TimeForDeposit = _time;
    }

    // function returnTime() external view returns(uint256){
    //     return block.timestamp;
    // }


    function deposit() external payable openVaultForDepositsAndWithdraw{

        uint256 amountToken = msg.value;
        require(amountToken > 0);

        uint256 supplyLPToken = this.totalSupply();
        uint256 balanceToken = (address(this).balance - amountToken);

        uint256 amountLPToken;
        if (balanceToken == 0) {
            amountLPToken = amountToken;
        } else {
            amountLPToken = (amountToken * supplyLPToken) / balanceToken;
        }

        _mint(msg.sender, amountLPToken);
    }

    function withdraw() external openVaultForDepositsAndWithdraw {
        address payable _to = payable(msg.sender);

        uint256 amountLPToken = this.balanceOf(msg.sender);
        require(amountLPToken > 0);

        uint256 supplyLPToken = this.totalSupply();
        uint256 balanceToken = address(this).balance;

        uint256 amountToken = (amountLPToken * balanceToken) / supplyLPToken;

        _burn(_to, amountLPToken);
        _to.transfer(amountToken);

        // token.transfer(msg.sender, amountToken);
    }


    /** @dev Send `balance` of the pool to the strategy address.
    * `startValue` variable saves the balance at which the strategy iteration started.
    */
    function sendToStrategy() external onlyOwner {
        EpochStartingTime = 0;
        address payable _to = payable(address(strategy));
        startValue = address(this).balance;
        _to.transfer(startValue);

        strategy.callOperate();
    }

    function getFromStrategy() external onlyOwner {
        require(startValue > 0);
        
        strategy.callRedeem();  
        strategy.sendToPool();

        uint256 pnl = address(this).balance - startValue;

        if(pnl > 0){
            address payable _to = payable(owner); 
            _to.transfer((pnl * performanceFee / 100));
        }
            
    }

    function getStrategyBalance() public view returns(uint amount, address strat){
        amount = strategy.getBalance();
        strat = address(strategy);
    }

    function testSend() public payable {}


}