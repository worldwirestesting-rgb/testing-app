import './style.css';

// Alkalmazás adatok és állapot
let pinData = [];

// DOM elemek
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const tableBody = document.getElementById('tableBody');
const highlightFrame = document.getElementById('highlightFrame');
const highlightLabel = document.getElementById('highlightLabel');

// Adatgenerálás
function generateData() {
  const data = [];
  for (let i = 1; i <= 576; i++) {
    const major = Math.floor((i - 1) / 64) + 1;
    const minor = ((i - 1) % 64) + 1;
    const pair = `${major}.${minor}`;
    
    const ip_group = Math.floor((i - 1) / 32) + 1;
    const ip_pin = ((i - 1) % 32) + 1;
    const ip_info = `IP${ip_group}-${ip_pin}`;
    
    data.push({
      p1: String(i),
      p2: pair,
      p3: ip_info
    });
  }
  return data;
}

// Táblázat renderelése
function renderTable(data) {
  // A DocumentFragment használata sokkal gyorsabb renderelést tesz lehetővé
  const fragment = document.createDocumentFragment();
  
  data.forEach(item => {
    const tr = document.createElement('tr');
    
    const td1 = document.createElement('td');
    td1.textContent = item.p1;
    
    const td2 = document.createElement('td');
    td2.textContent = item.p2;
    
    const td3 = document.createElement('td');
    td3.textContent = item.p3;
    
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    
    fragment.appendChild(tr);
  });
  
  tableBody.innerHTML = '';
  tableBody.appendChild(fragment);
}

// Keresés és szűrés logika
function onSearch() {
  const text = searchInput.value.trim();
  
  // X gomb mutatása/elrejtése
  clearBtn.style.display = text ? 'flex' : 'none';
  
  if (!text) {
    highlightFrame.classList.add('hidden');
    renderTable(pinData);
    return;
  }
  
  const searchLower = text.toLowerCase();
  let exactMatchRow = null;
  const filteredData = [];
  
  // Végigmegyünk az adatokon
  for (const item of pinData) {
    // Egzakt egyezés vizsgálata (kis/nagybetű független)
    if (
      item.p1.toLowerCase() === searchLower || 
      item.p2.toLowerCase() === searchLower || 
      item.p3.toLowerCase() === searchLower
    ) {
      exactMatchRow = item;
    }
    
    // Részleges egyezés vizsgálata a szűréshez
    if (
      item.p1.toLowerCase().includes(searchLower) ||
      item.p2.toLowerCase().includes(searchLower) ||
      item.p3.toLowerCase().includes(searchLower)
    ) {
      filteredData.push(item);
    }
  }
  
  // Highlight frissítése
  if (exactMatchRow) {
    highlightLabel.textContent = `Találat:\n${exactMatchRow.p1}  ↔  ${exactMatchRow.p2}  ↔  ${exactMatchRow.p3}`;
    highlightFrame.classList.remove('hidden');
  } else {
    highlightFrame.classList.add('hidden');
  }
  
  // Táblázat frissítése a szűrt adatokkal
  renderTable(filteredData);
}

// Eseménykezelők
function setupEventListeners() {
  // Gépelés figyelése (debounce nélkül is bírja az 576 elemet)
  searchInput.addEventListener('input', onSearch);
  
  // Törlés gomb
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    onSearch();
    searchInput.focus();
  });
}

// Inicializálás
function init() {
  pinData = generateData();
  renderTable(pinData);
  setupEventListeners();
}

// Alkalmazás indítása
init();
