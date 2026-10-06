#!/usr/bin/env python3
"""รันไฟล์ SQL กับ Supabase ผ่าน Management API — ทั้งไฟล์อยู่ใน transaction เดียว

    python3 run_sql.py supabase-schema.sql

token อยู่ใน macOS keychain ชื่อ service `supabase-mgmt-impong`
"""

import json
import subprocess
import sys
import urllib.error
import urllib.request

PROJECT_REF = "orumtzbcpqlfrqfuplbv"


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2

    token = subprocess.check_output(
        ["security", "find-generic-password", "-s", "supabase-mgmt-impong", "-w"], text=True
    ).strip()

    with open(sys.argv[1]) as f:
        sql = f.read()

    request = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query",
        data=json.dumps({"query": sql}).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request) as response:
            print("OK", response.status, response.read().decode()[:1000])
            return 0
    except urllib.error.HTTPError as error:
        print("ERROR", error.code, error.read().decode()[:2000])
        return 1


if __name__ == "__main__":
    sys.exit(main())
