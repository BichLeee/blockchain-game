const MyToken = artifacts.require("./MyToken.sol");

require("chai").use(require("chai-as-promised")).should();

contract("My Token", (accounts) => {
  let token;

  before(async () => {
    token = await MyToken.deployed();
  });

  describe("deployment", async () => {
    it("deploys successfully", async () => {
      const address = token.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it("has a name", async () => {
      const name = await token.name();
      assert.equal(name, "My Token");
    });
  });

  describe("token distribution", async () => {
    let result;

    it("mint tokens", async () => {
      await token.mint(accounts[0], '')
    });
  });
});
