import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const isNative = Capacitor.isNativePlatform();

      if (isNative) {
        // Native flow using Google Auth plugin
        const googleUser = await GoogleAuth.signIn();
        const { error: supabaseError } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: googleUser.authentication.idToken,
        });

        if (supabaseError) {
          setError(`Supabase Error: ${supabaseError.message}`);
          setLoading(false);
          return;
        }
      } else {
        // Web browser redirect flow
        const redirectUrl = window.location.origin;
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            scopes: 'https://www.googleapis.com/auth/spreadsheets',
            redirectTo: redirectUrl,
          },
        });
        
        if (oauthError) {
          setError(`Supabase Error: ${oauthError.message}`);
          setLoading(false);
          return;
        }
      }

      onClose();
    } catch (err: any) {
      setError(`Unexpected Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '350px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Sign In to SmartAI Book Keeping</h3>
        
        {error && (
          <div style={{ background: '#ffe6e6', color: '#cc0000', padding: '0.6rem', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1rem', wordBreak: 'break-all' }}>
            {error}
          </div>
        )}

        <button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{ width: '100%', padding: '0.7rem', background: 'white', color: '#444', border: '1px solid #ccc', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', fontWeight: '500', marginBottom: '1rem', opacity: loading ? 0.7 : 1 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.14C3.15 21.32 7.22 24 12 24z"/>
            <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.62H1.18C.43 8.13 0 9.82 0 12s.43 3.87 1.18 5.38l4.09-3.14z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.15 2.68 1.18 6.62l4.09 3.14c.95-2.85 3.6-4.96 6.73-4.96z"/>
          </svg>
          {loading ? 'Connecting...' : 'Continue with Google'}
        </button>

        <button 
          type="button" 
          onClick={onClose} 
          style={{ width: '100%', background: '#f1f1f1', color: '#333', border: 'none', padding: '0.6rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}