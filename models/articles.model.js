const db = require("../db/connection");

exports.fetchArticleById = (article_id) => {
  return db
    .query(
      `
        SELECT
            *
        FROM
            articles
        WHERE
            article_id = $1
        `,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article Not Found" });
      }
      return rows[0];
    });
};

exports.fetchAllArticles = () => {
  return db
    .query(
      `
        SELECT
            articles.author,
            title,
            articles.article_id,
            topic,
            articles.created_at,
            articles.votes,
            article_img_url,
        COUNT
            (comments.comment_id)
        AS
            comment_count
        FROM
            articles
        LEFT JOIN
            comments
        ON
            articles.article_id = comments.article_id
        GROUP BY
            articles.article_id
        ORDER BY
            articles.created_at DESC;
        `
    )
    .then(({ rows }) => {
      return rows.map((article) => ({
        ...article,
        comment_count: parseInt(article.comment_count),
      }));
    });
};

exports.fetchCommentsByArticleId = (article_id) => {
  return db
    .query(
      `
    SELECT
      comment_id, 
      body, 
      votes, 
      author, 
      article_id,
      created_at
    FROM
      comments
    WHERE
      article_id = $1
    ORDER BY
      created_at DESC
    `,
      [article_id]
    )
    .then(({ rows }) => rows);
};

exports.insertComment = (article_id, username, body) => {
  return db
    .query(
      `
    SELECT
      *
    FROM
      articles
    WHERE
      article_id = $1
    `,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article Not Found" });
      }
      return db.query(
        `
    SELECT 
      * 
    FROM 
      users 
    WHERE 
      username = $1
      `,
        [username]
      );
    })
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "User Not Found" });
      }
      return db.query(
        `
        INSERT INTO
        comments 
        (
          article_id, 
          author, 
          body
          )
          VALUES
          ($1, $2, $3)
          RETURNING *
          `,
        [article_id, username, body]
      );
    })
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.updateArticleVotes = (article_id, inc_votes) => {
  return db
    .query(
      `
    UPDATE
      articles
    SET
      votes = votes + $1
    WHERE
      article_id = $2
    RETURNING *
    `,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article Not Found" });
      }
      return rows[0];
    });
};
