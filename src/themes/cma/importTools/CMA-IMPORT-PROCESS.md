# Adding a collection's recordings to the CMA library

How the Μιχάλης Ττερλικκάς recordings (CD1–CD7) were added on 21 November 2026. Repeat these steps for new collections.

Tools are in `/home/dspace/import/tools/`:

| File | What it does |
|---|---|
| `build_saf.py` | Reads one sheet of the cataloguing workbook and builds one DSpace import folder per recording (metadata + WAV) |
| `overrides-tterlikkas-example.json` | The per-recording decisions used for Ττερλικκάς (titles, curated topics, links). Copy it as a starting point |
| `dump_sheet.py` | Prints every cell of a sheet, to read what is there |
| `storage_check.py` | Shows free space on each storage disk, and says whether an import folder fits or the storage must be switched first (section 8) |

Both scripts use only the Python standard library. Run them with `python3 -I`.

---

## 1. What the sheet must contain

One row per track. Rows for the same recording share the same value in column A (`CD1`, `CD2`, ...). Item-level details come from the **first row** of each recording.

| Column | Sheet header | Used for |
|---|---|---|
| A | (recording id) | Groups tracks into one item |
| B | Year | `dc.date.issued` (year only, e.g. `1972`) |
| D | Title | Track title in the tracklist (not the item title) |
| E | Time in file | Track timestamp in the tracklist |
| F | Filename | Name of the WAV, without `.wav` |
| H | Abstract | `dc.description.abstract` |
| I | Description | `dc.description` |
| J | Type | `dc.type`, one value per comma-separated entry (`music.recording`, `interview.recording`) |
| K | Person(s) | `dc.contributor.author`, shown as "Πρόσωπα" |
| L | Keywords | Single-word entries become `dc.subject`; multi-word entries (phrases, lyrics, titles) become hidden search keywords `local.keyword.hidden` |
| M | Location | `dc.coverage.spatial`, shown as clickable "Τοποθεσία" |
| N | Map coordinates | `dcterms.spatial`, the map pin |
| O | Collection | Tells you which DSpace collection to import into |
| P | Συσχετισμός με άλλα αρχεία | Reviewed by hand: becomes `dc.relation` or `dc.source` |
| Q | Άλλα σχόλια | `dc.description.provenance` (admin-only, hidden from the public page) |

Watch out for:
- The **workbook has more than one sheet** for the same recordings. Nicoletta's sheet had CD1–CD5 and CD7; CD6 was only in the "Ήχος" sheet. Check all sheets before deciding something is missing.
- **DAT1 was split into two recordings, DAT1A and DAT1B** (files `DAT 1A` and `DAT 1B`). There is no single "DAT1" item. Their continuation rows have column A empty, so tracks are grouped by the "Filename in Ήχος" column, and those values still read `DAT1.x` for both halves (DAT1.1–8 = DAT1A, DAT1.9–23 = DAT1B).
- **Coordinates** in the sheet are `lat, lon` (Google Maps order). DSpace needs `point(lon lat)`. The script swaps them.
- **Names** are spelled inconsistently between columns (e.g. Σορόκκος / Σορόκκου). Pick one and set it with `"people"` in the overrides file.

## 2. Fields on each item

