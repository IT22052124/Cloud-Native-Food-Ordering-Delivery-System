# Authentication Service API Documentation

## Base URL

`/api/auth` & `/api/users`

## Authentication Endpoints

### Register User

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Access**: Public
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "email": "string (required)",
    "password": "string (required)",
    "name": "string (required)",
    "phone": "string (required)",
    "role": "string (optional, default: 'customer')",
    "nic": "string (required for restaurant and delivery roles)",
    "nicImage": "string (required for restaurant and delivery roles)"
  }
  ```
- **Response**:
  - Success (201):
    ```json
    {
      "success": true,
      "message": "User registered successfully",
      "token": "string",
      "refreshToken": "string",
      "user": {
        // User object without password and refreshToken
      }
    }
    ```
  - Error (400/500):
    ```json
    {
      "success": false,
      "message": "Error message",
      "error": "Detailed error (if available)"
    }
    ```
- **Notes**:
  - Restaurant and delivery users will be set to `pending_approval` status
  - Admin approval required for restaurant and delivery users

### Login

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Access**: Public
- **Description**: Authenticate user and get tokens
- **Request Body**:
  ```json
  {
    "email": "string (required)",
    "password": "string (required)"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Login successful",
      "token": "string",
      "refreshToken": "string",
      "user": {
        // User object without password and refreshToken
      }
    }
    ```
  - Error (400/401/500):
    ```json
    {
      "success": false,
      "message": "Error message",
      "error": "Detailed error (if available)"
    }
    ```

### Refresh Token

- **URL**: `/api/auth/refresh-token`
- **Method**: `POST`
- **Access**: Public (with refresh token)
- **Description**: Get new access token using refresh token
- **Request Body**:
  ```json
  {
    "refreshToken": "string (required)"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "token": "string",
      "refreshToken": "string"
    }
    ```
  - Error (401/403/500):
    ```json
    {
      "success": false,
      "message": "Error message"
    }
    ```

### Forgot Password

- **URL**: `/api/auth/forgot-password`
- **Method**: `POST`
- **Access**: Public
- **Description**: Request password reset
- **Request Body**:
  ```json
  {
    "email": "string (required)"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Password reset instructions sent to email"
    }
    ```
  - Error (404/500):
    ```json
    {
      "success": false,
      "message": "Error message"
    }
    ```

### Reset Password

- **URL**: `/api/auth/reset-password/:token`
- **Method**: `POST`
- **Access**: Public (with reset token)
- **Description**: Reset password using token
- **URL Parameters**:
  - `token`: Password reset token
- **Request Body**:
  ```json
  {
    "password": "string (required)"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Password reset successful"
    }
    ```
  - Error (400/404/500):
    ```json
    {
      "success": false,
      "message": "Error message"
    }
    ```

### Validate Token

- **URL**: `/api/auth/validate-token`
- **Method**: `GET`
- **Access**: Internal Service Use
- **Description**: Validate JWT token (for internal service communication)
- **Headers**:
  - `Authorization`: Bearer [token]
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "user": {
        "id": "string",
        "role": "string"
      }
    }
    ```
  - Error (401/500):
    ```json
    {
      "success": false,
      "message": "Error message"
    }
    ```

### Logout

- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Access**: Private (requires authentication)
- **Description**: Logout user and invalidate refresh token
- **Headers**:
  - `Authorization`: Bearer [token]
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Logged out successfully"
    }
    ```
  - Error (401/500):
    ```json
    {
      "success": false,
      "message": "Error message"
    }
    ```

### Get Current User

- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Access**: Private (requires authentication)
- **Description**: Get current user profile
- **Headers**:
  - `Authorization`: Bearer [token]
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "user": {
        // User object without password and refreshToken
      }
    }
    ```
  - Error (401/500):
    ```json
    {
      "success": false,
      "message": "Error message"
    }
    ```

## User Management Endpoints

### Get Current User (Alternative Route)

- **URL**: `/api/users/me`
- **Method**: `GET`
- **Access**: Private (requires authentication)
- **Description**: Get current user profile
- **Headers**:
  - `Authorization`: Bearer [token]
- **Response**: Same as `/api/auth/me`

### Update Profile

- **URL**: `/api/users/me`
- **Method**: `PATCH`
- **Access**: Private (requires authentication)
- **Description**: Update user profile
- **Headers**:
  - `Authorization`: Bearer [token]
