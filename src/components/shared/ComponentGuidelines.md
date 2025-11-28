# Directives de Style pour les Composants UI

Ce document décrit les directives de style unifiées pour tous les composants de l'application devSongue.

## Palette de Couleurs

### Couleurs Primaires (Thème Orange)
- 50: #fff7ed
- 100: #ffedd5
- 200: #fed7aa
- 300: #fdba74
- 400: #fb923c
- 500: #f97316
- 600: #ea580c
- 700: #c2410c
- 800: #9a3412
- 900: #7c2d12

### Couleurs Neutres
- Background: #ffffff (light) / #0a0a0a (dark)
- Foreground: #171717 (light) / #ededed (dark)
- Gray scale: Utiliser les classes Tailwind par défaut (gray-100 à gray-900)

## Typographie

- Police principale: Inter (via next/font)
- Hiérarchie des titres:
  - H1: text-3xl font-bold
  - H2: text-2xl font-bold
  - H3: text-xl font-semibold
  - H4: text-lg font-semibold
- Corps du texte: text-base
- Texte secondaire: text-sm

## Espacement

- Petits espacements: p-2, m-2
- Espacements moyens: p-4, m-4
- Grands espacements: p-6, m-6
- Très grands espacements: p-8, m-8

## Composants

### Boutons
- Border radius: rounded-lg
- Padding: px-4 py-2
- Ombres: shadow-sm
- Transitions: transition-colors duration-200
- États:
  - Normal: bg-primary-600 text-white
  - Hover: hover:bg-primary-700
  - Focus: focus:outline-none focus:ring-2 focus:ring-primary-500
  - Dark mode focus: dark:focus:ring-offset-gray-800

### Cartes
- Border radius: rounded-xl
- Bordures: border border-gray-200 (light) / dark:border-gray-700 (dark)
- Fond: bg-white (light) / dark:bg-gray-800
- Ombres: shadow-sm

### Tables
- En-tête: bg-gradient-to-r from-gray-50 to-gray-100
- Cellules: px-4 py-3
- Lignes: divide-y divide-gray-200
- Survol: hover:bg-blue-50 transition-colors duration-150

### Modals
- Fond overlay: bg-black bg-opacity-50
- Conteneur: bg-white rounded-lg shadow-xl (light) / dark:bg-gray-800 (dark)
- Bordures: border border-gray-200 (light) / dark:border-gray-700 (dark)

## Mode Sombre

Tous les composants doivent supporter le mode sombre avec les classes 'dark:' appropriées:
- Fond: dark:bg-gray-800
- Texte: dark:text-gray-100
- Bordures: dark:border-gray-700
- États de survol: dark:hover:bg-gray-700
- Focus rings: dark:focus:ring-offset-gray-800

## Accessibilité

- Toujours inclure dark:focus:ring-offset-gray-800 pour l'accessibilité au clavier en mode sombre
- Assurer un bon contraste entre le texte et le fond dans les deux modes
- Utiliser des labels appropriés pour les éléments interactifs