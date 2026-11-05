// test-lah workbook builder.  Usage: node build.js data.json out.xlsx   (needs: npm i exceljs@4.4.0)
// Data contract: see ../references/workbook-spec.md ("Data contract") and sample-data.json.
const ExcelJS = require('exceljs'), fs = require('fs'), path = require('path');
const [inFile, outFile] = process.argv.slice(2);
if (!inFile || !outFile) { console.error('usage: node build.js data.json out.xlsx'); process.exit(1); }
const D = JSON.parse(fs.readFileSync(inFile, 'utf8')), dir = path.dirname(path.resolve(inFile));
const META = D.meta || {}, FONT = META.font || 'Calibri', MODS = D.modules || [];

// ---- colors: one brand hex, everything else derived (shortcut: assumes a mid-dark brand color for white header text)
const HEX = (META.color || '#455A64').replace('#', '').toUpperCase();
const mixTo = (t, to) => 'FF' + HEX.match(/../g).map(h => Math.round(parseInt(h, 16) * (1 - t) + to * t).toString(16).padStart(2, '0')).join('').toUpperCase();
const P = 'FF' + HEX, DARK = mixTo(0.3, 0), SOFT = mixTo(0.82, 255), SOFTER = mixTo(0.92, 255);
const INK = 'FF2B2F33', GREY = 'FF6B7075', WHITE = 'FFFFFFFF', RED = 'FFC00000';
const STATUS = {
  'Pass': ['FF1E8E3E', WHITE], 'Fail': ['FFC62828', WHITE], 'Blocked': ['FFFFC000', 'FF3B2F00'],
  'TBC': ['FF00897B', WHITE], 'Not Tested': ['FFD0D3D6', 'FF2B2B2B'],
};
const PRIO = { 'High': ['FFE65100', WHITE], 'Medium': ['FF1565C0', WHITE], 'Low': ['FF78909C', WHITE] };

// ---- text helpers
const base = (x = {}) => ({ name: FONT, size: 12, color: { argb: INK }, ...x });
const codeFont = { name: 'Consolas', size: 10, italic: true, color: { argb: INK } };
const solid = argb => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
const thin = { style: 'thin', color: { argb: 'FFBFC3C7' } }, border = { top: thin, left: thin, bottom: thin, right: thin };
const SENT = /(?<=[.!?])\s+(?=["'(A-Z])/;
const bulletize = t => { const x = String(t || ''); if (x.includes('\n') || x.length < 140) return x; const p = x.split(SENT); return p.length >= 3 ? p.map(q => '• ' + q).join('\n') : x; };
const boldMarks = text => { // **x** becomes bold
  const s = String(text || ''); if (!s.includes('**')) return s;
  return { richText: s.split(/(\*\*.+?\*\*)/).filter(Boolean).map(seg => /^\*\*.+\*\*$/.test(seg) ? { text: seg.slice(2, -2), font: base({ bold: true }) } : { text: seg, font: base() }) };
};
const headSplit = t => { const m = String(t).match(/^(.+?[.!?])(\s+[\s\S]*)?$/); return m ? [m[1], m[2] || ''] : [String(t), '']; };
const redLead = text => { const [h, r] = headSplit(text); return { richText: [{ text: h, font: base({ bold: true, color: { argb: RED } }) }, { text: r, font: base() }] }; };
const points = (parts, urgent) => { // numbered when more than one; first sentence of each point bold
  parts = [].concat(parts || []); const out = [];
  parts.forEach((t, i) => {
    const [h, r] = headSplit(t); if (i) out.push({ text: '\n\n', font: base() });
    if (parts.length > 1) out.push({ text: (i + 1) + '. ', font: base({ bold: true, color: { argb: DARK } }) });
    out.push({ text: h, font: base({ bold: true, color: { argb: urgent ? RED : INK } }) });
    if (r) out.push({ text: r, font: base() });
  });
  return { richText: out };
};
const plain = v => (v && v.richText ? v.richText.map(x => x.text).join('') : String(v == null ? '' : v));
const rowHeight = (vals, widths, minPx = 0) => {
  let lines = 1;
  vals.forEach((v, i) => { const s = plain(v); if (!s) return; const w = Math.max(6, widths[i] * 0.95);
    lines = Math.max(lines, s.split('\n').reduce((n, p) => n + Math.max(1, Math.ceil(p.length / w)), 0)); });
  return Math.min(409, Math.max(32, lines * 16 + 10, minPx * 0.75 + 8));
};
const safeName = (s, used) => { let n = String(s).replace(/[:\\/?*\[\]]/g, '-').slice(0, 31), k = 2; while (used.has(n.toLowerCase())) n = n.slice(0, 28) + ' ' + k++; used.add(n.toLowerCase()); return n; };
const cfStatus = (map, ref) => ({ ref, rules: Object.entries(map).map(([name, [fill, font]], k) => ({ type: 'cellIs', operator: 'equal', formulae: ['"' + name + '"'], priority: k + 1,
  style: { font: { bold: true, color: { argb: font } }, fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: fill } } } })) });

