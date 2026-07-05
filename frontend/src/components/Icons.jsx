import React from 'react';

const iconStyle = (size = 20, color = 'currentColor') => ({
  width: size,
  height: size,
  stroke: color,
  fill: 'none',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  display: 'inline-block',
  verticalAlign: 'middle'
});

export const Icons = {
  Dashboard: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  ),

  Drivers: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),

  Monitor: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),

  Alerts: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),

  Reports: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),

  Logout: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),

  Plus: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),

  Trash: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  ),

  Edit: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),

  Warning: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),

  Check: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),

  User: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),

  Close: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),

  Info: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),

  Coffee: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <path d="M18 8h1a4 4 0 0 1 8 0v1a4 4 0 0 1-4 4h-5" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  ),

  Water: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  ),

  Rest: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),

  Music: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),

  Eye: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),

  Clock: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),

  Shield: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),

  ChevronDown: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),

  Twitter: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  ),

  Github: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  ),

  Mail: ({ size = 20, color = 'currentColor', ...props }) => (
    <svg viewBox="0 0 24 24" style={iconStyle(size, color)} {...props}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
};
