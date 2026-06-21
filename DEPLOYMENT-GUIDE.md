# 🚀 PANDUAN DEPLOYMENT MILESAPP KE HOSTING + DOMAIN

## 📋 JENIS HOSTING - PILIH SESUAI ANDA

| Jenis Hosting | cPanel/Shared | VPS | Cloud (Railway/Render) |
|---------------|---------------|-----|------------------------|
| SQLite support | ✅ Bisa | ✅ Bisa | ❌ Harus PostgreSQL |
| Tingkat kesulitan | Mudah | Menengah | Mudah |

---

## 📗 PANDUAN A: SHARED HOSTING (cPANEL dengan Node.js)

### Step 1: Download Project dari GitHub
1. Buka https://github.com/disalaliwakowloon/milesapp
2. Klik tombol hijau **"Code"** → **"Download ZIP"**
3. Extract ZIP ke folder, misal: `Documents/MilesApp`

### Step 2: Upload Project ke Hosting
1. Login ke cPanel hosting Anda
2. Buka **File Manager**
3. Masuk ke folder `public_html`
4. Klik **Upload** → upload file ZIP project
5. **Extract** file ZIP di folder `public_html`
6. Hapus file ZIP setelah extract

### Step 3: Setup Node.js App di cPanel
1. cPanel → cari **"Setup Node.js App"**
2. Klik **"Create Application"**:
   - Node.js version: **20.x**
   - Application mode: **Production**
   - Application root: `public_html`
   - Application URL: domain-anda.com
   - Application startup file: `app.js`
3. Klik **Create**

### Step 4: Install Dependencies
Buka **Terminal** di cPanel:
```bash
cd public_html
npm install
```

### Step 5: Build & Setup Database
```bash
cd public_html
npx prisma generate
npx prisma db push
npx tsx seed.ts
npm run build
```

### Step 6: Edit .env
Edit file `.env` di File Manager:
```
DATABASE_URL=file:./db/custom.db
NODE_ENV=production
PORT=3000
```

### Step 7: Restart & Test
1. Klik **Restart** di Node.js App cPanel
2. Buka `https://domain-anda.com`
3. Login: `laliwagroup88` / `laliwa88`

---

## 📘 PANDUAN B: VPS (DigitalOcean/Vultr/Hetzner)

### Step 1: Upload Project
```bash
# Download dari GitHub ke VPS
git clone https://github.com/disalaliwakowloon/milesapp.git /var/www/milesapp
```

### Step 2: Install Node.js + Bun + PM2 + Nginx
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
npm install -g pm2
```

### Step 3: Build & Setup
```bash
cd /var/www/milesapp
bun install
nano .env  # set DATABASE_URL=file:/var/www/milesapp/db/custom.db
bun run db:generate
bun run db:push
bun run seed
bun run build
```

### Step 4: Start dengan PM2
```bash
cd /var/www/milesapp
pm2 start "bun run start:bun" --name milesapp
pm2 save
pm2 startup
```

### Step 5: Setup Nginx + SSL
```bash
cp nginx-milesapp.conf /etc/nginx/sites-available/milesapp
nano /etc/nginx/sites-available/milesapp  # ganti domain-anda.com
ln -s /etc/nginx/sites-available/milesapp /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
apt install -y certbot python3-certbot-nginx
certbot --nginx -d domain-anda.com
```

---

## 🌐 SETUP DOMAIN

Jika domain & hosting di tempat berbeda:
1. Login panel domain
2. **DNS Management** → tambah **A Record**:
   - Name: `@`
   - Value: `IP_HOSTING_ANDA`
3. Tambah **A Record** untuk www:
   - Name: `www`
   - Value: `IP_HOSTING_ANDA`
4. Tunggu 1-24 jam propagasi DNS

---

## ⚠️ TROUBLESHOOTING

### "Application Error" / 502 Bad Gateway
```bash
pm2 status
pm2 restart milesapp
```

### Database error
```bash
chmod -R 755 db/
bun run db:push
```

### Build error
```bash
rm -rf .next node_modules
bun install
bun run build
```

---

## ✅ CHECKLIST FINAL
- [ ] Project di-upload ke hosting
- [ ] `npm install` / `bun install` berhasil
- [ ] `.env` path database benar
- [ ] `prisma db push` + `seed` berhasil
- [ ] `npm run build` berhasil
- [ ] Aplikasi berjalan
- [ ] Domain mengarah ke hosting
- [ ] SSL/HTTPS aktif
- [ ] Login admin berhasil
- [ ] **Password admin diganti** (penting!)

---

## 🔐 ADMIN LOGIN
- Username: `laliwagroup88`
- Password: `laliwa88`
- ⚠️ GANTI password setelah login pertama!
