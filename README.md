# Ceylone Zimt — redesigned storefront

The current storefront is in `frontend/` and the Vercel deployment is configured at the repository root. It uses the supplied product photos, a new cinnamon-and-leaf logo, generated editorial hero photography, built-in English/Sinhala/Tamil/German translations and LKR/EUR/USD/PLN display options.

**Current ordering:** customers prepare an itemised email enquiry addressed to mohammedzakee2006@gmail.com, then send it using their own email app. No payment is collected and no order is automatically submitted. Seller prices: powder 100 g €7.90; sticks 100 g €8.90; oil 100 mL €13.90; oil 10 mL LKR 1,390. Other currency views use fixed reference conversions. Shipping and taxes are confirmed by email.

**Payments are not live.** The previous insecure Stripe session endpoint is disabled. Follow [the launch and payment guide](docs/PAYMENTS-AND-LAUNCH.md) to onboard a merchant account and implement verified checkout before taking card payments.

Run `npm test` for storefront checks. The historical project notes below describe the previous application and do not establish that its payment, certification or fulfilment claims are verified.

---

# Historical project notes
### Ancient Wisdom, Modern Luxury — The Gold Standard of Ceylon Cinnamon

![Ceylone Zimt Banner](docs/assets/banner.png)

Welcome to **Ceylone Zimt**, a premium e-commerce experience dedicated to providing the world's finest, ethically sourced Ceylon cinnamon directly from the misty highlands of Sri Lanka to your doorstep.

---

## 🌟 Key Features

- **💎 Premium UX/UI**: A sleek, dark-mode aesthetic designed to reflect the luxury and purity of our products.
- **🛍️ Complete E-Commerce Flow**: Browse collections, view detailed product information, and manage your cart seamlessly.
- **🛡️ Secure Checkout**: Integrated with Stripe for safe and reliable global transactions.
- **📊 Admin Dashboard**: A powerful backend interface for managing products, monitoring inventory, and viewing sales metrics.
- **💌 Newsletter Integration**: Stay connected with the "Spice Circle" for exclusive recipes and seasonal previews.
- **🌱 Ethical Sourcing**: Direct-to-consumer model supporting traditional farmers in Sri Lanka with fair wages.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla CSS3 (Custom Design System), JavaScript (ES6+) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Atlas) via Mongoose |
| **Security** | JWT Authentication, Bcrypt Hashing, Express Rate Limit |
| **Integrations** | Stripe API, Multer (File Uploads), Nodemailer |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- [Stripe](https://stripe.com/) account for payments

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Mohammed-Zakee/Cinnamon-Website.git
   cd Cinnamon-Website
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory and add:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   STRIPE_SECRET_KEY=your_stripe_key
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```

3. **Frontend Setup**
   The frontend is served statically. You can open `frontend/index.html` directly or serve it using the backend.

4. **Run the Project**
   ```bash
   # From the root directory
   ./start.bat
   ```

---

## 📂 Project Structure

```text
├── backend/            # Express server & API routes
│   ├── src/            # Controllers, Models, Routes, Middleware
│   └── uploads/        # Product image storage
├── frontend/           # Client-side files
│   ├── css/            # Custom style sheets
│   ├── js/             # API handlers & UI logic
│   └── pages/          # Shop, About, Contact, etc.
├── docs/               # Project documentation & assets
└── Dockerfile          # Containerization support
```

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Mohammed-Zakee">Mohammed Zakee</a>
</p>
