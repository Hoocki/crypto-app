import React from 'react';
import { Table, Button } from 'react-bootstrap';

const ContractsTable = ({ tableContents, handleMenuShow }) => {
    return (
        <div className="mt-2 custom-table">
            <Table borderless>
                <thead 
                    style={{ position: 'sticky', top: 0, background: 'white', fontSize: '28px' }}>
                    <tr>
                        <th className="text-center">Strategy</th>
                        <th className="text-center">Status</th>
                        <th className="text-center">Market</th>
                        <th className="text-center">Balance</th>
                        <th className="text-center">Your Balance</th>
                        <th className="text-center"></th>
                    </tr>
                </thead>
                <tbody>
                    {tableContents.map((strategy, index) => (
                        <tr key={index}>
                            <td className="text-center">{strategy.name}</td>
                            <td className="text-center">{strategy.time}</td>
                            <td className="text-center">{strategy.market}</td>
                            <td className="text-center">{strategy.depositBalance}</td>
                            <td className="text-center">{strategy.clientBalance}</td>
                            <td className="text-center" style={{ width: '180px' }}>
                                <Button onClick={() => handleMenuShow('deposit', strategy)}
                                    variant="light" className="custom-button" >
                                    Deposit
                                </Button>
                                {/* {' '} */}
                                <Button onClick={() => handleMenuShow('withdraw', strategy)}
                                    variant="light" className="custom-button" >
                                    Withdraw
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>

            </Table>
        </div>
    );
};

export default ContractsTable;