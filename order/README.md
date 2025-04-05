# Order Service API Documentation

The Order Service manages the customer ordering process, from shopping cart to order placement and tracking in the food delivery platform.


## Authentication

All API endpoints require authentication using JWT tokens. Include the token in:

- Authorization header: `Bearer <token>`
- or as an HTTP-only cookie (recommended)

## Error Responses

All endpoints return standardized error responses:

```json
{
  "status": 400-500,
  "message": "Error description"
}
```

## Endpoints

### Cart Management

#### Get Cart Items

Retrieves all items in the customer's cart with restaurant and item details.

- **URL**: `/cart`
- **Method**: `GET`
- **Auth required**: Yes
- **Response (200)**:

```json
{
  "status": 200,
  "cartItems": [
    {
      "_id": "cart_item_id",
      "itemId": "menu_item_id",
      "restaurantId": "restaurant_id",
      "quantity": 2,
      "name": "Item Name",
      "price": 9.99,
      "image": "image_url",
      "description": "Item description"
    }
  ],
  "restaurant": {
    "id": "restaurant_id",
    "name": "Restaurant Name",
    "image": "restaurant_image_url"
  },
  "totalItems": 1,
  "totalAmount": 19.98
}
```

#### Add Item to Cart

Adds a new item to the cart or increases quantity if already exists.

- **URL**: `/cart`
- **Method**: `POST`
- **Auth required**: Yes
- **Request body**:

```json
{
  "itemId": "menu_item_id",
  "restaurantId": "restaurant_id",
  "quantity": 1
}
```

- **Response (201)**:

```json
{
  "status": 201,
  "message": "Item added to cart",
  "cartItem": {
    "_id": "cart_item_id",
    "itemId": "menu_item_id",
    "restaurantId": "restaurant_id",
    "quantity": 1
  }
}
```

#### Update Cart Item Quantity

Updates the quantity of an item in the cart.

- **URL**: `/cart/:id`
- **Method**: `PUT`
- **Auth required**: Yes
- **URL Parameters**: `id=[string]` - Cart item ID
- **Request body**:

```json
{
  "quantity": 3
}
```

- **Response (200)**:

```json
{
  "status": 200,
  "message": "Cart item updated",
  "cartItem": {
    "_id": "cart_item_id",
    "itemId": "menu_item_id",
    "restaurantId": "restaurant_id",
    "quantity": 3
  }
}
```

#### Delete Cart Item

Removes an item from the cart.

- **URL**: `/cart/:id`
- **Method**: `DELETE`
- **Auth required**: Yes
- **URL Parameters**: `id=[string]` - Cart item ID
- **Response (200)**:

```json
{
  "status": 200,
  "message": "Cart item removed"
}
```

#### Reset Cart

Clears all items from the cart.

- **URL**: `/cart/reset`
- **Method**: `POST`
- **Auth required**: Yes
- **Response (200)**:

```json
{
  "status": 200,
  "message": "Cart cleared successfully",
  "count": 5
}
```

#### Bulk Update Cart Items

Updates multiple cart items at once (for order review page).

- **URL**: `/cart/bulk-update`
- **Method**: `POST`
- **Auth required**: Yes
- **Request body**:

```json
{
  "items": [
    {
      "id": "cart_item_id_1",
      "quantity": 2
    },
    {
      "id": "cart_item_id_2",
      "quantity": 1
    },
    {
      "id": "cart_item_id_3",
      "quantity": 0
    }
  ]
}
```

- **Response (200)**:

```json
{
  "status": 200,
  "message": "Cart items updated successfully",
  "updatedCount": 3,
  "cartItems": [...]
}
```

_Note: Items with quantity 0 will be removed from the cart._

### Order Management

#### Get Cart Review

Creates a review of the cart contents without creating an order.

- **URL**: `/orders/cart-review`
- **Method**: `GET`
- **Auth required**: Yes
- **Response (200)**:

```json
{
  "status": 200,
  "message": "Cart review created successfully",
  "orderSummary": {
    "customerId": "user_id",
    "restaurantId": "restaurant_id",
    "restaurantName": "Restaurant Name",
    "items": [
      {
        "itemId": "menu_item_id",
        "name": "Item Name",
        "price": 9.99,
        "quantity": 2
      }
    ],
    "totalAmount": 19.98,
    "deliveryAddress": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zipCode": "12345",
      "country": "USA"
    },
    "paymentMethod": "CARD"
  },
  "cartItems": [...]
}
```

#### Create Draft Order

Creates a draft order (INIT status) from the current cart items.

- **URL**: `/orders/draft`
- **Method**: `POST`
- **Auth required**: Yes
- **Request body**:

```json
{
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345",
    "country": "USA"
  },
  "paymentMethod": "CARD",
  "specialInstructions": "Leave at door"
}
```

- **Response (201)**:

```json
{
  "status": 201,
  "message": "Draft order created successfully",
  "order": {
    "_id": "order_id",
    "customerId": "user_id",
    "restaurantId": "restaurant_id",
    "restaurantName": "Restaurant Name",
    "items": [...],
    "totalAmount": 19.98,
    "deliveryAddress": {...},
    "paymentMethod": "CARD",
    "paymentStatus": "PENDING",
    "status": "INIT",
    "specialInstructions": "Leave at door",
    "statusHistory": [...]
  }
}
```

