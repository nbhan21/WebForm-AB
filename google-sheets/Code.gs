/**
 * Google Apps Script untuk Form Reject Production
 * Produksi Aksara Buana
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const ss = getOrCreateSpreadsheet();
    const sheet = ss.getSheets()[0];

    if (sheet.getLastRow() === 0) {
      setupHeaders(sheet);
    }

    saveSubmission(sheet, data);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput('Form Reject Production - Apps Script is running!')
    .setMimeType(ContentService.MimeType.TEXT);
}

function getOrCreateSpreadsheet() {
  const props = PropertiesService.getScriptProperties();
  let ssId = props.getProperty('SPREADSHEET_ID');

  if (ssId) {
    try { return SpreadsheetApp.openById(ssId); } catch(e) { ssId = null; }
  }

  const existingFiles = DriveApp.getFilesByName('Reject Production Data - Aksara Buana');
  if (existingFiles.hasNext()) {
    const ss = SpreadsheetApp.open(existingFiles.next());
    props.setProperty('SPREADSHEET_ID', ss.getId());
    return ss;
  }

  const ss = SpreadsheetApp.create('Reject Production Data - Aksara Buana');
  props.setProperty('SPREADSHEET_ID', ss.getId());
  return ss;
}

function setupHeaders(sheet) {
  const headers = [
    'Timestamp', 'Tanggal', 'Jam', 'Kode Order', 'POS',
    'Total Produksi', 'Jumlah Reject', 'Kategori Reject',
    'Jumlah per Kategori', 'Halaman (Complete)',
    'Dugaan Penyebab', 'Catatan Tambahan'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#059669').setFontColor('#ffffff');
  sheet.autoResizeColumns(1, headers.length);
}

function saveSubmission(sheet, data) {
  const timestamp = new Date().toISOString();
  data.submissions.forEach(submission => {
    const rejects = submission.rejects || [];
    if (rejects.length === 0) {
      sheet.appendRow([
        timestamp, data.tanggal, data.jam, data.kodeOrder, submission.pos,
        submission.totalProduksi, submission.jumlahReject, '', '', '',
        submission.dugaan || '', submission.catatan || ''
      ]);
    } else {
      rejects.forEach(reject => {
        sheet.appendRow([
          timestamp, data.tanggal, data.jam, data.kodeOrder, submission.pos,
          submission.totalProduksi, submission.jumlahReject,
          reject.kategori, reject.jumlah, reject.halaman || '',
          submission.dugaan || '', submission.catatan || ''
        ]);
      });
    }
  });
}
