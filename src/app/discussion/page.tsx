'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { MessageSquare, Plus, ThumbsUp, MessageCircle, Loader2, Sparkles, Send, X } from 'lucide-react';

interface DiscussionPost {
  id: string;
  title: string;
  content: string;
  category: string;
  upvotes: number;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
  _count: { comments: number };
}

interface DiscussionComment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
}

const CATEGORIES = ['All', 'General', 'Algorithms', 'Interview Prep', 'Bug Reports'];

const CATEGORY_COLORS: Record<string, string> = {
  General:       'bg-slate-100 text-slate-700 border border-slate-200',
  Algorithms:    'bg-indigo-50 text-indigo-700 border border-indigo-200',
  'Interview Prep': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Bug Reports': 'bg-rose-50 text-rose-700 border border-rose-200',
};

export default function DiscussionPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [creating, setCreating] = useState(false);

  const [activePost, setActivePost] = useState<DiscussionPost | null>(null);
  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => { fetchPosts(); }, [selectedCategory]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const url = selectedCategory === 'All' ? '/api/discussion' : `/api/discussion?category=${encodeURIComponent(selectedCategory)}`;
      const res = await fetch(url);
      if (res.ok) { const d = await res.json(); setPosts(d.posts || []); }
    } catch (e) { console.error('Failed to load discussion posts'); }
    finally { setLoading(false); }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/discussion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), category }),
      });
      if (res.ok) { setTitle(''); setContent(''); setShowModal(false); fetchPosts(); }
    } catch (e) { alert('Failed to post discussion.'); }
    finally { setCreating(false); }
  };

  const openPostComments = async (post: DiscussionPost) => {
    setActivePost(post);
    try {
      const res = await fetch(`/api/discussion/${post.id}/comments`);
      if (res.ok) { const d = await res.json(); setComments(d.comments || []); }
    } catch (e) { console.error('Failed to load comments'); }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePost || !newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/discussion/${activePost.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (res.ok) {
        setNewComment('');
        const d = await res.json();
        setComments((prev) => [...prev, d.comment]);
        fetchPosts();
      }
    } catch (e) { alert('Failed to post comment.'); }
    finally { setSubmittingComment(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-4 sm:space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            Global Developer Discussion
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Ask questions, share solution writeups, and discuss algorithms with the community.
          </p>
        </div>
        {session?.user && (
          <button onClick={() => setShowModal(true)} className="btn-primary text-xs h-9 shrink-0">
            <Plus className="w-3.5 h-3.5" /> Start Thread
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Mobile: show comment panel as overlay slide-in */}
      {activePost && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end bg-slate-900/60 backdrop-blur-sm" onClick={() => setActivePost(null)}>
          <div className="w-full bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${CATEGORY_COLORS[activePost.category] ?? CATEGORY_COLORS.General}`}>{activePost.category}</span>
              <button onClick={() => setActivePost(null)} className="p-1.5 rounded-full bg-slate-100 text-slate-500"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm leading-snug">{activePost.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{activePost.content}</p>
              <div className="border-t border-slate-100 pt-3 space-y-3">
                <span className="section-header"><MessageCircle className="w-3.5 h-3.5" /> Comments ({comments.length})</span>
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-3 text-center">No comments yet. Be the first!</p>
                ) : comments.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-bold text-slate-700">{c.user.name || 'Developer'}</span>
                      <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{c.content}</p>
                  </div>
                ))}
                {session?.user ? (
                  <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
                    <input type="text" required value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." className="input text-xs h-10" />
                    <button type="submit" disabled={submittingComment || !newComment.trim()} className="btn-primary text-xs h-10 px-3 shrink-0">
                      {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-slate-400 text-center italic">Sign in to comment.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-start">

        {/* Left: Thread List */}
        <div className="lg:col-span-7 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="text-xs font-medium">Fetching threads...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="card p-10 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-400 italic">No threads in this category yet. Be the first to start one!</p>
            </div>
          ) : posts.map((post) => (
            <div
              key={post.id}
              onClick={() => openPostComments(post)}
              className={`card p-5 cursor-pointer transition-all space-y-3 ${
                activePost?.id === post.id
                  ? 'border-indigo-400 shadow-md ring-1 ring-indigo-200'
                  : 'hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.General}`}>
                  {post.category}
                </span>
                <span className="text-slate-400 text-[11px] font-medium">
                  {post.user.name || 'Developer'} · {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="font-bold text-slate-900 text-sm leading-snug hover:text-indigo-600 transition-colors">
                {post.title}
              </h2>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
              <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500 border-t border-slate-100 pt-3">
                <span className="flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5 text-indigo-500" /> {post.upvotes}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-slate-400" /> {post._count.comments}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Thread Detail + Comments — Desktop Only */}
        <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-20 self-start">
          {activePost ? (
            <div className="card p-5 space-y-4">
              <div className="border-b border-slate-100 pb-4 space-y-2.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${CATEGORY_COLORS[activePost.category] ?? CATEGORY_COLORS.General}`}>
                  {activePost.category}
                </span>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">{activePost.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{activePost.content}</p>
              </div>

              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                <span className="section-header">
                  <MessageCircle className="w-3.5 h-3.5 text-slate-500" /> Comments ({comments.length})
                </span>
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">No comments yet.</p>
                ) : comments.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-bold text-slate-700">{c.user.name || 'Developer'}</span>
                      <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{c.content}</p>
                  </div>
                ))}
              </div>

              {session?.user ? (
                <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="input text-xs h-9"
                  />
                  <button type="submit" disabled={submittingComment || !newComment.trim()} className="btn-primary text-xs h-9 px-3 shrink-0">
                    {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </form>
              ) : (
                <p className="text-xs text-slate-400 text-center italic pt-1">Sign in to leave a comment.</p>
              )}
            </div>
          ) : (
            <div className="card p-10 text-center text-slate-400 text-xs italic">
              Select a discussion thread to read and comment.
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card max-w-lg w-full p-6 space-y-5 bg-white shadow-2xl">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" /> Start Discussion Thread
            </h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input text-xs h-9">
                  <option value="General">General</option>
                  <option value="Algorithms">Algorithms</option>
                  <option value="Interview Prep">Interview Prep</option>
                  <option value="Bug Reports">Bug Reports</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Optimal approach for Two Sum in Python?" className="input text-xs h-9" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Content</label>
                <textarea required value={content} onChange={(e) => setContent(e.target.value)} placeholder="Explain your question or thoughts in detail..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-28 resize-none" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-xs h-9">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary text-xs h-9">
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Post Thread'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
