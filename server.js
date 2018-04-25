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
});
const UserAddress = bookshelf.Model.extend({
  tableName: 'user_addresses',
});
const UserRole = bookshelf.Model.extend({
  tableName: 'user_roles',
});
const User = bookshelf.Model.extend({
  tableName: 'users',
});