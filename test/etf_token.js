var ETFToken = artifacts.require("./ETFToken.sol");

contract('ETFToken', function(accounts) {

  let owner = accounts[0];
  let alice = accounts[1];
  let bob = accounts[2];

  it("should begin with zero tokens", async () => {
    let instance = await ETFToken.deployed()
    let total = await instance.totalSupply.call(bob)  
    assert.equal(0, total.toNumber())
  });

  it("should increase the total supply when tokens are issued", async () => {
    let instance = await ETFToken.deployed()
    await instance.issueTokens(alice, 1000, {from: owner})
    let total = await instance.totalSupply.call(bob)
    assert.equal(1000, total.toNumber())
  });

  it("should not allow a non-owner to issue tokens", async () => {
    let instance = await ETFToken.deployed()
    let success = await instance.issueTokens.call(alice, 1000, {from: alice})
    assert.isFalse(success)
    let total = await instance.totalSupply.call(bob)
    assert.equal(0, total.toNumber())
  });

});
