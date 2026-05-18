import './style.css';

// ----------------------------------------------------
// NÉZETEK (VIEW) KEZELÉSE
// ----------------------------------------------------
const views = {
  launcher: document.getElementById('launcher-view'),
  pin: document.getElementById('pin-view'),
  resizer: document.getElementById('resizer-view')
};

function showView(viewName) {
  Object.values(views).forEach(v => {
    if (v) {
      v.classList.remove('active');
      v.classList.add('hidden');
    }
  });
  views[viewName].classList.remove('hidden');
  views[viewName].classList.add('active');
}

// Navigációs gombok
document.getElementById('btn-open-pin')?.addEventListener('click', () => {
  showView('pin');
});

document.getElementById('btn-open-resizer')?.addEventListener('click', () => {
  showView('resizer');
});

document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    showView('launcher');
  });
});

// ----------------------------------------------------
// PIN KERESŐ LOGIKA
// ----------------------------------------------------
let pinData = [];
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const tableBody = document.getElementById('tableBody');
const highlightFrame = document.getElementById('highlightFrame');
const highlightLabel = document.getElementById('highlightLabel');

function generatePinData() {
  const data = [];
  for (let i = 1; i <= 576; i++) {
    const major = Math.floor((i - 1) / 64) + 1;
    const minor = ((i - 1) % 64) + 1;
    const ip_group = Math.floor((i - 1) / 32) + 1;
    const ip_pin = ((i - 1) % 32) + 1;
    data.push({ p1: String(i), p2: `${major}.${minor}`, p3: `IP${ip_group}-${ip_pin}` });
  }
  return data;
}

function renderPinTable(data) {
  if (!tableBody) return;
  const fragment = document.createDocumentFragment();
  data.forEach(item => {
    const tr = document.createElement('tr');
    ['p1', 'p2', 'p3'].forEach(key => {
      const td = document.createElement('td');
      td.textContent = item[key];
      tr.appendChild(td);
    });
    fragment.appendChild(tr);
  });
  tableBody.innerHTML = '';
  tableBody.appendChild(fragment);
}

function onPinSearch() {
  const text = searchInput.value.trim().toLowerCase();
  clearBtn.style.display = text ? 'flex' : 'none';
  
  if (!text) {
    highlightFrame.classList.add('hidden');
    renderPinTable(pinData);
    return;
  }
  
  let exactMatch = null;
  const filtered = [];
  
  pinData.forEach(item => {
    if (item.p1.toLowerCase() === text || item.p2.toLowerCase() === text || item.p3.toLowerCase() === text) {
      exactMatch = item;
    }
    if (item.p1.toLowerCase().includes(text) || item.p2.toLowerCase().includes(text) || item.p3.toLowerCase().includes(text)) {
      filtered.push(item);
    }
  });
  
  if (exactMatch) {
    highlightLabel.textContent = `Találat:\n${exactMatch.p1}  ↔  ${exactMatch.p2}  ↔  ${exactMatch.p3}`;
    highlightFrame.classList.remove('hidden');
  } else {
    highlightFrame.classList.add('hidden');
  }
  
  renderPinTable(filtered);
}

if (searchInput) {
  searchInput.addEventListener('input', onPinSearch);
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    onPinSearch();
    searchInput.focus();
  });
}

// ----------------------------------------------------
// IMAGE RESIZER LOGIKA
// ----------------------------------------------------
const fileInput = document.getElementById('file-input');
const uploadBox = document.getElementById('upload-box');
const fileNameDisplay = document.getElementById('file-name');
const previewContainer = document.getElementById('preview-container');
const imagePreview = document.getElementById('image-preview');
const btnProcess = document.getElementById('btn-process-upload');
const statusMsg = document.getElementById('resizer-status');

let selectedFile = null;
let resizedBlob = null;

const imageWidthInput = document.getElementById('image-width-input');

