# DESIGN.md — Memora

Monde visuel : **cotillons en papier**.
Référence physique : la table d'une fête juste avant l'arrivée des invités — guirlandes de
fanions, frange de papier crépon, étiquettes découpées, photos scotchées sur un album.
Tout ce qui est à l'écran est un morceau de papier posé, jamais une « carte d'interface ».

## Palette

Règle de contraste non négociable : **les aplats saturés portent toujours l'encre prune**,
jamais du blanc.

| Rôle | Token | Valeur |
| --- | --- | --- |
| Encre (texte, contours) | `--ink` | `#240b3b` |
| Encre secondaire | `--ink-soft` | `#5a4270` |
| Encre discrète | `--ink-faint` | `#8a76a3` |
| Fond de page | `--paper` | `#fdf5ff` |
| Accent principal | `--fuchsia` | `#ff2e88` |
| Accent chaud | `--mandarine` | `#ff7a2f` |
| Accent frais | `--turquoise` | `#00bfa6` |
| Nuit de fête (bandeaux) | `--grape` / `--grape-deep` | `#2a0e4f` / `#1c0733` |
| Lumière | `--citron` | `#ffc93c` |
| Violet vif | `--raisin` | `#6b2cf5` |

Le raisin sombre sert aux surfaces « soirée » (header, footer, hero, couvertures d'album) ;
le papier clair sert à tout le reste.

## Typographie

- **Display** : Bricolage Grotesque (600/700/800), `.display`, `.display-sm` — titres serrés,
  interlignage court, jamais en capitales espacées.
- **Texte** : Hanken Grotesk — corps à 1rem minimum, interlignage 1.75.
- Pas d'eyebrow / kicker `text-xs uppercase tracking-[0.2em]` : les titres se suffisent.

## Matière

- `.paper` — feuille blanche, contour encre 2px, angles 26px, ombre douce. Jamais imbriquée
  dans une autre `.paper`.
- `.fringe` — frange de papier crépon multicolore sous le header et au-dessus du footer.
  (C'est une matière du monde, pas une grille décorative.)
- `.confetti` — semis de confettis, uniquement sur les fonds sombres ou saturés.
- `.tape` — bout de scotch pour fixer une photo.
- `.marker` — surlignage citron tracé à la main derrière un fragment de titre.
- `.scallop-bottom` — bord inférieur festonné, comme découpé aux ciseaux cranteurs.
- `.settle` — les photos du hero « se posent » à l'arrivée ; désactivé sous
  `prefers-reduced-motion`.

## Composants

- `.btn` (+ `btn-fuchsia`, `btn-citron`, `btn-turquoise`, `btn-mandarine`, `btn-ghost`, `btn-sm`) :
  pastille à contour encre, ombre portée pleine `0 4px 0`, qui s'enfonce au clic.
- `.chip` : étiquette papier à contour encre ; `.chip-night` sur fond raisin.
- `.field` : champ blanc à contour épais, focus fuchsia.
- Listes de faits (profil, détail photo, admin) : lignes séparées par des pointillés,
  jamais des sous-cartes.

## Interdits

- Pas de grille de cartes « icône + titre + texte » comme structure de page.
- Pas de carte dans une carte.
- Pas de texte en dégradé, pas de glassmorphism décoratif.
- Pas de bordure gauche colorée de plus d'1px.
- Pas d'imagerie alcool : les photos montrent des gens qui font la fête, tous types
  d'événements confondus (pas seulement des mariages).
