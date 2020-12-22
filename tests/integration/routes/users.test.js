const request = require("supertest");
const { User } = require("../../../src/models/user");
const mongoose = require("mongoose");
const _ = require("lodash");

let server;

describe("/api/users", () => {
  beforeEach(() => {
    server = require("../../../src/index");
  });

  afterEach(async () => {
    await User.deleteMany({});
    await server.close();
  });

  describe("GET /all", () => {
    it("should return all users in db", async () => {
      await User.collection.insertMany([
        {
          name: "test123",
          email: "test@gmail.com",
          password: 12345,
        },
        {
          name: "test123",
          email: "test2@gmail.com",
          password: 12345,
        },
      ]);

      const res = await request(server).get("/api/users/all");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });

  describe("GET /me", () => {
    it("should return the current user with a valid token (no password)", async () => {
      const user = await new User({
        name: "test123",
        email: "test@gmail.com",
        password: 12345,
      }).save();
      const token = user.generateAuthToken();

      const res = await request(server)
        .get("/api/users/me")
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(
        _.pick(user, ["name", "email", "isAdmin"])
      );
      expect(res.body).toHaveProperty("_id", user._id.toHexString());
      expect(res.body).not.toHaveProperty("password");
    });

    it("should return 401 given no token", async () => {
      const res = await request(server).get("/api/users/me");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /add", () => {
    it("should return 400 if body is invalid", async () => {
      const res = await request(server)
        .post("/api/users/add")
        .send({ name: "test123", email: "test@gmail.com" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if user is already registered", async () => {
      await new User({
        name: "test123",
        email: "test@gmail.com",
        password: "12345",
        isAdmin: true,
      }).save();

      const res = await request(server).post("/api/users/add").send({
        name: "test123",
        email: "test@gmail.com",
        password: 12345,
      });
      expect(res.status).toBe(400);
    });

    it("should return 200 if req.body is valid", async () => {
      const res = await request(server).post("/api/users/add").send({
        name: "test123",
        email: "test@gmail.com",
        password: "12345",
        isAdmin: true,
      });
      expect(res.status).toBe(200);
    });

    it("should return the new user if req.body is valid (no pw)", async () => {
      const res = await request(server).post("/api/users/add").send({
        name: "test123",
        email: "test@gmail.com",
        password: "12345",
        isAdmin: true,
      });
      expect(res.body).toMatchObject({
        name: "test123",
        email: "test@gmail.com",
        isAdmin: true,
      });
    });
  });
});
