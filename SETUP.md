# Configuration du site Soins Énergétiques

## Variables d'environnement (.env)

Modifiez le fichier `.env` avec vos vraies clés :

### 1. Stripe (paiements)
1. Créez un compte sur [stripe.com](https://stripe.com)
2. Dans votre dashboard Stripe → Développeurs → Clés API
3. Copiez votre clé secrète (`sk_test_...`) et clé publique (`pk_test_...`)
4. Créez un produit d'abonnement à 49€/mois → copiez l'ID du prix (`price_...`)
5. Pour les webhooks : Stripe CLI → `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   → copiez le webhook secret (`whsec_...`)

```env
STRIPE_SECRET_KEY="sk_test_votre_cle"
STRIPE_PUBLISHABLE_KEY="pk_test_votre_cle"
STRIPE_WEBHOOK_SECRET="whsec_votre_secret"
STRIPE_PRICE_ID="price_votre_price_id"
```

### 2. Resend (emails)
1. Créez un compte sur [resend.com](https://resend.com)
2. Créez une clé API
3. Ajoutez votre domaine ou utilisez le domaine de test Resend

```env
RESEND_API_KEY="re_votre_cle"
RESEND_FROM_EMAIL="notifications@votredomaine.fr"
```

### 3. NextAuth (sécurité)
Générez un secret sécurisé :
```bash
openssl rand -base64 32
```
```env
NEXTAUTH_SECRET="votre_secret_genere"
NEXTAUTH_URL="https://votredomaine.fr"  # En production
```

## Lancer le projet

```bash
cd soins-energetiques
npm run dev
```

Le site sera accessible sur http://localhost:3000

## Déploiement sur Vercel

1. `npm i -g vercel`
2. `vercel` dans le dossier du projet
3. Ajoutez les variables d'environnement dans le dashboard Vercel
4. Pour la DB en production, utilisez Vercel Postgres ou PlanetScale (remplacer SQLite)

## Tester Stripe en local

```bash
# Dans un terminal séparé :
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Structure des dossiers

```
soins-energetiques/
├── app/           # Pages et API routes (Next.js App Router)
├── components/    # Composants réutilisables
├── lib/           # Utilitaires (DB, auth, Stripe, email)
├── prisma/        # Schéma et migrations de la base de données
└── public/        # Fichiers statiques (dont photos uploadées)
```
