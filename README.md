---> Visual Matcher Backend

An AI-powered image similarity search backend built with **Node.js**, **Express**, and **MongoDB**.  
This service allows you to upload or provide image URLs, automatically generate **visual embeddings** using **Hugging Face CLIP**, and find similar products based on image content.

---

## Features

- Upload images via file or URL  
- Store image embeddings in MongoDB  
- Search for visually similar products  
- Uses **Hugging Face CLIP embeddings** (or local mock embeddings for dev)  
- Optional **Cloudinary** storage support  
- REST API ready for frontend integration (React/Vite frontend supported)

---

##  Tech Stack

- **Node.js** + **Express** — API framework  
- **MongoDB + Mongoose** — Database  
- **Multer** — File upload handling  
- **Cloudinary** — Image storage (optional)  
- **Hugging Face API** — Image embeddings  
- **Pixabay API** — For seeding sample product images  

---

## 📂 Folder Structure

src/
├── app.js # Express app entry
├── controllers/ # Route logic (upload, search, product)
├── models/ # Mongoose schemas
├── routes/ # API routes
├── seed/ # Script to seed DB from Pixabay
├── services/ # Embedding + storage services
├── utils/ # Math helpers (cosine similarity)
└── uploads/ # Local image uploads (if not using Cloudinary)

yaml
Copy code

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```bash
PORT=4000
MONGO_URI=mongodb+srv://<your-mongo-uri>
HUGGINGFACE_API_TOKEN=<your-huggingface-token>
HF_EMBEDDING_MODEL=openai/clip-vit-base-patch32
PIXABAY_API_KEY=<your-pixabay-key>
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
STORAGE_TYPE=cloudinary
SERVER_BASE_URL=http://localhost:4000
NODE_ENV=development
SKIP_HF_EMBEDDINGS=true
Notes:

Set SKIP_HF_EMBEDDINGS=true to use fake embeddings during local dev (faster, no API cost).

Set STORAGE_TYPE=cloudinary to upload images to Cloudinary.
If omitted, uploads will be stored locally in /uploads.

🧩 Installation
bash
Copy code
# 1 Clone the repository
git clone https://github.com/Anuj-Parihar/visual-matcher-backend.git
cd visual-matcher-backend

# 2️ Install dependencies
npm install

# 3️ Set up .env (see section above)

# 4️ Start the development server
npm run dev
Server will start on:

arduino
Copy code
http://localhost:4000
---> Seeding Sample Products
You can auto-populate the database with example products using Pixabay images:

bash
Copy code
npm run seed
This script:

Fetches random images from Pixabay (shoes, bags, watches, etc.)

Generates embeddings (real or mock)

Saves them in MongoDB

---> API Endpoints
Method	Endpoint	Description
GET	/api/products	List all products (paginated)
POST	/api/upload	Upload image (file or URL) to store as product
POST	/api/search	Search similar products by uploaded image or URL
GET	/health	Simple health check endpoint

🔹 /api/upload
Request (multipart/form-data):

file: image file (optional)

url: image URL (optional)

name, category, metadata (optional fields)

Response:

json
Copy code
{
  "ok": true,
  "product": {
    "_id": "...",
    "name": "Uploaded Product",
    "imageUrl": "...",
    "category": "unknown"
  }
}
🔹 /api/search
Request (multipart/form-data or JSON):

file: uploaded image (optional)

url: image URL (optional)

k: number of similar results to return (default: 10)

Response:

json
Copy code
{
  "results": [
    { "product": { "_id": "...", "name": "...", "imageUrl": "..." }, "score": 0.89 },
    { "product": { "_id": "...", "name": "...", "imageUrl": "..." }, "score": 0.83 }
  ]
}
🧰 Development Tips
To test locally without hitting Hugging Face API:

bash
Copy code
SKIP_HF_EMBEDDINGS=true
To test Cloudinary integration, ensure CLOUDINARY_URL is set.

To inspect uploads locally, open:

bash
Copy code
http://localhost:4000/uploads/
🧾 Example Frontend Integration
You can connect this backend to a React/Vite frontend that:

Displays all products (/api/products)

Allows uploading or selecting an image

Shows visually similar results ranked by cosine similarity

-->Scripts
Command	Description
npm start	Run server in production
npm run dev	Run with Nodemon (auto-reload)
npm run seed	Fetch and insert sample products from Pixabay

-->Author
Anuj Parihar
anujparihar.tech@gmail.com
🌐 https://github.com/Anuj-Parihar

