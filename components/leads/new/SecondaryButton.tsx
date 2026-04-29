import Link from 'next/link';

export function SecondaryButton({ href = '/leads', label = 'Cancel', className = '' }: { href?: string; label?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center rounded-xl border border-[#CDB89F] px-4 text-sm font-medium text-[#5A4A3B] ${className}`}
    >
      {label}
    </Link>
  );
}
