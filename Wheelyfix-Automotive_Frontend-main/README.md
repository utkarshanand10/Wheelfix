# Wheelyfix Automotive Clone

A modern, responsive clone of the Wheelyfix Automotive website built with React, TypeScript, and Tailwind CSS. This project showcases a professional automotive service platform with booking functionality, service management, and admin features.

## 🚀 Features

### Core Features
- **Responsive Design**: Mobile-first approach with beautiful UI across all devices
- **Modern Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS
- **Component Library**: shadcn/ui components for consistent design
- **Authentication**: User login/logout with role-based access
- **Admin Panel**: Complete admin dashboard for content management
- **Service Booking**: Interactive service booking system
- **Cart System**: Shopping cart functionality for services
- **Blog System**: Content management for blog posts
- **Database Integration**: Supabase backend for data persistence

### Key Components
- **Dynamic Hero Section**: Interactive hero with service booking form
- **Service Categories**: Car and bike services with pricing
- **Product Categories**: Vehicle parts and accessories
- **Testimonials**: Customer reviews and ratings
- **How We Work**: Service process explanation
- **App Download**: Mobile app promotion section
- **Brands**: Partner brand showcase
- **Recent Blogs**: Latest blog posts display

### Admin Features
- **User Management**: View and manage user accounts
- **Service Management**: Add, edit, and manage services
- **Blog Management**: Create and manage blog posts
- **Category Management**: Organize services and products
- **Hero Content**: Manage homepage hero section
- **Analytics**: Basic analytics and reporting

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **UI Components**: Radix UI primitives

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pikparts-clone-perfect
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🗄️ Database Setup

The project uses Supabase as the backend. You'll need to set up the following tables:

### Required Tables
- `users` - User accounts and profiles
- `services` - Service offerings with categories
- `product_categories` - Product/service categories
- `blog_posts` - Blog content
- `hero_content` - Homepage hero section content
- `testimonials` - Customer testimonials
- `bookings` - Service bookings
- `cart_items` - Shopping cart items

### Supabase Setup
1. Create a new Supabase project
2. Set up authentication (Email/Password)
3. Create the required tables with proper relationships
4. Set up Row Level Security (RLS) policies
5. Configure storage buckets for images

## 📱 Pages & Routes

- `/` - Homepage with hero, services, and features
- `/login` - User authentication
- `/services` - Service catalog and booking
- `/booking` - Service booking form
- `/cart` - Shopping cart
- `/blogs` - Blog posts listing
- `/admin` - Admin dashboard (admin only)
- `/*` - 404 Not Found page

## 🎨 Design System

### Colors
- **Primary**: Dark gray (`#262626`)
- **Accent**: Orange (`#FF6B35`)
- **Background**: White to light gray gradients
- **Text**: Dark gray to light gray hierarchy

### Typography
- **Headings**: Bold, large fonts for impact
- **Body**: Clean, readable fonts
- **Buttons**: Consistent styling with hover effects

### Components
- **Cards**: Elevated with shadows and hover effects
- **Buttons**: Multiple variants (primary, secondary, outline)
- **Forms**: Clean inputs with focus states
- **Navigation**: Sticky header with mobile menu

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── admin/          # Admin-specific components
│   └── ...             # Feature components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── integrations/       # External service integrations
└── assets/             # Static assets
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

### Other Platforms
The project can be deployed to any static hosting platform that supports Vite builds.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is for educational purposes. The original Wheelyfix Automotive website and brand belong to their respective owners.

## 🙏 Acknowledgments

- [Wheelyfix Automotive](https://www.pikpartsmartgarage.com/) - Original website inspiration
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Vite](https://vitejs.dev/) - Fast build tool

## 📞 Support

For support or questions, please open an issue in the GitHub repository or contact the development team.

---

**Note**: This is a clone project created for educational purposes. All rights to the original Wheelyfix Automotive brand and website belong to their respective owners.
