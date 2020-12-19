const request = require("supertest");
const { Note } = require("../../../models/note");
const { User } = require("../../../models/user");
const _ = require("lodash");

let server;

describe("/notes", () => {
  beforeEach(() => {
    server = require("../../../index");
  });

  afterEach(async () => {
    await Note.deleteMany({});
    await User.deleteMany({});
    await server.close();
  });

  describe("GET /all", () => {
    it("should return all notes in db", async () => {
      await Note.collection.insertMany([
        {
          title: "test",
          body: "test",
          isDone: false,
          ageofUser: 8,
        },
        {
          title: "test2",
          body: "test2",
          isDone: true,
          ageofUser: 98,
        },
      ]);

      const res = await request(server).get("/notes/all");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });

  describe("GET /:id", () => {
    it("should return a note with the given id", async () => {
      const note = new Note({
        title: "test",
        body: "test",
        isDone: false,
        ageofUser: 8,
      });
      await note.save();

      const res = await request(server).get("/notes/" + note._id);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(
        _.pick(note, ["title", "body", "isDone", "ageofUser"])
      );
    });

    it("should return 404 given invalid id", async () => {
      const res = await request(server).get("/notes/1");
      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    let token;
    let user;
    let title;

    const exec = () => {
      return request(server)
        .post("/notes/add")
        .set("x-auth-token", token)
        .send({
          title: title,
        });
    };

    beforeEach(async () => {
      user = await new User({
        name: "test123",
        email: "test@gmail.com",
        password: 12345,
      }).save();
      token = user.generateAuthToken();
      title = "1234";
    });

    it("should return 401 if client not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 404 if not an existing user", async () => {
      token = new User().generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 400 if title is < 4 chars", async () => {
      title = "123";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if title is > 100 chars", async () => {
      title = new Array(102).join("a");
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should find the note if valid", async () => {
      await exec();
      const note = await Note.find({ title: "1234" });
      expect(note).toBeTruthy();
    });

    it("should find and match the note if valid", async () => {
      const res = await exec();
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("title", "1234");
    });
  });

  describe("PUT /update/:id", () => {
    let token;
    let user;
    let note;

    const exec = () => {
      return request(server)
        .put("/notes/update/" + note._id)
        .set("x-auth-token", token)
        .send({ title: "test", body: "test", isDone: true, ageofUser: 8 });
    };

    beforeEach(async () => {
      user = await new User({
        name: "test123",
        email: "test@gmail.com",
        password: 12345,
        isAdmin: true,
      }).save();
      token = user.generateAuthToken();
      note = await new Note({
        title: "test",
        body: "test",
        isDone: false,
        ageofUser: 8,
      }).save();
    });

    it("should return 401 if no token is provided", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 403 if user isn't an admin", async () => {
      user = await new User({
        name: "test123",
        email: "test@gmail.com",
        password: 12345,
      }).save();
      token = user.generateAuthToken();

      const res = await exec();
      expect(res.status).toBe(403);
    });

    it("should return the updated note given valid admin id", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(
        _.pick(note, ["title", "body", "ageofUser"])
      );
      expect(res.body).toHaveProperty("isDone", true);
    });

    it("should return 404 given unsaved note id", async () => {
      note = new Note({
        title: "test",
        body: "test",
        isDone: false,
        ageofUser: 8,
      });
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 404 if given non-existent user", async () => {
      token = new User().generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /delete/:id", () => {
    let token;
    let user;
    let note;

    const exec = () => {
      return request(server)
        .delete("/notes/delete/" + note._id)
        .set("x-auth-token", token);
    };

    beforeEach(async () => {
      user = await new User({
        name: "test123",
        email: "test@gmail.com",
        password: 12345,
        isAdmin: true,
      }).save();
      token = user.generateAuthToken();
      note = await new Note({
        title: "test",
        body: "test",
        isDone: false,
        ageofUser: 8,
      }).save();
    });

    it("should return 401 if no token is provided", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 403 if user isn't an admin", async () => {
      user = await new User({
        name: "test123",
        email: "test@gmail.com",
        password: 12345,
      }).save();
      token = user.generateAuthToken();

      const res = await exec();
      expect(res.status).toBe(403);
    });

    it("should return the note given valid admin id", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(
        _.pick(note, ["title", "body", "isDone", "ageofUser"])
      );
    });

    it("should return 404 given unsaved note id", async () => {
      note = new Note({
        title: "test",
        body: "test",
        isDone: false,
        ageofUser: 8,
      });
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 404 if given non-existent user", async () => {
      token = new User().generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(404);
    });
  });
});
