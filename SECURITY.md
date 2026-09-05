# Security Policy

PropertyPilot AI is a portfolio and demonstration application. The repository is designed so that analysis can be demonstrated safely without pretending that a demo environment is a production property transaction platform.

## Supported security model

- Secrets belong in server-side environment variables only.
- Production deployments require a strong `JWT_SECRET`.
- Authentication tokens expire after eight hours.
- Passwords are hashed with bcrypt before storage.
- The API limits JSON request bodies and caps pagination values.
- CORS can be restricted with `CORS_ORIGIN` when the API and UI are deployed separately.
- Live Stripe requests are disabled unless `STRIPE_SECRET_KEY` is configured.
- The MCP surface is deliberately read-only and cannot purchase property, take payment, change subscriptions or contact investors.

## Data model

The CSV files in `data/` are demonstration records. Do not replace them with personal, financial or confidential customer information in a public repository.

For a real deployment, replace the in-memory/local SQL.js storage layer with a managed database that supports encryption, access control, backup, retention and auditable migrations.

## High-impact actions

PropertyPilot may calculate or explain investment metrics, but an AI system must not be treated as the final authority for:

- purchasing or disposing of property
- transferring funds
- investor suitability decisions
- legal or tax advice
- credit decisions
- regulated financial advice
- contacting a buyer or seller without authorisation

Those actions require an authorised human and, where applicable, qualified professional advice.

## Reporting a vulnerability

Do not publish exploitable security details in a public issue. Contact the repository owner privately through the GitHub profile associated with this project and include the affected component, reproduction steps and potential impact.
