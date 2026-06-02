const CONFIG = {
  SCHEDULE_SHEET: 'Schedule',
  BOOKINGS_SHEET: 'Bookings',
  API_KEY_PROPERTY: 'API_KEY', // Script Properties key
  RATE_LIMIT_WINDOW_SEC: 60,   // окно rate limit
  RATE_LIMIT_MAX: 10,           // макс заявок в окно на phone
  HONEYPOT_FIELD: 'website'    // скрытое поле антиспам
};

function doGet(e) {
  try {
    const auth = checkApiKey_(e);
    if (!auth.ok) return json_({ ok: false, error: auth.error });

    const action = (e && e.parameter && e.parameter.action) || 'schedule';

    if (action === 'schedule') {
      const items = getSchedule_();
      return json_({ ok: true, items: items });
    }

    return json_({ ok: false, error: 'unknown_action' });
  } catch (err) {
    return json_({ ok: false, error: 'server_error', details: String(err) });
  }
}

function doPost(e) {
  try {
    const auth = checkApiKey_(e);
    if (!auth.ok) return json_({ ok: false, error: auth.error });

    const payload = parsePayload_(e);

    // honeypot: поле должно быть пустым
    if ((payload[CONFIG.HONEYPOT_FIELD] || '').toString().trim() !== '') {
      return json_({ ok: false, error: 'spam_detected' });
    }

    const v = validateBooking_(payload);
    if (!v.ok) return json_({ ok: false, error: 'validation_error', fields: v.fields });

    const rl = rateLimit_(payload.phone);
    if (!rl.ok) return json_({ ok: false, error: 'rate_limited', retryAfterSec: rl.retryAfterSec });

    appendBooking_(payload);

    return json_({ ok: true, message: 'booking_saved' });
  } catch (err) {
    return json_({ ok: false, error: 'server_error', details: String(err) });
  }
}

/** ----------------- Core ----------------- */

function getSchedule_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SCHEDULE_SHEET);
  if (!sh) throw new Error('Sheet not found: ' + CONFIG.SCHEDULE_SHEET);

  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);
  const rows = values.slice(1);

  const idx = indexMap_(headers, ['id', 'date', 'time', 'river', 'title', 'isActive']);

  const out = [];
  rows.forEach(function (r) {
    const item = {
      id: valueAt_(r, idx.id),
      date: normalizeDate_(valueAt_(r, idx.date)),
      time: normalizeTime_(valueAt_(r, idx.time)),
      river: valueAt_(r, idx.river),
      title: valueAt_(r, idx.title),
      isActive: toBool_(valueAt_(r, idx.isActive))
    };

    if (item.isActive) out.push(item);
  });

  return out;
}

function appendBooking_(payload) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.BOOKINGS_SHEET);
  if (!sh) throw new Error('Sheet not found: ' + CONFIG.BOOKINGS_SHEET);

  const requiredHeaders = [
    'tripTitle',
    'tripDate',
    'name',
    'phone',
    'peopleCount',
    'kidsCount',
    'kidsAges',
    'comment',
    'source'
  ];

  let lastColumn = sh.getLastColumn();

  if (lastColumn < 1) {
    sh.appendRow(requiredHeaders);
    lastColumn = requiredHeaders.length;
  }

  let headers = sh.getRange(1, 1, 1, lastColumn).getValues()[0].map(String);

  const hasAnyHeader = headers.some(function (header) {
    return header.trim() !== '';
  });

  if (!hasAnyHeader) {
    sh.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    headers = requiredHeaders;
  }

  const values = {
    tripTitle: payload.tripTitle || payload.tripId || '',
    tripDate: parseTripDate_(payload.tripDate),
    name: payload.name,
    phone: payload.phone,
    peopleCount: Number(payload.peopleCount),
    kidsCount: Number(payload.kidsCount || 0),
    kidsAges: payload.kidsAges || '',
    comment: payload.comment || '',
    source: payload.source || 'site'
  };

  const row = headers.map(function (header) {
    return values[header] !== undefined ? values[header] : '';
  });

  sh.appendRow(row);
}


