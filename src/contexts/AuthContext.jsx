import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('🔐 AuthProvider: Setting up auth state listener...');
        
        // Get initial session with a safety timeout
        const sessionTimeout = setTimeout(() => {
            if (loading) {
                console.warn('🔐 AuthProvider: Session check timed out, falling back to login.');
                setLoading(false);
            }
        }, 3000);

        supabase.auth.getSession().then(({ data: { session } }) => {
            clearTimeout(sessionTimeout);
            setUser(session?.user || null);
            setLoading(false);
        }).catch(err => {
            clearTimeout(sessionTimeout);
            console.error('🔐 AuthProvider: Error fetching session:', err);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('🔐 Auth state changed:', session ? `Logged in as ${session.user.email}` : 'Not logged in');
            setUser(session?.user || null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
