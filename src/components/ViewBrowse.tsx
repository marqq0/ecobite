/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { FoodListing } from "../types";
import { Search, SlidersHorizontal, Eye, ShoppingCart, Info, Compass, Award, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import ImageWithFallback from "./ImageWithFallback";

interface ViewBrowseProps {
  listings: FoodListing[];
  onSelectListingForMap: (listing: FoodListing) => void;
  onAddToCart: (listing: FoodListing) => void;
}

export default function ViewBrowse({
  listings,
  onSelectListingForMap,
  onAddToCart,
}: ViewBrowseProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDiet, setSelectedDiet] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("expiry");
  const [selectedItemDetail, setSelectedItemDetail] = useState<FoodListing | null>(null);
  
  // Custom states matching WhatsApp spec
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [maxDistance, setMaxDistance] = useState<number>(10); // in km

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Extract unique stores
  const uniqueStores = Array.from(new Set(listings.map((l) => l.restaurantName))).map((name) => {
    const matchingListing = listings.find((l) => l.restaurantName === name);
    return {
      name,
      id: matchingListing?.restaurantId || "",
      address: matchingListing?.restaurantAddress || "",
      category: matchingListing?.category || "meal",
    };
  });

  // Filter listings based on: Search, Category, Diet, selectedStore, and dynamic dynamic geolocation maxDistance
  const filteredListings = listings.filter((item) => {
    // Only show available items
    if (item.status !== "available") return false;

    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;

    const matchesDiet =
      selectedDiet === "all" ||
      item.dietaryTags.some((tag) => tag.toLowerCase() === selectedDiet.toLowerCase());

    const matchesStore = selectedStore === "all" || item.restaurantName === selectedStore;

    // Standard distance from user's current coordinates at UTHM main campus (1.8540, 103.0864)
    const distance = calculateDistance(1.8540, 103.0864, item.lat, item.lng);
    const matchesDistance = distance <= maxDistance;

    return matchesSearch && matchesCategory && matchesDiet && matchesStore && matchesDistance;
  });

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === "price-low") return a.discountedPrice - b.discountedPrice;
    if (sortBy === "price-high") return b.discountedPrice - a.discountedPrice;
    if (sortBy === "co2") return b.co2Saved - a.co2Saved;
    return a.durationLeft - b.durationLeft; // default by expiry soonest first
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "bakery":
        return "🥐";
      case "meal":
        return "🍲";
      case "grocery":
        return "🥑";
      case "dessert":
        return "🍰";
      default:
        return "📦";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search and Filters Strip */}
      <div className="bg-[#E8E6E1] p-6 border-2 border-[#1A1A1A] space-y-4 shadow-[4px_4px_0px_0px_#1A1A1A]">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]" />
            <input
              type="text"
              placeholder="Rescue sourdough, spicy chicken curry, or find Ahmad's Bakery..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-semibold pl-10 pr-4 py-3.5 border-2 border-[#1A1A1A] bg-white text-[#1A1A1A] outline-none focus:bg-[#FAF9F6] rounded-none placeholder-slate-700/65"
            />
          </div>

          <div className="flex flex-wrap gap-2.5">
            {/* Category selection */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-4 py-3 border-2 border-[#1A1A1A] bg-white font-bold text-[#1A1A1A] outline-none cursor-pointer rounded-none"
            >
              <option value="all">🍽️ All Food Types</option>
              <option value="bakery">🥐 Bakery & Doughs</option>
              <option value="meal">🍲 Hot Cooked Meals</option>
              <option value="grocery">🥑 Fresh Groceries</option>
              <option value="dessert">🍰 Sweets & Desserts</option>
            </select>

            {/* Dietary Tags */}
            <select
              value={selectedDiet}
              onChange={(e) => setSelectedDiet(e.target.value)}
              className="text-xs px-4 py-3 border-2 border-[#1A1A1A] bg-white font-bold text-[#1A1A1A] outline-none cursor-pointer rounded-none"
            >
              <option value="all">🕌 All Dietary</option>
              <option value="halal">🕌 Halal Verified</option>
              <option value="vegan">🌱 Vegan Friendly</option>
              <option value="vegetarian">🥗 Vegetarian</option>
              <option value="gluten-free">🌾 Gluten-Free</option>
            </select>

            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs px-4 py-3 border-2 border-[#1A1A1A] bg-white font-bold text-[#1A1A1A] outline-none cursor-pointer rounded-none"
            >
              <option value="expiry">⌛ Expiry (Soonest First)</option>
              <option value="price-low">💵 Price: Low to High</option>
              <option value="price-high">💵 Price: High to Low</option>
              <option value="co2">🍃 Highest CO₂ Offset</option>
            </select>
          </div>
        </div>

        {/* Dynamic Geolocation filter slider */}
        <div className="border-t border-[#1A1A1A]/10 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider font-mono flex items-center gap-1">
              <span>📍 Filter by Geolocation:</span>
            </span>
            <span className="text-xs bg-[#ea580c] text-white px-2 py-0.5 rounded font-black font-mono">
              Within {maxDistance.toFixed(1)} km
            </span>
          </div>
          <div className="flex-1 w-full max-w-md flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-mono font-bold">0.5km</span>
            <input
              type="range"
              min="0.5"
              max="15"
              step="0.5"
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#ea580c]"
            />
            <span className="text-[10px] text-slate-500 font-mono font-bold">15km</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#1A1A1A] font-bold font-mono uppercase tracking-wider">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#ea580c]" />
          <span>Found {sortedListings.length} environmental excess offerings matching filters</span>
        </div>
      </div>

      {/* WhatsApp Requirement: Select a Store of Choice */}
      <div className="space-y-3 bg-[#FAF9F6] p-5 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-black text-sm text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
            <span>🏪 Select a Store of Choice</span>
          </h3>
          {selectedStore !== "all" && (
            <button
              onClick={() => setSelectedStore("all")}
              className="text-[10px] bg-red-50 hover:bg-red-100 text-[#ea580c] font-black border border-[#1A1A1A] px-2 py-0.5 uppercase tracking-wider"
            >
              Clear filter
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div
            onClick={() => setSelectedStore("all")}
            className={`cursor-pointer p-3 border-2 transition-all text-center flex flex-col justify-center items-center h-20 ${
              selectedStore === "all"
                ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
                : "bg-white border-[#1A1A1A] text-[#1A1A1A] hover:bg-slate-50"
            }`}
          >
            <span className="text-lg">🏪</span>
            <span className="text-[11px] font-black mt-1 block">All Stores</span>
            <span className="text-[9px] opacity-75 font-mono">({listings.filter(l => l.status === "available").length} items)</span>
          </div>

          {uniqueStores.map((store) => {
            const availCount = listings.filter(l => l.restaurantName === store.name && l.status === "available").length;
            return (
              <div
                key={store.name}
                onClick={() => setSelectedStore(store.name)}
                className={`cursor-pointer p-3 border-2 transition-all text-center flex flex-col justify-center items-center h-20 ${
                  selectedStore === store.name
                    ? "bg-[#ea580c] border-[#1A1A1A] text-white"
                    : "bg-white border-[#1A1A1A] text-[#1A1A1A] hover:bg-slate-50"
                }`}
              >
                <span className="text-lg">
                  {store.category === "bakery" ? "🥐" : store.category === "grocery" ? "🥑" : store.category === "dessert" ? "🎂" : "🍲"}
                </span>
                <span className="text-[10px] font-black mt-1 block truncate w-full">
                  {store.name.replace(" (Parit Raja)", "").replace(" Bistro", "")}
                </span>
                <span className="text-[8.5px] opacity-75 font-mono">({availCount} active)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid of Surplus Elements */}
      {sortedListings.length === 0 ? (
        <div className="text-center py-16 bg-white border-2 border-[#1A1A1A] p-8 space-y-4 shadow-[4px_4px_0px_0px_#1A1A1A]">
          <span className="text-4xl">🌾</span>
          <h3 className="font-display font-black text-lg text-[#1A1A1A] uppercase tracking-tight">No surplus food logs in radius!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            No waste is registered in this coordinate slice. Try adjusting your Geolocational radius or selection filters to match other Johor areas!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedListings.map((item) => {
            const itemDistance = calculateDistance(1.8540, 103.0864, item.lat, item.lng);
            return (
              <motion.div
                key={item.id}
                layoutId={item.id}
                className="art-card rounded-none overflow-hidden flex flex-col group h-full relative"
              >
                {/* Image & CO2 Ribbon */}
                <div className="relative h-48 overflow-hidden bg-[#E8E6E1] border-b-2 border-[#1A1A1A] leading-none">
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    category={item.category}
                  />
                  {/* Expiry Tag */}
                  <div className="absolute top-3 left-3 bg-[#1A1A1A] text-white text-[9px] font-bold px-2 py-1 uppercase tracking-wider border border-[#FAF9F6]">
                    <span>⌛ Min: {item.expiryTime}</span>
                  </div>

                  {/* Impact score badge */}
                  <div className="absolute bottom-3 right-3 bg-[#15803d] text-white text-[9px] font-bold px-2 py-1 uppercase tracking-wider border border-[#FAF9F6]">
                    🌱 Saves {item.co2Saved}kg CO₂
                  </div>
                </div>

                {/* Content body */}
                <div className="p-5 flex-1 flex flex-col space-y-3 justify-between">
                  <div>
                    {/* Merchant & category */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#1a1a1a] font-bold bg-[#E8E6E1] border border-[#1A1A1A] px-2 py-0.5 uppercase">
                        {getCategoryIcon(item.category)} {item.category}
                      </span>
                      <span className="text-[10px] text-[#1A1A1A]/80 font-mono font-bold uppercase">{item.durationLeft} mins left</span>
                    </div>

                    {/* Title & Description */}
                    <h4 className="font-display font-black text-base text-[#1A1A1A] leading-snug mt-2 line-clamp-1 group-hover:text-[#ea580c] transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-slate-700 text-xs line-clamp-2 mt-1 leading-relaxed font-semibold">
                      {item.description}
                    </p>
                    
                    <span className="block text-[10.5px] font-mono font-bold text-[#ea580c] mt-2">
                      📍 {item.restaurantName} <span className="text-[9px] text-[#1A1A1A]/60">• {itemDistance.toFixed(1)} km away</span>
                    </span>
                  </div>

                  <div>
                    {/* Dietary tags */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.dietaryTags.map((tag) => (
                        <span key={tag} className="text-[9px] font-mono font-bold uppercase bg-white text-[#1A1A1A] border border-[#1A1A1A] px-1.5 py-0.5">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Price Row */}
                    <div className="flex items-center justify-between border-t-2 border-[#1A1A1A] pt-4 mt-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-black text-[#1A1A1A]">
                            {item.discountedPrice === 0 ? "FREE" : `RM ${item.discountedPrice.toFixed(2)}`}
                          </span>
                          {item.originalPrice > 0 && (
                            <span className="text-xs line-through text-slate-400 font-bold">
                              RM {item.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <span className="text-[9.5px] text-[#15803d] font-bold block mt-0.5 uppercase tracking-wide">
                          💡 Saves {(a => { return a > 0 ? `${(a * 100).toFixed(0)}%` : "100%" })((item.originalPrice - item.discountedPrice) / (item.originalPrice || 1))}
                        </span>
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => onSelectListingForMap(item)}
                          className="p-2 border-2 border-[#1A1A1A] hover:bg-[#E8E6E1] text-[#1A1A1A] transition-all cursor-pointer bg-white"
                          title="View on Rescue Map"
                        >
                          <Compass className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedItemDetail(item)}
                          className="bg-[#ea580c] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-2 border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                        >
                          Reserve
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Highlight Details Modal */}
      {selectedItemDetail && (
        <div className="fixed inset-0 bg-[#1A1A1A]/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#FAF9F6] border-4 border-[#1A1A1A] max-w-lg w-full shadow-[8px_8px_0px_0px_#1A1A1A] rounded-none overflow-hidden space-y-5 flex flex-col"
          >
            {/* Image Header */}
            <div className="relative h-56 bg-[#E8E6E1] border-b-2 border-[#1A1A1A] leading-none">
              <ImageWithFallback
                src={selectedItemDetail.imageUrl}
                alt={selectedItemDetail.title}
                className="w-full h-full object-cover"
                category={selectedItemDetail.category}
              />
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="absolute top-4 right-4 bg-[#1A1A1A] hover:bg-[#ea580c] text-white font-bold p-2 cursor-pointer transition-colors border border-[#1A1A1A]"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4 bg-[#15803d] text-white text-[9px] uppercase tracking-wider font-black px-3 py-1.5 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1a1a1a]">
                🌲 Saves {selectedItemDetail.co2Saved} kg of CO₂ emissions
              </div>
            </div>

            {/* Content info */}
            <div className="px-6 pb-6 space-y-4">
              <div>
                <div className="flex justify-between items-center text-[#1A1A1A] text-xs font-mono font-bold uppercase">
                  <span className="text-[#ea580c]">{selectedItemDetail.category} bag</span>
                  <span>Expires: {selectedItemDetail.expiryTime}</span>
                </div>
                <h3 className="font-display font-black text-2xl text-[#1A1A1A] tracking-tighter uppercase italic mt-1">{selectedItemDetail.title}</h3>
                <span className="text-xs font-bold text-[#15803d] block mt-1">📍 {selectedItemDetail.restaurantName}</span>
                <p className="text-slate-800 font-semibold text-xs mt-3 leading-relaxed">{selectedItemDetail.description}</p>
              </div>

              {/* Security Audit Statement */}
              <div className="bg-[#E8E6E1] p-3.5 border-2 border-[#1A1A1A] text-[11px] text-[#1A1A1A] font-medium leading-relaxed flex gap-2">
                <ShieldCheck className="w-4 h-4 text-[#15803d] shrink-0" />
                <span>
                  <strong>Halal & Hygiene Assured:</strong> Prepared under stringent clean room environments. Transport as soon as possible.
                </span>
              </div>

              {/* Technical location detail */}
              <div className="space-y-1">
                <span className="block text-[10px] font-mono uppercase text-[#1A1A1A] font-black">Pickup Address:</span>
                <span className="block text-xs font-bold text-[#1A1A1A]/80">{selectedItemDetail.restaurantAddress}</span>
              </div>

              {/* Reservation Controls */}
              <div className="border-t-2 border-[#1A1A1A] pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#1A1A1A]/70 uppercase font-mono font-bold block">Contribution/Price:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-black text-[#1A1A1A]">
                      {selectedItemDetail.discountedPrice === 0 ? "FREE" : `RM ${selectedItemDetail.discountedPrice.toFixed(2)}`}
                    </span>
                    {selectedItemDetail.originalPrice > 0 && (
                      <span className="text-xs line-through text-slate-400 font-bold">
                        RM {selectedItemDetail.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onAddToCart(selectedItemDetail);
                      setSelectedItemDetail(null);
                    }}
                    className="art-btn-orange text-xs flex items-center gap-2 cursor-pointer py-3.5 px-5"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Reserve and Set Pickup
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
