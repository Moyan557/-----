<#
.SYNOPSIS
  一键添加新项目：优化图片 + 自动更新 projects.json

.DESCRIPTION
  1. 调用 optimize-project.ps1 生成 full/thumb/cover 图片
  2. 自动读取 public/projects.json，添加或更新该项目条目
  3. 无需手动改 src/data/portfolio.js

.PARAMETER Source
  原始图片文件夹路径（包含 jpg/jpeg/png）

.PARAMETER Slug
  项目英文标识，如 jiangnan、donghaifu（用于文件夹和 URL）

.PARAMETER Name
  项目中文名称，如 "江南里独栋别墅"

.PARAMETER Meta
  项目副标题，如 "678㎡ / 负二至三层全案"

.PARAMETER Desc
  项目简介文字

.PARAMETER Tone
  配色主题，可选 project-a / project-b / project-c / project-d，默认 project-a

.EXAMPLE
  pnpm run add:project -- -Source "C:\Users\17364\Desktop\新项目" -Slug "new-villa" -Name "新别墅项目" -Meta "500㎡ / 独栋" -Desc "项目简介"
#>

param(
  [Parameter(Mandatory = $true)]
  [string]$Source,

  [Parameter(Mandatory = $true)]
  [string]$Slug,

  [Parameter(Mandatory = $true)]
  [string]$Name,

  [string]$Meta = "",

  [string]$Desc = "",

  [ValidateSet("project-a", "project-b", "project-c", "project-d")]
  [string]$Tone = "project-a"
)

$ErrorActionPreference = "Stop"
$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$jsonPath = Join-Path $projectRoot "public\projects.json"
$optimizeScript = Join-Path $PSScriptRoot "optimize-project.ps1"

Write-Host ""
Write-Host "=== 步骤 1/2: 优化图片 ===" -ForegroundColor Cyan
& $optimizeScript -Source $Source -Slug $Slug

# 统计实际生成的图片数量
$fullDir = Join-Path $projectRoot "public\media\portfolio\$Slug\full"
$count = (Get-ChildItem -LiteralPath $fullDir -File -Filter "*.jpg").Count
Write-Host "  生成了 $count 张图集图片"

Write-Host ""
Write-Host "=== 步骤 2/2: 更新 projects.json ===" -ForegroundColor Cyan

if (-not (Test-Path $jsonPath)) {
  throw "找不到 $jsonPath"
}

$json = Get-Content -LiteralPath $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
$list = @($json)

$existing = $list | Where-Object { $_.slug -eq $Slug }
if ($existing) {
  Write-Host "  项目 '$Slug' 已存在，更新信息..." -ForegroundColor Yellow
  $existing.name = $Name
  $existing.meta = $Meta
  $existing.desc = $Desc
  $existing.tone = $Tone
  $existing.count = $count
} else {
  Write-Host "  添加新项目 '$Slug'..." -ForegroundColor Green
  $newItem = [PSCustomObject]@{
    slug  = $Slug
    name  = $Name
    meta  = $Meta
    desc  = $Desc
    tone  = $Tone
    count = $count
  }
  $list += $newItem
}

$list | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $jsonPath -Encoding UTF8
Write-Host "  projects.json 已更新（共 $($list.Count) 个项目）" -ForegroundColor Green

Write-Host ""
Write-Host "=== 完成 ===" -ForegroundColor Cyan
Write-Host "项目 '$Name' 已添加。"
Write-Host "运行以下命令重新构建并预览："
Write-Host "  pnpm run build"
Write-Host "  pnpm run preview"
Write-Host ""
Write-Host "如需修改项目文字，直接编辑 public/projects.json 即可，无需改代码。"
Write-Host ""
