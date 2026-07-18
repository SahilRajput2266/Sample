import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6 text-center">
      <div className="max-w-md">
        <Compass className="mx-auto h-14 w-14 text-indigo-600" />
        <p className="mt-6 text-sm font-bold uppercase tracking-widest text-indigo-600">404</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-3 text-slate-600">The page you requested does not exist or may have moved.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">Return home</Link>
      </div>
    </main>
  );
}