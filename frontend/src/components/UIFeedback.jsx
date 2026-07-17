import React from 'react';
import { Icons } from './Icons';

export const LoadingSpinner = ({ message = 'Loading data...' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', width: '100%', minHeight: '35vh' }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid var(--border)',
      borderTopColor: 'var(--primary)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '1rem'
    }} />
    <span style={{ color: 'var(--text-sub)', fontWeight: '600', fontSize: '0.95rem' }}>{message}</span>
  </div>
);

export const EmptyState = ({ icon, title, description }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)', width: '100%' }}>
    <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
    <h3 style={{ fontWeight: '700', fontSize: '1.15rem', color: 'var(--text-main)', margin: 0 }}>{title}</h3>
    {description && <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', marginTop: '0.5rem', maxWidth: '420px', lineHeight: '1.5' }}>{description}</p>}
  </div>
);

export const ErrorCard = ({ message = 'An unexpected error occurred.', onRetry }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', textAlign: 'center', backgroundColor: 'var(--danger-light)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#991b1b', width: '100%', maxWidth: '520px', margin: '2rem auto' }}>
    <Icons.Warning size={38} color="var(--danger)" style={{ marginBottom: '1rem' }} />
    <h3 style={{ fontWeight: '700', fontSize: '1.1rem', margin: '0 0 0.5rem 0', color: 'var(--danger)' }}>System Error</h3>
    <p style={{ fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 1.5rem 0' }}>{message}</p>
    {onRetry && (
      <button className="btn btn-danger" onClick={onRetry}>
        Try Again
      </button>
    )}
  </div>
);
