pragma solidity ^0.4.11;


/**
 * This token is not currently ERC20 compliant as it does not implement the following:
 *
 *   function approve(address _spender, uint _value) returns (bool success)
 *   function allowance(address _owner, address _spender) constant returns (uint remaining)
 *   event Approval(address indexed _owner, address indexed _spender, uint _value)
 */
contract ETFToken {

    // Owners 
    mapping (address => uint) balances;

    address public owner;
    uint public supply;

    /**
     * See https://github.com/ethereum/EIPs/issues/20#Transfer
     */
    event Transfer(address indexed _from, address indexed _to, uint _value);

    // /**
    //  * Fired when new tokens are issued
    //  */
    event Issue(uint _value);

    function ETFToken() {
        owner = tx.origin;
    }

    /**
     * See https://github.com/ethereum/EIPs/issues/20#totalSupply
     */
    function totalSupply() constant returns (uint totalSupply) {
        return supply;
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
        // We don't really hava a use for this function, but adding it for ERC20 compliance. It will fail
        // if the sender is not the account that funds are being transfered from.
        if (_from == msg.sender) {
            return doTransfer(msg.sender, _to, _value);
        } else {
            return false;
        }
    }

    /**
     * See https://github.com/ethereum/EIPs/issues/20#transferFrom#balanceOf
     */
    function balanceOf(address _owner) returns(uint) {
        return balances[_owner];
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
        // ...and then transferred as normal
        doTransfer(this, _recipient, _value);
        Issue(_value);
        return true;
    }

    /**
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
