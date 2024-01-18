import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Tabs, Tab, InputGroup, Form, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import MetaMaskInstallMessage from './MetaMaskInstallMessage';
// import ContractsTable from './ContractsTable';
// import ContractsModal from './ContractsModal';
import '../styles/Contracts.css';

import Web3 from 'web3';

import contractJSON from '../Vault.json';

const Contracts = () => {
    const [tableContents, setTable] = useState([
        {
            name: "ETH-LEBRON", market: 'The Bronze Bay Finance',
            depositBalance: '1 ETH', clientBalance: '2 ETH',
            time: '24',
            address: '0x0616107415bFC66B28b1E8fF9AFAc35A0A4945e8'
        }
    ]);

    const [showMenu, setShowMenu] = useState(false);
    const [selectedTab, setSelectedTab] = useState(null);

    const handleMenuShow = (tabName) => {
        setSelectedTab(tabName);
        setShowMenu(!showMenu);
    };

    const [transactionValue, setTransactionValue] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [web3, setWeb3] = useState(null);
    const [userAddress, setUserAddress] = useState(null);
    const [contract, setContract] = useState(null);

    const handleConnect = async () => {
        try {
            const web3Instance = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccounts(accounts);
            setIsConnected(accounts.length > 0);
            console.log('Connection established');

            const userAddress = accounts[0];
            const contractABI = contractJSON.abi;
            const contractAddress = '0x0616107415bFC66B28b1E8fF9AFAc35A0A4945e8';
            const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);

            setWeb3(web3Instance);
            setUserAddress(userAddress);
            setContract(contractInstance);
        } catch (error) {
            console.error('Connection error', error);
        }
    };

    const handleEpoch = async () => {
        try {
            console.log('Epoch start attempt');
            if (contract) {
                await contract.methods.startEpoch().send({ from: userAddress });
            }
        } catch (error) {
            console.error('Epoch error', error.message);
        }
    };

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
                setShowMenu(false);
            }
        } catch (error) {
            console.error('Transaction error', error.message);
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
                    gasPrice: gasPrice,
                    // value: web3.utils.toWei(0.2, 'ether')
                };
                const result = await contract.methods.withdraw().send(transactionDetails);

                console.log('Withdrawal successful', result);
                setShowMenu(false);
            }
        } catch (error) {
            console.error('Transaction error', error.message);
        }
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
                    <Button onClick={handleConnect} variant="light" className="custom-button mb-2">
                        Connect with MetaMask
                    </Button>

                    <Button onClick={handleEpoch} variant="light" className="custom-button mb-2">
                        Start epoch
                    </Button>

                    {isConnected ?
                        (<p>You are connected to MetaMask with address: {accounts[0]}</p>)
                        :
                        (<p>No connection has been established</p>)
                    }

                    {tableContents && isConnected &&
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
                                                <Button onClick={() => handleMenuShow()}
                                                    variant="light" className="custom-button" >
                                                    Deposit
                                                </Button>

                                                <Button onClick={() => handleWithdraw()}
                                                    variant="light" className="custom-button" >
                                                    Withdraw
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
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
