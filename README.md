Markdown

# 🏨 Guest Room Booking Application

This is a full-stack web application designed for house owners to list and manage rooms for short-term paying guests, and for customers to browse, book, and manage their stays.

---

## ✨ Features

This application offers distinct functionalities for two types of users: House Owners and Customers, along with common functionalities for everyone.

### Common Features (For All Users)
* **Home Page:** An engaging introduction to the platform.
* **Room Listings:** Browse a public list of all available rooms from various owners.
* **Room Details Page:** View comprehensive information, photos, and availability for a selected room.
* **Login & Registration:** Users can create accounts and log in as either a Customer or a House Owner.
* **404 Error Page:** A custom page for invalid URLs.

### House Owner Features
* **Owner Dashboard:** A personalized summary of listed rooms and upcoming bookings.
* **Add Room:** Easily create new room listings with details like name, size, number of beds, amenities, daily rent, booking limits, and upload photos.
* **Manage Rooms:** View, edit, or delete existing room listings.
* **Booking Management:** See all bookings made for their rooms, and update booking statuses (e.g., confirm, complete, cancel).
* **Profile Management:** View and update personal account details.

### Customer Features
* **Customer Dashboard:** A personalized overview of current bookings.
* **Book a Room:** Select check-in/check-out dates using an interactive calendar, see total price, and confirm bookings. The calendar displays already booked dates.
* **Booking History:** View a list of all past and upcoming bookings, with an option to cancel upcoming ones.
* **Profile Management:** View and update personal account details.

---

## ⚙️ Technologies Used

This project is built using a modern MERN stack.

### Frontend
* **React.js:** A powerful JavaScript library for building user interfaces.
* **React Router DOM:** For client-side routing and navigation.
* **Axios:** For making HTTP requests to the backend API.
* **React DatePicker:** An intuitive calendar component for date selection.
* **CSS3:** For styling and ensuring a responsive, attractive, and professional design.

### Backend
* **Node.js:** JavaScript runtime environment.
* **Express.js:** A fast, unopinionated, minimalist web framework for Node.js.
* **Mongoose:** An ODM (Object Data Modeling) library for MongoDB and Node.js.
* **MongoDB Atlas:** A cloud-hosted NoSQL database for storing application data.
* **bcryptjs:** For securely hashing passwords.
* **jsonwebtoken (JWT):** For user authentication and authorization.
* **multer:** Middleware for handling `multipart/form-data`, primarily for file uploads (room images).
* **dotenv:** For managing environment variables securely.
* **cors:** For enabling Cross-Origin Resource Sharing.

---

## 🚀 Getting Started

Follow these steps to get the project up and running on your local machine for development and testing.

### Prerequisites

Make sure you have the following installed:
* Node.js (v18.x or later recommended)
* npm (comes with Node.js)
* MongoDB Atlas Account (Free tier is sufficient)
* Git

### 1. Clone the Repository

First, clone this entire project (which contains both frontend and backend folders) to your local machine:

