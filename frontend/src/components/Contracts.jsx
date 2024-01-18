import React, { useState, useEffect } from 'react';
import { Button, Container } from 'react-bootstrap';

import MetaMaskInstallMessage from './MetaMaskInstallMessage';
import ContractsTable from './ContractsTable';
import ContractsModal from './ContractsModal';
import '../styles/Contracts.css';

import Web3 from 'web3';

import abiJSON from '../Vault.json';

const Contracts = () => {
    const [tableContents, setTable] = useState([
        {
            name: "ETH-ARBUZ", time: '24', market: 'Arbuz Finance', depositBalance: '2000 USDC', clientBalance: '800 USDC',
            address: '0x2fE09d7847BE787AB08de1Ac357E002b9E88FC74'
        }
    ]);

    const [showMenu, setShowMenu] = useState(false);
    const [selectedTab, setSelectedTab] = useState(null);

    const handleMenuShow = (tabName) => {
        setSelectedTab(tabName);
        setShowMenu(!showMenu);
    };
    
    const [transactionValue, setTransactionValue] = useState('');

    const handleTransaction = async (action, strategy) => {
        try {
            const web3 = new Web3(window.ethereum)
            // const web3 = new Web3(new Web3.providers.HttpProvider("https://rpc.sepolia.org"));

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const userAddress = accounts[0];

            const contractABI = abiJSON.abi;

            // const contract = new web3.eth.Contract(contractABI, strategy.address);
            const contract = new web3.eth.Contract(contractABI, '0x2fE09d7847BE787AB08de1Ac357E002b9E88FC74');
            const gasPrice = await web3.eth.getGasPrice();
            const gasLimit = 300000;

            const transactionDetails = {
                from: userAddress,
                gas: gasLimit,
                gasPrice: gasPrice,
            };

            if (action === 'Deposit') {
                const etherAmount = web3.utils.toWei(transactionValue, 'ether');
                transactionDetails.value = etherAmount;

                const result = await contract.methods.deposit().send(transactionDetails);
                console.log('Deposit successful', result);
            }
            else if (action === 'Withdraw') {
                const result = await contract.methods.withdraw().send(transactionDetails);
                console.log('Withdrawal successful', result);
            }

            setShowMenu(false);
        } catch (error) {
            console.error('Transaction error', error);
        }
    };

    const [accounts, setAccounts] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    const handleConnect = async () => {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccounts(accounts);
            setIsConnected(accounts.length > 0);
            console.log('Connection established');
        } catch (error) {
            console.error('Connection error', error);
        }
    };

    if (!window.ethereum) {
        return <MetaMaskInstallMessage />;
    } else {
        return (
            <div>
                <Container className="mt-4">
                    <Button onClick={handleConnect} variant="light" className="custom-button mb-2">
                        Connect with MetaMask
                    </Button>
                    {isConnected ?
                        (<p>You are connected to MetaMask with address: {accounts[0]}</p>)
                        :
                        (<p>No connection has been established</p>)
                    }

                    {tableContents &&
                        <ContractsTable tableContents={tableContents} handleMenuShow={handleMenuShow} />
                    }

                    {showMenu && (
                        <ContractsModal
                            showMenu={showMenu}
                            setShowMenu={setShowMenu}
                            selectedTab={selectedTab}
                            setSelectedTab={setSelectedTab}
                            handleTransaction={handleTransaction}
                            transactionValue={transactionValue}
                            setTransactionValue={setTransactionValue}
                        />
                    )}
                </Container>
            </div>
        );
    }
};

export default Contracts;
