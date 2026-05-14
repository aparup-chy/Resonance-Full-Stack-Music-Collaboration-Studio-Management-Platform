import mongoose from 'mongoose';
import CollaborationPost from '../models/collaborationPost.js';
import Comment from '../models/comment.js';
import User from '../models/user.js';

// Get all collaboration posts
export const getPosts = async (req, res) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get filter parameters
    const { genre, location, search } = req.query;
    
    // Build filter
    const filter = {};
    
    if (genre) {
      filter.genre = { $regex: genre, $options: 'i' };
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Find posts with filters, sort by newest first
    const posts = await CollaborationPost.find(filter)
      .populate('author', 'name')
      .populate('likes', 'name')
      .populate('dislikes', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const postIds = posts.map(post => post._id);
    const commentCounts = await Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$post', count: { $sum: 1 } } }
    ]);

    const commentCountMap = commentCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    const postsWithCounts = posts.map(post => ({
      ...post.toObject(),
      commentCount: commentCountMap[post._id.toString()] || 0,
    }));
    
    // Get total count for pagination
    const totalPosts = await CollaborationPost.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      posts: postsWithCounts
    });
  } catch (error) {
    console.error('Error fetching collaboration posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collaboration posts',
      error: error.message
    });
  }
};
// Create a new collaboration post
export const createPost = async (req, res) => {
    try {
      const { title, description, genre, location } = req.body;
      const userId = req.user.userId;
      
      // Validate required fields
      if (!title || !description) {
        return res.status(400).json({
          success: false,
          message: 'Title and description are required'
        });
      }
      
      // Create new post
      const newPost = new CollaborationPost({
        title,
        description,
        genre: genre || '',
        location: location || '',
        author: userId
      });
      
      await newPost.save();
      
      // Populate author info before sending response
      await newPost.populate('author', 'name');
      
      res.status(201).json({
        success: true,
        message: 'Collaboration post created successfully',
        post: newPost
      });
    } catch (error) {
      console.error('Error creating collaboration post:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create collaboration post',
        error: error.message
      });
    }
  };
  
  // Get a specific post by ID
  export const getPostById = async (req, res) => {
    try {
      const { postId } = req.params;
      
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid post ID format'
        });
      }
      
      // Find post and populate author info
      const post = await CollaborationPost.findById(postId)
        .populate('author', 'name email');
      
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Collaboration post not found'
        });
      }
      
      res.status(200).json({
        success: true,
        post
      });
    } catch (error) {
      console.error('Error fetching collaboration post:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch collaboration post',
        error: error.message
      });
    }
  };
  
  // Update a post
  export const updatePost = async (req, res) => {
    try {
      const { postId } = req.params;
      const { title, description, genre, location } = req.body;
      const userId = req.user.userId;
      
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid post ID format'
        });
      }
      
      // Find post
      const post = await CollaborationPost.findById(postId);
      
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Collaboration post not found'
        });
      }
      
      // Check if user is the author
      if (post.author.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to update this post'
        });
      }
      
      // Update post fields
      post.title = title || post.title;
      post.description = description || post.description;
      post.genre = genre !== undefined ? genre : post.genre;
      post.location = location !== undefined ? location : post.location;
      post.updatedAt = Date.now();
      
      await post.save();
      
      res.status(200).json({
        success: true,
        message: 'Collaboration post updated successfully',
        post
      });
    } catch (error) {
      console.error('Error updating collaboration post:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update collaboration post',
        error: error.message
      });
    }
  };
  
  // Delete a post
  export const deletePost = async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role;
      
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid post ID format'
        });
      }
      
      // Find post
      const post = await CollaborationPost.findById(postId);
      
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Collaboration post not found'
        });
      }
      
      // Check if user is the author or an admin
      if (post.author.toString() !== userId && userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete this post'
        });
      }
      
      // Delete all comments associated with this post
      await Comment.deleteMany({ post: postId });
      
      // Delete the post
      await post.deleteOne();
      
      res.status(200).json({
        success: true,
        message: 'Collaboration post deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting collaboration post:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete collaboration post',
        error: error.message
      });
    }
  };
  
  // Get comments for a post
  export const getComments = async (req, res) => {
    try {
      const { postId } = req.params;
      
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid post ID format'
        });
      }
      
      // Check if post exists
      const postExists = await CollaborationPost.exists({ _id: postId });
      
      if (!postExists) {
        return res.status(404).json({
          success: false,
          message: 'Collaboration post not found'
        });
      }
      
      // Get comments for the post
      const comments = await Comment.find({ post: postId })
        .populate('author', 'name')
        .populate('replies.author', 'name')
        .sort({ createdAt: 1 });
      
      const commentsWithAuthor = await Promise.all(comments.map(async comment => {
        const commentObj = comment.toObject();
        let authorName = commentObj.author?.name || commentObj.authorName;

        if (!authorName && commentObj.author) {
          const user = await User.findById(commentObj.author).select('name');
          authorName = user?.name || 'Unknown';
        }

        return {
          ...commentObj,
          authorName: authorName || 'Unknown',
        };
      }));
      
      res.status(200).json({
        success: true,
        comments: commentsWithAuthor
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch comments',
        error: error.message
      });
    }
  };
  
  // Add a comment to a post
  export const addComment = async (req, res) => {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const userId = req.user.userId;
      
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid post ID format'
        });
      }
      
      // Check if content is provided
      if (!content || content.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Comment content is required'
        });
      }
      
      // Check if post exists
      const post = await CollaborationPost.findById(postId);
      
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Collaboration post not found'
        });
      }
      
      // Create new comment
      const user = await User.findById(userId).select('name');
      const newComment = new Comment({
        content,
        author: userId,
        authorName: user?.name || 'Unknown',
        post: postId
      });
      
      await newComment.save();
      await newComment.populate('author', 'name');
      
      const commentResponse = {
        ...newComment.toObject(),
        authorName: newComment.author?.name || newComment.authorName || 'Unknown',
      };
      
      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        comment: commentResponse
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add comment',
        error: error.message
      });
    }
  };
  
  // Delete a comment
  export const deleteComment = async (req, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role;
      
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid comment ID format'
        });
      }
      
      // Find comment
      const comment = await Comment.findById(commentId);
      
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }
      
      // Check if user is the author of the comment, the author of the post, or an admin
      const isCommentAuthor = comment.author.toString() === userId;
      let isPostAuthor = false;
      
      if (!isCommentAuthor) {
        const post = await CollaborationPost.findById(comment.post);
        isPostAuthor = post && post.author.toString() === userId;
      }
      
      if (!isCommentAuthor && !isPostAuthor && userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete this comment'
        });
      }
      
      // Delete the comment
      await comment.deleteOne();
      
      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete comment',
        error: error.message
      });
    }
  };

