const db = require("../db/connection");

exports.fetchAllUsers = () => {
  return db
    .query(
      `
        SELECT
            *
        FROM
            users
        `
    )
    .then(({ rows }) => rows);
};

exports.fetchUserByUsername = (username) => {
  return db
    .query(
      `
    SELECT
      *
    FROM
      users
    WHERE
      username = $1
    `,
      [username]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "User Not Found" });
      }
      return rows[0];
    });
};
