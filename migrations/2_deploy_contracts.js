const BettingGame = artifacts.require("BettingGame");

module.exports = function (deployer) {
  deployer.deploy(BettingGame);
};
