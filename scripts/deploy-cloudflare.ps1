# 一键部署到 Cloudflare Pages
# 用法：pnpm run deploy:cloudflare

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "=== 刘伟峰作品集 - Cloudflare Pages 一键部署 ===" -ForegroundColor Cyan
Write-Host ""

# 1. 构建项目
Write-Host "[1/3] 构建项目..." -ForegroundColor Yellow
Set-Location $projectRoot
npx vite build
if ($LASTEXITCODE -ne 0) {
    Write-Host "构建失败！" -ForegroundColor Red
    exit 1
}
Write-Host "构建完成" -ForegroundColor Green

# 2. 部署到 Cloudflare Pages
Write-Host "[2/3] 部署到 Cloudflare Pages..." -ForegroundColor Yellow
npx wrangler pages deploy dist --project-name=lwf-portfolio --commit-dirty=true
if ($LASTEXITCODE -ne 0) {
    Write-Host "部署失败！" -ForegroundColor Red
    exit 1
}
Write-Host "部署完成" -ForegroundColor Green

# 3. 完成
Write-Host ""
Write-Host "=== 部署成功！===" -ForegroundColor Green
Write-Host ""
Write-Host "访问地址:" -ForegroundColor Cyan
Write-Host "  https://lwf-portfolio.pages.dev/" -ForegroundColor White
Write-Host ""
Write-Host "（微信里直接点开即可，支持 HTTPS，全球 CDN 加速）" -ForegroundColor Gray
Write-Host ""
