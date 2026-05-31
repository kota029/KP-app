/**
 * ACF 奉仕者管理 API — Google Apps Script
 *
 * スプレッドシート構成:
 * - Settings … 名簿（54人）
 * - ServiceLog … 奉仕履歴
 *
 * Settings 1行目ヘッダー（推奨）:
 *   id | name | email | campus | instruments | preferredRole1 | preferredRole2 |
 *   availableWeekdays | bio | joinedYear | avatarUrl
 *
 * ServiceLog 1行目ヘッダー（推奨）:
 *   id | date | campus | memberId | memberName | instrument | eventName
 *
 * デプロイ: ウェブアプリ / 実行ユーザー: 自分 / アクセス: 全員
 */

const SPREADSHEET_ID = '1J9syVvFHcV9SiRpgCU67TIPtZICCaDmadnmDWNpfnVg';
const SHEET_SETTINGS = 'Settings';
const SHEET_SERVICE_LOG = 'ServiceLog';
/** Settings J列（1始まり10列目 = 0始まりインデックス9）アバター */
const SETTINGS_AVATAR_COL = 9;
/** Settings K列（1始まり11列目 = 0始まりインデックス10）参加可能曜日 */
const SETTINGS_WEEKDAY_COL = 10;
/** ServiceLog G列（1始まり7列目 = 0始まりインデックス6）イベント名 */
const SERVICE_LOG_EVENT_COL = 6;

// ---------------------------------------------------------------------------
// HTTP エントリポイント
// ---------------------------------------------------------------------------

function doGet(e) {
  try {
    const action = (e.parameter.action || '').trim();

    if (action === 'getMembers') {
      return jsonResponse(getMembers());
    }

    if (action === 'getMemberByEmail') {
      const email = (e.parameter.email || '').trim();
      if (!email) return errorResponse('email is required');
      const member = getMemberByEmail(email);
      if (!member) return jsonResponse(null);
      return jsonResponse(member);
    }

    if (action === 'linkAccount') {
      const memberId = (e.parameter.memberId || '').trim();
      const newEmail = (e.parameter.newEmail || '').trim();
      if (!memberId || !newEmail) return errorResponse('memberId and newEmail are required');
      const member = linkAccount(memberId, newEmail, null);
      return jsonResponse(member);
    }

    return errorResponse('Unknown action: ' + action);
  } catch (err) {
    return errorResponse(String(err.message || err));
  }
}

function doPost(e) {
  try {
    const action = (e.parameter.action || '').trim();
    const body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};

    if (action === 'registerServicesBulk') {
      const registrations = body.registrations || [];
      return jsonResponse(registerServicesBulk(registrations));
    }

    if (action === 'registerService') {
      const results = registerServicesBulk([body]);
      return jsonResponse(results[0]);
    }

    if (action === 'linkAccount') {
      const memberId = body.memberId;
      const newEmail = body.newEmail;
      if (!memberId || !newEmail) return errorResponse('memberId and newEmail are required');
      const member = linkAccount(memberId, newEmail, body.idToken);
      return jsonResponse(member);
    }

    if (action === 'updateProfile') {
      const email = body.email;
      if (!email) return errorResponse('email is required');
      const member = updateProfile(email, body);
      return jsonResponse(member);
    }

    if (action === 'uploadAvatar') {
      const url = uploadAvatar(body.email, body.image);
      return jsonResponse({ url: url });
    }

    if (action === 'chat') {
      return jsonResponse({ response: 'AIチャットは未実装です。' });
    }

    return errorResponse('Unknown action: ' + action);
  } catch (err) {
    return errorResponse(String(err.message || err));
  }
}

// ---------------------------------------------------------------------------
// GET: 全メンバー
// ---------------------------------------------------------------------------

