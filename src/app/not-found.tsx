import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-6xl font-black text-white">404</h1>
      <p className="mt-4 text-neutral-400 text-lg">Página no encontrada</p>
      <Link
        href="/"
        className="mt-6 px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors"
      >
        Volver al Portafolio
      </Link>
    </div>
  );
}
