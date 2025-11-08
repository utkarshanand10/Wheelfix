# WheelyFix Admin Panel

A production-grade, fully dynamic admin panel for the WheelyFix automotive service platform. Built with React, Node.js, MongoDB, and modern web technologies.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication with access + refresh tokens
- Role-Based Access Control (RBAC) with roles: superadmin, admin, manager
- Permission matrix for granular access control
- Account lockout protection and login attempt tracking

### Dashboard & Analytics
- Real-time KPI widgets (users, orders, revenue, etc.)
- Interactive charts using Recharts
- Revenue trends and service distribution analytics
- Recent activity feed and quick actions

### Content Management
- **Services Management**: CRUD operations with rich text editor
- **Products Management**: Inventory control with stock alerts
- **Brands Management**: Logo management and brand analytics
- **Orders Management**: Payment capture, refunds, status tracking
- **Users Management**: User profiles, suspension, password reset

### Advanced Features
- **Media Manager**: Image upload with automatic resizing
- **Settings Management**: Company info, payment config, feature flags
- **Activity Logs**: Comprehensive audit trail
- **Bulk Operations**: Mass updates and actions
- **Search & Filtering**: Advanced filtering across all modules
- **Responsive Design**: Mobile-first, accessible UI

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Razorpay** for payments
- **Sharp** for image processing
- **Express Validator** for validation
- **Helmet** for security

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** components
- **React Query** for state management
- **React Router** for navigation
- **Recharts** for data visualization
- **Sonner** for notifications

## 📁 Project Structure

```
Wheelyfix-Automotive_backend-main/
├── controllers/
│   ├── adminAuthController.js
│   ├── adminProductsController.js
│   ├── adminBrandsController.js
│   ├── adminOrdersController.js
│   ├── adminSettingsController.js
│   ├── adminMediaController.js
│   └── adminAnalyticsController.js
├── models/
│   ├── userModel.js
│   ├── serviceModel.js
│   ├── productModel.js
│   ├── brandModel.js
│   ├── orderModel.js
│   ├── settingsModel.js
│   └── auditLogModel.js
├── routes/
│   ├── adminAuth.js
│   ├── adminProducts.js
│   ├── adminBrands.js
│   ├── adminOrders.js
│   ├── adminSettings.js
│   ├── adminMedia.js
│   └── adminAnalytics.js
├── middleware/
│   ├── adminAuth.js
│   └── validateAdmin.js
└── scripts/
    └── seedAdminPanel.js

Wheelyfix-Automotive_Frontend-main/
├── src/
│   ├── pages/admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminProducts.tsx
│   │   ├── AdminBrands.tsx
│   │   ├── AdminOrders.tsx
│   │   └── AdminSettings.tsx
│   ├── components/admin/
│   │   └── layout/
│   ├── contexts/
│   │   └── AdminContext.tsx
│   └── api/
│       └── admin.ts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB 5.0+
- Git

### Backend Setup

1. **Clone and navigate to backend directory**
   ```bash
   cd Wheelyfix-Automotive_backend-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/wheelyfix
   JWT_SECRET=your_jwt_secret_key_here
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
   JWT_ACCESS_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d
   
   # Razorpay Configuration
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
   ```

4. **Seed the database**
   ```bash
   npm run seed:admin-panel
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd Wheelyfix-Automotive_Frontend-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the admin panel**
   ```
   http://localhost:3000/admin
   ```

## 🔐 Default Login Credentials

After running the seed script, you can login with:

- **Email**: `superadmin@wheelyfix.com`
- **Password**: `ChangeMe123!`

**⚠️ Important**: Change the default password immediately after first login!

## 📊 Admin Panel Features

### Dashboard
- Real-time statistics and KPIs
- Revenue charts and trends
- Service distribution analytics
- Recent activity feed
- Quick action buttons

### Services Management
- Create, edit, and delete services
- Rich text description editor
- Category and tag management
- Pricing and duration settings
- Featured and popular flags
- Bulk operations

