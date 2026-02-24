# Ashirvachana Backend API
## Node.js + MySQL + Sequelize ORM (XAMPP)

---

## 📋 Prerequisites
- **XAMPP** installed and running (Apache + MySQL)
- **Node.js** v16+ installed
- **npm** v8+

---

## 🚀 Setup Instructions

### Step 1: Create MySQL Database
1. Open XAMPP → Start **Apache** and **MySQL**
2. Go to **http://localhost/phpmyadmin**
3. Click **"New"** → Database name: `ashirvachana_db` → Click **Create**
4. *(Optional)* Click **Import** → Choose `scripts/ashirvachana_schema.sql` → Click **Go**
   - This creates all tables AND inserts sample data directly via SQL

### Step 2: Install Dependencies
```bash
cd ashirvachana-backend
npm install
```

### Step 3: Configure Environment
Edit the `.env` file:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ashirvachana_db
DB_USER=root
DB_PASSWORD=          # Leave empty if XAMPP default (no password)
JWT_SECRET=ashirvachana_jwt_secret_2026_secure_key
JWT_EXPIRES_IN=7d
ADMIN_PASSWORD=divine@admin2026
ADMIN_JWT_SECRET=ashirvachana_admin_secret_2026
FRONTEND_URL=http://localhost:3000

# Razorpay (get from https://dashboard.razorpay.com)
RAZORPAY_KEY_ID=your_key_here
RAZORPAY_KEY_SECRET=your_secret_here
```

### Step 4: Create Tables via Sequelize
```bash
node scripts/syncDB.js
```

### Step 5: Seed Sample Data (if you didn't import SQL)
```bash
node scripts/seedData.js
```

### Step 6: Start the Server
```bash
npm start          # Production
npm run dev        # Development (auto-restart with nodemon)
```

Server runs at: **http://localhost:5000**

---

## 📁 Project Structure
```
ashirvachana-backend/
├── server.js              # Main entry point
├── .env                   # Environment variables
├── config/
│   └── database.js        # Sequelize + MySQL config
├── models/
│   ├── index.js           # All models + associations
│   ├── User.js            # User model (signup/login)
│   ├── Pooja.js           # Pooja/ritual model
│   ├── Idol.js            # Idol/murtis model
│   ├── Order.js           # Orders model
│   ├── OrderItem.js       # Order items model
│   ├── BlogPost.js        # Blog posts model
│   ├── Testimonial.js     # Testimonials model
│   └── Cart.js            # Shopping cart model
├── routes/
│   ├── auth.js            # User signup/login
│   ├── adminAuth.js       # Admin login
│   ├── poojas.js          # Poojas CRUD
│   ├── idols.js           # Idols CRUD
│   ├── blogs.js           # Blog posts CRUD
│   ├── testimonials.js    # Testimonials CRUD
│   ├── cart.js            # Shopping cart
│   └── orders.js          # Orders + payment
├── middleware/
│   └── auth.js            # JWT authentication
└── scripts/
    ├── syncDB.js           # Create/sync database tables
    ├── seedData.js         # Insert sample data
    └── ashirvachana_schema.sql  # Raw SQL schema + data
```

---

## 🔌 API Endpoints

### User Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user (🔒) |
| PUT | `/api/auth/profile` | Update profile (🔒) |

### Admin Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login (password: divine@admin2026) |
| GET | `/api/admin/verify` | Verify admin token |

### Poojas
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/poojas` | Get all poojas (public) |
| GET | `/api/poojas/:id` | Get pooja details |
| GET | `/api/poojas/admin/all` | All poojas (🔒 admin) |
| POST | `/api/poojas/admin/create` | Create pooja (🔒 admin) |
| PUT | `/api/poojas/admin/:id` | Update pooja (🔒 admin) |
| DELETE | `/api/poojas/admin/:id` | Delete pooja (🔒 admin) |

### Idols
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/idols` | Get all idols (public) |
| GET | `/api/idols/:id` | Get idol details |
| GET | `/api/idols/admin/all` | All idols (🔒 admin) |
| POST | `/api/idols/admin/create` | Create idol (🔒 admin) |
| PUT | `/api/idols/admin/:id` | Update idol (🔒 admin) |
| DELETE | `/api/idols/admin/:id` | Delete idol (🔒 admin) |

### Blog Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blogs` | Get all blogs (public) |
| GET | `/api/blogs/:id` | Get blog + increment views |
| GET | `/api/blogs/admin/all` | All blogs (🔒 admin) |
| POST | `/api/blogs/admin/create` | Create blog (🔒 admin) |
| PUT | `/api/blogs/admin/:id` | Update blog (🔒 admin) |
| DELETE | `/api/blogs/admin/:id` | Delete blog (🔒 admin) |

### Testimonials
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/testimonials` | Get active testimonials |
| GET | `/api/testimonials/admin/all` | All (🔒 admin) |
| POST | `/api/testimonials/admin/create` | Create (🔒 admin) |
| PUT | `/api/testimonials/admin/:id` | Update (🔒 admin) |
| DELETE | `/api/testimonials/admin/:id` | Delete (🔒 admin) |

### Cart (🔒 User Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart/add` | Add item to cart |
| PUT | `/api/cart/:id` | Update quantity |
| DELETE | `/api/cart/:id` | Remove item |
| DELETE | `/api/cart/clear/all` | Clear entire cart |

### Orders (🔒 User Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders/create-razorpay-order` | Init Razorpay payment |
| POST | `/api/orders/place` | Place order after payment |
| GET | `/api/orders/my-orders` | User's order history |
| GET | `/api/orders/:id` | Order details |
| GET | `/api/orders/admin/all` | All orders (🔒 admin) |
| GET | `/api/orders/admin/stats` | Dashboard stats (🔒 admin) |
| PUT | `/api/orders/admin/:id/status` | Update order status (🔒 admin) |

---

## 💳 Payment Gateway (Razorpay)

1. Create account at https://dashboard.razorpay.com
2. Get your **Key ID** and **Key Secret** from Settings → API Keys
3. Add to `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
   ```
4. In `routes/orders.js`, uncomment the Razorpay import and real API call sections

### Payment Flow:
```
Frontend → POST /api/orders/create-razorpay-order
         ← Get razorpay_order_id
         → Open Razorpay modal
         ← Get razorpay_payment_id + razorpay_signature
         → POST /api/orders/place (with payment details)
         ← Order confirmed!
```

---

## 🔑 Authentication

**User Token:**
```
Authorization: Bearer <jwt_token>
```

**Admin Token:**
```
Authorization: Bearer <admin_jwt_token>
```

### Request Examples:

**Admin Login:**
```json
POST /api/admin/login
{ "password": "divine@admin2026" }
```

**User Signup:**
```json
POST /api/auth/signup
{ "name": "Rahul", "email": "rahul@email.com", "password": "pass123", "phone": "9999999999" }
```

**Add to Cart:**
```json
POST /api/cart/add
Authorization: Bearer <token>
{ "item_type": "idol", "item_id": 1, "quantity": 1 }
```

---

## 🗄️ Database Tables

| Table | Description |
|-------|-------------|
| `users` | Customer accounts |
| `poojas` | Pooja/ritual listings |
| `idols` | Idol/murtis products |
| `orders` | Bookings and purchases |
| `order_items` | Items within each order |
| `blog_posts` | Blog content |
| `testimonials` | Customer reviews |
| `cart_items` | User shopping carts |

---

## ⚡ Quick Test

After starting the server, test the API:
```bash
# Health check
curl http://localhost:5000/api/health

# Get all poojas
curl http://localhost:5000/api/poojas

# Admin login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"divine@admin2026"}'
```
