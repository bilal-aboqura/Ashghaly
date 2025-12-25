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
npm install

# Setup environment
cp env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

## ⚙️ Environment Variables

Create `.env.local`:

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

All API routes are in `src/app/api/`:

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user
- `GET /api/auth/check-subdomain/:subdomain` - Check availability

### Portfolio
- `GET/PUT /api/portfolio/me` - User portfolio
- `GET /api/portfolio/:subdomain` - Public portfolio

### Projects
- `GET /api/projects/me` - My projects
- `POST /api/projects/upload/image` - Upload image
- `POST /api/projects/upload/video` - Upload video
- `POST /api/projects/external` - External video
- `PUT/DELETE /api/projects/:id` - Manage project

### Admin
- `GET /api/admin/stats` - Stats
- `GET /api/admin/users` - Users list
- `PUT/DELETE /api/admin/user/:id` - Manage user

## 🚀 Deployment

```bash
npm run build
npm start
```

---

Built with ❤️ for freelancers
