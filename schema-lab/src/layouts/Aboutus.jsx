import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import Container from 'react-bootstrap/Container';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { faLocationPin } from '@fortawesome/free-solid-svg-icons';
import { faXTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';

import thanasis from  "../img/about_us/thanasis.png";
import eleni from "../img/about_us/eleni.png";
import panagiotis from "../img/about_us/panagiotis.jpeg";
import katerina from "../img/about_us/katerina.jpg";
import kostis from "../img/about_us/kostis.png";

const TeamMemberCard = ({ name, role, image, twitter, linkedin, email }) => {
    return (
        <Card className="text-center mb-4 shadow-sm border-light rounded">
            <Card.Body>
                <Image 
                    src={image} 
                    alt={`${name}'s picture`} 
                    roundedCircle 
                    className="mb-3"
                    style={{ width: '150px', height: '150px' }}
                />
                <Card.Title className="mb-2">{name}</Card.Title>
                <Card.Text className="text-muted">{role}</Card.Text>
                <div className="d-flex justify-content-center">
                    {twitter && <a href={twitter} className="mx-2 text-decoration-none text-muted"><FontAwesomeIcon icon={faXTwitter} size="lg" /></a>}
                    {linkedin && <a href={linkedin} className="mx-2 text-decoration-none text-muted"><FontAwesomeIcon icon={faLinkedin} size="lg" /></a>}
                    {email && <a href={`mailto:${email}`} className="mx-2 text-decoration-none text-muted"><FontAwesomeIcon icon={faEnvelope} size="lg" /></a>}
                </div>
            </Card.Body>
        </Card>
    );
};

const Aboutus = () => {
    const teamMembers = [
        { name: 'Thanasis Vergoulis', role: 'Team Leader', image: thanasis, twitter: 'https://twitter.com/vergoulis?lang=el', linkedin: 'https://www.linkedin.com/in/thanasis-vergoulis-863b8152/?originalSubdomain=gr', email: 'vergoulis@athenarc.gr' },
        { name: 'Eleni Adamidi', role: 'Project Manager', image: eleni, twitter: '', linkedin: 'https://www.linkedin.com/in/eleni-adamidi-74575952/?originalSubdomain=gr', email: 'eleni.adamidi@athenarc.gr' },
        { name: 'Panagiotis Deligiannis', role: 'Full-stack Developer', image: panagiotis, twitter: '', linkedin: 'https://www.linkedin.com/in/panagiotis-deligiannis-8b2885203/', email: 'deligianp@athenarc.gr' },
    ];

    const formerteamMembers = [
        { name: 'Katerina Mastoraki', role: 'Full-stack Developer', image: katerina, twitter: '', linkedin: 'https://www.linkedin.com/in/katerina-mastoraki-a71570246/', email: 'kmastoraki@athenarc.gr' },
        { name: 'Kostis Zagannas', role: 'DevOps', image: kostis, twitter: '', linkedin: 'https://www.linkedin.com/in/kostis-zagganas/', email: 'zagganas@athenarc.gr' },
    ];

    return (
        <Container className="mt-5">
            <h1 className="display-6 text-center mb-2">Publication</h1>
            <Card className="text-center mb-5 shadow-sm border-light rounded">
                <Card.Body>
                    <Card.Text className="text-muted">
                        T. Vergoulis, K. Zagganas, L. Kavouras, M. Reczko, S. Sartzetakis, and T. Dalamagas. 2021.
                        <b> SCHeMa: Scheduling Scientific Containers on a Cluster of Heterogeneous Machines.</b>
                        In 33rd International Conference on Scientific and Statistical Database Management (SSDBM 2021). 
                        Association for Computing Machinery, New York, NY, USA, 243–47.
                        <a href="https://doi.org/10.1145/3468791.3468813" className="d-block mt-2"> 
                            https://doi.org/10.1145/3468791.3468813
                        </a>
                    </Card.Text>     
                </Card.Body>
            </Card>
           
            <h1 className="display-6 text-center mb-4">About Us</h1>
            <Row className="justify-content-center">
                {teamMembers.map((member, index) => (
                    <Col xs={12} sm={6} md={4} lg={3} key={index} className="d-flex justify-content-center mb-4">
                        <TeamMemberCard 
                            name={member.name} 
                            role={member.role} 
                            image={member.image} 
                            twitter={member.twitter}
                            linkedin={member.linkedin}
                            email={member.email}
                        />
                    </Col>
                ))}
            </Row>

            <h1 className="display-6 text-center mb-4">Former Members</h1>
            <Row className="justify-content-center">
                {formerteamMembers.map((member, index) => (
                    <Col xs={12} sm={6} md={4} lg={3} key={index} className="d-flex justify-content-center mb-4">
                        <TeamMemberCard 
                            name={member.name} 
                            role={member.role} 
                            image={member.image} 
                            twitter={member.twitter}
                            linkedin={member.linkedin}
                            email={member.email}
                        />
                    </Col>
                ))}
            </Row>

            <Row className="justify-content-center mt-4">
                <Col md={6} className="text-center">
                    <h2 className="display-6">Contact Us</h2>
                    <p className="mb-2"> <FontAwesomeIcon icon={faEnvelope} /><b> Email: </b> 
                        <a href="mailto:schema-services@athenarc.gr" className="text-decoration-none"> 
                             schema-services@athenarc.gr
                        </a>
                    </p>
                    <p className="mb-4"><FontAwesomeIcon icon={faLocationPin} /> 
                    <b> Address: </b> Athena RC, Artemidos 6 & Epidavrou, Maroussi 15125, Greece</p>
                    <div className="embed-responsive embed-responsive-16by9 mb-5">
                        <iframe
                            className="embed-responsive-item"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3142.509603373891!2d23.793915596789542!3d38.03521060000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a198deffffffff%3A0x1ce27455f146f478!2sAthena%20Research%20%26%20Innovation%20Center%20in%20Information%20Communication%20%26%20Knowledge%20Technologies!5e0!3m2!1sen!2sgr!4v1722461297988!5m2!1sen!2sgr"
                            allowFullScreen
                            title="Google Maps"
                            referrerPolicy="no-referrer-when-downgrade"
                            style={{ border: 0, width: '100%', height: '400px' }} 
                        ></iframe>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Aboutus;