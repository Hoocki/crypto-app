import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

const ErrorPage = () => {
    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
            <Row>
                <Col className="text-center">
                    <h2>Page Not Found</h2>
                    <p>Requested page does not exist</p>
                    <Link to="/" className="btn btn-primary">Go to contracts page</Link>
                </Col>
            </Row>
        </Container>
    );
};

export default ErrorPage;