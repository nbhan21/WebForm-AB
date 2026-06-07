// Form App Logic
document.addEventListener('DOMContentLoaded', function() {
    // Initialize form
    initForm();
});

function initForm() {
    // Set default date to today
    document.getElementById('tanggal').valueAsDate = new Date();
    
    // Set default time to now
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('jam').value = `${hours}:${minutes}`;
    
    // Setup POS checkboxes
    setupPOSCheckboxes();
    
    // Setup form submission
    document.getElementById('rejectForm').addEventListener('submit', handleSubmit);
}

function setupPOSCheckboxes() {
    const posContainer = document.getElementById('posSelection');
    posList.forEach(pos => {
        const label = document.createElement('label');
        label.className = 'pos-checkbox';
        label.innerHTML = `<input type="checkbox" value="${pos}" style="display:none" onchange="togglePOS('${pos}')">${pos}`;
        posContainer.appendChild(label);
    });
}

function togglePOS(posName) {
    const checkbox = document.querySelector(`input[value="${posName}"]`);
    const label = checkbox.closest('.pos-checkbox');
    const container = document.getElementById('posSectionsContainer');
    
    // Toggle visual state
    if (checkbox.checked) {
        label.classList.add('selected');
        createPOSSection(posName);
    } else {
        label.classList.remove('selected');
        removePOSSection(posName);
    }
}

function createPOSSection(posName) {
    const container = document.getElementById('posSectionsContainer');
    const sectionId = `pos-${posName.replace(/\s+/g, '-')}`;
    const categories = rejectData[posName];
    const isComplete = posName === 'Complete';

    const section = document.createElement('div');
    section.className = 'pos-section';
    section.id = sectionId;

    section.innerHTML = `
        <div class="pos-section-header">
            <div class="pos-section-title">
                <span class="step-label">Langkah 3</span>
                <span class="pos-section-name">${posName}</span>
            </div>
            <div class="stat-chips">
                <div class="stat-chip">
                    <span class="stat-chip-label">Total Produksi</span>
                    <input type="number" name="totalProduksi[${posName}]" class="stat-chip-value" min="0" value="0">
                </div>
                <div class="stat-divider"></div>
                <div class="stat-chip">
                    <span class="stat-chip-label error">Jumlah Reject</span>
                    <input type="number" name="jumlahReject[${posName}]" class="stat-chip-value error-field" min="0" value="0">
                </div>
            </div>
        </div>

        <div class="divider-line"></div>

        <div class="reject-table-head">
            <span>Kategori Reject${isComplete ? ' & Halaman' : ''}</span>
            <span>Jumlah</span>
            <span>Aksi</span>
        </div>

        <div id="rejectRows-${sectionId}">
            ${buildRejectRow(posName, categories, isComplete)}
        </div>
        <button type="button" class="btn-add" onclick="addRejectRow('${sectionId}', '${posName}')">+ Tambah Kategori</button>

        <div class="additional-fields">
            <div class="form-group">
                <label>Dugaan Penyebab</label>
                <textarea name="dugaan[${posName}]" placeholder="Tulis dugaan penyebab reject..."></textarea>
            </div>
            <div class="form-group">
                <label>Catatan Tambahan</label>
                <textarea name="catatan[${posName}]" placeholder="Tambahkan catatan jika diperlukan..."></textarea>
            </div>
        </div>
    `;
    
    container.appendChild(section);
    
    // Add event listener for custom category option
    const select = section.querySelector('select');
    select.addEventListener('change', function() {
        if (this.value === '__custom__') {
            handleCustomCategory(this, posName);
        }
    });
    
    // Add event listener for total produksi to calculate reject
    const totalInput = section.querySelector('input[name^="totalProduksi"]');
    const rejectInput = section.querySelector('input[name^="jumlahReject"]');
    
    // Auto-calculate reject when category quantities change
    section.addEventListener('input', function(e) {
        if (e.target.name && e.target.name.startsWith('jumlah[')) {
            updateTotalReject(posName);
        }
    });
}

function removePOSSection(posName) {
    const sectionId = `pos-${posName.replace(/\s+/g, '-')}`;
    const section = document.getElementById(sectionId);
    if (section) {
        section.remove();
    }
}

