#!/usr/bin/env python3
"""Build DSpace Simple Archive Format (SAF) folders from a CMA cataloguing sheet.

Usage (run with python3 -I, stdlib only):
  python3 -I build_saf.py SHEET.xlsx "Sheet name" overrides.json AUDIO_DIR OUT_DIR [--only CD2,CD3] [--auto]
  overrides.json may be "-". --auto also builds recordings with no overrides entry, titled from the
  sheet (General title, else Abstract, else first track). Columns are matched by header name.

Sheet layout (columns, header in row 1):
  A recording id (CD1, CD2...), one row per track, rows of a recording are grouped by A
  B Year  D Title (track title)  E Time in file  F Filename (no .wav)  H Abstract  I Description
  J Type (comma separated)  K Person(s)  L Keywords  M Location  N Map coordinates "lat, lon"
  O Collection  P Συσχετισμός (relations)  Q Άλλα σχόλια (internal notes)
Item-level values are taken from the first row of each recording.

overrides.json, one entry per recording id. Every key is optional except "title":
  {"CD2": {"title": "...", "people": ["..."], "curated": ["Τραγούδια"],
           "drop_keywords": ["Πάει"], "extra_keywords": ["..."], "hidden_keywords": ["..."],
           "relation": ["..."], "source": ["..."], "location": "...", "year": "1972",
           "note": "admin-only note", "files_dir": "folder of numbered WAVs, all into this one item"}}

Keywords: single words from L become dc.subject (shown). Multi-word entries from L (phrases, lyrics,
titles), "hidden_keywords", and the plain spelling of Cypriot keywords go to local.keyword.hidden:
searchable, but never shown to visitors.

Writes OUT_DIR/<id>/{dublin_core.xml, metadata_dcterms.xml, metadata_local.xml, contents} plus a hard link to the WAV,
and prints a review summary. Nothing is sent to DSpace by this script.
"""
import unicodedata
import json, os, re, sys, zipfile, xml.etree.ElementTree as ET
from xml.sax.saxutils import escape

NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}


