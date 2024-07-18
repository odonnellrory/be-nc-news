const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");
const endpointsFile = require("../endpoints.json");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("Invalid Path", () => {
  test("404: responds with not found for invalid path", () => {
    return request(app)
      .get("/api/imaninvalidpath")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Path Not Found");
      });
  });
});

describe("GET /api/topics", () => {
  test("200: responds with an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.topics)).toBe(true);
        expect(body.topics.length).toBeGreaterThan(0);
        body.topics.forEach((each) => {
          expect(each).toHaveProperty("slug");
          expect(each).toHaveProperty("description");
        });
      });
  });
});

describe("GET /api", () => {
  test("200: responds with JSON describing all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(endpointsFile);
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: responds with the requested article", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            author: expect.any(String),
            title: expect.any(String),
            article_id: 1,
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          })
        );
      });
  });

  test("404: responds with not found for non-existent article_id number", () => {
    return request(app)
      .get("/api/articles/99999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article Not Found");
      });
  });

  test("400: responds with bad request for invalid article_id", () => {
    return request(app)
      .get("/api/articles/iamnotanarticleid")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: responds with an array of article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.articles)).toBe(true);
        expect(body.articles.length).toBe(13);
        body.articles.forEach((each) => {
          expect(each).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
          expect(each).not.toHaveProperty("body");
        });
      });
  });

  test("200: articles are sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: responds with an array of comments for a given article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.comments)).toBe(true);
        expect(body.comments.length).toBe(11);
        body.comments.forEach((each) => {
          expect(each).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 1,
          });
        });
      });
  });

  test("200: responds with the correct comments for article_id 9", () => {
    return request(app)
      .get("/api/articles/9/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toHaveLength(2);
        expect(body.comments[0]).toEqual({
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 16,
          author: "butter_bridge",
          article_id: 9,
          comment_id: expect.any(Number),
          created_at: expect.any(String),
        });
      });
  });

  test("200: responds with an empty array for a valid article_id that has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });

  test("200: comments are sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("404: responds with not found for non-existent article_id", () => {
    return request(app)
      .get("/api/articles/99999999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article Not Found");
      });
  });

  test("400: responds with bad request for invalid article_id", () => {
    return request(app)
      .get("/api/articles/iamnotanarticleid/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: adds a new comment to an article and responds with the posted comment", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This is a test comment",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          body: "This is a test comment",
          votes: 0,
          author: "butter_bridge",
          article_id: 1,
          comment_id: expect.any(Number),
          created_at: expect.any(String),
        });
      });
  });

  test("404: responds with not found for non-existent article_id", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This is a test comment",
    };
    return request(app)
      .post("/api/articles/99999999/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article Not Found");
      });
  });

  test("400: responds with bad request for invalid article_id", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This is a test comment",
    };
    return request(app)
      .post("/api/articles/iamnotanarticleid/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });

  test("404: responds with not found for non-existent username", () => {
    const newComment = {
      username: "iamnotauser",
      body: "This is a test comment",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .then(({ body }) => {
        expect(body.msg).toBe("User Not Found");
      });
  });

  test("201: ignores unnecessary properties", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This is a test comment",
      isKevCool: true,
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).not.toHaveProperty("isKevCool");
      });
  });

  test("400: responds with a bad request for missing required fields", () => {
    const invalidComment = { body: "This comment has no username" };
    return request(app)
      .post("/api/articles/1/comments")
      .send(invalidComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: updates votes and responds with the updated article", () => {
    const updateVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/1")
      .send(updateVotes)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: 1,
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
        expect(body.article.votes).toBe(101);
      });
  });

  test("200: decreases votes and responds with the updated article", () => {
    const updateVotes = { inc_votes: -100 };
    return request(app)
      .patch("/api/articles/1")
      .send(updateVotes)
      .expect(200)
      .then(({ body }) => {
        expect(body.article.votes).toBe(0);
      });
  });

  test("400: responds with bad request for invalid inc_votes value", () => {
    const updateVotes = { inc_votes: "i am not a valid vote" };
    return request(app)
      .patch("/api/articles/1")
      .send(updateVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });

  test("400: responds with bad request for missing inc_votes key", () => {
    const updateVotes = {};
    return request(app)
      .patch("/api/articles/1")
      .send(updateVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });

  test("404: responds with not found for non-existent article_id", () => {
    const updateVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/99999999")
      .send(updateVotes)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article Not Found");
      });
  });

  test("400: responds with bad request for invalid article_id", () => {
    const updateVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/iamnotavalidarticle")
      .send(updateVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });

  test("200: ignores unnecessary properties", () => {
    const updateVotes = {
      inc_votes: 1,
      beans: "on toast",
    };
    return request(app)
      .patch("/api/articles/1")
      .send(updateVotes)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: 1,
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
        expect(body.article.votes).toBe(101);
        expect(body.article).not.toHaveProperty("beans");
      });
  });

  test("200: article is unchanged if given inc_votes 0", () => {
    const updateVotes = { inc_votes: 0 };
    return request(app)
      .patch("/api/articles/1")
      .send(updateVotes)
      .expect(200)
      .then(({ body }) => {
        expect(body.article.votes).toBe(100);
      });
  });
});

describe("DELETE /api/comments:comment_id", () => {
  test("204: deletes the given comment and responds with no content", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then((response) => {
        expect(response.body).toEqual({});
      });
  });

  test("404: responds with not found for non-existent comment_id", () => {
    return request(app)
      .delete("/api/comments/99999999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment Not Found");
      });
  });

  test("400: responds Bad Request if PSQL gets numeric overflow error (22003)", () => {
    return request(app)
      .delete("/api/comments/999999999999999999999999999999999999999999999999")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });

  test("400: responds with bad request for invalid comment_id", () => {
    return request(app)
      .delete("/api/comments/iamnotacommentpleasedontdeletemenooo")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });

  test("404: responds with not found when trying to delete an already deleted comment", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(() => {
        return request(app)
          .delete("/api/comments/1")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("Comment Not Found");
          });
      });
  });
});

describe("GET /api/users", () => {
  test("200: responds with an array of user objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.users)).toBe(true);
        expect(body.users.length).toBeGreaterThan(0);
        body.users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles (sorting)", () => {
  test("200: sorts articles by specific column in ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("title", { descending: false });
      });
  });

  test("200: sorts articles by votes in descending order", () => {
    return request(app)
      .get("/api/articles?sort_by=votes")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("votes", { descending: true });
      });
  });

  test("400: responds with bad request for invalid sort_by column", () => {
    return request(app)
      .get("/api/articles?sort_by=iamnotavalidsortbyokay")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });

  test("400: responds with bad request for invalid ordr value", () => {
    return request(app)
      .get("/api/articles?order=iamnotavalidorder")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});

describe("GET /api/articles (topic filtering)", () => {
  test("200: filters articles by the specified topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(12);
        body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });

  test("200: returns an empty array when filtered by topic with no articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toEqual([]);
      });
  });

  test("200: filters by topic and sort by title in ascending order", () => {
    return request(app)
      .get("/api/articles?topic=mitch&sort_by=title&order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(12);
        body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
        expect(body.articles).toBeSortedBy("title", { descending: false });
      });
  });

  test("404: responds with not found for non-existent topic", () => {
    return request(app)
      .get("/api/articles?topic=iamnotavalidtopic")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Topic Not Found");
      });
  });
});
