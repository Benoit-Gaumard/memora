# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Cible prioritaire (confirmée par le propriétaire du produit) : les particuliers qui organisent
une fête — anniversaire, mariage, soirée entre amis, fête de famille. L'organisateur crée
l'événement, invite ses proches et veut récupérer toutes les photos prises par les invités.

Second public, servi par le même produit : les invités de l'événement. Ils rejoignent via un
lien ou un QR code, déposent leurs photos depuis leur téléphone pendant ou après la fête, et
consultent l'album. Les cas d'usage professionnels (séminaires, conférences, événements
d'entreprise) sont affichés sur la landing mais ne dictent pas le ton.

## Product Purpose

Memora collecte au même endroit les photos prises par tous les invités d'un événement et les
réunit dans un album privé, consultable et téléchargeable par les membres de l'événement.
Succès = l'organisateur récupère les photos de ses invités sans les courir après, et les invités
participent sans friction.

## Positioning

Une façon simple de collecter les photos de vos invités : accès par lien ou QR code, aucune
application à installer, album privé réservé aux membres de l'événement.

## Operating Context

- L'organisateur crée l'événement depuis l'espace admin, génère un lien / QR code d'invitation.
- Le QR code est affiché pendant la fête (tables, panneau d'accueil) ; les invités le scannent
  avec leur téléphone, se connectent et rejoignent l'événement.
- Les uploads se font majoritairement depuis un mobile, souvent en soirée, en lumière faible,
  parfois sur un réseau lent.
- La consultation de l'album se fait aussi bien sur mobile que sur ordinateur, après l'événement.

## Capabilities and Constraints

Fonctionnalités confirmées dans le code :

- Comptes et sessions Supabase (login par identifiant), profils, rôles `user` / `super_admin`.
- Événements : création, édition, suppression, statut, image de couverture, quotas de stockage,
  activation/désactivation des uploads et des téléchargements.
- Membres d'événement : rôles `participant` / `organizer`, statuts `pending` / `active` /
  `blocked` / `removed`.
- Invitations : codes d'invitation, page `/join/[code]`, QR code, approbation optionnelle.
- Photos : upload avec barre de progression, galerie, page photo plein écran, téléchargement,
  suppression réservée à l'auteur (ou admin).
- Commentaires sur les photos, réservés aux membres actifs de l'événement.
- Espace d'administration : événements, photos, utilisateurs.

Contraintes techniques : Next.js (App Router) + Tailwind CSS v4, Supabase (Postgres + RLS +
Storage bucket privé `event-photos`), photos servies via une route authentifiée
(`/api/private-photo`). Interface entièrement en français.

Non décidé / absent à ce jour : offre commerciale, tarifs, limites du plan gratuit, retouche
ou tri automatique des photos, application mobile native.

## Brand Commitments

- Nom du produit : **Memora**.
- Interface et contenus en français.
- Le site ne doit pas se présenter comme dédié aux mariages : il couvre tous les types de fêtes.
- Imagerie sans alcool (contrainte explicite du propriétaire pour les visuels de la landing).
- Photo de la landing actuellement utilisée : Pexels 7180623 (amis en train de faire la fête).

## Evidence on Hand

- Application réelle et fonctionnelle : routes `/`, `/login`, `/events`, `/events/[slug]`,
  `/events/[slug]/photos/[photoId]`, `/join/[code]`, `/profile`, `/admin/*`.
- Migrations SQL documentant le modèle de données : `supabase/migrations/001` à `009`.
- Aucun témoignage client, aucun chiffre d'usage, aucun logo partenaire, aucun prix : ces
  éléments ne doivent pas être inventés.

## Product Principles

1. Zéro friction pour l'invité : un lien ou un QR code suffit, aucune application à installer.
2. L'album est privé par défaut ; l'accès est réservé aux membres actifs de l'événement.
3. Le produit sert toutes les fêtes, pas seulement les mariages.
4. Le mobile est le terrain de jeu principal (scan, upload, consultation pendant la soirée).
5. Ne jamais afficher de preuve commerciale ou de chiffre qui n'existe pas.

## Accessibility & Inclusion

Pas d'exigence de norme formelle établie à ce jour. Contraintes d'usage réelles : usage nocturne
sur mobile, lecture rapide, invités non technophiles de tous âges.
