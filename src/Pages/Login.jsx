import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Building2, Mail, Lock, User, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const { login, register } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await login(email, password);
    } else {
      await register(name, email, password);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 grid lg:grid-cols-12 font-sans overflow-x-hidden">

      {/* ── LEFT PANEL: Branding & Features ── */}
      <div className="hidden lg:flex lg:col-span-7 bg-slate-900 flex-col justify-between p-16 relative overflow-hidden border-r border-slate-800">
        {/* Background glow blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none"></div>

        {/* Logo */}
        <div className="flex items-center space-x-3 relative z-10">
          <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/20">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">Appz2mate Billing</span>
        </div>

        {/* Hero copy */}
        <div className="space-y-6 max-w-xl relative z-10 my-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
            <Sparkles size={13} />
            <span>Premium Enterprise Billing Solution</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
            Automate invoicing for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              10+ business categories
            </span>.
          </h1>

          <p className="text-slate-400 leading-relaxed">
            Create GST-compliant invoices, track clients, manage inventory, and monitor cash flow — all from one workspace.
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-5 pt-8 border-t border-slate-800">
            <div className="flex gap-3">
              <div className="p-2 h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                <Zap size={18} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Dynamic Invoicing</h4>
                <p className="text-xs text-slate-500 mt-0.5">Adapt fields for medical, restaurant, auto, and more.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="p-2 h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">3 Premium Templates</h4>
                <p className="text-xs text-slate-500 mt-0.5">Classic, Modern & Premium invoice designs to print.</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-slate-600 text-xs relative z-10">© 2026 Appz2mate Systems · SSL Encrypted</p>
      </div>

      {/* ── RIGHT PANEL: Auth Forms ── */}
      <div className="col-span-12 lg:col-span-5 bg-white dark:bg-gray-900 flex flex-col justify-center p-8 sm:p-12 xl:p-16">
        <div className="max-w-md w-full mx-auto space-y-7">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-2xl">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-black text-slate-800 dark:text-white">Appz2mate Billing</span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to access your billing workspace.</p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                isLogin
                  ? 'bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                !isLogin
                  ? 'bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Credential form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-11 pr-4 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-white transition"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="email"
                  placeholder="name@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-11 pr-4 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-white transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                {isLogin && (
                  <a href="#forgot" className="text-xs text-blue-600 hover:underline font-semibold">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-11 pr-4 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-white transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-3 rounded-2xl shadow-lg shadow-slate-950/10 transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              <span>{isLogin ? 'Launch Workspace' : 'Create Account'}</span>
              <ArrowRight size={15} />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
