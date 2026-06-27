import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Globe2, TrendingUp } from "lucide-react";

const About = () => (
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24 fade-in">
    <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Notre mission</div>
    <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl tracking-tight leading-[0.95] text-balance">
      Élever les <span className="font-serif italic font-light">femmes</span> qui font le Cameroun, une boutique à la fois.
    </h1>
    <p className="mt-10 text-lg leading-relaxed text-foreground/80 max-w-3xl">
      Elles Market est la première marketplace nationale dédiée aux femmes entrepreneures camerounaises. Notre objectif :
      offrir à chaque entrepreneure une vitrine digitale, des paiements sécurisés et une logistique fiable pour atteindre
      des clientes dans toutes les villes du pays.
    </p>

    <div className="mt-20 grid md:grid-cols-2 gap-8">
      {[
        { icon: Heart, title: "Promouvoir l'entrepreneuriat féminin", desc: "Donner aux femmes les moyens de leur indépendance économique." },
        { icon: Globe2, title: "Couvrir tout le territoire", desc: "Yaoundé, Douala, Bafoussam, Buea, Maroua, Kribi… partout au Cameroun." },
        { icon: Sparkles, title: "Mettre en lumière le savoir-faire local", desc: "Artisanat, cosmétiques naturels, mode, formations — l'authenticité avant tout." },
        { icon: TrendingUp, title: "Faciliter la croissance", desc: "Outils de gestion, statistiques, abonnement Premium pour aller plus loin." },
      ].map((b, i) => (
        <div key={i} className="p-8 border border-border bg-card rounded-sm">
          <b.icon className="w-6 h-6 text-primary" />
          <div className="font-display font-bold text-xl mt-4">{b.title}</div>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{b.desc}</p>
        </div>
      ))}
    </div>

    <div className="mt-20 bg-foreground text-background p-10 lg:p-14 rounded-sm">
      <div className="font-serif italic text-2xl lg:text-3xl leading-snug">
        « Quand les femmes prospèrent, c'est tout le Cameroun qui se transforme. »
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/inscription"><Button size="lg" className="rounded-full" data-testid="about-cta-register">Rejoindre Elles Market</Button></Link>
        <Link to="/catalogue"><Button size="lg" variant="outline" className="rounded-full bg-transparent text-background border-background/40 hover:bg-background hover:text-foreground" data-testid="about-cta-explore">Explorer les produits</Button></Link>
      </div>
    </div>
  </div>
);

export default About;
