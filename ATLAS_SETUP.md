# MongoDB Atlas Setup Guide

## 1. Create Atlas Account
- Go to: https://cloud.mongodb.com
- Sign up/Login
- Create new project

## 2. Create Cluster
- Choose M0 Sandbox (FREE)
- Select cloud provider & region
- Name: notes-saas-cluster

## 3. Database User
- Database Access → Add New Database User
- Username: notes-admin
- Generate strong password (SAVE THIS!)
- Privileges: Read and write to any database

## 4. Network Access
- Network Access → Add IP Address
- Allow Access from Anywhere (0.0.0.0/0)

## 5. Get Connection String
- Database → Connect → Connect your application
- Choose Node.js driver
- Copy connection string
- Replace <password> with your actual password
- Replace <database> with "notes-saas"

Example: mongodb+srv://notes-admin:YOUR_PASSWORD@notes-saas-cluster.xxxxx.mongodb.net/notes-saas?retryWrites=true&w=majority

## 6. Seed Atlas Database
```bash
node seed-atlas.js "YOUR_ATLAS_CONNECTION_STRING"
```

## 7. Set Vercel Environment Variables
- Go to: https://vercel.com/sayanadhikary003-gmailcoms-projects/todo-assignment/settings/environment-variables
- Add:
  - MONGO_URI: Your Atlas connection string
  - JWT_SECRET: 34f33d40c0ed74815b21438dc8e26ba2124fc57aafcd8a9a8fb165abe5e6257ce2dcc6ec86e38c3507101758634b3761233f13bb02bf6712d0c389582fa5bf6f
  - NODE_ENV: production

## 8. Redeploy
```bash
vercel --prod
```

## Test Accounts (password: "password")
- admin@acme.test (Admin)
- user@acme.test (Member)
- admin@globex.test (Admin)
- user@globex.test (Member)