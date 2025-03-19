import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Image from "react-bootstrap/Image";
import WelcomeCard from "./layouts/WelcomeMessage";
import config from "./config/config.json";

const Home = () => {
    const { image, image_alt } = config.landing_page;
    
    const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
    // favicon.href = "media/schema/favicon.ico";
    favicon.href = config.favicon_logo
    document.head.appendChild(favicon); 
    document.title = config.title

    return <div>
        <Row className="justify-content-center p-1">
            <Col className="border border-light-subtle rounded p-4">
                <Row>
                    <Col className="border-end border-muted-subtle"><WelcomeCard /></Col>
                    <Col className="d-flex justify-content-center align-items-center"> 
                    <Image
                                src={image}
                                alt={image_alt}
                                fluid 
                                style={{
                                    maxWidth: '70%', 
                                    height: 'auto',
                                    filter: 'brightness(0.9) contrast(1.2) saturate(1.5) sepia(0.2)',
                                    borderRadius: '8px',
                                }}
                            />
                    </Col>
                </Row>
            </Col>
        </Row>
    </div>;
}

export default Home;