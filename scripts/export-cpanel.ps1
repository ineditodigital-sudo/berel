param(
  [string]$BaseUrl = "http://localhost:3001",
  [string]$OutputDirectory = "E:\BEREL\SITIO WEB BEREL\work\cpanel-react-restore",
  # El CMS de /admin exige autenticación en un build de producción, así que no
  # se puede exportar su cascarón desde aquí. En el hosting esa pantalla la
  # sirve admin.php con su propia sesión, y la subida por FTP no borra nada,
  # de modo que el admin-app.html ya publicado sigue funcionando.
  [switch]$SkipAdmin
)

$ErrorActionPreference = "Stop"

$outputPath = [System.IO.Path]::GetFullPath($OutputDirectory)
$workspacePath = [System.IO.Path]::GetFullPath("E:\BEREL\SITIO WEB BEREL")
if (-not $outputPath.StartsWith($workspacePath, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "El directorio de salida debe permanecer dentro del workspace."
}

if (Test-Path -LiteralPath $outputPath) {
  Remove-Item -LiteralPath $outputPath -Recurse -Force
}
New-Item -ItemType Directory -Path $outputPath | Out-Null

Copy-Item -Path "E:\BEREL\SITIO WEB BEREL\dist\client\*" -Destination $outputPath -Recurse -Force

# El catálogo y las fichas resuelven categoría y slug desde la URL en el
# navegador, y el .htaccess sirve estos dos documentos para cualquier
# /tienda/... y /producto/.... Por eso no hay que exportar una ruta por
# categoría ni por producto: se agregan solos al publicarlos en el CMS.
$routes = @(
  "/",
  "/tienda/todos",
  "/producto/ficha",
  "/checkout",
  "/cuenta",
  "/nosotros",
  # Sin parámetros: el número de pedido lo lee la página desde la URL en el
  # navegador. Exportarla con un pedido de ejemplo dejaría ese valor incrustado.
  "/pedido/confirmado",
  "/privacidad",
  "/terminos"
)

$navigationGuard = @'
<script>
document.addEventListener("click",function(event){
  var link=event.target.closest&&event.target.closest("a[href]");
  if(!link||link.target==="_blank"||link.hasAttribute("download"))return;
  var url=new URL(link.href,window.location.href);
  if(url.origin!==window.location.origin)return;
  // Un ancla de la misma página (#asesoria) debe desplazarse, no recargar.
  // Forzarla por location.assign volvía a cargar el sitio entero en cada
  // clic y dejaba el scroll trabado.
  if(url.hash&&url.pathname===window.location.pathname&&url.search===window.location.search){
    return;
  }
  event.preventDefault();
  event.stopImmediatePropagation();
  window.location.assign(url.href);
},true);
</script>
'@

$assetVersion = "20260727-cms-live"

# El Apache del hosting no tiene mod_deflate (probado: da 500), así que nada se
# comprimía y se iban 606 KiB de más sólo en la portada. Se deja junto a cada
# .css/.js/.html un gemelo .gz y el .htaccess lo sirve cuando el navegador
# acepta gzip. El original se conserva para quien no lo acepte.
function Compress-TextAssets([string]$root) {
  $total = 0
  $comprimidos = 0
  # La lista se materializa ANTES de escribir nada. Con la enumeración perezosa
  # de Get-ChildItem, los .gz recién creados volvían a entrar en el recorrido y
  # salían .gz.gz.gz sin fin. Y se filtra por extensión a mano porque -Include
  # sobre una ruta sin comodín no filtra: colaba archivos como .assetsignore.
  $archivos = @(
    Get-ChildItem -LiteralPath $root -Recurse -File |
      Where-Object { $_.Extension -in '.css', '.js', '.html' }
  )
  foreach ($archivo in $archivos) {
      $origen = $archivo.FullName
      $destino = "$origen.gz"
      $entrada = [System.IO.File]::OpenRead($origen)
      $salida = [System.IO.File]::Create($destino)
      # Optimal y no SmallestSize: este script corre en Windows PowerShell 5.1,
      # cuyo .NET Framework no conoce ese valor.
      $gzip = New-Object System.IO.Compression.GZipStream -ArgumentList @(
        $salida, [System.IO.Compression.CompressionLevel]::Optimal)
      $entrada.CopyTo($gzip)
      $gzip.Dispose(); $salida.Dispose(); $entrada.Dispose()
      $total += $archivo.Length
      $comprimidos += (Get-Item -LiteralPath $destino).Length
  }
  if ($total -gt 0) {
    $ahorro = [math]::Round(100 - ($comprimidos / $total * 100))
    Write-Output ("Comprimidos: {0:N0} KB -> {1:N0} KB ({2}% menos)" -f ($total / 1KB), ($comprimidos / 1KB), $ahorro)
  }
}

function Export-Route([string]$route, [string]$destination) {
  $uri = "$BaseUrl$route"
  $html = (Invoke-WebRequest -UseBasicParsing -Uri $uri).Content
  $html = $html.Replace($BaseUrl, "https://berel.inedito.digital")
  # Nada de ?v= sobre el CSS: el nombre ya trae hash de contenido, así que la
  # invalidación de caché está resuelta. Agregar la consulta sólo al <link> del
  # HTML hacía que el runtime pidiera el mismo archivo sin ella, y el navegador
  # descargaba 109 KiB dos veces por tratarlas como URLs distintas.
  $html = $html.Replace("</head>", "$navigationGuard</head>")
  $parent = Split-Path -Parent $destination
  New-Item -ItemType Directory -Force -Path $parent | Out-Null
  [System.IO.File]::WriteAllText($destination, $html, [System.Text.UTF8Encoding]::new($false))
}

foreach ($route in $routes) {
  $pathOnly = $route.Split("?")[0].Trim("/")
  $destination = if ($pathOnly) {
    Join-Path $outputPath "$pathOnly\index.html"
  } else {
    Join-Path $outputPath "index.html"
  }
  Export-Route $route $destination
}

if ($SkipAdmin) {
  Write-Output "Se omitió /admin: se conserva el admin-app.html ya publicado."
  Compress-TextAssets $outputPath
  Write-Output "Exportación terminada: $outputPath"
  exit 0
}

# /admin exige autenticacion en un build de produccion, asi que el cascaron
# del CMS se toma de /admin-shell. En el hosting lo sirve admin.php tras
# validar la sesion, y .htaccess bloquea el archivo en directo.
Export-Route "/admin-shell" (Join-Path $outputPath "admin-app.html")

$adminHtmlPath = Join-Path $outputPath "admin-app.html"
$adminHtml = [System.IO.File]::ReadAllText($adminHtmlPath)
$adminCssSource = Get-ChildItem `
  -LiteralPath "E:\BEREL\SITIO WEB BEREL\dist\client\assets" `
  -Filter "*.css" |
  Where-Object {
    [System.IO.File]::ReadAllText($_.FullName).Contains(".resource-card>footer")
  } |
  Select-Object -First 1
if (-not $adminCssSource) {
  throw "No se encontró el CSS compilado del CMS."
}
$adminHtml = $adminHtml.Replace(
  "/assets/$($adminCssSource.Name)",
  "/assets/admin-restored-$assetVersion.css"
)
[System.IO.File]::WriteAllText(
  $adminHtmlPath,
  $adminHtml,
  [System.Text.UTF8Encoding]::new($false)
)
Copy-Item `
  -LiteralPath $adminCssSource.FullName `
  -Destination (Join-Path $outputPath "assets\admin-restored-$assetVersion.css") `
  -Force

Compress-TextAssets $outputPath

Write-Output "Exportación terminada: $outputPath"
