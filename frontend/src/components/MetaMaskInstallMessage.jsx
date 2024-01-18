import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const MetaMaskInstallMessage = () => {
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
    );
};

export default MetaMaskInstallMessage;