export const deleteReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(commentId) || !mongoose.Types.ObjectId.isValid(replyId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    const replyAuthorId = reply.author?._id?.toString() || reply.author?.toString();
    const commentAuthorId = comment.author?._id?.toString() || comment.author?.toString();
    const isReplyAuthor = replyAuthorId === userId;
    const isCommentAuthor = commentAuthorId === userId;

    if (!isReplyAuthor && !isCommentAuthor && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this reply' });
    }

    comment.replies = comment.replies.filter((r) => r._id.toString() !== replyId);
    await comment.save();

    res.status(200).json({ success: true, message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ success: false, message: 'Failed to delete reply', error: error.message });
  }
};

export const likeReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(commentId) || !mongoose.Types.ObjectId.isValid(replyId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    const userIdStr = userId.toString();
    const hasLiked = reply.likes.some(id => id.toString() === userIdStr);
    const hasDisliked = reply.dislikes.some(id => id.toString() === userIdStr);

    if (hasLiked) {
      reply.likes = reply.likes.filter(id => id.toString() !== userIdStr);
    } else {
      reply.likes.push(userId);
      if (hasDisliked) {
        reply.dislikes = reply.dislikes.filter(id => id.toString() !== userIdStr);
      }
    }

    await comment.save();

    res.status(200).json({
      success: true,
      likes: reply.likes.length,
      dislikes: reply.dislikes.length,
      liked: !hasLiked
    });
  } catch (error) {
    console.error('Error liking reply:', error);
    res.status(500).json({ success: false, message: 'Failed to like reply' });
  }
};

