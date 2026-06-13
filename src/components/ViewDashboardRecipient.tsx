/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Reservation, FoodListing } from "../types";
import { Award, ShieldAlert, Sparkles, Navigation, Calendar, CheckSquare, Gift } from "lucide-react";
import { motion } from "motion/react";

interface ViewDashboardRecipientProps {
  currentUser: User | null;
  reservations: Reservation[];
  onCompleteReservation: (id: string, listingId: string) => void;
  onCancelReservation: (id: string) => void;
}

export default function ViewDashboardRecipient({
  currentUser,
  reservations,
  onCompleteReservation,
  onCancelReservation,
}: ViewDashboardRecipientProps) {
  if (!currentUser) return null;

  // Calculate stats based on real logs
  const totalRescues = reservations.filter((r) => r.status === "completed").length;
  // Dynamic co2 calculation based on items completed
  const totalCo2Saved = (currentUser.savedCO2 || 0) + (totalRescues * 2.2);

  const getBadgeTier = (points: number) => {
    if (points >= 1000) return { title: "Forest Guardian", desc: "Planted 5+ regional trees", icon: "🌳" };
    if (points >= 500) return { title: "Zero-Waste Gladiator", desc: "Planted 2 trees", icon: "🌱" };
    return { title: "Eco-Pioneer", desc: "Starting the green rescue track", icon: "🍃" };
  };

  const currentTier = getBadgeTier(currentUser.points);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Recipient Profile & Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-white/25 text-white rounded-2xl flex items-center justify-center font-display font-black text-2xl tracking-tight shadow-md border-2 border-white/30 shrink-0 select-none uppercase">
            {currentUser.name ? currentUser.name.charAt(0) : "E"}
          </div>
          <div className="text-center sm:text-left space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-green-200 bg-white/10 px-2.5 py-1 rounded">
              Verified Recipient Account
            </span>
            <h2 className="font-display font-bold text-2xl">{currentUser.name}</h2>
            <p className="text-xs text-green-150 max-w-md">
              Forming custom sustainable behaviors to protect Batu Pahat and Johor's fragile botanical biomes.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of stats and badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat card points */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <span className="text-2xl">🏆</span>
          <div>
            <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Ecological Points</span>
            <span className="block font-display font-bold text-2xl text-slate-900">{currentUser.points} Eco-Points</span>
            <span className="text-[10.5px] text-green-600 font-bold block mt-1">✓ Earned via digital surplus claim events</span>
          </div>
        </div>

        {/* Stat card co2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <span className="text-2xl">🌲</span>
          <div>
            <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Estimated Carbon Avoided</span>
            <span className="block font-display font-bold text-2xl text-slate-900">{totalCo2Saved.toFixed(1)} kg CO₂e</span>
            <span className="text-[10.5px] text-green-600 font-bold block mt-1">✓ Equivalent of planting {Math.max(1, Math.floor(totalCo2Saved / 8))} trees</span>
          </div>
        </div>

        {/* Badge Tier */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
          <div>
            <span className="text-3xl block mb-2">{currentTier.icon}</span>
            <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Current Badge Level</span>
            <h4 className="font-bold text-slate-900 text-sm">{currentTier.title}</h4>
            <p className="text-[10.5px] text-slate-500">{currentTier.desc}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold">
            <Award className="w-6 h-6 text-green-600 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Active reservations logs */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          Active Pickup Reservations
        </h3>

        {reservations.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <CheckSquare className="w-8 h-8 text-slate-300 mx-auto" strokeWidth={1.5} />
            <p className="text-xs">No pending food pickups. Go to the catalogs and reserve a portion!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((res) => (
              <div
                key={res.id}
                className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-colors ${
                  res.status === "completed"
                    ? "bg-slate-50 border-slate-150 opacity-75"
                    : res.status === "cancelled"
                    ? "bg-rose-50/20 border-rose-100 opacity-70"
                    : "bg-white border-green-150 shadow-sm"
                }`}
              >
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 bg-green-100/60 text-green-600 rounded-xl flex items-center justify-center font-bold text-base">
                    {res.status === "completed" ? "✓" : res.status === "cancelled" ? "✕" : "⏳"}
                  </div>
                  <div>
                    <span className="text-[10.5px] text-slate-400 font-mono block">Order ID: {res.id}</span>
                    <h4 className="font-bold text-xs text-slate-800 mt-0.5">{res.listingTitle}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">📍 Prepared by: <strong>{res.restaurantName}</strong></p>
                    <span className="text-[10px] text-slate-400">{res.createdAt}</span>
                  </div>
                </div>

                <div className="text-center bg-slate-50 border border-slate-150 px-4 py-2.5 rounded-xl">
                  <span className="block text-[9px] text-slate-400 uppercase tracking-widest font-mono">Secure Pickup CODE</span>
                  <span className="text-sm font-mono font-bold text-slate-900">{res.pickupCode}</span>
                </div>

                <div className="flex gap-2">
                  {res.status === "reserved" && (
                    <>
                      <button
                        onClick={() => onCancelReservation(res.id)}
                        className="px-3 py-2 border border-slate-200 hover:border-rose-500 text-slate-500 hover:text-rose-500 rounded-lg text-xs font-semibold cursor-pointer transition-colors bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => onCompleteReservation(res.id, res.listingId)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4.5 py-2.5 rounded-lg cursor-pointer transition-all shadow-sm"
                      >
                        Enter storefront and Pick Up
                      </button>
                    </>
                  )}
                  {res.status === "completed" && (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                      ✓ Safely Rescued
                    </span>
                  )}
                  {res.status === "cancelled" && (
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg">
                      ✕ Cancelled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sustainable Competencies Checklist */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
        <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
          <Gift className="w-5 h-5 text-green-600" />
          Sustainable Competency SC2 Engagement Guide
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-650">
          <div className="space-y-1.5">
            <span className="font-bold text-slate-900 block">Anticipatory Innovation Actions:</span>
            <p className="leading-relaxed">
              Verify local storefront pickup coordinates on the map under <strong>Eco-Map tab</strong> to determine fuel efficiency and prioritize bicycle or pedestrian journeys.
            </p>
          </div>
          <div className="space-y-1.5">
            <span className="font-bold text-slate-900 block">Gamification points for Green projects:</span>
            <p className="leading-relaxed">
              Each completed surplus rescue raises your verified balance. Earn 1,000 points to trigger a seed-planting project sponsored by Batu Pahat Botanical Society!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
