'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCircle2,
  Clock,
  Users,
  CheckCheck,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../../lib/auth/auth-context';
import type { NotificationItem } from '../../../services/notifications.service';
import { notificationsService } from '../../../services/notifications.service';
import { NotificationType } from '@campuspulse/types';
import { useToast } from '../../../components/ui/toast';
import { PageHeader } from '../../../components/ui/page-header';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/ui/empty-state';

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login?redirect=/account/notifications');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationsService.getNotifications();
      setNotifications(res.items);
      setUnreadCount(res.unreadCount);
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      setError('Unable to load your notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated, loadNotifications]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await notificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast({
        title: 'All notifications marked as read',
        description: 'Your notification center is now up to date.',
        tone: 'success',
      });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'UNREAD') return !n.isRead;
    return true;
  });

  const getNotificationIcon = (type: NotificationType | string) => {
    switch (type) {
      case NotificationType.TEAM_REQUEST:
      case NotificationType.TEAM_REQUEST_ACCEPTED:
      case NotificationType.TEAM_REQUEST_REJECTED:
        return (
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-sky-600" />
          </div>
        );
      case NotificationType.EVENT_DEADLINE:
      case NotificationType.EVENT_UPDATED:
      case NotificationType.EVENT_CANCELLED:
      case NotificationType.EVENT_REMINDER:
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
        );
      case NotificationType.REGISTRATION_CONFIRMED:
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        );
      case NotificationType.MODERATION:
        return (
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-cp-bg text-cp-navy border border-cp-border flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-cp-muted" />
          </div>
        );
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center p-6 text-xs text-cp-muted">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-cp-yellow border-t-transparent animate-spin" />
            <span>Loading notifications...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 section-container py-8 space-y-8">
        <div>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-xs font-bold text-cp-muted hover:text-cp-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Account</span>
          </Link>
        </div>

        <PageHeader
          title="Notifications"
          description="Stay informed about registration updates, deadlines, and opportunity alerts."
          eyebrow="Notification Center"
          actions={
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="btn-secondary text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-cp-muted" />
                  <span>Mark All as Read</span>
                </button>
              )}
              <button
                type="button"
                onClick={loadNotifications}
                className="p-2 rounded-lg border border-cp-border bg-cp-surface hover:bg-cp-bg text-cp-muted transition-colors"
                title="Refresh notifications"
                aria-label="Refresh notifications"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          }
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'ALL'
                ? 'bg-cp-navy text-white shadow-xs'
                : 'bg-cp-surface text-cp-muted hover:text-cp-navy border border-cp-border'
            }`}
          >
            <span>All Notifications ({notifications.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('UNREAD')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === 'UNREAD'
                ? 'bg-cp-navy text-white shadow-xs'
                : 'bg-cp-surface text-cp-muted hover:text-cp-navy border border-cp-border'
            }`}
          >
            <span>Unread Only</span>
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-cp-yellow" />
            )}
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-24 bg-cp-surface rounded-2xl border border-cp-border animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-cp-surface border border-cp-border text-center space-y-4 max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-cp-navy">Unable to Load Notifications</h3>
              <p className="text-xs text-cp-muted">{error}</p>
            </div>
            <button
              type="button"
              onClick={loadNotifications}
              className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={activeFilter === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}
            description={
              activeFilter === 'UNREAD'
                ? "You're all caught up with your opportunity alerts."
                : "When organizers post updates, deadlines approach, or registrations are confirmed, you'll find notifications here."
            }
            action={{
              label: 'Explore Opportunities',
              href: '/explore',
            }}
          />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const targetUrl = notif.linkUrl || null;
              const formattedDate = new Date(notif.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <Card
                  key={notif.id}
                  hover
                  onClick={() => {
                    if (!notif.isRead) handleMarkAsRead(notif.id);
                  }}
                  className={`p-5 flex items-start justify-between gap-4 cursor-pointer ${
                    notif.isRead
                      ? ''
                      : 'border-amber-200 bg-amber-50/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {getNotificationIcon(notif.type)}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2
                          className={`text-sm font-bold ${
                            notif.isRead ? 'text-cp-navy' : 'text-black'
                          }`}
                        >
                          {notif.title}
                        </h2>
                        {!notif.isRead && (
                          <Badge tone="accent">
                            NEW
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-cp-muted leading-relaxed max-w-xl">
                        {notif.message}
                      </p>

                      <div className="text-[11px] text-cp-muted/70 pt-1">
                        {formattedDate}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-center">
                    {!notif.isRead && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        title="Mark as read"
                        aria-label="Mark notification as read"
                        className="p-2 rounded-lg text-cp-muted hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}

                    {targetUrl && (
                      <Link
                        href={targetUrl}
                        className="p-2 rounded-lg text-cp-muted hover:text-cp-navy hover:bg-cp-bg transition-colors"
                        title="Open related link"
                        aria-label="Open related link"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