```bash
git clone [https://github.com/GOKULS07/Room_Booker.git](https://github.com/GOKULS07/Room_Booker.git)
cd Room_Booker
2. Backend Setup
The backend handles the API and database interactions.

Navigate to the backend directory:

Bash

cd guest-room-booking-backend
Install backend dependencies:

Bash

npm install
Set up Environment Variables (.env file):

Create a file named .env in the guest-room-booking-backend directory (next to package.json).

Add the following variables:

Code snippet

MONGO_URI=your_mongodb_atlas_connection_string_here
PORT=5000
JWT_SECRET=your_super_strong_random_jwt_secret_here
BACKEND_DEPLOYED_URL=[https://room-booker.onrender.com](https://room-booker.onrender.com)
MONGO_URI: Get this from your MongoDB Atlas dashboard. Remember to replace <username> and <password> with your database user's credentials. Example: mongodb+srv://user:password@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority

JWT_SECRET: Generate a long, random string. You can use node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" in your terminal.

BACKEND_DEPLOYED_URL: This is crucial for your images to load correctly on deployment. Set it to your Render service's public URL: https://room-booker.onrender.com.

Start the backend server:

Bash

npm start
You should see messages like "MongoDB Atlas Connected" and "Server running on port 5000".

3. Frontend Setup
The frontend is your React application.

Navigate to the frontend directory (in a new terminal tab/window):

Bash

cd ../guest-room-booking-frontend
(If you're already in the Room_Booker folder, you might need cd guest-room-booking-frontend directly).

Install frontend dependencies:

Bash

npm install
Configure Frontend Backend URL (.env.development for local, Vercel for deploy):

Important Code Change: In all your frontend files where you make axios calls (e.g., src/contexts/AuthContext.js, src/pages/RoomListPage.js, etc.), ensure http://localhost:5000 is replaced with ${process.env.REACT_APP_BACKEND_URL}. This is how your React app will dynamically know where to send requests.

For local development: If you want your local frontend to talk to your local backend, create a file named .env.development in your guest-room-booking-frontend directory.

Code snippet

REACT_APP_BACKEND_URL=http://localhost:5000
(This file is typically ignored by Git, which is good. For deployment, Vercel will override this with its own environment variable).

Start the frontend development server:

Bash

npm start
Your application should open in your browser at http://localhost:3000.

▶️ Running the Application
Ensure your backend server is running (from guest-room-booking-backend folder): npm start

Ensure your frontend development server is running (from guest-room-booking-frontend folder): npm start

Open your browser and go to http://localhost:3000.

📄 Database Schema
Your database design is based on the following Mongoose schemas:

1. User Collection (User.js)
Stores user authentication and role information.

Collection Name: users

- _id: ObjectId (Unique identifier, auto-generated)
- email: String (Unique, Required, Trimmed, Lowercase)
- password: String (Required, Hashed)
- mobileNumber: String (Unique, Required, Trimmed)
- role: String (Required, Enum: 'customer', 'house_owner')
- createdAt: Date (Auto-generated timestamp)
- updatedAt: Date (Auto-generated timestamp)
2. Room Collection (Room.js)
Stores details about each room listing.

Collection Name: rooms

- _id: ObjectId (Unique identifier, auto-generated)
- owner: ObjectId (Required, References 'User' collection - this is the house_owner)
- name: String (Required, Trimmed)
- floorSize: Number (Required)
- numberOfBeds: Number (Required)
- amenities: [String] (Array of strings, default: [])
- dailyRentAmount: Number (Required)
- minBookingDays: Number (Default: 1)
- maxBookingDays: Number (Default: 30)
- photos: [String] (Array of image URLs as strings, default: [])
- description: String (Trimmed, default: '')
- isAvailable: Boolean (Default: true)
- createdAt: Date (Auto-generated timestamp)
- updatedAt: Date (Auto-generated timestamp)
3. Booking Collection (Booking.js)
Stores information about each room booking.

Collection Name: bookings

- _id: ObjectId (Unique identifier, auto-generated)
- room: ObjectId (Required, References 'Room' collection)
- customer: ObjectId (Required, References 'User' collection - the customer who made the booking)
- owner: ObjectId (Required, References 'User' collection - the owner of the booked room)
- checkInDate: Date (Required)
- checkOutDate: Date (Required)
- totalPrice: Number (Required)
- status: String (Enum: 'pending', 'confirmed', 'completed', 'cancelled', default: 'pending')
- createdAt: Date (Auto-generated timestamp)
- updatedAt: Date (Auto-generated timestamp)
📊 Sample Data
The easiest and most realistic way to get sample data into your database (and ensure correct linking between users, rooms, and bookings) is by using your application's own API endpoints after your backend server is running.

How to Generate Sample Data:
Ensure your backend server is running (npm start in guest-room-booking-backend).

Ensure your frontend server is running (npm start in guest-room-booking-frontend).

Register Users:

Go to http://localhost:3000/register.

Register a few house_owner users (e.g., owner1@example.com, owner2@example.com with unique mobile numbers and passwords).

Register a few customer users (e.g., customer1@example.com, customer2@example.com with unique mobile numbers and passwords).

Add Rooms:

Log in as one of your house_owner accounts (e.g., owner1@example.com).

Go to /owner/add-room.

Add several room listings, providing all details and uploading actual image files. This will populate your rooms collection.

Repeat with owner2@example.com to add more rooms.

Create Bookings:

Log in as one of your customer accounts (e.g., customer1@example.com).

Go to /rooms and browse the listings.

Click "View Details" on a room, then click "Book Now". Select dates and confirm the booking. This will populate your bookings collection.

Repeat with customer2@example.com to add more bookings.

To Extract Sample Data for Submission:
After generating data using the above method, you can connect to your MongoDB Atlas cluster using MongoDB Compass:

Connect to your cluster using your MONGO_URI.

Go to the users, rooms, and bookings collections.

You can then use the "Export Collection" feature in Compass to save the data as .json files (e.g., sample_users.json, sample_rooms.json, sample_bookings.json).

These .json files will contain your actual ObjectIds and hashed passwords (for users), making them perfectly representative of your sample data.

🌐 Deployment
This project uses Vercel for frontend hosting and Render for backend hosting.

1. Deploying the Frontend (Vercel)
Push Frontend Code to GitHub: Ensure your guest-room-booking-frontend directory is a separate GitHub repository (or part of a monorepo).

Connect Vercel:

Go to vercel.com and log in (e.g., with GitHub).

Click "Add New..." -> "Project".

"Import Git Repository" and select your frontend GitHub repository (e.g., Room_Booker if it's a monorepo).

Important: For "Root Directory", make sure it points to your frontend folder (e.g., guest-room-booking-frontend).

Vercel usually auto-detects "Create React App".

Set Environment Variable on Vercel:

After the initial deployment settings, go to your Vercel project's "Settings" tab -> "Environment Variables".

Add a new variable:

Name: REACT_APP_BACKEND_URL

Value: https://room-booker.onrender.com (Your deployed Render backend URL)

Save this variable.

Trigger Redeployment: Go to "Deployments" and "Redeploy" the latest successful build, or push a small change to GitHub to trigger a new build. This ensures the frontend picks up the new backend URL.

2. Deploying the Backend (Render)
Push Backend Code to GitHub: Ensure your guest-room-booking-backend directory is in a GitHub repository.

Connect Render:

Go to render.com and log in (e.g., with GitHub).

Click "New" -> "Web Service".

"Connect Git Repository" and select your backend GitHub repository (e.g., Room_Booker if it's a monorepo).

Important: For "Root Directory", set it to your backend folder (e.g., guest-room-booking-backend).

Configure Build & Start Commands:

Name: room-booker-api (or your chosen name)

Region: Choose a region close to your MongoDB Atlas.

Runtime: Node.

Build Command: npm install

Start Command: npm start

Plan: Free.

Set Environment Variables on Render:

Before creating the service, go to "Advanced" (or after creation, in "Settings" -> "Environment Variables").

Add these variables:

MONGO_URI: Your full MongoDB Atlas connection string.

JWT_SECRET: The same strong secret you used in your backend's local .env file.

BACKEND_DEPLOYED_URL: https://room-booker.onrender.com (This is critical for image URLs to be correctly stored in your database by your backend).

Save variables and click "Create Web Service".

📁 Project Structure (Monorepo Example)
Room_Booker/
├── guest-room-booking-backend/
│   ├── node_modules/
│   ├── .env                   # Backend environment variables
│   ├── index.js               # Main Express server file
│   ├── package.json           # Backend dependencies and scripts
│   ├── config/
│   │   └── db.js              # Database connection setup
│   ├── models/
│   │   ├── User.js            # Mongoose User model
│   │   ├── Room.js            # Mongoose Room model
│   │   └── Booking.js         # Mongoose Booking model
│   ├── controllers/
│   │   ├── authController.js  # Logic for user auth
│   │   ├── roomController.js  # Logic for room CRUD
│   │   └── bookingController.js # Logic for booking management
│   ├── middleware/
│   │   └── authMiddleware.js  # Authentication and authorization middleware
│   ├── routes/
│   │   ├── authRoutes.js      # API routes for authentication
│   │   ├── roomRoutes.js      # API routes for rooms
│   │   └── bookingRoutes.js   # API routes for bookings
│   └── uploads/               # Directory where uploaded room images are stored locally (on server)
│
├── guest-room-booking-frontend/
│   ├── node_modules/
│   ├── .env.development       # Local frontend environment variables (optional, for local testing)
│   ├── package.json           # Frontend dependencies and scripts
│   ├── public/                # Static assets like images (e.g., Tranquil Elegance Bedroom.png)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js      # Navigation bar component
│   │   │   └── ProtectedRoute.js # Route protection component
│   │   ├── contexts/
│   │   │   └── AuthContext.js # User authentication context
│   │   ├── pages/
│   │   │   ├── HomePage.js    # Main landing page
│   │   │   ├── LoginPage.js   # User login form
│   │   │   ├── RegisterPage.js # User registration form
│   │   │   ├── RoomListPage.js # Browse all rooms
│   │   │   ├── RoomDetailsPage.js # Detailed room view
│   │   │   ├── NotFoundPage.js # 404 page
│   │   │   ├── owner/         # House owner specific pages
│   │   │   │   ├── OwnerDashboard.js
│   │   │   │   ├── AddRoomPage.js
│   │   │   │   ├── ManageRoomsPage.js
│   │   │   │   ├── EditRoomPage.js
│   │   │   │   ├── BookingManagementPage.js
│   │   │   │   └── ProfilePage.js
│   │   │   └── customer/      # Customer specific pages
│   │   │       ├── CustomerDashboard.js
│   │   │       ├── BookingPage.js
│   │   │       ├── BookingHistoryPage.js
│   │   │       └── ProfilePage.js
│   │   ├── App.js             # Main React application component
│   │   └── index.js           # React app entry point
│   └── .gitignore
│
└── .gitignore                 # Root .gitignore for the whole monorepo (if applicable)
⚠️ Notes & Troubleshooting
JWT Expired / 401 Unauthorized: If you get 401 Unauthorized errors after logging in, your JWT token might have expired (they last 1 hour) or your JWT_SECRET in .env might have changed. Clear your browser's Local Storage (F12 -> Application -> Local Storage -> Clear) and log in/register again.

Image Loading Issues (Mixed Content / ERR_CONNECTION_REFUSED):

This often happens if room images were uploaded while your backend was running locally. The URLs in your database will be http://localhost:5000/uploads/....

Fix: Manually update these photos URLs in your MongoDB Atlas database to https://room-booker.onrender.com/uploads/.... Also, ensure your backend roomController.js is updated to store the BACKEND_DEPLOYED_URL for new uploads.

"Module not found: axios" on Vercel: Ensure axios is listed in your guest-room-booking-frontend/package.json under dependencies.

"package.json not found" on Render: Double-check that you set the "Root Directory" in Render's web service settings to guest-room-booking-backend (or your actual backend folder name).

react-datepicker Warnings: Warnings about "Failed to parse source map" from react-datepicker are generally harmless and don't prevent your app from working. You can usually ignore them during development.

✍️ Author
Gokul S

Email: gokuls962005@gmail.com

LinkedIn: https://www.linkedin.com/in/gokuls07/

GitHub: https://github.com/GOKULS07

