<#
.SYNOPSIS
  Authenticode-signs the built SkillForge Academy Windows installer (and app exe).

.DESCRIPTION
  Signs with either a certificate already in your Windows certificate store
  (by thumbprint) or a .pfx file. Adds an RFC 3161 timestamp so the signature
  stays valid after the certificate expires. Run AFTER `npm run desktop:build`.

  This script does not obtain a certificate and does not change any trust
  store — it only applies a signature using a certificate you already control.

.EXAMPLE
  # Using a cert already installed in your user store:
  ./scripts/sign-windows.ps1 -Thumbprint A1B2C3...

.EXAMPLE
  # Using a PFX file:
  ./scripts/sign-windows.ps1 -PfxPath .\mycert.pfx -PfxPassword (Read-Host -AsSecureString)
#>
[CmdletBinding(DefaultParameterSetName = 'Store')]
param(
  [Parameter(ParameterSetName = 'Store', Mandatory = $true)]
  [string]$Thumbprint,

  [Parameter(ParameterSetName = 'Pfx', Mandatory = $true)]
  [string]$PfxPath,
  [Parameter(ParameterSetName = 'Pfx')]
  [System.Security.SecureString]$PfxPassword,

  # Optional explicit file(s) to sign. Defaults to the built installer + exe.
  [string[]]$File,

  [string]$TimestampUrl = 'http://timestamp.digicert.com'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

# Resolve the certificate.
if ($PSCmdlet.ParameterSetName -eq 'Pfx') {
  if (-not (Test-Path $PfxPath)) { throw "PFX not found: $PfxPath" }
  $cert = if ($PfxPassword) {
    New-Object System.Security.Cryptography.X509Certificates.X509Certificate2 (
      (Resolve-Path $PfxPath).Path, $PfxPassword,
      [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::Exportable)
  } else {
    Get-PfxCertificate -FilePath (Resolve-Path $PfxPath).Path
  }
} else {
  $cert = Get-ChildItem Cert:\CurrentUser\My, Cert:\LocalMachine\My -CodeSigningCert -ErrorAction SilentlyContinue |
    Where-Object { $_.Thumbprint -eq $Thumbprint } | Select-Object -First 1
  if (-not $cert) { throw "No code-signing certificate with thumbprint $Thumbprint found in CurrentUser\My or LocalMachine\My." }
}

# Resolve the files to sign.
if (-not $File) {
  $bundle = Join-Path $root 'src-tauri/target/release/bundle/nsis'
  $installer = Get-ChildItem (Join-Path $bundle '*_x64-setup.exe') -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime | Select-Object -Last 1
  $appExe = Join-Path $root 'src-tauri/target/release/skillforge-academy.exe'
  $File = @($appExe, $installer.FullName) | Where-Object { $_ -and (Test-Path $_) }
}
if (-not $File) { throw 'Nothing to sign. Run `npm run desktop:build` first, or pass -File.' }

foreach ($f in $File) {
  Write-Host "Signing $f ..."
  $result = Set-AuthenticodeSignature -FilePath $f -Certificate $cert -TimestampServer $TimestampUrl -HashAlgorithm SHA256
  if ($result.Status -ne 'Valid') {
    throw "Signing failed for $f -> $($result.Status): $($result.StatusMessage)"
  }
  Write-Host "  OK  $($result.Status) — signed by $($cert.Subject)" -ForegroundColor Green
}

Write-Host "`nDone. Verify any time with: Get-AuthenticodeSignature '<file>' | Format-List"
