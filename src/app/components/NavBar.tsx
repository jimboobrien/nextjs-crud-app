'use client';
// src/components/Navbar.js
import React, { useEffect, useState } from 'react';
import { useActivePage } from '../context/ActivePageContext';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faComment, faImage, faMapLocationDot } from '@fortawesome/pro-solid-svg-icons';

import config from '../../../config.json';

const MENU_LIST = config.navigation;

import Link from 'next/link';interface NavbarProps {
  collapsed: boolean;
}

interface NavbarProps {
  collapsed: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ collapsed }) => {
    const { activePage, setActive } = useActivePage() as { activePage: string, setActive: (page: string) => void };
    //const [items, setItems] = useState([]);

    // Map icon strings to FontAwesome icons
    const getIconComponent = (iconName: string) => {
      const iconMap: { [key: string]: any } = {
        faHome,
        faComment,
        faImage,
        faMapLocationDot
      };
      
      return iconMap[iconName] || faHome; // Default to faHome if icon not found
    };
   

  return (
    <>
    <ul className={` nav nav-pills flex-column mb-auto navbar-nav ${collapsed ? 'nav-flush' : ''}` }>
      {MENU_LIST.map((item, i) => (
          <li key={i} className="nav-item">
            <Link
                href={item.path}
                className={`nav-link pl-2 pr-2 ${activePage === item.name ? 'active' : ''}  `}
                onClick={() => setActive(item.name)}
            >
              <span className="">
                <FontAwesomeIcon icon={getIconComponent(item.icon)} />
              </span>
              <span className={ ` nav-link-text ${collapsed ? '' : 'pl-2'} ` }>
                {!collapsed && item.name}
              </span>
            </Link>
          </li>
      ))}
    </ul>
    </>
  );
};

export default Navbar;