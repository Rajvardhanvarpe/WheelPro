import { supabase } from '../config/supabaseClient';

export const loginUser = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) throw error;
        return { user: data.user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
};

export const logoutUser = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
};
