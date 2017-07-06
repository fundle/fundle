var ETFToken = artifacts.require("./ETFToken.sol");
var PartyToken = artifacts.require("../PartyToken.sol");
var FiestaToken = artifacts.require("../FiestaToken.sol");
var CarnivalToken = artifacts.require("../CarnivalToken.sol");

contract('ETFToken clean setup', accounts => {
  
  let {bob} = nameAccounts(accounts);

  it("should begin with zero tokens", async () => {
    // Given
    let instance = await ETFToken.deployed()
    // When
    // (nothing)
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

  it("should not allow someone to transfer someone else's tokens without authorization", async () => {
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

  it("should trigger a Transfer event when tokens are transferred", async () => {
    // Given
    let instance = await ETFToken.deployed()
    await instance.issueTokens(alice, 10, {from: owner})
    // When
    let {logs} = await instance.transfer(bob, 5, {from: alice})
    // Then
    let expectedTransfer = { event: 'Transfer', args: { _from: alice, _to: bob, _value: 5 }}
    assert.equal(1, logs.length)
    assertEventsEqual(expectedTransfer, logs[0])
  });

  it("should trigger Issue and Transfer events when tokens are issued", async () => {
    // Given
    let instance = await ETFToken.deployed()
    let initialSupply = await instance.totalSupply.call()
    // When
    let {logs} = await instance.issueTokens(alice, 10, {from: owner})
    // Then
    let expectedIssue = { event: 'Issue', args: { _newTotal: initialSupply.toNumber() + 10, _amountIssued: 10 }}
    let expectedTransfer = { event: 'Transfer', args: { _from: instance.address, _to: alice, _value: 10 }}
    assert.equal(2, logs.length)
    assertEventsEqual(expectedIssue, logs[0])
    assertEventsEqual(expectedTransfer, logs[1])
  });

  it("should not trigger events when token issue failed", async () => {
    // Given
    let instance = await ETFToken.deployed()
    // When
    let {logs} = await instance.issueTokens(alice, 10, {from: bob})
    // Then
    assert.equal(0, logs.length)
  });

  it("should make your allowance for your own account always equal your balance", async () => {
    // Given
    let instance = await ETFToken.deployed()
    await instance.issueTokens(alice, 100, {from: owner})
    let aliceBalanceBefore = await instance.balanceOf.call(alice)
    // When
    await instance.approve.call(alice, 20, {from: alice})
    let allowance = await instance.allowance.call(alice, alice)
    // Then
    assert.equal(aliceBalanceBefore.toNumber(), allowance.toNumber())
  });

  it("should increase someone's allowance when you approve them", async () => {
    // Given
    let instance = await ETFToken.deployed()
    await instance.approve(alice, 5, {from: bob})
    // When
    let allowance = await instance.allowance.call(bob, alice)
    // Then
    assert.equal(5, allowance.toNumber())
  });

  it("should send an Approval event when you approve someone's allowance", async () => {
    // Given
    let instance = await ETFToken.deployed()
    // When
    let {logs} = await instance.approve(alice, 3, {from: bob})
    // Then
    let expectedApproval = { event: 'Approval', args: { _owner: bob, _spender: alice, _value: 3 }}
    assert.equal(1, logs.length)
    assertEventsEqual(expectedApproval, logs[0])
  });

  it("should let you transfer someone else's tokens if it is less than your allowance", async () => {
    // Given
    let instance = await ETFToken.deployed()
    await instance.issueTokens(bob, 100, {from: owner})
    await instance.issueTokens(alice, 100, {from: owner})
    let bobBalanceBefore = await instance.balanceOf.call(bob)
    let aliceBalanceBefore = await instance.balanceOf.call(alice)
    await instance.approve(alice, 20, {from: bob})
    // When
    await instance.transferFrom(bob, alice, 5, {from: alice})
    // Then
    assert.equal(bobBalanceBefore.toNumber() - 5, (await instance.balanceOf.call(bob)).toNumber())
    assert.equal(aliceBalanceBefore.toNumber() + 5, (await instance.balanceOf.call(alice)).toNumber())
  });

  it("should let you transfer someone else's tokens if it is equal to your allowance", async () => {
    // Given
    let instance = await ETFToken.deployed()
    await instance.issueTokens(bob, 100, {from: owner})
    await instance.issueTokens(alice, 100, {from: owner})
    let bobBalanceBefore = await instance.balanceOf.call(bob)
    let aliceBalanceBefore = await instance.balanceOf.call(alice)
    await instance.approve(alice, 5, {from: bob})
    // When
    await instance.transferFrom(bob, alice, 5, {from: alice})
    // Then
    assert.equal(bobBalanceBefore.toNumber() - 5, (await instance.balanceOf.call(bob)).toNumber())
    assert.equal(aliceBalanceBefore.toNumber() + 5, (await instance.balanceOf.call(alice)).toNumber())
  });

  it("should not let you transfer someone else's tokens if it is over your allowance", async () => {
    // Given
    let instance = await ETFToken.deployed()
    await instance.issueTokens(bob, 100, {from: owner})
    await instance.issueTokens(alice, 100, {from: owner})
    let bobBalanceBefore = await instance.balanceOf.call(bob)
    let aliceBalanceBefore = await instance.balanceOf.call(alice)
    await instance.approve(alice, 5, {from: bob})
    // When
    await instance.transferFrom(bob, alice, 10, {from: alice})
    // Then
    assert.equal(bobBalanceBefore.toNumber(), (await instance.balanceOf.call(bob)).toNumber())
    assert.equal(aliceBalanceBefore.toNumber(), (await instance.balanceOf.call(alice)).toNumber())
  });

  it("should let you transfer someone elses tokens to a third party if it is over your allowance", async () => {
    // Given
    let instance = await ETFToken.deployed()
    await instance.issueTokens(bob, 100, {from: owner})
    await instance.issueTokens(alice, 200, {from: owner})
    await instance.issueTokens(claire, 300, {from: owner})
    let bobBalanceBefore = await instance.balanceOf.call(bob)
    let aliceBalanceBefore = await instance.balanceOf.call(alice)
    let claireBalanceBefore = await instance.balanceOf.call(claire)
    await instance.approve(alice, 10, {from: bob})
    // When
    await instance.transferFrom(bob, claire, 10, {from: alice})
    // Then
    assert.equal(bobBalanceBefore.toNumber() - 10, (await instance.balanceOf.call(bob)).toNumber())
    assert.equal(aliceBalanceBefore.toNumber(), (await instance.balanceOf.call(alice)).toNumber())
    assert.equal(claireBalanceBefore.toNumber() + 10, (await instance.balanceOf.call(claire)).toNumber())
  });
});

function initTestTokens(accounts) {
  let {owner, alice, bob, claire} = nameAccounts(accounts);
  return Promise.all([
    PartyToken.deployed().then(ct => ct.issueTokens(alice, 100)),
    FiestaToken.deployed().then(ct => ct.issueTokens(bob, 500)),
    CarnivalToken.deployed().then(ct => ct.issueTokens(claire, 1000))
  ]).then(([party, fiest, carnival]) => true)
}

function assertEventsEqual(expected, actual) {
  assert.equal(expected.event, actual.event)
  assert.deepEqual(toJS(expected.args), toJS(actual.args))
}

function toJS(value) {
  if (typeof value === 'object') {
    if (typeof value.toNumber === 'function') {
      return value.toNumber()
    } else {
      let result = {}
      for (var p in value) {
        result[p] = toJS(value[p])
      }
      return result
    }
  } else {
    return value
  }
}

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
