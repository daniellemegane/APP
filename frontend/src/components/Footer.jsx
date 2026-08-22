import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";

const Footer = () => (
  <footer className="mt-24 bg-[#2B3A2C] text-[#FDFBF7] grain">
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24 grid grid-cols-1 md:grid-cols-12 gap-10">
      <div className="md:col-span-5">
        <div className="font-display font-black text-5xl lg:text-7xl leading-none tracking-tight">
          Elles.<span className="text-secondary">Market</span>
        </div>
        <p className="mt-6 font-serif italic text-xl text-[#FDFBF7]/70 max-w-md">
          La marketplace nationale dédiée aux femmes entrepreneures du Cameroun.
        </p>
      </div>
      <div className="md:col-span-3 space-y-3">
        <div className="text-xs uppercase tracking-[0.2em] text-secondary mb-2">Explorer</div>
        <Link to="/catalogue" className="block text-sm hover:text-secondary transition-colors">Catalogue</Link>
        <Link to="/boutiques" className="block text-sm hover:text-secondary transition-colors">Boutiques</Link>
        <Link to="/a-propos" className="block text-sm hover:text-secondary transition-colors">À propos</Link>
        <Link to="/inscription" className="block text-sm hover:text-secondary transition-colors">Devenir vendeuse</Link>
      </div>
      <div className="md:col-span-4 space-y-3">
        <div className="text-xs uppercase tracking-[0.2em] text-secondary mb-2">Contact</div>
        <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4" /> contact@ellesmarket.cm</div>
        <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4" /> +237 6 99 00 00 00</div>
        <div className="flex gap-3 pt-2">
          <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-secondary hover:text-foreground transition-colors"><Instagram className="w-4 h-4" /></a>
          <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-secondary hover:text-foreground transition-colors"><Facebook className="w-4 h-4" /></a>
        </div>
      </div>
    </div>
    <div className="border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 text-xs text-[#FDFBF7]/50 flex flex-col md:flex-row justify-between flex-wrap gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <span>© {new Date().getFullYear()} Elles Market — Tous droits réservés.</span>
          <Link to="/confidentialite" className="hover:text-secondary transition-colors underline underline-offset-2">
            Politique de confidentialité
          </Link>
          <Link to="/mentions-legales" className="hover:text-secondary transition-colors underline underline-offset-2">
            Mentions légales
          </Link>
        </div>
        <span className="font-serif italic">Fait avec passion à Yaoundé · Douala · Bafoussam</span>
      </div>
    </div>
  </footer>
);

export default Footer;
