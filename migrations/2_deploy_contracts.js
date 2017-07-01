var ETFToken = artifacts.require("./ETFToken.sol");

module.exports = function(deployer) {
  deployer.deploy(ETFToken);
};
