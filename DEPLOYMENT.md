# Deployment Guide

## Prerequisites

1. **MongoDB Atlas Setup**:
   - Create a free MongoDB Atlas account
   - Create a new cluster (free tier M0 is sufficient)
   - Create a database user with read/write permissions
   - Get the connection string
   - Update network access to allow connections from anywhere (0.0.0.0/0) for Vercel

2. **Vercel Account**:
   - Sign up for a free Vercel account
   - Install Vercel CLI: `npm i -g vercel`

## Environment Variables

Set these environment variables in your deployment platform:

```
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/notes-saas?retryWrites=true&w=majority
JWT_SECRET=your_super_strong_jwt_secret_key_here_minimum_32_characters
NODE_ENV=production
```

## Deployment Steps

### Option 1: Vercel CLI

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables**:
   ```bash
   vercel env add MONGO_URI
   vercel env add JWT_SECRET
   ```

4. **Redeploy with Environment Variables**:
   ```bash
   vercel --prod
   ```

### Option 2: Vercel Dashboard

1. **Import Project**:
   - Go to Vercel Dashboard
   - Click "New Project"
   - Import from Git repository

2. **Configure Environment Variables**:
   - In project settings, go to "Environment Variables"
   - Add:
     - `MONGO_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A strong secret key (32+ characters)
     - `NODE_ENV`: `production`

3. **Deploy**:
   - Vercel will automatically deploy your application

## Post-Deployment

1. **Seed the Database**:
   ```bash
   # Run locally with production environment
   NODE_ENV=production npm run seed
   ```

2. **Test the Application**:
   - Visit your deployed URL
   - Test with the seed accounts:
     - `admin@acme.test` / `password`
     - `user@acme.test` / `password`
     - `admin@globex.test` / `password`
     - `user@globex.test` / `password`

3. **Verify Endpoints**:
   - Health check: `https://yourdomain.vercel.app/api/health`
   - Should return: `{"status": "ok"}`

## Troubleshooting

### Common Issues

1. **MongoDB Connection Errors**:
   - Verify connection string is correct
   - Check MongoDB Atlas network access settings
   - Ensure database user has proper permissions

2. **Environment Variables Not Working**:
   - Redeploy after setting environment variables
   - Check spelling of variable names
   - Verify variables are set in production environment

3. **JWT Token Issues**:
   - Ensure JWT_SECRET is set and at least 32 characters
   - Check browser console for token-related errors

### Verification Commands

```bash
# Test health endpoint
curl https://yourdomain.vercel.app/api/health

# Test login endpoint
curl -X POST https://yourdomain.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.test","password":"password"}'
```

## Security Notes

- Never commit `.env.local` to version control
- Use strong, unique JWT secrets
- Regularly rotate credentials
- Enable MongoDB Atlas IP whitelisting in production
- Consider implementing rate limiting for production use

## Monitoring

- Vercel provides built-in analytics and error monitoring
- MongoDB Atlas provides database monitoring
- Check Vercel function logs for debugging