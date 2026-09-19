import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AlertCircle, CheckCircle2, ShieldCheck, User, PlusCircle, KeyRound, ArrowRight } from 'lucide-react';

const Auth = () => {
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Tabs: 'login' | 'register' | 'forgot' | 'admin'
  const [activeTab, setActiveTab] = useState('login');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoverStep, setRecoverStep] = useState(1); // 1 = Request, 2 = Verify
  const [recoverEmail, setRecoverEmail] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMsg('');
    setSuccessMsg('');
    reset();
  };

  const onSubmit = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      let endpoint = '/api/auth/login';
      let payload = { ...data, role: 'farmer' };

      if (activeTab === 'register') {
        endpoint = '/api/auth/register';
        payload = data;
      } else if (activeTab === 'admin') {
        endpoint = '/api/auth/login';
        payload = { ...data, role: 'admin' };
      } else if (activeTab === 'forgot') {
        if (recoverStep === 1) {
          endpoint = '/api/auth/forgot-password';
          payload = { email: data.email };
        } else {
          endpoint = '/api/auth/reset-password';
          payload = { email: recoverEmail, otp: data.otp, newPassword: data.newPassword };
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      setLoading(false);

      if (response.ok && resData.success) {
        if (activeTab === 'forgot') {
          if (recoverStep === 1) {
            setRecoverEmail(data.email);
            setSuccessMsg('OTP code sent successfully to email/console!');
            setRecoverStep(2);
            reset();
          } else {
            setSuccessMsg('Password reset successfully! Redirecting...');
            setTimeout(() => {
              setRecoverStep(1);
              handleTabChange('login');
            }, 2500);
          }
        } else {
          loginUser(resData.data);
          if (resData.data.role === 'admin') {
            navigate('/dashboard?tab=admin');
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        setErrorMsg(resData.message || 'Operation failed. Verify details.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Connection failed. Verify server is running.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white border border-slate-100 p-8 rounded-2xl shadow-premium space-y-6">
        
        {/* Logo/Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto text-primary text-xl font-bold">
            🌱
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">KrishiDrishti</h2>
          <p className="text-xs text-slate-500">Your Intelligent Agricultural Partner</p>
        </div>

        {/* Tab triggers */}
        <div className="flex border-b border-slate-100 text-xs font-semibold text-slate-400">
          <button
            onClick={() => handleTabChange('login')}
            className={`flex-1 pb-3 text-center border-b-2 transition-all ${
              activeTab === 'login' ? 'border-primary text-primary font-bold' : 'border-transparent hover:text-slate-600'
            }`}
          >
            Farmer Sign In
          </button>
          <button
            onClick={() => handleTabChange('register')}
            className={`flex-1 pb-3 text-center border-b-2 transition-all ${
              activeTab === 'register' ? 'border-primary text-primary font-bold' : 'border-transparent hover:text-slate-600'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => handleTabChange('forgot')}
            className={`flex-1 pb-3 text-center border-b-2 transition-all ${
              activeTab === 'forgot' ? 'border-primary text-primary font-bold' : 'border-transparent hover:text-slate-600'
            }`}
          >
            Recovery
          </button>
          <button
            onClick={() => handleTabChange('admin')}
            className={`flex-1 pb-3 text-center border-b-2 transition-all ${
              activeTab === 'admin' ? 'border-secondary text-secondary font-bold' : 'border-transparent hover:text-slate-600'
            }`}
          >
            Admin Link
          </button>
        </div>

        {/* Alerts panel */}
        {errorMsg && (
          <div className="flex items-center space-x-2 bg-red-50 border border-red-100 text-error p-3 rounded-lg text-xs font-semibold animate-fade-in">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center space-x-2 bg-green-50 border border-green-100 text-success p-3 rounded-lg text-xs font-semibold animate-fade-in">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Dynamic Form wrapper */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-semibold text-slate-600">
          
          {/* Farmer/Admin Login inputs */}
          {(activeTab === 'login' || activeTab === 'admin') && (
            <>
              <div className="space-y-1">
                <label className="block">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. farmer@gmail.com"
                  className={`w-full bg-slate-50 border rounded-lg p-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none ${errors.email ? 'border-error' : 'border-slate-100'}`}
                  {...register('email', { required: 'Email is required' })}
                />
              </div>
              <div className="space-y-1">
                <label className="block">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full bg-slate-50 border rounded-lg p-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none ${errors.password ? 'border-error' : 'border-slate-100'}`}
                  {...register('password', { required: 'Password is required' })}
                />
              </div>
            </>
          )}

          {/* Registration Fields */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh"
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    {...register('name', { required: 'Name is required' })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block">Email Address</label>
                  <input
                    type="email"
                    placeholder="ramesh@gmail.com"
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    {...register('email', { required: 'Email is required' })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block">Phone Number</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    {...register('phone', { required: 'Phone is required' })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block">State</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none text-slate-600 font-semibold"
                    {...register('state', { required: true })}
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Gujarat">Gujarat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block">Village / City</label>
                  <input
                    type="text"
                    placeholder="Lasalgaon"
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    {...register('location')}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block">Password</label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    {...register('password', { required: 'Password is required', minLength: 6 })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Recovery Fields */}
          {activeTab === 'forgot' && (
            <>
              {recoverStep === 1 ? (
                <div className="space-y-1">
                  <label className="block">Registered Email Address</label>
                  <input
                    type="email"
                    placeholder="farmer@gmail.com"
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    {...register('email', { required: 'Email is required' })}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-center text-primary font-bold">Enter 6-Digit OTP Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-center font-bold tracking-widest focus:ring-1 focus:ring-primary focus:outline-none"
                      {...register('otp', { required: 'OTP is required' })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block">Set New Password</label>
                    <input
                      type="password"
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                      {...register('newPassword', { required: 'New password is required', minLength: 6 })}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold text-xs py-3.5 rounded-premium shadow-premium transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'admin' ? 'bg-secondary hover:bg-secondary-dark' : 'bg-primary hover:bg-primary-dark'
            }`}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {activeTab === 'login' && 'Sign In'}
                  {activeTab === 'register' && 'Create Account'}
                  {activeTab === 'admin' && 'Enter Admin Panel'}
                  {activeTab === 'forgot' && (recoverStep === 1 ? 'Send Recovery OTP' : 'Update Password')}
                </span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Auth;
