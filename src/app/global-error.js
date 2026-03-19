'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({ error, unstable_retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '1rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', width: '4rem', height: '4rem', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', backgroundColor: 'rgba(220, 38, 38, 0.1)' }}>
            <AlertTriangle style={{ width: '2rem', height: '2rem', color: '#dc2626' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Something went wrong</h2>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
              A critical error occurred. Please try again.
            </p>
          </div>
          <button
            onClick={() => unstable_retry()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', background: 'white', fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <RotateCcw style={{ width: '1rem', height: '1rem' }} />
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