function buildRejectRow(posName, categories, isComplete) {
    const halCol = isComplete ? `<input type="text" name="halaman[${posName}][]" placeholder="Halaman">` : '';
    return `<div class="reject-row">
        <select name="kategori[${posName}][]">
            <option value="">Pilih Kategori</option>
            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
            <option value="__custom__">+ Tambah Kategori Baru</option>
        </select>
        <input type="number" name="jumlah[${posName}][]" placeholder="Jumlah" min="0" value="0">
        ${halCol}
        <button type="button" class="btn-remove" onclick="removeRejectRow(this)">Hapus</button>
    </div>`;
}

function addRejectRow(sectionId, posName) {
    const container = document.getElementById(`rejectRows-${sectionId}`);
    const categories = rejectData[posName];
    const isComplete = posName === 'Complete';

    const div = document.createElement('div');
    div.innerHTML = buildRejectRow(posName, categories, isComplete);
    const row = div.firstElementChild;
    container.appendChild(row);
    
    // Add event listener for custom category
    const select = row.querySelector('select');
    select.addEventListener('change', function() {
        if (this.value === '__custom__') {
            handleCustomCategory(this, posName);
        }
    });
}

function removeRejectRow(button) {
    const row = button.closest('.reject-row');
    const container = row.parentElement;
    
    // Don't remove if it's the last row
    if (container.children.length > 1) {
        row.remove();
    } else {
        // Reset the row instead
        row.querySelector('select').value = '';
        row.querySelector('input').value = '0';
    }
    
    // Update total reject
    const section = container.closest('.pos-section');
    const posName = section.querySelector('h3').textContent;
    updateTotalReject(posName);
}

function handleCustomCategory(selectElement, posName) {
    const customCategory = prompt('Masukkan nama kategori reject baru:');
    
    if (customCategory && customCategory.trim()) {
        const newCategory = customCategory.trim();
        
        // Add to data
        if (!rejectData[posName].includes(newCategory)) {
            rejectData[posName].push(newCategory);
        }
        
        // Update all selects for this POS
        const sectionId = `pos-${posName.replace(/\s+/g, '-')}`;
        const section = document.getElementById(sectionId);
        const allSelects = section.querySelectorAll(`select[name^="kategori[${posName}]"]`);
        
        allSelects.forEach(select => {
            // Remove existing custom option and re-add
            const customOption = select.querySelector('option[value="__custom__"]');
            
            // Add new category before the custom option
            const newOption = document.createElement('option');
            newOption.value = newCategory;
            newOption.textContent = newCategory;
            select.insertBefore(newOption, customOption);
            
            // Select the new category
            select.value = newCategory;
        });
    } else {
        selectElement.value = '';
    }
}

function updateTotalReject(posName) {
    const sectionId = `pos-${posName.replace(/\s+/g, '-')}`;
    const section = document.getElementById(sectionId);
    const jumlahInputs = section.querySelectorAll(`input[name^="jumlah[${posName}]"]`);
    
    let total = 0;
    jumlahInputs.forEach(input => {
        total += parseInt(input.value) || 0;
    });
    
    const rejectInput = section.querySelector('input[name^="jumlahReject"]');
    rejectInput.value = total;
}

