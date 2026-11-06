# ==============================================================================
# sarojparajuli.com.np — One-Click GitHub & Vercel Deployment Script
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 Deploying sarojparajuli.com.np to GitHub & Vercel" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Ensure Git in Path
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","User") + ";" + [System.Environment]::GetEnvironmentVariable("Path","Machine")

# 2. Check Git Status
Write-Host "`n[1/3] Checking Git Repository Status..." -ForegroundColor Yellow
git status

# 3. Check GitHub Authentication
Write-Host "`n[2/3] Checking GitHub CLI Authentication..." -ForegroundColor Yellow
$ghAuth = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "GitHub session expired. Launching one-time web login..." -ForegroundColor Magenta
    gh auth login -h github.com -w
}

# Prompt for repo push
Write-Host "`nReady to push repository to GitHub!" -ForegroundColor Green
$repoName = Read-Host "Enter GitHub repository name (default: sarojparajuli-site)"
if ([string]::IsNullOrWhiteSpace($repoName)) { $repoName = "sarojparajuli-site" }

Write-Host "Publishing to GitHub ($repoName)..." -ForegroundColor Cyan
gh repo create $repoName --public --source=. --remote=origin --push 2>$null
if ($LASTEXITCODE -ne 0) {
    git push -u origin main
}

# 4. Deploy to Vercel
Write-Host "`n[3/3] Deploying to Vercel Edge Network..." -ForegroundColor Yellow
$vercelAuth = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Vercel login required. Opening Vercel login..." -ForegroundColor Magenta
    vercel login
}

Write-Host "Deploying production build to Vercel..." -ForegroundColor Cyan
vercel --prod --yes

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "🎉 DEPLOYMENT COMPLETE! Site is live on Vercel." -ForegroundColor Green
Write-Host "Domain: https://sarojparajuli.com.np" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