function getMembers() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_SETTINGS);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers = data[0].map(normalizeHeader);
  var logRows = readSheetAsObjects(SHEET_SERVICE_LOG);
  var logsByMember = groupServiceLogs(logRows);
  var members = [];

  for (var r = 1; r < data.length; r++) {
    var row = rowToObject(data[r], headers);
    if (String(row.id || '').trim() === '') continue;
    members.push(buildMemberObject(row, logsByMember[row.id] || [], r - 1, data[r]));
  }
  return members;
}

function getMemberByEmail(email) {
  var normalized = email.trim().toLowerCase();
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_SETTINGS);
  if (!sheet) return null;

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return null;

  var headers = data[0].map(normalizeHeader);
  var emailCol = findColumnIndex(headers, ['email', 'メール', 'メールアドレス']);
  if (emailCol < 0) return null;

  var logRows = readSheetAsObjects(SHEET_SERVICE_LOG);
  var logsByMember = groupServiceLogs(logRows);

  for (var r = 1; r < data.length; r++) {
    var cellEmail = String(data[r][emailCol] || '').trim().toLowerCase();
    if (cellEmail === normalized) {
      var row = rowToObject(data[r], headers);
      return buildMemberObject(row, logsByMember[row.id] || [], r - 1, data[r]);
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// POST: 一括奉仕登録
// ---------------------------------------------------------------------------

function registerServicesBulk(registrations) {
  if (!registrations || registrations.length === 0) return [];

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_SERVICE_LOG);
  if (!sheet) throw new Error('ServiceLog sheet not found');

  const headers = getSheetHeaders(sheet);
  const results = [];
  const rowsToAppend = [];
  const baseTime = Date.now();

  registrations.forEach(function (reg, i) {
    const id = 'svc-' + baseTime + '-' + i;
    const rowObj = {
      id: id,
      date: formatDateValue(reg.date),
      campus: normalizeCampus(reg.campus || ''),
      memberId: reg.memberId || '',
      memberName: reg.memberName || '',
      instrument: normalizeInstrument(reg.instrument || ''),
      eventName: reg.eventName || '主日礼拝',
    };
    rowsToAppend.push(serviceLogToRow(rowObj, headers));
    results.push({
      id: id,
      date: rowObj.date,
      campus: rowObj.campus,
      memberId: rowObj.memberId,
      memberName: rowObj.memberName,
      instrument: rowObj.instrument,
    });
  });

  if (rowsToAppend.length > 0) {
    const startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, rowsToAppend.length, headers.length).setValues(rowsToAppend);
  }

  return results;
}

// ---------------------------------------------------------------------------
// POST: 初回ログイン（Google メールと名簿 id の紐づけ）
// ---------------------------------------------------------------------------

function linkAccount(memberId, newEmail, idToken) {
  memberId = String(memberId || '').trim();
  newEmail = String(newEmail || '').trim();

  if (!memberId || !newEmail) {
    throw new Error('memberId and newEmail are required');
  }

  if (idToken) {
    var verified = verifyGoogleIdToken(idToken);
    if (verified) {
      if (verified.trim().toLowerCase() !== newEmail.trim().toLowerCase()) {
        throw new Error('Email does not match Google account');
      }
      newEmail = verified;
    }
    // トークン検証に失敗しても GET 紐づけは続行（クライアント側で Google ログイン済み）
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_SETTINGS);
  if (!sheet) throw new Error('Settings sheet not found');

  var headers = getSheetHeaders(sheet);
  var data = sheet.getDataRange().getValues();
  var idCol = findColumnIndex(headers, ['id', 'ID', 'メンバーID']);
  var emailCol = findColumnIndex(headers, ['email', 'メール', 'メールアドレス']);
  if (idCol < 0) throw new Error('id column not found in Settings');
  if (emailCol < 0) throw new Error('email column not found in Settings');

  var normalizedNew = newEmail.trim().toLowerCase();
  var targetRow = -1;
  var currentEmail = '';

  for (var r = 1; r < data.length; r++) {
    var rowId = String(data[r][idCol] || '').trim();
    var rowEmail = String(data[r][emailCol] || '').trim();
    if (rowId === memberId) {
      targetRow = r + 1;
      currentEmail = rowEmail;
      break;
    }
    if (rowEmail.trim().toLowerCase() === normalizedNew) {
      throw new Error('このメールアドレスは既に別のメンバーに紐づけられています');
    }
  }

  if (targetRow < 0) throw new Error('Member not found: ' + memberId);

  if (!isDummyEmail(currentEmail)) {
    throw new Error('このメンバーは既にアカウントが紐づけ済みです');
  }

  sheet.getRange(targetRow, emailCol + 1).setValue(newEmail.trim());

  var member = getMemberByEmail(newEmail);
  if (!member) throw new Error('Failed to reload member after linking');
  return member;
}

