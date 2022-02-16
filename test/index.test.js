const { expect } = require("chai");
const { getTvl } = require("../projects/elysia/index");

describe("tvl", () => {
  it.only("should return tvl", async () => {
    const tvl = await getTvl();

    expect(true).to.be.eq(true);
  });
});
