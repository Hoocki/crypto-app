// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import {ERC20} from "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./Strategy.sol";

contract Vault is ERC20 {

    receive() external payable {}

    address public owner;//owner of contract
    Strategy private strategy;//strategy conract object
    uint256 performanceFee = 10; // % of taken fee
    uint256 startValue; // balance before epoch start

    uint256 EpochStartingTime = 0; // time when the epoch had started
    uint256 private TimeForDeposit = 24 hours; // time you have for deposition

    constructor() ERC20("Liquidity Provider Token", "LP-TKN") {
        // token = IERC20(token_);
        owner = msg.sender;//owner set
        strategy = new Strategy(address(this));//strategy contract created

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

    //function for check balance of contract
    function checkContractBalance() external view returns(uint256){
        return address(this).balance;
    }

    /** @notice function `checkUserBalance` returns amount of tokens deposited
    *   by current message sender. If balance of conract is 0, balance of user will be 0 as well
    */
    function checkUserBalance() external view returns(uint256){
        uint256 amountLPToken = this.balanceOf(msg.sender);
        require(amountLPToken > 0);

        uint256 supplyLPToken = this.totalSupply();
        uint256 balanceToken = address(this).balance;

        uint256 amountToken = (amountLPToken * balanceToken) / supplyLPToken;
        return amountToken;
    }

    /** @notice function `deposit` accepts the number of tokens entered in `msg.value`
    *   and mints counted amount of LP tokens for msg.sender user.
    *   `amountToken` the Token amount the user might deposit or withdraw
    *   `amountLPToken` the amount of LP-Tokens to mint / burn for user
    *   `supplyLPToken` LP-Token supply
    *   `balanceToken` Pool Token balance
    *   if by calling `deposit` balanceToken = 0, then amountLPToken = amountToken
    *   if balanceToken != 0, then amountLPToken calculated by formula amountLPToken = (amountToken * supplyLPToken) / balanceToken
    */
    function deposit() external payable openVaultForDepositsAndWithdraw{

        uint256 amountToken = msg.value;
        require(amountToken > 0, "Amount must be greater than 0");

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

    /** @notice function `withdraw` accepts the number of tokens entered in `msg.value`
    *   and mints counted amount of LP tokens for msg.sender user.
    *   `amountToken` the Token amount the user might deposit or withdraw
    *   `amountLPToken` the amount of LP-Tokens to mint / burn for user
    *   `supplyLPToken` LP-Token supply
    *   `balanceToken` Pool Token balance
    *   if by calling `withdraw` amountLPToken = 0, that means, that caller didn't deposited yet, function reverted
    *   amountLPToken calculated by formula amountLPToken = (amountToken * supplyLPToken) / balanceToken
    */
    function withdraw() external openVaultForDepositsAndWithdraw {
        address payable _to = payable(msg.sender);

        uint256 amountLPToken = this.balanceOf(msg.sender);
        require(amountLPToken > 0);

        uint256 supplyLPToken = this.totalSupply();
        uint256 balanceToken = address(this).balance;

        uint256 amountToken = (amountLPToken * balanceToken) / supplyLPToken;

        _burn(_to, amountLPToken);
        _to.transfer(amountToken);
    }

    /** @notice Send `balance` of the pool to the strategy address.
    *   call of the function immediately stops epoch by setting `EpochStartingTime` = 0
    *   `startValue` variable saves the balance at which the strategy iteration started.
    *   @dev function `callOperate()` initiates transfer from Strategy contract to OptionExchange contract
    */
    function sendToStrategy() external onlyOwner {
        EpochStartingTime = 0;
        address payable _to = payable(address(strategy));
        startValue = address(this).balance;
        _to.transfer(startValue);

        strategy.callOperate();
    }

    /** @notice function `getFromStrategy()` gets all tokens that Strategy contract has
    *   @dev if startValue < 0, that means, that nothing yet sent to Strategy
    *   `callRedeem()` function sends all tokens from OptionRegistry contract to Strategy contract
    *   `sendToPool()` function sends all tokens from Strategy contract to Vault contract
    *   if recieved amount of tokens > then startValue, then we take fee to owner
    */
    function getFromStrategy() external onlyOwner {
        require(startValue > 0, "Start value must be greater than 0");
        
        strategy.callRedeem();  
        strategy.sendToPool();

        uint256 pnl = address(this).balance - startValue;

        if(pnl > 0){
            address payable _to = payable(owner);
            uint256 feeAmount = (pnl * performanceFee / 100);
            _to.transfer(feeAmount);
        }
            
    }

    /** @dev function `getStrategyBalance()` returns strategy balance*/
    function getStrategyBalance() public view returns(uint amount) {
        amount = strategy.getBalance();
    }

    /** @dev function `getStartValueBalance()` returns the start balance after Epoch been stopped by calling fucntion `sendToStrategy()`*/
    function getStartValueBalance() public view returns(uint amount) {
        amount = startValue;
    }

    /** @dev function `getStrategyAddress()` returns strategy address*/
    function getStrategyAddress() public view returns(address strat) {
        strat = address(strategy);
    }

    /** @dev function `getOptionalExchangeAddress()` returns OptionalExchange address*/
    function getOptionalExchangeAddress() public view returns(address optionalExchange){
        optionalExchange = strategy.getOptionExchangeAddress();
    }

    /** @dev function `getOptionalRegistryAddress()` returns OptionalRegistry address*/
    function getOptionalRegistryAddress() public view returns(address optionalRegistry){
        optionalRegistry = strategy.getOptionRegistryAddress();
    }

    /** @dev function `getStrategy()` returns Strategy contract object*/
    function getStrategy() public view returns(Strategy strat){
        strat = strategy;
    }

    /** @notice function `breakEpoch()` immediately stops epoch by setting `EpochStartingTime` = 0*/
    function breakEpoch() external onlyOwner{
        EpochStartingTime = 0;
    }

    /** @dev test function `testSendToRegistry()` for sending tokens to OptionRegistry contract for imitationg of getting tokens from option*/
    function testSendToRegistry() public payable{
        address payable _to = payable(address(strategy.getOptionRegistryAddress()));
        _to.transfer(msg.value);
    }

}