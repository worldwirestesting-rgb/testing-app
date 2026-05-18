const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // A kliens (PWA) küldheti a kívánt célmappát a 'targetPath' mezőben.
    // Ha nem küld (vagy üres), egy alapértelmezett hálózati utat használunk.
    const defaultNetworkPath = '\\\\10.0.0.220\\adat\\Testing\\Wettech Images';
    let targetDir = req.body.targetPath && req.body.targetPath.trim() !== '' 
      ? req.body.targetPath.trim() 
      : defaultNetworkPath;

    const fallbackDir = path.join(__dirname, 'uploads_fallback');
    let finalDir = targetDir;
    
    req.networkFailed = false;
    
    try {
      // Megpróbáljuk elérni a mappát írási joggal (W_OK)
      // Ez azonnal hibát dob, ha nincs meg a mappa, vagy nincs hozzá jogosultságunk (pl. jelszó védi)
      fs.accessSync(targetDir, fs.constants.W_OK);
      finalDir = targetDir;
    } catch(e) {
      req.networkFailed = true;
      console.error(`\n---------------------------------------------------------`);
      console.error(`[HIBA!] Nem tudtam menteni a kért hálózati mappába!`);
      console.error(`[HIBA RÉSZLETEK]: ${e.message}`);
      if (e.code === 'ENOENT') {
         console.error(`[OK]: A mappa nem létezik, vagy elírtad az útvonalat.`);
      } else if (e.code === 'EPERM' || e.code === 'EACCES') {
         console.error(`[OK]: Nincs írási jogod ehhez a mappához (lehet, hogy jelszavas a hálózati megosztás?).`);
      }
      console.error(`[MEGOLDÁS]: A fájlt biztonsági okokból a helyi Fallback mappába teszem.`);
      console.error(`---------------------------------------------------------\n`);
      
      if (!fs.existsSync(fallbackDir)) {
        try {
          fs.mkdirSync(fallbackDir, { recursive: true });
        } catch (mkdirErr) {
          console.error(`Kritikus hiba: Még a fallback mappát sem tudtam létrehozni!`, mkdirErr);
        }
      }
      finalDir = fallbackDir;
    }
    
    cb(null, finalDir);
  },
  filename: function (req, file, cb) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const finalName = `${timestamp}_${randomSuffix}${ext}`;
    console.log(`[UPLOAD] Kép fogadva, fájlnév: ${finalName}`);
    cb(null, finalName);
  }
});

const upload = multer({ storage: storage });

// POST endpoint, feltöltés fogadása
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Nincs fájl kiválasztva vagy hiba történt.' });
  }

  console.log(`[SUCCESS] Sikeres mentés ide: ${req.file.destination}\\${req.file.filename}`);

  res.json({
    success: true,
    message: 'Kép sikeresen feltöltve!',
    filename: req.file.filename,
    path: req.file.destination,
    networkSuccess: !req.networkFailed
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`==========================================`);
  console.log(`   Weetech Backend Server Fut!`);
  console.log(`   Elérhető a lokális hálózaton a 3000-es porton.`);
  console.log(`==========================================`);
});
