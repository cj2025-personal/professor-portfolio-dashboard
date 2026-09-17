import React, { useState, useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

/* Anchors into the one-page portfolio. */
const sections = [
  { name: 'Home', href: 'home' },
  { name: 'About', href: 'about' },
  { name: 'Research', href: 'ongoing-research' },
  { name: 'Publications', href: 'publications' },
  { name: 'Teaching', href: 'teaching' },
  { name: 'Contact', href: 'contact' },
];

/* Real routes, not anchors. These always render as router links. */
const pages = [{ name: 'Proj Arch', to: '/proj-arch' }];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  /* react-scroll can only reach a section that is mounted. Off the home route
     those sections do not exist, so the same links have to become router links
     to /#section and let the hash handler do the scrolling. Without this every
     nav item is inert on the standards and course pages. */
  const onHome = pathname === '/';

  // Add a subtle shadow / solid background once the page is scrolled.
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const close = () => setIsOpen(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const sectionLink = (item, className, activeClassName) =>
    onHome ? (
      <ScrollLink
        key={item.name}
        to={item.href}
        href={`#${item.href}`}
        spy={true}
        smooth={true}
        duration={500}
        offset={-88}
        activeClass={activeClassName}
        className={className}
        onClick={close}
      >
        {item.name}
      </ScrollLink>
    ) : (
      <RouterLink key={item.name} to={`/#${item.href}`} className={className} onClick={close}>
        {item.name}
      </RouterLink>
    );

  /* Active state is an underline rather than a filled pill. A tinted pill in
     a white bar reads as a button, which put a third button-like element next
     to the real CTA on every scroll. */
  const desktopItem =
    'relative text-gray-600 hover:text-brand-600 px-3 py-2 text-[0.8125rem] font-medium tracking-[0.01em] cursor-pointer transition-colors after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-transparent after:transition-colors';
  const mobileItem =
    'text-gray-700 hover:text-brand-600 hover:bg-gray-50 block px-3 py-2.5 rounded-lg text-[0.9375rem] font-medium cursor-pointer transition-colors';
  /* Red marks the current item — the same rule as the section kickers and
     the publication filter, so "you are here" reads identically everywhere. */
  const activeItem = 'text-brand-700 after:bg-signal-red';

  return (
    <nav aria-label="Main navigation"
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'border-gray-100 bg-white/90 shadow-sm backdrop-blur-md'
          : 'border-transparent bg-white/70 backdrop-blur'
      }`}
    >
      <div className="ark-container">
        <div className="flex items-center justify-between h-16">
          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-1">
            {sections.map((item) => sectionLink(item, desktopItem, activeItem))}

            <span className="mx-1.5 h-4 w-px bg-gray-200" aria-hidden />

            {pages.map((page) => (
              <RouterLink
                key={page.name}
                to={page.to}
                aria-current={pathname === page.to ? 'page' : undefined}
                className={`proj-arch-nav ${pathname === page.to ? 'proj-arch-nav--active' : ''}`}
              >
                <span>{page.name}</span>
              </RouterLink>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            {onHome ? (
              <ScrollLink
                to="contact"
                href="#contact"
                smooth={true}
                duration={500}
                offset={-88}
                className="btn-primary cursor-pointer"
              >
                Get in touch
              </ScrollLink>
            ) : (
              <RouterLink to="/#contact" className="btn-primary cursor-pointer">
                Get in touch
              </RouterLink>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="ml-auto md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-brand-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500 transition-colors"
            >
              {isOpen ? <XMarkIcon className="block h-6 w-6" /> : <Bars3Icon className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-3 pt-3 pb-4 space-y-1">
            {sections.map((item) => sectionLink(item, mobileItem, activeItem))}

            <div className="pt-1 mt-1 border-t border-gray-100" />

            {pages.map((page) => (
              <RouterLink
                key={page.name}
                to={page.to}
                onClick={close}
                aria-current={pathname === page.to ? 'page' : undefined}
                className={`proj-arch-nav proj-arch-nav--mobile ${pathname === page.to ? 'proj-arch-nav--active' : ''}`}
              >
                <span>{page.name}</span>
              </RouterLink>
            ))}

            {onHome ? (
              <ScrollLink
                to="contact"
                href="#contact"
                smooth={true}
                duration={500}
                offset={-88}
                onClick={close}
                className="btn-primary w-full mt-2 cursor-pointer"
              >
                Get in touch
              </ScrollLink>
            ) : (
              <RouterLink to="/#contact" onClick={close} className="btn-primary w-full mt-2 cursor-pointer">
                Get in touch
              </RouterLink>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
