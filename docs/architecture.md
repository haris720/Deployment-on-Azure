# My Treats Architecture

## Frontend

The frontend is a React and TypeScript application hosted on Azure App Service.

Production URL:

https://thexyz.online

## Backend

The backend is a Node.js, Express and TypeScript REST API running on an Ubuntu Azure Virtual Machine.

Production URL:

https://api.thexyz.online

## Database

PostgreSQL is used as the relational database. Prisma is used for schema management, migrations and database queries.

## Communication

The frontend communicates with the backend through HTTPS REST APIs.

Example:

GET https://api.thexyz.online/api/v1/restaurants

## CI/CD

GitHub Actions will:

1. Run formatting and linting checks.
2. Run automated tests.
3. Build the application.
4. Deploy the frontend to Azure App Service.
5. Deploy the backend to the Azure VM.
6. Restart the backend safely through PM2.
