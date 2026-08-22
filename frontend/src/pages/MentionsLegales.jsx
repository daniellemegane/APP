const MentionsLegales = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24 fade-in">
      <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Informations légales</div>
      <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-8">
        Mentions <span className="font-serif italic font-light">légales</span>.
      </h1>

      <div className="prose prose-sm max-w-none space-y-6 text-foreground/90">
        <section>
          <h2 className="font-display font-semibold text-lg mb-2">Éditeur du site</h2>
          <p>
            Elles Market est une plateforme portée par ACODAF. Pour toute question relative au site,
            vous pouvez nous contacter à l'adresse indiquée en pied de page.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg mb-2">Rôle de la plateforme</h2>
          <p>
            Elles Market met en relation des vendeuses indépendantes et des clientes. Les boutiques
            présentes sur la plateforme sont gérées par des entrepreneures indépendantes, responsables
            de leurs produits, de leurs descriptions et du respect des lois applicables à leur activité.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg mb-2">Vérification des vendeuses</h2>
          <p>
            Chaque boutique fait l'objet d'une vérification d'identité avant validation. Cette
            vérification vise à renforcer la confiance sur la plateforme, mais ne constitue pas une
            garantie absolue quant à la qualité des produits ou services proposés.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg mb-2">Paiement</h2>
          <p>
            Les modalités de paiement sont convenues directement entre la cliente et la vendeuse au
            moment de la finalisation de la commande. Elles Market n'intervient pas dans la transaction
            financière et ne peut être tenue responsable des litiges relatifs au paiement.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg mb-2">Propriété intellectuelle</h2>
          <p>
            Le contenu du site (textes, mise en page, logo) est protégé. Les images et descriptions de
            produits restent la propriété de leurs vendeuses respectives.
          </p>
        </section>

        <p className="text-xs text-muted-foreground pt-6 border-t border-border">
          Dernière mise à jour : août 2026.
        </p>
      </div>
    </div>
  );
};

export default MentionsLegales;
