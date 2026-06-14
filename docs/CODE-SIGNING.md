# Code signing (Windows)

Release builds are currently **unsigned**, so Windows SmartScreen shows an
"unrecognized publisher" warning on launch/install. This document explains how
to sign the installer and what each option actually buys you.

## TL;DR

```powershell
npm run desktop:build
./scripts/sign-windows.ps1 -Thumbprint <your-cert-thumbprint>
```

The script signs both `skillforge-academy.exe` and the NSIS `*_x64-setup.exe` with an
RFC 3161 timestamp. Re-run it after every build (signing happens after bundling).

## What removes the SmartScreen warning?

| Certificate | Removes "unknown publisher" | Notes |
| --- | --- | --- |
| **EV Authenticode** (CA-issued) | Yes, immediately | Hardware-token; best SmartScreen reputation from day one. Paid. |
| **OV Authenticode** (CA-issued) | Eventually | Warning fades as download reputation accrues. Paid. |
| **Self-signed** | Only on machines that trust it | Free, but each machine must install the cert into Trusted Root + Trusted Publishers. Fine for your own/managed PCs; useless for public distribution. |

There is no free way to clear SmartScreen for arbitrary downloaders — that
requires a CA-issued (ideally EV) certificate, which must be purchased and is
tied to a validated identity. Obtaining one is a manual, paid step you perform.

## Option A — CA-issued certificate (for distribution)

1. Buy an OV or EV code-signing certificate (DigiCert, Sectigo, etc.) and
   complete identity validation.
2. Install it into your certificate store (EV certs live on a hardware token)
   and note the **thumbprint**:
   ```powershell
   Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert | Format-List Subject, Thumbprint
   ```
3. Build and sign:
   ```powershell
   npm run desktop:build
   ./scripts/sign-windows.ps1 -Thumbprint <thumbprint>
   ```

### Optional: sign automatically during `tauri build`

Add the thumbprint to `src-tauri/tauri.conf.json` so Tauri signs as part of the
bundle step (leave it out to keep builds unsigned):

```jsonc
"bundle": {
  "windows": {
    "certificateThumbprint": "<thumbprint>",
    "digestAlgorithm": "sha256",
    "timestampUrl": "http://timestamp.digicert.com"
  }
}
```

## Option B — Self-signed (your own machines only)

Removes the warning **only** on machines where you install the certificate.
Run these yourself — they create a certificate and change trust stores, which
is a security decision that should be made by the machine's owner.

```powershell
# 1. Create a self-signed code-signing certificate
$cert = New-SelfSignedCertificate -Type CodeSigningCert `
  -Subject "CN=ForgeWire Labs (self-signed)" `
  -CertStoreLocation Cert:\CurrentUser\My `
  -KeyUsage DigitalSignature -KeyExportPolicy Exportable `
  -NotAfter (Get-Date).AddYears(3)

# 2. Sign the build with it
./scripts/sign-windows.ps1 -Thumbprint $cert.Thumbprint

# 3. To trust it on THIS machine, export the public cert and import it into
#    LocalMachine Trusted Root + Trusted Publishers (requires admin):
Export-Certificate -Cert $cert -FilePath skillforge-selfsign.cer
Import-Certificate -FilePath skillforge-selfsign.cer -CertStoreLocation Cert:\LocalMachine\Root
Import-Certificate -FilePath skillforge-selfsign.cer -CertStoreLocation Cert:\LocalMachine\TrustedPublisher
```

## Verify a signature

```powershell
Get-AuthenticodeSignature ".\src-tauri\target\release\bundle\nsis\SkillForge Academy_1.2.1_x64-setup.exe" | Format-List
```

`Status` should be `Valid` once the signing certificate is trusted by the machine.