function verifyGoogleIdToken(idToken) {
  if (!idToken) return null;
  try {
    var url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken);
    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) return null;
    var data = JSON.parse(resp.getContentText());
    return data.email ? String(data.email) : null;
  } catch (e) {
    return null;
  }
}

function isDummyEmail(email) {
  var e = String(email || '').trim().toLowerCase();
  if (!e) return true;
  if (e.indexOf('@example.com') >= 0) return true;
  if (e.indexOf('dummy-') === 0) return true;
  return false;
}

// ---------------------------------------------------------------------------
// POST: プロフィール更新
// ---------------------------------------------------------------------------

function updateProfile(email, payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_SETTINGS);
  if (!sheet) throw new Error('Settings sheet not found');

  const headers = getSheetHeaders(sheet);
  const data = sheet.getDataRange().getValues();
  const emailCol = findColumnIndex(headers, ['email', 'メール', 'メールアドレス']);
  if (emailCol < 0) throw new Error('email column not found in Settings');

  const normalized = email.trim().toLowerCase();
  var targetRow = -1;

  for (var r = 1; r < data.length; r++) {
    var cellEmail = String(data[r][emailCol] || '').trim().toLowerCase();
    if (cellEmail === normalized) {
      targetRow = r + 1;
      break;
    }
  }

  if (targetRow < 0) throw new Error('Member not found: ' + email);

  if (payload.availableWeekdays !== undefined) {
    var weekdayCol = findColumnIndex(headers, getHeaderAliases('availableWeekdays'));
    if (weekdayCol < 0) weekdayCol = SETTINGS_WEEKDAY_COL;
    sheet.getRange(targetRow, weekdayCol + 1).setValue(formatWeekdaysForSheet(payload.availableWeekdays));
  }

  var avatarValue = payload.avatarBase64 !== undefined ? payload.avatarBase64 : payload.avatarUrl;
  if (avatarValue !== undefined) {
    var avatarCol = findColumnIndex(headers, getHeaderAliases('avatarUrl'));
    if (avatarCol < 0) avatarCol = SETTINGS_AVATAR_COL;
    sheet.getRange(targetRow, avatarCol + 1).setValue(avatarValue);
  }

  var updates = {
    name: payload.name,
    campus: payload.campus !== undefined ? normalizeCampus(payload.campus) : undefined,
    preferredRole1: payload.preferredRole1,
    preferredRole2: payload.preferredRole2,
    bio: payload.bio,
  };

  Object.keys(updates).forEach(function (key) {
    if (updates[key] === undefined) return;
    var col = findColumnIndex(headers, getHeaderAliases(key));
    if (col < 0) return;
    var value = updates[key];
    if (key === 'instruments' && Array.isArray(value)) {
      value = value.join(',');
    }
    sheet.getRange(targetRow, col + 1).setValue(value);
  });

  // instruments 列を preferredRole から再構築（更新された場合）
  if (payload.preferredRole1 || payload.preferredRole2) {
    var instCol = findColumnIndex(headers, ['instruments', '楽器', '担当楽器']);
    if (instCol >= 0) {
      var rowData = sheet.getRange(targetRow, 1, 1, headers.length).getValues()[0];
      var obj = rowToObject(rowData, headers);
      var instruments = buildInstrumentsList(obj);
      sheet.getRange(targetRow, instCol + 1).setValue(instruments.join(','));
    }
  }

  var member = getMemberByEmail(email);
  if (!member) throw new Error('Failed to reload member after update');
  return member;
}

