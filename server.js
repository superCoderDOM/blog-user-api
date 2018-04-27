// Server depedencies
const express   = require('express'),
      app       = express(),
      PORT      = process.env.PORT || 8080;
const moment = require('moment');

// Middleware registration
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Connect to mySQL database via knex
const knex = require('knex')({
  client: 'mysql',
  connection: {
    host     : '127.0.0.1',
    user     : 'iversoftuser',
    password : 'iversoft',
    database : 'iversoft-test_db',
    charset  : 'utf8'
  }
});

// Connect bookshelf to knex
const bookshelf = require('bookshelf')(knex);

// Define Models and table relationships
const BlogPost = bookshelf.Model.extend({
  tableName: 'blog_posts',
  author: function() {
    return this.belongsTo(User, 'author');
  },
});
const UserAddress = bookshelf.Model.extend({
  tableName: 'user_addresses',
  user_id: function() {
    return this.belongsTo(User, 'id');
  },
});
const UserRole = bookshelf.Model.extend({
  tableName: 'user_roles',
  user: function() {
    return this.hasMany(User, user_roles_id)
  },
});
const User = bookshelf.Model.extend({
  tableName: 'users',
  userBlogPosts: function() {
    return this.hasMany(BlogPost, 'author');
  },
  userAddress: function() {
    return this.hasOne(UserAddress);
  },
  userRole: function() {
    return this.belongsTo(UserRole, 'user_roles_id');
  },
});

/*=======================
    START HTTP SERVER
=======================*/

// Start HTTP server
app.listen(PORT, ()=>{
  console.log(`Server listening on Port ${PORT}\nUse Ctrl-C to exit`);
});

/*=======================================
    RETRIEVE USER DATA QUERY ENDPOINTS
=========================================
+-----------------------------------------------------------------------+
  Endpoint: '/users'
  Function: List all users, including:
    the name of their role,
    their address, and 
    how many blog posts they have.
  Params: Optionally pass in a user id to list specific user’s details
    userID: url query parameter 'String'
+----------------------------------------------------------------------*/

// List ALL data related to ONE user
app.get('/users', (req, res) => {
  console.log(req.query, req.query.length);
  let userID = req.query.userID;

  // if url query parameter userID exists and is a number
  if (userID) {
    if (isNaN(parseInt(userID))) {
      // Specified userID is invalid
      return res.status(400).json({msg: 'Specified userID is not a number'});

    } else {
      // Specified userID is valid
      // Fetch data for specified user
      User.forge({id: userID})
      .fetch({
        withRelated: ['userAddress', 'userRole', 'userBlogPosts']
      })
      .then(user => {
        if (user) {
          // Fetched object is not empty
          user = user.toJSON();
          queryResult = {
            id: user.id,
            username: user.username,
            email: user.email,
            address: {
              address: user.userAddress.address,
              city: user.userAddress.city,
              province: user.userAddress.province,
              postal_code: user.userAddress.postal_code,
              country: user.userAddress.country,
            },
            role: user.userRole.label,
            posts: user.userBlogPosts.length,
          };
          return res.status(200).json(queryResult);
        } else {
          // Fetched object is empty
          return res.status(204).json({msg: 'User ID provided does not exist'});
        }
      })
      .catch(error => {
        console.error(error);
        return res.status(500).json(error);
      });
    }

  } else if (Object.keys(req.query).length > 0) {
    // No userID specified BUT another parameter is present
    return res.status(400).json({msg: 'The url query parameter specified is invalid'});

  } else {
    // No userID specified
    // Fetch data related to EVERY users
    User.fetchAll({
      withRelated: ['userAddress', 'userRole', 'userBlogPosts']
    })
    .then(users => {
      if (users.length > 0) {
        // Fetched object is not empty
        users = users.toJSON();
        queryResult = users.map(user => {
          return {
            id: user.id,
            username: user.username,
            email: user.email,
            address: {
              address: user.userAddress.address,
              city: user.userAddress.city,
              province: user.userAddress.province,
              postal_code: user.userAddress.postal_code,
              country: user.userAddress.country,
            },
            role: user.userRole.label,
            posts: user.userBlogPosts.length,
          };
        });
        return res.status(200).json(queryResult);
      } else {
        // Fetched object is empty
        return res.status(204).json({msg: 'Weirdly enough, all users have disappeared!'});
      }
    })
    .catch(error => {
      console.error(error);
      return res.status(500).json(error);
    });
  }
});

