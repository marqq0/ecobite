/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { FoodListing, Reservation, User } from "../types";
import { ShieldAlert, CreditCard, Sparkles, Receipt, Trash2, ArrowRight, CheckCircle2, Landmark, Award, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ViewCheckoutProps {
  currentUser: User | null;
  cart: { listing: FoodListing; quantity: number }[];
  onRemoveFromCart: (listingId: string) => void;
  onClearCart: () => void;
  onCheckoutSuccess: (reservations: Reservation[]) => void;
  onSetView: (view: string) => void;
}

export default function ViewCheckout({
  currentUser,
  cart,
  onRemoveFromCart,
  onClearCart,
  onCheckoutSuccess,
  onSetView,
}: ViewCheckoutProps) {
  // stripe/banking Sandbox states
  const [selectedMethod, setSelectedMethod] = useState<"card" | "fpx" | "points">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [zip, setZip] = useState("86400");
  const [fpxBank, setFpxBank] = useState("Maybank2u");
  
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paySuccess, setPaySuccess] = useState(false);

  // WhatsApp requirement states
  const [showRecapPopup, setShowRecapPopup] = useState(false);
  const [recapReservations, setRecapReservations] = useState<Reservation[] | null>(null);

  // Calculate finance details
  const getSubtotal = () => {
    return cart.reduce((acc, curr) => acc + curr.listing.discountedPrice * curr.quantity, 0);
  };

  const getSdgCarbonSavings = () => {
    return cart.reduce((acc, curr) => acc + curr.listing.co2Saved * curr.quantity, 0).toFixed(1);
  };

  // Eco-Maintenance Fee support
  const localSurcharge = getSubtotal() > 0 ? 1.00 : 0.00;
  const grandTotal = getSubtotal() + localSurcharge;

  const handleCheckoutSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!currentUser) {
      setErrorMessage("Please Sign In first to securely log your regional carbon credits!");
      return;
    }

    // Validation
    if (grandTotal > 0 && selectedMethod === "card") {
      if (!cardNumber || !expiry || !cvc) {
        setErrorMessage("Please complete the required card details.");
        return;
      }
      if (cardNumber.replace(/\s/g, "").length < 16) {
        setErrorMessage("Invalid Sandbox Card: Must be a 16-digit card.");
        return;
      }
    }

    setProcessing(true);

    // Simulate real authorization
    setTimeout(() => {
      setProcessing(false);
      setPaySuccess(true);

      const generatedReservations: Reservation[] = cart.map((item) => ({
        id: "res-" + Math.random().toString(36).substr(2, 9),
        listingId: item.listing.id,
        listingTitle: item.listing.title,
        restaurantName: item.listing.restaurantName,
        recipientId: currentUser.uid,
        recipientName: currentUser.name,
        quantity: item.quantity,
        totalPrice: item.listing.discountedPrice * item.quantity,
        pickupCode: Math.floor(1000 + Math.random() * 9000).toString(), // Secure 4-digit retrieval code
        createdAt: new Date().toLocaleDateString("en-MY", { hour: "2-digit", minute: "2-digit" }),
        status: "reserved",
      }));

      setRecapReservations(generatedReservations);
      
      // Delay open recap popup shortly to let paySuccess state shine
      setTimeout(() => {
        setShowRecapPopup(true);
      }, 500);

    }, 1500);
  };

  const handleRecapCloseAndRedirect = () => {
    if (recapReservations) {
      onCheckoutSuccess(recapReservations);
    }
    onClearCart();
    // Brought back to the homepage
    onSetView("browse");
  };

  const fillSandboxDetails = () => {
    setCardNumber("4242 4242 4242 4242");
    setExpiry("12/29");
    setCvc("888");
    setZip("86400");
  };

  if (cart.length === 0 && !showRecapPopup) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <span className="text-4xl">🛒</span>
        <h3 className="font-display font-black text-lg text-slate-800 uppercase tracking-tight">Your Eco-Basket is Empty</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
          Explore surplus food menus in Parit Raja and reserve bakery bundles or hot rice sets before they expire!
        </p>
        <button
          onClick={() => onSetView("browse")}
          className="bg-green-700 hover:bg-green-800 text-white text-xs font-bold uppercase tracking-wider px-5 py-3 border-2 border-[#1A1A1A] cursor-pointer shadow-[4px_4px_0px_0px_#1A1A1A] transition-all"
        >
          Browse Surplus Food Bags
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Review Basket */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] space-y-4">
            <h3 className="font-display font-black text-sm text-[#1A1A1A] uppercase tracking-wider pb-2 border-b border-[#1A1A1A]/10">
              Review Rescue Offerings
            </h3>
            
            <div className="space-y-4 split-y">
              {cart.map(({ listing, quantity }) => (
                <div key={listing.id} className="flex gap-4 items-center justify-between">
                  <div className="flex gap-3 items-center">
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      className="w-12 h-12 border border-[#1A1A1A] object-cover rounded-none"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">{listing.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">📍 {listing.restaurantName}</p>
                      <span className="text-[9px] bg-green-50 text-green-700 px-2 py-0.5 border border-green-200 font-bold block w-fit mt-1">
                        Saves {listing.co2Saved * quantity} kg CO₂e
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <span className="block text-xs font-black text-slate-900">
                        {listing.discountedPrice === 0 ? "FREE" : `RM ${(listing.discountedPrice * quantity).toFixed(2)}`}
                      </span>
                      <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">Qty: {quantity}</span>
                    </div>
                    
                    <button
                      onClick={() => onRemoveFromCart(listing.id)}
                      className="text-slate-300 hover:text-red-500 p-1.5 border border-transparent hover:border-[#1A1A1A]/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Environmental Slogan Statement */}
          <div className="bg-[#FAF9F6] p-5 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] space-y-2">
            <h4 className="font-display font-black text-xs text-[#1A1A1A] flex items-center gap-1.5 uppercase">
              <Sparkles className="w-4 h-4 text-green-700 fill-green-700/20" />
              Socio-Environmental Impact Slogan
            </h4>
            <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
              Completing this reservation directly prevents fresh food from going to organic landfill waste. Your active rescue translates immediately into saving <strong>{getSdgCarbonSavings()} kg</strong> of carbon emissions! This contribution is logged securely to your personal Eco Hub profile.
            </p>
          </div>
        </div>

        {/* Right Col: Stripe payment interface */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 border-2 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#1A1A1A] space-y-5 sticky top-24">
            <h3 className="font-display font-black text-sm text-[#1A1A1A] flex items-center gap-2 uppercase">
              <Receipt className="w-4.5 h-4.5 text-[#ea580c]" />
              Transaction Summary
            </h3>

            {/* Price breakdown details */}
            <div className="space-y-2 text-xs border-b border-[#1A1A1A]/15 pb-4">
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Rescue Subtotal:</span>
                <span className="font-bold text-slate-800">RM {getSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Eco-Maintenance Fee:</span>
                <span className="font-bold text-slate-800">
                  {localSurcharge === 0 ? "RM 0.00" : `RM ${localSurcharge.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black pt-1.5 border-t border-dashed border-[#1A1A1A]/20 text-[#1A1A1A]">
                <span>Total Contribution:</span>
                <span className="text-[#ea580c]">RM {grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* WhatsApp requirement: Select the Payment Method */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedMethod("card")}
                  className={`py-2 px-1 text-[10px] font-black uppercase text-center border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                    selectedMethod === "card"
                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                      : "bg-white text-slate-700 border-slate-200 hover:border-[#1A1A1A]"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod("fpx")}
                  className={`py-2 px-1 text-[10px] font-black uppercase text-center border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                    selectedMethod === "fpx"
                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                      : "bg-white text-slate-700 border-slate-200 hover:border-[#1A1A1A]"
                  }`}
                >
                  <Landmark className="w-4 h-4" />
                  FPX
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod("points")}
                  className={`py-2 px-1 text-[10px] font-black uppercase text-center border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                    selectedMethod === "points"
                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                      : "bg-white text-slate-700 border-slate-200 hover:border-[#1A1A1A]"
                  }`}
                >
                  <Award className="w-4 h-4" />
                  Eco-Points
                </button>
              </div>
            </div>

            {/* Pay success overlay */}
            <AnimatePresence>
              {paySuccess ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-green-50 p-4 border border-green-200 text-center space-y-2"
                >
                  <span className="text-xl">⚡</span>
                  <p className="text-xs font-bold text-green-800">Sandbox Payment Processing!</p>
                  <p className="text-[10px] text-green-600">Completing transaction securely. Please wait...</p>
                </motion.div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 bg-red-50 text-red-600 font-medium text-[11px] border border-red-200 leading-snug">
                      {errorMessage}
                    </div>
                  )}

                  {grandTotal > 0 ? (
                    <div>
                      {selectedMethod === "card" && (
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-center bg-indigo-50/75 p-2 border border-indigo-150">
                            <span className="text-[9px] font-mono font-bold text-indigo-700 flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />
                              MOCK STRIPE PAY
                            </span>
                            <button
                              type="button"
                              onClick={fillSandboxDetails}
                              className="text-[9px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-sm hover:bg-indigo-700 cursor-pointer"
                            >
                              Auto-Fill
                            </button>
                          </div>

                          <div className="space-y-1">
                            <label htmlFor="card-number" className="block text-[9.5px] font-bold text-slate-500 uppercase">Card Number</label>
                            <input
                              id="card-number"
                              type="text"
                              required
                              placeholder="4242 4242 4242 4242"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="w-full text-xs px-3 py-2 border-2 border-[#1A1A1A] outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label htmlFor="card-exp" className="block text-[9.5px] font-bold text-slate-500 uppercase">Expiry (MM/YY)</label>
                              <input
                                id="card-exp"
                                type="text"
                                required
                                placeholder="12/29"
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                                className="w-full text-xs px-3 py-2 border-2 border-[#1A1A1A] outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label htmlFor="card-cvc" className="block text-[9.5px] font-bold text-slate-500 uppercase">CVC</label>
                              <input
                                id="card-cvc"
                                type="text"
                                required
                                placeholder="888"
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value)}
                                className="w-full text-xs px-3 py-2 border-2 border-[#1A1A1A] outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedMethod === "fpx" && (
                        <div className="space-y-2.5">
                          <div className="space-y-1">
                            <label htmlFor="fpx-bank" className="block text-[9.5px] font-bold text-slate-500 uppercase">Select Malaysia Bank</label>
                            <select
                              id="fpx-bank"
                              value={fpxBank}
                              onChange={(e) => setFpxBank(e.target.value)}
                              className="w-full text-xs px-3 py-2 border-2 border-[#1A1A1A] outline-none bg-white font-bold"
                            >
                              <option value="Maybank2u">Maybank2u (MBB)</option>
                              <option value="CIMB Clicks">CIMB Clicks</option>
                              <option value="Public Bank">Public Bank (PBB)</option>
                              <option value="RHB Now">RHB Now</option>
                              <option value="Bank Islam">Bank Islam</option>
                              <option value="AmOnline">AmOnline</option>
                            </select>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium">You will be securely redirected to the selected Sandbox banking portal on click.</p>
                        </div>
                      )}

                      {selectedMethod === "points" && (
                        <div className="p-3 bg-green-50 border border-green-200 text-center space-y-1">
                          <p className="text-xs font-black text-green-800">Available: {currentUser?.points || 0} Eco-Points</p>
                          <p className="text-[10px] text-green-700 font-semibold">
                            Redeeming 100 Eco-Points automatically clears the platform surcharges!
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3.5 border-2 border-dashed border-green-300 bg-green-50/50 text-center">
                      <span className="block text-xl mb-1">🎁</span>
                      <span className="block text-xs font-black text-green-700">Completely FREE Food Rescue Bag</span>
                      <p className="text-[10px] text-[#1A1A1A]/80 mt-1">No payment details required. Confirming your checkout preserves this bag safely.</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-[#ea580c] hover:bg-[#1A1A1A] text-white font-black py-3.5 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs uppercase tracking-wider"
                  >
                    {processing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Confirms Payment (Mock)
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* WhatsApp Requirement: Order Confirmed Popup appears with Detail Recap */}
      <AnimatePresence>
        {showRecapPopup && recapReservations && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-4 border-[#1A1A1A] max-w-lg w-full p-6 shadow-[8px_8px_0px_0px_#1a1a1a] space-y-5 overflow-y-auto max-h-[90vh]"
            >
              <div className="text-center space-y-2 pb-4 border-b-2 border-[#1A1A1A]">
                <div className="w-14 h-14 bg-green-100 border-2 border-green-600 rounded-full flex items-center justify-center mx-auto text-green-600">
                  <ShieldCheck className="w-8 h-8 fill-green-100" />
                </div>
                <h3 className="font-display font-black text-xl text-[#1A1A1A] uppercase tracking-wider block">
                  ORDER CONFIRMED!
                </h3>
                <p className="text-xs text-green-700 font-bold font-mono uppercase bg-green-50 py-1 px-3 width-fit mx-auto border border-green-200">
                  Secure Pickup Token Assigned
                </p>
              </div>

              {/* Detail Recap */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider font-mono">
                  Items Recap:
                </h4>
                <div className="space-y-2 bg-[#FAF9F6] p-3.5 border-2 border-[#1A1A1A]">
                  {recapReservations.map((res) => {
                    const matchedItem = cart.find(i => i.listing.id === res.listingId);
                    return (
                      <div key={res.id} className="flex justify-between items-start text-xs border-b border-dashed border-[#1A1A1A]/10 pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="font-black text-[#1A1A1A]">{res.listingTitle}</p>
                          <p className="text-[10px] text-slate-500 font-bold">📍 Store: {res.restaurantName}</p>
                          <p className="text-[10px] text-slate-500 font-mono font-bold mt-1">
                            Pickup Retrieval Code: <span className="bg-[#1A1A1A] text-[#FAF9F6] px-1.5 py-0.5 font-bold tracking-widest font-mono text-xs">{res.pickupCode}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#1A1A1A]">Qty: {res.quantity}</p>
                          <p className="font-black text-[#ea580c]">{res.totalPrice === 0 ? "FREE" : `RM ${res.totalPrice.toFixed(2)}`}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-[#1A1A1A] font-semibold text-[#1A1A1A]">
                    <span className="block text-[9.5px] text-slate-500 uppercase tracking-wider font-mono">Payment Mode:</span>
                    <span className="font-black text-[11px] uppercase">{selectedMethod === "card" ? "Credit Card (Stripe)" : selectedMethod === "fpx" ? "FPX Online Banking" : "Eco-Points Balance"}</span>
                  </div>
                  <div className="p-3 bg-green-50 border border-[#1a1a1a] font-semibold text-green-900">
                    <span className="block text-[9.5px] text-green-700 uppercase tracking-wider font-mono">Carbon Savings:</span>
                    <span className="font-black text-[11px]">🍃 {getSdgCarbonSavings()} kg CO₂Saved</span>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 border-2 border-amber-200 text-[10.5px] text-amber-800 font-semibold leading-relaxed">
                  📢 <strong>Important Instructions:</strong> Please present your secure 4-digit codes above to the merchant checkout counter inside Parit Raja to retrieve your items instantly.
                </div>
              </div>

              <div className="pt-2 border-t-2 border-[#1A1A1A]">
                <button
                  onClick={handleRecapCloseAndRedirect}
                  className="w-full bg-[#1A1A1A] hover:bg-[#ea580c] text-[#FAF9F6] font-black py-3 border-2 border-[#1A1A1A] uppercase text-xs tracking-wider cursor-pointer transition-colors text-center"
                >
                  Return to Storefront Home
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
