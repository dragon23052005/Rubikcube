$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot
try {
    $appJar = Join-Path $projectRoot 'target/academy-1.0.0.jar'
    if (!(Test-Path -LiteralPath $appJar)) { throw 'Build the application with mvn package first.' }
    $libDir = Join-Path $projectRoot 'target/demo-seed-libs'
    New-Item -ItemType Directory -Path $libDir -Force | Out-Null
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead($appJar)
    $libraries = @()
    try {
        foreach ($pattern in @('mysql-connector-j-*.jar', 'spring-security-crypto-*.jar', 'spring-jcl-*.jar')) {
            $entry = $archive.Entries | Where-Object { $_.FullName -like "BOOT-INF/lib/$pattern" } | Select-Object -First 1
            if (!$entry) { throw "Missing library in application JAR: $pattern" }
            $destination = Join-Path $libDir $entry.Name
            [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $destination, $true)
            $libraries += $destination
        }
    } finally { $archive.Dispose() }
    $javaCommand = if ($env:JAVA_HOME) { Join-Path $env:JAVA_HOME 'bin/java.exe' } else { 'java' }
    & $javaCommand --class-path ($libraries -join [IO.Path]::PathSeparator) tools/SeedDemoAccounts.java --apply
    if ($LASTEXITCODE -ne 0) { throw 'Account seed failed.' }
} finally { Pop-Location }