/*=========================================
    RETRIEVE BLOG POSTS QUERY ENDPOINTS
===========================================
+-----------------------------------------------------------------------+
  Endpoint: '/blog_posts'
  Function: List all blog posts
  Params:
    Optionally pass in a user id to list a single user’s blog posts
      userID: url query parameter 'String'
    Optionally pass in a blog post id to get just that post
      blogID: url query parameter 'String'
+----------------------------------------------------------------------*/

// List single blog post
app.get('/blog_posts', (req, res) => {

  let userID = req.query.userID;
  let blogID = req.query.blogID;

  if (blogID) {
    // Only a blogID is specified
    if (isNaN(parseInt(blogID))) {
      // Specified blogID is invalid
      return res.status(400).json({msg: 'Specified blogID is not a number'});

    } else {
      // Specified blogID is valid
      // Fetch single blog post
      BlogPost.where({'id': blogID}).fetch()
      .then(blogPost => {
        if(blogPost && Object.keys(req.query).length === 1) {
           // Fetched object is not empty
           blogPost = blogPost.attributes;
          return res.status(200).json([blogPost]); // blog entry sent as array to match other endpoints
        } else {
          // Fetched object is empty
          return res.status(400).json({msg: 'Blog ID provided does not exist'});
        }
      })
      .catch(error => {
        console.error(error);
        return res.status(500).json(error);
      });
    }

  } else if (userID && Object.keys(req.query).length === 1) {
    // Only a userID is specified
    if (isNaN(parseInt(userID))) {
      // Specified userID is invalid
      return res.status(400).json({msg: 'Specified userID is not a number'});

    } else {
      // Specified userID is valid
      // List all blog posts authored by specific user posts
      BlogPost.where({'author': userID}).fetchAll()
      .then(blogPosts => {
        if (blogPosts.length > 0) {
          console.log(blogPosts);
          // Fetched object is not empty
          blogPosts = blogPosts.models.map(blogPost => blogPost.attributes);
          return res.status(200).json(blogPosts);
        } else {
          // Fetched object is empty
          return res.status(204).json({msg: 'User ID provided does not have any blog posts'});
        }
      })
      .catch(error => {
        console.error(error);
        return res.status(500).json(error);
      });
    }

  } else if (Object.keys(req.query).length > 0) {
    // No blogID or userID specified BUT another parameter is present
    // OR multiple parameters are present
    return res.status(400).json({msg: 'The url query parameter specified is invalid'});

  } else {
    // No blogID or userID specified
    // List all blog posts
    BlogPost.fetchAll()
    .then(blogPosts => {
      if (blogPosts.length > 0) {
          // Fetched object is not empty
        blogPosts = blogPosts.models.map(blogPost => blogPost.attributes);
        return res.status(200).json(blogPosts);
      } else {
          // Fetched object is empty
          return res.status(204).json({msg: 'Weirdly enough, we could not find any blog posts!'});
      }
    })
    .catch(error => {
      console.error(error);
      return res.status(500).json(error);
    });
  }
});

/*============================================
    CREATE NEW BLOG POST RECORDS ENDPOINTS
===============================================
+------------------------------------------------------------------------------+
    Endpoint: '/create_blog_post'
    Function: Create a new blog post
    Params: urlencoded/JSON request body {Object} with following key pairs
      author: Integer
      title: 'String'
      content: 'String'
    * 'id' field for new entry handled automatically by database
    * 'created_at' AND 'updated_at' fields handled automatically by this API
+-----------------------------------------------------------------------------*/

