# Documentation Technique - TP DJF - Backend



## 1. Architecture du Projet & Services Docker

Le projet est organisé en deux répertoires distincts à la racine : un pour le **Backend** (API Spring Boot) et un pour le **Frontend** (React). Le fichier `docker-compose.yml` se trouve à la racine pour orchestrer l'ensemble.



### Arborescence des Fichiers

Voici l'organisation exacte du projet que j'ai adopté:

```text
MON-PROJET/
│
├── docker-compose.yml         
│
├── backend/                  
│   ├── Dockerfile              
│   ├── build.gradle           
│   └── src/
│       └── main/java/...     
│
└── frontend/                  
    ├── Dockerfile              
    ├── nginx.conf           
    ├── package.json         
    ├── vite.config.js
    └── src/     
```             



### Détail des Services

Le fichier `docker-compose.yml` définit 4 services interconnectés via un réseau privé (`app-network`).

#### 1. Service de Données : `mysql`
* **Rôle :** Persistance des données (Utilisateurs, Mots de passe hashés, Numéros de téléphone).
* **Image :** `mysql:8.0`.
* **Configuration :** Initialisé avec les variables d'environnement (`MYSQL_DATABASE`, `MYSQL_USER`, etc.).
* **Volume :** Utilise un volume nommé `mysql-data` pour que les données survivent au redémarrage des conteneurs.
* **Santé (Healthcheck) :** Vérifie régulièrement si le port 3306 répond pour informer les autres services que la base est prête.

#### 2. Service Backend : `app`
* **Rôle :** API REST, Logique métier, Sécurité (Spring Security), Gestion OTP.
* **Technologie :** Java 17 / Spring Boot.
* **Build :** Construction Multi-stage (Gradle pour compiler, JRE léger pour exécuter).
* **Dépendance :** Attend que le service `mysql` soit "Healthy" avant de démarrer.
* **Configuration :** Reçoit les URLs de l'API SMS et les identifiants BDD via les variables d'environnement.

#### 3. Service Frontend & Proxy : `frontend`
* **Rôle :** Serveur Web et Reverse Proxy.
* **Technologie :** Nginx (servant une application React buildée avec Vite).
* **Ports :** Expose le port **80** vers l'extérieur (le point d'entrée unique pour l'utilisateur).
* **Routage Nginx :**
    * `/` -> Sert les fichiers statiques React (HTML, JS, CSS).
    * `/api/*` -> Redirige les requêtes vers le service `app:8080` (Backend).

