/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, EcoNotification } from "../types";
import { Leaf, Bell, ShoppingBag, Shield, Menu, X, Award, LogOut } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  currentUser: User | null;
  activeView: string;
  setActiveView: (view: string) => void;
  notifications: EcoNotification[];
  clearNotifications: () => void;
  cartCount: number;
  onLogout: () => void;
}

export default function Header({
  currentUser,
  activeView,
  setActiveView,
  notifications,
  clearNotifications,
  cartCount,
  onLogout,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getNavClass = (view: string) => {
    const base = "relative px-3 py-2.5 text-xs font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5";
    return activeView === view
      ? `${base} text-[#1A1A1A]`
      : `${base} text-[#1A1A1A]/70 hover:text-[#1A1A1A]`;
  };

  const handleLogoClick = () => {
    if (!currentUser) {
      setActiveView("landing");
    } else if (currentUser.role === "restaurant") {
      setActiveView("restaurant-dashboard");
    } else {
      setActiveView("browse");
    }
  };

  const menuItems = currentUser?.role === "restaurant"
    ? [
        { label: "Store Dashboard", view: "restaurant-dashboard" },
        { label: "Settings", view: "settings" },
      ]
    : [
        { label: "Home", view: "landing" },
        { label: "Rescue Food", view: "browse" },
        { label: "Eco-Map", view: "map" },
        { label: "Eco Impact", view: "sustainability" },
        { label: "Settings", view: "settings" },
      ];

  // Profile Hub access is handled directly via clicking the top-right profile user section instead of the main menu list to keep it clean.

  return (
    <header className="sticky top-0 z-[1000] w-full bg-[#FAF9F6]/95 backdrop-blur-md border-b-2 border-[#1A1A1A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Slogan */}
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-[#15803d] rounded-full flex items-center justify-center text-white transition-all group-hover:scale-105">
              <Leaf className="w-4 h-4 fill-white/20" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-2xl text-[#1A1A1A] tracking-tighter uppercase italic leading-none">
                EcoBite
              </span>
              <span className="text-[9px] text-[#ea580c] font-mono tracking-[0.15em] uppercase font-bold mt-1">
                Zero Food Waste Network
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 h-full pt-1">
            {menuItems.map((item) => {
              const isActive = activeView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => {
                    setActiveView(item.view);
                    setMobileMenuOpen(false);
                  }}
                  className={getNavClass(item.view)}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicatorLine"
                      className="absolute bottom-[-1px] left-3 right-3 h-[3px] bg-[#ea580c]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Interactions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-slate-500 hover:text-green-600 hover:bg-slate-50 transition-colors relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2.5 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 block origin-top-right z-50"
                  >
                    <div className="px-4 pb-2 border-b border-slate-50 flex justify-between items-center">
                      <span className="font-semibold text-xs text-slate-800">Environmental Alerts</span>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearNotifications}
                          className="text-[10px] font-medium text-green-600 hover:text-green-700 cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto px-2 mt-2">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                          🌱 No fresh excess food alerts.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="p-2.5 rounded-lg hover:bg-slate-50 transition-colors text-xs flex gap-2"
                          >
                            <span className="text-base">📢</span>
                            <div>
                              <p className="font-semibold text-slate-800">{notif.title}</p>
                              <p className="text-slate-500 mt-0.5">{notif.message}</p>
                              <span className="text-[9px] text-slate-400 mt-1 block">{notif.timestamp}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setActiveView("cart")}
              className="p-2 rounded-xl text-slate-500 hover:text-green-600 hover:bg-slate-50 transition-colors relative cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-[10px] font-bold text-white rounded-full border-2 border-white flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile / Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div
                  onClick={() => setActiveView(currentUser.role === "restaurant" ? "restaurant-dashboard" : "recipient-dashboard")}
                  className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all py-1"
                  title="Go to Eco Hub"
                >
                  <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-green-100 select-none uppercase shadow-sm shrink-0">
                    {currentUser.name ? currentUser.name.charAt(0) : "U"}
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-bold text-slate-900 line-clamp-1 hover:text-green-600 transition-colors">
                      {currentUser.name}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 leading-none mt-0.5 font-mono">
                      <Award className="w-3 h-3 text-emerald-500" />
                      {currentUser.points} pts
                    </span>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-50 cursor-pointer transition-colors ml-1"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveView("auth")}
                className="art-btn-black"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Hamburger (Mobile) */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setActiveView("cart")}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors relative cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-600 rounded-full"></span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-100 bg-white overflow-hidden py-3 px-4"
          >
            <div className="flex flex-col gap-1.5 mb-4">
              {menuItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => {
                    setActiveView(item.view);
                    setMobileMenuOpen(false);
                  }}
                  className={getNavClass(item.view)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Profile mobile view or sign in */}
            {currentUser ? (
              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <div
                  onClick={() => {
                    setActiveView(currentUser.role === "restaurant" ? "restaurant-dashboard" : "recipient-dashboard");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-sm uppercase ring-2 ring-green-100 select-none shadow-sm shrink-0 font-display">
                    {currentUser.name ? currentUser.name.charAt(0) : "U"}
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-slate-900 hover:text-green-600 transition-colors">{currentUser.name}</span>
                    <span className="block text-xs font-mono text-green-600 font-bold">{currentUser.points} Eco-Points</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="bg-slate-50 text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setActiveView("auth");
                  setMobileMenuOpen(false);
                }}
                className="w-full art-btn-black block text-center"
              >
                Sign In
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
