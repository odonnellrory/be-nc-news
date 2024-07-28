const db = require("../db/connection");

exports.fetchArticleById = (article_id) => {
  return db
    .query(
      `
        SELECT
          articles.*,
        COUNT
          (comments.comment_id)::INT
        AS
          comment_count
        FROM
          articles
        LEFT JOIN
          comments 
        ON 
          articles.article_id = comments.article_id
        WHERE
          articles.article_id = $1
        GROUP BY articles.article_id
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

exports.fetchAllArticles = async (
  sort_by = "created_at",
  order = "desc",
  topic,
  limit = 10,
  offset = 0
) => {
  const validColumns = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
    "comment_count",
  ];
  const validOrders = ["asc", "desc"];

  if (!validColumns.includes(sort_by.toLowerCase())) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }
  if (!validOrders.includes(order.toLowerCase())) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }

  let queryStr = `
    SELECT
      articles.article_id,
      articles.title,
      articles.topic,
      articles.author,
      articles.created_at,
      articles.votes,
      articles.article_img_url,
    COUNT(comments.comment_id)::INT AS 
      comment_count
    FROM
      articles
    LEFT JOIN
      comments 
    ON 
      articles.article_id = comments.article_id
  `;

  const queryParams = [];

  if (topic) {
    queryStr += " WHERE articles.topic = $1";
    queryParams.push(topic);
  }

  queryStr += `
        GROUP BY
            articles.article_id
        ORDER BY
            ${sort_by} ${order}
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
        `;
  queryParams.push(limit, offset);

  const articlesPromise = db.query(queryStr, queryParams);

  let countQueryStr = `SELECT COUNT(*) FROM articles`;
  if (topic) {
    countQueryStr += " WHERE topic = $1";
  }

  const countPromise = db.query(countQueryStr, topic ? [topic] : []);

  try {
    const [articlesResult, countResult] = await Promise.all([
      articlesPromise,
      countPromise,
    ]);

    if (articlesResult.rows.length === 0 && topic) {
      const topicCheck = await db.query(
        "SELECT * FROM topics WHERE slug = $1",
        [topic]
      );
      if (topicCheck.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Topic Not Found" });
      }
    }

    return {
      articles: articlesResult.rows.map((article) => ({
        ...article,
        comment_count: parseInt(article.comment_count),
      })),
      total_count: parseInt(countResult.rows[0].count),
    };
  } catch (err) {
    return Promise.reject(err);
  }
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

exports.insertArticle = (author, title, body, topic, article_img_url) => {
  const defaultImgUrl =
    "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700";

  const queryValues = [
    title,
    body,
    author,
    topic,
    article_img_url || defaultImgUrl,
  ];

  return db
    .query(
      `
      INSERT INTO 
        articles
          (
            title, 
            body, 
            author, 
            topic, 
            article_img_url
          )
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      queryValues
    )
    .then(({ rows }) => {
      const article = rows[0];
      return db.query(
        `
        SELECT 
          articles.*, 
        COUNT(comments.comment_id)::INT AS 
          comment_count
        FROM 
          articles
        LEFT JOIN 
          comments 
        ON 
          articles.article_id = comments.article_id
        WHERE 
          articles.article_id = $1
        GROUP BY 
          articles.article_id
        `,
        [article.article_id]
      );
    })
    .then(({ rows }) => rows[0])
    .catch((err) => {
      if (err.code === "23503") {
        if (err.constraint === "articles_author_fkey") {
          return Promise.reject({ status: 404, msg: "Author Not Found" });
        }
        if (err.constraint === "articles_topic_fkey") {
          return Promise.reject({ status: 404, msg: "Topic Not Found" });
        }
      }
      return Promise.reject(err);
    });
};
