const Confidentialite = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24 fade-in">
      <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Confidentialité</div>
      <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-8">
        Politique de <span className="font-serif italic font-light">confidentialité</span>.
      </h1>

      <div className="prose prose-sm max-w-none space-y-6 text-foreground/90">
        <section>
          <h2 className="font-display font-semibold text-lg mb-2">1. Données que nous collectons</h2>
          <p>
            Pour créer un compte, nous collectons votre nom complet, votre adresse email, votre numéro
            de téléphone et votre ville. Pour les vendeuses, nous collectons également une pièce
            d'identité (CNI ou passeport) et, le cas échéant, une attestation d'immatriculation, dans
            le cadre de la vérification de votre boutique.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg mb-2">2. Utilisation de vos données</h2>
          <p>
            Vos données servent uniquement à faire fonctionner la plateforme : créer votre compte,
            vérifier votre identité en tant que vendeuse, traiter vos commandes, et vous contacter en
            cas de besoin. Nous ne vendons ni ne partageons vos données personnelles avec des tiers à
            des fins commerciales.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg mb-2">3. Documents d'identité</h2>
          <p>
            Les pièces d'identité et attestations fournies par les vendeuses sont strictement
            confidentielles. Elles sont uniquement consultées par notre équipe de vérification et
            l'administration de la plateforme, dans le seul but de confirmer l'authenticité de la
            boutique. Elles ne sont jamais rendues publiques ni partagées avec d'autres utilisateurs.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg mb-2">4. Conservation des données</h2>
          <p>
            Vos données sont conservées tant que votre compte est actif. Vous pouvez demander la
            suppression de votre compte et de vos données à tout moment depuis votre espace personnel.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg mb-2">5. Vos droits</h2>
          <p>
            Vous pouvez à tout moment demander l'accès, la correction ou la suppression de vos données
            personnelles en nous contactant à l'adresse indiquée en pied de page.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg mb-2">6. Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures raisonnables pour protéger vos données contre tout accès
            non autorisé, notamment en restreignant l'accès aux documents sensibles aux seules
            personnes habilitées.
          </p>
        </section>

        <p className="text-xs text-muted-foreground pt-6 border-t border-border">
          Dernière mise à jour : août 2026.
        </p>
      </div>
    </div>
  );
};

export default Confidentialite;
