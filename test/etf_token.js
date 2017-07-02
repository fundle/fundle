var ETFToken = artifacts.require("./ETFToken.sol");

contract('ETFToken clean setup', accounts => {
  
  let {bob} = nameAccounts(accounts);

  it("should begin with zero tokens", async () => {
    // Given
    let instance = await ETFToken.deployed()
    // When

    // Then
    let total = await instance.totalSupply.call(bob)  
    assert.equal(0, total.toNumber())
  });
});

contract('ETFToken', accounts => {

  let {owner, alice, bob, claire} = nameAccounts(accounts);

  it("should increase the total supply when tokens are issued", async () => {
    // Given
    let instance = await ETFToken.deployed()
    let startingTotal = await instance.totalSupply.call()
    // When
    await instance.issueTokens(alice, 2, {from: owner})
    // Then
    let total = await instance.totalSupply.call()
    assert.equal(startingTotal.toNumber() + 2, total.toNumber())
  });

  it("should credit the requested account when tokens are issued", async () => {
    // Given
    let instance = await ETFToken.deployed()
    let aliceStartingBalance = await instance.balanceOf.call(alice)
    // When
    await instance.issueTokens(alice, 2, {from: owner})
    // Then
    let aliceBalance = await instance.balanceOf.call(alice)
    assert.equal(aliceStartingBalance.toNumber() + 2, aliceBalance.toNumber())
  });

  it("should not allow a non-owner to issue tokens", async () => {
    // Given
    let instance = await ETFToken.deployed()
    let startingTotal = await instance.totalSupply.call(bob)
    // When
    await instance.issueTokens(alice, 3, {from: alice})
    // Then
    let total = await instance.totalSupply.call(bob)
    assert.equal(startingTotal.toNumber(), total.toNumber())
  });

  it("should allow someone to transfer their own tokens", async () => {
    // Given
    let instance = await ETFToken.deployed()
    await instance.issueTokens(alice, 10, {from: owner})
    await instance.issueTokens(bob, 10, {from: owner})
    let bobStartingBalance = await instance.balanceOf.call(bob);
    let aliceStartingBalance = await instance.balanceOf.call(alice);
    // When
    await instance.transfer(alice, 2, {from: bob})
    // Then
    let bobBalance = await instance.balanceOf.call(bob);
    let aliceBalance = await instance.balanceOf.call(alice);
    assert.equal(bobStartingBalance.toNumber() - 2, bobBalance.toNumber())
    assert.equal(aliceStartingBalance.toNumber() + 2, aliceBalance.toNumber())
  });

  it("should not allow someone to transfer someone else's tokens", async () => {
    // Given
    let instance = await ETFToken.deployed()
    await instance.issueTokens(alice, 10, {from: owner})
    let bobStartingBalance = await instance.balanceOf.call(bob);
    let aliceStartingBalance = await instance.balanceOf.call(alice);
    // When
    await instance.transferFrom(alice, bob, 2, {from: claire})
    // Then
    let bobBalance = await instance.balanceOf.call(bob);
    let aliceBalance = await instance.balanceOf.call(alice);
    assert.equal(bobStartingBalance.toNumber(), bobBalance.toNumber())
    assert.equal(aliceStartingBalance.toNumber(), aliceBalance.toNumber())
  });

  it("should not affect total supply when tokens are transferred", async () => {
    // Given
    let instance = await ETFToken.deployed()
    await instance.issueTokens(alice, 10, {from: owner})
    let startingTotal = await instance.totalSupply.call();
    // When
    await instance.transfer(bob, 5, {from: alice})
    // Then
    let total = await instance.totalSupply.call();
    assert.equal(startingTotal.toNumber(), total.toNumber())
  });

});


function nameAccounts(accounts){
  return {
    owner: accounts[0],
    alice: accounts[1],
    bob: accounts[2],
    claire: accounts[3],
    derek: accounts[4],
    erica: accounts[5],
    frank: accounts[6],
    greta: accounts[7],
    henry: accounts[8],
    imogen: accounts[9],
  }
}
