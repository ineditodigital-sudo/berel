# ============================================================
#  Subida del sitio estatico Berel por FTP (modo pasivo)
#  Autodetecta la carpeta base y sube todo el sitio.
# ============================================================
$ErrorActionPreference = "Continue"

$ftpHost = $env:BEREL_FTP_HOST
$ftpUser = $env:BEREL_FTP_USER
$ftpPass = $env:BEREL_FTP_PASSWORD
$zipPath = if ($env:BEREL_DEPLOY_ZIP) {
    $env:BEREL_DEPLOY_ZIP
} else {
    Join-Path $PSScriptRoot "berel-sitio-estatico.zip"
}
$localDir = Join-Path $env:TEMP "berel_site_upload"

if (-not $ftpHost -or -not $ftpUser -or -not $ftpPass) {
    throw "Configura BEREL_FTP_HOST, BEREL_FTP_USER y BEREL_FTP_PASSWORD antes de publicar."
}

Write-Host "== Berel FTP uploader (auto) =="
$cred = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)

# ---- Extraer zip ----
if (Test-Path $localDir) { Remove-Item $localDir -Recurse -Force }
New-Item -ItemType Directory -Path $localDir | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($zipPath, $localDir)
# Normalizar a ruta canonica (evita desalineacion nombre corto 8.3 vs largo)
$localDir = (Get-Item -LiteralPath $localDir).FullName
Write-Host "Zip extraido en: $localDir"

function Ftp-List($dir) {
    # dir relativo al home (sin barra inicial), "" = home
    $uri = "ftp://$ftpHost/$dir"
    try {
        $req = [System.Net.FtpWebRequest]::Create($uri)
        $req.Credentials = $cred
        $req.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
        $req.UsePassive = $true; $req.KeepAlive = $false
        $resp = $req.GetResponse()
        $sr = New-Object System.IO.StreamReader($resp.GetResponseStream())
        $out = $sr.ReadToEnd(); $sr.Close(); $resp.Close()
        return ($out -split "`r?`n" | Where-Object { $_ -ne "" })
    } catch {
        Write-Host "LIST fallo en '/$dir' -> $($_.Exception.Message)"
        return $null
    }
}

function Ftp-MkDir($dir) {
    $uri = "ftp://$ftpHost/$dir"
    try {
        $req = [System.Net.FtpWebRequest]::Create($uri)
        $req.Credentials = $cred
        $req.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $req.UsePassive = $true; $req.KeepAlive = $false
        $resp = $req.GetResponse(); $resp.Close()
        Write-Host "DIR + /$dir"
    } catch { }  # 550 = ya existe
}

function Ftp-Up($localFile, $remoteRel) {
    $uri = "ftp://$ftpHost/$remoteRel"
    $req = [System.Net.FtpWebRequest]::Create($uri)
    $req.Credentials = $cred
    $req.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
    $req.UsePassive = $true; $req.UseBinary = $true; $req.KeepAlive = $false
    $bytes = [System.IO.File]::ReadAllBytes($localFile)
    $req.ContentLength = $bytes.Length
    $s = $req.GetRequestStream(); $s.Write($bytes,0,$bytes.Length); $s.Close()
    $resp = $req.GetResponse(); $resp.Close()
    Write-Host ("UP  /{0}  ({1:N0} b)" -f $remoteRel, $bytes.Length)
}

# ---- Diagnostico ----
Write-Host "`n--- Listado HOME (/) ---"
$home0 = Ftp-List ""
$home0 | ForEach-Object { Write-Host "   $_" }

Write-Host "`n--- Listado /public_html ---"
$ph = Ftp-List "public_html"
$ph | ForEach-Object { Write-Host "   $_" }

# ---- Detectar carpeta base ----
$base = $null
if ($home0 -and ($home0 -contains "berel.inedito.digital")) {
    $base = "berel.inedito.digital"
} elseif ($ph -ne $null) {
    if ($ph -contains "berel.inedito.digital") { $base = "public_html/berel.inedito.digital" }
    else { $base = "public_html/berel.inedito.digital"; Ftp-MkDir "public_html/berel.inedito.digital" }
} elseif ($home0 -and (($home0 -contains "index.html") -or ($home0 -contains "assets"))) {
    $base = ""   # el home ya es el docroot del dominio
} else {
    # sin public_html visible: el home probablemente ES la carpeta del dominio
    $base = ""
}
Write-Host "`n>>> CARPETA BASE ELEGIDA: '/$base'"

# ---- Crear subcarpetas (padre antes que hijo) ----
$dirs = Get-ChildItem -Path $localDir -Recurse -Directory | Sort-Object { $_.FullName.Length }
foreach ($d in $dirs) {
    $rel = $d.FullName.Substring($localDir.Length).TrimStart('\').Replace('\','/')
    if ($base -ne "") { Ftp-MkDir "$base/$rel" } else { Ftp-MkDir "$rel" }
}

# ---- Subir archivos ----
$files = Get-ChildItem -Path $localDir -Recurse -File -Force
$ok = 0; $fail = 0
foreach ($f in $files) {
    $rel = $f.FullName.Substring($localDir.Length).TrimStart('\').Replace('\','/')
    $remoteRel = if ($base -ne "") { "$base/$rel" } else { $rel }
    try { Ftp-Up $f.FullName $remoteRel; $ok++ }
    catch { $fail++; Write-Host ("ERR /{0} -> {1}" -f $remoteRel, $_.Exception.Message) }
}
Write-Host "`n== RESULTADO: $ok subidos, $fail con error (de $($files.Count)) =="
Write-Host "Verifica: https://berel.inedito.digital/"