### Products Management
- Complete product catalog
- SKU and inventory management
- Brand associations
- Variant support (size, color, etc.)
- Stock alerts and low stock warnings
- Product specifications and features

### Brands Management
- Brand logo and information
- Website and contact details
- Social media links
- Product count per brand
- Featured brand management

### Orders Management
- Order tracking and status updates
- Payment capture and refunds
- Customer information
- Order items and pricing
- Manual order creation
- Order analytics

### Settings Management
- Company information
- Payment gateway configuration
- Email SMTP settings
- Site maintenance mode
- Feature flags
- Notification preferences

### Media Manager
- Image upload and management
- Automatic image resizing
- Multiple image formats support
- File organization and search

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Account lockout protection
- Input validation and sanitization
- CSRF protection
- Rate limiting
- Secure headers with Helmet
- Password hashing with bcrypt

## 📱 Responsive Design

The admin panel is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes

## 🧪 Testing

### Backend Tests
```bash
cd Wheelyfix-Automotive_backend-main
npm test
```

### Frontend Tests
```bash
cd Wheelyfix-Automotive_Frontend-main
npm test
```

## 🚀 Deployment

### Docker Deployment

1. **Backend Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. **Frontend Dockerfile**
   ```dockerfile
   FROM node:18-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

3. **Docker Compose**
   ```yaml
   version: '3.8'
   services:
     mongodb:
       image: mongo:5.0
       ports:
         - "27017:27017"
       volumes:
         - mongodb_data:/data/db

     backend:
       build: ./Wheelyfix-Automotive_backend-main
       ports:
         - "5000:5000"
       environment:
         - MONGODB_URI=mongodb://mongodb:27017/wheelyfix
       depends_on:
         - mongodb

     frontend:
       build: ./Wheelyfix-Automotive_Frontend-main
       ports:
         - "3000:80"
       depends_on:
         - backend

   volumes:
     mongodb_data:
   ```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wheelyfix
JWT_SECRET=your_production_jwt_secret
JWT_REFRESH_SECRET=your_production_jwt_refresh_secret
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Razorpay Production Keys
RAZORPAY_KEY_ID=your_production_razorpay_key_id
RAZORPAY_KEY_SECRET=your_production_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_production_razorpay_webhook_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_RAZORPAY_KEY_ID=your_production_razorpay_key_id
```

## 🔧 Configuration

### Razorpay Setup

1. **Test Mode**
   - Use test keys from Razorpay dashboard
   - Test payments with Razorpay test cards

2. **Live Mode**
   - Replace with production keys
   - Update webhook endpoints
   - Enable live mode in settings

### Email Configuration

1. **Gmail SMTP**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

2. **Other SMTP Providers**
   - Update SMTP settings in admin panel
   - Configure appropriate ports and security

### File Upload Configuration

1. **Local Storage** (Default)
   - Files stored in `public/uploads/`
   - Automatic image resizing with Sharp

2. **AWS S3** (Optional)
   - Configure AWS credentials
   - Update upload middleware
   - Set S3 bucket permissions

## 📈 Monitoring & Analytics

### Built-in Analytics
- User registration trends
- Order and revenue analytics
- Service popularity metrics
- Product performance data

### External Monitoring
- Application performance monitoring
- Error tracking and logging
- Database performance metrics
- Server resource monitoring

## 🛠️ Maintenance

### Database Backup
```bash
# MongoDB backup
mongodump --db wheelyfix --out /backup/path

# Restore
mongorestore --db wheelyfix /backup/path/wheelyfix
```

### Log Management
- Application logs in `logs/` directory
- Error logs with stack traces
- Access logs for API requests
- Audit logs for admin actions

### Updates and Patches
1. Backup database and files
2. Update dependencies
3. Run migrations if needed
4. Test thoroughly
5. Deploy to production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@wheelyfix.in
- Documentation: [Admin Panel Docs](https://docs.wheelyfix.in/admin)

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Complete admin panel functionality
- User, service, product, brand, and order management
- Analytics dashboard
- Settings management
- Media manager
- Responsive design

---

**Made with ❤️ for WheelyFix**