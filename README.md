<p align="center">
<br>
  <a href="https://flopgun-poker.vercel.app/">
    <img src="public/images/flopgun.png" alt="Flopgun Poker logo" width="300">
  </a>
</p>

<h3 align="center">Flopgun Poker</h3>

<p align="center">
  Plateforme d'apprentissage et d'entraînement au poker en ligne.
  <br>
  <br>
</p>

![Static Badge](https://img.shields.io/badge/personal_project-brown)
![Static Badge](https://img.shields.io/badge/langage-Typescript-blue)
![Static Badge](https://img.shields.io/badge/framework-React.js-purple)
![Static Badge](https://img.shields.io/badge/framework-Next.js-yellow)

## Practice Poker

## Sommaire

- [Presentation](#presentation)
- [Utilisation](#utilisation)
- [Installation](#installation)

## Presentation

Projet développé dans mon temps libre, dans le but d'aider les joueurs à s'entraîner au poker hors des tables.

## Utilisation

### En ligne

Pour utiliser Flopgun Poker, il suffit de se rendre sur le site [Flopgun Poker](https://flopgun-poker.vercel.app/).

### En local

Pour le lancer en local, il suffit de lancer le projet avec la commande suivante :

```bash
npm i
prisma generate
npm run dev
```

Le projet sera accessible à l'adresse `http://localhost:3000`.

## Installation

```bash
git clone <lien-du-dépôt>
```

Le projet utilise une base de données PostgreSQL. Vous pourrez créer un exemple de table avec `init.sql`.

Avec Prisma vous pouvez accéder à la base de données et la modifier.

```bash
prisma studio
```

## Troubleshooting

Si vous rencontrez un problème avec la base de données ou prisma, supprimer le dossier `generated` et relancer la commande suivante :

```bash
prisma generate
```

## Contribuer

Si vous souhaitez contribuer au projet, n'hésitez pas à ouvrir une issue ou une pull request.
