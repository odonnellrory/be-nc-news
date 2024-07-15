const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");
const endpointsFile = require("../endpoints.json");

beforeEach(() => seed(testData));
afterAll(() => db.end());

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

  test("404: responds with not found for invalid path", () => {
    return request(app)
      .get("/api/imaninvalidpath")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Path Not Found");
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
