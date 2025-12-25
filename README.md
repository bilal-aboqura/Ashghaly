# Porty - Multi-Tenant SaaS Portfolio Platform

Build stunning portfolio websites with custom subdomains. Each user gets their own `username.mysite.com` portfolio.

## 🚀 Features

- **Custom Subdomains**: Each user gets a unique subdomain
- **3 Beautiful Templates**: Minimal, Creative, Professional
- **Media Uploads**: Images (10MB) and videos (50MB) via Cloudinary
- **External Videos**: YouTube, Vimeo, Google Drive embeds
- **Admin Panel**: User management, suspension, template changes
- **JWT Authentication**: Secure login with bcrypt password hashing
- **No Base64**: All uploads via multipart/form-data only

## 📦 Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (file uploads)

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- React Hot Toast

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
# Create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:5000
# NEXT_PUBLIC_BASE_DOMAIN=mysite.com
npm run dev
```

## ⚙️ Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/porty
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
BASE_DOMAIN=mysite.com
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_BASE_DOMAIN=mysite.com
```

## 🌐 DNS Configuration (Production)

1. Add a wildcard A record: `*.mysite.com` → Your VPS IP
2. Add root A record: `mysite.com` → Your VPS IP
3. Configure SSL with Let's Encrypt wildcard certificate

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/check-subdomain/:subdomain` - Check availability

### Portfolio
- `POST /api/portfolio` - Create/update portfolio
- `GET /api/portfolio/me` - Get my portfolio
- `PUT /api/portfolio/me` - Update portfolio
- `GET /api/portfolio/:subdomain` - Get public portfolio

### Projects
- `POST /api/projects/upload/image` - Upload image
- `POST /api/projects/upload/video` - Upload video
- `POST /api/projects/external` - Add external video
- `GET /api/projects/me` - Get my projects
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `PUT /api/projects/reorder` - Reorder projects

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/user/:id` - User details
- `PUT /api/admin/user/:id/suspend` - Suspend user
- `PUT /api/admin/user/:id/unsuspend` - Unsuspend user
- `PUT /api/admin/user/:id/template` - Change template
- `DELETE /api/admin/user/:id` - Delete user

## 🎨 Templates

1. **Minimal** - Clean, developer-focused
2. **Creative** - Bold colors, animations
3. **Professional** - Corporate, resume-style

## 🔒 Security

- Passwords hashed with bcrypt (cost 12)
- JWT tokens with expiration
- Base64 rejection middleware
- Rate limiting on all routes
- Admin role verification
- Tenant data isolation

## 🚀 Deployment

### Using PM2

```bash
# Backend
cd backend
npm install
pm2 start server.js --name porty-api

# Frontend
cd frontend
npm run build
pm2 start npm --name porty-web -- start
```

### Nginx Configuration

```nginx
# Main app
server {
    listen 80;
    server_name mysite.com www.mysite.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Subdomains
server {
    listen 80;
    server_name *.mysite.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# API
server {
    listen 80;
    server_name api.mysite.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📝 License

MIT

---

Built with ❤️ for freelancers
