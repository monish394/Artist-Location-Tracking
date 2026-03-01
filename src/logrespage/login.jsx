// src/logrespage/Login.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

//   useEffect(()=>{
//     if(!localStorage.getItem("token")){
//         return navigate("/login")
//     }

//   },[navigate])


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      const res = await axios.post('http://localhost:5000/api/users/login', {
        email: form.email,
        password: form.password,
      });

      const { token, user } = res.data;

      // Save token & role in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);

      // Navigate based on role
      if (user.role === 'fan') navigate('/fan/dashboard');
      else if (user.role === 'artist') navigate('/artist/home');
      else if(user.role==="admin") navigate("/admin/dashboard")
      else navigate('/login');

    } catch (err) {
      console.error('LOGIN ERROR:', err);
      const data = err.response?.data;
      if (!data) setServerError('Network error. Please try again.');
      else if (typeof data.msg === 'string') setServerError(data.msg);
      else if (typeof data.error === 'string') setServerError(data.error);
      else setServerError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 h-screen w-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      {/* Background Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-white/10 rounded-full" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {serverError && (
          <div className="bg-red-500 text-white px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="flex-1 text-sm">{serverError}</p>
              <button type="button" onClick={() => setServerError('')} className="flex-shrink-0 p-1 hover:bg-red-600 rounded">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M9 19V6L21 3V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="6" cy="19" r="3" stroke="currentColor" strokeWidth="2"/>
                <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full px-4 py-2.5 rounded-lg border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none ${
                  errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500'
                }`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 pr-10 rounded-lg border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none ${
                    errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;