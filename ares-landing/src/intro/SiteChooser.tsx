import React, { useEffect, useRef } from 'react';
import type { CSSProperties, RefObject } from 'react';
import { formatSiteCoordinates, LANDING_SITE_LIST, type LandingSite } from './sites';
import { useIntroStore } from './store';

interface SiteChooserProps {
  open: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onChoose: (site: LandingSite) => void;
}

export default function SiteChooser({
  open,
  triggerRef,
  onClose,
  onChoose,
}: SiteChooserProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const hoveredSite = useIntroStore((state) => state.hoveredSite);
  const setHoveredSite = useIntroStore((state) => state.setHoveredSite);

  useEffect(() => {
    if (!open) return;

    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    const onOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      onClose();
    };

    document.addEventListener('pointerdown', onOutsidePointerDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('pointerdown', onOutsidePointerDown);
      setHoveredSite(null);
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    };
  }, [onClose, open, setHoveredSite, triggerRef]);

  const onPanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;

    const panel = panelRef.current;
    if (!panel) return;
    const buttons = Array.from(panel.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      id="landing-site-chooser"
      className="site-chooser-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-chooser-title"
      aria-describedby="site-chooser-description"
      data-site-chooser
      onKeyDown={onPanelKeyDown}
    >
      <header className="site-chooser-header">
        <div>
          <span className="site-chooser-kicker">MARS SURFACE OPERATIONS</span>
          <h2 id="site-chooser-title">Choose landing site</h2>
          <p id="site-chooser-description">Select a mission target to begin descent.</p>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          className="close-btn"
          aria-label="Close landing site chooser"
          onClick={onClose}
        >
          &times;
        </button>
      </header>
      <div className="site-chooser-list">
        {LANDING_SITE_LIST.map((site) => (
          <button
            key={site.id}
            type="button"
            className={`site-chooser-card${hoveredSite === site.id ? ' is-highlighted' : ''}`}
            style={{ '--site-accent': site.accent } as CSSProperties}
            aria-label={`${site.displayName}, ${site.mission}, ${site.region}, ${formatSiteCoordinates(site)}, landed ${site.landingDate}`}
            onPointerEnter={() => setHoveredSite(site.id)}
            onPointerLeave={(event) => {
              if (document.activeElement !== event.currentTarget) setHoveredSite(null);
            }}
            onFocus={() => setHoveredSite(site.id)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setHoveredSite(null);
              }
            }}
            data-site-id={site.id}
            onClick={() => onChoose(site)}
          >
            <span className="site-card-topline">
              <span className="site-card-accent">{site.accentLabel}</span>
              <span className="site-card-coordinates">{formatSiteCoordinates(site)}</span>
            </span>
            <strong className="site-card-name">{site.displayName}</strong>
            <span className="site-card-mission">{site.mission}</span>
            <span className="site-card-region">{site.region}</span>
            <span className="site-card-date">LANDED · {site.landingDate}</span>
            <span className="site-card-blurb">{site.blurb}</span>
          </button>
        ))}
      </div>
      <p className="site-chooser-footnote">Coordinates are approximate, planetocentric, east-positive.</p>
    </div>
  );
}
