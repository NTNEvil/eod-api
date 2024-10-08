# EOD API Project

This is a Node.js API that manages user authentication, profiles, inventory, store, and more, using JWT for authentication and Express as the server framework.

## Features

- User authentication with JWT
- Protected routes for managing user profiles and inventory
- Game logic implementation, such as adding status, using items, and store purchases
- Use of middlewares like CORS and Express JSON

## Technologies Used

- Node.js
- Express
- JSON Web Token (JWT)
- Cors
- Dotenv

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/NTNEvil/eod-api.git
    ```

2. Navigate to the project directory:
    ```bash
    cd your-repo
    ```

3. Install the dependencies:
    ```bash
    npm install
    ```

4. Set up environment variables by creating a `.env` file in the project root and define the `SECRET` variable:
    ```env
    SECRET=your-secret-key
    ```

## Usage

1. Start the server:
    ```bash
    npm start
    ```

2. Access the API at `http://localhost:3000`

## API Reference

### User login

```http
  POST /api/login
```

| Parameter  | Type     | Description   |
| :--------- | :------- | :------------ |
| `username` | `string` | User name      |
| `password` | `string` | User password  |

### Get user profile

```http
  GET /api/profile
```

| Header            | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `x-access-token`  | `string` | JWT token for authentication |

### Get user money

```http
  GET /api/profile/money
```

| Header            | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `x-access-token`  | `string` | JWT token for authentication |

### Add money to user profile

```http
  POST /api/profile/money/add
```

| Header            | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `x-access-token`  | `string` | JWT token for authentication |

| Body Parameter    | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `money`           | `number` | Amount to be added to user's balance |

### Get user status

```http
  GET /api/profile/status
```

| Header            | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `x-access-token`  | `string` | JWT token for authentication |

### Update user HP

```http
  POST /api/profile/status/hp
```

| Header            | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `x-access-token`  | `string` | JWT token for authentication |

| Body Parameter    | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `hp`              | `number` | Health points (HP) to be updated |

### Take damage

```http
  POST /api/profile/status/takedamage
```

| Header            | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `x-access-token`  | `string` | JWT token for authentication |

| Body Parameter    | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `damage`          | `number` | Damage to be applied to the user |

### Add status

```http
  POST /api/profile/status/:att/add
```

| Header            | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `x-access-token`  | `string` | JWT token for authentication |

### Get all users (tavern)

```http
  GET /api/tavern
```

This endpoint does not require authentication.

### Get inventory

```http
  GET /api/inventory
```

| Header            | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `x-access-token`  | `string` | JWT token for authentication |

### Get inventory item

```http
  GET /api/inventory/:invId
```

| Header            | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `x-access-token`  | `string` | JWT token for authentication |

| URL Parameter     | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `invId`           | `string` | ID of the inventory item to be retrieved |

### Equip item

```http
  POST /api/inventory/equip
```

| Header            | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `x-access-token`  | `string` | JWT token for authentication |

| Body Parameter    | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `inv_id`          | `string` | ID of the item to be equipped   |

### Unequip item

```http
  POST /api/inventory/unequip
```

| Header            | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `x-access-token`  | `string` | JWT token for authentication |

| Body Parameter    | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `inv_id`          | `string` | ID of the item to be unequipped|

### Use item from inventory

```http
  POST /api/inventory/:id/use
```

| Header            | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `x-access-token`  | `string` | JWT token for authentication |

| URL Parameter     | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `id`              | `string` | ID of the item to be used      |

### Get store items

```http
  GET /api/store
```

This endpoint does not require authentication.

### Buy item from store

```http
  POST /api/store/:itemid/buy
```

| Header            | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `x-access-token`  | `string` | JWT token for authentication |

| URL Parameter     | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `itemid`          | `string` | ID of the item to be purchased   |

### Play roulette

```http
  POST /api/roulette
```

| Header            | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `x-access-token`  | `string` | JWT token for authentication |

| Body Parameter    | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `item_id`         | `string` | ID of the item to be used in the roulette  |

### Perform TCT action

```http
  POST /api/tct
```

| Header            | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `x-access-token`  | `string` | JWT token for authentication |

| Body Parameter    | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `points`          | `number` | Points to be used in the TCT action |

### Default route

```http
  GET /
```

This endpoint does not require authentication and simply returns a "Working!" message.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
