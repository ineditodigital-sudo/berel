#!/usr/bin/env python3
"""
Deploy inteligente por FTP para berel.inedito.digital.

Sube SOLO los archivos nuevos o cuyo tamaño cambió respecto al servidor.
Los HTML, .htaccess y _headers se suben siempre (su contenido puede cambiar
sin cambiar de tamaño). No borra archivos del servidor.

Uso:
    python deploy-inteligente.py [CARPETA_DEPLOY]

Si no se indica carpeta, usa ./deploy junto a este script.
"""
import ftplib, os, sys

HOST = os.environ.get("BEREL_FTP_HOST")
USER = os.environ.get("BEREL_FTP_USER")
PW = os.environ.get("BEREL_FTP_PASSWORD")
REMOTE = os.environ.get(
    "BEREL_FTP_REMOTE", "/public_html/berel.inedito.digital"
)
FORCE_EXT = {".html"}
FORCE_NAME = {".htaccess", "_headers"}


def main():
    if not HOST or not USER or not PW:
        sys.exit(
            "Configura BEREL_FTP_HOST, BEREL_FTP_USER y "
            "BEREL_FTP_PASSWORD antes de publicar."
        )
    base = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "deploy")
    if not os.path.isdir(base):
        sys.exit(f"No existe la carpeta de deploy: {base}")

    ftp = ftplib.FTP()
    ftp.connect(HOST, 21, timeout=30)
    ftp.login(USER, PW)
    ftp.set_pasv(True)

    made = set()

    def ensure(path):
        if path in made or path in ("", "/", REMOTE):
            return
        ensure(os.path.dirname(path))
        try:
            ftp.mkd(path)
        except Exception:
            pass
        made.add(path)

    def rsize(rp):
        try:
            return ftp.size(rp)
        except Exception:
            return None

    up = skip = 0
    for root, _dirs, files in os.walk(base):
        for f in sorted(files):
            lp = os.path.join(root, f)
            rel = os.path.relpath(lp, base).replace(os.sep, "/")
            rp = REMOTE + "/" + rel
            lsz = os.path.getsize(lp)
            force = os.path.splitext(f)[1].lower() in FORCE_EXT or f in FORCE_NAME
            if not force and rsize(rp) == lsz:
                skip += 1
                continue
            ensure(os.path.dirname(rp))
            with open(lp, "rb") as fh:
                ftp.storbinary("STOR " + rp, fh)
            up += 1
            print(f"UP  {rel}  ({lsz}b)")
    ftp.quit()
    print(f"\nSubidos: {up}  |  Omitidos (iguales): {skip}")


if __name__ == "__main__":
    main()
