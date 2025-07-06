import React, { useState } from 'react';
import { Link } from 'react-scroll';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: 'home' },
    { name: 'About', href: 'about' },
    { name: 'Research', href: 'research' },
    { name: 'Publications', href: 'publications' },
    { name: 'Teaching', href: 'teaching' },
    { name: 'Contact', href: 'contact' },
  ];

  return (
    <nav className="fixed w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Desktop menu */}
          <div className="hidden md:block w-full">
            <div className="flex items-baseline justify-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  smooth={true}
                  duration={500}
                  className="text-gray-600 hover:text-crimson-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex w-full justify-end">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-crimson-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-crimson-500"
            >
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                smooth={true}
                duration={500}
                className="text-gray-600 hover:text-crimson-600 block px-3 py-2 rounded-md text-base font-medium cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 