import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-muted">404</p>
      <h1 className="mt-3 text-3xl font-semibold">That page is not on Alaya</h1>
      <p className="mt-3 text-sm text-muted">
        Try the homepage, success stories, or the FAQ — or sign in to see matches.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/" className="btn-primary">Home</Link>
        <Link href="/faq" className="btn-ghost">FAQ</Link>
      </div>
    </div>
  );
}
