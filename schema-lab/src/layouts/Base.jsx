import React, { useContext, useEffect, useState, useRef } from "react";
import { Button, Container, Nav, Navbar, Image, NavDropdown } from "react-bootstrap";
import { Link, Outlet } from "react-router-dom";
import { UserDetailsContext } from "../utils/components/auth/AuthProvider";
import Footer from './Footer';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faRightToBracket, faFlask, faCodeBranch, faDiagramProject, faFolder } from "@fortawesome/free-solid-svg-icons";
import { getProjectName } from "../api/v1/actions";
import config from "../config/config.json";

const ClickableNavDropdown = ({ id, title, items }) => {
    const [show, setShow] = useState(false);
    const dropdownRef = useRef(null);

    // Toggle dropdown on click
    const handleDropdownToggle = () => setShow((prev) => !prev);

    // Close dropdown if clicked outside
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setShow(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <NavDropdown
            id={id}
            title={<span className="text-primary">{title} <FontAwesomeIcon icon={faChevronDown} /></span>}
            menuVariant="light"
            className="ms-3 no-arrow-dropdown"
            drop="down"
            show={show}
            onClick={handleDropdownToggle}
            ref={dropdownRef} 
        >
            {items.map(({ to, text, disabled }, index) => (
                <NavDropdown.Item
                    as={Link}
                    to={to}
                    key={index}
                    className={disabled ? "text-muted disabled" : "text-primary"}
                >
                    {text}
                </NavDropdown.Item>
            ))}
        </NavDropdown>
    );
};

const Base = (props) => {
    const { logo, logo_alt } = config.landing_page;
    const { userDetails } = useContext(UserDetailsContext);
    const [showShadow, setShowShadow] = useState(false);
    const [projectName, setProjectName] = useState(null);

    useEffect(() => {
        const handleScroll = () => setShowShadow(window.scrollY > 10);
        document.addEventListener("scroll", handleScroll);

        if (userDetails?.apiKey) {
            getProjectName(userDetails.apiKey)
                .then((response) => response.json())
                .then((data) => setProjectName(data.name || "No project name available"));
        }

        return () => document.removeEventListener("scroll", handleScroll);
    }, [userDetails]);

    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar
                variant="light"
                bg="light"
                expand="lg"
                sticky="top"
                className={showShadow ? "shadow-sm" : ""}
            >
                <Container>
                    <Navbar.Brand as={Link} to="/">
                        <Image src={logo} alt={logo_alt} style={{ height: "60px", width: "auto" }} />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="me-auto ms-5">
                            {userDetails && (
                                <>
                                    <ClickableNavDropdown
                                        id="nav-dropdown-tasks"
                                        title={
                                            <>
                                                <FontAwesomeIcon icon={faCodeBranch} className="me-1"/>
                                                Tasks
                                            </>
                                        }
                                        items={[
                                            { to: "/dashboard", text: "Dashboard" },
                                            { to: "/runtask", text: "Run a single task" },
                                            { to: "/runworkflowtask", text: "Run a workflow task" },
                                        ]}
                                    />
                                    <ClickableNavDropdown
                                        id="nav-dropdown-experiments"
                                        title={
                                            <>
                                                <FontAwesomeIcon icon={faFlask} className="me-1"/>
                                                Experiments
                                            </>
                                        }
                                        items={[
                                            { to: "/preview", text: "Dashboard" },
                                            { to: "/view", text: "Create" },
                                            { to: "/experiment", text: "About" },
                                        ]}
                                    />
                                    <Button
                                        variant="text-primary"
                                        as={Link}
                                        to="/files"
                                        className=" text-primary"
                                    >
                                        <FontAwesomeIcon icon={faFolder} className="me-1"/> Files
                                    </Button>
                                    <Button
                                        variant="text-primary"
                                        as={Link}
                                        to="/aboutus"
                                        className="me-3 text-primary"
                                    >
                                        About Us
                                    </Button>
                                </>
                            )}
                        </Nav>

                        <Nav className="text-primary">
                            {userDetails ? (
                                <>
                                    {projectName && (
                                        <span className="px-3 py-2 text-dark fw-bold">
                                            {projectName}
                                        </span>
                                    )}
                                    <Button variant="primary" as={Link} to="/logout" className="px-4">
                                        <FontAwesomeIcon icon={faRightToBracket} className="me-2" />
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="outline-primary"
                                        as={Link}
                                        to="/aboutus"
                                        className="me-2"
                                    >
                                        About Us
                                    </Button>
                                    <Button variant="outline-primary" as={Link} to="/auth">
                                        Login
                                    </Button>
                                </>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className="flex-grow-1 mt-5">
                <Outlet />
            </Container>

            <Footer />
        </div>
    );
};

export default Base;
