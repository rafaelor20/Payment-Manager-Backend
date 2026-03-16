<div align="center">

  <h1>Payment Manager Backend</h1>

  <p>
    <strong>A backend template to practice developing backend APIs with AdonisJS for payment management</strong>
  </p>

  <br>

<a href="#-Requirements">Requirements</a>
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
<a href="#-quick-start">Quick Start</a>
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
<a href="https://adonisjs.com">Documentation</a>

  <br>
  <br>

</div>

---

## ✨ Requirements

### For testing:

  node version manager installed

### For running as in production:

  docker compose installed

### 🔧 Tech Stack

<table>
  <tr>
    <td><strong>Backend</strong></td>
    <td>
      <a href="https://adonisjs.com">AdonisJS 7.x</a> - Full-featured Node.js framework
    </td>
  </tr>
  <tr>
    <td><strong>Database</strong></td>
    <td>
      <a href="https://lucid.adonisjs.com">Lucid ORM</a> - SQL ORM with migrations (SQLite for tests and dev mode, MySQL for production mode)
    </td>
  </tr>
  <tr>
    <td><strong>Auth</strong></td>
    <td>
      API tokens (default) and session-based authentication
    </td>
  </tr>
  <tr>
    <td><strong>Validation</strong></td>
    <td>
      <a href="https://vinejs.dev">VineJS</a> - Type-safe schema validation
    </td>
  </tr>
  <tr>
    <td><strong>Type Safety</strong></td>
    <td>
      <a href="https://tuyau.dev">Tuyau</a> - End-to-end type safety for API calls
    </td>
  </tr>
  <tr>
    <td><strong>Testing</strong></td>
    <td>
      <a href="https://japa.dev">Japa</a> - Delightful testing framework
    </td>
  </tr>
  <tr>
    <td><strong>TypeScript</strong></td>
    <td>
      Full TypeScript support with strict mode enabled
    </td>
  </tr>
</table>

---

## 🚀 Quick Start


### From the Project Root


#### Install dependencies

```bash
# download the node version
nvm install 24
# set in the terminal the node version
nvm use 24

# Install dependencies
npm i
```

#### Running tests



```bash
# To run the tests
npm run test
# (use env.test to modify the tests variables)
```

#### Using development mode

```bash
# Use env.dev to modify the development variables

# Generate application key
npm run generate:dev

# Run database migrations
npm run migrate:dev

# Run the seeders
npm run seed:dev

# Run the gateway container
docker compose up -d gateway

# Run the development server with hot reload
npm run dev
```

Your API will be running at `http://localhost:3333`

#### Using production mode with docker compose
```bash

# create a .env file or use the command to copy .env.example to .env
cp .env.example .env

# start docker containers
docker-compose up -d

# When the containers are ready, generate application key within docker container
docker compose exec app node ace generate:key

# Run database migrations within docker container
docker compose exec app node ace migration:run

# Run the seeders
docker compose exec app node ace db:seed

# stop docker containers
docker-compose down

# stop and remove all docker containers, images and volumes
docker-compose down --rmi all --volumes

```

Your API will be running at `http://localhost:3333`

### Available Endpoints
[ROUTES.md](ROUTES.md)

```bash
# Check the routes
node ace list:routes
```


### Useful Commands

```bash


# Type check
npm run typecheck

# Lint your code
npm run lint

# Build for production
npm run build

# Start production server
npm start

```

### Postman Collection

#### use the "payment manager backend.postman_collection.json" to easily create a transaction

### To do

#### Implement update routes for users, products and clients
#### Implement charge back route
#### Implement openapi
#### Implement idempotence
#### Check for business rules
