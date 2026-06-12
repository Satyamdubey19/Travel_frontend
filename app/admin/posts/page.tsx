'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { Eye, Heart, MessageCircle, Search, SquarePen } from 'lucide-react';
import Input from '@/components/ui/Input';
import StatusBadge from '@/components/ui/StatusBadge';
import { TablePageSkeleton } from '@/components/ui/loading-skeletons';
import api from '@/lib/axios';

type PostRow = {
  id: string;
  imageUrl: string;
  caption: string;
  viewCount: number;
  comments: number;
  likes: number;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  };
  listing: {
    type: 'hotel' | 'tour';
    id: string;
    title: string;
    location: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100', search });
      const { data: payload } = await api.get(`/admin/posts?${params.toString()}`, {
        headers: { 'Cache-Control': 'no-store' },
      });
      setPosts(payload.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPosts();
  }, []);

  const stats = useMemo(() => ({
    total: posts.length,
    views: posts.reduce((sum, post) => sum + post.viewCount, 0),
    likes: posts.reduce((sum, post) => sum + post.likes, 0),
    comments: posts.reduce((sum, post) => sum + post.comments, 0),
  }), [posts]);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-blue-50 text-blue-800">
                <SquarePen className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-800">Community content</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Post list</h1>
                <p className="mt-2 text-sm text-slate-600">Browse every user post with author, linked listing, and engagement details.</p>
              </div>
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              {stats.total} posts
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-4">
          {[
            ['Total posts', stats.total],
            ['Views', stats.views],
            ['Likes', stats.likes],
            ['Comments', stats.comments],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[24px] border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{Number(value).toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void fetchPosts();
              }}
              placeholder="Search captions, users, hotels, tours, or locations"
              className="pl-11"
            />
          </div>
          <button
            onClick={() => fetchPosts()}
            className="rounded-2xl bg-blue-800 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-blue-900"
          >
            Search
          </button>
        </div>

        {loading ? (
          <TablePageSkeleton />
        ) : (
          <div className="overflow-x-auto rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Post</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Author</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Linked listing</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Engagement</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {posts.map((post) => (
                  <tr key={post.id} className="transition hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <div className="flex min-w-[280px] items-center gap-4">
                        <img
                          src={post.imageUrl}
                          alt={post.caption || 'User post'}
                          className="h-16 w-16 rounded-2xl object-cover"
                        />
                        <div className="min-w-0">
                          <p className="line-clamp-2 font-semibold text-slate-950">{post.caption || 'No caption'}</p>
                          <p className="mt-1 text-xs text-slate-500">{post.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-950">{post.author.name}</p>
                      <p className="text-xs text-slate-500">{post.author.email}</p>
                      <div className="mt-2"><StatusBadge status={post.author.status} /></div>
                    </td>
                    <td className="px-6 py-4">
                      {post.listing ? (
                        <>
                          <p className="font-semibold text-slate-950">{post.listing.title}</p>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{post.listing.type}</p>
                          <p className="mt-1 text-xs text-slate-500">{post.listing.location}</p>
                        </>
                      ) : (
                        <span className="text-slate-500">General post</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Metric icon={Eye} value={post.viewCount} label="views" />
                        <Metric icon={Heart} value={post.likes} label="likes" />
                        <Metric icon={MessageCircle} value={post.comments} label="comments" />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {new Date(post.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  value,
  label,
}: {
  icon: ComponentType<{ className?: string }>;
  value: number;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
      <Icon className="h-3.5 w-3.5 text-blue-700" />
      {value.toLocaleString('en-IN')} {label}
    </span>
  );
}
