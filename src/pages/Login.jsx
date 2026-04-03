import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginUser } from '../services/authService';

const Login = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            console.log('✅ User already logged in, redirecting to dashboard');
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log('🔐 Login: Attempting to log in with email:', email);

        try {
            const { user: loggedInUser, error: loginError } = await loginUser(email, password);

            if (loginError) {
                console.error('❌ Login failed:', loginError);
                setError(loginError);
            } else {
                console.log('✅ Login successful:', loggedInUser.email);
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('❌ Login error:', err);
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-display premium-bg text-workshop-dark antialiased min-h-screen flex flex-col items-center justify-center p-6 relative">
            <div className="brushed-overlay"></div>

            <div className="relative z-10 w-full max-w-[380px] flex flex-col items-center">
                {/* Logo Section */}
                <div className="mb-10 flex flex-col items-center">
                    <div className="bg-workshop-dark p-3.5 rounded-2xl shadow-xl mb-5 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-4xl block" style={{ fontVariationSettings: "'FILL' 1" }}>
                            settings_suggest
                        </span>
                    </div>
                    <h1 className="text-workshop-dark text-3xl font-extrabold tracking-tight">
                        WheelTrack <span className="text-primary">Pro</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-1.5">
                        <div className="h-[1px] w-4 bg-workshop-dark/20"></div>
                        <p className="text-workshop-dark/50 text-[10px] uppercase tracking-[0.2em] font-extrabold">Workshop Management</p>
                        <div className="h-[1px] w-4 bg-workshop-dark/20"></div>
                    </div>
                </div>

                {/* Login Card */}
                <div className="w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_20px_50px_rgba(37,52,63,0.08)] border border-white overflow-hidden">
                    <div className="p-8">
                        <div className="mb-8 text-center">
                            <h2 className="text-workshop-dark text-2xl font-bold tracking-tight">Welcome Back</h2>
                            <p className="text-workshop-dark/60 text-sm font-medium mt-1.5">Enter your credentials to continue</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="flex flex-col">
                                <label className="text-workshop-dark/80 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Email Address</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-workshop-dark/30 text-xl">mail</span>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex w-full rounded-xl border-gray-200 bg-gray-50/50 text-workshop-dark focus:border-primary focus:ring-4 focus:ring-primary/10 h-14 pl-12 pr-4 text-base font-medium placeholder:text-workshop-dark/20 transition-all focus:outline-none"
                                        placeholder="workshop@wheeltrack.pro"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <div className="flex justify-between items-center mb-2 ml-1">
                                    <label className="text-workshop-dark/80 text-xs font-bold uppercase tracking-wider">Password</label>
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-workshop-dark/30 text-xl">lock</span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="flex w-full rounded-xl border-gray-200 bg-gray-50/50 text-workshop-dark focus:border-primary focus:ring-4 focus:ring-primary/10 h-14 pl-12 pr-12 text-base font-medium placeholder:text-workshop-dark/20 transition-all focus:outline-none"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(prev => !prev)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-workshop-dark/30 hover:text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-primary hover:bg-[#ff8a35] text-white font-bold rounded-xl shadow-[0_8px_20px_rgba(255,155,81,0.3)] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="text-base">{loading ? 'Signing In...' : 'Sign In'}</span>
                                    <span className="material-symbols-outlined text-lg">{loading ? 'hourglass_top' : 'login'}</span>
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 flex flex-col gap-4 items-center">
                            <a href="#" className="text-workshop-dark/60 text-sm font-semibold hover:text-primary transition-colors">Forgot password?</a>
                            <div className="h-px w-16 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                            <p className="text-workshop-dark/40 text-[11px] font-medium">
                                Access restricted to authorized personnel.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-workshop-dark/40 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em]">v2.4.0 Secure</span>
                        <span className="h-1 w-1 rounded-full bg-workshop-dark/20"></span>
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">verified_user</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">PWA Encrypted</span>
                        </div>
                    </div>
                    <p className="text-[10px] opacity-60">© 2024 WheelTrack Systems International</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
