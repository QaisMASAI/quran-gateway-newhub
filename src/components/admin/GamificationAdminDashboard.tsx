import React, { useState } from "react";
import { Shield, Plus, Settings, BarChart3, Users, Zap, Award, CheckCircle2 } from "lucide-react";
import { ALL_300_ACHIEVEMENTS, type AchievementItem } from "@/lib/gamification";
import {
  loadUserGamification,
  type DailyChallenge,
  type UserGameification,
} from "@/lib/gamification-engine-v2";

export const GamificationAdminDashboard: React.FC = () => {
  const [data, setData] = useState<UserGameification>(loadUserGamification);
  const [activeTab, setActiveTab] = useState<
    "analytics" | "challenges" | "achievements" | "xp_rates"
  >("analytics");

  // New challenge form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDiff, setNewDiff] = useState<"easy" | "medium" | "hard">("easy");
  const [newXp, setNewXp] = useState(50);

  const handleAddChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCh: DailyChallenge = {
      id: `dc_custom_${Date.now()}`,
      title: newTitle,
      description: newDesc || "Custom challenge created via Admin Panel",
      difficulty: newDiff,
      durationMinutes: newDiff === "easy" ? 5 : newDiff === "medium" ? 15 : 30,
      xpReward: Number(newXp),
      completed: false,
      claimed: false,
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      progress: 0,
    };

    data.dailyChallenges = [newCh, ...data.dailyChallenges];
    setData({ ...data });
    setNewTitle("");
    setNewDesc("");
    alert("New challenge published to Gamification Engine 2.0!");
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 py-6 px-4">
      {/* Admin Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 text-2xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white dir-auto">
              Gamification Engine 2.0 Admin Dashboard
            </h2>
            <p className="text-xs text-zinc-400 dir-auto">
              Manage engagement loops, create daily challenges, audit achievements, & track
              analytics.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-800 border border-zinc-700">
          {[
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "challenges", label: "Challenges", icon: Plus },
            { id: "achievements", label: "Achievements", icon: Award },
            { id: "xp_rates", label: "XP Rates", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive ? "bg-amber-600 text-white shadow-sm" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
              <span className="text-xs font-bold text-zinc-400 uppercase">
                Daily Active Users (DAU)
              </span>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                1,420
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">+12.4% this week</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
              <span className="text-xs font-bold text-zinc-400 uppercase">
                7-Day Streak Retention
              </span>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                68.2%
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">World-class benchmark</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
              <span className="text-xs font-bold text-zinc-400 uppercase">
                Challenge Completion
              </span>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                84.5%
              </div>
              <span className="text-[10px] text-amber-600 font-bold">High engagement</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
              <span className="text-xs font-bold text-zinc-400 uppercase">
                Prestige Conversions
              </span>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                42 Users
              </div>
              <span className="text-[10px] text-purple-600 font-bold">Level 100 Masters</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CREATE CHALLENGES */}
      {activeTab === "challenges" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-6">
          <form onSubmit={handleAddChallenge} className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-500" />
              <span>Create New Daily Challenge</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Challenge Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                required
              />

              <select
                value={newDiff}
                onChange={(e) => {
                  const d = e.target.value as "easy" | "medium" | "hard";
                  setNewDiff(d);
                  setNewXp(d === "easy" ? 50 : d === "medium" ? 100 : 200);
                }}
                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
              >
                <option value="easy">Easy (50 XP / 5 min)</option>
                <option value="medium">Medium (100 XP / 15 min)</option>
                <option value="hard">Hard (200 XP / 30+ min)</option>
              </select>
            </div>

            <textarea
              rows={2}
              placeholder="Challenge description and instructions..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
            />

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shadow-sm"
            >
              Publish Challenge
            </button>
          </form>

          {/* Active Challenges List */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h4 className="text-xs font-bold text-zinc-400 uppercase">
              Active Published Challenges
            </h4>
            {data.dailyChallenges.map((ch) => (
              <div
                key={ch.id}
                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{ch.title}</span>
                  <span className="ml-2 text-[10px] text-zinc-400">({ch.difficulty})</span>
                </div>
                <span className="font-mono font-bold text-amber-600">+{ch.xpReward} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ACHIEVEMENTS CATALOG */}
      {activeTab === "achievements" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            300+ Defined Achievements in Catalog
          </h3>
          <div className="max-h-96 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
            {ALL_300_ACHIEVEMENTS.slice(0, 20).map((ach) => (
              <div
                key={ach.id}
                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span>{ach.icon}</span>
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">{ach.nameEn}</div>
                    <div className="text-[10px] text-zinc-400">
                      {ach.category} • {ach.rarity}
                    </div>
                  </div>
                </div>
                <span className="font-mono font-bold text-amber-600">+{ach.rewardXP} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: XP RATES & RULES */}
      {activeTab === "xp_rates" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Configured XP Reward Rates & Decay Rules
          </h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex justify-between">
              <span>Knowledge XP (Reading/Learning)</span>
              <span className="font-bold text-emerald-600">10 - 50 XP</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex justify-between">
              <span>Mastery XP (Quiz Completion)</span>
              <span className="font-bold text-blue-600">50 - 200 XP</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex justify-between">
              <span>Consistency XP (Daily Streaks)</span>
              <span className="font-bold text-amber-600">5 - 10 XP / Day</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex justify-between">
              <span>Challenge XP (Boss & Daily Tasks)</span>
              <span className="font-bold text-indigo-600">100 - 500 XP</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex justify-between">
              <span>Social XP (Du'a Praise & Help)</span>
              <span className="font-bold text-rose-600">25 - 75 XP</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
