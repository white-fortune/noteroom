# NPM Monorepo Guide

This project follows a **monorepo structure** with a root `package.json` file and separate `package.json` files for the **frontend** (`frontend/package.json`) and **backend** (`backend/package.json`).

## Module Installation

Since this is a **monorepo**, where both frontend and backend are managed from a single root `package.json`, module installation follows specific rules:

1. **Installing all dependencies** (for both frontend and backend):
   ```sh
   npm install --workspaces
   ```
   This installs all required dependencies and distributes them into the respective workspaces.

2. **Installing a shared module (used in both frontend and backend):**
   ```sh
   npm install <package-name> -w backend -w frontend
   ```
   This ensures the module is installed and accessible in both workspaces.

3. **Installing a backend-only module:**
   ```sh
   npm install <package-name> --workspace=backend
   ```
   Example:
   ```sh
   npm install express --workspace=backend
   ```

4. **Installing a frontend-only module:**
   ```sh
   npm install <package-name> --workspace=frontend
   ```
   Example:
   ```sh
   npm install react-router-dom --workspace=frontend
   ```

---

## Scripts Overview

All development and build scripts are **listed in the root `package.json`**. Scripts must be executed from the root directory.

1. **Building the backend:**
   ```sh
   npm run build:backend
   ```
   - This compiles TypeScript files and generates a `dist/` folder inside `backend/`.
   - **Important:** After the first build, place the `.env` file inside the `dist/` folder.

2. **Running the backend development server:**
   ```sh
   npm run dev:backend
   ```
   - This starts the Node.js server with `nodemon` for automatic restarts on file changes.

3. **Running the frontend development server:**
   ```sh
   npm run dev:frontend
   ```
   - This starts the **Vite** development server for the React frontend.