| Field | Shown on the page as | Source |
|---|---|---|
| `dc.title` | Title | **Written by us** (the sheet's Title column is the first track, not the recording) |
| `dc.date.issued` | Date | Year (B) |
| `dc.contributor.author` | Πρόσωπα | Person(s) (K) |
| `dc.description.abstract` | Abstract | H |
| `dc.description` | Description | I |
| `dc.description.tableofcontents` | **Περιεχόμενα** (tracklist) | One line per track: `00:02:21 — Track title` (E — D) |
| `dc.type` | Search filter "type" | J |
| `dc.coverage.spatial` | **Τοποθεσία**, clickable, browsable under "Ανά Τοποθεσία" | M |
| `dcterms.spatial` | Map | N, as `point(lon lat)` |
| `dc.subject` | Keywords, clickable | Curated topics + single-word keywords from L |
| `local.keyword.hidden` | **Never shown** (admins only), but found by search | Multi-word entries from L, `"hidden_keywords"`, plain spellings of Cypriot keywords. Written to `metadata_local.xml` |
| `dc.relation` | Not shown | Links to other recordings or photos (from P) |
| `dc.source` | Not shown | Origin of the recording, e.g. "Μεταγραφή από κασέτα" (from P) |
| `dc.description.provenance` | Hidden (admins only) | Q, prefixed `Σχόλιο καταλογογράφησης:` |
| File | Media player | The WAV, in the ORIGINAL bundle |

## 3. Keywords

1. Take the **single-word** entries from the Keywords column (L) of every track row of the recording, skip duplicates, and capitalise the first letter. Multi-word entries (song lyrics, titles, phrases) are not shown as keywords; they go to the hidden search keywords instead (see below).
2. Remove fragments that are not real keywords (verbs, inflected duplicates like `Κοντέας` next to `Κοντέα`) using `"drop_keywords"`.
3. Add the **curated topics** that apply, spelled exactly as on https://library.cyprusmusicarchive.org/curated-subjects (list in `src/themes/cma/app/cma-curated-subjects-page/cma-curated-subjects.component.ts`):

| Curated topic | Add when the recording has... |
|---|---|
| Τραγούδια | Songs |
| Φωνές | A named traditional melody (Ακαθκιώτισσα, Αυκορίτισσα, Παφίτισσα, Τηλλυρκώτισσα...) |
| Τσ̆ιαττιστά | Τσιαττιστά, τσιάττισμα, improvised verse dialogue |
| Ποιητάρικα/αφηγηματικά | Poems, recitations, narrative songs |
| Πιθκιαύλιν | Pithkiavlin playing |
| Οργανικά | Instrumental pieces |
| Χοροί | Dances (καλαματιανός, τσιφτετέλλι...) |
| Γάμος | Wedding songs |
| Βιολί, Λαούτο, Ταμπουτσ̆ιά, Ζουρνάς-νταούλι | That instrument is played |

**Cypriot spellings (breve).** `Τσ̆ιαττιστά` and `Ταμπουτσ̆ιά` are stored with a combining breve on σ (σ + U+0306). You can type them in the plain spelling (`Τσιαττιστά`, `Ταμπουτσιά`) anywhere: column L, `"curated"` or `"extra_keywords"`. `build_saf.py` converts them to the breve form for `dc.subject` and also adds the plain form as a hidden search keyword (`local.keyword.hidden`), so searches without the breve still find the item. To add another word like this, add it to `CYPRIOT_SPELLINGS` at the top of `build_saf.py`, and change the curated page to match if it's a curated topic.

**Hidden search keywords (`local.keyword.hidden`).** Words or phrases that should find the item in search but never appear on the site. Visitors can't see them anywhere (item page, full record, search results, OAI); admins see them when logged in. `build_saf.py` fills the field with:
- every multi-word entry of column L, as typed (one value per comma-separated entry; `"drop_keywords"` removes them too),
- anything listed in `"hidden_keywords"` in the overrides file,
- the plain spelling of Cypriot keywords (above).

The script's summary shows how many each recording got. After import you can add or edit them on the item's edit page ("Hidden search keywords"). Never add this field to search filters or browse indexes: those list values publicly.

## 4. Steps

### a. Get the files onto the server
From **PowerShell on your PC** (not the server terminal). Windows `scp` does not expand `*`, so copy the folder:

```
scp -r ./<audio folder> dspace@92.205.178.243:/home/dspace/import/
```

Then check every WAV arrived complete (the header size must equal the file size):

```
cd /home/dspace/import/<audio folder> && python3 -I -c "
import sys,struct,os
for f in sys.argv[1:]:
  b=open(f,'rb').read(12); print(f, 'OK' if b[:4]==b'RIFF' and struct.unpack('<I',b[4:8])[0]+8==os.path.getsize(f) else 'INCOMPLETE')
" *.wav
```

Upload the workbook through the Claude app, or `scp` it the same way.

### b. Write the overrides file
Copy `overrides-tterlikkas-example.json`, then for each recording set `title`, `curated`, and any `people`, `drop_keywords`, `relation`, `source`. A recording with no entry is skipped.

### c. Build the import folders and review
```
python3 -I /home/dspace/import/tools/build_saf.py <workbook.xlsx> "<sheet name>" <overrides.json> /home/dspace/import/<audio folder> /home/dspace/import/saf-<collection>
```
It prints a summary for each recording (title, year, people, location, track count, keywords, and the P column for you to handle). Have the result reviewed before importing.

### d. Find the collection id
```
curl -s "http://localhost:8080/server/api/core/collections?size=100" | python3 -c "import json,sys;[print(c['uuid'],c['name']) for c in json.load(sys.stdin)['_embedded']['collections']]"
```

### e. Test, then import
**First check the space** (section 8). Do not continue if it says `NO`:
```
python3 -I /home/dspace/import/tools/storage_check.py /home/dspace/import/saf-<collection>
```

The import runs inside the `dspace` container, so copy the folders in first. `docker cp` makes a full temporary copy of the batch on the main disk, removed again by the last command below. `-e` is the administrator account the changes are recorded under (`<admin email>` was used).

```
docker cp /home/dspace/import/saf-<collection> dspace:/tmp/saf
docker exec dspace /dspace/bin/dspace import -a -v -c <collection uuid> -s /tmp/saf -m /tmp/test.map -e <admin email>
docker exec dspace /dspace/bin/dspace import -a    -c <collection uuid> -s /tmp/saf -m /tmp/saf.map  -e <admin email>
docker exec dspace cat /tmp/saf.map > /home/dspace/import/saf-<collection>-<date>.map
docker exec dspace rm -rf /tmp/saf /tmp/test.map /tmp/saf.map
```
`-v` is a test run: it reads everything and changes nothing. The map file lists the handle each recording got, needed for relation links and for undoing an import (`dspace import -d -m <mapfile> -e <admin email>`).

### f. Rebuild the search index
```
docker exec dspace /dspace/bin/dspace index-discovery -b
```
Without this, new items, keywords and locations do not appear in search or browse.

### g. Check and clean up
- Open each new item: tracklist (Περιεχόμενα), clickable Τοποθεσία, keywords, map, player.
- Compare stored files with the uploads before deleting the uploads:
  ```
  docker exec dspacedb psql -U dspace -d dspace -Atc "select checksum from bitstream where size_bytes = <bytes>;"
  md5sum "<file>.wav"
  ```
- Delete the uploaded WAVs and import folders once they match.

## 5. Changing an existing item

Use a CSV with the item's uuid in `id` and one column per field to replace. Separate several values with `||`. The listed fields are **replaced**, others are untouched.

```
id,dc.subject
74dbd24a-8457-48cf-89e1-7cae09a48c9b,"Φωνές||Τραγούδια||Λάνεια"
```

```
docker cp change.csv dspace:/tmp/change.csv
echo n | docker exec -i dspace /dspace/bin/dspace metadata-import -f /tmp/change.csv -e <admin email>   # preview only
echo y | docker exec -i dspace /dspace/bin/dspace metadata-import -f /tmp/change.csv -e <admin email>   # apply
```
Save the item first: `mkdir -p /home/dspace/backups/items && curl -s http://localhost:8080/server/api/core/items/<uuid> > /home/dspace/backups/items/<name>.json`.

## 6. Site changes made for this (already done, no need to repeat)

- Item page shows the tracklist: `src/themes/cma/app/item-page/simple/item-types/untyped-item/untyped-item.component.html`, label `item.page.tracks` (Περιεχόμενα).
- Τοποθεσία is clickable: browse index `webui.browse.index.5 = location:metadata:dc.coverage.spatial:text` in `/home/dspace/dspace/dspace/config/local.cfg` (copy in the theme's `backendConfig/local.cfg`), labels `browse.metadata.location*` and `menu.section.browse_global_by_location`.
- Only Greek is offered: `active: false` for `en` in `/home/dspace/dspace-angular/config/config.yml`.

Frontend changes need a rebuild. The site gives errors while `npm run build:prod` runs, so warn people first, then `sudo -n systemctl restart dspace-frontend`. Theme labels must be merged before building: `node scripts/run-merge-i18n.js --source-dir src/themes/cma/assets/i18n`.

## 7. Ττερλικκάς import record

| Recording | Handle | Sheet |
|---|---|---|
| CD1 | 123456789/5 (existing, updated) | Nicoletta's sheet |
| CD2 | 123456789/8 | Nicoletta's sheet |
| CD3 | 123456789/9 | Nicoletta's sheet |
| CD4 | 123456789/10 | Nicoletta's sheet |
| CD5 | 123456789/11 | Nicoletta's sheet |
| CD6 | 123456789/13 | Ήχος |
| CD7 | 123456789/12 | Nicoletta's sheet |

Map file: `/home/dspace/import/saf-tterlikkas-20261121.map`.

## 8. Storage: two disks, and when to switch

Set up on 23 November 2026. DSpace stores files in numbered **stores**. New files (website uploads and imports) go to the one store set in `/home/dspace/dspace/dspace/config/local.cfg`:

```
assetstore.index.primary = 3
```

| Store | Disk | Free when set up | Path on the server | Path inside the `dspace` container |
|---|---|---|---|---|
| 0 | Main disk (400 GB, also holds the system, database, Solr) | 385 GB | Docker volume `dspace_assetstore` | `/dspace/assetstore` |
| 3 | Extra disk `/dev/sdb` (250 GB, bought 23 Nov 2026) | 250 GB | `/mnt/dspace-data/assetstore` | `/dspace/assetstore2` |

Files already stored never move. DSpace remembers which store each file is in and reads it from there, so you can switch stores at any time.

**Check the space at any time:**
```
python3 -I /home/dspace/import/tools/storage_check.py
```
It says which store new files go to, how much room is left there, and `SWITCH NEEDED` when the limit is reached. With an import folder as argument it checks that batch (section 4e).

### Space needed for the planned collections (November 2026)
- First collection: 459.72 GB, of which 1.66 GB (7 WAVs) were already uploaded. Second collection: 183.25 GB. **About 641 GB still to add.**
- Free on both disks together: **about 635 GB**. This is **not enough**: buy at least another 250 GB before the second collection.
- Upload into store 3 (the extra disk) until it is full, then switch to store 0. Keep at least 40 GB free on the main disk; `storage_check.py` enforces this.
- An import needs extra room on the main disk while it runs: the uploaded WAVs in `/home/dspace/import/` plus the `docker cp` copy. Import in batches and delete each batch's WAVs and folders once checked (section 4g).

### Switching new files back to the main disk (store 0)
Do this when `storage_check.py` says `SWITCH NEEDED` for store 3, or when a batch does not fit.

1. In `/home/dspace/dspace/dspace/config/local.cfg`, change
   `assetstore.index.primary = 3` to `assetstore.index.primary = 0`
2. Restart the backend so **website uploads** use the new store (the site is down for about a minute):
   ```
   docker restart dspace
   ```
   **Imports** (`dspace import`) read `local.cfg` each time they start, so they use the new store even without the restart.
3. Check it:
   ```
   docker exec dspace /dspace/bin/dspace dsprop -p assetstore.index.primary
   python3 -I /home/dspace/import/tools/storage_check.py
   ```
4. After the next upload or import, confirm where the new files went (`3` = extra disk, `0` = main disk):
   ```
   docker exec dspacedb psql -U dspace -d dspace -Atc "select store_number, count(*), pg_size_pretty(sum(size_bytes)) from bitstream group by 1"
   ```

### Adding another disk (for example a second 250 GB purchase)
Store numbers 1 and 2 are taken by DSpace's cloud stores, and 3 is the first extra disk, so the next disk is **store 4**. Copy what was done for store 3:

1. Format and mount it (needs sudo), with its own label and folder, for example `dspace-data2` and `/mnt/dspace-data2`. Check the new disk's name with `lsblk` first; `mkfs` erases whatever disk you give it.
   ```
   sudo mkfs.ext4 -L dspace-data2 /dev/sdc
   sudo mkdir -p /mnt/dspace-data2
   echo 'LABEL=dspace-data2 /mnt/dspace-data2 ext4 defaults,nofail 0 2' | sudo tee -a /etc/fstab
   sudo mount -a && sudo mkdir -p /mnt/dspace-data2/assetstore && df -h /mnt/dspace-data2
   ```
2. `/home/dspace/dspace/dspace/config/spring/api/bitstore.xml`: add `<entry key="4" value-ref="localStore3"/>` to the `stores` map, and a `localStore3` bean with `baseDir` `${assetstore.dir.3}` (copy `localStore2`).
3. `local.cfg`: add `assetstore.dir.3 = ${dspace.dir}/assetstore3`.
4. `/home/dspace/dspace/docker-compose.yml`: copy the `/mnt/dspace-data/assetstore` bind mount (keep `create_host_path: false`) with source `/mnt/dspace-data2/assetstore` and target `/dspace/assetstore3`.
5. Add the store to `STORES` in `storage_check.py`.
6. Only after `df -h /mnt/dspace-data2` shows the disk: set `assetstore.index.primary = 4` and **recreate** the container (a restart does not add a new mount):
   ```
   cd /home/dspace/dspace && docker compose up -d --no-build dspace
   ```

### Rules
- **Never make a store primary while its disk is not mounted.** Files would be written inside the container and lost the next time it is recreated. `create_host_path: false` in `docker-compose.yml` stops the container from starting without the disk, and `storage_check.py` warns when a disk is missing.
- After a reboot, check `df -h /mnt/dspace-data` before uploading.
- There are **no backups** of either disk. Keep the original recordings until backups exist.
- Removed or replaced files stay on disk until a cleanup. Run it once in a while (it only removes files no item uses): `docker exec dspace /dspace/bin/dspace cleanup -d -v`.
