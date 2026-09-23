# Security Policy

## Supported Versions

APIx actively maintains and provides security patches for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of APIx and its underlying services seriously. If you discover a security vulnerability, please report it privately:

1. **Email:** Send full vulnerability details, reproduction steps, and impact assessment to [bhasitgupta@gmail.com](mailto:bhasitgupta@gmail.com).
2. **Response Time:** You will receive an initial response within 48 hours.
3. **Disclosure:** Please refrain from publicly disclosing the issue until a patch has been released and verified.

## Security Practices

- Immutable append-only raw quote logs preventing data tampering.
- TLS 1.3 encryption across all REST endpoints.
- Strict input validation via Pydantic schemas.
- Safe rate limiting adhering to airline robots.txt directives.
