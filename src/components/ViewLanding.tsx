/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, Sparkles, Navigation, Layers, ShoppingBag, Globe, ArrowRight, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import ImageWithFallback from "./ImageWithFallback";

const heroImage = "/src/assets/images/hero_banner_food_rescue_1781278815041.jpg";

interface ViewLandingProps {
  onStartRescuing: () => void;
  onExploreMap: () => void;
  onMerchantJoin: () => void;
}

export default function ViewLanding({
  onStartRescuing,
  onExploreMap,
  onMerchantJoin,
}: ViewLandingProps) {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Hero Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#E8E6E1] border-2 border-[#1A1A1A] text-xs font-bold font-mono tracking-wider uppercase text-[#1A1A1A]">
              <Sparkles className="w-4 h-4 text-[#ea580c]" />
              Malaysia's Smart Food Rescue Network
            </div>
            
            <h1 className="art-title-xl text-[68px] sm:text-[85px] leading-[0.85] font-black tracking-tight italic uppercase text-[#1A1A1A]">
              RESCUE<br/>THE<br/>
              <span className="text-[#ea580c] relative inline-block">
                BITE.
              </span>
            </h1>

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-lg font-medium">
              When local restaurants and bakers have excess delicious unsold food, they register a live announcement on EcoBite. You receive local alerts, claim your bag, and pick it up. Let's collectively cut greenhouse emissions!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={onStartRescuing}
                className="art-btn-orange font-bold text-xs flex items-center justify-center gap-2 cursor-pointer py-4 px-8"
              >
                Assemble Rescue Bag
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onExploreMap}
                className="art-btn-outline font-bold text-xs flex items-center justify-center gap-2 cursor-pointer py-4 px-8"
              >
                <Navigation className="w-4 h-4 text-[#15803d]" />
                Inspect Active Hotspots
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t-2 border-[#1A1A1A]">
              <div>
                <span className="block font-display font-black text-3xl text-[#1A1A1A]">4,120 kg</span>
                <span className="block text-[10px] uppercase font-mono font-bold tracking-[0.15em] text-[#1A1A1A]/60 mt-1">CO₂ Saved</span>
              </div>
              <div>
                <span className="block font-display font-black text-3xl text-[#15803d]">8,540</span>
                <span className="block text-[10px] uppercase font-mono font-bold tracking-[0.15em] text-[#1A1A1A]/60 mt-1">Meals Rescued</span>
              </div>
              <div>
                <span className="block font-display font-black text-3xl text-[#1A1A1A]">RM 45k+</span>
                <span className="block text-[10px] uppercase font-mono font-bold tracking-[0.15em] text-[#1A1A1A]/60 mt-1">Baguette Saver</span>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative lg:pl-6"
          >
            <div className="absolute top-4 left-4 right-0 bottom-0 bg-[#E8E6E1] border-2 border-[#1A1A1A] -z-10 rounded-none"></div>
            <div className="border-2 border-[#1A1A1A] w-full overflow-hidden aspect-[4/3] relative z-10 rounded-none bg-white shadow-none leading-none">
              <ImageWithFallback
                src={heroImage}
                alt="Sustainable Food Rescue"
                className="w-full h-full object-cover relative z-10"
                category="grocery"
              />
            </div>
            {/* Live Badge Representation */}
            <div className="absolute -bottom-6 -left-4 bg-white p-4 border-2 border-[#1A1A1A] z-20 flex items-center gap-3 animate-bounce shadow-[3px_3px_0px_0px_#1A1A1A]">
              <span className="text-2xl">🌱</span>
              <div>
                <span className="block text-[9px] font-mono font-black text-[#ea580c] uppercase tracking-[0.15em]">Latest Save</span>
                <span className="font-bold text-xs text-[#1A1A1A]">Ahmad's Sourdough Pack (RM5.00)</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Real-time Flow / Explanation Area */}
      <section className="bg-[#E8E6E1] text-[#1A1A1A] py-16 border-2 border-[#1A1A1A] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden shadow-[4px_4px_0px_0px_#1A1A1A]">
        <div className="relative text-center max-w-3xl mx-auto space-y-4">
          <h2 className="font-display font-black text-3xl text-[#1A1A1A] tracking-tighter uppercase italic">
            How EcoBite Works
          </h2>
          <p className="text-slate-700 text-xs sm:text-sm max-w-xl mx-auto font-medium">
            A fast, beautiful, decentralized network minimizing Johor’s culinary waste and encouraging community connection.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 text-left">
            <div className="bg-white p-6 border-2 border-[#1A1A1A] space-y-3 shadow-[2px_2px_0px_0px_#1A1A1A]">
              <span className="text-3xl">👨‍🍳</span>
              <h3 className="font-bold text-base text-[#1A1A1A]">1. Merchant Offers Extra</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Restaurants, cafes, or bakeries in Batu Pahat detect unsold daily inventory. They publish a listing with quick tags, original prices, and eco-impact estimations.
              </p>
            </div>

            <div className="bg-white p-6 border-2 border-[#1A1A1A] space-y-3 shadow-[2px_2px_0px_0px_#1A1A1A]">
              <span className="text-3xl">📱</span>
              <h3 className="font-bold text-base text-[#1A1A1A]">2. Community Claims Bag</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Local residents browse nearby listings on the map or live catalog, reserve an item, and complete the checkout safely at massive discounts or even for FREE.
              </p>
            </div>

            <div className="bg-white p-6 border-2 border-[#1A1A1A] space-y-3 shadow-[2px_2px_0px_0px_#1A1A1A]">
              <span className="text-3xl">🚲</span>
              <h3 className="font-bold text-base text-[#1A1A1A]">3. Eco-Friendly Pickup</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                The recipient goes to the storefront within the specified pickup time, presents their secure 4-digit code, rescues the food, and gains Eco-Points towards tree-planting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainable Goals / SDG9 Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="inline-block bg-[#E8E6E1] border-2 border-[#1A1A1A] px-2.5 py-1 text-[10px] font-mono font-bold text-[#1A1A1A] uppercase tracking-widest">
              Zero Waste Community Initiative
            </span>
            <h2 className="font-display font-black text-3xl text-[#1A1A1A] tracking-tight leading-tight uppercase italic">
              Empowering Regional Businesses & Greener Supply Chains
            </h2>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
              Standard food supply chains throw away up to 30% of high-grade edible food everyday. EcoBite uses dynamic local matches and real-time alerts to save surplus inventory. It decreases solid organic waste in regional landfills while providing tasty food to neighboring families at unmatched prices.
            </p>
            <div className="space-y-2.5 pt-2 font-semibold text-xs text-[#1A1A1A]">
              <div className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 bg-[#15803d] text-white border border-[#1A1A1A] text-[9px]">✓</span>
                <span>Calculate carbon offset offsets live on checkout.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 bg-[#15803d] text-white border border-[#1A1A1A] text-[9px]">✓</span>
                <span>Zero-waste circular flow maps for local bakery hubs.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 bg-[#15803d] text-white border border-[#1A1A1A] text-[9px]">✓</span>
                <span>Eco-Points reward gamics built for tree-planting actions.</span>
              </div>
            </div>
          </div>

          {/* SDG Impact Illustration (Bento Grid Style) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 border-2 border-[#1A1A1A] flex flex-col justify-between shadow-[3px_3px_0px_0px_#1A1A1A]">
              <div className="w-10 h-10 bg-[#15803d] text-white border-2 border-[#1A1A1A] flex items-center justify-center mb-4 font-bold text-lg">9</div>
              <div>
                <h4 className="font-bold text-[#1A1A1A] text-sm uppercase tracking-wide">Supply Chain Innovation</h4>
                <p className="text-xs text-slate-600 mt-1 font-medium">Transforming food surplus logistics from a wasteful "discard" cycle into a fast, highly collaborative digital matching system for retailers.</p>
              </div>
            </div>

            <div className="bg-white p-6 border-2 border-[#1A1A1A] flex flex-col justify-between shadow-[3px_3px_0px_0px_#1A1A1A]">
              <div className="w-10 h-10 bg-[#ea580c] text-white border-2 border-[#1A1A1A] flex items-center justify-center mb-4 font-bold text-lg"><Globe className="w-5 h-5" /></div>
              <div>
                <h4 className="font-bold text-[#1A1A1A] text-sm uppercase tracking-wide">Climate Mitigation</h4>
                <p className="text-xs text-slate-600 mt-1 font-medium">Every delicious snack box claimed is direct savings. It keeps rotting organic matters out of landfills, avoiding thousands of kg of CO₂.</p>
              </div>
            </div>

            <div className="bg-[#FAF9F6] p-5 sm:col-span-2 border-2 border-[#1A1A1A] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_#1A1A1A]">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👩‍🍳</span>
                <div>
                  <h4 className="font-black text-[#1A1A1A] text-xs uppercase tracking-wide italic">Are you a Restaurant / Bakery Owner?</h4>
                  <p className="text-[11px] text-slate-600 font-medium">Sign up in 2 minutes, get premium insights, and make announcements instantly.</p>
                </div>
              </div>
              <button
                onClick={onMerchantJoin}
                className="art-btn-black shrink-0"
              >
                Join as Merchant
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
