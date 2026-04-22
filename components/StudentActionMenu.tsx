"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import styles from "./studentActionMenu.module.css";

export type StudentActionMenuItem = {
  label: string;
  section?: string;
  href?: string;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  tone?: "default" | "danger";
  helper?: string;
};

type StudentActionMenuProps = {
  accountLabel: string;
  accountEmail?: string | null;
  items: StudentActionMenuItem[];
  triggerLabel?: string;
};

export default function StudentActionMenu({
  accountLabel,
  accountEmail,
  items,
  triggerLabel = "Menu",
}: StudentActionMenuProps) {
  const [open, setOpen] = useState(false);
  const accountInitial = useMemo(() => {
    const value = String(accountLabel || "").trim();
    return value ? value.charAt(0).toUpperCase() : "C";
  }, [accountLabel]);
  const groupedItems = useMemo(() => {
    const groups: Array<{ label: string; items: StudentActionMenuItem[] }> = [];

    for (const item of items) {
      const groupLabel = String(item.section || "Menu").trim();
      const existingGroup = groups.find((group) => group.label === groupLabel);
      if (existingGroup) {
        existingGroup.items.push(item);
      } else {
        groups.push({ label: groupLabel, items: [item] });
      }
    }

    return groups;
  }, [items]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <div className={styles.anchor}>
        <button
          type="button"
          className={styles.trigger}
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <span className={styles.triggerIcon} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          {triggerLabel}
        </button>
      </div>

      {open ? (
        <div className={styles.backdrop} onClick={() => setOpen(false)}>
          <aside className={styles.panel} onClick={(event) => event.stopPropagation()}>
            <div className={styles.panelHeader}>
              <div className={styles.logoMark} aria-hidden="true">
                {accountInitial}
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            <div className={styles.accountBlock}>
              <div className={styles.accountEyebrow}>Student menu</div>
              <div className={styles.accountLabel}>{accountLabel}</div>
              {accountEmail ? <div className={styles.accountEmail}>{accountEmail}</div> : null}
            </div>

            <nav className={styles.menuList} aria-label="Student actions">
              {groupedItems.map((group) => (
                <section key={group.label} className={styles.menuSection}>
                  <div className={styles.sectionLabel}>{group.label}</div>
                  <div className={styles.sectionItems}>
                    {group.items.map((item) => {
                      const className = item.tone === "danger"
                        ? `${styles.menuItem} ${styles.menuItemDanger}`
                        : styles.menuItem;

                      if (item.href) {
                        return (
                          <Link
                            key={group.label + item.label}
                            href={item.href}
                            className={className}
                            onClick={() => setOpen(false)}
                          >
                            <span>{item.label}</span>
                            {item.helper ? <small className={styles.helper}>{item.helper}</small> : null}
                          </Link>
                        );
                      }

                      return (
                        <button
                          key={group.label + item.label}
                          type="button"
                          className={className}
                          disabled={item.disabled}
                          onClick={() => {
                            setOpen(false);
                            void item.onClick?.();
                          }}
                        >
                          <span>{item.label}</span>
                          {item.helper ? <small className={styles.helper}>{item.helper}</small> : null}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}