#### Get User's Draft Orders

Retrieves all draft orders (INIT status) for the authenticated user.

- **URL**: `/orders/draft`
- **Method**: `GET`
- **Auth required**: Yes
- **Response (200)**:

```json
{
  "status": 200,
  "count": 2,
  "orders": [...]
}
```

#### Update Draft Order

Updates a draft order before placing it.

- **URL**: `/orders/draft/:id`
- **Method**: `PUT`
- **Auth required**: Yes
- **URL Parameters**: `id=[string]` - Order ID
- **Request body**:

```json
{
  "deliveryAddress": {
    "street": "456 New St",
    "city": "Othertown",
    "state": "NY",
    "zipCode": "54321",
    "country": "USA"
  },
  "paymentMethod": "CASH",
  "specialInstructions": "Call when arriving",
  "items": [
    {
      "itemId": "menu_item_id",
      "name": "Item Name",
      "price": 9.99,
      "quantity": 3
    }
  ]
}
```

- **Response (200)**:

```json
{
  "status": 200,
  "message": "Draft order updated successfully",
  "order": {...}
}
```

#### Place Order

Converts a draft order (INIT status) to a placed order (PLACED status).

- **URL**: `/orders/draft/:id/place`
- **Method**: `POST`
- **Auth required**: Yes
- **URL Parameters**: `id=[string]` - Order ID
- **Request body**:

```json
{
  "deliveryAddress": {...},
  "paymentMethod": "CARD",
  "specialInstructions": "Ring doorbell"
}
```

- **Response (200)**:

```json
{
  "status": 200,
  "message": "Order placed successfully",
  "order": {
    "_id": "order_id",
    "status": "PLACED",
    "statusHistory": [...],
    ...
  }
}
```

#### Create Order (Direct)

Creates and places an order directly (legacy endpoint).

- **URL**: `/orders`
- **Method**: `POST`
- **Auth required**: Yes
- **Request body**:

```json
{
  "deliveryAddress": {...},
  "paymentMethod": "CASH",
  "specialInstructions": "Contactless delivery"
}
```

- **Response (201)**:

```json
{
  "status": 201,
  "message": "Order placed successfully",
  "order": {...}
}
```

#### Get Order By ID

Retrieves a specific order by ID.

- **URL**: `/orders/:id`
- **Method**: `GET`
- **Auth required**: Yes
- **URL Parameters**: `id=[string]` - Order ID
- **Response (200)**:

```json
{
  "status": 200,
  "order": {...}
}
```

#### Get User Orders

Retrieves all orders for the authenticated user.

- **URL**: `/orders`
- **Method**: `GET`
- **Auth required**: Yes
- **Query Parameters**:
  - `status=[string]` - Filter by order status
  - `page=[number]` - Page number (default: 1)
  - `limit=[number]` - Items per page (default: 10)
- **Response (200)**:

```json
{
  "status": 200,
  "count": 5,
  "total": 12,
  "page": 1,
  "pages": 2,
  "orders": [...]
}
```

#### Get Restaurant Orders

Retrieves all orders for the authenticated restaurant.

- **URL**: `/orders/restaurant`
- **Method**: `GET`
- **Auth required**: Yes (restaurant role)
- **Query Parameters**:
  - `status=[string]` - Filter by order status
  - `page=[number]` - Page number (default: 1)
  - `limit=[number]` - Items per page (default: 10)
- **Response (200)**:

```json
{
  "status": 200,
  "count": 8,
  "total": 25,
  "page": 1,
  "pages": 3,
  "orders": [...]
}
```

#### Update Order Status

Updates the status of an order.

- **URL**: `/orders/:id/status`
- **Method**: `PATCH`
- **Auth required**: Yes (restaurant or admin role)
- **URL Parameters**: `id=[string]` - Order ID
- **Request body**:

```json
{
  "status": "CONFIRMED"
}
```

- **Response (200)**:

```json
{
  "status": 200,
  "message": "Order status updated successfully",
  "order": {...}
}
```

#### Delete Order

Deletes an order (only allowed for draft orders or completed/cancelled orders).

- **URL**: `/orders/:id`
- **Method**: `DELETE`
- **Auth required**: Yes (customer or admin role)
- **URL Parameters**: `id=[string]` - Order ID
- **Response (200)**:

```json
{
  "status": 200,
  "message": "Order deleted successfully"
}
```

## Order Status Values

Orders can have the following status values:

- `INIT` - Draft order, not yet placed
- `PLACED` - Order has been placed by customer
- `CONFIRMED` - Order has been confirmed by restaurant
- `PREPARING` - Restaurant is preparing the order
- `READY_FOR_PICKUP` - Order is ready for pickup/delivery
- `OUT_FOR_DELIVERY` - Order is being delivered
- `DELIVERED` - Order has been delivered
- `CANCELLED` - Order has been cancelled

## Payment Methods

Supported payment methods include:

- `CASH` - Cash on delivery
- `CARD` - Credit/debit card
- `WALLET` - Digital wallet

## Payment Status Values

Orders can have the following payment status values:

- `PENDING` - Payment not yet processed
- `PAID` - Payment has been processed
- `FAILED` - Payment failed
- `REFUND_INITIATED` - Refund has been initiated
- `REFUNDED` - Refund has been processed
