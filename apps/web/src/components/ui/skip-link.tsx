export function SkipToContent({ href = '#main-content' }: { href?: string }) {
  return (
    <a href={href} className="skip-link">
      Skip to content
    </a>
  );
}
