
// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const routes = require('./routes');
// const path = require('path');

// const app = express();
// app.use(express.json({ limit: '8mb' }));
// app.use(cors());

// // Serve uploads directory so local-saved images are reachable at /uploads/<filename>
// const uploadsPath = path.join(process.cwd(), 'uploads');
// app.use('/uploads', express.static(uploadsPath));

// app.use('/api', routes);

// // basic error handler
// app.use((err, req, res, next) => {
//   console.error(err);
//   // Give more useful message when axios error includes response body
//   if (err.response && err.response.data) {
//     // attach remote service body for easier debugging (you can remove before prod)
//     return res.status(err.response.status || 500).json({ error: err.message || 'Server error', remote: err.response.data });
//   }
//   res.status(err.status || 500).json({ error: err.message || 'Server error' });
// });

// const PORT = process.env.PORT || 4000;
// mongoose.connect(process.env.MONGO_URI)
//   .then(()=> {
//     console.log('Mongo connected');
//     app.listen(PORT, ()=> console.log(`Server running on ${PORT}`));
//   })
//   .catch(err => {
//     console.error('Mongo connection error', err);
//     process.exit(1);
//   });

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./routes');

const app = express();

// body parsers
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true, limit: '8mb' }));
app.use(cors());

// serve uploads if STORAGE_TYPE != cloudinary (for local dev)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api', routes);

// improved error handler that prints stack in dev
app.use((err, req, res, next) => {
  console.error('ERROR HANDLER:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Server error',
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {})
  });
});

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Mongo connected');
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch(err => {
    console.error('Mongo connection error', err);
    process.exit(1);
  });
