#!/usr/bin/env python3
"""Check disk space before a CMA import, and say whether DSpace's storage must be switched.

Usage (run with python3 -I, stdlib only):
  python3 -I storage_check.py                      # status only
  python3 -I storage_check.py /home/dspace/import/saf-<collection>   # can this batch be imported?

DSpace keeps files in numbered stores (config/spring/api/bitstore.xml):
  store 0  main disk  (/, Docker volume dspace_assetstore)          -> /dspace/assetstore
  store 3  extra disk (/dev/sdb mounted at /mnt/dspace-data)        -> /dspace/assetstore2
New files go to the store set in local.cfg by  assetstore.index.primary = N .
Existing files always stay where they are. See "Storage" in /home/dspace/CMA-IMPORT-PROCESS.md.

Exit code: 0 = OK to import, 1 = do not import (switch store or add disk first), 2 = usage error.
"""
import os, re, sys

LOCAL_CFG = '/home/dspace/dspace/dspace/config/local.cfg'
STORES = {  # store number -> (name, host mount point, space to keep free on that disk)
    0: ('main disk', '/', 40e9),              # OS, database, Solr, logs and Docker need room here
    3: ('extra disk (sdb)', '/mnt/dspace-data', 5e9),
}
MAIN = '/'


def gb(n):
    return f'{n / 1e9:,.1f} GB'


def free(path):
    s = os.statvfs(path)
    return s.f_bavail * s.f_frsize


def primary_store():
    val = None
    for line in open(LOCAL_CFG, encoding='utf-8'):
        m = re.match(r'\s*assetstore\.index\.primary\s*=\s*(\d+)\s*$', line)
        if m:
            val = int(m.group(1))  # last uncommented value wins, as in DSpace
    return 0 if val is None else val


def batch_size(path):
    seen, total = set(), 0
    for root, _, files in os.walk(path):
        for f in files:
            st = os.stat(os.path.join(root, f))
            if (st.st_dev, st.st_ino) not in seen:  # build_saf.py hard-links WAVs: count each file once
                seen.add((st.st_dev, st.st_ino))
                total += st.st_size
    return total


def main():
    args = sys.argv[1:]
    if len(args) > 1 or (args and not os.path.isdir(args[0])):
        print(__doc__)
        return 2

    primary = primary_store()
    if primary not in STORES:
        print(f'assetstore.index.primary = {primary} is not a store this script knows. Update STORES.')
        return 1
    for n, (name, mnt, _) in STORES.items():
        if mnt != '/' and not os.path.ismount(mnt):
            print(f'!! store {n} ({name}): {mnt} is NOT mounted.')
            if n == primary:
                print('   Do not upload or import anything until it is mounted again.')
                return 1

    print(f'New files go to store {primary}: {STORES[primary][0]}\n')
    for n, (name, mnt, keep) in STORES.items():
        f = free(mnt) if os.path.ismount(mnt) or mnt == '/' else 0
        mark = ' <- new files go here' if n == primary else ''
        print(f'  store {n}  {name:<17} {gb(f):>12} free  (keep {gb(keep)} free){mark}')

    name, mnt, keep = STORES[primary]
    room = free(mnt) - keep
    print()
    if not args:
        if room <= 0:
            print(f'SWITCH NEEDED: {name} has reached its limit. See "Storage" in CMA-IMPORT-PROCESS.md.')
            return 1
        print(f'Room left on {name} before a switch is needed: {gb(room)}')
        return 0

    size = batch_size(args[0])
    print(f'Batch {args[0]}: {gb(size)}')
    ok = True
    if size > room:
        ok = False
        print(f'NO: the batch does not fit on {name} (room {gb(room)}).')
        print('    Switch assetstore.index.primary to a store with room, or split the batch.')
    # `docker cp` puts a full temporary copy of the batch inside the container, on the main disk.
    main_need = size + (size if primary == 0 else 0) + STORES[0][2]
    if free(MAIN) < main_need:
        ok = False
        print(f'NO: the main disk needs {gb(main_need)} free during the import '
              f'(temporary copy{" + stored files" if primary == 0 else ""} + {gb(STORES[0][2])} reserve), '
              f'it has {gb(free(MAIN))}.')
    if ok:
        print(f'OK: fits. After import, room left on {name}: {gb(room - size)}')
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
