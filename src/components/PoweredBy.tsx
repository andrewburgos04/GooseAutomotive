export function PoweredBy({ className = "" }: { className?: string }) {
  return (
    <p className={className}>
      Powered by <span className="font-semibold text-navy">TechSync Systems</span>
    </p>
  );
}
