const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const multer = require('multer');
const path = require('path');


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  };
  
  const registerUser = async (req, res) => {
    const { email, password } = req.body;
    const userExists = await User.findOne({ email });
  
    if (userExists) {
      return res.status(400).send('User already exists' );
    }
  
    const user = await User.create({
      email,
      password,
      profileImage: req.file ? req.file.path : null
    });
  
    if (user) {
      res.status(201).send({
        _id: user._id,
        email: user.email,
        profileImage: user.profileImage,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).send('Invalid user data' );
    }
  };
  
  const authUser = async (req, res) => {
    const { email, password } = req.body;
  
    const user = await User.findOne({ email });
  
    if (user && user.password === password) {
      res.json({
        _id: user._id,
        email: user.email,
        profileImage: user.profileImage,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).send('Invalid email or password' );
    }
  };

const createBlog = async (req, res) => {
  const { title, description } = req.body;
  const blog = new Blog({
    title,
    description,
    user: req.user._id,
    image: req.file ? req.file.path : null
  });

  const createdBlog = await blog.save();
  res.status(201).send(createdBlog);
};

const getBlogs = async (req, res) => {
  const blogs = await Blog.find({}).populate('user', 'email');
  res.status(200).send(blogs);
};

const getBlogById = async (req, res) => {
    const id = req.query.id;
  const blog = await Blog.findById(id).populate('user', 'email');
  if (blog) {
    res.status(200).send(blog);
  } else {
    res.status(404).send('Blog not found' );
  }
};

const updateBlog = async (req, res) => {
  const { title, description } = req.body;
  const id = req.query.id;
  const blog = await Blog.findById(id);

  if (blog) {
    blog.title = title || blog.title;
    blog.description = description || blog.description;
    blog.image = req.file ? req.file.path : blog.image;

    const updatedBlog = await blog.save();
    res.send(updatedBlog);
  } else {
    res.status(404).send('Blog not found' );
  }
};

const deleteBlog = async (req, res) => {
    const id = req.query.id;
  const blog = await Blog.findById(id);

  if (blog) {
    await blog.remove();
    res.send(blog);
  } else {
    res.status(404).send('Blog not found' );
  }
};

const createComment = async (req, res) => {
  const { content } = req.body;
  const comment = new Comment({
    content,
    user: req.user._id,
    blog: req.params.blogId
  });

  const createdComment = await comment.save();
  res.status(201).send(createdComment);
};

const getComments = async (req, res) => {
    const blogId = req.query.blogId;
  const comments = await Comment.find({ blog: blogId }).populate('user', 'email');
  res.status(200).send(comments);
};

const replyComment = async (req, res) => {
  const { content } = req.body;
  const commentId = req.query.commentId;
  const comment = await Comment.findById(commentId);

  if (comment) {
    const reply = {
      content,
      user: req.user._id
    };
    comment.replies.push(reply);
    await comment.save();
    res.status(201).send(comment);
  } else {
    res.status(404).send( 'Comment not found' );
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

module.exports = {
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
};
