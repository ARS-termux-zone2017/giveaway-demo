const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'change_this_secret', resave: false, saveUninitialized: false }));

let db = { entries: [], siteText: "Welcome to the Giveaway!" };
if (fs.existsSync(DATA_FILE)) {
  try { db = JSON.parse(fs.readFileSync(DATA_FILE)); } catch(e){ }
}
function saveDB() { fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2)); }

app.get('/', (req, res) => res.render('index', { siteText: db.siteText }));

app.post('/enter', (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim();
  if (!name || !email) return res.render('index', { siteText: db.siteText, error: 'Name and email required' });
  db.entries.push({ name, email, time: new Date().toISOString() });
  saveDB();
  res.render('thanks', { name });
});

const ADMIN_PASS = 'admin123';
app.get('/admin/login', (req, res) => res.render('admin_login'));
app.post('/admin/login', (req, res) => {
  if (req.body.password === ADMIN_PASS) { req.session.admin = true; return res.redirect('/admin'); }
  res.render('admin_login', { error: 'Wrong password' });
});

function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.redirect('/admin/login');
}

app.get('/admin', requireAdmin, (req, res) => res.render('admin', { entries: db.entries, siteText: db.siteText }));
app.post('/admin/update-text', requireAdmin, (req, res) => {
  db.siteText = String(req.body.siteText || '').slice(0, 1000);
  saveDB();
  res.redirect('/admin');
});
app.post('/admin/clear', requireAdmin, (req, res) => {
  db.entries = [];
  saveDB();
  res.redirect('/admin');
});

app.get('/demo/media', (req, res) => res.render('media_demo'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Demo app running → http://localhost:${PORT}`));
