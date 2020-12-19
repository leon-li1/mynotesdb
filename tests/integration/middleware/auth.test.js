const request = require("supertest");
const { User } = require("../../../models/user");
const { Note } = require("../../../models/note");

let server;

describe("auth middleware", () => {
  let token;
  let user;

  const exec = () => {
    return request(server)
      .post("/notes/add")
      .set("x-auth-token", token)
      .send({ title: "test" });
  };

  beforeEach(async () => {
    server = require("../../../index");
    user = await new User({
      name: "test123",
      email: "test@gmail.com",
      password: 12345,
    }).save();
    token = user.generateAuthToken();
  });

  afterEach(async () => {
    await Note.deleteMany({});
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
