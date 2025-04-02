## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout a user (protected)
- `GET /api/auth/me` - Get current user profile (protected)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password with token
- `Get /api/auth/validate-token` - Validate token (for internal service use)

### User Management

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/pending-approval` - Get users pending approval (admin only)
- `PUT /api/users/:id/approve` - Approve a user (admin only)
- `PUT /api/users/:id/status` - Update user status (admin only)
- `DELETE /api/users/:id` - Delete a user (admin only)
- `PUT /api/users/me` - Update user profile (protected)
- `PUT /api/users/me/password` - Change password (protected)
