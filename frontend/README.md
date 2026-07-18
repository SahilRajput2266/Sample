# JobOrbit Frontend

The frontend is a React/Vite application. It includes professional profiles, matched job discovery, and a responsive application tracking system with list, Kanban, interview, detail, and analytics views. Project-wide prerequisites and backend setup are documented in the root `README.md`.

```powershell
cd B:\Github\JobOrbit\frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite development server proxies `/api` requests to `http://localhost:5000`.

Verification:

```powershell
npm run lint
npm run build
```
