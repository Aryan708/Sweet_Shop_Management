My AI Usage

This project utilized AI tools extensively for debugging, environment setup, and architectural decision-making.

### Which AI Tools I Used
* **Gemini (as a helpful AI assistant)**
* **ChatGPT**

### How I Used ChatGPT
I utilized ChatGPT for high-level guidance and prompt engineering:

* I used ChatGPT to generate a **detailed prompt structure** for creating a specialized "Stock Report" view in the Django admin, including necessary constraints like **user permission checks** (`'Inventory Managers'` group).

### How I Used Gemini
I primarily relied on Gemini to act as a **pair programmer and senior debugger** to resolve critical setup and migration issues that blocked local development:

1.  **Environment Setup and Dependency Resolution:**
    * I used Gemini to troubleshoot a `psycopg2` dependency error, which confirmed my need to switch from PostgreSQL to **SQLite**.
    * I confirmed the correct structure for the SQLite database configuration within `settings.py`.

2.  **Debugging Database Integrity Errors:**
    * I used Gemini to diagnose and resolve a persistent **`IntegrityError: NOT NULL constraint failed: sweets_sweet.is_available`** that occurred when adding items via the Django Admin.
    * I followed Gemini's guidance to correctly add the `default=False` attribute to the `is_available` model field.
    * When standard migrations failed to register the change ("No changes detected"), I used Gemini's ** advanced debugging steps** to successfully:
        * Reset the migration history for the `sweets` app.
        * Delete old migration files.
        * Re-run `makemigrations` and `migrate` to establish a clean, functional database schema.

### My Reflection on How AI Impacted My Workflow

The AI assistants **dramatically accelerated the debugging process** for configuration and database issues. 
Tasks that typically require extensive time searching documentation and Stack Overflow (like diagnosing circular migration problems or non-obvious `IntegrityErrors`) were resolved within minutes through targeted, 
iterative guidance. This allowed me to immediately shift focus from debugging setup problems to **core application feature development**, saving several hours of low-level troubleshooting time.