- **Request Body** (fields vary by role):
  ```json
  {
    "name": "string (optional)",
    "phone": "string (optional)",
    "profilePicture": "string (optional)",
    "vehiclePlate": "string (optional, delivery only)"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Profile updated successfully",
      "user": {
        // Updated user object
      }
    }
    ```
  - Error (401/404/500):
    ```json
    {
      "success": false,
      "message": "Error message",
      "error": "Detailed error (if available)"
    }
    ```

### Change Password

- **URL**: `/api/users/me/password`
- **Method**: `PUT`
- **Access**: Private (requires authentication)
- **Description**: Change user password
- **Headers**:
  - `Authorization`: Bearer [token]
- **Request Body**:
  ```json
  {
    "currentPassword": "string (required)",
    "newPassword": "string (required)"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Password updated successfully"
    }
    ```
  - Error (400/401/500):
    ```json
    {
      "success": false,
      "message": "Error message",
      "error": "Detailed error (if available)"
    }
    ```

## Address Management Endpoints

### Get User Addresses

- **URL**: `/api/users/me/addresses`
- **Method**: `GET`
- **Access**: Private (requires authentication)
- **Description**: Get all addresses for current user
- **Headers**:
  - `Authorization`: Bearer [token]
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "addresses": [
        // Array of address objects
      ]
    }
    ```
  - Error (401/500):
    ```json
    {
      "success": false,
      "message": "Error message"
    }
    ```

### Add Address

- **URL**: `/api/users/me/addresses`
- **Method**: `POST`
- **Access**: Private (requires authentication)
- **Description**: Add new address for current user
- **Headers**:
  - `Authorization`: Bearer [token]
- **Request Body**:
  ```json
  {
    "label": "string (required)",
    "street": "string (required)",
    "city": "string (required)",
    "state": "string (optional)",
    "postalCode": "string (optional)",
    "country": "string (optional)",
    "isDefault": "boolean (optional)",
    "latitude": "number (optional)",
    "longitude": "number (optional)"
  }
  ```
- **Response**:
  - Success (201):
    ```json
    {
      "success": true,
      "message": "Address added successfully",
      "address": {
        // Newly added address object
      }
    }
    ```
  - Error (400/401/500):
    ```json
    {
      "success": false,
      "message": "Error message",
      "error": "Detailed error (if available)"
    }
    ```

### Update Address

- **URL**: `/api/users/me/addresses/:addressId`
- **Method**: `PUT`
- **Access**: Private (requires authentication)
- **Description**: Update existing address
- **Headers**:
  - `Authorization`: Bearer [token]
- **URL Parameters**:
  - `addressId`: ID of address to update
- **Request Body**: Same as Add Address
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Address updated successfully",
      "address": {
        // Updated address object
      }
    }
    ```
  - Error (400/401/404/500):
    ```json
    {
      "success": false,
      "message": "Error message",
      "error": "Detailed error (if available)"
    }
    ```

### Set Default Address

- **URL**: `/api/users/me/addresses/:addressId/default`
- **Method**: `PUT`
- **Access**: Private (requires authentication)
- **Description**: Set address as default
- **Headers**:
  - `Authorization`: Bearer [token]
- **URL Parameters**:
  - `addressId`: ID of address to set as default
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Default address updated successfully",
      "addresses": [
        // Array of updated addresses
      ]
    }
    ```
  - Error (401/404/500):
    ```json
    {
      "success": false,
      "message": "Error message",
      "error": "Detailed error (if available)"
    }
    ```

### Remove Address

- **URL**: `/api/users/me/addresses/:addressId`
- **Method**: `DELETE`
- **Access**: Private (requires authentication)
- **Description**: Delete address
- **Headers**:
  - `Authorization`: Bearer [token]
- **URL Parameters**:
  - `addressId`: ID of address to delete
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Address removed successfully"
    }
    ```
  - Error (401/404/500):
    ```json
    {
      "success": false,
      "message": "Error message",
      "error": "Detailed error (if available)"
    }
    ```

## Admin-Only Endpoints

### Get All Users

- **URL**: `/api/users`
- **Method**: `GET`
- **Access**: Private/Admin
- **Description**: Get all users (with optional filtering)
- **Headers**:
  - `Authorization`: Bearer [token]
