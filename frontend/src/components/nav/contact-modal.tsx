import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

/**
 * Contact modal — FRONTEND_ARCHITECTURE §6.1: the marketing nav's
 * "Contact" link opens this in place rather than scrolling, since it's an
 * action, not a page section. Email + optional short message field.
 */
export function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        setSubmitted(false);
      }}
    >
      {submitted ? (
        <div className="py-6 text-center">
          <p className="text-md font-semibold text-text-primary">Message sent</p>
          <p className="mt-2 text-sm text-text-secondary">
            We'll get back to you within a couple of days.
          </p>
          <Button variant="ghost" size="sm" className="mt-5" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <h3 className="text-md font-semibold text-text-primary">Get in touch</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Questions, feedback, partnership ideas — send us a note.
            </p>
          </div>

          <label className="flex flex-col gap-1.5 text-left">
            <span className="text-xs text-text-secondary">Email</span>
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="rounded-sm border border-border-subtle bg-bg-elevated-3 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-ink focus:outline-none focus:ring-2 focus:ring-accent-soft"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-left">
            <span className="text-xs text-text-secondary">Message</span>
            <textarea
              required
              rows={3}
              placeholder="How can we help?"
              className="resize-none rounded-sm border border-border-subtle bg-bg-elevated-3 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-ink focus:outline-none focus:ring-2 focus:ring-accent-soft"
            />
          </label>

          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Send message
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
