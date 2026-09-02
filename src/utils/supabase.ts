import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

const isSupabaseEnabled = true;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://alpdpkwqfnuwjzpdmqhe.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GltQu_UkPn_URryXZnvQBw_o00ClXqO';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Automatically store provider_token whenever auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.provider_token) {
    localStorage.setItem('google_access_token', session.provider_token);
  }
});

export const signInWithGoogle = async () => {
  if (!isSupabaseEnabled) return;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      redirectTo: Capacitor.isNativePlatform() 
        ? 'com.example.myapp://callback' 
        : window.location.origin,
      skipBrowserRedirect: Capacitor.isNativePlatform(),
    },
  });

  if (error) throw error;

  if (Capacitor.isNativePlatform() && data?.url) {
    await Browser.open({ 
      url: data.url, 
      windowName: '_system'
    });
  }

  return data;
};