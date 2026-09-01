# 一键部署到 Vercel
# 用法：pnpm run deploy:vercel

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$deployDir = "$env:USERPROFILE\Documents\lwf-portfolio-deploy"

Write-Host "=== 刘伟峰作品集 - Vercel 一键部署 ===" -ForegroundColor Cyan
Write-Host ""

# 1. 构建项目
Write-Host "[1/4] 构建项目..." -ForegroundColor Yellow
Set-Location $projectRoot
npx vite build
if ($LASTEXITCODE -ne 0) {
    Write-Host "构建失败！" -ForegroundColor Red
    exit 1
}
Write-Host "构建完成" -ForegroundColor Green

# 2. 复制到英文路径
Write-Host "[2/4] 准备部署目录..." -ForegroundColor Yellow
if (Test-Path $deployDir) {
    Remove-Item -Recurse -Force $deployDir
}
Copy-Item -Recurse "$projectRoot\dist" $deployDir
Copy-Item -Recurse "$projectRoot\.vercel" "$deployDir\.vercel"
Copy-Item "$projectRoot\vercel.json" "$deployDir\vercel.json" -ErrorAction SilentlyContinue
Write-Host "部署目录准备完成: $deployDir" -ForegroundColor Green

# 3. 部署到 Vercel
Write-Host "[3/4] 部署到 Vercel..." -ForegroundColor Yellow
Set-Location $deployDir
vercel --prod --yes
if ($LASTEXITCODE -ne 0) {
    Write-Host "部署失败！" -ForegroundColor Red
    exit 1
}
Write-Host "部署完成" -ForegroundColor Green

# 4. 完成
Write-Host ""
Write-Host "=== 部署成功！===" -ForegroundColor Green
Write-Host ""
Write-Host "访问地址:" -ForegroundColor Cyan
Write-Host "  https://lwf-portfolio-deploy.vercel.app/" -ForegroundColor White
Write-Host ""
Write-Host "（微信里直接点开即可，支持 HTTPS）" -ForegroundColor Gray
Write-Host ""

# 清理
Set-Location $projectRoot
