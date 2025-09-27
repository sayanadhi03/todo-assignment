# Multi-tenant SaaS Notes Application

A comprehensive multi-tenant Software-as-a-Service (SaaS) application for managing notes with strict tenant isolation, role-based access control, and subscription gating.

## 🏗️ Architecture

This application implements a **shared schema with tenantId approach** for multi-tenancy:
- All data is stored in a single MongoDB database
- Each document includes a `tenantId` field for tenant isolation
- All queries are automatically scoped by `tenantId` to ensure complete data isolation
- No cross-tenant data leakage is possible due to middleware-level filtering

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 with App Router + Tailwind CSS
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **Multi-tenancy**: Shared schema with `tenantId` field
- **Deployment**: Designed for Vercel deployment

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication with secure password hashing
- Role-based access control (Admin/Member)
- Tenant-scoped user sessions
- Automatic token validation and refresh

### 🏢 Multi-tenant Architecture
- Complete tenant data isolation using `tenantId` filtering
- Separate workspaces for different organizations
- No cross-tenant data access possible

### 📝 Notes Management
- Create, read, update, delete notes
- Rich text content support
- Real-time updates
- Tenant-scoped note access

### 💰 Subscription Management
- **Free Plan**: Maximum 3 notes per tenant
- **Pro Plan**: Unlimited notes
- Admin-only plan upgrade functionality
- Real-time limit enforcement

### 🎨 User Interface
- Responsive design with Tailwind CSS
- Intuitive dashboard with note management
- Plan status and upgrade prompts
- Test account quick-login buttons

## 📊 Database Schema

### Tenant Model
```javascript
{
  name: String,        // e.g., "Acme Corporation"
  slug: String,        // e.g., "acme" (unique)
  plan: String,        // "FREE" or "PRO"
  createdAt: Date
}
```

### User Model
```javascript
{
  email: String,       // Unique across all tenants
  password: String,    // bcrypt hashed
  role: String,        // "Admin" or "Member"
  tenantId: ObjectId,  // Reference to Tenant
  createdAt: Date
}
```

### Note Model
```javascript
{
  title: String,
  content: String,
  tenantId: ObjectId,  // Reference to Tenant (isolation key)
  createdBy: ObjectId, // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

## 🔑 Pre-seeded Test Accounts

The application comes with pre-configured test accounts for immediate testing:

| Email | Password | Role | Tenant |
|-------|----------|------|---------|
| admin@acme.test | password | Admin | Acme |
| user@acme.test | password | Member | Acme |
| admin@globex.test | password | Admin | Globex |
| user@globex.test | password | Member | Globex |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login with email/password

### Notes Management
- `GET /api/notes` - List all notes for authenticated user's tenant
- `POST /api/notes` - Create new note (subject to plan limits)
- `GET /api/notes/[id]` - Get specific note
- `PUT /api/notes/[id]` - Update specific note
- `DELETE /api/notes/[id]` - Delete specific note

### Tenant Management
- `POST /api/tenants/[slug]/upgrade` - Upgrade tenant to Pro plan (Admin only)

### System
- `GET /api/health` - Health check endpoint

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/notes-saas?retryWrites=true&w=majority

# JWT Secret (use a strong 32+ character string)
JWT_SECRET=your_super_strong_jwt_secret_key_here_min_32_chars

# Server Configuration
PORT=8080
NODE_ENV=development

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Seed the Database

```bash
npm run seed
```

This command will:
- Connect to your MongoDB database
- Clear existing data
- Create the two test tenants (Acme and Globex)
- Create four test users with hashed passwords

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🧪 Testing the Application

### Manual Testing Steps

1. **Login Test**: Use any of the pre-seeded accounts to login
2. **Tenant Isolation**: 
   - Login as `admin@acme.test`, create some notes
   - Login as `admin@globex.test`, verify you can't see Acme's notes
3. **Plan Limits**: 
   - As a Free tenant, try creating more than 3 notes
   - Verify the upgrade prompt appears
4. **Role-based Access**:
   - Login as Admin, verify you can upgrade the tenant
   - Login as Member, verify upgrade option is not available
5. **CRUD Operations**: Create, edit, and delete notes

### API Testing with curl

```bash
# Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.test","password":"password"}'

