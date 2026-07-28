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
  if(url.origin===window.location.origin){
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(url.href);
  }
},true);
</script>
'@

$assetVersion = "20260727-cms-live"

function Export-Route([string]$route, [string]$destination) {
  $uri = "$BaseUrl$route"
  $html = (Invoke-WebRequest -UseBasicParsing -Uri $uri).Content
  $html = $html.Replace($BaseUrl, "https://berel.inedito.digital")
  $html = $html.Replace('.css"', ".css?v=$assetVersion`"")
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
  Write-Output "Exportación terminada: $outputPath"
  exit 0
}

Export-Route "/admin" (Join-Path $outputPath "admin-app.html")

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
  "/assets/admin-restored-20260724-v2.css"
)
[System.IO.File]::WriteAllText(
  $adminHtmlPath,
  $adminHtml,
  [System.Text.UTF8Encoding]::new($false)
)
Copy-Item `
  -LiteralPath $adminCssSource.FullName `
  -Destination (Join-Path $outputPath "assets\admin-restored-20260724-v2.css") `
  -Force

Write-Output "Exportación terminada: $outputPath"
