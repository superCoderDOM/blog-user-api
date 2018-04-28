# Express API Design Decisions

The following paragraphs provide a description of any design decisions made that weren’t straightforward.

## Technology Stack

I elected to go with an express/knex/bookshelf stack for the following reasons. *Express* is extremely versatile and easy to use for creating a variety of APIs. The syntax is easy to read and makes it clear what each function does. *Knex* allows the use javascript to create complex SQL queries and works with many SQL databases including MySQL, PostgresSQL, SQLite3, MSSQL, MariaDB, Oracle, and Amazon Redshift. So it is a highly versatile tool that also result in highly portable code as it requires minimal changes to allow code to be reused with another database system. *Bookshelf* is an ORM built on top of knex that is designed to work well with MySQL, PostgreSQL and SQLite3. It makes for very clean code, even when manipulating data using complex SQL queries especially when dealing with one-to-one and one-to-many relationships between tables. Overall, the resulting API is easy to understand and maintain, and can potentially be reused with little modifications with the database is ever migrated to a different system.

## User Details

When fetching user details, the problem requested to provide a count of the number of posts a user has. I opted to not use the SQL based count function and fetch the full list of blogs associated with each user, and then count them. I understand that as the database grows, the number of results to fetch will increase the time required to perform the full query, but I felt it allowed more flexibility with future development, say if a list of blog titles and publication dates needed to be added to the query results. If the client felt it was not a viable option, it can be changed relatively easily.

## Data Validation

Within the API, I have implemented validation checks on data types, format, and presence where I felt it was required. Although, as defined, the database allows for empty fields to exist, I decided to enforce the presence of all an author, title, and content when creating new blog posts. 

### Email Validation

As a subset of data validation, I added a regex to test whether the email address provided when editing user details makes sense. Although more complex expressions exist, the once I chose is the one used by W3C.

--- THE END ---