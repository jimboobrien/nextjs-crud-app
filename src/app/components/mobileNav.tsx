import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

import { useActivePage } from '../context/ActivePageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faComment, faImage, faMapLocationDot } from '@fortawesome/pro-solid-svg-icons';


const navItems = [
    { "name": "Home", "path": "/", "icon": faHome },
    { "name": "Text Prompt", "path": "/textPrompt", "icon": faComment },
    { "name": "Image Prompt", "path": "/imagePrompt", "icon": faImage },
    { "name": "DND Map", "path": "/dndPrompt", "icon": faMapLocationDot }
  ];


function MobileNav() {
    const { activePage, setActive } = useActivePage() as { activePage: string, setActive: (page: string) => void };

  return (
    <Navbar expand="md" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="/">React-Bootstrap</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {navItems.map((item, i) => (
              <Nav.Link
                key={i}
                href={item.path}
                className={activePage === item.name ? 'active' : ''}
                onClick={() => setActive(item.name)}
              >
                { /* <FontAwesomeIcon icon={item.icon} className="me-2" /> */}
                {item.name}
              </Nav.Link>
            ))}
            
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MobileNav;