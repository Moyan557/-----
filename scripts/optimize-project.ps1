param(
  [Parameter(Mandatory = $true)]
  [string]$Source,

  [Parameter(Mandatory = $true)]
  [string]$Slug,

  [int]$FullMaxEdge = 2400,
  [int]$CoverMaxEdge = 1200,
  [int]$ThumbMaxEdge = 420,
  [long]$FullQuality = 84,
  [long]$CoverQuality = 78,
  [long]$ThumbQuality = 72
)

Add-Type -AssemblyName System.Drawing

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$sourcePath = Resolve-Path $Source
$outRoot = Join-Path $projectRoot "public\media\portfolio\$Slug"
$originalRoot = Join-Path $projectRoot "source-media\originals\$Slug"

New-Item -ItemType Directory -Force -Path (Join-Path $outRoot 'full') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $outRoot 'thumb') | Out-Null
New-Item -ItemType Directory -Force -Path $originalRoot | Out-Null

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$qualityParam = [System.Drawing.Imaging.Encoder]::Quality

function Save-OptimizedJpeg {
  param(
    [Parameter(Mandatory = $true)][string]$InputFile,
    [Parameter(Mandatory = $true)][string]$OutputFile,
    [Parameter(Mandatory = $true)][int]$MaxEdge,
    [Parameter(Mandatory = $true)][long]$Quality
  )

  $stream = [System.IO.File]::Open($InputFile, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
  try {
    $sourceImage = [System.Drawing.Image]::FromStream($stream, $true, $false)
    try {
      $ratio = [Math]::Min(1.0, $MaxEdge / [double]([Math]::Max($sourceImage.Width, $sourceImage.Height)))
      $width = [Math]::Max(1, [int][Math]::Round($sourceImage.Width * $ratio))
      $height = [Math]::Max(1, [int][Math]::Round($sourceImage.Height * $ratio))
      $bitmap = New-Object System.Drawing.Bitmap $width, $height, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
      try {
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        try {
          $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
          $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
          $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
          $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
          $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
          $graphics.Clear([System.Drawing.Color]::Black)
          $graphics.DrawImage($sourceImage, 0, 0, $width, $height)
        } finally {
          $graphics.Dispose()
        }

        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters 1
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter $qualityParam, $Quality
        try {
          $bitmap.Save($OutputFile, $jpegCodec, $encoderParams)
        } finally {
          $encoderParams.Dispose()
        }
      } finally {
        $bitmap.Dispose()
      }
    } finally {
      $sourceImage.Dispose()
    }
  } finally {
    $stream.Dispose()
  }
}

$images = Get-ChildItem -LiteralPath $sourcePath -File |
  Where-Object { $_.Extension -match '^\.(jpg|jpeg|png)$' } |
  Sort-Object Name

if ($images.Count -eq 0) {
  throw "No jpg/jpeg/png files found in $sourcePath"
}

for ($index = 0; $index -lt $images.Count; $index += 1) {
  $image = $images[$index]
  $imageName = 'image-{0:D2}.jpg' -f ($index + 1)

  Copy-Item -LiteralPath $image.FullName -Destination (Join-Path $originalRoot $image.Name) -Force
  Save-OptimizedJpeg -InputFile $image.FullName -OutputFile (Join-Path $outRoot "full\$imageName") -MaxEdge $FullMaxEdge -Quality $FullQuality
  Save-OptimizedJpeg -InputFile $image.FullName -OutputFile (Join-Path $outRoot "thumb\$imageName") -MaxEdge $ThumbMaxEdge -Quality $ThumbQuality

  if ($index -eq 0) {
    Save-OptimizedJpeg -InputFile $image.FullName -OutputFile (Join-Path $outRoot 'cover.jpg') -MaxEdge $CoverMaxEdge -Quality $CoverQuality
  }
}

Write-Host "Optimized $($images.Count) images for slug '$Slug'."
Write-Host "Add this to src/data/portfolio.js:"
Write-Host "image: '/media/portfolio/$Slug/cover.jpg',"
Write-Host "gallery: createGallery('$Slug', $($images.Count)),"
