'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, LogOut, ShieldCheck, Building2, User } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { AuthUser } from '../../services/auth.service';
import type { AppArea } from '../../lib/navigation';
import { isAdminUser, isOrganizerUser } from '../../lib/navigation';

interface UserMenuProps {
  user: AuthUser;
  area: AppArea;
  onLogout: () => void;
}

export function UserMenu({ user, area, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const firstName = (user.name ? user.name.split(' ')[0] : '') || 'Account';
  const roleLabel = user.roles?.[0]
    ? String(user.roles[0])
        .toLowerCase()
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : 'Campus member';
  const canOrganize = isOrganizerUser(user);
  const canAdmin = isAdminUser(user);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className="flex items-center gap-2 h-10 pl-1.5 pr-2.5 rounded-xl border border-cp-border bg-cp-surface text-sm font-semibold text-cp-navy hover:bg-cp-bg"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="w-7 h-7 rounded-lg bg-cp-navy text-cp-yellow flex items-center justify-center text-xs font-bold">
          {firstName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline max-w-[8rem] truncate">{firstName}</span>
        <ChevronDown className={cn('w-4 h-4 text-cp-muted transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 mt-2 w-56 rounded-2xl border border-cp-border bg-cp-surface shadow-md py-2 z-50"
        >
          <div className="px-3 pb-2 mb-1 border-b border-cp-border">
            <p className="text-sm font-semibold text-cp-navy truncate">{user.name}</p>
              <p className="text-meta text-cp-muted truncate">{roleLabel}</p>
          </div>

          {area !== 'student' && (
            <MenuLink href="/account" onClick={() => setOpen(false)} icon={<User className="w-4 h-4" />}>
              My account
            </MenuLink>
          )}

          <MenuLink href="/account/profile" onClick={() => setOpen(false)} icon={<User className="w-4 h-4" />}>
            Profile
          </MenuLink>

          {canOrganize && area !== 'organizer' && (
            <MenuLink
              href="/organizer"
              onClick={() => setOpen(false)}
              icon={<Building2 className="w-4 h-4" />}
            >
              Organizer portal
            </MenuLink>
          )}

          {canAdmin && area !== 'admin' && (
            <MenuLink
              href="/admin"
              onClick={() => setOpen(false)}
              icon={<ShieldCheck className="w-4 h-4" />}
            >
              Admin
            </MenuLink>
          )}

          <div className="mt-1 pt-1 border-t border-cp-border">
            <button
              type="button"
              role="menuitem"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  onClick,
  icon,
  children,
}: {
  href: string;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-cp-navy hover:bg-cp-bg"
    >
      <span className="text-cp-muted">{icon}</span>
      {children}
    </Link>
  );
}