const wb = new ExcelJS.Workbook(); wb.creator = META.creator || 'test-lah'; wb.created = new Date();
const used = new Set(); const summary = wb.addWorksheet(safeName('Summary', used), { properties: { tabColor: { argb: P } } });

function banner(ws, text, lastCol) {
  ws.mergeCells(1, 1, 1, lastCol); const c = ws.getCell(1, 1); c.value = text;
  c.font = base({ size: 14, bold: true, color: { argb: WHITE } }); c.fill = solid(P); c.alignment = { vertical: 'middle', indent: 1 }; ws.getRow(1).height = 32;
}
function head(ws, row, labels, fills) {
  labels.forEach((l, i) => { const c = ws.getCell(row, i + 1); c.value = l; c.font = base({ size: 14, bold: true, color: { argb: WHITE } });
    c.fill = solid(fills ? fills[i] : P); c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }; c.border = border; });
  ws.getRow(row).height = 36;
}
const style = (c, o = {}) => { c.font = o.font || base(); c.alignment = { vertical: 'middle', wrapText: true, horizontal: o.center ? 'center' : 'left' }; c.border = border; if (o.fill) c.fill = solid(o.fill); };

// ---- module sheets
const COLS = [['ID', 12], ['Module', 14], ['Feature', 18], ['Scenario', 34], ['Type', 11], ['Priority', 11], ['Precondition', 28], ['Steps', 48], ['Test Data', 24], ['Expected Result', 52], ['Actual Result', 40], ['Status', 14], ['Notes', 30], ['Evidence', 62]];
const W = COLS.map(c => c[1]), SHOT_W = 420;
const pngSize = f => { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
const stats = [];
const needs = [];

MODS.forEach(m => {
  const ws = wb.addWorksheet(safeName(m.name, used), { properties: { tabColor: { argb: P } }, views: [{ state: 'frozen', ySplit: 2, zoomScale: 90 }] });
  ws.columns = COLS.map(c => ({ width: c[1] }));
  banner(ws, `${m.name} (${m.prefix})`, COLS.length);
  head(ws, 2, COLS.map(c => c[0]), COLS.map((c, i) => (i >= 10 ? DARK : P)));
  const cnt = { Pass: 0, Fail: 0, Blocked: 0, TBC: 0, 'Not Tested': 0 }, failed = [];
  (m.cases || []).forEach((c, i) => {
    const id = `${m.prefix}-${String(i + 1).padStart(3, '0')}`, r = (m.results || {})[id] || {};
    let status = STATUS[r.status] ? r.status : 'Not Tested';
    if (status === 'Not Tested' && /^(Observed|Hasil pengamatan)/i.test(r.actual || '')) status = 'TBC'; // ran, expectation awaits a decision
    cnt[status]++; if (status === 'Fail') failed.push(id);
    if (status === 'Blocked' && r.need) needs.push({ id, module: m.name, scenario: c.scenario, need: r.need });
    const shot = r.shot && fs.existsSync(path.resolve(dir, r.shot)) ? path.resolve(dir, r.shot) : null;
    if (r.shot && !shot) console.warn('WARNING: screenshot file not found:', id, r.shot);
    if ((status === 'Fail' || r.urgent) && !shot && !r.snippet) console.warn('WARNING: Fail or urgent case without evidence (shot or snippet):', id);
    let dim = null; if (shot) { const [w, h] = pngSize(shot); dim = [SHOT_W, Math.round(SHOT_W * h / w)]; }
    const actual = r.actual ? (r.urgent ? redLead(bulletize(r.actual)) : bulletize(r.actual)) : '';
    const vals = [id, m.name, c.feature, c.scenario, c.type, c.priority, c.precondition, c.steps, c.testData, boldMarks(c.expected), actual, status, bulletize(r.notes), r.snippet || ''];
    const row = ws.getRow(i + 3); vals.forEach((v, k) => { const cell = row.getCell(k + 1); cell.value = v; });
    for (let k = 1; k <= COLS.length; k++) {
      const cell = row.getCell(k), name = COLS[k - 1][0];
      style(cell, { center: ['ID', 'Type', 'Priority', 'Status'].includes(name), font: name === 'Precondition' || name === 'Notes' ? base({ color: { argb: GREY } }) : name === 'Test Data' ? base({ size: 10, italic: true }) : name === 'Evidence' ? codeFont : base() });
    }
    row.height = rowHeight(vals, W, dim ? dim[1] : 0);
    if (dim) { const imgId = wb.addImage({ filename: shot, extension: 'png' }); ws.addImage(imgId, { tl: { col: 13.05, row: i + 2.05 }, ext: { width: dim[0], height: dim[1] } }); }
  });
  const n = (m.cases || []).length;
  if (n) { ws.addConditionalFormatting(cfStatus(STATUS, `L3:L${n + 2}`)); ws.addConditionalFormatting(cfStatus(PRIO, `F3:F${n + 2}`)); }

  // issues table, softer palette, below the cases. Columns reuse the case grid via merges.
  const issues = m.issues || [], issueText = new Set(issues.map(x => String(x.ref || '')).join(', ').split(/,\s*/));
  failed.filter(id => !issueText.has(id)).forEach(id => console.warn('WARNING: Fail without an issue row:', id));
  let r0 = n + 5;
  ws.mergeCells(r0, 1, r0, 12); const t = ws.getCell(r0, 1); t.value = 'Issues to raise with the tech team'; t.font = base({ size: 14, bold: true, color: { argb: DARK } }); t.fill = solid(SOFT); t.alignment = { vertical: 'middle', indent: 1 }; ws.getRow(r0).height = 30;
  const MAP = [['Type', 1, 1, 12], ['Severity', 2, 2, 14], ['Area', 3, 3, 18], ['Issue', 4, 7, 34 + 11 + 11 + 28], ['Suggested fix', 8, 9, 72], ['Minimal steps to reproduce', 10, 10, 52], ['Reference', 11, 12, 54]];
  r0++; MAP.forEach(([l, a, b]) => { if (b > a) ws.mergeCells(r0, a, r0, b); head(ws, r0, [], null); const c = ws.getCell(r0, a); c.value = l; c.font = base({ size: 14, bold: true, color: { argb: DARK } }); c.fill = solid(SOFT); c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }; c.border = border; });
  ws.getRow(r0).height = 36;
  const ORD = { Bug: 0, Improvement: 1 }, SEV = { High: 0, Medium: 1, Low: 2 };
  [...issues].sort((a, b) => (ORD[a.type] - ORD[b.type]) || (SEV[a.severity] - SEV[b.severity])).forEach(it => {
    r0++; const vals = [it.type, it.severity, it.area, points(it.issue, it.urgent), points(it.fix), it.steps || '', it.ref || ''];
    MAP.forEach(([, a, b], k) => { if (b > a) ws.mergeCells(r0, a, r0, b); const c = ws.getCell(r0, a); c.value = vals[k]; style(c, { center: k < 3, fill: k < 2 ? SOFTER : undefined });
      for (let x = a; x <= b; x++) ws.getCell(r0, x).border = border; });
    ws.getRow(r0).height = rowHeight(vals, MAP.map(x => x[3]));
  });
  stats.push({ m, cnt, n, bugs: issues.filter(x => x.type === 'Bug').length, imps: issues.filter(x => x.type !== 'Bug').length });
});

