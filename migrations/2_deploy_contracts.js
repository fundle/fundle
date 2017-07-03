var ETFToken = artifacts.require("./ETFToken.sol");
var PartyToken = artifacts.require("../PartyToken.sol");
var FiestaToken = artifacts.require("../FiestaToken.sol");
var CarnivalToken = artifacts.require("../CarnivalToken.sol");

module.exports = function(deployer) {
  if (deployer.network === 'development') {
    deployer.deploy(PartyToken);
    deployer.deploy(FiestaToken);
    deployer.deploy(CarnivalToken);
  }
  deployer.deploy(ETFToken);
};
