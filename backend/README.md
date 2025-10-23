# RECtify Backend API

Backend server for RECtify - UAE's Digital I-REC Trading Platform.

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account if you don't have one
3. Create a new cluster (free tier is sufficient for development)
4. Create a database user:
   - Go to Database Access
   - Add New Database User
   - Choose Password authentication
   - Create username and password
   - Grant "Atlas Admin" role (or "Read and write to any database")
5. Get your connection string:
   - Go to Database → Connect
   - Choose "Connect your application"
   - Copy the connection string

### 3. Environment Configuration
1. Copy `env.sample` to `.env`:
   ```bash
   cp env.sample .env
   ```
2. Update the `.env` file with your MongoDB Atlas connection string and other settings:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rectify?retryWrites=true&w=majority
   JWT_SECRET=your_very_long_random_secret_key_here
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

### 4. Generate JWT Secret
Generate a secure JWT secret key:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output and use it as your `JWT_SECRET` in the `.env` file.

### 5. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000` by default.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Users (Admin only)
- `GET /api/users/stats` - Get user statistics

### Health Check
- `GET /api/health` - Server health check

## User Roles and Permissions

### Trader
- Can trade RECs
- Basic tier: Limited analytics and export
- Premium/Enterprise: Full analytics and export

### Facility Owner
- Can trade RECs
- Can register facilities
- Full analytics and export capabilities

### Compliance Officer
- Cannot trade RECs
- Can view analytics and export reports
- Can manage users

### Admin
- Full access to all features
- Can manage all users

## Database Schema

### User Model
- Email, password (hashed)
- Personal information (name, company, emirate)
- Role and tier
- Preferences and permissions
- Portfolio data
- Verification status

## Security Features
- Password hashing with bcrypt
- JWT authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- Environment variable protection

## Development
- Uses nodemon for auto-restart during development
- Morgan for request logging
- Express validator for input validation
- Comprehensive error handling
