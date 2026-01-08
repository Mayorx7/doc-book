# Add Home button to Doctor Dashboard
$doctorFile = "c:\Users\PC\Documents\dr-app-booking-sys\src\app\doctor\page.tsx"
$content = Get-Content $doctorFile -Raw

# Find the Logout button and add Home button before it
$pattern = '(\s+)(</div>\r?\n\s+<Button\s+\r?\n\s+variant="outline"\s+\r?\n\s+size="sm"\r?\n\s+onClick=\{handleLogout\})'
$replacement = '$1</div>$1<Button $1  variant="outline" $1  size="sm"$1  onClick={() => router.push(`''/`'')}$1  className="text-slate-600 hover:text-indigo-600 hover:border-indigo-300"$1>$1  Home$1</Button>$1<Button $1  variant="outline" $1  size="sm"$1  onClick={handleLogout}'

$newContent = $content -replace $pattern, $replacement
$newContent | Set-Content $doctorFile -NoNewline

Write-Host "Doctor dashboard updated"

# Add Home button to Patient Dashboard  
$patientFile = "c:\Users\PC\Documents\dr-app-booking-sys\src\app\patient\page.tsx"
$content = Get-Content $patientFile -Raw

# Find the Book Appointment button and add Home button before it
$pattern = '(\s+)(</div>\r?\n\s+<Button\s+\r?\n\s+size="lg"\s+\r?\n\s+className="bg-white text-indigo-900)'
$replacement = '$1</div>$1<div className="flex items-center gap-3">$1  <Button $1    size="lg" $1    variant="outline"$1    className="bg-white/80 text-indigo-900 border-white/40 hover:bg-white shadow-sm"$1    onClick={() => router.push(`''/`'')}$1  >$1    Home$1  </Button>$1  <Button $1    size="lg" $1    className="bg-white text-indigo-900'

$newContent = $content -replace $pattern, $replacement
$newContent | Set-Content $patientFile -NoNewline

Write-Host "Patient dashboard updated"
