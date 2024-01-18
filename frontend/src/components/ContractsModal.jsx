// import React from 'react';
// import { Modal, Tabs, Tab, InputGroup, Form, Container, Row, Col, Button } from 'react-bootstrap';

// const ContractsModal = ({ showMenu, setShowMenu, selectedTab, setSelectedTab, handleTransaction, transactionValue, setTransactionValue }) => {
//     return (
//         <Modal
//             size="md"
//             keyboard="true"
//             aria-labelledby="contained-modal-title-vcenter"
//             centered
//             show={showMenu}
//             onHide={() => setShowMenu(false)}
//         >
//             <Modal.Body>
//                 <Tabs activeKey={selectedTab} onSelect={(key) => setSelectedTab(key)} justify variant="tabs" style={{ color: 'red' }} className="custom-tabs">
//                     <Tab eventKey="deposit" title="Deposit">
//                         <Container>
//                             <Row className="justify-content-md-center">
//                                 <Col>
//                                     <InputGroup className="mt-4">
//                                         <Form.Control
//                                             className="custom-input"
//                                             placeholder="sum"
//                                             aria-label=""
//                                             aria-describedby="custom-label"
//                                             autoFocus
//                                             value={transactionValue}
//                                             onChange={(e) => setTransactionValue(e.target.value)}
//                                         />
//                                         <InputGroup.Text id="custom-label">USDC</InputGroup.Text>
//                                     </InputGroup>
//                                 </Col>
//                             </Row>
//                             <Row className="justify-content-md-center mt-4">
//                                 <Button as={Col} xs={4} variant="light" className="custom-button" onClick={() => handleTransaction('Deposit')}>
//                                     Deposit
//                                 </Button>
//                             </Row>
//                         </Container>
//                     </Tab>
//                     <Tab eventKey="withdraw" title="Withdraw">
//                         <Container>
//                             <Row className="justify-content-md-center">
//                                 <Col>
//                                     <InputGroup className="mt-4">
//                                         <Form.Control
//                                             className="custom-input"
//                                             placeholder="sum"
//                                             aria-label=""
//                                             aria-describedby="custom-label"
//                                             autoFocus
//                                             value={transactionValue}
//                                             onChange={(e) => setTransactionValue(e.target.value)}
//                                         />
//                                         <InputGroup.Text id="custom-label">USDC</InputGroup.Text>
//                                     </InputGroup>
//                                 </Col>
//                             </Row>
//                             <Row className="justify-content-md-center mt-4">
//                                 <Button as={Col} xs={4} variant="light" className="custom-button" onClick={() => handleTransaction('Withdraw')}>
//                                     Withdraw
//                                 </Button>
//                             </Row>
//                         </Container>
//                     </Tab>
//                 </Tabs>
//             </Modal.Body>
//         </Modal>
//     );
// };

// export default ContractsModal;