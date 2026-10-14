param(
    [string]$SourceDir,
    [string]$ZipFile
)

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (Test-Path $ZipFile) {
    Remove-Item -Force $ZipFile
}

$sourceDirResolved = (Resolve-Path $SourceDir).Path.TrimEnd('\', '/')
$zip = [System.IO.Compression.ZipFile]::Open($ZipFile, [System.IO.Compression.ZipArchiveMode]::Create)

Get-ChildItem -Path $sourceDirResolved -Recurse -Force | ForEach-Object {
    if (-not $_.PSIsContainer) {
        $relativePath = $_.FullName.Substring($sourceDirResolved.Length + 1).Replace('\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $relativePath, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
}

$zip.Dispose()
Write-Host "Created clean zip with pure forward-slash paths: $ZipFile"