#### 4. Service de Qualité (On va le voir apres dans une section): `tests`
* **Rôle :** Exécution des tests unitaires et d'intégration à la demande.
* **Technologie :** Image Gradle officielle.
* **Particularité :** Monte le code source local en volume. Il est éphémère (démarre, teste, s'arrête).



## 2. Variables d'Environnement Requises

Pour que l'application démarre et fonctionne correctement (connexion BDD et envoi SMS), les variables suivantes doivent être définies dans votre fichier `docker-compose.yml` sous la section `environment`.

### 1. Base de Données (MySQL)

Ces variables sont natives à Spring Boot pour configurer la datasource.

| Variable | Description | Valeur Recommandée (Docker) |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | URL de connexion JDBC | `jdbc:mysql://mysql:3306/myappdb` |
| `SPRING_DATASOURCE_USERNAME` | Utilisateur de la BDD | `appuser` |
| `SPRING_DATASOURCE_PASSWORD` | Mot de passe de la BDD | `apppassword` |

### 2. Service SMS (API UBO)

Ces variables sont injectées dans la classe `OtpService` pour gérer l'authentification et l'envoi.

| Variable | Description | Valeur Requise |
| :--- | :--- | :--- |
| `SMS_API_URL` | Endpoint pour l'envoi du message (`POST`) | `http://dosipa.univ-brest.fr/send-sms` |
| `SMS_PING_URL` | Endpoint pour vérifier l'état du serveur (`GET`) | `http://dosipa.univ-brest.fr/ping` |
| `SMS_API_KEY` | Clé d'API passée dans le Header `x-api-key` | `DOSITPDJF` |

### 3. application.properties:

```
spring.application.name=djf

spring.datasource.url=jdbc:mysql://mysql:3306/myappdb

spring.datasource.username=appuser
spring.datasource.password=apppassword

pring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver


spring.jpa.hibernate.ddl-auto=update

# Affiche les requêtes SQL générées par Hibernate (utile pour le débogage)
spring.jpa.show-sql=true

sms.api.url=${SMS_API_URL:http://dosipa.univ-brest.fr/send-sms}
sms.ping.url=${SMS_PING_URL:http://dosipa.univ-brest.fr/ping}
sms.api.key=${SMS_API_KEY:DOSITPDJF}

```
### 4. Guide de Démarrage (Première Fois)


Lors du premier lancement:

```bash
docker-compose up --build
```

ou
```bash
docker-compose up
```

## 3. Configuration du Serveur Web (Nginx)

Dans l'environnement de production (Docker), **Nginx** joue le rôle de serveur web et de reverse proxy. Il permet de servir l'application React et de communiquer avec l'API Backend sur un port unique (80).

### Fichier de Configuration

Le fichier `nginx.conf` doit être ajouté à la racine du répertoire **djf-frontend** (`./djf-frontend/nginx.conf`).

```nginx
server {
    listen 80;

    # 1. Servir le Frontend React
    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;

        # Gestion du routage SPA (Single Page Application)
        # Redirige toutes les routes inconnues vers index.html pour que React gère l'affichage
        try_files $uri $uri/ /index.html;
    }

    # 2. Rediriger les requêtes API vers Spring Boot (Reverse Proxy)
    location /api {
        # 'app' est le nom du service Spring dans docker-compose
        proxy_pass http://app:8080;

        # Transmission des headers pour que le backend connaisse l'IP réelle du client
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Routes Accessibles pour l'Utilisateur

Grâce à cette configuration, l'utilisateur accède à toute l'application via une seule URL de base (`http://localhost`).

| URL Navigateur | Destination Interne | Description |
| :--- | :--- | :--- |
| `http://localhost/` | **Nginx** -> **React** | Page d'accueil de l'application. |
| `http://localhost/login` | **Nginx** -> **React** | Interface de connexion (gérée par React Router). |
| `http://localhost/register` | **Nginx** -> **React** | Interface d'inscription (gérée par React Router). |
| `http://localhost/api/...` | **Nginx** -> **Spring Boot** | Appels API (invisibles pour l'utilisateur, utilisés par le code React). |

## 4. Contrôleur `UserController` et Gestion des Utilisateurs

Le `UserController` expose les points d'entrée de l'API REST. Il est responsable de l'orchestration entre la base de données, le service de hachage de mot de passe et le service OTP.

### Inscription (Register)
L'inscription est la première étape obligatoire. Elle permet de créer un utilisateur en base de données.

* **Endpoint :** `POST /api/users/register`
* **Format du Numéro :** Le numéro de téléphone doit être saisi au format national standard (commençant par `0` et non `+33`), par exemple : `0635048044`.
* **Sécurité :** Le mot de passe reçu est immédiatement haché via `BCryptPasswordEncoder` avant d'être persisté.
* **Logs :** Un log d'information est généré : "Tentative d'inscription pour l'email : [email]" suivi de "Nouvel utilisateur inscrit avec succès".


### Connexion (Login)
La connexion ne se fait pas directement. Elle redirige systématiquement vers une étape de validation par code (OTP).

* **Endpoint :** `POST /api/users/login`
* **Processus :**
    1.  Vérification de l'existence de l'email en base.
    2.  Vérification de la correspondance du mot de passe haché.
    3.  Si les identifiants sont corrects, l'utilisateur n'est **pas** renvoyé immédiatement.
    4.  Le système génère un code OTP via `OtpService`.
* **Logs (Crucial pour le dev) :** Le code généré est affiché dans la console du serveur pour permettre le test sans téléphone :
  `INFO : OTP généré pour [email] : [123456]`
* **Réponse :** Le serveur renvoie un code HTTP `202 Accepted` avec le statut JSON `OTP_REQUIRED`. Cela indique au Frontend de basculer l'interface vers le formulaire de saisie du code.

### Validation du Code (Verify OTP)
C'est l'étape finale qui authentifie réellement l'utilisateur.

* **Endpoint :** `POST /api/users/verify-otp`
* **Processus :** Vérifie si le code saisi correspond à celui stocké en mémoire cache pour cet email.
* **Logs :** "Utilisateur [email] connecté via OTP".
* **Réponse :** Si le code est valide, le serveur renvoie un code `200 OK` contenant les informations de l'utilisateur.

## 2. Service SMS et Résilience (OtpService)

Le service `OtpService` gère la logique métier liée aux codes à usage unique et la communication avec l'API externe de l'université.

### Gestion du Cache OTP
Les codes ne sont pas stockés en base de données mais dans une mémoire vive (`ConcurrentHashMap`) pour des raisons de performance et de sécurité temporaire.
* **Durée de validité :** 2 minutes.
* **Anti-Spam :** Un utilisateur ne peut pas redemander un code avant un délai de 30 secondes.

### Mécanisme d'Envoi Sécurisé (Ping & Retry)
L'envoi de SMS dépend d'une API externe. Pour éviter de bloquer l'application ou d'envoyer des requêtes inutiles si le serveur distant est hors service, une logique stricte est appliquée :

1.  **Vérification de Santé (Ping) :**
    Avant toute tentative d'envoi, le service effectue une requête `GET` sur l'endpoint `/ping` du serveur SMS.
    * Si le serveur répond `200 OK`, le processus continue.
    * Si le serveur répond une erreur ou ne répond pas, le processus s'arrête immédiatement. Une exception est levée ("Service SMS indisponible"), qui sera transformée en erreur HTTP `503` pour l'utilisateur.

2.  **Tentatives Multiples (Retry Pattern) :**
    Si le Ping réussit mais que l'envoi du message (`POST`) échoue (erreur réseau transitoire), le système effectue une seconde tentative automatique après une pause de 1 seconde.

### Détails Techniques de l'API Externe
L'intégration respecte les spécifications suivantes :
* **URL API :** `http://dosipa.univ-brest.fr/send-sms`
* **Authentification :** Via Header HTTP `x-api-key`.
* **Format JSON :**
    ```json
    {
      "to": "0635048044",
      "message": "Code : 123456"
    }
    ```

## 5. Service de Tests Unitaires

Le fichier `docker-compose.yml` intègre un service dédié nommé `tests`. Ce conteneur éphémère a pour unique responsabilité d'exécuter la suite de tests JUnit/Mockito et de s'arrêter une fois l'opération terminée.

### Configuration Technique

* **Image :** `gradle:8-jdk17-alpine`. Utilisation d'une image officielle légère contenant le JDK et Gradle pré-installés.
* **Commande :** `gradle test --info`. Lance l'ensemble des tests définis dans `src/test/java` et affiche les logs détaillés.

### Configuration dans Docker Compose

```yaml
tests:
  image: gradle:8-jdk17-alpine
  container_name: unit-tests
  # Montage du code source pour tester la version en cours d'édition
  volumes:
    - ./djf:/home/gradle/project
  working_dir: /home/gradle/project
  # Commande d'exécution des tests
  command: gradle test --info
```

Le resultats des tests sont accessibles dans logs via la commande : `docker logs -f spring-app`.

Pour les tester le service separements `docker compose up tests`

## 6. Gestion des Erreurs et Logs

Une attention particulière a été portée à la traçabilité. Chaque action critique génère une trace dans les logs du conteneur Docker.

* **Niveau INFO :** Flux normal (Inscription, Génération OTP avec affichage du code, Connexion réussie).
* **Niveau WARN :** Échecs fonctionnels (Mauvais mot de passe, Code OTP invalide, Ping serveur échoué).
* **Niveau ERROR :** Échecs techniques (Exception Java, Timeout réseau lors de l'envoi SMS après plusieurs tentatives).

Ces logs sont accessibles via la commande : `docker logs -f spring-app`.