# Use token to access protected endpoints
curl -X GET http://localhost:3000/api/notes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔒 Security Features

### Data Protection
- All passwords are hashed using bcrypt with 12 salt rounds
- JWT tokens are signed with a strong secret key
- All database queries include tenant filtering

### Tenant Isolation
- Every database query includes `tenantId` filter
- No client-side tenant ID manipulation possible
- Middleware-level authentication and authorization

### Input Validation
- All API endpoints validate input data
- Proper error handling with secure error messages
- Rate limiting ready (can be added with middleware)

## 📈 Subscription Logic

### Free Plan Limits
- Maximum 3 notes per tenant
- Enforced at the API level with real-time counting
- Upgrade prompts shown when limit is reached

### Pro Plan Benefits
- Unlimited notes
- All features available
- Immediate effect after upgrade

### Upgrade Process
1. Admin user clicks "Upgrade to Pro"
2. `POST /api/tenants/[slug]/upgrade` endpoint called
3. Tenant plan updated to "PRO" in database
4. User interface updates to reflect new plan status

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Prepare Environment Variables**:
   Set these in your Vercel dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`

2. **Deploy Frontend & API**:
   ```bash
   vercel --prod
   ```

3. **Seed Production Database**:
   ```bash
   # After deployment, seed the production database
   NODE_ENV=production npm run seed
   ```

### MongoDB Atlas Setup

1. Create a free MongoDB Atlas cluster
2. Create a database user with read/write permissions
3. Get the connection string and add it to your environment variables
4. Whitelist your deployment IP addresses

## 🏗️ Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/                 # API routes
│   │   │   ├── auth/login/      # Authentication endpoint
│   │   │   ├── notes/           # Notes CRUD endpoints
│   │   │   ├── tenants/         # Tenant management
│   │   │   └── health/          # Health check
│   │   ├── layout.js            # Root layout with AuthProvider
│   │   └── page.js              # Main page with auth routing
│   └── components/
│       ├── AuthContext.js       # Authentication context
│       ├── Login.js             # Login form component
│       └── Dashboard.js         # Main dashboard component
├── models/
│   ├── Tenant.js                # Tenant Mongoose model
│   ├── User.js                  # User Mongoose model
│   └── Note.js                  # Note Mongoose model
├── lib/
│   ├── mongodb.js               # Database connection
│   └── auth.js                  # JWT utilities
├── middleware/
│   └── auth.js                  # Authentication middleware
├── scripts/
│   └── seed.js                  # Database seeding script
├── .env.local                   # Environment variables
└── package.json                 # Dependencies and scripts
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Verify `MONGO_URI` in `.env.local`
   - Check MongoDB Atlas network access
   - Ensure database user has proper permissions

2. **JWT Token Issues**:
   - Verify `JWT_SECRET` is set and strong (32+ characters)
   - Clear browser localStorage if getting token errors

3. **Seed Script Fails**:
   - Ensure MongoDB connection is working
   - Check that `.env.local` file is in the correct location

4. **CORS Issues**:
   - Verify API routes are working with direct curl requests
   - Check browser console for specific error messages

### Development Tips

- Use MongoDB Compass to inspect database contents
- Check browser Network tab for API request/response details
- Review server logs for detailed error information
- Test tenant isolation by logging in as different tenant users

## 🧪 Testing Checklist

### Functional Tests
- [ ] Health endpoint returns `{"status": "ok"}`
- [ ] All four seed accounts can login successfully
- [ ] Tenant isolation: Users can only see their tenant's notes
- [ ] Role-based access: Only Admins can upgrade plans
- [ ] Free plan limit: Cannot create more than 3 notes
- [ ] Pro plan: Can create unlimited notes after upgrade
- [ ] CRUD operations work correctly for notes
- [ ] Frontend is accessible and responsive

### Security Tests
- [ ] Cannot access other tenant's data with manipulated requests
- [ ] Invalid JWT tokens are rejected
- [ ] Password hashing is working (passwords not stored in plain text)
- [ ] SQL injection protection (using Mongoose ORM)

## 📝 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

This is a demonstration project built according to specific requirements. For modifications or improvements, please follow the existing code patterns and security practices.
