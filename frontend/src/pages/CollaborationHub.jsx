import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';
import LikeDislikeButton from '../components/LikeDislikeButton';
import ReplySection from '../components/ReplySection';
import { toast } from 'react-toastify';

const CollaborationHub = () => {
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', description: '', genre: '', location: '' });
  const [comments, setComments] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [newComment, setNewComment] = useState({});
  const [message, setMessage] = useState('');
  const [commentCounts, setCommentCounts] = useState({});
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showMentions, setShowMentions] = useState({});
  const [showReactionDetails, setShowReactionDetails] = useState({});
  const [deletingComment, setDeletingComment] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!isAuthenticated) {
          const authResult = await checkAuth();
          if (!authResult) {
            navigate('/login');
            return;
          }
        }
        // Check if user is an artist or admin
        if (user && user.role !== 'artist' && user.role !== 'admin') {
          setError('This feature is only available to artists and admins');
          setLoading(false);
          return;
        }
        fetchPosts();
      } catch (err) {
        setError('Failed to load collaboration hub. Please try again later.');
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, isAuthenticated, checkAuth, user]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newPost.title.trim() || !newPost.description.trim()) {
      setError('Title and description are required');
      return;
    }

    try {
      const response = await api.post('/collaboration/posts', newPost);
      setPosts([response.data.post, ...posts]);
      setCommentCounts(prev => ({
        ...prev,
        [response.data.post._id]: 0
      }));
      setNewPost({ title: '', description: '', genre: '', location: '' });
      setMessage('Post created successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    }
  };

  const handleAddComment = async (postId) => {
    setError(null);

    if (!newComment[postId] || !newComment[postId].trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      const response = await api.post(`/collaboration/posts/${postId}/comments`, {
        content: newComment[postId]
      });
      
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), response.data.comment]
      }));
      
      setCommentCounts(prev => ({
        ...prev,
        [postId]: (prev[postId] || 0) + 1
      }));
      
      setNewComment({ ...newComment, [postId]: '' });
      toast.success('Comment added successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleCommentChange = (postId, value) => {
    setNewComment(prev => ({
      ...prev,
      [postId]: value,
    }));

    // Handle mention suggestions
    if (value.includes('@')) {
      const mentionMatch = value.match(/@(\w*)$/);
      if (mentionMatch) {
        setShowMentions(prev => ({ ...prev, [postId]: true }));
      } else {
        setShowMentions(prev => ({ ...prev, [postId]: false }));
      }
    } else {
      setShowMentions(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchPosts = async () => {
    try {
      const response = await api.get('/collaboration/posts');
      const fetchedPosts = response.data.posts || [];
      setPosts(fetchedPosts);
      setCommentCounts(
        fetchedPosts.reduce((acc, post) => {
          acc[post._id] = post.commentCount ?? 0;
          return acc;
        }, {})
      );
    } catch (err) {
      setError('Failed to load collaboration posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    setError(null);
    setCommentsLoading(prev => ({
      ...prev,
      [postId]: true,
    }));

    try {
      const response = await api.get(`/collaboration/posts/${postId}/comments`);
      const fetchedComments = response.data.comments || [];
      setComments(prev => ({
        ...prev,
        [postId]: fetchedComments,
      }));
      setCommentCounts(prev => ({
        ...prev,
        [postId]: fetchedComments.length,
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load comments');
      setComments(prev => ({
        ...prev,
        [postId]: [],
      }));
    } finally {
      setCommentsLoading(prev => ({
        ...prev,
        [postId]: false,
      }));
    }
  };

  const toggleComments = (postId) => {
    const isOpen = !!openComments[postId];

    if (isOpen) {
      setOpenComments(prev => ({
        ...prev,
        [postId]: false,
      }));
      return;
    }

    setOpenComments(prev => ({
      ...prev,
      [postId]: true,
    }));

    if (!comments[postId]) {
      fetchComments(postId);
    }
  };

  const toggleReactionDetails = (postId) => {
    setShowReactionDetails(prev => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this collaboration post?')) return;

    try {
      await api.delete(`/collaboration/posts/${postId}`);
      setPosts(prev => prev.filter(post => post._id !== postId));
      toast.success('Collaboration post deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    if (!window.confirm('Delete this comment?')) return;

    setDeletingComment(prev => ({ ...prev, [commentId]: true }));
    try {
      await api.delete(`/collaboration/comments/${commentId}`);
      await fetchComments(postId);
      setCommentCounts(prev => ({
        ...prev,
        [postId]: Math.max((prev[postId] || 1) - 1, 0),
      }));
      toast.success('Comment deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    } finally {
      setDeletingComment(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const handleReplyAdded = (postId) => {
    fetchComments(postId);
  };

  if (loading)
    return (
      <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('piano-background.jpg')" }}>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center">
          <p className="text-white text-xl">Loading collaboration hub...</p>
        </div>
      </div>
    );

  if (user && user.role !== 'artist' && user.role !== 'admin') {
    return (
      <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('piano-background.jpg')" }}>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-6">Musician Collaboration Hub</h1>
          <div className="bg-red-500 text-white p-4 rounded-md mb-6">
            This feature is only available to artists. Please upgrade your account to access the collaboration hub.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('piano-background.jpg')" }}>
      <Navbar />
      <div className="flex-1 p-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">Musician Collaboration Hub</h1>

          {message && (
            <div className="bg-green-500 text-white p-4 rounded-md mb-6">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-500 text-white p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Create Post Form */}
          <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl mb-8 border border-white/30 text-white">
            <h2 className="text-2xl font-semibold mb-6">Create a Collaboration Post</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label htmlFor="title" className="block mb-2 font-medium">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newPost.title}
                  onChange={handleInputChange}
                  placeholder="E.g., Looking for a drummer for weekend jam sessions"
                  className="w-full p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 border-white/30"
                />
              </div>
              <div>
                <label htmlFor="description" className="block mb-2 font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newPost.description}
                  onChange={handleInputChange}
                  placeholder="Describe what you're looking for, your experience, etc."
                  rows="4"
                  className="w-full p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 border-white/30"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="genre" className="block mb-2 font-medium">
                    Genre
                  </label>
                  <input
                    type="text"
                    id="genre"
                    name="genre"
                    value={newPost.genre}
                    onChange={handleInputChange}
                    placeholder="E.g., Rock, Jazz, Hip-Hop"
                    className="w-full p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 border-white/30"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block mb-2 font-medium">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={newPost.location}
                    onChange={handleInputChange}
                    placeholder="E.g., New York, Remote"
                    className="w-full p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 border-white/30"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Post Collaboration
              </button>
            </form>
          </div>

          {/* Posts List */}
          <div className="space-y-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post._id} className="bg-black/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/30 text-white">
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold">{post.title}</h3>
                        <div className="flex justify-between items-center text-sm text-white/60 mt-1">
                          <span>Posted by {post.author.name}</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.genre && (
                        <span className="px-3 py-1 bg-purple-800/60 rounded-full text-sm">
                          {post.genre}
                        </span>
                      )}
                      {post.location && (
                        <span className="px-3 py-1 bg-blue-800/60 rounded-full text-sm">
                          {post.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mb-4">{post.description}</p>

                  {/* Like/Dislike buttons for post */}
                  <div className="mb-4 pb-4 border-b border-white/20">
                    <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
                      <LikeDislikeButton
                        targetId={post._id}
                        targetType="post"
                        initialLikes={post.likes?.length || 0}
                        initialDislikes={post.dislikes?.length || 0}
                        userLiked={post.likes?.some(id => id?.toString() === user?._id) || false}
                        userDisliked={post.dislikes?.some(id => id?.toString() === user?._id) || false}
                      />
                      {user?.role === 'admin' && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => toggleReactionDetails(post._id)}
                            className="bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-2 rounded-md border border-white/20"
                          >
                            {showReactionDetails[post._id] ? 'Hide reaction details' : 'Show reaction details'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post._id)}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded-md"
                          >
                            Delete Post
                          </button>
                        </div>
                      )}
                    </div>
                    {user?.role === 'admin' && showReactionDetails[post._id] && (
                      <div className="bg-white/10 p-4 rounded-xl mt-4 text-sm text-white/90 space-y-2">
                        <div>
                          <span className="font-semibold text-white">Liked by:</span>{' '}
                          {post.likes?.length ? post.likes.map(u => u?.name || 'Unknown').join(', ') : 'None'}
                        </div>
                        <div>
                          <span className="font-semibold text-white">Disliked by:</span>{' '}
                          {post.dislikes?.length ? post.dislikes.map(u => u?.name || 'Unknown').join(', ') : 'None'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Comments section */}
                  <div className="mt-6 pt-4 border-t border-white/20">
                    <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleComments(post._id);
                        }}
                        className="text-blue-400 hover:text-blue-300 font-medium"
                      >
                        {openComments[post._id]
                          ? `▼ Hide Comments [${commentCounts[post._id] ?? 0}]`
                          : `▶ Show Comments [${commentCounts[post._id] ?? 0}]`}
                      </button>
                      <span className="text-white/60 text-sm">
                        {commentCounts[post._id] ?? 0} comment{(commentCounts[post._id] ?? 0) === 1 ? '' : 's'}
                      </span>
                    </div>

                    {/* Add comment form always visible */}
                    <div className="mb-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newComment[post._id] || ''}
                          onChange={(e) => handleCommentChange(post._id, e.target.value)}
                          placeholder="Add a comment... (Use @username to mention)"
                          className="flex-grow p-2 border rounded-md text-base bg-white/10 text-white placeholder-white/60 border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(post._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                        >
                          Comment
                        </button>
                      </div>
                      {showMentions[post._id] && (
                        <div className="mt-2 bg-white/20 rounded-lg p-2 text-sm text-white/80">
                          Tip: Use @username to mention someone. For example: @JohnDoe
                        </div>
                      )}
                    </div>

                    {openComments[post._id] && (
                      <div className="space-y-4">
                        {commentsLoading[post._id] ? (
                          <div className="text-white/70">Loading comments...</div>
                        ) : Array.isArray(comments[post._id]) && comments[post._id].length > 0 ? (
                          comments[post._id].map((comment) => {
                            const authorName = comment?.author?.name || comment?.authorName || 'Unknown';
                            const canDeleteComment = user?.role === 'admin' || comment?.author?._id?.toString() === user?._id || post.author?._id?.toString() === user?._id;
                            return (
                              <div key={comment._id} className="bg-white/10 p-4 rounded-lg">
                                <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                                  <span className="text-blue-400 font-medium">{authorName}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-white/40 text-xs">
                                      {new Date(comment?.createdAt || Date.now()).toLocaleDateString()}
                                    </span>
                                    {canDeleteComment && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteComment(comment._id, post._id)}
                                        disabled={deletingComment[comment._id]}
                                        className="text-red-400 hover:text-red-300 text-xs"
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="mb-3 text-white/90">{comment?.content ?? 'No content'}</p>

                                {/* Like/Dislike for comment */}
                                <div className="mb-3 pb-3 border-b border-white/20">
                                  <LikeDislikeButton
                                    targetId={comment._id}
                                    targetType="comment"
                                    initialLikes={comment.likes?.length || 0}
                                    initialDislikes={comment.dislikes?.length || 0}
                                    userLiked={comment.likes?.some(id => id?.toString() === user?._id) || false}
                                    userDisliked={comment.dislikes?.some(id => id?.toString() === user?._id) || false}
                                  />
                                </div>

                                {/* Replies Section */}
                                <ReplySection
                                  commentId={comment._id}
                                  replies={comment.replies || []}
                                  onReplyAdded={() => handleReplyAdded(post._id)}
                                  onReplyDeleted={() => handleReplyAdded(post._id)}
                                  currentUserId={user?._id}
                                  userRole={user?.role}
                                />
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-white/60">No comments yet. Be the first to comment!</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/30 text-white text-center">
                <p>No collaboration posts yet. Be the first to create one!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationHub;
