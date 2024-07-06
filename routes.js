const express = require('express');
const { protect } = require('./middleware/authMiddleware');
const {
  registerUser,
  authUser,
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  createComment,
  getComments,
  replyComment,
  upload
} = require('./controllers/appController');

const router = express.Router();

// Auth routes
router.post('/api/auth/register', upload.single('profileImage'), registerUser);
router.post('/api/auth/login', authUser);

// Blog routes
router.route('/api/blogs')
  .post(protect, upload.single('image'), createBlog)
  .get(getBlogs);

router.route('/api/blogs/:id')
  .get(getBlogById)
  .put(protect, upload.single('image'), updateBlog)
  .delete(protect, deleteBlog);

// Comment routes
router.route('/api/comments/:blogId')
  .post(protect, createComment)
  .get(getComments);

router.route('/api/comments/reply/:commentId')
  .post(protect, replyComment);

module.exports = router;