// ----------------------------------------------------
// SERVER PROFILES LOGIC
// ----------------------------------------------------
const profileSelect = document.getElementById('profile-select');
const btnNewProfile = document.getElementById('btn-new-profile');
const btnDeleteProfile = document.getElementById('btn-delete-profile');
const newProfileForm = document.getElementById('new-profile-form');
const btnSaveProfile = document.getElementById('btn-save-profile');
const btnCancelProfile = document.getElementById('btn-cancel-profile');

const newProfName = document.getElementById('new-prof-name');
const newProfIp = document.getElementById('new-prof-ip');
const newProfPath = document.getElementById('new-prof-path');

// Alapértelmezett beépített profil (ha még nincs semmi mentve)
const defaultProfiles = [
  {
    id: 'default_1',
    name: 'Alapértelmezett (10.0.0.220)',
    ip: 'localhost',
    path: '\\\\10.0.0.220\\adat\\Testing\\Wettech Images'
  }
];

let serverProfiles = JSON.parse(localStorage.getItem('weetech_server_profiles_v2')) || defaultProfiles;

// Ha a régi verziós mentés él (ahol még a "weetech images" volt a mappa), töröljük és felülírjuk:
if (localStorage.getItem('weetech_server_profiles') && !localStorage.getItem('weetech_server_profiles_v2')) {
  serverProfiles = defaultProfiles;
  localStorage.removeItem('weetech_server_profiles');
}

let activeProfileId = localStorage.getItem('weetech_active_profile') || serverProfiles[0].id;

function saveProfiles() {
  localStorage.setItem('weetech_server_profiles_v2', JSON.stringify(serverProfiles));
  localStorage.setItem('weetech_active_profile', activeProfileId);
}

function renderProfiles() {
  if (!profileSelect) return;
  profileSelect.innerHTML = '';
  
  serverProfiles.forEach(prof => {
    const opt = document.createElement('option');
    opt.value = prof.id;
    opt.textContent = `${prof.name} (${prof.ip})`;
    if (prof.id === activeProfileId) {
      opt.selected = true;
    }
    profileSelect.appendChild(opt);
  });
  
  // Gomb állapotának frissítése (legalább 1 profil mindig kell, hogy legyen)
  if (btnDeleteProfile) {
    btnDeleteProfile.disabled = serverProfiles.length <= 1;
  }
}

if (profileSelect) {
  profileSelect.addEventListener('change', (e) => {
    activeProfileId = e.target.value;
    saveProfiles();
  });
}

if (btnNewProfile) {
  btnNewProfile.addEventListener('click', () => {
    newProfileForm.classList.remove('hidden');
  });
}

if (btnCancelProfile) {
  btnCancelProfile.addEventListener('click', () => {
    newProfileForm.classList.add('hidden');
    newProfName.value = '';
    newProfIp.value = '';
    newProfPath.value = '';
  });
}

if (btnSaveProfile) {
  btnSaveProfile.addEventListener('click', () => {
    const name = newProfName.value.trim();
    const ip = newProfIp.value.trim();
    const pathVal = newProfPath.value.trim();
    
    if (!name || !ip || !pathVal) {
      alert('Minden mezőt ki kell tölteni!');
      return;
    }
    
    const newId = 'prof_' + Date.now();
    serverProfiles.push({ id: newId, name: name, ip: ip, path: pathVal });
    activeProfileId = newId;
    
    saveProfiles();
    renderProfiles();
    
    // Űrlap bezárása
    newProfileForm.classList.add('hidden');
    newProfName.value = '';
    newProfIp.value = '';
    newProfPath.value = '';
  });
}

if (btnDeleteProfile) {
  btnDeleteProfile.addEventListener('click', () => {
    if (serverProfiles.length <= 1) return;
    
    if (confirm('Biztosan törölni szeretnéd a kiválasztott profilt?')) {
      serverProfiles = serverProfiles.filter(p => p.id !== activeProfileId);
      activeProfileId = serverProfiles[0].id; // Visszaugrunk az elsőre
      saveProfiles();
      renderProfiles();
    }
  });
}

function getActiveProfile() {
  return serverProfiles.find(p => p.id === activeProfileId) || serverProfiles[0];
}