/** ----------------- Auth / Security ----------------- */

function checkApiKey_(e) {
  const expected = PropertiesService.getScriptProperties().getProperty(CONFIG.API_KEY_PROPERTY);
  if (!expected) return { ok: false, error: 'api_key_not_configured' };

  // В Apps Script web app заголовки недоступны стабильно.
  // Поэтому ключ берем из query/body: ?key=... или { apiKey: ... }
  const payload = parsePayloadSafe_(e);
  const got = (
    (e && e.parameter && (e.parameter.key || e.parameter.apiKey)) ||
    payload.key ||
    payload.apiKey ||
    ''
  ).toString();

  if (!got || got !== expected) return { ok: false, error: 'unauthorized' };
  return { ok: true };
}

function rateLimit_(phone) {
  const cache = CacheService.getScriptCache();
  const key = 'rl:' + String(phone).replace(/\D/g, '');
  const nowCount = Number(cache.get(key) || 0);

  if (nowCount >= CONFIG.RATE_LIMIT_MAX) {
    return { ok: false, retryAfterSec: CONFIG.RATE_LIMIT_WINDOW_SEC };
  }

  cache.put(key, String(nowCount + 1), CONFIG.RATE_LIMIT_WINDOW_SEC);
  return { ok: true };
}

/** ----------------- Validation ----------------- */

function validateBooking_(p) {
  const fields = {};

  if (!p.name || String(p.name).trim().length < 2) {
    fields.name = 'name_min_2';
  }

  const phone = String(p.phone || '').trim();
  if (!/^[+\d()\-\s]{6,20}$/.test(phone)) {
    fields.phone = 'invalid_phone';
  }

  const people = Number(p.peopleCount);
  if (!Number.isInteger(people) || people < 1 || people > 20) {
    fields.peopleCount = 'peopleCount_1_20';
  }

  const kids = Number(p.kidsCount || 0);
  if (!Number.isInteger(kids) || kids < 0 || kids > 10) {
    fields.kidsCount = 'kidsCount_0_10';
  }

  if (String(p.kidsAges || '').length > 120) {
    fields.kidsAges = 'kidsAges_max_120';
  }

  if (!p.tripTitle && !p.tripId) {
    fields.tripTitle = 'tripTitle_required';
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(p.tripDate || ''))) {
    fields.tripDate = 'tripDate_format_YYYY_MM_DD';
  }

  return { ok: Object.keys(fields).length === 0, fields: fields };
}


/** ----------------- Utils ----------------- */

function parsePayload_(e) {
  // JSON body
  if (e && e.postData && e.postData.contents) {
    try {
      const obj = JSON.parse(e.postData.contents);
      if (obj && typeof obj === 'object') return obj;
    } catch (_) {}
  }

  // x-www-form-urlencoded
  if (e && e.parameter) return e.parameter;

  return {};
}

function parsePayloadSafe_(e) {
  try {
    return parsePayload_(e);
  } catch (_) {
    return {};
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function indexMap_(headers, required) {
  const map = {};
  required.forEach(function (name) {
    const i = headers.indexOf(name);
    if (i < 0) throw new Error('Missing column in sheet: ' + name);
    map[name] = i;
  });
  return map;
}

function valueAt_(row, idx) {
  return idx >= 0 ? row[idx] : '';
}

function toBool_(v) {
  if (typeof v === 'boolean') return v;
  const s = String(v).trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'y';
}

function normalizeDate_(v) {
  if (Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v)) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(v || '').trim();
}

function normalizeTime_(v) {
  if (Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v)) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'HH:mm');
  }
  return String(v || '').trim();
}

function parseTripDate_(value) {
  const s = String(value || '').trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!m) return s;

  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}
