import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from "axios";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    artistName: '',
    bio: '',
    genre: '',
    city: '',
    state: '',
    firstName: '',
    lastName: '',
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
    // Clear server error when user starts typing
    if (serverError) setServerError('');
  };

  const handleRoleSelect = role => {
    setForm({ ...form, role });
    if (errors.role) setErrors({ ...errors, role: '' });
    if (serverError) setServerError('');
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1 && !form.role) {
      newErrors.role = 'Please select a role';
    }

    if (step === 2) {
      if (!form.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email';
      if (!form.password) newErrors.password = 'Password is required';
      else if (form.password.length < 6) newErrors.password = 'Min 6 characters';
      if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords don\'t match';
    }

    if (step === 3) {
      if (form.role === 'artist' && !form.artistName) {
        newErrors.artistName = 'Artist name is required';
      }
      if (form.role === 'fan') {
        if (!form.firstName) newErrors.firstName = 'First name is required';
        if (!form.lastName) newErrors.lastName = 'Last name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
      setServerError('');
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setServerError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    setServerError('');

    try {
      let body = { email: form.email, password: form.password, role: form.role };

      if (form.role === 'artist') {
        body = { ...body, artistName: form.artistName, bio: form.bio, genre: form.genre, city: form.city, state: form.state };
      } else {
        body = { ...body, firstName: form.firstName, lastName: form.lastName, city: form.city, state: form.state };
      }

      const res = await api.post('http://localhost:5000/api/users/register', body);
      localStorage.setItem('token', res.data.token);
      navigate('/login');
    } catch (err) {
      console.error(err);
      // Set server error
      setServerError(err.response?.data?.msg || err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen fixed inset-0 flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      
      {/* Background Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-white/10 rounded-full" />
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl relative z-10 overflow-hidden">
        
        {/* Server Error Alert - Fixed at Top */}
        {serverError && (
          <div className="bg-red-500 text-white px-4 py-3 relative animate-pulse">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-sm font-medium flex-1">{serverError}</p>
              <button 
                onClick={() => setServerError('')}
                className="flex-shrink-0 p-1 hover:bg-red-600 rounded transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Card Content */}
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M9 19V6L21 3V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="6" cy="19" r="3" stroke="currentColor" strokeWidth="2"/>
                <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create Account</h1>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= i 
                    ? 'bg-gradient-to-r from-indigo-500 to-pink-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {step > i ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i}
                </div>
                {i < 3 && (
                  <div className={`w-12 h-1 mx-1 rounded ${step > i ? 'bg-gradient-to-r from-indigo-500 to-pink-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            
            {/* Step 1: Role Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-4">Choose your account type</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('artist')}
                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                      form.role === 'artist'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                      form.role === 'artist'
                        ? 'bg-gradient-to-br from-indigo-500 to-pink-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}>
                      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                        <path d="M9 19V6L21 3V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="6" cy="19" r="3" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 dark:text-white">Artist</p>
                      <p className="text-xs text-gray-500">Share music</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('fan')}
                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                      form.role === 'fan'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                      form.role === 'fan'
                        ? 'bg-gradient-to-br from-indigo-500 to-pink-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}>
                      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 dark:text-white">Fan</p>
                      <p className="text-xs text-gray-500">Discover music</p>
                    </div>
                  </button>
                </div>
                
                {errors.role && <p className="text-center text-sm text-red-500">{errors.role}</p>}

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Continue
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Step 2: Account Details */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-2.5 rounded-lg border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm transition-all focus:outline-none ${
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
                      className={`w-full px-4 py-2.5 pr-10 rounded-lg border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm transition-all focus:outline-none ${
                        errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-2.5 rounded-lg border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm transition-all focus:outline-none ${
                      errors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500'
                    }`}
                  />
                  {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Continue
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Profile Details */}
            {step === 3 && (
              <div className="space-y-4">
                {form.role === 'artist' ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Artist Name *</label>
                        <input
                          type="text"
                          name="artistName"
                          value={form.artistName}
                          onChange={handleChange}
                          placeholder="Stage name"
                          className={`w-full px-3 py-2.5 rounded-lg border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none ${
                            errors.artistName ? 'border-red-300' : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500'
                          }`}
                        />
                        {errors.artistName && <p className="text-xs text-red-500 mt-1">{errors.artistName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Genre</label>
                        <input
                          type="text"
                          name="genre"
                          value={form.genre}
                          onChange={handleChange}
                          placeholder="Rock, Pop..."
                          className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                      <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        placeholder="Tell fans about yourself..."
                        rows={2}
                        className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                        <input
                          type="text"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          placeholder="City"
                          className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                        <input
                          type="text"
                          name="state"
                          value={form.state}
                          onChange={handleChange}
                          placeholder="State"
                          className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                        <input
                          type="text"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          placeholder="John"
                          className={`w-full px-3 py-2.5 rounded-lg border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none ${
                            errors.firstName ? 'border-red-300' : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500'
                          }`}
                        />
                        {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                        <input
                          type="text"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          placeholder="Doe"
                          className={`w-full px-3 py-2.5 rounded-lg border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none ${
                            errors.lastName ? 'border-red-300' : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500'
                          }`}
                        />
                        {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                        <input
                          type="text"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          placeholder="City"
                          className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                        <input
                          type="text"
                          name="state"
                          value={form.state}
                          onChange={handleChange}
                          placeholder="State"
                          className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Account
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;