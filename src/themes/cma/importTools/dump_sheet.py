import zipfile,sys,re,xml.etree.ElementTree as ET
ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
z=zipfile.ZipFile(sys.argv[1])
ss=[]
if 'xl/sharedStrings.xml' in z.namelist():
  for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si',ns):
    ss.append(''.join(t.text or '' for t in si.iter('{%s}t'%ns['m'])))
wb=ET.fromstring(z.read('xl/workbook.xml'))
rels=ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
rmap={r.get('Id'):r.get('Target') for r in rels}
want=sys.argv[2] if len(sys.argv)>2 else None
for s in wb.find('m:sheets',ns):
  name=s.get('name'); tgt=rmap[s.get('{%s}id'%ns['r'])]
  print('== SHEET',name)
  if want is None or want.lower() not in name.lower(): continue
  path='xl/'+tgt.lstrip('/').replace('xl/','')
  sh=ET.fromstring(z.read(path))
  for row in sh.iter('{%s}row'%ns['m']):
    cells=[]
    for c in row.findall('m:c',ns):
      v=c.find('m:v',ns); t=c.get('t')
      if t=='s' and v is not None: val=ss[int(v.text)]
      elif t=='inlineStr': val=''.join(x.text or '' for x in c.iter('{%s}t'%ns['m']))
      else: val=v.text if v is not None else ''
      if val!='': cells.append(f"{c.get('r')}: {val}")
    if cells: print('ROW',row.get('r')); [print('   ',x) for x in cells]
