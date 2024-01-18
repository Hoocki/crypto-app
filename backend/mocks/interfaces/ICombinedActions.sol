// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "../libraries/Types.sol";

interface CombinedActions {

    enum OperationType {
		OPYN,
		RYSK
	}

    struct OperationProcedures {
		OperationType operation;
		CombinedActions.ActionArgs[] operationQueue;
	}

    struct ActionArgs {
        // type of action that is being performed on the system
        uint256 actionType;
        // address of the account owner
        address owner;
        // address which we move assets from or to (depending on the action type)
        address secondAddress;
        // asset that is to be transfered
        address asset;
        // index of the vault that is to be modified (if any)
        uint256 vaultId;
        // amount of asset that is to be transfered
        uint256 amount;
        // option series (if any)
        Types.OptionSeries optionSeries;
        // each vault can hold multiple short / long / collateral assets but we are restricting the scope to only 1 of each in this version
        // OR for rysk actions it is the acceptable premium (if option is being sold to the dhv then the actual premium should be more than this number (i.e. max price),
        // if option is being bought from the dhv then the actual premium should be less than this number (i.e. max price))
        uint256 indexOrAcceptablePremium;
        // any other data that needs to be passed in for arbitrary function calls
        bytes data;
    }
}