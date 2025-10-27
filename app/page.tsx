// app/page.tsx
'use client';

import EventForm from './components/EventForm';
import Link from 'next/link';
import { Calendar, Sparkles, Clock, Users, Zap, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-bright-purple/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-16"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6"
          >
            <Zap className="h-4 w-4 text-cyber-yellow" />
            <span className="text-white text-sm font-semibold">AI-Powered Scheduling</span>
          </motion.div>
          
          <h1 className="text-6xl md:text-7xl font-display font-bold mb-6">
            <span className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              Schedule Smarter
            </span>
          </h1>
          <p className="text-xl text-white/90 font-body max-w-2xl mx-auto">
            Transform your productivity with intelligent calendar management powered by AI
          </p>
        </motion.div>

        {/* Event Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <EventForm />
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 px-4">
          <motion.div
            whileHover={{ y: -5 }}
            className="glass p-8 rounded-2xl border border-white/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-electric-blue to-bright-purple rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display font-bold text-white text-xl">Natural Language</h3>
            </div>
            <p className="text-white/80 font-body">
              Simply type what you need to schedule and let AI understand your intent instantly
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="glass p-8 rounded-2xl border border-white/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-neon-green to-vivid-teal rounded-xl">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display font-bold text-white text-xl">Smart Optimization</h3>
            </div>
            <p className="text-white/80 font-body">
              AI analyzes your patterns to suggest optimal meeting times and durations
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="glass p-8 rounded-2xl border border-white/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-sunset-orange to-hot-pink rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display font-bold text-white text-xl">Productivity Insights</h3>
            </div>
            <p className="text-white/80 font-body">
              Track your time allocation and get actionable insights to boost productivity
            </p>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center pt-8"
        >
          <Link
            href="/calendar"
            className="inline-flex items-center gap-3 px-8 py-4 btn-primary rounded-xl text-lg"
          >
            <Calendar className="h-6 w-6" />
            Open Calendar
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}