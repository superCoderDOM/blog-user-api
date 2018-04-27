# Express API

Designed by Dominic Lacroix for Iversoft coding challenge.

## Specifications

API implementation performed using a community edition of [MYSQL](https://www.mysql.com/) database and a [Node.js](https://nodejs.org/en/) technology stack ([knex](http://knexjs.org/)/[bookshelf](http://bookshelfjs.org/)/[express](http://expressjs.com/)).

The API endpoints are build to interact with ecords contained in tables defined in the DB schema [test_db_2017-05-24.sql](./test_db_2017-05-24.sql).

It provides the following endpoint:

[`/users`](#retrieve-list-of-user-details) - Use this endpoint to retrieve user details
[`/blog_posts`](#retrieve-list-of-blog-post-details) - Use this endpoint to retrieve blog post details
[`/create_blog_post`](#create-a-new-blog-post) - Use this endpoint to create a new blog post entry
[`/edit_user`](#update-user-details) - Use this endpoint to edit user details

## Endpoint Documentation

### Retrieve List of User Details

The `/users` endpoint provides a list of details associated with all users contained in the database. The list inlcudes each users id, username, email address, their role, address, and how many blog posts they have authored. This endpoint can optionally be passed user ID to obtain a list containing only the information pertaining to the specified user.

When called, this endpoint performs a task returning results equivalent to invoking the following SQL query: 

```sql
SELECT users.id, users.username, users.email, 
CONCAT(user_addresses.address, ", ", user_addresses.city, ", ", user_addresses.province, " ", user_addresses.postal_code, ", ", user_addresses.country)
AS address, label AS role, user_posts.blog_posts
FROM `database`.users, `database`.user_roles, `database`.user_addresses, (
    SELECT users.id, 
    COUNT(blog_posts.author) AS blog_posts 
    FROM `database`.users 
    LEFT JOIN `database`.blog_posts 
    ON users.id = blog_posts.author 
    GROUP BY users.id ASC
) AS user_posts
WHERE users.user_roles_id = user_roles.id 
AND users.id = user_addresses.user_id
AND users.id = user_posts.id
-- Optionally --
AND users.id = [value];
```

#### Request Parameters

URL format for this enpoint:
```/users```
```/users?userID=[value]```

This endpoint can be reached with and without parameters. When no parameters are provided, the response will include a list of details associated with all users present in the database. When a **userID** query parameter is present at the end of the url, the response will include only the details associated with the specified user. If a parameter other than userID is provided or if the value attached to userID is not a number, the request will fail with a status code of `400`.

#### Response Format

Upon a successful request with status code 200, a JSON object containing the requested list is returned in the response. Requests for ALL and SINGLE user details are both returned as an array. In the single case, the array contains only one user detail object.

The JSON response object returned by this endpoint takes the following form:

```json
[
    {
        "id": 1,
        "username": "I_Admin",
        "email": "admin@test.com",
        "address": {
            "address": "1 Space Place",
            "city": "Ottawa",
            "province": "Ontario",
            "postal_code": "C0C 0C0",
            "country": "Canada"
        },
        "role": "Admin",
        "posts": 0
    },
    {
        "id": 2,
        "username": "I_Publish",
        "email": "publisher@test.com",
        "address": {
            "address": "123 queen street",
            "city": "Gatineau",
            "province": "Quebec",
            "postal_code": "123 tdf",
            "country": "Canada"
        },
        "role": "Publisher",
        "posts": 4
    },
]
```

If a properly formed request fails to retrieve any data, a status code of `204` (No Content) is sent in response. The API also provides responses to malformed requests, status code `400` (Bad Request), and internal errors, status code `500` (Internal Server Error).

In all cases where no data was fetched (no content, bad request, internal error), the status code is sent along with a JSON object conatining a message providing more information on the problem. This object takes the following form:

```json
{ "message": "Message containing information related to the particular problem encountered"}
``` 

### Retrieve List of Blog Post Details

The `/blog_posts` endpoint provides a list of the blog posts contained in the database. For each item retrieved, the list includes a blog id, the author id, the title and content, as well as the timestamps indicating when a blog post was created and last edited. The request may optionally include a user id to obtain a list of all blog posts authored by a specific user. The request may also optionally include a blog post id to list the information associated with a specific post.

When called, this endpoint performs a task returning results equivalent to invoking a version of the following SQL query:

```sql
SELECT *
FROM `database`.blog_posts
-- Optionally --
WHERE blog_posts.id = [value]
OR blog_posts.author = [value];
```

#### Request Parameters

URL format for this enpoint:
```/blog_posts```
```/blog_posts?userID=[value]```
```/blog_posts?blogID=[value]```

This endpoint can be reached with and without parameters. When no parameters are provided, the response will include a list of details associated with all blog posts present in the database. When a **userID** query parameter is present at the end of the url, the response will include only the details of the blog posts authored by the specified user. When a **blogID** query parameter is included at the end of the url, the respose will include only the details of the specified blog post.

Only *blogID* and *userID* are recognized as valid query parameters for this endpoint and their value MUST be a number. If a parameter other than userID and blogID is provided, the request will fail with a status code of `400`. In addition, requests only accept a single query parameter, so blogID and userID cannot be used together or the request will also fail with a status code of `400`.

#### Response Format

Upon a successful request with status code 200, a JSON object containing the requested list is returned in the response. Requests for ALL blog posts, SINGLE USER blog posts, and SINGLE blog post are all returned as an array. In the single blog post case and in cases where only a single post is fetched, the array will contain a single blog post detail object.

The JSON response object returned by this endpoint takes the following form:

```json
[
    {
        "id": 1,
        "author": 2,
        "title": "First Post",
        "content": "Hello world",
        "created_at": "2017-03-08T22:10:36.000Z",
        "updated_at": "2017-04-10T21:10:36.000Z"
    },
    {
        "id": 2,
        "author": 2,
        "title": "Second Post",
        "content": "Hello, again!",
        "created_at": "2017-03-09T22:10:36.000Z",
        "updated_at": "2017-03-10T22:10:36.000Z"
    },
]
```

If a properly formed request fails to retrieve any data, a status code of `204` (No Content) is sent in response. The API also provides responses to malformed requests, status code `400` (Bad Request), and internal errors, status code `500` (Internal Server Error).

In all cases where no data was fetched (no content, bad request, internal error), the status code is sent along with a JSON object conatining a message providing more information on the problem. This object takes the following form:

```json
{ "message": "Message containing information related to the particular problem encountered"}
``` 

### Create A New Blog Post

The `/create_blog_post` endpoint handles the creation of new blog post records. It must be provided with all the information required to create a new blog post, including the author id, the blog post title and its content.

#### Request Parameters

URL format for this enpoint:
```/create_blog_post```

A request body object must be present to provide the necessary information required to create a new blog post record. Although the database allows for empty fields to be present in blog post records, the API requires that an author id, a title, and content be provided in the request body object.

The JSON request body object MUST contain all the following fields:

```json
{
    "author": "3",
    "title": "Why sunny spring days are BETTER",
    "content": "Beyond the warmth, the flowers, the fresh earthy scents...",
}
```

The database automatically handles the creation of the 'id' field, along with the 'created_at' and 'updated_at' timestamps. As a result, these fields do not need to be provided.

The API will accept any other key pairs present in the request body object, but will silently ignore them. However, if any of the required key pairs is missing, the request will fail with a status code of `400`.

#### Response Format

Upon a successful request with status code 200, a JSON object containing the complete details of the newly created blog post record is returned in the response. The response includes the automatically generated blog id and timestamps along with the information provided by the client in the request.

The JSON response object returned by this endpoint takes the following form:

```json
{
    "author": "3",
    "title": "Why sunny spring days are BETTER",
    "content": "Beyond the warmth, the flowers, the fresh earthy scents...",
    "updated_at": "2018-04-27T19:19:13.927Z",
    "created_at": "2018-04-27T19:19:13.927Z",
    "id": 15
}
```
The API also provides responses to malformed requests, status code `400` (Bad Request), and internal errors, status code `500` (Internal Server Error). In all cases where the request could not be completed, the status code is sent along with a JSON object conatining a message providing more information on the problem. This object takes the following form:

```json
{ "message": "Message containing information related to the particular problem encountered"}
```

### Update User Details

The `/edit_user` endpoint handles the update of user details, including their role, username, email, and address. It must be provided with the information needed to properly update the records associated with the specified user.

#### Request Parameters

URL format for this enpoint:
```/edit_user```

A request body object must be present to provide the necessary information required to update user details. Only the **userID** parameter is required in order to access the proper records. All other parameters are optional and only need to be updated. If a parameter is provided and include the same information already present in the database, no visible changes will occur.

The JSON request body object must contain the userID and any of the following fields:

```json
{
    "userID": "1",
    "user_roles_id": "1",
    "username": "I_Test",
    "email": "admin@testing.com",
    "address": "123 ABC Street",
    "city": "Milton",
    "province": "Ontario",
    "postal_code": "M7F 3G9",
    "country": "Canada",
}
```
The API will accept any other key pairs present in the request body object, but will silently ignore them. However, if any of the key pairs are omitted, the corresponding fields in the database will not be updated.


#### Response Format

Upon a successful request with status code 200, a JSON object containing the *updated details* of the user record is returned in the response. 

The JSON response object returned by this endpoint takes the form presented below, but includes only the key-pairs provided in the update request. The updated address fields are grouped together into their own object to make explicit the changes affected a separate table.

```json
{
    "userID": "1",
    "user_roles_id": "1",
    "username": "I_Test",
    "email": "admin@testing.com",
    "address": {
        "address": "123 ABC Street",
        "city": "Milton",
        "province": "Ontario",
        "postal_code": "M7F 3G9",
        "country": "Canada"
    }
}
```

The API also provides responses to malformed requests, status code `400` (Bad Request), and internal errors, status code `500` (Internal Server Error). In all cases where the request could not be completed, the status code is sent along with a JSON object conatining a message providing more information on the problem. This object takes the following form:

```json
{ "message": "Message containing information related to the particular problem encountered"}
```

--- THE END ---