import React, { useState } from 'react';
import { FaReply, FaTrash } from 'react-icons/fa';
import api from '../api/axios';
import { toast } from 'react-toastify';
import LikeDislikeButton from './LikeDislikeButton';

const ReplySection = ({ commentId, replies = [], onReplyAdded, onReplyDeleted, currentUserId, userRole }) => {
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingReplyId, setDeletingReplyId] = useState(null);

  const handleAddReply = async () => {
    if (!replyText.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/collaboration/comments/${commentId}/replies`, {
        content: replyText
      });

      if (response.data.success) {
        setReplyText('');
        toast.success('Reply added successfully');
        if (onReplyAdded) onReplyAdded();
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Delete this reply?')) {
      return;
    }

    setDeletingReplyId(replyId);
    try {
      const response = await api.delete(`/collaboration/comments/${commentId}/replies/${replyId}`);
      if (response.data.success) {
        toast.success('Reply deleted successfully');
        if (onReplyDeleted) onReplyDeleted();
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Failed to delete reply');
    } finally {
      setDeletingReplyId(null);
    }
  };

  return (
    <div className="mt-3">
      {/* Reply Input */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Add a reply..."
          className="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button
          onClick={handleAddReply}
          disabled={loading || !replyText.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
        >
          <FaReply size={12} />
          Reply
        </button>
      </div>

      {/* Replies Toggle */}
      {replies.length > 0 && (
        <div className="space-y-2 mt-2 ml-4 border-l-2 border-white/20 pl-3">
          {replies.map((reply) => (
            <div key={reply._id} className="bg-white/5 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2 gap-2">
                <span className="text-blue-400 font-medium text-sm">{reply.author?.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-xs">
                    {new Date(reply.createdAt).toLocaleDateString()}
                  </span>
                  {(userRole === 'admin' || currentUserId === reply.author?._id) && (
                    <button
                      onClick={() => handleDeleteReply(reply._id)}
                      disabled={deletingReplyId === reply._id}
                      className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                    >
                      <FaTrash size={12} /> Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="text-white/80 text-sm mb-2">{reply.content}</p>
              <LikeDislikeButton
                targetId={reply._id}
                targetType="reply"
                commentId={commentId}
                initialLikes={reply.likes?.length || 0}
                initialDislikes={reply.dislikes?.length || 0}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReplySection;
