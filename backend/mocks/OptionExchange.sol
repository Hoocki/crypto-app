// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "./interfaces/ICombinedActions.sol";
import "../node_modules/hardhat/console.sol";

contract OptionExchange {

    receive() external payable {}

    modifier nonReentrant(){
        _;
    } 

    modifier whenNotPaused(){
        _;
    } 

    function operate(
		CombinedActions.OperationProcedures[] memory _operationProcedures,
        address _registry
	) external nonReentrant whenNotPaused {

		_runActions(_operationProcedures);
		_verifyFinalState();

        //test transfer to strategy
        address payable _to = payable(address(_registry)); 
        _to.transfer(address(this).balance);

	}
    
    function _runActions(CombinedActions.OperationProcedures[] memory _operationProcedures) internal {}

    function _verifyFinalState() internal {}
    
}