import React, { useEffect, useState } from 'react';
import { FaComments, FaTrash, FaSyncAlt } from 'react-icons/fa';
import api from '../../api/axios';

const CollaborationManagement = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState({});
  const [deletingPost, setDeletingPost] = useState(null);
  const [deletingComment, setDeletingComment] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/collaboration/posts?limit=100');
      setPosts(response.data.posts || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load collaboration posts.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    setError('');
    setCommentLoading(prev => ({ ...prev, [postId]: true }));

    try {
      const response = await api.get(`/collaboration/posts/${postId}/comments`);
      setComments(prev => ({ ...prev, [postId]: response.data.comments || [] }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load comments.');
      setComments(prev => ({ ...prev, [postId]: [] }));
    } finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const toggleComments = async (postId) => {
    const isOpen = !!openComments[postId];
    setOpenComments(prev => ({ ...prev, [postId]: !isOpen }));

    if (!isOpen && !comments[postId]) {
      await fetchComments(postId);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this collaboration post and all associated comments?')) {
      return;
    }

    setDeletingPost(postId);
    setError('');
    try {
      await api.delete(`/collaboration/posts/${postId}`);
      setPosts(prev => prev.filter(post => post._id !== postId));
      setComments(prev => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      setOpenComments(prev => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      setMessage('Post deleted successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post.');
    } finally {
      setDeletingPost(null);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Delete this comment?')) {
      return;
    }

    setDeletingComment(commentId);
    setError('');
    try {
      await api.delete(`/collaboration/comments/${commentId}`);
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId]?.filter(comment => comment._id !== commentId) || []
      }));
      setMessage('Comment deleted successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete comment.');
    } finally {
      setDeletingComment(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Collaboration Hub Management</h2>
          <p className="text-sm text-white/70 mt-1">
            Review, moderate, and remove collaboration posts or comments created by artists and admins.
          </p>
        </div>
        <button
          onClick={fetchPosts}
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
        >
          <FaSyncAlt /> Refresh posts
        </button>
      </div>

      {message && (
        <div className="bg-emerald-500/20 text-emerald-200 p-4 rounded-lg mb-4">{message}</div>
      )}

      {error && (
        <div className="bg-red-500/20 text-red-200 p-4 rounded-lg mb-4">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white/40"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center text-white/70 py-12">No collaboration posts found.</div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{post.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{post.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/70">
                    <span className="rounded-full bg-slate-700/70 px-3 py-1">Posted by {post.author?.name || 'Unknown'}</span>
                    {post.genre && <span className="rounded-full bg-slate-700/70 px-3 py-1">{post.genre}</span>}
                    {post.location && <span className="rounded-full bg-slate-700/70 px-3 py-1">{post.location}</span>}
                    <span className="rounded-full bg-slate-700/70 px-3 py-1">{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span className="rounded-full bg-slate-700/70 px-3 py-1">{post.commentCount ?? 0} comments</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleComments(post._id)}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                  >
                    <FaComments /> {openComments[post._id] ? 'Hide comments' : 'Show comments'}
                  </button>
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    disabled={deletingPost === post._id}
                    className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60"
                  >
                    <FaTrash /> {deletingPost === post._id ? 'Deleting...' : 'Delete post'}
                  </button>
                </div>
              </div>

              {openComments[post._id] && (
                <div className="mt-6 space-y-4 rounded-3xl bg-black/60 border border-white/10 p-5">
                  {commentLoading[post._id] ? (
                    <div className="text-white/70">Loading comments...</div>
                  ) : comments[post._id]?.length ? (
                    comments[post._id].map((comment) => (
                      <div key={comment._id} className="rounded-2xl bg-white/5 p-4">
                        <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-start">
                          <div>
                            <p className="text-sm text-white/80">{comment.content}</p>
                            <div className="mt-3 text-xs text-white/60">
                              <span>{comment.author?.name || comment.authorName || 'Unknown'}</span>
                              <span className="mx-2">•</span>
                              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteComment(post._id, comment._id)}
                            disabled={deletingComment === comment._id}
                            className="inline-flex items-center gap-2 rounded-full bg-red-700 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60"
                          >
                            {deletingComment === comment._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-white/70">No comments for this post.</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollaborationManagement;
