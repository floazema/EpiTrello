# Taskly — Cahier des charges (Global)

## 1. Vision & objectifs
- Application de gestion de projet en mode Kanban, pensée pour la simplicité et la collaboration.
- Objectif: offrir une expérience fluide de création, organisation et suivi des tâches en équipe.
- Priorités: ergonomie, performances, sécurité et maintenabilité.

## 2. Périmètre
- Inclus: boards, colonnes, tâches, drag & drop, invitations/membres, rôles, dark mode.
- Envisageable: notifications email, pièces jointes, commentaires temps réel, historique avancé.

## 3. Personas & rôles
- Owner: crée/édite/supprime le board, gère les membres, configure le workspace.
- Member: collabore sur les tâches (créer/éditer/déplacer/supprimer selon règles); peut quitter le board.

## 4. Fonctionnalités clés
- Boards & colonnes
  - Créer, renommer, supprimer boards et colonnes; ordonner les colonnes.
  - Vue Kanban organisée par colonnes avec positions persistées.
- Tâches
  - Créer/éditer/supprimer une tâche avec titre, description, priorité (low/medium/high), deadline, assignation à un membre.
  - Réorganisation par glisser-déposer (au sein d’une colonne et entre colonnes) avec retour visuel rapide.
  - Indicateurs visuels: priorité, échéance (urgent/retard), membre assigné.
- Collaboration
  - Invitations à rejoindre un board; acceptation/refus; gestion des membres.
  - Rôles et permissions (owner vs member) appliqués à la gestion du board et des tâches.
- Navigation & tableaux de bord
  - Dashboard listant mes boards (possédés + où je suis membre).
  - Page Board détaillée (colonnes, tâches, membres).
- UI/UX
  - Dark mode, responsive, micro-interactions, feedbacks d’état (chargement, succès/erreur).
  - Accessibilité: contrastes, focus clavier, textes clairs.

## 5. Expérience utilisateur
- Parcours: inscription/connexion → création d’un board → ajout de colonnes → ajout et gestion de tâches → invitations → collaboration.
- UI optimiste sur les actions fréquentes (création, déplacement) pour fluidité.
- Messages d’erreur et de succès explicites, états de chargement visibles.

## 6. Technologies (global)
- Frontend: Next.js (App Router), React, Tailwind CSS, shadcn/ui, Lucide.
- Backend: Next.js server components & handlers.
- Base de données: PostgreSQL (modèle relationnel pour utilisateurs, boards, colonnes, tâches, membres, invitations).
- Authentification & sécurité: JWT, hashing des mots de passe (bcrypt), cookies sécurisés.
- Conteneurisation: Docker pour la base de données.
- Hosting : Vercel pour le frontend et le backend. Neon pour la base de données.

## 7. Architecture applicative (haute niveau)
- Architecture modulaire: séparation des pages, composants UI réutilisables et utilitaires.
- Flux de données: interactions UI → validation → persistance en base → retour UI optimiste.
- Modèle: entités principales (user, board, column, task, member, invitation) et relations claires.
- Journalisation basique des opérations pour le suivi et le debug.

## 8. Exigences
- Performance: interactions courantes fluides (drag & drop, création/édition), latence perçue faible.
- Robustesse: validation cohérente; gestion des erreurs côté client et serveur.
- Sécurité: stockage sécurisé des mots de passe; tokens signés; permissions par rôle.
- Maintenabilité: code lisible, composants découplés, conventions Next.js.
- Accessibilité & responsive: utilisable sur desktop et mobile, respect des bonnes pratiques.

## 11. Livrables
- Codebase opérationnelle, documentation d’installation et d’usage.
- Documentation technique détaillée (modèle de données, API, flux de travail).
- Guide d’UI (principes, composants), notes d’architecture.
- Plan de tests (unitaires, intégration, E2E) aligné sur les critères d’acceptation.