function handleSubmit(e) {
    e.preventDefault();
    
    console.log('=== Form Submit Started ===');
    
    // Get form data
    const formData = new FormData(e.target);
    const data = {
        tanggal: formData.get('tanggal'),
        jam: formData.get('jam'),
        kodeOrder: formData.get('kodeOrder'),
        submissions: []
    };
    
    console.log('Basic data:', data);
    
    // Get selected POS
    const selectedPOS = [];
    document.querySelectorAll('#posSelection input:checked').forEach(cb => {
        selectedPOS.push(cb.value);
    });
    
    console.log('Selected POS:', selectedPOS);
    
    if (selectedPOS.length === 0) {
        showAlert('Pilih minimal satu POS!', 'error');
        console.log('ERROR: No POS selected');
        return;
    }
    
    // Collect data for each POS
    selectedPOS.forEach(posName => {
        const sectionId = `pos-${posName.replace(/\s+/g, '-')}`;
        const section = document.getElementById(sectionId);
        
        if (!section) {
            console.error('Section not found:', sectionId);
            return;
        }
        
        const totalProduksiEl = section.querySelector(`[name^="totalProduksi"]`);
        const jumlahRejectEl = section.querySelector(`[name^="jumlahReject"]`);
        
        const totalProduksi = totalProduksiEl ? totalProduksiEl.value : '0';
        const jumlahReject = jumlahRejectEl ? jumlahRejectEl.value : '0';
        
        console.log('Processing POS:', posName, 'Total:', totalProduksi, 'Reject:', jumlahReject);
        
        // Get reject categories
        const rejects = [];
        const rejectRows = section.querySelectorAll('.reject-row');
        
        console.log('Reject rows:', rejectRows.length);
        
        rejectRows.forEach(row => {
            const select = row.querySelector('select');
            const jumlahEl = row.querySelector(`input[name^="jumlah["]`);
            const halamanEl = row.querySelector(`input[name^="halaman["]`);
            
            if (select && select.value && select.value !== '__custom__') {
                rejects.push({
                    kategori: select.value,
                    jumlah: jumlahEl ? (parseInt(jumlahEl.value) || 0) : 0,
                    halaman: halamanEl ? halamanEl.value : ''
                });
            }
        });
        
        const dudaanEl = section.querySelector(`[name^="dugaan"]`);
        const catatanEl = section.querySelector(`[name^="catatan"]`);
        
        const dugaan = dudaanEl ? dudaanEl.value : '';
        const catatan = catatanEl ? catatanEl.value : '';
        
        data.submissions.push({
            pos: posName,
            totalProduksi: parseInt(totalProduksi) || 0,
            jumlahReject: parseInt(jumlahReject) || 0,
            rejects: rejects,
            dugaan: dugaan,
            catatan: catatan
        });
    });
    
    console.log('Final data:', data);
    
    // Save to localStorage first (backup)
    saveToLocalStorage(data);
    
    // Send to Google Sheets if enabled
    if (USE_GOOGLE_SHEETS && GOOGLE_SHEETS_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
        sendToGoogleSheets(data)
            .then(() => showAlert('Data berhasil dikirim ke Google Sheets!', 'success'))
            .catch(error => showAlert('Gagal: ' + error.message, 'error'));
    } else {
        showAlert('Data berhasil disimpan!', 'success');
    }
    
    // Reset form
    setTimeout(() => {
        resetForm();
        console.log('=== Form Reset Done ===');
    }, 1500);
}

async function sendToGoogleSheets(data) {
    const res = await fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Gagal simpan ke Google Sheets');
    return json;
}

function saveToLocalStorage(data) {
    let submissions = JSON.parse(localStorage.getItem('rejectSubmissions') || '[]');
    submissions.push({
        ...data,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('rejectSubmissions', JSON.stringify(submissions));
    
    console.log('Data saved:', submissions);
}

function resetForm() {
    document.querySelectorAll('#posSelection input').forEach(cb => {
        cb.checked = false;
        cb.closest('.pos-checkbox').classList.remove('selected');
    });
    document.getElementById('posSectionsContainer').innerHTML = '';
    document.getElementById('kodeOrder').value = '';
    document.getElementById('submitSummary').textContent = 'Pilih POS untuk mulai mengisi data';
    document.getElementById('tanggal').valueAsDate = new Date();
    const now = new Date();
    document.getElementById('jam').value = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
}

function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = 'alert show';
    
    if (type === 'error') {
        alert.classList.add('alert-error');
        alert.style.background = '#ff6b6b';
        alert.style.color = '#fff';
    } else {
        alert.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        alert.style.color = '#fff';
    }
    
    // Auto dismiss
    setTimeout(() => {
        alert.className = 'alert';
    }, 5000);
    
    console.log('Alert:', type, message);
}

// Make functions globally available
window.togglePOS = togglePOS;
window.addRejectRow = addRejectRow;
window.removeRejectRow = removeRejectRow;
window.handleCustomCategory = handleCustomCategory;