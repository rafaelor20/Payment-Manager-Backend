# API Route Documentation

This document provides a detailed overview of all the available API routes in the Payment Manager Backend.

## Base URL

All API routes are prefixed with `/api/v1`.

---

## Health Check

| Method | Path | Description                     | Authentication |
| :----- | :--- | :------------------------------ | :------------- |
| `GET`  | `/`  | A simple health check endpoint. | None           |

---

## Authentication (`/auth`)

| Method | Path           | Description                                       | Authentication |
| :----- | :------------- | :------------------------------------------------ | :------------- |
| `POST` | `/auth/signup` | Creates a new user account.                       | None           |
| `POST` | `/auth/login`  | Authenticates a user and returns an access token. | None           |
| `POST` | `/auth/logout` | Logs out the currently authenticated user.        | Required       |

#### `POST /auth/signup`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123!",
  "passwordConfirmation": "securePassword123!",
  "role": "USER"
}
```
*Note: `fullName` can be null. `password` must be between 8 and 32 characters. `role` must be one of `ADMIN`, `MANAGER`, `FINANCE`, or `USER`.*

**Response (201 Created):**
```json
{
    "data": {
        "token": "oat_MQ.YU9NOUsxVFBsWVZ0Yi1BSHUwTHpBaTFpb1plajU4QkUxaFQwMFBSSTMyNjc5OTA0NDI",
        "user": {
            "fullName": "John Doe",
            "email": "john.doe@example.com",
            "role": "USER"
        }
    }
}
```

---

#### `POST /auth/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123!",
}
```
*Note: `fullName` can be null. `password` must be between 8 and 32 characters. `role` must be one of `ADMIN`, `MANAGER`, `FINANCE`, or `USER`.*

**Response (201 Created):**
```json
{
    "data": {
        "token": "oat_MQ.YU9NOUsxVFBsWVZ0Yi1BSHUwTHpBaTFpb1plajU4QkUxaFQwMFBSSTMyNjc5OTA0NDI",
        "user": {
            "fullName": "John Doe",
            "email": "john.doe@example.com",
            "role": "USER"
        }
    }
}
```

---

## Account (`/account`)

| Method | Path               | Description                                                | Authentication |
| :----- | :----------------- | :--------------------------------------------------------- | :------------- |
| `GET`  | `/account/profile` | Retrieves the profile of the currently authenticated user. | Required       |

---

## Users (`/users`)

| Method   | Path         | Description                 | Authentication | Roles |
| :------- | :----------- | :-------------------------- | :------------- | :---- |
| `POST`   | `/users`     | Creates a new user.         | Required       | -     |
| `DELETE` | `/users/:id` | Deletes a user by their ID. | Required       | -     |

---

## Products (`/products`)

| Method | Path        | Description                       | Authentication | Roles                         |
| :----- | :---------- | :-------------------------------- | :------------- | :---------------------------- |
| `GET`  | `/products` | Retrieves a list of all products. | None           | -                             |
| `POST` | `/products` | Creates a new product.            | Required       | `ADMIN`, `MANAGER`, `FINANCE` |

---

## Gateways (`/gateways`)

| Method  | Path                        | Description                                | Authentication | Roles              |
| :------ | :-------------------------- | :----------------------------------------- | :------------- | :----------------- |
| `PATCH` | `/gateways/switch-priority` | Switches the priority of payment gateways. | Required       | `ADMIN`, `FINANCE` |
| `PATCH` | `/gateways/:id/status`      | Updates the status of a specific gateway.  | Required       | `ADMIN`, `FINANCE` |

---

## Clients (`/clients`)

| Method | Path           | Description                              | Authentication | Roles              |
| :----- | :------------- | :--------------------------------------- | :------------- | :----------------- |
| `GET`  | `/clients`     | Retrieves a list of clients.             | Required       | `ADMIN`, `MANAGER` |
| `GET`  | `/clients/:id` | Retrieves a specific client by their ID. | Required       | `ADMIN`, `MANAGER` |

---

## Transactions (`/transactions`)

| Method | Path                | Description                                 | Authentication | Roles              |
| :----- | :------------------ | :------------------------------------------ | :------------- | :----------------- |
| `POST` | `/transactions`     | Creates a new transaction.                  | None           | -                  |
| `GET`  | `/transactions`     | Retrieves a list of all transactions.       | Required       | `ADMIN`, `FINANCE` |
| `GET`  | `/transactions/:id` | Retrieves a specific transaction by its ID. | Required       | `ADMIN`, `FINANCE` |

#### `POST /transactions`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "cardNumber": "1234567812345678",
  "cvv": "123",
  "products": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```
*Note: `cardNumber` must be exactly 16 characters. `cvv` must be exactly 3 characters. `productId` and `quantity` must be positive numbers.*

**Response (201 Created):**
```json
{
  "data": {
    "id": 1,
    "clientId": 1,
    "gatewayId": 1,
    "externalId": "ext_987654321",
    "status": "approved",
    "cardLastNumbers": "5678",
      "name": "John Doe",
      "email": "john.doe@example.com",
    "products": []
  }
}
```

---

## Authentication & Authorization

### Authentication

Routes marked with `Required` for authentication need a valid `Authorization: Bearer <token>` header to be included in the request. You can obtain a token from the `/api/v1/auth/login` endpoint.

### Authorization (Roles)

Some routes require the authenticated user to have specific roles. If roles are listed for an endpoint, the user's role will be checked before the request is processed.

The available roles are:
- `ADMIN`
- `MANAGER`
- `FINANCE`