# Porty - Multi-Tenant SaaS Portfolio Platform

Build stunning portfolio websites with custom subdomains. Each user gets their own `username.mysite.com` portfolio.

## 🚀 Features

- **Custom Subdomains**: Each user gets a unique subdomain
- **3 Beautiful Templates**: Minimal, Creative, Professional
- **Media Uploads**: Images (10MB) and videos (50MB) via Cloudinary
- **External Videos**: YouTube, Vimeo, Google Drive embeds
- **Admin Panel**: User management, suspension, template changes
- **JWT Authentication**: Secure login with bcrypt password hashing

## 📦 Tech Stack

- **Next.js 16** (App Router + API Routes)
- **TypeScript**
- **MongoDB + Mongoose**
- **Tailwind CSS**
- **Cloudinary** (file uploads)

## 🛠️ Installation

```bash
# Install dependencies
cd frontend
npm install

# Setup environment
cp env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

## ⚙️ Environment Variables

Create `frontend/.env.local`:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/porty

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# App
NEXT_PUBLIC_BASE_DOMAIN=localhost
```

## 📚 API Endpoints

All API routes are inside `frontend/src/app/api/`:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/check-subdomain/:subdomain` - Check availability

### Portfolio
- `GET /api/portfolio/me` - Get my portfolio
- `PUT /api/portfolio/me` - Update portfolio
- `GET /api/portfolio/:subdomain` - Get public portfolio

### Projects
- `GET /api/projects/me` - Get my projects
- `POST /api/projects/upload/image` - Upload image
- `POST /api/projects/upload/video` - Upload video
- `POST /api/projects/external` - Add external video
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List all users
- `PUT /api/admin/user/:id` - Suspend/unsuspend/change template
- `DELETE /api/admin/user/:id` - Delete user

## 🎨 Templates

1. **Minimal** - Clean developer-focused
2. **Creative** - Bold colors, animations
3. **Professional** - Corporate resume-style

## 🚀 Deployment

```bash
cd frontend
npm run build
npm start
```

For production, set `NEXT_PUBLIC_BASE_DOMAIN` to your domain (e.g., `mysite.com`).

---

Built with ❤️ for freelancers