function uploadAvatar(email, base64Image) {
  if (!email || !String(email).trim()) throw new Error('email is required');
  if (!base64Image) throw new Error('image is required');
  var member = updateProfile(email, { avatarBase64: base64Image });
  return member.avatarUrl;
}

// ---------------------------------------------------------------------------
// Member オブジェクト組み立て
// ---------------------------------------------------------------------------

function buildMemberObject(row, serviceRecords, index, rawRow) {
  var instruments = buildInstrumentsList(row);
  var history = serviceRecords.map(function (log) {
    return {
      id: String(log.id || ''),
      date: formatDateValue(log.date),
      campus: normalizeCampus(log.campus || ''),
      role: normalizeInstrument(log.instrument || log.role || ''),
      eventName: String(log.eventName || '主日礼拝'),
    };
  });

  history.sort(function (a, b) {
    return b.date.localeCompare(a.date);
  });

  var now = new Date();
  var currentYear = now.getFullYear();
  var currentMonth = now.getMonth();

  var totalServiceCount = history.length;
  var monthlyServiceCount = history.filter(function (h) {
    var d = parseDate(h.date);
    return d && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  }).length;

  var weekdays = parseWeekdays(getWeekdayCellValue(row, rawRow));

  return {
    id: String(row.id || ''),
    name: String(row.name || row['氏名'] || ''),
    email: String(row.email || row['メール'] || row['メールアドレス'] || ''),
    campus: normalizeCampus(row.campus || row['キャンパス'] || row['所属'] || row['所属キャンパス'] || ''),
    instruments: instruments,
    preferredRole1: normalizeInstrument(row.preferredRole1 || row['得意楽器1'] || row['希望楽器1'] || instruments[0] || ''),
    preferredRole2: normalizeInstrument(row.preferredRole2 || row['得意楽器2'] || row['希望楽器2'] || instruments[1] || instruments[0] || ''),
    monthlyServiceCount: monthlyServiceCount,
    totalServiceCount: totalServiceCount,
    availableWeekdays: weekdays,
    avatarUrl: resolveAvatarUrl(row, rawRow, index),
    serviceHistory: history,
    bio: String(row.bio || row['自己紹介'] || '') || undefined,
    joinedYear: row.joinedYear ? Number(row.joinedYear) : (row['入団年'] ? Number(row['入団年']) : undefined),
  };
}

function buildInstrumentsList(row) {
  if (row.instruments || row['楽器'] || row['担当楽器']) {
    var fromCol = parseCommaList(row.instruments || row['楽器'] || row['担当楽器']);
    if (fromCol.length > 0) {
      return fromCol.map(normalizeInstrument).filter(function (v, i, a) { return v && a.indexOf(v) === i; });
    }
  }

  var list = [
    row.preferredRole1 || row['得意楽器1'] || row['希望楽器1'],
    row.preferredRole2 || row['得意楽器2'] || row['希望楽器2'],
    row.instrument3 || row['得意楽器3'],
  ]
    .map(function (v) { return normalizeInstrument(String(v || '')); })
    .filter(function (v) { return v !== ''; });

  var unique = [];
  list.forEach(function (v) {
    if (unique.indexOf(v) < 0) unique.push(v);
  });
  return unique;
}