export const dislikeReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(commentId) || !mongoose.Types.ObjectId.isValid(replyId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    const userIdStr = userId.toString();
    const hasLiked = reply.likes.some(id => id.toString() === userIdStr);
    const hasDisliked = reply.dislikes.some(id => id.toString() === userIdStr);

    if (hasDisliked) {
      reply.dislikes = reply.dislikes.filter(id => id.toString() !== userIdStr);
    } else {
      reply.dislikes.push(userId);
      if (hasLiked) {
        reply.likes = reply.likes.filter(id => id.toString() !== userIdStr);
      }
    }

    await comment.save();

    res.status(200).json({
      success: true,
      likes: reply.likes.length,
      dislikes: reply.dislikes.length,
      disliked: !hasDisliked
    });
  } catch (error) {
    console.error('Error disliking reply:', error);
    res.status(500).json({ success: false, message: 'Failed to dislike reply' });
  }
};

// Like a post
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ success: false, message: 'Invalid post ID' });
    }

    const post = await CollaborationPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userIdStr = userId.toString();
    const hasLiked = post.likes.some(id => id.toString() === userIdStr);
    const hasDisliked = post.dislikes.some(id => id.toString() === userIdStr);

    if (hasLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userIdStr);
    } else {
      post.likes.push(userId);
      if (hasDisliked) {
        post.dislikes = post.dislikes.filter(id => id.toString() !== userIdStr);
      }
    }

    await post.save();

    res.status(200).json({
      success: true,
      likes: post.likes.length,
      dislikes: post.dislikes.length,
      liked: !hasLiked
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ success: false, message: 'Failed to like post' });
  }
};

// Dislike a post
export const dislikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ success: false, message: 'Invalid post ID' });
    }

    const post = await CollaborationPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userIdStr = userId.toString();
    const hasLiked = post.likes.some(id => id.toString() === userIdStr);
    const hasDisliked = post.dislikes.some(id => id.toString() === userIdStr);

    if (hasDisliked) {
      post.dislikes = post.dislikes.filter(id => id.toString() !== userIdStr);
    } else {
      post.dislikes.push(userId);
      if (hasLiked) {
        post.likes = post.likes.filter(id => id.toString() !== userIdStr);
      }
    }

    await post.save();

    res.status(200).json({
      success: true,
      likes: post.likes.length,
      dislikes: post.dislikes.length,
      disliked: !hasDisliked
    });
  } catch (error) {
    console.error('Error disliking post:', error);
    res.status(500).json({ success: false, message: 'Failed to dislike post' });
  }
};

// Like a comment
export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ success: false, message: 'Invalid comment ID' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const userIdStr = userId.toString();
    const hasLiked = comment.likes.some(id => id.toString() === userIdStr);
    const hasDisliked = comment.dislikes.some(id => id.toString() === userIdStr);

    if (hasLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== userIdStr);
    } else {
      comment.likes.push(userId);
      if (hasDisliked) {
        comment.dislikes = comment.dislikes.filter(id => id.toString() !== userIdStr);
      }
    }

    await comment.save();

    res.status(200).json({
      success: true,
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
      liked: !hasLiked
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ success: false, message: 'Failed to like comment' });
  }
};

// Dislike a comment
export const dislikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ success: false, message: 'Invalid comment ID' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const userIdStr = userId.toString();
    const hasLiked = comment.likes.some(id => id.toString() === userIdStr);
    const hasDisliked = comment.dislikes.some(id => id.toString() === userIdStr);

    if (hasDisliked) {
      comment.dislikes = comment.dislikes.filter(id => id.toString() !== userIdStr);
    } else {
      comment.dislikes.push(userId);
      if (hasLiked) {
        comment.likes = comment.likes.filter(id => id.toString() !== userIdStr);
      }
    }

    await comment.save();

    res.status(200).json({
      success: true,
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
      disliked: !hasDisliked
    });
  } catch (error) {
    console.error('Error disliking comment:', error);
    res.status(500).json({ success: false, message: 'Failed to dislike comment' });
  }
};

// Add a reply to a comment
export const addReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ success: false, message: 'Invalid comment ID' });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'Reply content is required' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const reply = {
      content,
      author: userId,
      mentions: [],
      likes: [],
      dislikes: []
    };

    comment.replies.push(reply);
    await comment.save();
    await comment.populate('replies.author', 'name');

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      reply: comment.replies[comment.replies.length - 1]
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ success: false, message: 'Failed to add reply' });
  }
};
  