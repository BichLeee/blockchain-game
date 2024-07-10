const Token = artifacts.require("MyToken");

module.exports = function (deployer) {
  deployer.deploy(Token);
};
