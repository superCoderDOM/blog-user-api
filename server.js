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
    RETEIVE USER DATA QUERY ENDPOINTS
=========================================
+-----------------------------------------------------------------------+
  Endpoint: '/users'
  Function: List all users, including:
    the name of their role,
    their address, and 
    how many blog posts they have.
  Params: Optionally pass in a user id to list specific user’s details
    userID: url parameter string
+----------------------------------------------------------------------*/

// List ALL data related to ONE user
app.get('/users/:userID', (req, res) => {
  User.forge({id: req.params.userID})
  .fetch({
    withRelated: ['userAddress', 'userRole', 'userBlogPosts']
  })
  .then(user => {
    if (user) {
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
      return res.status(406).json({msg: 'User ID provided does not exist'});
    }
  })
  .catch(error => {
    console.error(error);
    return res.status(500).json(error);
  });
});

// List ALL data related to EVERY users
app.get('/users', (req, res) => {
  User.fetchAll({
    withRelated: ['userAddress', 'userRole', 'userBlogPosts']
  })
  .then(users => {
    if (users) {
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
      return res.status(406).json({msg: 'Weirdly enough, all users have disappeared!'});
    }
  })
  .catch(error => {
    console.error(error);
    return res.status(500).json(error);
  });
});

/*=========================================
    RETRIEVE BLOG POSTS QUERY ENDPOINTS
===========================================
+-----------------------------------------------------------------------+
  Endpoint: '/blog_posts'
  Function: List all blog posts
  Params:
    Optionally pass in a user id to list a single user’s blog posts
      userID: url parameter string
    Optionally pass in a blog post id to get just that post
      blogID: url parameter string
+----------------------------------------------------------------------*/

// List single blog post
app.get('/blog_posts/:blogID', (req, res) => {
  let blogID = 1; // = req.params.blogID;
  BlogPost.where({'id': blogID}).fetch()
  .then(blogPost => {
    if(blogPost) {
      blogPost = blogPost.attributes;
      return res.status(200).json([blogPost]); // blog entry sent as array to match other endpoints
    } else {
      return res.status(406).json({msg: 'Blog ID provided does not exist'});
    }
  })
  .catch(error => {
    console.error(error);
    return res.status(500).json(error);
  });
});

// List all blog posts authored by specific user posts OR single post
app.get('/blog_posts/:userID', (req, res) => {
  let userID = req.params.userID; 
  BlogPost.where({'author': userID}).fetchAll()
  .then(blogPosts => {
    if (blogPosts) {
      blogPosts = blogPosts.models.map(blogPost => blogPost.attributes);
      return res.status(200).json(blogPosts);
    } else {
      return res.status(406).json({msg: 'User ID provided does not exist'});
    }
  })
  .catch(error => {
    console.error(error);
    return res.status(500).json(error);
  });
});

// List all blog posts
app.get('/blog_posts', (req, res) => {
  BlogPost.fetchAll()
  .then(blogPosts => {
    if (blogPosts) {
      blogPosts = blogPosts.models.map(blogPost => blogPost.attributes);
      return res.status(200).json(blogPosts);
    } else {
      return res.status(406).json({msg: 'Weirdly enough, we could not find any blog posts!'});
    }
  })
  .catch(error => {
    console.error(error);
    return res.status(500).json(error);
  });
});

/*============================================
    CREATE NEW BLOG POST RECORDS ENDPOINTS
===============================================
+------------------------------------------------------------------------------+
    Endpoint: '/create_blog_post'
    Function: Create a new blog post
    Params: request body object
      newBlogPost: object
        author: Int
        title: String
        content: String
    * 'id' field for new entry handled automatically by database
    * 'created_at' AND 'updated_at' fields handled automatically by this API
+-----------------------------------------------------------------------------*/

app.post('/create_blog_post', (req, res) => {

  // Data validation
  let newBlogPost = req.params.newBlogPost;
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
            console.log(newBlogPostRecord.attributes);
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
  Params: 
    userID: url parameter string
    attributesToUpdate: body object
      user: object
        user_roles_id: number,
        username: string,
        email: string
      address: object
        address: '1 Space Place',
        city: 'Ottawa',
        province: 'Ontario',
        country: 'Canada',
        postal_code: 'C0C 0C0',
+-----------------------------------------------------------------*/

app.put('/edit_user/:userID', (req, res) => {

  const user_id = req.params.userID;
  const emailTemplate = new RegExp('^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$');

  // Data validation
  if (isNaN(parseInt(user_id))) {
    if (attributesToUpdate) {

      // Assign empty objects if user or address parameters are missing
      let userAttributesToUpdate = attributesToUpdate.user || {};
      let userAddressAttributesToUpdate = attributesToUpdate.address || {};

      // Validate user object content
      if (userAttributesToUpdate.user_roles_id && isNaN(parseInt(userAttributesToUpdate.user_roles_id))) {
        // User role ID provided as parameter is invalid
        return res.status(400).json({msg: 'User Role ID provided is not a number'});

      } else if (userAttributesToUpdate.username && userAttributesToUpdate.username.length > 255) {
        // Username provided as parameter is too long
        return res.status(400).json({msg: 'Username provided is over 255 characters'});

      } else if (userAttributesToUpdate.email && 
          userAttributesToUpdate.email.length > 255 && 
          emailTemplate.test(userAttributesToUpdate.email)) {
        // Email provided as parameter is invalid
        return res.status(400).json({msg: 'email provided is too long or of improper format'});

      } else if (userAddressAttributesToUpdate.address && userAttributesToUpdate.address.length > 255) {
        // Address provided as parameter is too long
        return res.status(400).json({msg: 'Street Address provided is over 255 characters'});

      } else if (userAddressAttributesToUpdate.city && userAttributesToUpdate.city.length > 255) {
        // City provided as parameter is too long
        return res.status(400).json({msg: 'City name provided is over 255 characters'});

      } else if (userAddressAttributesToUpdate.province && userAttributesToUpdate.province.length > 255) {
        // Province provided as parameter is too long
        return res.status(400).json({msg: 'Province name provided is over 255 characters'});

      } else if (userAddressAttributesToUpdate.postal_code && userAttributesToUpdate.postal_code.length > 255) {
        // Postal code provided as parameter is too long
        return res.status(400).json({msg: 'Postal Code provided is over 255 characters'});

      } else if (userAddressAttributesToUpdate.country && userAttributesToUpdate.country.length > 255) {
        // Country provided as parameter is too long
        return res.status(400).json({msg: 'Country name provided is over 255 characters'});

      } else {
        // All data contained in the update objects is valid
        // Update user information using a transaction to provide rollback capabilities
        bookshelf.transaction(function(userUpdate) {
          return User.forge({id: user_id})
          .save(userAttributesToUpdate, {
            transacting: userUpdate,
            method: 'update', 
            patch: true
          })
          .then(user => {
            return UserAddress.where({'user_id': user_id})
            .save(userAddressAttributesToUpdate, {
              transacting: userUpdate,
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
      // Request body attribute object required for update is missing
      return res.status(400).json({msg: 'attributesToUpdate Object is missing'});
    }
  } else {
    // User ID provided as request parameter is invalid
    return res.status(400).json({msg: 'User ID provided is not an integer'});
  }

});