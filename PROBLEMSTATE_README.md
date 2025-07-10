# Système ProblemState - Suivi de l'avancement des problèmes

## Vue d'ensemble

Le système ProblemState permet de suivre l'avancement de chaque utilisateur sur chaque problème. Il garantit qu'un utilisateur ne peut répondre à un problème qu'une seule fois et garde une trace de ses réponses.

## Architecture

### Modèles de données

#### ProblemState (Base de données)
```sql
model problemstate {
  id         Int       @id @default(autoincrement())
  problem_id Int
  user_id    Int
  state      String?   @db.VarChar(255)
  created_at DateTime? @default(now()) @db.Timestamp(6)
  updated_at DateTime? @default(now()) @db.Timestamp(6)
  problem    problem   @relation(fields: [problem_id], references: [id], onDelete: Cascade, onUpdate: NoAction)
  users      users     @relation(fields: [user_id], references: [id], onDelete: Cascade, onUpdate: NoAction)
}
```

#### États possibles
- `started` : L'utilisateur a commencé le problème
- `correct` : L'utilisateur a répondu correctement
- `incorrect` : L'utilisateur a répondu incorrectement

### Couches de l'application

#### 1. Modèles TypeScript (`src/main/models/ProblemState.ts`)
```typescript
export interface ProblemState {
  id: number;
  problem_id: number;
  user_id: number;
  state: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}
```

#### 2. DAO (`src/main/dao/problemStateDAO.ts`)
- `create()` : Créer un nouvel état
- `findByUserAndProblem()` : Trouver l'état d'un problème pour un utilisateur
- `update()` : Mettre à jour l'état d'un problème
- `findByUser()` : Récupérer tous les états d'un utilisateur

#### 3. Service (`src/main/services/problemStateService.ts`)
- `startProblem()` : Démarrer un problème (état: "started")
- `submitAnswer()` : Soumettre une réponse (état: "correct" ou "incorrect")
- `getUserProgress()` : Récupérer tous les progrès d'un utilisateur
- `hasAnsweredProblem()` : Vérifier si l'utilisateur a déjà répondu
- `canAnswerProblem()` : Vérifier si l'utilisateur peut encore répondre

#### 4. API Routes (`app/api/problemstate/route.ts`)
- `POST /api/problemstate` : Démarrer un problème ou soumettre une réponse
- `GET /api/problemstate` : Récupérer l'état d'un problème ou tous les progrès

#### 5. Interface utilisateur (`app/problems/[id]/ProblemDetailsClient.tsx`)
- Chargement automatique de l'état du problème
- Démarrage automatique du problème au clic
- Enregistrement de la réponse lors de la soumission
- Désactivation des boutons après réponse

## Flux d'utilisation

### 1. L'utilisateur clique sur un problème
```typescript
// Le composant charge automatiquement l'état du problème
useEffect(() => {
  fetchProblemState();
}, [problem.id]);

// Si l'utilisateur n'a pas encore commencé le problème, il est automatiquement démarré
useEffect(() => {
  if (!problemState && user) {
    startProblem();
  }
}, [problemState, user]);
```

### 2. L'utilisateur soumet une réponse
```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  
  const isCorrect = selected === problem.solution;
  
  // Enregistrer la réponse dans la base de données
  await submitAnswer(isCorrect);
  
  // Afficher le résultat
  if (isCorrect) {
    setResult("✅ Bonne réponse !");
  } else {
    setResult(`❌ Mauvaise réponse. La bonne réponse est : ${problem.solution}`);
  }
}
```

### 3. Protection contre les réponses multiples
```typescript
// L'interface est désactivée si l'utilisateur a déjà répondu
const isAnswered = hasAnswered || result !== null;

// Les boutons de réponse sont désactivés
<input
  disabled={isAnswered}
  // ...
/>

// Le bouton de validation est désactivé
<button 
  disabled={hasAnswered}
  // ...
>
  {hasAnswered ? 'Déjà répondu' : 'Valider'}
</button>
```

## API Endpoints

### POST /api/problemstate
Démarrer un problème ou soumettre une réponse.

**Body:**
```json
{
  "problemId": 1,
  "action": "start" | "submit",
  "isCorrect": true | false  // Requis seulement pour "submit"
}
```

**Réponse:**
```json
{
  "id": 1,
  "problem_id": 1,
  "user_id": 1,
  "state": "started" | "correct" | "incorrect",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/problemstate
Récupérer l'état d'un problème ou tous les progrès.

**Query Parameters:**
- `problemId` (optionnel) : ID du problème spécifique

**Réponse (problème spécifique):**
```json
{
  "id": 1,
  "problem_id": 1,
  "user_id": 1,
  "state": "correct",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

**Réponse (tous les progrès):**
```json
[
  {
    "id": 1,
    "problem_id": 1,
    "user_id": 1,
    "state": "correct",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "problem": {
      "id": 1,
      "title": "Problème 1",
      // ... autres propriétés du problème
    }
  }
]
```

## Tests

### Tests unitaires
```bash
npm test src/test/services/problemStateService.test.ts
```

### Tests en base de données
```bash
npx ts-node src/main/scripts/test-problemstate.ts
```

## Sécurité

- **Authentification requise** : Toutes les routes API nécessitent un token JWT valide
- **Validation des données** : Vérification que l'utilisateur ne peut répondre qu'une seule fois
- **Protection contre les doublons** : Empêche la création de multiples états pour le même problème/utilisateur

## Gestion d'erreurs

Le système gère les erreurs suivantes :
- `User has already started this problem` : Tentative de redémarrage d'un problème
- `User has not started this problem` : Tentative de réponse sans avoir commencé
- `User has already answered this problem` : Tentative de réponse multiple
- `Unauthorized` : Token d'authentification manquant ou invalide

## Évolutions futures

- Ajout de statistiques de progression
- Système de points/score
- Historique des tentatives
- Recommandations de problèmes basées sur les réponses précédentes 