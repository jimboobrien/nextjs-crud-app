import React from 'react'
import Link from 'next/link'


const MENU_LIST = [
    { text: "Home", href: "/", slug: "home" },
    { text: "Register", href: "/register", slug: "register" },  
    { text: "Login", href: "/login", slug: "login" },

    { text: "User", href: "/user", slug: "user" },
    
    { text: "Add", href: "/add", slug: "add" },
    { text: "Admin", href: "/admin", slug: "admin" },
    
  ];


function Nav() {
  return (
    <nav className="flex flex-col gap-4">
        {MENU_LIST.map((item, index) => (
            <Link 
                key={index}
                href={item.href}
                className="px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
                {item.text}
            </Link>
        ))}
    </nav>
  )
}

export default Nav