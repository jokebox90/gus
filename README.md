# Gus

**Graphical User Storage**

Plateau de jeu => https://gus.petitboutde.cloud

À propos de Gus.

Gus, certainement le meilleur service de gestion et de partage de photos en ligne, s'est fixé comme objectif principal : permettre aux gens de partager leurs photos avec les personnes de leur choix.

Vous souhaitez regrouper sur un blog les moments capturés avec votre téléphone portable ou partager vos plus belles photos et vos plus belles vidéos avec le monde entier et devenir une célébrité du Web ? Ou souhaitez-vous simplement partager en toute sécurité et en toute confidentialité les photos de vos enfants avec votre famille dispersée aux quatre coins du pays ? Gus répond à toutes vos attentes et plus encore !

Pour ce faire , vous pouvez ajouter vos photos et vos vidéos à partir d’un maximum de sources : Web, périphériques mobiles, ordinateurs personnels et logiciels de gestion de photos. Faites ensuite découvrir vos photos et vos vidéos de toutes les manières possibles : site Web Gus, fils RSS, courriers électroniques, blogs externes, etc. À quoi d’autre ces outils intelligents nous serviraient-ils ?

## Services applicatifs

* React / Redux: http://localhost:3000/
* Pyramid (Python): http://localhost:6543/
* MinIO:
    * Console: http://localhost:9090
    * Serveur: http://localhost:9091
    * Root User: minio
    * Root Pass: minio123
* MySQL:
    * Base: development
    * Serveur: db:3306
    * Root User: root
    * Root Pass: r00t!
* Redis
* Adminer

### Pré-requis

- VSCode (ou autre IDE),
- Git,
- Docker Engine / Docker Desktop.

### Cloner le projet

```bash
cd ~/Code

git clone https://github.com/jokebox90/gus.git gus

cd gus
ls
```

### Affichage de la configuration

```bash
docker-compose config --volumes
docker-compose config --services
```

### Démarrage des services

```bash
docker-compose up -d --build
```

### Affichage des messages envoyés par les services

```bash
docker-compose logs -t <nom-du-service>
```

Pour _la pwa_.

```bash
docker-compose logs -t pwa
```

Pour _l'api_.

```bash
docker-compose logs -t api
```

### Arrêt des services

```bash
docker-compose down
```

### Nettoyage complet

Supprime toute les applications et les données.

```bash
docker-compose down --volumes --rmi all --remove-orphans
```