// ---- Manual Tests
if (needs.length) {
  const ws = wb.addWorksheet(safeName('Manual Tests', used), { properties: { tabColor: { argb: 'FFFFC000' } } });
  ws.columns = [{ width: 14 }, { width: 22 }, { width: 50 }, { width: 70 }];
  banner(ws, 'Blocked cases: need a person, device or team action', 4); head(ws, 2, ['ID', 'Module', 'Scenario', 'What you need / why it is manual']);
  needs.forEach((x, i) => { const row = ws.getRow(i + 3); [x.id, x.module, x.scenario, x.need].forEach((v, k) => { const c = row.getCell(k + 1); c.value = v; style(c, { font: k === 3 ? base({ bold: true, color: { argb: 'FF1E7B34' } }) : base() }); });
    row.height = rowHeight([x.id, x.module, x.scenario, x.need], [14, 22, 50, 70]); });
}

// ---- Summary
(function () {
  const ws = summary, hdr = ['Module', 'Total', 'Pass', 'Fail', 'Blocked', 'TBC', 'Not Tested', 'Pass rate', 'Bugs', 'Improvements'];
  ws.columns = [30, 9, 9, 9, 10, 9, 12, 11, 9, 14].map(w => ({ width: w })); banner(ws, META.title || 'Test Case Summary', hdr.length);
  const info = [['Environment', META.env], ['Basis', META.basis], ['Accounts', META.accounts], ['Date', META.date || new Date().toISOString().slice(0, 10)]].filter(x => x[1]);
  let r = 3; info.forEach(([k, v]) => { ws.mergeCells(r, 2, r, hdr.length); const a = ws.getCell(r, 1), b = ws.getCell(r, 2); a.value = k; a.font = base({ bold: true }); b.value = v; b.font = base(); b.alignment = { wrapText: true, vertical: 'middle' }; ws.getRow(r).height = rowHeight([v], [90]); r++; });
  r++; head(ws, r, hdr); const first = r + 1;
  stats.forEach(s => { r++; const done = s.n - s.cnt['Not Tested'], vals = [s.m.name, s.n, s.cnt.Pass, s.cnt.Fail, s.cnt.Blocked, s.cnt.TBC, s.cnt['Not Tested'], s.n ? s.cnt.Pass / s.n : 0, s.bugs, s.imps];
    vals.forEach((v, k) => { const c = ws.getCell(r, k + 1); c.value = v; style(c, { center: k > 0 }); if (k === 7) c.numFmt = '0%'; }); ws.getRow(r).height = 28; });
  const last = r; r++;
  const tot = ['Total', ...[1, 2, 3, 4, 5, 6].map(k => stats.reduce((a, s) => a + [s.n, s.cnt.Pass, s.cnt.Fail, s.cnt.Blocked, s.cnt.TBC, s.cnt['Not Tested']][k - 1], 0))];
  tot.forEach((v, k) => { const c = ws.getCell(r, k + 1); c.value = v; style(c, { center: k > 0, font: base({ bold: true }), fill: SOFT }); }); ws.getRow(r).height = 28;
  if (last >= first) { // heatmap: darker = more issues
    ws.addConditionalFormatting({ ref: `I${first}:I${last}`, rules: [{ type: 'colorScale', cfvo: [{ type: 'min' }, { type: 'max' }], color: [{ argb: 'FFFFFFFF' }, { argb: 'FFF4A6A6' }] }] });
    ws.addConditionalFormatting({ ref: `D${first}:D${last}`, rules: [{ type: 'colorScale', cfvo: [{ type: 'min' }, { type: 'max' }], color: [{ argb: 'FFFFFFFF' }, { argb: 'FFF4A6A6' }] }] }); }
  const section = (title, rows, widthCols) => { r += 2; ws.mergeCells(r, 1, r, hdr.length); const c = ws.getCell(r, 1); c.value = title; c.font = base({ size: 14, bold: true, color: { argb: DARK } }); c.fill = solid(SOFT); ws.getRow(r).height = 30;
    rows.forEach(v => { r++; ws.mergeCells(r, 2, r, hdr.length); const a = ws.getCell(r, 1), b = ws.getCell(r, 2); a.value = v[0]; b.value = v[1]; style(a, { font: v[2] || base({ bold: true }) }); style(b, { font: v[2] || base() }); ws.getRow(r).height = rowHeight([v[0], v[1]], [30, 90]); }); };
  if (D.patterns && D.patterns.length) section('Patterns seen in several modules', D.patterns.map(p => [p.pattern, `${p.modules || ''}${p.component ? ' | shared component: ' + p.component : ''}`]));
  if (needs.length) section(META.needsTitle || 'Needs from the team', needs.map(x => [x.id, x.need, base({ bold: true, color: { argb: 'FF1E7B34' } })]));
  ws.views = [{ zoomScale: 90 }];
})();