app.post('/create_blog_post', (req, res) => {
  
  let newBlogPost = req.body;
  
  // Blog data validation
  if (newBlogPost) {
    if (newBlogPost.author && !isNaN(parseInt(newBlogPost.author))) {
      if (newBlogPost.title && newBlogPost.title.length <= 255) {
        if (newBlogPost.content) {

          // If all data provided is valid, set timestamps
          newBlogPost.created_at = `${moment().format('YYYY-MM-DD HH:mm:ss')}`;
          newBlogPost.updated_at = `${moment().format('YYYY-MM-DD HH:mm:ss')}`;
        
          // Create new record
          new BlogPost(newBlogPost).save()
          .then(newBlogPostRecord => {
            return res.status(200).json(newBlogPostRecord.attributes);
          })
          .catch(error => {
            console.error(error);
            return res.status(500).json(error);
          });
        } else {
          // Blog content field is missing
          return res.status(400).json({msg: 'Blog Post Content is empty'});
        }
      } else {
        // Blog title field is invalid
        return res.status(400).json({msg: 'Blog Post Title either missing or longer than 255 characters'});
      }
    } else {
      // Author ID provided as parameter is invalid
      return res.status(400).json({msg: 'Blog Post Author ID is either missing or not a number'});
    }
  } else {
    // Request body attribute object required to create new post is missing
    return res.status(400).json({msg: 'newBlogPost Object is missing'});
  }
});

/*=========================================
    UPDATE USER DATA REQUESTS ENDPOINTS
===========================================
+-----------------------------------------------------------------+
  Endpoint: '/edit_user/:userID'
  Function: Update user details, including their role and address
  Params: urlencoded/JSON request body {Object} with following key pairs
      userID: Int
      user: {Object}
        user_roles_id: Integer,
        username: 'String',
        email: 'String',
      address: {Object}
        address: 'String',
        city: 'String',
        province: 'String',
        postal_code: 'String',
        country: 'String',
+-----------------------------------------------------------------*/

app.put('/edit_user', (req, res) => {

  // RegEx used in type='email' from W3C 
  const emailTemplate = new RegExp('^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$');

  // Data validation
  if (req.body) {

    // Assign empty objects if user or address parameters are missing
    let userID = req.body.userID;
    let userUpdate = req.body.user || {};
    let addressUpdate = req.body.address || {};

    // Validate userID
    if (!isNaN(parseInt(userID))) {
      // Validate user object content
      if (userUpdate.user_roles_id && isNaN(parseInt(userUpdate.user_roles_id))) {
        // User role ID provided as parameter is invalid
        return res.status(400).json({msg: 'User Role ID provided is not a number'});

      } else if (userUpdate.username && userUpdate.username.length > 255) {
        // Username provided as parameter is too long
        return res.status(400).json({msg: 'Username provided is over 255 characters'});

      } else if (userUpdate.email && 
          userUpdate.email.length > 255 && 
          emailTemplate.test(userUpdate.email)) {
        // Email provided as parameter is invalid
        return res.status(400).json({msg: 'email provided is too long or of improper format'});

      } else if (addressUpdate.address && addressUpdate.address.length > 255) {
        // Address provided as parameter is too long
        return res.status(400).json({msg: 'Street Address provided is over 255 characters'});

      } else if (addressUpdate.city && addressUpdate.city.length > 255) {
        // City provided as parameter is too long
        return res.status(400).json({msg: 'City name provided is over 255 characters'});

      } else if (addressUpdate.province && addressUpdate.province.length > 255) {
        // Province provided as parameter is too long
        return res.status(400).json({msg: 'Province name provided is over 255 characters'});

      } else if (addressUpdate.postal_code && addressUpdate.postal_code.length > 255) {
        // Postal code provided as parameter is too long
        return res.status(400).json({msg: 'Postal Code provided is over 255 characters'});

      } else if (addressUpdate.country && addressUpdate.country.length > 255) {
        // Country provided as parameter is too long
        return res.status(400).json({msg: 'Country name provided is over 255 characters'});

      } else {
        // All data contained in the update objects is valid
        // Update user information using a transaction to provide rollback capabilities
        bookshelf.transaction(function(updateUser) {
          return User.forge({id: userID})
          .save(userUpdate, {
            transacting: updateUser,
            method: 'update', 
            patch: true
          })
          .then(user => {
            return UserAddress.where({'user_id': userID})
            .save(addressUpdate, {
              transacting: updateUser,
              method: 'update', 
              patch: true
            })
            .then(newAddress => {
              updatedUser = user.attributes;
              updatedUser.address = newAddress.attributes;
              return res.status(200).json(updatedUser);
            })
          })
        })
        .catch(error => {
          console.error(error);
          return res.status(500).json(error);
        });
      }
    } else {
      // User ID provided as request parameter is invalid
      return res.status(400).json({msg: 'User ID provided is not an integer'});
    }
  } else {
    // Request body attribute object required for update is missing
    return res.status(400).json({msg: 'Request body object is missing'});
  }
});