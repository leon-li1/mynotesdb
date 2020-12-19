const request = require("supertest");
const { User } = require("../../../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

let server;

describe("/api/auth", () => {
  beforeEach(() => {
    server = require("../../../index");
  });

  afterEach(async () => {
    await User.deleteMany({});
    await server.close();
  });

  describe("POST /", () => {
    let user;
    let tempUser;

    const exec = () => {
      return request(server).post("/api/auth").send(user);
    };

    beforeEach(async () => {
      tempUser = new User({
        name: "test123",
        email: "test@gmail.com",
        password: "12345",
        isAdmin: true,
      });
      const salt = await bcrypt.genSalt(10);
      tempUser.password = await bcrypt.hash(tempUser.password, salt);
      await tempUser.save();
      user = { email: "test@gmail.com", password: "12345" };
    });

    it("should return 400 if body is invalid", async () => {
      user = {};
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if user is non-existent", async () => {
      user = { email: "t@gmail.com", password: 12345 };
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if password is wrong", async () => {
      user = { email: "test@gmail.com", password: 123 };
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 200 given valid user", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
    });

    it("should return 200 given valid user", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      console.log(res.body); //TODO
    });

    // it("should return a valid jwt given valid user", async () => {
    //   const res = await exec();
    //   // console.log(res.body);
    //   const payload = jwt.verify(
    //     res.body.toString(),
    //     process.env.JWT_PRIVATE_KEY
    //   );
    //   expect(payload).toBeTruthy();
    // });
  });
});