// ---- Legend
const lg = wb.addWorksheet(safeName('Legend', used)); lg.columns = [{ width: 16 }, { width: 80 }];
banner(lg, 'Legend', 2);
const LEG = [['Pass', 'Actual matches expected.'], ['Fail', 'Actual differs from expected; see Issues table.'], ['Blocked', 'Needs a person, device or team action; listed in Manual Tests.'], ['TBC', 'Case ran; expected result waits for a product decision.'], ['Not Tested', 'Not run yet.']];
LEG.forEach(([s, t], i) => { const a = lg.getCell(i + 2, 1), b = lg.getCell(i + 2, 2); a.value = s; b.value = t; style(a, { center: true, font: base({ bold: true, color: { argb: STATUS[s][1] } }), fill: STATUS[s][0] }); style(b); lg.getRow(i + 2).height = 28; });
const rl = LEG.length + 3; const u = lg.getCell(rl, 1); u.value = 'Red text'; style(u, { center: true, font: base({ bold: true, color: { argb: RED } }) }); const ub = lg.getCell(rl, 2); ub.value = 'Urgent finding: developers should read this first.'; style(ub); lg.getRow(rl).height = 28;

wb.xlsx.writeFile(outFile).then(() => console.log('wrote', outFile)).catch(e => {
  if (e.code === 'EBUSY' || e.code === 'EPERM') { const alt = outFile.replace(/\.xlsx$/, '.next.xlsx'); return wb.xlsx.writeFile(alt).then(() => console.log('file is open in Excel; wrote', alt)); }
  throw e;
});