def read_sheet(path, wanted):
    z = zipfile.ZipFile(path)
    ss = []
    if 'xl/sharedStrings.xml' in z.namelist():
        for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si', NS):
            ss.append(''.join(t.text or '' for t in si.iter('{%s}t' % NS['m'])))
    wb = ET.fromstring(z.read('xl/workbook.xml'))
    rels = {r.get('Id'): r.get('Target') for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
    for s in wb.find('m:sheets', NS):
        if s.get('name').strip() != wanted.strip():
            continue
        target = rels[s.get('{%s}id' % NS['r'])].lstrip('/')
        sh = ET.fromstring(z.read(target if target.startswith('xl/') else 'xl/' + target))
        rows = []
        for row in sh.iter('{%s}row' % NS['m']):
            d = {}
            for c in row.findall('m:c', NS):
                v, t = c.find('m:v', NS), c.get('t')
                if t == 's' and v is not None:
                    val = ss[int(v.text)]
                elif t == 'inlineStr':
                    val = ''.join(x.text or '' for x in c.iter('{%s}t' % NS['m']))
                else:
                    val = v.text if v is not None else ''
                d[re.match(r'[A-Z]+', c.get('r')).group()] = (val or '').strip()
            rows.append(d)
        if not rows:
            return []
        # Columns are found by header name, so inserted/moved columns do not break the import.
        # Internally every value keeps its old letter (B Year, D Title, E Time ...).
        names = {}
        for letter, head in rows[0].items():
            key = HEADERS.get(re.sub(r'\s+', ' ', head).strip().lower())
            if key and key not in names:
                names[key] = letter
        missing = [k for k in ('B', 'D', 'E', 'F', 'H', 'I') if k not in names]
        if missing:
            sys.exit(f'Sheet {wanted}: header(s) not found for {missing}; headers are {rows[0]}')
        out = []
        for d in rows[1:]:
            r = {'A': d.get('A', '')}
            for key, letter in names.items():
                r[key] = d.get(letter, '')
            out.append(r)
        return out
    sys.exit(f'Sheet not found: {wanted}')


HEADERS = {  # sheet header (lower case) -> internal key
    'year': 'B', 'date': 'DATE', 'general title': 'GT', 'title': 'D', 'time in file': 'E',
    'filename': 'F', 'filename in ήχος - split tracks': 'G', 'abstract': 'H', 'description': 'I',
    'type': 'J', 'person(s)': 'K', 'keywords': 'L', 'location': 'M', 'map coordinates': 'N',
    'collection': 'O', 'συσχετισμός με άλλα αρχεία': 'P', 'άλλα σχόλια': 'Q',
}


def coords(text):
    """'lat, lon' pairs in Google order, plain or with ° Β/Α. Returns [(lat, lon), ...]."""
    nums = re.findall(r'-?\d+(?:\.\d+)?', text or '')
    return [(nums[i], nums[i + 1]) for i in range(0, len(nums) - 1, 2)]


def hms(v):
    """Track time as HH:MM:SS. Excel stores typed times as a fraction of a day (0.0021990... = 00:03:10)."""
    v = (v or '').strip()
    if re.fullmatch(r'\d*\.?\d+(E-?\d+)?', v, re.I) and float(v) < 1:
        t = round(float(v) * 86400)
        return f'{t // 3600:02d}:{t % 3600 // 60:02d}:{t % 60:02d}'
    m = re.fullmatch(r'(\d+):(\d\d):(\d\d)', v)
    return f'{int(m[1]):02d}:{m[2]}:{m[3]}' if m else v


def years(*texts):
    ys = []
    for t in texts:
        ys += [int(y) for y in re.findall(r'(?<!\d)(1[89]\d\d|20\d\d)(?!\d)', t or '')]
    return ys


# Cypriot spellings with a combining breve (U+0306) on σ. Keywords typed in the plain spelling
# (sheet column L, "curated", "extra_keywords") are converted, and the plain form goes to
# local.keyword.hidden (searchable, not shown). Must match the curated-subjects page exactly.
CYPRIOT_SPELLINGS = {
    'Ταμπουτσιά': 'Ταμπουτσ\u0306ιά',
    'Τσιαττιστά': 'Τσ\u0306ιαττιστά',
}


def plain_forms(v):
    """Spellings of v without the combining breve (U+0306), as people type them.
    The breve is dropped (Σ̆ια -> Σια, Τσ̆ιαττιστά -> Τσιαττιστά); before α/ο/ω it is also written
    as ι (Τζ̆αννής -> Τζαννής and Τζιαννής, Σ̆ούφτας -> Σούφτας and Σιούφτας)."""
    d = unicodedata.normalize('NFD', v)
    if '\u0306' not in d:
        return []
    with_i = re.sub('\u0306(?=[αοωΑΟΩ])', 'ι', d)
    out = [d.replace('\u0306', ''), with_i.replace('\u0306', '')]
    return list(dict.fromkeys(unicodedata.normalize('NFC', x) for x in out))


def cypriot(k):
    k = unicodedata.normalize('NFC', k)
    return CYPRIOT_SPELLINGS.get(k, k)


def single_words(rows, drop):
    seen, out = set(), []
    for r in rows:
        for k in r.get('L', '').split(','):
            k = k.strip()
            if k and len(k.split()) == 1 and k.lower() not in seen:
                seen.add(k.lower())
                k = k[0].upper() + k[1:]
                if k not in drop:
                    out.append(k)
    return out


def phrases(rows, drop):
    """Multi-word entries of column L, as typed: searchable but hidden (local.keyword.hidden)."""
    seen, out = set(), []
    for r in rows:
        for k in r.get('L', '').split(','):
            k = ' '.join(k.split())
            if len(k.split()) > 1 and k.lower() not in seen and k not in drop:
                seen.add(k.lower())
                out.append(k)
    return out


def xml(schema, vals):
    s = f'<?xml version="1.0" encoding="UTF-8"?>\n<dublin_core schema="{schema}">\n'
    for e, q, v in vals:
        s += f'  <dcvalue element="{e}" qualifier="{q or "none"}">{escape(v)}</dcvalue>\n'
    return s + '</dublin_core>\n'


def main():
    a = sys.argv[1:]
    only = None
    auto = '--auto' in a
    if auto:
        a.remove('--auto')
    by_file = '--by-file' in a  # radio etc.: column A is a section, every new F (programme file/folder) starts an item
    if by_file:
        a.remove('--by-file')
    if '--only' in a:
        i = a.index('--only'); only = set(a[i + 1].split(',')); del a[i:i + 2]
    sheet, name, ovf, audio, out = a
    ov = {} if ovf == '-' else json.load(open(ovf, encoding='utf-8'))
    groups = {}
    rid = ''
    allrows = [r for r in read_sheet(sheet, name) if any(v.strip() for k, v in r.items() if k != 'A')]
    section = {}
    sec = ''
    for i, r in enumerate(allrows):
        if by_file:
            if r.get('A', '').strip() and r['A'].strip() != sec:
                sec = r['A'].strip(); rid = ''
            if r.get('F', '').strip():
                rid = r['F'].strip(); section[rid] = sec
            if rid:
                groups.setdefault(rid, []).append(r)
            continue
        if r.get('A', '').strip():
            rid = r['A'].strip()
        elif r.get('F', '').strip() and any(x.get('F', '').strip() for x in groups.get(rid, [])):
            # id missing on the first row of a new recording (it has its own WAV): take the next row's id
            nxt = next((x['A'].strip() for x in allrows[i + 1:] if x.get('A', '').strip()), '')
            rid = nxt if nxt and nxt not in groups else r['F'].strip()
        if rid:
            groups.setdefault(rid, []).append(r)
    for rid, rows in groups.items():
        if only and rid not in only:
            continue
        if rid not in ov and not auto:
            print(f'SKIP {rid}: no entry in overrides.json'); continue
        o, h = dict(ov.get(rid, {})), rows[0]
        audio_dir = os.path.join(audio, section[rid]) if by_file else audio
        if by_file and not os.path.isdir(audio_dir):
            continue  # section not in this upload (its folder under AUDIO_DIR is named after column A)
        if by_file and 'files_dir' not in o and os.path.isdir(audio_dir):
            nk = lambda x: re.sub(r'\s+', '', x).lower()
            d_hit = [x for x in os.listdir(audio_dir) if os.path.isdir(os.path.join(audio_dir, x)) and nk(x) == nk(rid)]
            if d_hit:
                o['files_dir'] = d_hit[0]
        if 'title' not in o:  # --auto: take the title from the sheet, to be edited later
            o['title'] = (h.get('GT') or h.get('H') or h.get('D') or rid).strip()
        people = o.get('people') or [p.strip() for p in h.get('K', '').split(',') if p.strip()]
        people = list(dict.fromkeys('Μιχάλης Ττερλικκάς' if p in ('Μ. Ττερλικκάς', 'Μ.Ττερλικκάς') else p for p in people))
        ys = years(h.get('B', '')) or years(*[r.get('DATE', '') for r in rows])
        year = o.get('year') or (str(min(ys)) if ys else '')
        raw_year = h.get('B', '').strip()
        if not year:
            print(f'WARNING {rid}: no year found')
        locations = ([o['location']] if isinstance(o['location'], str) else o['location']) if o.get('location') else list(dict.fromkeys(x.strip(' ;') for x in h.get('M', '').split(',') if x.strip(' ;')))
        location = ', '.join(locations)
        points = coords(h.get('N', ''))
        keywords = []
        for k in o.get('curated', []) + single_words(rows, set(o.get('drop_keywords', []))) + o.get('extra_keywords', []):
            k = cypriot(k)
            if k not in keywords:
                keywords.append(k)
        plain = [p for p, c in CYPRIOT_SPELLINGS.items() if c in keywords]
        hidden = []
        for k in phrases(rows, set(o.get('drop_keywords', []))) + o.get('hidden_keywords', []) + plain:
            if k.lower() not in (x.lower() for x in hidden + keywords):
                hidden.append(k)
        # Plain spellings (no breve) of every name, place and keyword written with a breve, so a search
        # typed without the breve (Τζιαννής, Σια, Τσιαττιστά) still finds the item.
        for v in keywords + people + locations + list(hidden):
            for pv in plain_forms(v):
                if pv.lower() not in (x.lower() for x in hidden + keywords):
                    hidden.append(pv)
        types = []
        for r in rows:
            for t in r.get('J', '').split(','):
                if t.strip() and t.strip() not in types:
                    types.append(t.strip())
        toc = '\n'.join(f"{hms(r.get('E', ''))} — {r.get('D', '').strip()}" for r in rows)
        if by_file:
            def tline(r):
                f, e, d = r.get('G', '').strip(), r.get('E', '').strip(), r.get('D', '').strip()
                e = ' – '.join(hms(x.strip()) for x in re.split(r'\s+-\s+', e)) if e else ''
                if o.get('files_dir') and re.match(r'\d', f):
                    f = 'Αρχείο ' + f
                return ' · '.join(x for x in (f, e, d or '(χωρίς τίτλο)') if x)
            toc = '\n'.join(tline(r) for r in rows)
        notes = []
        for r in rows:
            q = r.get('Q', '').strip()
            if q:
                n = f"{r.get('D', '').strip()} – {q}" if len(rows) > 1 and r is not h else q
                if n not in notes:
                    notes.append(n)
        dc = [('title', None, o['title']), ('date', 'issued', year)]
        dc += [('contributor', 'author', p) for p in people]
        dc += [('description', 'abstract', h.get('H', '')), ('description', None, h.get('I', ''))]
        dc += [('type', None, t) for t in types]
        dc += [('coverage', 'spatial', x) for x in locations]
        dc.append(('identifier', 'other', rid))
        if o.get('note'):
            notes.append(o['note'])
        if rid in ov and ov[rid].get('title') and not h.get('GT', '').strip():
            notes.append('Ο τίτλος γράφτηκε κατά την εισαγωγή με βάση την περιγραφή (δεν υπήρχε στο φύλλο). Να ελεγχθεί.')
        if raw_year and not re.fullmatch(r'\d{4}(\.0)?', raw_year):
            notes.append(f'Χρονολογία στο φύλλο: {raw_year}')
        dc += [('subject', None, k) for k in keywords]
        dc.append(('description', 'tableofcontents', toc))
        dc += [('relation', None, x) for x in o.get('relation', [])]
        dc += [('source', None, x) for x in o.get('source', [])]
        dc += [('description', 'provenance', 'Σχόλιο καταλογογράφησης: ' + n) for n in notes]
        d = os.path.join(out, rid); os.makedirs(d, exist_ok=True)
        open(os.path.join(d, 'dublin_core.xml'), 'w', encoding='utf-8').write(xml('dc', [x for x in dc if x[2]]))
        if hidden:  # searchable, hidden from visitors (metadata.hide in local.cfg)
            open(os.path.join(d, 'metadata_local.xml'), 'w', encoding='utf-8').write(
                xml('local', [('keyword', 'hidden', k) for k in hidden]))
        if points:
            lat, lon = points[0]
            open(os.path.join(d, 'metadata_dcterms.xml'), 'w', encoding='utf-8').write(
                xml('dcterms', [('spatial', None, f'point({lon} {lat})')]))
        if o.get('files_dir'):
            # one item, several files: every WAV in AUDIO_DIR/<files_dir>, in the order of their leading number
            fd = os.path.join(audio_dir, o['files_dir'])
            wavs = sorted((f for f in os.listdir(fd) if f.lower().endswith('.wav') and not f.startswith('._')),
                          key=lambda f: (int(re.match(r'\d+', f)[0]) if re.match(r'\d+', f) else 10**6, f))
            lines = []
            for f in wavs:
                dst = os.path.join(d, f)
                if not os.path.exists(dst):
                    os.link(os.path.join(fd, f), dst)
                lines.append(f'{f}\tbundle:ORIGINAL\n')
            if len(wavs) != len(rows):
                print(f'WARNING {rid}: {len(wavs)} files in {fd} but {len(rows)} tracks in the sheet')
            open(os.path.join(d, 'contents'), 'w', encoding='utf-8').write(''.join(lines))
            wav = None
        else:
            wav = h['F'].strip() + '.wav'
            src = os.path.join(audio_dir, wav)
        if wav is None:
            pass
        elif not os.path.exists(src) and os.path.isdir(audio_dir):  # same name ignoring case/spaces
            want = re.sub(r'\s+', '', wav).lower()
            hit = [f for f in os.listdir(audio_dir) if re.sub(r'\s+', '', f).lower() == want]
            if hit:
                wav = hit[0]; src = os.path.join(audio_dir, wav)
        if wav is None:
            pass
        elif os.path.exists(src):
            dst = os.path.join(d, wav)
            if not os.path.exists(dst):
                os.link(src, dst)
        else:
            print(f'WARNING {rid}: audio file missing: {src}')
        if wav is not None:
            open(os.path.join(d, 'contents'), 'w', encoding='utf-8').write(f'{wav}\tbundle:ORIGINAL\n')
        print(f'== {rid}: {o["title"]}\n   {year} | {", ".join(people)} | {location} | {", ".join(types)}'
              f'\n   {len(rows)} tracks | keywords: {", ".join(keywords)}'
              f'\n   hidden search keywords: {len(hidden)}{" (" + "; ".join(hidden[:5]) + ("; …" if len(hidden) > 5 else "") + ")" if hidden else ""}'
              f'\n   map: {points[0] if points else "none"}{"  (only the first of " + str(len(points)) + " pins is used)" if len(points) > 1 else ""}'
              f'\n   P column (not used automatically): {[r["P"] for r in rows if r.get("P")]}')


if __name__ == '__main__':
    main()
