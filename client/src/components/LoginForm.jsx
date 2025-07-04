import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TOTPInput } from './TwoFactor';

// Pre-define SVG components to reduce render work
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  </svg>
);

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [requireTOTP, setRequireTOTP] = useState(false);
    const [userId, setUserId] = useState(null);
    const { login, verifyTOTP } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
          try {
            const result = await login(username, password);
            
            if (result.require_totp) {
              setRequireTOTP(true);
              setUserId(result.user_id);
            } else {
              navigate('/');
            }
            
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid username or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTOTPComplete = async (totpCode) => {
        setError('');
        setIsLoading(true);
        
        try {
            await verifyTOTP(totpCode, userId);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid verification code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        setRequireTOTP(false);
        setUserId(null);
        setUsername('');
        setPassword('');
        setError('');
    };
    
    return (
        <div className="w-full">
            {requireTOTP ? (
                <div>
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-gray-600">
                            Please enter the verification code from your authenticator app to complete sign in.
                        </p>
                    </div>
                    
                    <TOTPInput 
                        onComplete={handleTOTPComplete}
                        loading={isLoading}
                        error={error}
                    />
                    
                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={handleBackToLogin}
                            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                        >
                            ← Back to login
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    {error && (
                        <div className="bg-red-50 border-l-2 border-red-400 p-3 rounded mb-4">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                    Username
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserIcon />
                                    </div>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        autoComplete="username"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="block w-full appearance-none rounded border border-gray-300 pl-10 pr-3 py-2 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-sm"
                                        placeholder="Enter your username"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <div className="text-xs">
                                        <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                            Forgot password?
                                        </a>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockIcon />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full appearance-none rounded border border-gray-300 pl-10 pr-3 py-2 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-4 w-full rounded border border-transparent bg-black py-2 px-4 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </button>                        <div className="mt-4 text-center">
                            <div className="text-xs text-gray-600">
                                Don't have an account?{" "}
                                <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                                    Sign up
                                </a>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default LoginForm;