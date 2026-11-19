import { Outlet } from 'react-router-dom';

export default function OperatorLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       <header className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow">
        <span className="font-semibold text-lg">FactoryFlow — Atelier Opérateur</span>
      </header>

       <main className="flex-1 p-6 max-w-5xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}