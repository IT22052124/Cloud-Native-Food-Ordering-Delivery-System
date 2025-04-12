# Order Service API Documentation

The Order Service manages the customer ordering process, from shopping cart to order placement and tracking in the food delivery platform. The cart system allows items from only one restaurant at a time.

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
      "itemPrice": 9.99,
      "totalPrice": 19.98
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

Adds a new item to the cart or increases quantity if already exists. Note: Only items from one restaurant can be in the cart at a time.

- **URL**: `/cart`
- **Method**: `POST`
- **Auth required**: Yes
- **Request body**:

```json
{
  "itemId": "menu_item_id",
  "restaurantId": "restaurant_id",
  "quantity": 1,
  "itemPrice": 9.99
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
    "itemPrice": 9.99,
    "totalPrice": 9.99
  }
}
```

- **Error Response (400)** - When trying to add items from a different restaurant:

```json
{
  "status": 400,
  "message": "Cannot add items from different restaurants. Please clear your cart first."
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
    "quantity": 3,
    "itemPrice": 9.99,
    "totalPrice": 29.97
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

#### Create Order

Creates an order from the current cart items.

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
    "country": "USA",
    "coordinates": {
      "lat": 37.7749,
      "lng": -122.4194
    }
  },
  "paymentMethod": "CARD",
  "paymentDetails": {
    "cardId": "saved_card_id"
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
    "restaurantOrder": {
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
      "subtotal": 19.98,
      "tax": 1.6,
      "deliveryFee": 2.99,
      "status": "PLACED",
      "statusHistory": [
        {
          "status": "PLACED",
          "timestamp": "2023-01-01T12:00:00Z",
          "updatedBy": "user_id"
        }
      ]
    },
    "deliveryAddress": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zipCode": "12345",
      "country": "USA",
      "coordinates": {
        "lat": 37.7749,
        "lng": -122.4194
      }
    },
    "totalAmount": 24.57,
    "paymentMethod": "CARD",
    "paymentStatus": "PENDING",
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
    "restaurantOrder": {...},
    "deliveryAddress": {...},
    "deliveryPerson": {
      "name": "Driver Name",
      "phone": "+1234567890",
      "vehicleDetails": "Blue Honda Civic",
      "vehicleNumber": "ABC123",
      "rating": 4.8,
      "profileImage": "profile_image_url"
    },
    "estimatedDeliveryTime": "2023-01-01T13:00:00Z",
    "paymentMethod": "CARD",
    "paymentStatus": "PENDING",
    "totalAmount": 24.57,
    "createdAt": "2023-01-01T12:00:00Z",
    "status": "PLACED",
    "estimatedDeliveryTime": "2023-01-01T12:45:00Z"
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
      "totalAmount": 24.57,
      "status": "PLACED",
      "restaurant": "Restaurant Name",
      "totalItems": 2,
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
      "status": "PLACED",
      "items": [...],
      "subtotal": 19.98,
      "tax": 1.60,
      "deliveryFee": 2.99,
      "estimatedReadyTime": null
    },
    ...
  ]
}
```

#### Update Order Status

Updates the status of an order.

- **URL**: `/orders/:id/status`
- **Method**: `PATCH`
- **Auth required**: Yes (restaurant role)
- **URL Parameters**: `id=[string]` - Order ID
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
  "order": {
    "orderId": "ORD-230101-1234",
    "status": "CONFIRMED",
    "statusHistory": [...],
    "estimatedReadyTime": "2023-01-01T12:25:00Z"
  }
}
```

#### Assign Delivery Person

Assigns a delivery person to an order.

- **URL**: `/orders/:id/delivery-person`
- **Method**: `PATCH`
- **Auth required**: Yes (admin or delivery_service role)
- **URL Parameters**: `id=[string]` - Order ID
- **Request body**:

```json
{
  "deliveryPersonId": "delivery_person_id",
  "name": "John Driver",
  "phone": "+1234567890",
  "vehicleDetails": "Blue Honda Civic",
  "vehicleNumber": "ABC123",
  "rating": 4.8,
  "profileImage": "profile_image_url"
}
```

- **Response (200)**:

```json
{
  "status": 200,
  "message": "Delivery person assigned successfully",
  "order": {
    "orderId": "ORD-230101-1234",
    "deliveryPerson": {
      "id": "delivery_person_id",
      "name": "John Driver",
      "phone": "+1234567890",
      "vehicleDetails": "Blue Honda Civic",
      "vehicleNumber": "ABC123",
      "rating": 4.8,
      "profileImage": "profile_image_url",
      "assignedAt": "2023-01-01T12:30:00Z"
    },
    "estimatedDeliveryTime": "2023-01-01T13:00:00Z"
  }
}
```

#### Update Delivery Location

Updates the current location of the delivery person.

- **URL**: `/orders/:id/delivery-location`
- **Method**: `PATCH`
- **Auth required**: Yes (delivery role)
- **URL Parameters**: `id=[string]` - Order ID
- **Request body**:

```json
{
  "lat": 37.7749,
  "lng": -122.4194
}
```

- **Response (200)**:

```json
{
  "status": 200,
  "message": "Delivery location updated successfully"
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
      "restaurant": "Restaurant Name",
      "itemCount": 2,
      "totalAmount": 24.57,
      "type": "DELIVERY",
      "paymentStatus": "PENDING"
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

Orders can have the following status values:

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
