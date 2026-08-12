import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';
import { currentPeriod, isLifetime } from '@/lib/plans';
import { getGuestStrips, clearGuestStrips } from '@/lib/guestStrips';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }
  const [printShopEnabled, setPrintShopEnabled] = useState(true);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      
      // First, check app public settings (with token if available)
      // This will tell us if auth is required, user not registered, etc.
      const appClient = createAxiosClient({
        baseURL: `/api/apps/public`,
        headers: {
          'X-App-Id': appParams.appId
        },
        token: appParams.token, // Include token if available
        interceptResponses: true
      });
      
      try {
        const publicSettings = await appClient.get(`/prod/public-settings/by-id/${appParams.appId}`);
        setAppPublicSettings(publicSettings);
        
        // If we got the app public settings successfully, check if user is authenticated
        if (appParams.token) {
          await checkUserAuth();
        } else {
          setIsLoadingAuth(false);
          setIsAuthenticated(false);
          setAuthChecked(true);
        }
        setIsLoadingPublicSettings(false);
      } catch (appError) {
        console.error('App state check failed:', appError);
        
        // Handle app-level errors
        if (appError.status === 403 && appError.data?.extra_data?.reason) {
          const reason = appError.data.extra_data.reason;
          if (reason === 'auth_required') {
            setAuthError({
              type: 'auth_required',
              message: 'Authentication required'
            });
          } else if (reason === 'user_not_registered') {
            setAuthError({
              type: 'user_not_registered',
              message: 'User not registered for this app'
            });
          } else {
            setAuthError({
              type: reason,
              message: appError.message
            });
          }
        } else {
          setAuthError({
            type: 'unknown',
            message: appError.message || 'Failed to load app'
          });
        }
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'An unexpected error occurred'
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      // Now check if the user is authenticated
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      // Claim any strips made as a guest before signing up/logging in — these
      // already exist as Strip records (saved server-side when created), so
      // just attach ownership instead of creating duplicates.
      try {
        const guestStrips = getGuestStrips();
        if (guestStrips.length) {
          await Promise.all(guestStrips.map((s) =>
            base44.entities.Strip.update(s.id, { user_id: currentUser.id, is_guest: false })
          ));
          clearGuestStrips();
          // Carry over the sessions they already used as a guest so the
          // free-tier cap can't be bypassed by signing up mid-way.
          if (!isLifetime(currentUser)) {
            const period = currentPeriod();
            const already = currentUser.sessions_period === period ? (currentUser.sessions_used_this_month || 0) : 0;
            const nextUsed = already + guestStrips.length;
            await base44.auth.updateMe({ sessions_used_this_month: nextUsed, sessions_period: period });
            currentUser.sessions_used_this_month = nextUsed;
            currentUser.sessions_period = period;
          }
        }
      } catch { /* best-effort migration, never blocks login */ }
      // Free-plan session counter resets at the start of each billing month.
      if (!isLifetime(currentUser) && currentUser.sessions_period !== currentPeriod()) {
        try {
          await base44.auth.updateMe({ sessions_used_this_month: 0, sessions_period: currentPeriod() });
          setUser((u) => (u ? { ...u, sessions_used_this_month: 0, sessions_period: currentPeriod() } : u));
        } catch { /* ignore reset failure */ }
      }
      setIsLoadingAuth(false);
      setAuthChecked(true);
      // Google users (full_name is populated by Google) with no profile photo:
      // automatically pull their Google profile picture once, on first account
      // creation. A custom upload sets avatar_url, so this never overwrites a
      // user-chosen photo.
      // Google users (full_name is populated by Google): automatically pull
      // their Google profile picture if they don't have a custom photo — for
      // existing accounts and new sign-ups alike. A custom upload marks
      // avatar_source "custom", so the Google photo never overwrites it.
      if (currentUser && currentUser.full_name && currentUser.avatar_source !== "custom" && (!currentUser.avatar_url || currentUser.avatar_source === "google")) {
        try {
          const res = await base44.functions.invoke("syncGoogleAvatar", {});
          if (res && (res.avatar_url || res.full_name)) {
            const patch = {};
            if (res.avatar_url) { patch.avatar_url = res.avatar_url; patch.avatar_source = "google"; }
            if (res.full_name) patch.full_name = res.full_name;
            updateUser(patch);
            sessionStorage.removeItem("vendi_google_consent");
          }
        } catch {
          // Avatar sync is best-effort only. We never auto-redirect users
          // through an OAuth consent flow on page refresh — that was causing
          // unwanted redirects and is unsafe. The current session is kept.
        }
      }
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setAuthChecked(true);
      
      // If user auth fails, it might be an expired token
      if (error.status === 401 || error.status === 403) {
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required'
        });
      }
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    
    if (shouldRedirect) {
      // Use the SDK's logout method which handles token cleanup and redirect
      base44.auth.logout(window.location.href);
    } else {
      // Just remove the token without redirect
      base44.auth.logout();
    }
  };

  const updateUser = (patch) => setUser((u) => (u ? { ...u, ...patch } : u));

  const loadPrintSetting = async () => {
    try {
      const list = await base44.entities.AppSetting.filter({ key: "print_shop_enabled" });
      setPrintShopEnabled(list[0] ? list[0].value !== false : true);
    } catch {
      setPrintShopEnabled(true);
    }
  };

  useEffect(() => {
    loadPrintSetting();
    const off = base44.entities.AppSetting.subscribe(loadPrintSetting);
    return off;
  }, []);

  const navigateToLogin = () => {
    // Use the SDK's redirectToLogin method
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      printShopEnabled,
      refreshSettings: loadPrintSetting,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};