// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "./interfaces/ICombinedActions.sol";
import "../node_modules/hardhat/console.sol";
import "./libraries/Types.sol";


contract OptionRegistry {
	receive() external payable {}

    function redeem(address _strategy, address _series) external returns (uint256) {

		address payable _to = payable(address(_strategy)); 
        _to.transfer(address(this).balance);
		// assumes in collateral decimals
		return 69;
	}
    
}