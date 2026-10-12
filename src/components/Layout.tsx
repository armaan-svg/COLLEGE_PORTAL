import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X, MapPin, UserRound } from 'lucide-react';
import type { SectionBackgroundName } from './SectionBackground';
import { useAuth } from '../lib/auth';
import { officialUrl } from '../data/event';

const pageBackgrounds: Record<string, SectionBackgroundName> = {
  '/about': 'mission',
  '/highlights': 'experience',
  '/venue-schedule': 'schedule',
  '/venue': 'categories',
  '/gallery': 'experience',
  '/quiz': 'categories',
  '/faq': 'schedule',
  '/certification': 'mission',
  '/contact': 'experience',
  '/why-participate': 'categories',
  '/school': 'mission',
  '/college': 'experience',
  '/login': 'mission',
  '/signup': 'experience',
  '/register': 'schedule',
};

function RouteContent() {
  const { pathname } = useLocation();
  return (
    <div className="route-surface">
      <Outlet />
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const { user, signOut, callbackError } = useAuth();

  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="header">
        <Link className="brand" to="/" aria-label="OrbitalHack home">
          <img className="brand-logo" src="/img/event-mark.png" alt="" width="52" height="52" />
          <span>
            OrbitalHack
            <small>BIAS · BHIMTAL</small>
          </span>
        </Link>
        <button
          className="menu-toggle"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? 'nav open' : 'nav'} aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/about">The event</NavLink>
          <NavLink to="/venue-schedule">Schedule</NavLink>
          <NavLink to="/gallery">Gallery</NavLink>
          <NavLink to="/quiz">
            Space quiz
            <span className="nav-dot" />
          </NavLink>
          <NavLink to="/faq">FAQs</NavLink>
          <div className="profile-dropdown">
            <button
              className="profile-trigger profile-icon-button"
              aria-expanded={profileOpen}
              aria-label={user ? 'Open profile menu' : 'Open account menu'}
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <UserRound size={16} />
              {user && <span className="profile-label">Profile</span>}
            </button>
            {profileOpen && (
              <div className="profile-menu">
                {user ? (
                  <>
                    <NavLink to="/dashboard" onClick={() => setProfileOpen(false)}>
                      My Profile
                    </NavLink>
                    <NavLink to="/dashboard" onClick={() => setProfileOpen(false)}>
                      My Registrations
                    </NavLink>
                    <NavLink to="/dashboard" onClick={() => setProfileOpen(false)}>
                      Edit Profile
                    </NavLink>
                    <NavLink to="/dashboard" onClick={() => setProfileOpen(false)}>
                      Account Settings
                    </NavLink>
                    <button
                      className="text-button sign-out-btn"
                      onClick={() => {
                        void signOut();
                        setProfileOpen(false);
                      }}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink to="/login" onClick={() => setProfileOpen(false)}>
                      Log in
                    </NavLink>
                    <NavLink to="/signup" onClick={() => setProfileOpen(false)}>
                      Create account
                    </NavLink>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>
      <main id="main">
        {callbackError && <div className="auth-callback-notice" role="alert">{callbackError}</div>}
        <RouteContent />
      </main>
      <footer>
        <div className="footer-top">
          <div>
            <Link className="brand" to="/">
              <img className="brand-logo" src="/img/event-mark.png" alt="" width="52" height="52" loading="lazy" />
              <span>OrbitalHack</span>
            </Link>
            <p>Small steps. Cosmic possibilities.</p>
          </div>
          <div>
            <h3>NASA International Space Apps Challenge 2026</h3>
            <p>14–16 November 2026</p>
            <p>
              <MapPin size={14} /> Birla Institute of Applied Sciences, Bhimtal, Uttarakhand
            </p>
          </div>
          <div className="footer-links">
            <Link to="/certification">Certification</Link>
            <Link to="/contact">Contact & venue</Link>
            <Link to="/admin/login">Organizer access</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 OrbitalHack. Local event identity.</span>
          <a href={officialUrl} target="_blank" rel="noreferrer">
            Official NASA Space Apps website <ArrowUpRight size={14} />
          </a>
          <span>Built for curious minds.</span>
        </div>
      </footer>
    </>
  );
}
