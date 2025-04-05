# Order Service API Documentation

The Order Service manages the customer ordering process, from shopping cart to order placement and tracking in the food delivery platform. This service now supports multi-restaurant orders, allowing customers to place a single order from multiple restaurants.

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
      "description": "Item description",
      "specialInstructions": "Extra spicy",
      "options": [
        {
          "name": "Size",
          "value": "Large",
          "price": 2.0
        }
      ],
      "itemPrice": 9.99,
      "totalPrice": 23.98
    }
  ],
  "restaurants": [
    {
      "id": "restaurant_id",
      "name": "Restaurant Name",
      "image": "restaurant_image_url"
    }
  ],
  "totalItems": 1,
  "totalAmount": 23.98
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
  "quantity": 1,
  "specialInstructions": "Extra spicy",
  "options": [
    {
      "name": "Size",
      "value": "Large",
      "price": 2.0
    }
  ]
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
    "quantity": 1,
    "specialInstructions": "Extra spicy",
    "options": [
      {
        "name": "Size",
        "value": "Large",
        "price": 2.0
      }
    ],
    "itemPrice": 9.99,
    "totalPrice": 11.99
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
  "quantity": 3,
  "specialInstructions": "Medium spicy",
  "options": [
    {
      "name": "Size",
      "value": "Medium",
      "price": 1.0
    }
  ]
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
    "quantity": 3,
    "specialInstructions": "Medium spicy",
    "options": [
      {
        "name": "Size",
        "value": "Medium",
        "price": 1.0
      }
    ],
    "itemPrice": 9.99,
    "totalPrice": 32.97
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
      "quantity": 2,
      "specialInstructions": "No onions"
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

#### Create Order

Creates an order from the current cart items, supporting multiple restaurants.

- **URL**: `/orders`
- **Method**: `POST`
- **Auth required**: Yes
- **Request body**:

```json
{
  "type": "DELIVERY",
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345",
    "country": "USA"
  },
  "paymentMethod": "CARD",
  "paymentStatus": "PENDING",
  "paymentDetails": {
    "cardId": "saved_card_id"
  },
  "restaurantInstructions": {
    "restaurant_id_1": "Extra napkins please",
    "restaurant_id_2": "Ring doorbell on arrival"
  }
}
```

- **Response (201)**:

```json
{
  "status": 201,
  "message": "Order placed successfully",
  "order": {
    "orderId": "ORD-230101-1234",
    "customerId": "user_id",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+1234567890",
    "type": "DELIVERY",
    "restaurantOrders": [
      {
        "restaurantId": "restaurant_id_1",
        "restaurantName": "Restaurant One",
        "items": [
          {
            "itemId": "menu_item_id",
            "name": "Item Name",
            "price": 9.99,
            "quantity": 2,
            "specialInstructions": "Extra spicy"
          }
        ],
        "subtotal": 19.98,
        "tax": 1.60,
        "deliveryFee": 2.99,
        "status": "PLACED",
        "statusHistory": [
          {
            "status": "PLACED",
            "timestamp": "2023-01-01T12:00:00Z",
            "updatedBy": "user_id",
            "notes": "Order placed by customer"
          }
        ],
        "specialInstructions": "Extra napkins please"
      },
      {
        "restaurantId": "restaurant_id_2",
        "restaurantName": "Restaurant Two",
        "items": [...],
        "subtotal": 15.99,
        "tax": 1.28,
        "deliveryFee": 2.99,
        "status": "PLACED",
        "statusHistory": [...],
        "specialInstructions": "Ring doorbell on arrival"
      }
    ],
    "deliveryAddress": {...},
    "paymentMethod": "CARD",
    "paymentStatus": "PENDING",
    "paymentDetails": {...},
    "totalAmount": 44.83,
    "createdAt": "2023-01-01T12:00:00Z"
  }
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
  "order": {
    "orderId": "ORD-230101-1234",
    "customerId": "user_id",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+1234567890",
    "type": "DELIVERY",
    "restaurantOrders": [...],
    "deliveryAddress": {...},
    "paymentMethod": "CARD",
    "paymentStatus": "PENDING",
    "totalAmount": 44.83,
    "createdAt": "2023-01-01T12:00:00Z"
  }
}
```

_Note: For restaurant users, only their part of the order is returned._

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
  "orders": [
    {
      "orderId": "ORD-230101-1234",
      "createdAt": "2023-01-01T12:00:00Z",
      "totalAmount": 44.83,
      "status": "PROCESSING",
      "restaurants": ["Restaurant One", "Restaurant Two"],
      "totalItems": 5,
      "type": "DELIVERY"
    },
    ...
  ]
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
  "orders": [
    {
      "orderId": "ORD-230101-1234",
      "createdAt": "2023-01-01T12:00:00Z",
      "customerName": "John Doe",
      "customerPhone": "+1234567890",
      "type": "DELIVERY",
      "deliveryAddress": {...},
      "paymentMethod": "CARD",
      "status": "PLACED",
      "items": [...],
      "subtotal": 19.98,
      "tax": 1.60,
      "deliveryFee": 2.99,
      "total": 24.57,
      "specialInstructions": "Extra napkins please"
    },
    ...
  ]
}
```

#### Update Restaurant Order Status

Updates the status of a specific restaurant's part of an order.

- **URL**: `/orders/:id/restaurant/:restaurantId/status`
- **Method**: `PATCH`
- **Auth required**: Yes (restaurant role)
- **URL Parameters**:
  - `id=[string]` - Order ID
  - `restaurantId=[string]` - Restaurant ID
- **Request body**:

```json
{
  "status": "CONFIRMED",
  "notes": "We'll prepare your order right away",
  "estimatedReadyMinutes": 25
}
```

- **Response (200)**:

```json
{
  "status": 200,
  "message": "Order status updated successfully",
  "restaurantOrder": {
    "restaurantId": "restaurant_id",
    "restaurantName": "Restaurant Name",
    "status": "CONFIRMED",
    "statusHistory": [...],
    "estimatedReadyTime": "2023-01-01T12:25:00Z",
    ...
  }
}
```

#### Update Order Status (Admin)

Updates the status of all restaurant orders at once (admin only).

- **URL**: `/orders/:id/status`
- **Method**: `PATCH`
- **Auth required**: Yes (admin role)
- **URL Parameters**: `id=[string]` - Order ID
- **Request body**:

```json
{
  "status": "CONFIRMED",
  "notes": "Updating all restaurants' status"
}
```

- **Response (200)**:

```json
{
  "status": 200,
  "message": "Order status updated successfully for all restaurants",
  "order": {...}
}
```

#### Get All Orders (Admin)

Retrieves all orders with filtering options (admin only).

- **URL**: `/orders/admin/all`
- **Method**: `GET`
- **Auth required**: Yes (admin role)
- **Query Parameters**:
  - `status=[string]` - Filter by order status
  - `startDate=[date]` - Filter orders placed after this date
  - `endDate=[date]` - Filter orders placed before this date
  - `restaurant=[string]` - Filter by restaurant ID
- **Response (200)**:

```json
{
  "status": 200,
  "count": 5,
  "orders": [
    {
      "orderId": "ORD-230101-1234",
      "createdAt": "2023-01-01T12:00:00Z",
      "customerName": "John Doe",
      "restaurantCount": 2,
      "statuses": ["CONFIRMED", "PREPARING"],
      "itemCount": 5,
      "totalAmount": 44.83,
      "type": "DELIVERY",
      "paymentStatus": "PAID"
    },
    ...
  ]
}
```

#### Delete Order

Deletes an order (only allowed for placed orders or if admin).

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

Restaurant orders can have the following status values:

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
