# Système d'Extensions avec Liaison aux Entreprises

## Vue d'ensemble

Le système d'extensions a été conçu pour lier chaque extension à une entreprise spécifique, garantissant que les données et les fonctionnalités sont isolées par entreprise.

## Fonctionnalités clés

### 1. Activation avec Confirmation
- Lors de l'activation d'une extension, un modal de confirmation s'affiche
- L'administrateur doit confirmer que l'extension sera activée uniquement pour l'entreprise actuelle
- L'extension est alors liée à cette entreprise spécifique

### 2. Stockage des Données par Entreprise
- Toutes les données d'extension sont stockées dans le contexte de l'entreprise
- Chaque entreprise a ses propres données d'extension isolées
- Les ventes Wi-Fi, par exemple, sont enregistrées comme des produits spécifiques à l'entreprise

### 3. Affichage Contextuel
- Les extensions activées ne s'affichent que pour l'entreprise concernée
- Seuls l'administrateur et les utilisateurs assignés peuvent voir les extensions
- La sidebar reflète dynamiquement les extensions disponibles pour l'entreprise active

## Implémentation Technique

### Hook useExtensions
Le hook `useExtensions` gère la liaison entre extensions et entreprises :

```typescript
// Liaison d'une extension à une entreprise lors de l'activation
const toggleExtension = (id: string, businessId?: string) => {
  // Si une entreprise est spécifiée et que l'extension est activée
  if (businessId && !ext.enabled) {
    // Lier l'extension à l'entreprise
    if (!extensionAssignments[id]) {
      extensionAssignments[id] = [];
    }
    if (!extensionAssignments[id].includes(businessId)) {
      extensionAssignments[id].push(businessId);
    }
  }
};
```

### Données d'Extension
Les données sont stockées avec une clé composite incluant l'ID de l'entreprise :

```typescript
// Exemple avec les ventes Wi-Fi
await saveExtensionData({
  extensionId: 'wifi-sales',
  businessId: activeBusiness.id, // ID de l'entreprise active
  key: 'sales',
  data: updatedSales
});
```

### Filtrage dans l'Interface
L'interface utilisateur filtre les extensions en fonction de l'entreprise active :

```typescript
// Dans la sidebar
const activeExtensions = extensions.filter(ext => {
  if (activeBusiness?.id) {
    // Ne montrer que les extensions assignées à l'entreprise active
    return ext.enabled && extensionAssignments[ext.id]?.includes(activeBusiness.id);
  }
  return ext.enabled;
});
```

## Exemple : Extension Wi-Fi Sales

L'extension "Bilan des Ventes Wi-Fi" illustre parfaitement le système :

1. **Activation** : L'administrateur active l'extension pour une entreprise spécifique
2. **Données** : Les ventes sont enregistrées dans le contexte de cette entreprise
3. **Affichage** : Seuls les utilisateurs de cette entreprise voient l'extension
4. **Isolation** : Les données d'une entreprise ne sont jamais mélangées avec celles d'une autre

## Avantages

- **Sécurité** : Isolation complète des données entre entreprises
- **Personnalisation** : Chaque entreprise peut avoir ses propres extensions activées
- **Contrôle** : L'administrateur contrôle précisément quelles extensions sont disponibles
- **Scalabilité** : Le système peut gérer un nombre illimité d'entreprises et d'extensions