# Verification script for Farelytics
Write-Host "Verifying Farelytics build and tests..." -ForegroundColor Cyan

# 1. Frontend Build
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host "Farelytics build verified successfully!" -ForegroundColor Green
