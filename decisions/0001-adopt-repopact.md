---
id: 0001
title: Adopt RepoPact
status: accepted
date: 2026-06-16
supersedes: []
---

# 0001: Adopt RepoPact

## Context

The project already had ad-hoc governance (CODEOWNERS, CI gates, AGENTS.md). RepoPact
makes those bindings explicit and machine-checkable.

## Decision

Adopt RepoPact; existing workflows become binding gates (INV-2) and ownership becomes
scopes/roles. Existing files were preserved; RepoPact records were added around them.
