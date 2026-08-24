/**
 * Placeholder route element — NOT page content. Every route below renders
 * this until its real page is implemented in a later pass; it exists only
 * so the routing architecture is mechanically wireable and testable now.
 * Swap each route's `element` for its real page component when that page
 * is built — nothing else in the router needs to change.
 */
export function RouteStub({ label }: { label: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center rounded-md border border-dashed border-border-subtle">
      <p className="font-mono text-sm text-text-muted">{label} — route wired, page pending</p>
    </div>
  );
}
