import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Icons } from './Icons';

export const Sidebar = () => {
  const { logoutUser, currentUser } = useContext(AppContext);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Icons.Dashboard size={20} /> },
    { name: 'Live Monitoring', path: '/monitoring', icon: <Icons.Monitor size={20} /> },
    { name: 'Alert History', path: '/alerts', icon: <Icons.Alerts size={20} /> },
    { name: 'Reports', path: '/reports', icon: <Icons.Reports size={20} /> },
    { name: 'My Profile', path: '/profile', icon: <Icons.User size={20} /> },
  ];

  return (
    <aside style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.brandContainer}>
        <div style={styles.brandLogo}>
          <Icons.Eye size={24} color="#ffffff" />
        </div>
        <div style={styles.brandTextContainer}>
          <span style={styles.brandTitle}>DriveGuard</span>
          <span style={styles.brandSubtitle}>Personal AI Monitor</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={styles.nav}>
        <ul style={styles.navList}>
          {navItems.map((item) => (
            <li key={item.name} style={styles.navItem}>
              <NavLink
                to={item.path}
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.activeNavLink : {})
                })}
              >
                {({ isActive }) => (
                  <>
                    <span style={{
                      ...styles.navIcon,
                      color: isActive ? 'var(--primary)' : 'var(--text-sub)'
                    }}>
                      {item.icon}
                    </span>
                    <span style={{
                      color: isActive ? 'var(--text-main)' : 'var(--text-sub)',
                      fontWeight: isActive ? '600' : '500'
                    }}>
                      {item.name}
                    </span>
                    {isActive && <div style={styles.activeIndicator} />}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Profile & Logout Info */}
      <div style={styles.footer}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {currentUser?.name?.charAt(0) || 'D'}
          </div>
          <div style={styles.userText}>
            <div style={styles.userName}>{currentUser?.name || 'Driver'}</div>
            <div style={styles.userRole}>Account Owner</div>
          </div>
        </div>
        <button 
          onClick={() => {
            logoutUser();
            navigate('/');
          }} 
          style={styles.logoutBtn} 
          title="Log Out"
        >
          <Icons.Logout size={20} color="var(--danger)" />
          <span style={styles.logoutText}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: 'var(--sidebar-width)',
    backgroundColor: '#ffffff',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.02)'
  },
  brandContainer: {
    height: 'var(--navbar-height)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 1.5rem',
    borderBottom: '1px solid var(--border)',
    gap: '0.75rem',
    backgroundColor: '#f8fafc'
  },
  brandLogo: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
  },
  brandTextContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  brandTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    letterSpacing: '-0.3px',
    lineHeight: '1.2'
  },
  brandSubtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-sub)',
    fontWeight: '500'
  },
  nav: {
    flexGrow: 1,
    padding: '1.5rem 0.75rem',
    overflowY: 'auto'
  },
  navList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem'
  },
  navItem: {
    position: 'relative'
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'all var(--transition-fast)',
    position: 'relative',
    gap: '0.75rem'
  },
  activeNavLink: {
    backgroundColor: 'var(--primary-light)'
  },
  navIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color var(--transition-fast)'
  },
  activeIndicator: {
    position: 'absolute',
    left: '-0.75rem',
    top: '20%',
    bottom: '20%',
    width: '4px',
    backgroundColor: 'var(--primary)',
    borderRadius: '0 4px 4px 0'
  },
  footer: {
    padding: '1.25rem',
    borderTop: '1px solid var(--border)',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    fontWeight: '700',
    fontSize: '1.1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-focus)'
  },
  userText: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '130px',
    overflow: 'hidden'
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-main)',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  userRole: {
    fontSize: '0.75rem',
    color: 'var(--text-sub)'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.625rem 0.75rem',
    borderRadius: '0.5rem',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border)',
    color: 'var(--danger)',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all var(--transition-fast)'
  },
  logoutText: {
    color: 'var(--text-main)'
  }
};
