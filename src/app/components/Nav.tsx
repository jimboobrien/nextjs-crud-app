"use client";

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import config from '../../../config.json';

// Use navigation items from config.json
const MENU_LIST = config.navigation;

function NavBar() {
  const pathname = usePathname();

  return (
    <Navbar expand="lg"  bg="dark" data-bs-theme="dark">
      <Container>
        <Navbar.Brand href="/">Next.js CRUD App</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {MENU_LIST.map((item, index) => (
              <Nav.Item key={index}>
                <Link href={item.href} passHref legacyBehavior>
                  <Nav.Link active={pathname === item.href}>{item.text}</Nav.Link>
                </Link>
              </Nav.Item>
            ))}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar