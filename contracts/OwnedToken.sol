pragma solidity ^0.4.11;


/**
 * And ERC20-compliant token, which operates by having a single owner, who can issue 
 * new tokens. There is no other way to issue tokens.
 *
 */
contract OwnedToken {

    mapping (address => uint) balances;
    mapping (address => mapping (address => uint)) approvals;

    address public owner;
    uint public supply;

    /**
     * See https://github.com/ethereum/EIPs/issues/20#Transfer
     */
    event Transfer(address indexed _from, address indexed _to, uint _value);

    /**
     * See https://github.com/ethereum/EIPs/issues/20#Approval
     */
    event Approval(address indexed _owner, address indexed _spender, uint _value);

    /**
     * Fired when new tokens are issued
     */
    event Issue(uint _newTotal, uint _amountIssued);

    /**
     * Fired when existing tokens are destroyed
     */ 
    event Destroy(uint _newTotal, uint _amountDestroyed);

    function OwnedToken() {
        owner = tx.origin;
    }

    /**
     * See https://github.com/ethereum/EIPs/issues/20#totalSupply
     */
    function totalSupply() constant returns (uint totalSupply) {
        return supply;
    }

    /**
     * See https://github.com/ethereum/EIPs/issues/20#balanceOf
     */
    function balanceOf(address _owner) returns(uint) {
        return balances[_owner];
    }

    /**
     * See https://github.com/ethereum/EIPs/issues/20#transfer
     */
    function transfer(address _to, uint _value) returns(bool sufficient) {
        return doTransfer(msg.sender, _to, _value);
    }

    /**
     * See https://github.com/ethereum/EIPs/issues/20#transferFrom
     */
    function transferFrom(address _from, address _to, uint _value) returns(bool sufficient) {
        if (_from == msg.sender) {
            // Transfer your own tokens
            return doTransfer(msg.sender, _to, _value);
        } else if (allowance(_from, msg.sender) >= _value) {
            // Transfer someone else's tokens. First deduct from your allowance
            approvals[_from][msg.sender] -= _value;
            return doTransfer(_from, _to, _value);
        } else {
            return false;
        }
    }

    /**
     * See https://github.com/ethereum/EIPs/issues/20#approve
     */
    function approve(address _spender, uint _value) returns (bool success) {
        approvals[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     * See https://github.com/ethereum/EIPs/issues/20#allowance
     */
    function allowance(address _owner, address _spender) constant returns (uint remaining) {
        if (_owner == _spender) {
            return balanceOf(_owner);
        } else {
            return approvals[_owner][_spender];
        }
    }

    /**
     * Mint some new tokens and send them to an address.
     */
    function issueTokens(address _recipient, uint _value) returns(bool success) {
        if (msg.sender != owner) {
            return false;
        }
        // New tokens are first created in the mint...
        balances[this] += _value;
        supply += _value;
        Issue(supply, _value);
        // ...and then transferred as normal
        return _recipient == address(this) || doTransfer(this, _recipient, _value);
    }

    /**
     * Destroy tokens belonging to _holder
     * Returns true if successful; false if the tokens could not be destroyed.
     * One possible reason for failure is that the specified account did not have enough balance.
     */
    function destroyTokens(address _holder, uint _value) returns(bool success) {
        if (msg.sender != owner) {
            return false;
        }
        if (balances[_holder] < _value) {
            return false;
        }
        // First transfer the tokens to self
        if (_holder == address(this) || doTransfer(_holder, this, _value)) {
            balances[this] -= _value;
            supply -= _value;
            Destroy(supply, _value);
            return true;
        } else {
            return false;
        }
    }

    /*
     * Transfer funds with no checks on whether the message sender is permitted to do that. Those checks
     * should be in the calling function.
     */
    function doTransfer(address _from, address _to, uint _value) private returns(bool sufficient) {
        if (balances[_from] < _value) {
            return false;
        }
        balances[_from] -= _value;
        balances[_to] += _value;
        Transfer(_from, _to, _value);
        return true;
    }
}
