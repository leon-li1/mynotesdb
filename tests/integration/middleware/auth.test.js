const request = require("supertest");
const { User } = require("../../../src/models/user");
const { Note } = require("../../../src/models/note");
const bcrypt = require("bcrypt");

let server;

describe("auth middleware", () => {
  let token;
  let user;
  let salt;

  const exec = () => {
    return request(server)
      .post("/notes/add")
      .set("x-auth-token", token)
      .send({ title: "test" });
  };

  beforeEach(async () => {
    server = require("../../../src/index");
    salt = await bcrypt.genSalt(10);
    tempUser = {
      name: "test123",
      email: "test@gmail.com",
      password: await bcrypt.hash("12345", salt),
      isAdmin: true,
    };
    user = await new User(tempUser).save();
    token = user.generateAuthToken();
  });

  afterEach(async () => {
    await Note.deleteMany({});
    await User.deleteMany({});
    await server.close();
  });

  it("should return 401 if no token is provided", async () => {
    token = "";
    const res = await exec();
    expect(res.status).toBe(401);
  });

  it("should return 401 if no token is provided", async () => {
    token = "a";
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 401 if no token is provided", async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });
});
