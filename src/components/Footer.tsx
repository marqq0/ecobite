import { Leaf, Flame, Shield, Globe, Mail, MapPin } from "lucide-react";

interface FooterProps {
  setActiveView: (view: string) => void;
}

export default function Footer({ setActiveView }: FooterProps) {
  return (
    <footer className="bg-[#1A1A1A] text-white/80 mt-auto border-t-4 border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 bg-[#15803d] rounded-full flex items-center justify-center">
                <Leaf className="w-4 h-4 fill-white/10" />
              </div>
              <span className="font-display font-black text-xl tracking-tighter uppercase italic text-white flex items-center gap-2">EcoBite</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              Empowering regional food ecosystems by connecting local bistros, cafes, and bakeries directly with hungry, sustainability-focused neighbors. Saving surplus food has never been simpler.
            </p>
          </div>

          {/* Nav Links */}
          <div>
            <h4 className="font-display font-black text-xs uppercase tracking-widest text-[#ea580c] mb-4">Core Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveView("browse")} className="hover:text-white transition-colors cursor-pointer text-left font-semibold">
                  Browse Food Bags
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView("map")} className="hover:text-white transition-colors cursor-pointer text-left font-semibold">
                  Active Coordinates Map
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView("sustainability")} className="hover:text-white transition-colors cursor-pointer text-left font-semibold">
                  Eco Impact Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView("auth")} className="hover:text-white transition-colors cursor-pointer text-left font-semibold">
                  Merchant Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Active Coverage Regions */}
          <div>
            <h4 className="font-display font-black text-xs uppercase tracking-widest text-[#ea580c] mb-4">Coverage Hubs</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>Parit Raja Center</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>Batu Pahat Town</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span className="opacity-75">Muar Hub (Coming Soon)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span className="opacity-75">Johor Bahru Hub (Coming Soon)</span>
              </li>
            </ul>
          </div>

          {/* Corporate / Support Contact */}
          <div>
            <h4 className="font-display font-black text-xs uppercase tracking-widest text-[#ea580c] mb-4">EcoBite Malaysia</h4>
            <p className="text-xs leading-relaxed font-semibold">
              EcoBite Operations Desk,<br />
              Jalan Universiti, Taman Universiti,<br />
              86400 Parit Raja, Batu Pahat, Johor.
            </p>
            <div className="flex items-center gap-1.5 text-xs mt-3 font-semibold hover:text-white transition-colors">
              <Mail className="w-3.5 h-3.5 text-[#ea580c]" />
              <span>rescue@ecobite.com.my</span>
            </div>
          </div>

        </div>

        <div className="pt-8 mt-8 border-t border-white/10 text-center text-[10px] uppercase font-bold tracking-wider text-white/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} EcoBite Malaysia. All rights reserved.</p>
          <div className="flex gap-4 font-bold">
            <span className="hover:text-white transition-colors cursor-pointer">Security SSL Secure</span>
            <span>&bull;</span>
            <span className="hover:text-white transition-colors cursor-pointer">Halal Policy Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
