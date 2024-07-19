# Northcoders News API

## Hosted Version

This API is hosted at: https://be-nc-news-h9q9.onrender.com/api

## Summary

This project is a RESTful API for a news article website, built as part of the Northcoders bootcamp. It provides endpoints for articles, comments, topics, and users, allowing you to retrieve articles, post comments, and manage user data.

## Setup Instructions

### Minimum Requirements

- Node v18.19.1
- PostgreSQL 16.3

### Running This Project Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/odonnellrory/be-nc-news
   ```

2. Move into the repo directory:

   ```bash
   cd be-nc-news
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create two .env files inside the repo's root directory:

   ```bash
   touch .env.development .env.test
   echo "PGDATABASE=nc_news" > .env.development
   echo "PGDATABASE=nc_news_test" > env.development.test
   echo ".env.*" > .gitignore
   ```

5. Setup the databases:

   ```bash
   npm run setup-dbs
   ```

6. Seed the development database:

   ```bash
   npm run seed
   ```

7. Run the test suites:

   ```bash
   npm test
   ```

8. Start the server locally:
   ```bash
   npm start
   ```

The API will now be available [here](http://localhost:9090/api).

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
