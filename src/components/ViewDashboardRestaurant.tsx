/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { User, FoodListing, Reservation } from "../types";
import { BarChart, Store, Activity, Trash2, Shield, PlusCircle, Sparkles, TrendingUp, DollarSign, BellRing, ClipboardCheck, ArrowUpRight, CheckCircle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ViewDashboardRestaurantProps {
  currentUser: User | null;
  listings: FoodListing[];
  reservations: Reservation[];
  onSetView: (view: string) => void;
  onRemoveListing: (listingId: string) => void;
  onUpdateUserPremium: () => void;
  onCompleteReservation?: (id: string, listingId: string) => void;
}

export default function ViewDashboardRestaurant({
  currentUser,
  listings,
  reservations,
  onSetView,
  onRemoveListing,
  onUpdateUserPremium,
  onCompleteReservation,
}: ViewDashboardRestaurantProps) {
  const [showPremiumUpgradeModal, setShowPremiumUpgradeModal] = useState(false);
  const [premiumSuccess, setPremiumSuccess] = useState(false);

  // Active view segment toggle matching WhatsApp request ("incoming order button")
  const [activeSegment, setActiveSegment] = useState<"listings" | "orders">("listings");
  
  // Local notification banner state
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");

  if (!currentUser) return null;

  // Filter listings by this restaurant
  const myListings = listings.filter((item) => item.restaurantId === currentUser.uid);

  // Filter reservations made for this restaurant's items
  const myReservations = reservations.filter((res) => {
    // Check if the reservation's listingId belongs to any of my listings or matches coordinates/merchant name
    const matchesMyListingId = myListings.some((l) => l.id === res.listingId);
    const matchesMerchantName = res.restaurantName.toLowerCase().includes(currentUser.name.toLowerCase());
    return matchesMyListingId || matchesMerchantName;
  });

  const activeReservationsCount = myReservations.filter((r) => r.status === "reserved").length;

  // Stats calculation
  const totalListings = myListings.length;
  const completedListings = myListings.filter((item) => item.status === "completed").length;
  const salvagedMeals = myListings.reduce((acc, curr) => acc + (curr.status === "completed" ? curr.quantity : 0), 0);
  const totalRevenue = myListings.reduce((acc, curr) => acc + (curr.status === "completed" ? (curr.discountedPrice * curr.quantity) : 0), 0);
  const totalCo2Saved = myListings.reduce((acc, curr) => acc + (curr.status === "completed" ? (curr.co2Saved * curr.quantity) : 0), 0);

  const handlePremiumTrigger = () => {
    setPremiumSuccess(true);
    setTimeout(() => {
      onUpdateUserPremium();
      setPremiumSuccess(false);
      setShowPremiumUpgradeModal(false);
    }, 1500);
  };

  const handleVerifyAndComplete = (resId: string, listingId: string, passCode: string) => {
    if (onCompleteReservation) {
      onCompleteReservation(resId, listingId);
      setActionSuccessMessage(`Order verification code [${passCode}] successfully confirmed!`);
      setTimeout(() => setActionSuccessMessage(""), 4500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Merchant Header */}
      <div className="bg-slate-900 text-white rounded-none p-6 sm:p-8 relative overflow-hidden shadow-lg border-2 border-[#1A1A1A]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/5 rounded-full blur-3xl"></div>
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-600 border border-green-500 rounded-none flex items-center justify-center text-white shadow font-bold text-2xl">
              👨‍🍳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-2xl tracking-tight uppercase italic">{currentUser.name}</h2>
                {currentUser.isPremium ? (
                  <span className="bg-amber-500 text-slate-950 text-[9.5px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                    <Sparkles className="w-3 h-3 animate-spin" />
                    Eco-Champ
                  </span>
                ) : (
                  <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-none font-mono font-bold uppercase">Standard tier</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium font-mono">📍 Local merchant console: <em>Parit Raja, Johor</em></p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            {!currentUser.isPremium && (
              <button
                onClick={() => setShowPremiumUpgradeModal(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-black uppercase tracking-wider px-4 py-3 rounded-none border border-slate-950 cursor-pointer"
              >
                ⭐ Go Premium (RM15/mo)
              </button>
            )}

            {/* WhatsApp requirement: INCOMING ORDER Button */}
            <button
              onClick={() => {
                setActiveSegment("orders");
                const el = document.getElementById("receptacle-segment");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className={`text-[11px] font-black uppercase tracking-wider px-4 py-3 border-2 border-white cursor-pointer flex items-center gap-1.5 transition-all ${
                activeSegment === "orders" 
                  ? "bg-amber-500 text-slate-900 border-amber-500" 
                  : "bg-transparent text-white hover:bg-white/10"
              }`}
            >
              <BellRing className="w-4 h-4 text-emerald-400" />
              Incoming Orders ({activeReservationsCount})
            </button>

            {/* WhatsApp requirement: ADD LISTING Button */}
            <button
              onClick={() => onSetView("add-listing")}
              className="bg-green-600 hover:bg-green-700 text-white text-[11px] font-black uppercase tracking-wider px-4 py-3 border-2 border-green-500 shadow cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Add Listing
            </button>
          </div>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-3 bg-green-50 border-2 border-green-600 text-green-900 text-xs font-bold font-mono tracking-wide flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-600 fill-green-50" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Numerical Analytics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] space-y-3">
          <span className="text-xl">📊</span>
          <div>
            <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Salvaged Food Bags</span>
            <span className="block font-display font-black text-xl text-slate-900">{salvagedMeals} Servings</span>
            <span className="text-[10px] text-green-600 font-bold font-mono uppercase">Mitigated organic waste</span>
          </div>
        </div>

        <div className="bg-white p-5 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] space-y-3">
          <span className="text-xl">💰</span>
          <div>
            <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Salvaged Revenue (RM)</span>
            <span className="block font-display font-black text-xl text-slate-900">RM {totalRevenue.toFixed(2)}</span>
            <span className="text-[10px] text-green-600 font-bold font-mono uppercase">Recouped overheads</span>
          </div>
        </div>

        <div className="bg-white p-5 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] space-y-3">
          <span className="text-xl">🍃</span>
          <div>
            <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">CO₂ Mitigated (kg)</span>
            <span className="block font-display font-black text-xl text-slate-900">{totalCo2Saved.toFixed(1)} kg CO₂e</span>
            <span className="text-[10px] text-green-600 font-bold font-mono uppercase">Local greening impact</span>
          </div>
        </div>

        <div className="bg-white p-5 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] space-y-3">
          <span className="text-xl">💯</span>
          <div>
            <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Surplus Save Rate</span>
            <span className="block font-display font-black text-xl text-slate-900">
              {totalListings > 0 ? `${((completedListings / totalListings) * 100).toFixed(0)}%` : "0%"}
            </span>
            <span className="text-[10px] text-green-600 font-bold font-mono uppercase">Claimed by neighbors</span>
          </div>
        </div>
      </div>

      {/* Interactive Charts Dashboard Representation */}
      <div id="receptacle-segment" className="grid grid-cols-1 lg:grid-cols-12 gap-8 scroll-mt-24">
        
        {/* Custom Visual Bar Chart for Food Salvaged Metrics (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] space-y-5">
          <h4 className="font-display font-black text-xs text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Activity className="w-4.5 h-4.5 text-green-600" />
            Zero-Waste Analytics
          </h4>
          <p className="text-[11.5px] text-slate-500 font-medium">
            Weekly category analysis of surplus offerings salvaged in Parit Raja.
          </p>

          <div className="space-y-4 pt-2">
            {[
              { category: "Bakery & Danishes", count: 24, max: 30, color: "bg-green-500" },
              { category: "Cooked Hot Meals", count: 18, max: 30, color: "bg-emerald-600" },
              { category: "Veggie & Grocery boxes", count: 8, max: 30, color: "bg-indigo-500" },
              { category: "Desserts & Fudge Cakes", count: 11, max: 30, color: "bg-amber-500" },
            ].map((bar) => (
              <div key={bar.category} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{bar.category}</span>
                  <span className="text-slate-900 font-black">{bar.count} saved</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-none overflow-hidden border border-[#1A1A1A]">
                  <div
                    className={`h-full ${bar.color} transition-all duration-1000`}
                    style={{ width: `${(bar.count / bar.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* List of current listings or Incoming Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 border-2 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#1A1A1A] space-y-6">
          
          {/* Section Segment Tabs Header */}
          <div className="flex border-b-2 border-[#1A1A1A] pb-3 justify-between items-center">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveSegment("listings")}
                className={`font-display font-black text-sm uppercase tracking-wider pb-1.5 transition-all text-left cursor-pointer border-b-2 ${
                  activeSegment === "listings"
                    ? "border-[#ea580c] text-[#ea580c]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                🏪 Food Listings ({totalListings})
              </button>
              <button
                onClick={() => setActiveSegment("orders")}
                className={`font-display font-black text-sm uppercase tracking-wider pb-1.5 transition-all text-left cursor-pointer border-b-2 relative ${
                  activeSegment === "orders"
                    ? "border-[#ea580c] text-[#ea580c]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                🛎️ Incoming Orders ({myReservations.length})
                {activeReservationsCount > 0 && (
                  <span className="absolute -top-1 -right-3 w-4 h-4 bg-red-600 rounded-full text-white text-[9px] flex items-center justify-center font-black">
                    {activeReservationsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Segment Content: LISTINGS */}
          {activeSegment === "listings" && (
            <div className="space-y-4">
              {myListings.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <span className="text-3xl block">📢</span>
                  <p className="text-xs font-bold uppercase">You haven't posted any surplus listings yet.</p>
                  <button
                    onClick={() => onSetView("add-listing")}
                    className="mt-2 text-xs bg-[#1A1A1A] text-white py-1.5 px-3 uppercase font-bold hover:bg-[#ea580c]"
                  >
                    Post announcement
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#1A1A1A]/10 max-h-[420px] overflow-y-auto pr-1 space-y-3">
                  {myListings.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex justify-between items-center text-xs">
                      <div className="flex gap-3 items-center">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-10 h-10 border border-[#1A1A1A] object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h5 className="font-extrabold text-slate-900 line-clamp-1">{item.title}</h5>
                          <span className="block text-[9.5px] font-mono text-slate-400 leading-normal mt-0.5 font-bold">
                            Min Left: {item.durationLeft} mins | Price: RM {item.discountedPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 border text-[9px] font-black uppercase ${
                          item.status === "completed"
                            ? "bg-green-50 border-green-600 text-green-700"
                            : "bg-yellow-50 border-yellow-600 text-yellow-700"
                        }`}>
                          {item.status}
                        </span>
                        <button
                          onClick={() => onRemoveListing(item.id)}
                          className="text-slate-350 hover:text-red-600 p-1 hover:bg-slate-50 border border-transparent hover:border-[#1A1A1A]/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Segment Content: INCOMING ORDERS */}
          {activeSegment === "orders" && (
            <div className="space-y-4">
              {myReservations.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <span className="text-3xl block">🛎️</span>
                  <p className="text-xs font-black uppercase text-[#1A1A1A]">No incoming orders registered yet.</p>
                  <p className="text-[10px] text-slate-400 max-w-sm mx-auto font-medium">
                    When customers reserve food bags at your store, pickup codes and transaction logs will be listed here automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                  {myReservations.map((res) => (
                    <div
                      key={res.id}
                      className={`p-4 border-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs transition-colors ${
                        res.status === "completed"
                          ? "bg-green-50/50 border-green-600/35"
                          : "bg-[#FAF9F6] border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A]"
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono bg-[#1A1A1A] text-white px-2 py-0.5 text-[9px] font-black uppercase">ORDER ID: {res.id}</span>
                          <span className={`px-2 py-0.5 text-[9px] border font-black uppercase ${
                            res.status === "completed"
                              ? "bg-green-100 border-green-700 text-green-800"
                              : "bg-amber-100 border-amber-700 text-amber-800"
                          }`}>
                            {res.status === "completed" ? "PICKED UP" : "RESERVED"}
                          </span>
                        </div>
                        <h5 className="font-black text-slate-900 text-sm mt-1">{res.listingTitle}</h5>
                        <p className="text-slate-500 font-bold">Rescued by: <span className="text-[#1A1A1A] underline decoration-indigo-300">{res.recipientName}</span></p>
                        <p className="text-[10px] text-slate-400 font-mono font-semibold">Ordered on: {res.createdAt}</p>
                      </div>

                      <div className="text-left sm:text-right space-y-2 shrink-0 w-full sm:w-auto border-t sm:border-0 pt-2 sm:pt-0">
                        <div>
                          <p className="font-mono text-[10px] text-slate-400 font-bold">Quantity: {res.quantity} | Amount: <span className="font-black text-slate-900">{res.totalPrice === 0 ? "FREE" : `RM ${res.totalPrice.toFixed(2)}`}</span></p>
                          <p className="font-mono text-xs font-black mt-1 text-[#ea580c]">
                            Security Token: <span className="bg-[#1A1A1A] text-[#FAF9F6] px-1.5 py-0.5 tracking-wider font-bold">{res.pickupCode}</span>
                          </p>
                        </div>

                        {res.status === "reserved" && (
                          <button
                            onClick={() => handleVerifyAndComplete(res.id, res.listingId, res.pickupCode)}
                            className="bg-green-600 hover:bg-green-700 border border-[#1A1A1A] text-white font-extrabold text-[10px] tracking-wider uppercase px-3 py-1.5 transition-colors cursor-pointer w-full"
                          >
                            Verify & Complete Pickup
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Premium Upgrade Modal */}
      {showPremiumUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-none max-w-md w-full border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#1A1A1A] space-y-6 text-center transform scale-100">
            {premiumSuccess ? (
              <div className="py-8 space-y-3">
                <span className="text-4xl block animate-bounce">🥇</span>
                <h4 className="font-display font-black text-lg text-slate-900 uppercase">Premium Upgrade Confirmed!</h4>
                <p className="text-xs text-slate-500 font-medium">Your "Eco-Champ" badge status has been successfully applied to your Batu Pahat profile.</p>
                <div className="w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mt-4"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <span className="text-4xl">👑</span>
                <h3 className="font-display font-black text-xl text-slate-900 uppercase">Become Eco-Champ Merchant</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Support Johor Local Food Resource Networks and enjoy full structural marketing. RM15.00/month directly structures organic compost programs.
                </p>

                <div className="space-y-2.5 text-left text-xs bg-slate-50 p-4 rounded-none border-2 border-[#1A1A1A]">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>High Visibility Pins</strong> on the active Eco-Map.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>Analytical Excel export</strong> parameters for school assessments.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>Golden "Eco-Champ" verified badge</strong> beside your logo.</span>
                  </div>
                </div>

                <div className="flex gap-3.5 pt-4">
                  <button
                    onClick={() => setShowPremiumUpgradeModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-[#1A1A1A] text-[#1A1A1A] font-bold rounded-none text-xs cursor-pointer hover:bg-slate-50 uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePremiumTrigger}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 font-black border-2 border-[#1A1A1A] text-slate-950 py-3 px-4 rounded-none text-xs cursor-pointer uppercase tracking-wider shadow-[3px_3px_0px_0px_#1A1A1A]"
                  >
                    Upgrade (RM15.00)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