- **Query Parameters**:
  - `role`: Filter by role (optional)
  - `status`: Filter by status (optional)
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "count": 10,
      "users": [
        // Array of user objects
      ]
    }
    ```
  - Error (401/403/500):
    ```json
    {
      "success": false,
      "message": "Error message",
      "error": "Detailed error (if available)"
    }
    ```

### Get Drivers

- **URL**: `/api/users/drivers`
- **Method**: `GET`
- **Access**: Private/Admin
- **Description**: Get all delivery drivers
- **Headers**:
  - `Authorization`: Bearer [token]
- **Query Parameters**:
  - `status`: Filter by status (optional)
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "count": 5,
      "drivers": [
        // Array of driver user objects
      ]
    }
    ```
  - Error (401/403/500):
    ```json
    {
      "success": false,
      "message": "Error message",
      "error": "Detailed error (if available)"
    }
    ```

### Get Pending Approval Users

- **URL**: `/api/users/pending-approval`
- **Method**: `GET`
- **Access**: Private/Admin
- **Description**: Get users pending approval
- **Headers**:
  - `Authorization`: Bearer [token]
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "count": 3,
      "users": [
        // Array of user objects with pending_approval status
      ]
    }
    ```
  - Error (401/403/500):
    ```json
    {
      "success": false,
      "message": "Error message",
      "error": "Detailed error (if available)"
    }
    ```

### Approve User

- **URL**: `/api/users/:id/approve`
- **Method**: `PUT`
- **Access**: Private/Admin
- **Description**: Approve a pending user
- **Headers**:
  - `Authorization`: Bearer [token]
- **URL Parameters**:
  - `id`: User ID to approve
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "User approved successfully",
      "user": {
        // Approved user object
      }
    }
    ```
  - Error (400/401/403/404/500):
    ```json
    {
      "success": false,
      "message": "Error message",
      "error": "Detailed error (if available)"
    }
    ```

### Update User Status

- **URL**: `/api/users/:id/status`
- **Method**: `PUT`
- **Access**: Private/Admin
- **Description**: Update user status
- **Headers**:
  - `Authorization`: Bearer [token]
- **URL Parameters**:
  - `id`: User ID to update
- **Request Body**:
  ```json
  {
    "status": "string (required: 'active', 'suspended', 'inactive')"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "User status updated successfully",
      "user": {
        // Updated user object
      }
    }
    ```
  - Error (400/401/403/404/500):
    ```json
    {
      "success": false,
      "message": "Error message",
      "error": "Detailed error (if available)"
    }
    ```

### Delete User

- **URL**: `/api/users/:id`
- **Method**: `DELETE`
- **Access**: Private/Admin
- **Description**: Delete user
- **Headers**:
  - `Authorization`: Bearer [token]
- **URL Parameters**:
  - `id`: User ID to delete
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "User deleted successfully"
    }
    ```
  - Error (401/403/404/500):
    ```json
    {
      "success": false,
      "message": "Error message",
      "error": "Detailed error (if available)"
    }
    ```

## Delivery Person Only Endpoints

### Toggle Driver Availability

- **URL**: `/api/users/me/availability/toggle`
- **Method**: `PUT`
- **Access**: Private/Delivery
- **Description**: Toggle delivery driver availability status
- **Headers**:
  - `Authorization`: Bearer [token]
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Availability status toggled",
      "isAvailable": true,
      "user": {
        // Updated user object
      }
    }
    ```
  - Error (401/403/500):
    ```json
    {
      "success": false,
      "message": "Error message",
      "error": "Detailed error (if available)"
    }
    ```

## Authentication Notes

1. **JWT Authentication**:

   - All protected routes require a valid JWT token in the Authorization header
   - Format: `Authorization: Bearer YOUR_JWT_TOKEN`

2. **Refresh Token**:

   - Access tokens are short-lived
   - Use the refresh token endpoint to get a new access token
   - Refresh tokens are stored securely as HTTP-only cookies when used in browser

3. **Role-Based Access**:

   - The system supports the following roles:
     - `customer`: Regular users
     - `restaurant`: Restaurant owners/managers
     - `delivery`: Delivery personnel
     - `admin`: System administrators

4. **Error Responses**:
   - All error responses follow a consistent format
   - HTTP status codes are used appropriately

## Docker Deployment

### Building and Running with Docker

```bash
# Build the Docker image
docker build -t auth-service .

# Run the container
docker run -p 5001:5001 --env-file .env auth-service
```

### Using Docker Compose

```bash
# Start the service
docker-compose up -d

# Stop the service
docker-compose down
```

Make sure to update the environment variables in the docker-compose.yml file before deploying to production.
