import React, { useState } from 'react';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import api from '../api/axios';
import { toast } from 'react-toastify';

const LikeDislikeButton = ({ targetId, targetType, commentId, initialLikes = 0, initialDislikes = 0, userLiked = false, userDisliked = false, onUpdate }) => {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [isLiked, setIsLiked] = useState(userLiked);
  const [isDisliked, setIsDisliked] = useState(userDisliked);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (targetType === 'post') {
        endpoint = `/collaboration/posts/${targetId}/like`;
      } else if (targetType === 'comment') {
        endpoint = `/collaboration/comments/${targetId}/like`;
      } else if (targetType === 'reply') {
        endpoint = `/collaboration/comments/${commentId}/replies/${targetId}/like`;
      }

      const response = await api.post(endpoint);
      if (response.data.success) {
        setLikes(response.data.likes);
        setDislikes(response.data.dislikes);
        setIsLiked(response.data.liked);
        setIsDisliked(false);
        if (onUpdate) onUpdate({ likes: response.data.likes, dislikes: response.data.dislikes });
      }
    } catch (error) {
      console.error('Error liking:', error);
      toast.error('Failed to like');
    } finally {
      setLoading(false);
    }
  };

  const handleDislike = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (targetType === 'post') {
        endpoint = `/collaboration/posts/${targetId}/dislike`;
      } else if (targetType === 'comment') {
        endpoint = `/collaboration/comments/${targetId}/dislike`;
      } else if (targetType === 'reply') {
        endpoint = `/collaboration/comments/${commentId}/replies/${targetId}/dislike`;
      }

      const response = await api.post(endpoint);
      if (response.data.success) {
        setLikes(response.data.likes);
        setDislikes(response.data.dislikes);
        setIsDisliked(response.data.disliked);
        setIsLiked(false);
        if (onUpdate) onUpdate({ likes: response.data.likes, dislikes: response.data.dislikes });
      }
    } catch (error) {
      console.error('Error disliking:', error);
      toast.error('Failed to dislike');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={handleLike}
        disabled={loading}
        className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all ${
          isLiked
            ? 'bg-blue-500/30 text-blue-400 border border-blue-500'
            : 'bg-white/10 text-white hover:bg-white/20 border border-white/30'
        }`}
      >
        <FaThumbsUp size={14} />
        <span className="text-sm font-medium">{likes}</span>
      </button>
      <button
        onClick={handleDislike}
        disabled={loading}
        className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all ${
          isDisliked
            ? 'bg-red-500/30 text-red-400 border border-red-500'
            : 'bg-white/10 text-white hover:bg-white/20 border border-white/30'
        }`}
      >
        <FaThumbsDown size={14} />
        <span className="text-sm font-medium">{dislikes}</span>
      </button>
    </div>
  );
};

export default LikeDislikeButton;