function groupServiceLogs(logRows) {
  var map = {};
  logRows.forEach(function (row) {
    var memberId = String(
      row.memberId || row.memberid || row['メンバーID'] || row['メンバーid'] || '',
    ).trim();
    if (!memberId) return;
    if (!map[memberId]) map[memberId] = [];
    map[memberId].push(row);
  });
  return map;
}

// ---------------------------------------------------------------------------
// シート読み書きユーティリティ
// ---------------------------------------------------------------------------

function readSheetAsObjects(sheetName) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers = data[0].map(normalizeHeader);
  var rows = [];

  for (var r = 1; r < data.length; r++) {
    var obj = rowToObject(data[r], headers);
    if (Object.keys(obj).length === 0) continue;
    rows.push(obj);
  }
  return rows;
}

function getSheetHeaders(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(normalizeHeader);
}

function rowToObject(row, headers) {
  var obj = {};
  headers.forEach(function (h, i) {
    if (h) obj[h] = row[i];
  });
  return obj;
}

function objectToRow(obj, headers) {
  return headers.map(function (h) {
    var val = obj[h];
    if (val === undefined || val === null) return '';
    if (Array.isArray(val)) return val.join(',');
    return val;
  });
}

/** ServiceLog 行をヘッダー順に並べる（大文字小文字の差を吸収） */
function serviceLogToRow(obj, headers) {
  var fieldMap = {
    id: ['id'],
    date: ['date', '日付', '奉仕日'],
    campus: ['campus', 'キャンパス'],
    memberid: ['memberId', 'memberid', 'メンバーID'],
    membername: ['memberName', 'membername', '氏名', '名前'],
    instrument: ['instrument', 'role', '楽器', '担当楽器'],
    eventname: ['eventName', 'eventname', '内容', '奉仕内容', 'イベント'],
  };

  return headers.map(function (h, colIndex) {
    var key = normalizeHeader(h).toLowerCase();
    var aliases = fieldMap[key] || [h];
    for (var i = 0; i < aliases.length; i++) {
      if (obj[aliases[i]] !== undefined && obj[aliases[i]] !== null && obj[aliases[i]] !== '') {
        return obj[aliases[i]];
      }
    }
    if (colIndex === SERVICE_LOG_EVENT_COL && obj.eventName) {
      return obj.eventName;
    }
    return '';
  });
}

function findColumnIndex(headers, aliases) {
  for (var i = 0; i < aliases.length; i++) {
    var idx = headers.indexOf(normalizeHeader(aliases[i]));
    if (idx >= 0) return idx;
  }
  return -1;
}

function getHeaderAliases(field) {
  var map = {
    name: ['name', '氏名', '名前'],
    email: ['email', 'メール', 'メールアドレス'],
    campus: ['campus', 'キャンパス', '所属', '所属キャンパス'],
    preferredRole1: ['preferredRole1', 'preferredrole1', '得意楽器1', '希望楽器1', '得意1'],
    preferredRole2: ['preferredRole2', 'preferredrole2', '得意楽器2', '希望楽器2', '得意2'],
    availableWeekdays: ['availableWeekdays', 'availableweekdays', '参加可能曜日', '曜日'],
    bio: ['bio', '自己紹介'],
    joinedYear: ['joinedYear', 'joinedyear', '入団年'],
    avatarUrl: ['avatarUrl', 'avatarurl', 'アバター', 'avatar'],
    instruments: ['instruments', '楽器', '担当楽器'],
  };
  return map[field] || [field];
}

function normalizeHeader(h) {
  return String(h || '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
}

// ---------------------------------------------------------------------------
// データ変換
// ---------------------------------------------------------------------------

function parseCommaList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  return String(value)
    .split(/[,、/／|]/)
    .map(function (s) { return s.trim(); })
    .filter(function (s) { return s !== ''; });
}

function parseWeekdays(value) {
  return parseCommaList(value)
    .map(function (d) {
      if (d.indexOf('火') >= 0) return '火';
      if (d.indexOf('木') >= 0) return '木';
      if (d.indexOf('金') >= 0) return '金';
      return d;
    })
    .filter(function (d) { return d === '火' || d === '木' || d === '金'; });
}

