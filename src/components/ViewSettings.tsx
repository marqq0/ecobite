import { useState } from "react";
import { Settings, Shield, Award, Trash2, Printer, Check, Info, ZoomIn, Eye, Sparkles } from "lucide-react";
import { User, FoodListing } from "../types";
import ViewSafetyGuide from "./ViewSafetyGuide";

interface ViewSettingsProps {
  currentUser: User | null;
  onUpdateAccessibilitySettings: (settings: { highContrast: boolean; dyslexicFont: boolean; fontSizeMultiplier: number }) => void;
  accessibilitySettings: { highContrast: boolean; dyslexicFont: boolean; fontSizeMultiplier: number };
  onClearCache: () => void;
  onUpdateUserPremium: () => void;
}

export default function ViewSettings({
  currentUser,
  onUpdateAccessibilitySettings,
  accessibilitySettings,
  onClearCache,
  onUpdateUserPremium,
}: ViewSettingsProps) {
  const [successFeedback, setSuccessFeedback] = useState("");
  const [showCertificateView, setShowCertificateView] = useState(false);
  const [activeTab, setActiveTab] = useState<"accessibility" | "compliance">("accessibility");

  const toggleHighContrast = () => {
    const updated = { ...accessibilitySettings, highContrast: !accessibilitySettings.highContrast };
    onUpdateAccessibilitySettings(updated);
    triggerFeedback("High contrast stylesheet limits applied.");
  };

  const toggleDyslexicFont = () => {
    const updated = { ...accessibilitySettings, dyslexicFont: !accessibilitySettings.dyslexicFont };
    onUpdateAccessibilitySettings(updated);
    triggerFeedback("Dyslexia-friendly font face applied.");
  };

  const adjustFontSize = (factor: number) => {
    const updated = { ...accessibilitySettings, fontSizeMultiplier: factor };
    onUpdateAccessibilitySettings(updated);
    triggerFeedback(`Text fluid scaling size updated.`);
  };

  const triggerFeedback = (msg: string) => {
    setSuccessFeedback(msg);
    setTimeout(() => setSuccessFeedback(""), 2500);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 print:py-0 print:px-0 bg-transparent">
      
      {/* Settings Tab controls */}
      <div className="flex border-b-2 border-[#1A1A1A] pb-0 mb-6 gap-2 print:hidden overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("accessibility")}
          className={`px-4 py-2.5 font-display font-black text-xs uppercase border-2 border-[#1A1A1A] border-b-0 tracking-wider transition-all cursor-pointer shrink-0 ${
            activeTab === "accessibility"
              ? "bg-[#1A1A1A] text-[#FAF9F6] translate-y-[2px]"
              : "bg-[#FAF9F6] text-slate-700 hover:bg-slate-100"
          }`}
        >
          ⚙️ App Settings & WCAG
        </button>
        <button
          onClick={() => setActiveTab("compliance")}
          className={`px-4 py-2.5 font-display font-black text-xs uppercase border-2 border-[#1A1A1A] border-b-0 tracking-wider transition-all cursor-pointer shrink-0 ${
            activeTab === "compliance"
              ? "bg-[#1A1A1A] text-[#FAF9F6] translate-y-[2px]"
              : "bg-[#FAF9F6] text-slate-700 hover:bg-slate-100"
          }`}
        >
          🌙 Halal & Safety compliance
        </button>
      </div>

      {activeTab === "accessibility" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start print:hidden">
          
          {/* Left Column: List of configs */}
          <div className="md:col-span-7 space-y-6">
            <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-[3px_3px_0px_0px_#1A1A1A] rounded-none space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-[#1A1A1A] pb-3">
                <Settings className="w-5 h-5 text-[#ea580c]" />
                <h3 className="font-display font-black text-base text-[#1A1A1A] uppercase italic">
                  WCAG 2.1 Accessibility Dashboard
                </h3>
              </div>
              
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                Tailor your visual viewing layout. Toggle accessibility filters designed for diverse reading preferences, complying with international accessibility regulations:
              </p>

              <div className="space-y-4 pt-2">
                {/* High Contrast Toggles */}
                <div className="flex items-center justify-between p-3 bg-[#FAF9F6] border border-[#1A1A1A]">
                  <div>
                    <span className="block text-xs font-black text-[#1A1A1A] uppercase font-mono">
                      High Contrast Layout borders
                    </span>
                    <span className="block text-[10px] text-zinc-500 font-semibold">
                      Forces pure high-contrast palette elements.
                    </span>
                  </div>
                  <button
                    onClick={toggleHighContrast}
                    className={`px-3 py-1 text-[10px] font-bold border border-[#1A1A1A] uppercase cursor-pointer ${
                      accessibilitySettings.highContrast
                        ? "bg-emerald-700 text-white"
                        : "bg-[#E8E6E1]"
                    }`}
                  >
                    {accessibilitySettings.highContrast ? "On" : "Off"}
                  </button>
                </div>

                {/* Dyslexic Friendly Typography Toggles */}
                <div className="flex items-center justify-between p-3 bg-[#FAF9F6] border border-[#1A1A1A]">
                  <div>
                    <span className="block text-xs font-black text-[#1A1A1A] uppercase font-mono">
                      Dyslexic-Friendly text scaling
                    </span>
                    <span className="block text-[10px] text-zinc-500 font-semibold">
                      Activates spacious sans-serif variations.
                    </span>
                  </div>
                  <button
                    onClick={toggleDyslexicFont}
                    className={`px-3 py-1 text-[10px] font-bold border border-[#1A1A1A] uppercase cursor-pointer ${
                      accessibilitySettings.dyslexicFont
                        ? "bg-emerald-700 text-white"
                        : "bg-[#E8E6E1]"
                    }`}
                  >
                    {accessibilitySettings.dyslexicFont ? "On" : "Off"}
                  </button>
                </div>

                {/* Text Sizing sliders */}
                <div className="p-3 bg-[#FAF9F6] border border-[#1A1A1A] space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block text-xs font-black text-[#1A1A1A] uppercase font-mono">
                        Fluid Font Magnification
                      </span>
                      <span className="block text-[10px] text-zinc-500 font-semibold">
                        Scales core texts layout for screen readers.
                      </span>
                    </div>
                    <span className="text-xs font-bold bg-[#E8E6E1] px-2 py-0.5 border border-[#1A1A1A]">
                      {Math.round(accessibilitySettings.fontSizeMultiplier * 100)}%
                    </span>
                  </div>
                  
                  <div className="flex gap-2 pt-1">
                    {[1.0, 1.15, 1.3].map((factor) => (
                      <button
                        key={factor}
                        onClick={() => adjustFontSize(factor)}
                        className={`flex-1 py-1 text-[10px] font-bold border border-[#1A1A1A] uppercase cursor-pointer ${
                          accessibilitySettings.fontSizeMultiplier === factor
                            ? "bg-emerald-700 text-white"
                            : "bg-white text-[#1A1A1A]"
                        }`}
                      >
                        {factor === 1.0 ? "Normal" : factor === 1.15 ? "Large" : "Extra"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {successFeedback && (
                <div className="text-[10px] font-mono font-black uppercase text-emerald-700 text-center bg-[#dcfce7] py-1 border border-emerald-400">
                  ⭐ {successFeedback}
                </div>
              )}
            </div>

            {/* Database Reset Console */}
            <div className="bg-[#FAF9F6] border-2 border-[#1A1A1A] p-6 shadow-[3px_3px_0px_0px_#1A1A1A] rounded-none space-y-3">
              <h4 className="font-display font-black text-xs uppercase tracking-wide text-slate-800 block">
                Reset Application Data
              </h4>
              <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                Reset cached local sessions and restore initial food listings in Parit Raja and Batu Pahat to audit active database operations:
              </p>
              <button
                onClick={() => {
                  if (confirm("Reset current sessions? Your points and mock cart will revert to defaults.")) {
                    onClearCache();
                    triggerFeedback("Platform configurations reset.");
                  }
                }}
                className="px-3.5 py-1.5 bg-rose-600 text-white border-2 border-[#1A1A1A] text-[10px] font-bold uppercase shadow-[2px_2px_0px_0px_#1A1A1A] cursor-pointer hover:bg-rose-700 hover:shadow-[3px_3px_0px_0px_#1A1A1A] transition-all"
              >
                Reset Cached Sessions
              </button>
            </div>
          </div>

          {/* Right Column: Achievements & Profile overview */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-[#E8E6E1] border-2 border-[#1A1A1A] p-6 shadow-[3px_3px_0px_0px_#1A1A1A] rounded-none flex flex-col justify-between h-full">
              <div className="space-y-4">
                <span className="text-3xl block">🏆</span>
                <div>
                  <h4 className="font-display font-black text-base italic uppercase text-[#1A1A1A]">
                    Environmental Credits Certificate
                  </h4>
                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed font-semibold">
                    You have logged a greenhouse mitigation score of <strong className="text-[#1A1A1A]">{currentUser?.savedCO2 || "4.5"} kg</strong> of CO₂ rot gases. View and download your personalized certificates of contribution.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCertificateView(true)}
                className="mt-6 w-full py-2 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white border-2 border-[#1A1A1A] text-xs font-black uppercase shadow-[2px_2px_0px_0px_#1A1A1A] cursor-pointer hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all text-center flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" /> Open Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "compliance" && (
        <div className="bg-white border-2 border-[#1A1A1A] p-2 shadow-[4px_4px_0px_0px_#1A1A1A] rounded-none">
          <ViewSafetyGuide />
        </div>
      )}

      {/* Floating printable certificate viewport overlay */}
      {showCertificateView && (
        <section className="bg-white border-4 border-[#1A1A1A] p-8 max-w-2xl mx-auto shadow-[8px_8px_0px_0px_#1A1A1A] relative space-y-8 rounded-none">
          
          <button
            onClick={() => setShowCertificateView(false)}
            className="absolute top-4 right-4 text-xs font-black uppercase text-rose-600 hover:underline cursor-pointer print:hidden"
          >
            [Close Certificate]
          </button>

          {/* Certificate Content Frame */}
          <div className="border-4 border-dashed border-[#1A1A1A] p-6 text-center space-y-6 relative overflow-hidden bg-emerald-50/20">
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#ea580c]" />
            
            <div className="space-y-2">
              <div className="w-12 h-12 bg-[#15803d] text-white border-2 border-[#1A1A1A] rounded-full flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_#1A1A1A]">
                🌱
              </div>
              <span className="block text-[10px] uppercase font-mono font-black text-[#ea580c] tracking-widest">
                ECOBITE MALAYSIA ZERO WASTE GROUP
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-emerald-800 tracking-tight uppercase leading-none italic">
                Certificate of Environmental Honor
              </h2>
            </div>

            <div className="space-y-2.5 max-w-lg mx-auto">
              <p className="text-[10px] uppercase font-mono font-bold text-slate-500">
                This honor certificate is proudly awarded to
              </p>
              <h3 className="font-display font-black text-2xl text-[#1A1A1A] border-b-2 border-[#1A1A1A]/20 pb-1 italic">
                {currentUser?.name || "ECO RESCUER"}
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                For outstanding community support in saving edible surplus foods and actively preventing rotting organic waste inside Parit Raja & Batu Pahat landfills, achieving a total emissions offset of:
              </p>
            </div>

            {/* Giant KPI */}
            <div className="bg-[#1A1A1A] text-white py-3.5 px-6 max-w-xs mx-auto border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_#ea580c]">
              <span className="block font-sans font-black text-3xl tracking-tight">
                {currentUser?.savedCO2 || "4.5"} <span className="text-sm font-light">KG CO₂e</span>
              </span>
              <span className="block text-[8px] uppercase tracking-wider font-mono font-bold text-slate-400">
                Verified Greenhouse Gas Reductions
              </span>
            </div>

            {/* Bottom credential detail footer */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1A1A1A]/10 text-[9px] font-mono font-bold text-slate-500 uppercase">
              <div className="text-left">
                <span>DATE EXPORTED:</span>
                <span className="block text-[#1A1A1A]">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="text-right">
                <span>SERIAL CODES:</span>
                <span className="block text-[#1A1A1A]">EB-2026-{currentUser?.uid ? currentUser.uid.slice(0,6).toUpperCase() : "BP99"}</span>
              </div>
            </div>
          </div>

          {/* Action trigger */}
          <div className="flex justify-between items-center border-t-2 border-[#1A1A1A] pt-4 print:hidden gap-4">
            <span className="text-[10px] text-slate-500 font-semibold max-w-sm">
              Pressing Print will launch your browser's PDF viewport print queue containing only the framed border achievement document.
            </span>
            <button
              onClick={handlePrintCertificate}
              className="px-5 py-2.5 bg-[#1A1A1A] text-white border-2 border-[#1A1A1A] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:bg-emerald-800 transition-all shadow-[2px_2px_0px_0px_#1A1A1A]"
            >
              <Printer className="w-4 h-4" /> Print Certificate
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
