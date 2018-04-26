const moment = require('moment');

// knex configuration parameters
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

// create Models for each tables
const BlogPost = bookshelf.Model.extend({
  tableName: 'blog_posts',
  author: function() {
    return this.belongsTo(User, 'author');
  },
  // blogCount: function() {
  //   return this.count('author');
  // },
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

/*
    /users
    list all users, including the name of their role, their address, and how many blog posts they have
    optionally pass in a user id to list just that user’s details
*/

/*
// List all data related to each user
// Including the name of their role, their address, and how many blog posts they have
User.fetchAll({
  withRelated: ['userAddress', 'userRole', 'userBlogPosts']
})
.then(users => {
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
  console.log(queryResult);
})
.catch(error => {
    console.log(error);
});
*/

/*
// List all data related to specific user
User.forge({id: 2})
.fetch({
  withRelated: ['userAddress', 'userRole', 'userBlogPosts']
})
.then(user => {
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
  // console.log(user.related('userAddress').toJSON());
  // console.log(user.related('userRole').toJSON());
  // console.log(user.related('userBlogPosts').toJSON());
  console.log(queryResult);
})
.catch(error => {
  console.log(error);
});
*/

/*
    /blog_posts
    list all blog posts
    optionally pass in a user id to list a single user’s blog posts
    optionally pass in a blog post id to get just that post
*/

/*
// List all blog posts OR specific user posts OR single post
let userID; 
let blogID;
let msg = 'All Blog Posts';
BlogPost.fetchAll()
.then(blogPosts => {
  blogPosts = blogPosts.models.map(blogPost => blogPost.attributes);
  if (userID) {
    msg = `User ${userID} Blog Posts`;
    blogPosts = blogPosts.filter(blogPost => blogPost.author === userID);
  } else if (blogID) {
    msg = `Blog Post ${blogID}`;
    blogPosts = blogPosts.filter(blogPost => blogPost.id === blogID);
  }
  console.log(`${msg}:`, blogPosts);
})
.catch(error => {
  console.log(error);
});
*/

/*
    /create_blog_post
    params: (whatever is needed to create a new blog post)
*/

/*
newBlogPost = {
  author: 2,
  title: 'Yet a New Title',
  content: 'Again, Some beautiful prose',
  created_at: `${moment().format('YYYY-MM-DD HH:mm:ss')}`,
  updated_at: `${moment().format('YYYY-MM-DD HH:mm:ss')}`,
}

new BlogPost(newBlogPost).save()
.then(newBlogPost => {
  console.log(newBlogPost.attributes)
})
.catch(error => {
  console.log(error);
});
*/

/*
/edit_user
edit a user’s details, including their role and address
params: (whatever is needed to accomplish this)
*/

attributesToUpdate = {
  // User
  id: 1,
  user_roles_id: 1, // check if number exixts in UserRole
  username: 'I_Admin',
  email: 'admin@test.com',
  // UserAddress
  address: {
    address: '1 Space Place',
    city: 'Ottawa',
    province: 'Ontario',
    country: 'Canada',
    postal_code: 'C0C 0C0',
  }
};

user_id = attributesToUpdate.id;

userAttributesToUpdate = {
  user_roles_id: attributesToUpdate.user_roles_id,
  username: attributesToUpdate.username,
  email: attributesToUpdate.email,
};

userAddressAttributesToUpdate = attributesToUpdate.address;

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
      console.log(updatedUser);
    })
  })
})
.catch(error => {
  console.log(error);
});


// UserAddress.where({'user_id': user_id})
// .save(userAddressAttributesToUpdate, {method: 'update', patch: true})
// .then(newAddress => {
//   console.log(newAddress.toJSON());
// })
// .catch(error => {
//   console.log(error);
// });