function getWeekdayCellValue(row, rawRow) {
  var named = row.availableWeekdays || row.availableweekdays || row['参加可能曜日'] || row['曜日'] || '';
  if (named) return named;
  if (rawRow && rawRow.length > SETTINGS_WEEKDAY_COL) {
    return rawRow[SETTINGS_WEEKDAY_COL];
  }
  return '';
}

function getAvatarCellValue(row, rawRow) {
  var named = row.avatarUrl || row.avatarurl || row['アバター'] || row.avatar || '';
  if (named) return String(named).trim();
  if (rawRow && rawRow.length > SETTINGS_AVATAR_COL) {
    var cell = rawRow[SETTINGS_AVATAR_COL];
    if (cell) return String(cell).trim();
  }
  return '';
}

function resolveAvatarUrl(row, rawRow, index) {
  var raw = getAvatarCellValue(row, rawRow);
  if (raw) return raw;
  return buildDefaultAvatar(String(row.name || ''), index);
}

var WEEKDAY_TO_SHEET = {
  '火': '火曜日',
  '木': '木曜日',
  '金': '金曜日',
};

function formatWeekdaysForSheet(weekdays) {
  if (!weekdays || !weekdays.length) return '';
  return weekdays.map(function (d) {
    return WEEKDAY_TO_SHEET[d] || d;
  }).join(',');
}

var INSTRUMENT_ALIASES = {
  'アコギ': 'アコースティックギター',
  'acoustic': 'アコースティックギター',
  'acousticguitar': 'アコースティックギター',
  'エレキ': 'リード',
  'electric': 'リード',
  'electricguitar': 'リード',
  'エレキギター': 'リード',
  'キーボ': 'ピアノ/キーボード',
  'keyboard': 'ピアノ/キーボード',
  'piano': 'ピアノ/キーボード',
  'ピアノ': 'ピアノ/キーボード',
  'ドラム': 'ドラム/カホン',
  'drums': 'ドラム/カホン',
  'カホン': 'ドラム/カホン',
  'vocal': 'ボーカル',
  'vo': 'ボーカル',
  'ボーカル': 'ボーカル',
};

/**
 * スプレッドシートの所属表記をフロント用に統一（相模原 / 青山）
 * 例: 相模原キャンパス → 相模原、青山キャンパス → 青山
 */
function normalizeCampus(value) {
  var v = String(value || '').trim();
  if (!v) return '';
  if (v.indexOf('相模原') >= 0) return '相模原';
  if (v.indexOf('青山') >= 0) return '青山';
  return v;
}

function normalizeInstrument(value) {
  var v = String(value || '').trim();
  if (!v) return '';
  if (v === 'エレキギター') return 'リード';
  if (INSTRUMENT_ALIASES[v]) return INSTRUMENT_ALIASES[v];
  var lower = v.toLowerCase().replace(/\s+/g, '');
  if (INSTRUMENT_ALIASES[lower]) return INSTRUMENT_ALIASES[lower];
  return v;
}

function formatDateValue(value) {
  if (!value) return '';
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  var s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  var d = parseDate(s);
  if (d) return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return s;
}

function parseDate(str) {
  if (!str) return null;
  if (str instanceof Date) return str;
  var d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function buildDefaultAvatar(name, index) {
  var initial = name ? name.charAt(0) : '?';
  var colors = ['2563eb', '4f46e5', '0284c7', '0891b2', '0d9488', '7c3aed'];
  var color = colors[index % colors.length];
  return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(initial) +
    '&background=' + color + '&color=fff&size=128&bold=true';
}

// ---------------------------------------------------------------------------
// レスポンス
// ---------------------------------------------------------------------------

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({ error: message }))
    .setMimeType(ContentService.MimeType.JSON);
}
