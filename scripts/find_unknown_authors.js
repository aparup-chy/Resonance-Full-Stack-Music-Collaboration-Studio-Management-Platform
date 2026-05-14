import mongoose from 'mongoose';

const uri = 'mongodb+srv://mustafisahsan:j555tbnoSMULNbVR@cluster0.jt1txjq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const commentSchema = new mongoose.Schema({
  content: String,
  author: mongoose.Schema.Types.ObjectId,
  authorName: String,
  postType: String,
  post: mongoose.Schema.Types.ObjectId,
}, { strict: false });

const userSchema = new mongoose.Schema({
  name: String,
}, { strict: false });

const Comment = mongoose.model('Comment', commentSchema, 'comments');
const User = mongoose.model('User', userSchema, 'users');

const run = async () => {
  try {
    await mongoose.connect(uri);
    const comments = await Comment.find({
      $or: [
        { authorName: { $exists: false } },
        { authorName: '' },
        { authorName: 'Unknown' }
      ]
    }).limit(100);
    console.log('comments count', comments.length);
    for (const c of comments) {
      const user = c.author ? await User.findById(c.author).select('name') : null;
      console.log(JSON.stringify({
        id: c._id,
        content: c.content,
        author: c.author,
        authorName: c.authorName,
        resolvedName: user?.name || null
      }, null, 2));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