// Inicializálás hívás a lap alján (már megvan, de a renderProfiles-t hívni kell)
renderProfiles();

function showStatus(msg, type) {
  statusMsg.textContent = msg;
  statusMsg.className = `status-msg ${type}`;
}

function handleFileSelect(file) {
  if (!file) return;
  
  if (file.type !== 'image/jpeg') {
    showStatus('Csak JPEG fájlok elfogadottak!', 'error');
    return;
  }
  
  selectedFile = file;
  fileNameDisplay.textContent = file.name;
  
  // Kép átméretezése (Canvas)
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Megjelenítjük az előnézetet
      imagePreview.src = img.src;
      previewContainer.classList.remove('hidden');
      
      // Átméretezés a megadott szélességre (vagy eredeti, ha kisebb)
      let MAX_WIDTH = parseInt(imageWidthInput?.value, 10);
      if (isNaN(MAX_WIDTH) || MAX_WIDTH < 100) MAX_WIDTH = 800;
      
      let width = img.width;
      let height = img.height;
      
      if (width > MAX_WIDTH) {
        height = Math.floor(height * (MAX_WIDTH / width));
        width = MAX_WIDTH;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Blob generálása
      canvas.toBlob((blob) => {
        resizedBlob = blob;
        btnProcess.disabled = false;
        btnProcess.classList.remove('disabled');
        showStatus(`Kép előkészítve (${Math.round(blob.size / 1024)} KB, ${width}px). Kattints a gombra a feltöltéshez!`, 'success');
      }, 'image/jpeg', 0.85); // 85% minőség
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Drag & Drop
if (uploadBox) {
  uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('dragover');
  });
  
  uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('dragover');
  });
  
  uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  });
}

if (fileInput) {
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
      handleFileSelect(e.target.files[0]);
    }
  });
}

// Feltöltés indítása
if (btnProcess) {
  btnProcess.addEventListener('click', async () => {
    if (!resizedBlob) return;
    
    const activeProf = getActiveProfile();
    const serverIp = activeProf.ip || 'localhost';
    const endpoint = `http://${serverIp}:3000/api/upload`;
    
    btnProcess.disabled = true;
    btnProcess.classList.add('disabled');
    showStatus('Feltöltés folyamatban...', 'loading');
    
    const formData = new FormData();
    // Fontos, hogy a targetPath a fájl ELŐTT vagy UGYANAKKOR legyen a formában,
    // de a biztonság kedvéért előre tesszük. (Bár a multer req.body-t tölti).
    formData.append('targetPath', activeProf.path);
    // Eredeti fájlnév megőrzése
    formData.append('image', resizedBlob, selectedFile.name);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        if (data.networkSuccess) {
          showStatus(`Siker! Kép mentve a hálózatra: ${data.filename}`, 'success');
        } else {
          // Ha nem sikerült a hálózatra menteni, de a fájl azért elmentődött a fallback mappába
          showStatus(`Figyelem! Hálózati hiba, kép csak a szerver helyi biztonsági mappájába mentve!`, 'error');
        }
        
        // Reset state after 5 seconds
        setTimeout(() => {
          selectedFile = null;
          resizedBlob = null;
          fileNameDisplay.textContent = 'Kattints ide egy JPEG fájl kiválasztásához';
          previewContainer.classList.add('hidden');
          imagePreview.src = '';
          statusMsg.classList.add('hidden');
        }, 5000);
      } else {
        throw new Error(data.message || 'Szerver hiba');
      }
    } catch (error) {
      console.error(error);
      showStatus(`Feltöltési hiba: ${error.message}. Ellenőrizd, hogy fut-e a szerver a ${serverIp} IP címen!`, 'error');
      btnProcess.disabled = false;
      btnProcess.classList.remove('disabled');
    }
  });
}

// ----------------------------------------------------
// INICIALIZÁLÁS
// ----------------------------------------------------
function init() {
  pinData = generatePinData();
  renderPinTable(pinData);
  
  // URL alapú routing (ha pl. frissítik az oldalt, a főmenü induljon)
  showView('launcher');
}

init();
