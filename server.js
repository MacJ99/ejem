// server.js
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

// Carpeta de imágenes
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Middleware
app.use(express.json());
app.use(express.static(__dirname)); // sirve index.html y demás
app.use('/uploads', express.static(uploadDir));

// Ruta para obtener publicaciones
app.get('/api/posts', (req, res) => {
  fs.readFile('posts.json', 'utf8', (err, data) => {
    if (err) return res.json([]);
    res.json(JSON.parse(data));
  });
});

// Ruta para subir publicación
app.post('/api/posts', upload.single('image'), (req, res) => {
  const { title, desc } = req.body;
  const imageUrl = '/uploads/' + req.file.filename;

  const newPost = {
    id: Date.now(),
    title,
    desc,
    imageUrl,
    createdAt: Date.now()
  };

  fs.readFile('posts.json', 'utf8', (err, data) => {
    let posts = [];
    if (!err && data) posts = JSON.parse(data);
    posts.push(newPost);
    fs.writeFile('posts.json', JSON.stringify(posts, null, 2), () => {
      res.json(newPost);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
