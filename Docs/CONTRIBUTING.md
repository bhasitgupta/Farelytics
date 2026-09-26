# Contributing to Farelytics

Thank you for contributing to Farelytics. We welcome code contributions, documentation improvements, and statistical methodology refinements.

## Development Workflow

1. Fork or branch from `main`.
2. Ensure Python 3.10+ and Node.js 18+ are configured locally.
3. Install dependencies in backend and frontend:
   ```bash
   # Backend
   cd backend && pip install -r requirements.txt
   # Frontend
   cd frontend && npm install
   ```
4. Run tests before submitting changes:
   ```bash
   cd backend && pytest tests/ -v
   cd frontend && npm run build
   ```

## Commit Conventions

We follow Conventional Commits standard:
- `feat(scope): ...` for new features or adapters
- `fix(scope): ...` for bug fixes or mathematical corrections
- `docs(scope): ...` for documentation updates
- `test(scope): ...` for unit or integration test additions
- `refactor(scope): ...` for code structure improvements without behavior change
