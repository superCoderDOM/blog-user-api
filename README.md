# Express API

Designed by Dominic Lacroix for Iversoft coding challenge.

## Specifications

API implementation performed using a community edition of [MYSQL](https://www.mysql.com/) database and a [Node.js](https://nodejs.org/en/) technology stack ([knex](http://knexjs.org/)/[bookshelf](http://bookshelfjs.org/)/[express](http://expressjs.com/)).

The API includes the following endpoints for the DB schema specified in [test_db_2017-05-24.sql](/test_db_2017-05-24.sql) file:

/users
list all users, including the name of their role, their address, and how many blog posts they have
optionally pass in a user id to list just that user’s details

/blog_posts
list all blog posts
optionally pass in a user id to list a single user’s blog posts
optionally pass in a blog post id to get just that post

/create_blog_post
params: (whatever is needed to create a new blog post)

/edit_user
edit a user’s details, including their role and address
params: (whatever is needed to accomplish this)

## Endpoint Documentation