import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Tabs, Tab, InputGroup, Form, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import '../styles/Contracts.css';

import Web3 from 'web3';

import contractJSON from '../Vault.json';


const Contracts = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [selectedTab, setSelectedTab] = useState(null);
    const handleMenuShow = (tabName) => {
        setSelectedTab(tabName);
        setShowMenu(!showMenu);
    };

    const [web3, setWeb3] = useState(null);
    const [transactionValue, setTransactionValue] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [userAddress, setUserAddress] = useState(null);
    const [contract, setContract] = useState(null);

    const isOwner = userAddress && userAddress === '0xdb21a0fb89450aec2b2827529e57aeb106a2b436';

    const [contractTable, setTable] = useState(
        {
            name: "ETH-LEBRON", market: 'The Bronze Bay Finance',
            contractBalance: '-',
            userBalance: '-',
            address: '0xF5645e88912225B2Ca7b02321eefce74Ff174ED1',
            abi: contractJSON.abi,
            startTime: 'x',
            endTime: 'x',
            status: false
        }
    );

    useEffect(() => {
        if (contract && web3)
            checkBalance();
    }, [contract, web3]);

    const handleConnect = async () => {
        try {
            const web3Instance = new Web3(window.ethereum);
            // const web3Instance = new Web3("https://arbitrum-mainnet.infura.io/v3/e88cd6e7721d4e87ac87ef254c569388");
            // const web3Instance = new Web3("https://sepolia.infura.io/v3/e88cd6e7721d4e87ac87ef254c569388");

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccounts(accounts);
            setIsConnected(accounts.length > 0);
            console.log('Connection established');

            const userAddress = accounts[0];
            const contractInstance = new web3Instance.eth.Contract(contractTable.abi, contractTable.address);

            setWeb3(web3Instance);
            setUserAddress(userAddress);
            setContract(contractInstance);
        } catch (error) {
            console.error('Connection error:', error);
        }
    };

    // owner methods
    const startEpoch = async () => {
        try {
            await contract.methods.startEpoch().send({ from: userAddress });
        } catch (error) {
            console.error('Epoch start error:', error.message);
        }
    };

    const breakEpoch = async () => {
        try {
            await contract.methods.breakEpoch().send({ from: userAddress });
        } catch (error) {
            console.error('Epoch break error:', error.message);
        }
    };

    const handleRedeem = async () => {
        try {
            await contract.methods.getFromStrategy().send({ from: userAddress });
        } catch (error) {
            console.error('Redem error:', error.message);
        }
    };

    const handleStart = async () => {
        try {
            await contract.methods.sendToStrategy().send({ from: userAddress });
        } catch (error) {
            console.error('Redem error:', error.message);
        }
    };

    const getEpochStatus = async () => {
        try {
            const newStatus = await contract.methods.epochStatus().call({ from: userAddress, gas: 300000 });
            console.log(newStatus);
            return newStatus;
        } catch (error) {
            console.error('Epoch status check error:', error.message);
            throw error;
        }
    };

    const checkUserBalance = async () => {
        try {
            console.log('Check user balance attempt');
            const newUserBalance = await contract.methods.checkUserBalance().call({ from: userAddress, gas: 300000 });
            console.log(newUserBalance);
            return newUserBalance.toString();
        } catch (error) {
            console.error('User balance check error:', error.message);
            throw error;
        }
    };

    const checkContractBalance = async () => {
        try {
            console.log('Check contract balance attempt');
            const newContractBalance = await contract.methods.checkContractBalance().call();
            console.log(newContractBalance);
            return web3.utils.fromWei(newContractBalance, 'wei').toString();
        } catch (error) {
            console.error('Contract balance check error:', error.message);
            throw error;
        }
    };

    const checkBalance = async () => {
        try {
            const newStatus = await getEpochStatus();
            const newUserBalance = await checkUserBalance();
            const newContractBalance = await checkContractBalance();

            setTable({
                ...contractTable,
                startTime: newStatus._EpochStartingTime,
                endTime: newStatus._EpochEndingTime,
                status: newStatus._epochIsGoing,
                userBalance: newUserBalance,
                contractBalance: newContractBalance
            });
        } catch (error) {
            console.error('Balance check error:', error.message);
        }
    };

    // deposit/withdraw methods
    const handleDeposit = async () => {
        try {
            if (web3 && contract) {
                console.log('Deposit attempt');

                const gasPrice = await web3.eth.getGasPrice();
                const gasLimit = 300000;
                const etherAmount = web3.utils.toWei(transactionValue, 'ether');
                const transactionDetails = {
                    from: userAddress,
                    gas: gasLimit,
                    gasPrice: gasPrice,
                    value: etherAmount
                };
                const result = await contract.methods.deposit().send(transactionDetails);

                console.log('Deposit successful', result);
                checkBalance();
                setShowMenu(false);
            }
        } catch (error) {
            console.error('Transaction error:', error.message);
        }
    };

    const handleWithdraw = async () => {
        try {
            if (web3 && contract) {
                console.log('Withdrawal attempt');

                const gasPrice = await web3.eth.getGasPrice();
                const gasLimit = 300000;
                const transactionDetails = {
                    from: userAddress,
                    gas: gasLimit,
                    gasPrice: gasPrice
                };
                const result = await contract.methods.withdraw().send(transactionDetails);

                console.log('Withdrawal successful', result);
                checkBalance();
                setShowMenu(false);
            }
        } catch (error) {
            console.error('Transaction error:', error.message);
        }
    }

    // const getEpochTimeDifference = () => {
    //     const currentTime = new Date().getTime() / 1000;
    //     const closingTimeInSeconds = ;
    //     console.log('NIGGERS', closingTimeInSeconds);
    //     // const dateFormatted = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    //     const timeDifference = closingTimeInSeconds - currentTime;
    //     return timeDifference;
    // };

    const statusParse = (status) => {
        if (status === true) {
            return 'open';
        }
        if (status === false) {
            return 'closed';
        }
        return 'unknown';
    }

    if (!window.ethereum) {
        return (
            <Container className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
                <Row>
                    <Col className="text-center">
                        <h2 className="mb-4">To run this app, you need MetaMask</h2>
                        <Link to="https://metamask.io/download.html" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                            Install
                        </Link>
                    </Col>
                </Row>
            </Container>
        )
    } else {
        return (
            <div>
                <Container className="mt-4">
                    <Row>
                        <Col xs={7}> 
                            <Button onClick={handleConnect} variant="light" className="col custom-button mb-2">
                                Connect with MetaMask
                            </Button>

                            {isConnected ?
                                <p>Your account address: {accounts[0]}</p>
                                :
                                <p>No connection has been established</p>
                            }
                        </Col>
                    </Row>
                    

                    {contractTable && isConnected &&
                        <div className="mt-2 custom-table">
                            <Table borderless>
                                <thead>
                                    <tr>
                                        <th className="text-center">Strategy</th>
                                        <th className="text-center">Status</th>
                                        <th className="text-center">Market</th>
                                        <th className="text-center">Balance</th>
                                        <th className="text-center">Your Balance</th>
                                        <th className="text-center">Action</th>
                                        {isOwner &&
                                            <th className="text-center">Owner action</th>
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    {contractTable &&
                                        <tr>
                                            <td className="text-center">{contractTable.name}</td>
                                            <td className="text-center">{statusParse(contractTable.status)}</td>
                                            <td className="text-center">{contractTable.market}</td>
                                            <td className="text-center">{contractTable.contractBalance}</td>
                                            <td className="text-center">{contractTable.userBalance}</td>
                                            <td className="text-center" style={{ width: '180px' }}>
                                                <Button onClick={() => handleMenuShow()}
                                                    variant="light" className="custom-button" >
                                                    Deposit
                                                </Button>
                                                <Button onClick={() => handleWithdraw()}
                                                    variant="light" className="custom-button" >
                                                    Withdraw
                                                </Button>
                                            </td>

                                            {isOwner &&
                                                <td className="text-center" style={{ width: '360px' }}>
                                                        <Button onClick={() => handleRedeem()} variant="light" className="custom-button mb-2" >
                                                            Redeem
                                                        </Button>
                                                        <Button onClick={() => handleStart()} variant="light" className="custom-button mb-2" >
                                                            Start
                                                        </Button>
                                                        <Button onClick={startEpoch} variant="light" className="custom-button mb-2">
                                                            Start epoch
                                                        </Button>
                                                        <Button onClick={breakEpoch} variant="light" className="custom-button mb-2">
                                                            Break epoch
                                                        </Button>
                                                </td>
                                            }
                                        </tr>
                                    }
                                </tbody>

                            </Table>
                        </div>
                    }

                    
                    {showMenu &&
                        <Modal
                            size="md"
                            keyboard="true"
                            aria-labelledby="contained-modal-title-vcenter"
                            centered
                            show={showMenu}
                            onHide={() => setShowMenu(false)}
                        >
                            <Modal.Body>
                                <Tabs activeKey={selectedTab} onSelect={(key) => setSelectedTab(key)}
                                    justify variant="tabs" className="custom-tabs"
                                >
                                    <Tab eventKey="deposit" title="Deposit">
                                        <Container>
                                            <Row className="justify-content-md-center">
                                                <Col>
                                                    <InputGroup className="mt-4">
                                                        <Form.Control
                                                            className="custom-input" placeholder="sum" aria-label=""
                                                            aria-describedby="custom-label" autoFocus
                                                            value={transactionValue} onChange={(e) => setTransactionValue(e.target.value)}
                                                        />
                                                        <InputGroup.Text id="custom-label">ETH</InputGroup.Text>
                                                    </InputGroup>
                                                </Col>
                                            </Row>
                                            <Row className="justify-content-md-center mt-4">
                                                <Button as={Col} xs={4} variant="light" className="custom-button" onClick={() => handleDeposit()}>
                                                    Deposit
                                                </Button>
                                            </Row>
                                        </Container>
                                    </Tab>
                                </Tabs>
                            </Modal.Body>
                        </Modal>
                    }
                </Container>
            </div>
        );
    }
};

export default Contracts;
