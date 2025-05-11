# Hospital Management System

This is a Next.js 15 project for a hospital management system.

## Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env.local` file in the root directory with the following content:
   ```
   DATABASE_URL=postgres://user:password@host:port/dbname
   ```
   Replace the placeholder with your actual database connection string.
4. Run the development server:
   ```bash
   pnpm dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

- `DATABASE_URL`: Required for database connectivity. Set this in your `.env.local` file.

## Project Structure

- `/app`: Contains Next.js pages and API routes.
- `/components`: Reusable UI components.
- `/lib`: Utility functions and database setup.
- `/public`: Static assets.
- `/styles`: Global styles.

## Additional Notes

- Ensure your database schema matches the expected structure for the application to function correctly.
- For more details, refer to the documentation or contact the development team. 