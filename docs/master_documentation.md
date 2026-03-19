# China Unique Store (Antigravity) - Master Documentation

## 1. Project Overview
**China Unique Store** is a premium e-commerce platform designed for visual excellence, high performance, and seamless user experience. It leverages the latest web technologies to provide a blazing-fast shopping experience combined with a powerful administrative backend for full store control.

- **Objective**: To provide a state-of-the-art shopping experience with robust admin management.
- **Brand Identity**: Professional, modern, and user-centric.
- **Core Engine**: Next.js 16 (App Router) with PPR (Partial Prerendering).

---

## 2. Technical Architecture

### Core Stack
- **Framework**: [Next.js 16 (Canary)](https://nextjs.org/) - Utilizing App Router, Server Actions, and Cache Directives.
- **Language**: JavaScript / Node.js.
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/).
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/).
- **Authentication**: [Next-Auth (Auth.js)](https://next-auth.js.org/).

### Third-Party Integrations
- **Image Management**: [Cloudinary](https://cloudinary.com/) (Optimization & CDN).
- **Email Delivery**: [Resend](https://resend.com/) (Order notifications & updates).
- **Communication**: WhatsApp API integration for direct order confirmation.
- **PDF Generation**: `jspdf` & `jspdf-autotable` for professional invoices.

### Infrastructure & Patterns
- **Deployment**: Optimized for **Vercel** with Edge Functions.
- **Data Fetching**: SWR for client-side state, Next.js internal cache for server-side.
- **Design System**: Atomic components built with Tailwind & Lucide-React.

---

## 3. Comprehensive Feature List

### A. Customer-Facing Features
#### 1. Premium User Interface
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop.
- **Modern Typography**: High-legibility fonts (Inter/Outfit).
- **Micro-animations**: Smooth hover effects, slide transitions, and loading states via Framer Motion.
- **High-Quality Icons**: Strategic use of Lucide-React icons replacing standard emojis.

#### 2. Discovery & Navigation
- **Hero Carousels**: Dynamic banners with auto-scroll and manual controls.
- **Category Sliders**: Intuitive horizontal sliders for browsing product categories.
- **Advanced Search**: Real-time product search with client-side filtering.
- **Product Grids**: Performant, lazy-loaded product listings with "isLive" and "isDiscounted" badges.

#### 3. Product Experience
- **Detailed Pages**: SEO-optimized product pages with dynamic metadata.
- **Review System**: User-submitted reviews with star ratings and photos.
- **Stock Indicators**: Real-time availability badges.

#### 4. Cart & Checkout
- **Cart Drawer**: Seamless, slide-in cart for quick adjustments without page reloads.
- **Multi-step Checkout**: Simplified flow with persistence and automatic profile linking.
- **WhatsApp Integration**: Option to complete orders via WhatsApp with formatted messages.

#### 5. Post-Purchase Experience
- **Order Tracking**: Dedicated "My Orders" page for authenticated users.
- **Invoice Download**: Generate professional PDF receipts instantly.
- **Order Linking**: Retroactively link guest orders to an account via phone number.

### B. Admin Dashboard (Backend Control)
#### 1. Store Oversight
- **Real-time Stats**: Metrics for total sales, active orders, and trending products.
- **Notification System**: In-app alerts for new orders and low stock.

#### 2. Content Management (CMS)
- **Product Management**: Full CRUD capabilities, pricing control, and bulk actions.
- **Category Management**: Drag-and-drop reordering with persistent sorting in MongoDB.
- **Media Library**: Easy upload and management of product/cover images via Cloudinary.

#### 3. Order & Customer Management
- **Order Processing**: Update order statuses (Pending, Shipped, Delivered, Canceled).
- **Customer Directory**: Manage user roles and view purchase history.

#### 4. System Settings
- **Store Configuration**: Edit store name, support email, and business address.
- **Delivery Management**: Set location-based delivery fees and free shipping thresholds.
- **Appearance Settings**: Toggle announcement bars and update hero images.

---

## 4. Risk Assessment & Future Roadmap

### Technical Risks
- **Dependency Flux**: The use of Next.js 16 Canary and React 19 (Beta/Canary) carries a high risk of breaking changes until stable versions are released.
  - *Mitigation*: Regular monitoring of release notes and automated testing suites.
- **Performance Bottlenecks**: As the database grows (millions of records), complex MongoDB queries in API routes may slow down.
  - *Mitigation*: Implementation of proper indexing and Redis caching layer.
- **Vendor Lock-in**: Heavy reliance on Vercel, Cloudinary, and Resend free/pro tiers.
  - *Mitigation*: Maintaining clean abstractions to allow switching providers if costs scale poorly.

### Operational Risks
- **Data Security**: Potential vulnerabilities in admin API endpoints or session handling.
  - *Mitigation*: Regular security audits and strict JWT/Session validation.
- **Image Overload**: High-resolution uploads could increase bandwidth costs significantly.
  - *Mitigation*: Strict client-side resizing and automated Cloudinary transformations.

### Future Roadmap (Proposed)
- **Phase 1**: Migration to stable Next.js 16 and Tailwind 4.
- **Phase 2**: Multi-vendor support or advanced warehouse management.
- **Phase 3**: Progressive Web App (PWA) implementation for offline access.
- **Phase 4**: Integrated analytics dashboard for marketing (Google Analytics/Pirsch).

---
**Documentation Version**: 1.0.0
**Last Updated**: March 18, 2026
