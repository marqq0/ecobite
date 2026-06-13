/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { User, FoodListing, Reservation, EcoNotification } from "./types";
import { INITIAL_USERS, INITIAL_LISTINGS } from "./data";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MapContainer from "./components/MapContainer";
import ViewLanding from "./components/ViewLanding";
import ViewAuth from "./components/ViewAuth";
import ViewBrowse from "./components/ViewBrowse";
import ViewAddListing from "./components/ViewAddListing";
import ViewCheckout from "./components/ViewCheckout";
import ViewDashboardRecipient from "./components/ViewDashboardRecipient";
import ViewDashboardRestaurant from "./components/ViewDashboardRestaurant";
import ViewSustainability from "./components/ViewSustainability";
import ViewSettings from "./components/ViewSettings";
import { motion, AnimatePresence } from "motion/react";
import { Leaf, Award, Compass, MessageSquareCode } from "lucide-react";
import { db, auth, handleFirestoreError, OperationType, cleanFirestoreData } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

export default function App() {
  // --- Persistent State Hooks ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const cached = localStorage.getItem("ecobite_user");
    if (cached) return JSON.parse(cached);
    // Default to a preloaded user to provide instantaneous access on boot
    return INITIAL_USERS[0];
  });

  const [listings, setListings] = useState<FoodListing[]>(() => {
    const cached = localStorage.getItem("ecobite_listings");
    if (cached) return JSON.parse(cached);
    return INITIAL_LISTINGS;
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const cached = localStorage.getItem("ecobite_reservations");
    if (cached) return JSON.parse(cached);
    return [];
  });

  const [cart, setCart] = useState<{ listing: FoodListing; quantity: number }[]>(() => {
    const cached = localStorage.getItem("ecobite_cart");
    if (cached) return JSON.parse(cached);
    return [];
  });

  const [activeView, setActiveView] = useState<string>("landing");
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);

  const [notifications, setNotifications] = useState<EcoNotification[]>([
    {
      id: "notif-1",
      title: "🥐 Double Sourdough Discount",
      message: "Ahmad's Bakery marked fresh bagels at 70% off. Rescuing saves 2.1kg CO₂!",
      type: "info",
      timestamp: "5 mins ago",
    },
    {
      id: "notif-2",
      title: "🌿 Free Spiced Rice Sets",
      message: "Nasi Kandar Impian was registered at Parit Raja with zero cost bags!",
      type: "success",
      timestamp: "12 mins ago",
    }
  ]);

  const [accessibilitySettings, setAccessibilitySettings] = useState(() => {
    const cached = localStorage.getItem("ecobite_accessibility");
    if (cached) return JSON.parse(cached);
    return {
      highContrast: false,
      dyslexicFont: false,
      fontSizeMultiplier: 1.0
    };
  });

  const handleClearCache = () => {
    localStorage.removeItem("ecobite_user");
    localStorage.removeItem("ecobite_listings");
    localStorage.removeItem("ecobite_reservations");
    localStorage.removeItem("ecobite_cart");
    localStorage.removeItem("ecobite_accessibility");
    setCurrentUser(INITIAL_USERS[0]);
    setListings(INITIAL_LISTINGS);
    setReservations([]);
    setCart([]);
    setAccessibilitySettings({
      highContrast: false,
      dyslexicFont: false,
      fontSizeMultiplier: 1.0
    });
    setActiveView("landing");
  };

  // Track authenticated Firebase Auth user state
  const [fbUser, setFbUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFbUser(user);
    });
    return unsubscribe;
  }, []);

  // --- Real-Time Firestore Synchronization Hooks ---

  // 1. Dynamic User Document Sync
  useEffect(() => {
    if (!currentUser?.uid || !fbUser || fbUser.uid !== currentUser.uid) return;
    const userDocRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const updatedUser = docSnap.data() as User;
        setCurrentUser(updatedUser);
        localStorage.setItem("ecobite_user", JSON.stringify(updatedUser));
      }
    }, (error) => {
      console.error("Firestore user sync trigger error: ", error);
    });
    return unsubscribe;
  }, [currentUser?.uid, fbUser]);

  // Save current User local storage backup on change
  useEffect(() => {
    localStorage.setItem("ecobite_user", JSON.stringify(currentUser));
  }, [currentUser]);

  // 2. Dynamic Food Listings Live Sync & Seeding Helper
  useEffect(() => {
    // If there is no real authenticated Firebase user, we run in sandbox/design mode.
    // We load listings from localStorage (to preserve client additions/deletions) or fallback to INITIAL_LISTINGS.
    // We avoid running onSnapshot here to prevent permission-rejected Firestore snapshot triggers from overwriting local state.
    if (!fbUser) {
      const cached = localStorage.getItem("ecobite_listings");
      if (cached) {
        setListings(JSON.parse(cached));
      } else {
        setListings(INITIAL_LISTINGS);
      }
      return;
    }

    const listingsColRef = collection(db, "listings");
    const unsubscribe = onSnapshot(listingsColRef, (snapshot) => {
      if (snapshot.empty) {
        console.log("Firestore listings empty. Auto-seeding initial local items...");
        INITIAL_LISTINGS.forEach(async (item) => {
          try {
            await setDoc(doc(db, "listings", item.id), cleanFirestoreData(item));
          } catch (e) {
            console.error("Error seeding food listing inside firebase:", item.id, e);
          }
        });
      } else {
        const liveList: FoodListing[] = [];
        snapshot.forEach((docSnap) => {
          liveList.push(docSnap.data() as FoodListing);
        });

        // Merge in any missing standard default seed listings to guarantee stable preview data
        const liveIds = new Set(liveList.map(l => l.id));
        const missingSeeds = INITIAL_LISTINGS.filter((l) => !liveIds.has(l.id));
        const mergedList = [...liveList, ...missingSeeds];

        setListings(mergedList);
        localStorage.setItem("ecobite_listings", JSON.stringify(mergedList));
      }
    }, (error) => {
      console.error("Firestore listings sync trigger error: ", error);
    });
    return unsubscribe;
  }, [fbUser]);

  // Save listings cache backup
  useEffect(() => {
    localStorage.setItem("ecobite_listings", JSON.stringify(listings));
  }, [listings]);

  // 3. Dynamic Reservations Live Sync
  useEffect(() => {
    // If no user is authenticated or active, reset reservations
    if (!currentUser?.uid) {
      setReservations([]);
      return;
    }

    // If there is an active matching Firebase user, synchronize in real-time
    if (fbUser && fbUser.uid === currentUser.uid) {
      const reservationsColRef = collection(db, "reservations");
      const unsubscribe = onSnapshot(reservationsColRef, (snapshot) => {
        const liveReservations: Reservation[] = [];
        snapshot.forEach((docSnap) => {
          liveReservations.push(docSnap.data() as Reservation);
        });
        // Sort reservations so new ones are on top
        liveReservations.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setReservations(liveReservations);
        localStorage.setItem("ecobite_reservations", JSON.stringify(liveReservations));
      }, (error) => {
        console.error("Firestore reservations sync trigger error: ", error);
      });
      return unsubscribe;
    }

    // Otherwise, we are in a simulated sandbox user session. Retrieve cached listings from localStorage to preserve state.
    const cached = localStorage.getItem("ecobite_reservations");
    if (cached) {
      setReservations(JSON.parse(cached));
    }
  }, [currentUser?.uid, fbUser]);

  // Save reservations cache backup
  useEffect(() => {
    localStorage.setItem("ecobite_reservations", JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem("ecobite_cart", JSON.stringify(cart));
  }, [cart]);

  // Synchronically persist accessibility settings and apply fluid root font magnification
  useEffect(() => {
    localStorage.setItem("ecobite_accessibility", JSON.stringify(accessibilitySettings));
    document.documentElement.style.fontSize = `${accessibilitySettings.fontSizeMultiplier * 100}%`;
  }, [accessibilitySettings]);

  // --- Handlers & Controllers ---
  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    try {
      // Sync on manual login to capture points etc
      await setDoc(doc(db, "users", user.uid), cleanFirestoreData(user), { merge: true });
    } catch (e) {
      console.warn("Offline/Simulated account bypassed Firestore sync writing: ", e);
    }

    if (user.role === "restaurant") {
      setActiveView("restaurant-dashboard");
    } else {
      setActiveView("browse");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCart([]);
    setActiveView("landing");
  };

  const handleSelectListingForMap = (item: FoodListing) => {
    setSelectedListing(item);
    setActiveView("map");
  };

  const handleAddToCart = (listing: FoodListing) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.listing.id === listing.id);
      if (exists) {
        return prev.map((i) =>
          i.listing.id === listing.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { listing, quantity: 1 }];
    });
    // Trigger feedback notification
    addNotification({
      id: "notif-add-" + Math.random(),
      title: "🛒 Slot Reserved in Eco-Basket",
      message: `${listing.title} added. Open checkout to validate secure codes.`,
      type: "success",
      timestamp: "Just Now",
    });
    setActiveView("cart");
  };

  const addNotification = (notif: EcoNotification) => {
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleRemoveFromCart = (listingId: string) => {
    setCart((prev) => prev.filter((i) => i.listing.id !== listingId));
  };

  const handleCheckoutSuccess = async (newReservations: Reservation[]) => {
    // 1. Update local states and localstorage first for flawless immediate feedback
    setReservations((prev) => {
      const updated = [...newReservations, ...prev];
      localStorage.setItem("ecobite_reservations", JSON.stringify(updated));
      return updated;
    });

    // Also update local listings quantities to keep in sync
    setListings((prevListings) => {
      const updatedListings = prevListings.map((l) => {
        const res = newReservations.find((r) => r.listingId === l.id);
        if (res) {
          const freshQty = Math.max(0, l.quantity - res.quantity);
          return {
            ...l,
            quantity: freshQty,
            status: freshQty > 0 ? "available" as const : "claimed" as const,
          };
        }
        return l;
      });
      localStorage.setItem("ecobite_listings", JSON.stringify(updatedListings));
      return updatedListings;
    });

    // 2. Refresh local currentUser rewards (points and saved CO2)
    if (currentUser) {
      const calculatedPoints = newReservations.reduce((acc, curr) => acc + (curr.totalPrice > 0 ? 100 : 50), 0);
      const totalCO2 = newReservations.reduce((acc, curr) => {
        const item = listings.find((l) => l.id === curr.listingId);
        return acc + (item ? item.co2Saved * curr.quantity : 0);
      }, 0);

      setCurrentUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          points: prev.points + calculatedPoints,
          savedCO2: (prev.savedCO2 || 0) + totalCO2,
        };
      });
    }

    // Always transition view first in case Firestore sync is restricted
    setActiveView("recipient-dashboard");

    addNotification({
      id: "notif-success-" + Math.random(),
      title: "🎉 Sourdough Rescued Dynamically!",
      message: `Checked out successfully! Active pickup passes mapped in Recipient Hub.`,
      type: "success",
      timestamp: "Just Now",
    });

    // 3. Attempt Firestore writing, but do not block user if in Sandbox mode without full authentication
    try {
      for (const res of newReservations) {
        await setDoc(doc(db, "reservations", res.id), cleanFirestoreData(res));

        const currentListing = listings.find((l) => l.id === res.listingId);
        if (currentListing) {
          const freshQty = Math.max(0, currentListing.quantity - res.quantity);
          await updateDoc(doc(db, "listings", res.listingId), {
            quantity: freshQty,
            status: freshQty > 0 ? "available" : "claimed"
          });
        }
      }

      if (currentUser) {
        const calculatedPoints = newReservations.reduce((acc, curr) => acc + (curr.totalPrice > 0 ? 100 : 50), 0);
        const totalCO2 = newReservations.reduce((acc, curr) => {
          const item = listings.find((l) => l.id === curr.listingId);
          return acc + (item ? item.co2Saved * curr.quantity : 0);
        }, 0);

        await updateDoc(doc(db, "users", currentUser.uid), {
          points: currentUser.points + calculatedPoints,
          savedCO2: (currentUser.savedCO2 || 0) + totalCO2
        });
      }
    } catch (error) {
      console.warn("Firestore sync deferred or failed (standard for non-auth sandbox accounts). Saved in local state correctly!", error);
    }
  };

  const handleAddNewListing = async (rawItem: Omit<FoodListing, "id" | "restaurantId" | "restaurantName">) => {
    if (!currentUser) return;

    const listingId = "list-" + Math.random().toString(36).substr(2, 9);
    const newItem: FoodListing = {
      ...rawItem,
      id: listingId,
      restaurantId: currentUser.uid,
      restaurantName: currentUser.name,
    };

    // 1. Update local listings & user states immediately for flawless sandbox responsiveness
    setListings((prev) => {
      const updated = [newItem, ...prev];
      localStorage.setItem("ecobite_listings", JSON.stringify(updated));
      return updated;
    });

    setCurrentUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        points: prev.points + 150,
      };
    });

    addNotification({
      id: "notif-new-" + Math.random(),
      title: `📢 New surplus posted by ${currentUser.name}!`,
      message: `${newItem.title} is now claimable near Parit Raja. Expires in ${newItem.durationLeft} mins.`,
      type: "success",
      timestamp: "Just Now",
    });

    // Automatically transition back to dashboard so user sees listings, orders, and stats update in real-time
    setActiveView("restaurant-dashboard");

    try {
      // Write new Zero-Waste surplus listing directly inside Firestore
      await setDoc(doc(db, "listings", listingId), cleanFirestoreData(newItem));

      // Reward points to Restaurant Owner for publishing eco announcement
      await updateDoc(doc(db, "users", currentUser.uid), {
        points: currentUser.points + 150
      });
    } catch (error) {
      console.warn("Firestore listing create deferred (standard for non-auth sandbox accounts): ", error);
    }
  };

  const handleCompleteReservation = async (reservationId: string, listingId: string) => {
    // 1. Update local states immediately
    setReservations((prev) => {
      const updated = prev.map((r) => r.id === reservationId ? { ...r, status: "completed" as const } : r);
      localStorage.setItem("ecobite_reservations", JSON.stringify(updated));
      return updated;
    });

    setListings((prev) => {
      const updated = prev.map((l) => l.id === listingId ? { ...l, status: "completed" as const } : l);
      localStorage.setItem("ecobite_listings", JSON.stringify(updated));
      return updated;
    });

    addNotification({
      id: "notif-done-" + Math.random(),
      title: "🧁 Clean Pick Up Completed!",
      message: "The merchant verified your passcode block. Carbon offsets permanently locked.",
      type: "success",
      timestamp: "Just Now",
    });

    try {
      // Complete status of active claim
      await updateDoc(doc(db, "reservations", reservationId), {
        status: "completed"
      });

      // Close the corresponding listing status
      await updateDoc(doc(db, "listings", listingId), {
        status: "completed"
      });
    } catch (error) {
      console.warn("Firestore completion sync deferred: ", error);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    // 1. Update local states immediately
    setReservations((prev) => {
      const updated = prev.map((r) => r.id === reservationId ? { ...r, status: "cancelled" as const } : r);
      localStorage.setItem("ecobite_reservations", JSON.stringify(updated));
      return updated;
    });

    try {
      await updateDoc(doc(db, "reservations", reservationId), {
        status: "cancelled"
      });
    } catch (error) {
      console.warn("Firestore cancel sync deferred: ", error);
    }
  };

  const handleRemoveListing = async (listingId: string) => {
    // 1. Update local state immediately
    setListings((prev) => {
      const updated = prev.filter((l) => l.id !== listingId);
      localStorage.setItem("ecobite_listings", JSON.stringify(updated));
      return updated;
    });

    try {
      await deleteDoc(doc(db, "listings", listingId));
    } catch (error) {
      console.warn("Firestore listing delete deferred: ", error);
    }
  };

  const handleUpdateUserPremium = async () => {
    if (!currentUser) return;
    
    // 1. Update local state immediately
    setCurrentUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isPremium: true
      };
    });

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        isPremium: true
      });
    } catch (error) {
      console.warn("Firestore premium status update deferred: ", error);
    }
  };


  // --- Dynamic View Router ---
  const renderCoreView = () => {
    switch (activeView) {
      case "landing":
        return (
          <ViewLanding
            onStartRescuing={() => setActiveView("browse")}
            onExploreMap={() => setActiveView("map")}
            onMerchantJoin={() => {
              if (currentUser?.role === "restaurant") {
                setActiveView("restaurant-dashboard");
              } else {
                setActiveView("auth");
              }
            }}
          />
        );
      case "auth":
        return <ViewAuth onLoginSuccess={handleLogin} />;
      case "browse":
        return (
          <ViewBrowse
            listings={listings}
            onSelectListingForMap={handleSelectListingForMap}
            onAddToCart={handleAddToCart}
          />
        );
      case "map":
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-12rem)] min-h-[500px]">
            <div className="lg:col-span-8 h-full">
              <MapContainer
                listings={listings}
                onSelectListing={(item) => setSelectedListing(item)}
                selectedListing={selectedListing}
              />
            </div>
            
            {/* Map sidebar details */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-y-auto space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="font-display font-bold text-sm text-slate-900">Map Nav Instructions</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Select a green pinpoint inside the Batu Pahat/Parit Raja map boundary. This invokes active coordinate databases on client-side vectors.
                </p>

                <div className="pt-4 border-t border-slate-50 space-y-3.5 mt-4">
                  {listings.filter(l => l.status === "available").slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedListing(item)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedListing?.id === item.id
                          ? "bg-green-50 border-green-200 text-green-800"
                          : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                      }`}
                    >
                      <span className="font-bold block">{item.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium">📍 {item.restaurantName}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedListing ? (
                <div className="border-t border-slate-100 pt-4">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Selected coordinates:</span>
                  <span className="text-[11px] font-mono font-medium block mt-0.5 text-slate-700">
                    LAT: {selectedListing.lat.toFixed(4)} | LNG: {selectedListing.lng.toFixed(4)}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">Saves {selectedListing.co2Saved}kg CO₂e when rescued from organic disposal.</p>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 text-center py-4">
                  Select a hotspot to view precise satellite telemetry coordinates.
                </div>
              )}
            </div>
          </div>
        );
      case "add-listing":
        return <ViewAddListing onAddListing={handleAddNewListing} restaurantAddress={currentUser?.role === "restaurant" ? "Jalan Universiti, Taman Universiti, 86450 Parit Raja" : ""} />;
      case "cart":
        return (
          <ViewCheckout
            currentUser={currentUser}
            cart={cart}
            onRemoveFromCart={handleRemoveFromCart}
            onClearCart={() => setCart([])}
            onCheckoutSuccess={handleCheckoutSuccess}
            onSetView={setActiveView}
          />
        );
      case "recipient-dashboard":
        return (
          <ViewDashboardRecipient
            currentUser={currentUser}
            reservations={reservations}
            onCompleteReservation={handleCompleteReservation}
            onCancelReservation={handleCancelReservation}
          />
        );
      case "restaurant-dashboard":
        return (
          <ViewDashboardRestaurant
            currentUser={currentUser}
            listings={listings}
            reservations={reservations}
            onCompleteReservation={handleCompleteReservation}
            onSetView={setActiveView}
            onRemoveListing={handleRemoveListing}
            onUpdateUserPremium={handleUpdateUserPremium}
          />
        );
      case "sustainability":
        return <ViewSustainability listings={listings} />;
      case "settings":
         return (
           <ViewSettings
             currentUser={currentUser}
             accessibilitySettings={accessibilitySettings}
             onUpdateAccessibilitySettings={setAccessibilitySettings}
             onClearCache={handleClearCache}
             onUpdateUserPremium={handleUpdateUserPremium}
           />
         );
      default:
        return <div className="py-24 text-center">Unresolved routing parameter check.</div>;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col selection:bg-green-100 selection:text-green-800 transition-all ${
        accessibilitySettings.highContrast ? "bg-white text-black border-black border-4" : "bg-slate-50 text-[#1A1A1A]"
      } ${
        accessibilitySettings.dyslexicFont ? "font-mono" : "font-sans font-medium"
      }`}
    >
      {/* Dynamic Header */}
      <Header
        currentUser={currentUser}
        activeView={activeView}
        setActiveView={setActiveView}
        notifications={notifications}
        clearNotifications={() => setNotifications([])}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onLogout={handleLogout}
      />

      {/* Main Container Stage */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {renderCoreView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Fine Branding Footer */}
      <Footer setActiveView={setActiveView} />
    </div>
  );
}
