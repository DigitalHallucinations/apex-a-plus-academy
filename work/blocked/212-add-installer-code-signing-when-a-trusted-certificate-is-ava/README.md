# 212 — Add installer code signing when a trusted certificate is available

> **Status**: ⛔ Blocked (2026-06-20)
> Imported into RepoPact from `ROADMAP.md`; the source is preserved.

## Imported plan narrative

- Add installer code signing when a trusted certificate is available

## Blocked on

A trusted Windows code-signing certificate is a prerequisite and is not yet
available. Acquiring one (OV/EV certificate purchase and identity validation) is
an owner action involving payment and credentials; it can't be done from this
workspace. The signing *documentation* already exists at
[docs/CODE-SIGNING.md](../../../docs/CODE-SIGNING.md); the remaining work — wiring
the certificate into the Tauri/NSIS bundle config and the release build — unblocks
once a certificate (or an Azure Trusted Signing / cloud HSM account) is in hand.
