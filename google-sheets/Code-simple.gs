/**
 * Google Apps Script untuk Form Reject Production
 * Produksi Aksara Buana - Simple Version
 */

function doPost(e) {
  try {
    // Parse incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Get or create spreadsheet (simple - buat baru kalau ga ada)
    const ss = getOrCreateSpreadsheet();
    
    // Pakai sheet pertama (Sheet1)
    const sheet = ss.getSheets()[0];
    
    // Setup headers if empty
    if (sheet.getLastRow() === 0) {
      setupHeaders(sheet);
    }
    
    // Process and save each submission
    const result = saveSubmission(sheet, data);
    
    // Get spreadsheet URL
    const ssUrl = ss.getUrl();
    
    // Return success
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Data saved', 
        row: result,
        spreadsheetUrl: ssUrl 
      }))
      .setMimeType(ContentService.MimeType.TEXT);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

function getOrCreateSpreadsheet() {
  // Langsung cek file lama
  const existingFiles = DriveApp.getFilesByName('Reject Production Data - Aksara Buana');
  
  if (existingFiles.hasNext()) {
    const ss = SpreadsheetApp.open(existingFiles.next());
    ss.setSharing(SpreadsheetApp.Access.ANYONE_WITH_LINK, SpreadsheetApp.Permission.EDIT);
    return ss;
  }
  
  // Buat baru jika ga ada
  const ss = SpreadsheetApp.create('Reject Production Data - Aksara Buana');
  ss.setSharing(SpreadsheetApp.Access.ANYONE_WITH_LINK, SpreadsheetApp.Permission.EDIT);
  return ss;
}

function setupHeaders(sheet) {
  const headers = [
    'Timestamp', 'Tanggal', 'Jam', 'Kode Order', 'POS',
    'Total Produksi', 'Jumlah Reject', 'Kategori Reject',
    'Jumlah per Kategori', 'Halaman (Complete)',
    'Ddugaan Penyebab', 'Catatan Tambahan'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#059669')
    .setFontColor('#ffffff');
  sheet.autoResizeColumns(1, headers.length);
}

function saveSubmission(sheet, data) {
  const timestamp = new Date().toISOString();
  const lastRow = sheet.getLastRow() + 1;
  
  data.submissions.forEach(submission => {
    const posName = submission.pos;
    const rejects = submission.rejects || [];
    
    if (rejects.length === 0) {
      const row = [
        timestamp, data.tanggal, data.jam, data.kodeOrder, posName,
        submission.totalProduksi, submission.jumlahReject, '', '', '', 
        submission.dugaan || '', submission.catatan || ''
      ];
      sheet.appendRow(row);
    } else {
      rejects.forEach(reject => {
        const row = [
          timestamp, data.tanggal, data.jam, data.kodeOrder, posName,
          submission.totalProduksi, submission.jumlahReject,
          reject.kategori, reject.jumlah, reject.halaman || '',
          submission.dugaan || '', submission.catatan || ''
        ];
        sheet.appendRow(row);
      });
    }
  });
  
  return lastRow;
}

function doGet() {
  return ContentService
    .createTextOutput('Form Reject Production - Google Apps Script is running!')
    .setMimeType(ContentService.MimeType.TEXT);
}