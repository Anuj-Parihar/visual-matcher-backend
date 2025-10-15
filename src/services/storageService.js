

// // // services/storageService.js
// // const fs = require('fs');
// // const path = require('path');
// // const cloudinary = require('cloudinary').v2;

// // if (process.env.CLOUDINARY_URL) {
// //   cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
// // }

// // async function uploadBuffer(fileBuffer, filename) {
// //   // Cloudinary path (unchanged)
// //   if (process.env.STORAGE_TYPE === 'cloudinary' && process.env.CLOUDINARY_URL) {
// //     // wrap upload_stream in a Promise
// //     return await new Promise((resolve, reject) => {
// //       const stream = cloudinary.uploader.upload_stream({ folder: 'visual-matcher' }, (error, result) => {
// //         if (error) return reject(error);
// //         return resolve(result.secure_url);
// //       });
// //       stream.end(fileBuffer);
// //     });
// //   } else {
// //     // Save locally to <project-root>/uploads
// //     // Use process.cwd() so behavior is consistent regardless of __dirname expectation
// //     const uploadsDir = path.join(process.cwd(), 'uploads');
// //     if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// //     const outPath = path.join(uploadsDir, filename);
// //     fs.writeFileSync(outPath, fileBuffer);

// //     // Build a public URL for the saved file. Must match how the express server serves /uploads.
// //     const base = process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
// //     // Ensure no double slashes
// //     return `${base.replace(/\/+$/, '')}/uploads/${encodeURIComponent(filename)}`;
// //   }
// // }

// // module.exports = { uploadBuffer };


// const fs = require('fs');
// const path = require('path');
// const cloudinary = require('cloudinary').v2;
// const streamifier = require('streamifier');

// if (process.env.CLOUDINARY_URL) {
//   cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
// }

// // uploads buffer to cloudinary if configured, else writes to /uploads and returns a local url
// async function uploadBuffer(fileBuffer, filename) {
//   if (process.env.STORAGE_TYPE === 'cloudinary' && process.env.CLOUDINARY_URL) {
//     return new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream({ folder: 'visual-matcher' }, (error, result) => {
//         if (error) return reject(error);
//         resolve(result.secure_url);
//       });
//       streamifier.createReadStream(fileBuffer).pipe(stream);
//     });
//   } else {
//     const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
//     if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
//     const outPath = path.join(uploadsDir, filename);
//     fs.writeFileSync(outPath, fileBuffer);
//     const base = process.env.SERVER_BASE_URL || 'http://localhost:4000';
//     return `${base}/uploads/${filename}`;
//   }
// }

// module.exports = { uploadBuffer };


const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

if (process.env.CLOUDINARY_URL) cloudinary.config();

async function uploadBuffer(fileBuffer, filename) {
  if (process.env.STORAGE_TYPE === 'cloudinary' && process.env.CLOUDINARY_URL) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'visual-matcher' },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          resolve(result.secure_url);
        }
      );
      streamifier.createReadStream(fileBuffer).pipe(stream);
    });
  }

  const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const outPath = path.join(uploadsDir, filename);
  fs.writeFileSync(outPath, fileBuffer);
  const base = process.env.SERVER_BASE_URL || 'http://localhost:4000';
  return `${base}/uploads/${filename}`;
}

module.exports = { uploadBuffer };
