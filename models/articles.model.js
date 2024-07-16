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
