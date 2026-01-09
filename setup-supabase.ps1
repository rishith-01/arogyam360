
$envFile = "backend\.env"

if (!(Test-Path $envFile)) {
    Write-Host "backend\.env not found. Please run setup-backend-env.bat first." -ForegroundColor Red
    exit
}

$content = Get-Content $envFile

# Update STORAGE_METHOD
$content = $content -replace "STORAGE_METHOD=local", "STORAGE_METHOD=supabase"
$content = $content -replace "STORAGE_METHOD=cloudinary", "STORAGE_METHOD=supabase"
$content = $content -replace "STORAGE_METHOD=firebase", "STORAGE_METHOD=supabase"

# Remove existing Supabase keys to avoid duplicates
$content = $content | Where-Object { $_ -notmatch "^SUPABASE_URL=" -and $_ -notmatch "^SUPABASE_SERVICE_ROLE_KEY=" }

# Add keys
$url = Read-Host "Enter your Supabase URL (e.g., https://xyz.supabase.co)"
$key = Read-Host "Enter your Supabase Service Role Key"

$content += ""
$content += "SUPABASE_URL=$url"
$content += "SUPABASE_SERVICE_ROLE_KEY=$key"

$content | Set-Content $envFile

Write-Host "✅ backend\.env updated for Supabase!" -ForegroundColor Green
Write-Host "   STORAGE_METHOD set to 'supabase'"
Write-Host "   Credentials added."
