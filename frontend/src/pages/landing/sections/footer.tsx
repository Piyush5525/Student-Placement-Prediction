import { useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { ContactModal } from "@/components/nav/contact-modal";
import { scrollToSmooth } from "@/lib/smooth-scroll";

const PRODUCT_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
] as const;

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
] as const;

const SOCIALS = [
  { label: "Twitter", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "GitHub", href: "#" },
] as const;

/**
 * Footer — FRONTEND_ARCHITECTURE §6.1.10. Anchor target for "Contact" in
 * the marketing nav (opens the modal here, matching the footer's own
 * contact block, rather than the nav needing a second implementation).
 */
export function Footer() {
  const [contactOpen, setContactOpen] = useState(false);

  function handleAnchorClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith("#") || href === "#") return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    event.preventDefault();
    const handled = scrollToSmooth(target, { offset: -24 });
    if (!handled) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <footer id="contact" className="relative border-t border-border-subtle py-16">
      <div className="container max-w-content px-4">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Link to="/" className="font-display text-sm font-semibold text-text-primary">
              Placement<span className="text-accent-ink">AI</span>
            </Link>
            <p className="mt-3 max-w-[22ch] text-sm text-text-secondary">
              AI-powered placement intelligence for students.
            </p>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-text-muted">Product</p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(event) => handleAnchorClick(event, link.href)}
                    className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-text-muted">Legal</p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-text-secondary hover:text-text-primary">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-text-muted">Contact</p>
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="mt-3 text-sm text-text-secondary transition-colors hover:text-accent-ink hover:underline"
            >
              Send us a message →
            </button>
            <div className="mt-4 flex gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-xs text-text-muted hover:text-text-primary"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border-subtle pt-6 sm:flex-row">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} PlacementAI. All rights reserved.
          </p>
        </div>
      </div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </footer>
  );
}
