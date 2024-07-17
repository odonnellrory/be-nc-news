const db = require("../db/connection");

exports.fetchAllUsers = () => {
  return db
    .query(
      `
        SELECT
            username,
            name,
            avatar_url
        FROM
            users
        `
    )
    .then(({ rows }) => rows);
};
