// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "../node_modules/hardhat/console.sol";
import "../mocks/OptionExchange.sol";
import "../mocks/interfaces/ICombinedActions.sol";
import "../mocks/OptionRegistry.sol";

contract Strategy {

    //testing mock
    OptionExchange public optionExchange;
    //testing mock
    OptionRegistry public optionRegistry;

    receive() external payable {}

    // check if msg.sender is Owner of contract
    modifier isOwner(){
        require(msg.sender == owner, "Function caller is not the owner");
        _;
    }

    // check if call is from Vault contract
    modifier fromPool(){
        require(msg.sender == pool_address, "Call function not from pool");
        _;
    }

    address private pool_address; 
    address public owner;

    constructor(address _pool) {
        pool_address = _pool;// Vault contract address
        owner = msg.sender;// Owner address
        optionExchange = new OptionExchange();// OptionExchange init
        optionRegistry = new OptionRegistry();// OptionRegistry init
    }

    /**@dev test function for check Strategy balance */
    function getBalance() external view returns(uint){
        return address(this).balance;
    }

    /**@dev test function for getting OptionExchange address*/
    function getOptionExchangeAddress() external view returns (address) {
        return address(optionExchange);
    }

    /**@dev test function for getting OptionRegistry address*/
    function getOptionRegistryAddress() external view returns (address) {
        return address(optionRegistry);
    }

    /** @notice `sendToPool()` function sends all tokens from Strategy contract to Vault
    *   @dev can only be called from Vault
     */
    function sendToPool() external fromPool {
        address payable _to = payable(pool_address); 
        _to.transfer(address(this).balance);
    }

    /** @dev function `createRyskAction` is suppoused to create Action struct
    *   this struct is necessary for calling function `callOperate()` 
     */
    function createRyskAction (
        uint256 _actionType,
        address _secondAddress,
        uint256 _amount,
        uint64 _expiration,
        uint128 _strike,
        bool _isPut,
        uint256 _indexOrAcceptablePremium
    ) public pure returns(CombinedActions.ActionArgs memory){

        CombinedActions.ActionArgs memory action;
        action.actionType = _actionType;
        action.owner = address(0);
        action.secondAddress = _secondAddress;
        action.asset = address(0);
        action.vaultId = 0;
        action.amount = _amount;
        action.optionSeries = Types.OptionSeries({
            expiration: _expiration,
            strike: _strike,
            isPut: _isPut,
            underlying: address(0x82aF49447D8a07e3bd95BD0d56f35241523fBab1),
            strikeAsset: address(0xaf88d065e77c8cC2239327C5EDb3A432268e5831),
            collateral: address(0xaf88d065e77c8cC2239327C5EDb3A432268e5831)
        });
        action.indexOrAcceptablePremium = _indexOrAcceptablePremium;
        action.data = "0x0000000000000000000000000000000000000000";
        return action;
    }

    /** @dev function `callOperate()` is suppoused to contact with OptionExchange contract wich stands for RyskFinance site
    *   this function mimics the action of the real function of the OptionExchange contract - `operate()` 
     */
    function callOperate() external fromPool {

        address payable _from = payable(address(optionExchange)); 
        _from.transfer(address(this).balance);

        CombinedActions.OperationProcedures[] memory __procedures = new CombinedActions.OperationProcedures[](2);

        CombinedActions.OperationProcedures memory _procedure1;

        CombinedActions.ActionArgs memory _action1 = createRyskAction(0, address(0), 0, 1705651200, 2900000000000000000000, false, 0);

        _procedure1.operation = CombinedActions.OperationType.RYSK;//Первой процедуре назначается тип действий RYSK

        CombinedActions.ActionArgs[] memory __actionQueue = new CombinedActions.ActionArgs[](1);//Создается копия actionQueue(очередь действий) чтобы не засорять глобальный массив

        __actionQueue[0] = _action1;//В копию очереди действий добавляется первое действие

        _procedure1.operationQueue = __actionQueue;//Первой процедуре назначается очередь действий

        __procedures[0] = _procedure1;

        optionExchange.operate(
            __procedures,
            address(optionRegistry)
        );
    }

    //function calls redeem() function of optionRegistry contract wich sends all tokens from optionRegistry to Strategy
    function callRedeem() external fromPool{
        optionRegistry.redeem(address(this), address(0));
    }

}