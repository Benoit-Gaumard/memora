# DESIGN.md : Memora

Monde visuel : **cotillons en papier**.
Référence physique : la table d'une fête juste avant l'arrivée des invités, avec guirlandes de
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
| Alerte | `--rouge` | `#d90429` |

Le raisin sombre sert aux surfaces « soirée » (header, footer, hero, couvertures d'album) ;
le papier clair sert à tout le reste. Le rouge n'est jamais décoratif : il n'encadre que les
zones de danger (suppression définitive).

## Typographie

- **Display** : Bricolage Grotesque (600/700/800), `.display`, `.display-sm`. Titres serrés,
  interlignage court, jamais en capitales espacées.
- **Texte** : Hanken Grotesk, corps à 1rem minimum, interlignage 1.75.
- Pas d'eyebrow / kicker `text-xs uppercase tracking-[0.2em]` : les titres se suffisent.

## Matière

- `.paper` : feuille blanche, contour encre 2px, angles 26px, ombre douce. Jamais imbriquée
  dans une autre `.paper`.
- `.confetti` : semis de confettis, uniquement sur les fonds sombres ou saturés.
- `.tape` : bout de scotch pour fixer une photo.
- `.marker` : surlignage citron tracé à la main derrière un fragment de titre.
- `.scallop-bottom` : bord inférieur festonné, comme découpé aux ciseaux cranteurs.
- `.settle` : les photos du hero « se posent » à l'arrivée ; désactivé sous
  `prefers-reduced-motion`.

## Composants

- `.btn` (+ `btn-fuchsia`, `btn-citron`, `btn-turquoise`, `btn-mandarine`, `btn-ghost`, `btn-sm`) :
  pastille à contour encre, ombre portée pleine `0 4px 0`, qui s'enfonce au clic.
  `btn-danger` : variante blanche cernée de rouge, réservée aux actions irréversibles.
- `.chip` : étiquette papier à contour encre ; `.chip-night` sur fond raisin.
- `.field` : champ blanc à contour épais, focus fuchsia ; `.field-danger` passe le focus au rouge.
- `.paper-danger` : `.paper` encadrée de rouge, pour les zones de danger.
- `.modal` : `<dialog>` natif servant de cadre transparent, backdrop encre floutée ; le contenu
  est une `.paper` ordinaire. Toujours `<dialog>`, jamais un overlay maison ni `window.confirm`.
  Une suppression définitive se confirme en tapant le nom exact de l'objet.
- `.skeleton` : balayage clair sur le fond grape d'un cadre photo, le temps que la vignette
  arrive. L'image se pose par-dessus, donc rien à piloter en JavaScript. Une galerie ne
  charge jamais l'original : la grille lit la vignette, la vue plein écran la version
  d'affichage, et l'original ne sort que pour le téléchargement et le ZIP.
- Tableaux d'administration : en-têtes triables (`SortableHeader`), chevron discret au repos,
  flèche pleine sur la colonne active, `aria-sort` porté par le `<th>`. Le tri se fait sur les
  lignes déjà chargées, sans aller-retour serveur, et les cellules vides finissent toujours en bas.
- Listes de faits (profil, détail photo, admin) : lignes séparées par des pointillés,
  jamais des sous-cartes.

## Interdits

- Pas de grille de cartes « icône + titre + texte » comme structure de page.
- Pas de carte dans une carte.
- Pas de texte en dégradé, pas de glassmorphism décoratif.
- Pas de bordure gauche colorée de plus d'1px.
- Pas d'imagerie alcool : les photos montrent des gens qui font la fête, tous types
  d'événements confondus (pas seulement des mariages).
