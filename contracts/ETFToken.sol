pragma solidity ^0.4.11;
import "./OwnedToken.sol";
import "./ERC20.sol";


/**
 * 
 */
contract ETFToken is OwnedToken {

    bool public tradingEnabled = false;

    mapping (address => uint) tokenWeightings;
    ERC20[] tokenTypes;

    event IdealWeightingsChanged(address[] tokens, uint[] weightings);

    modifier ownerOnly() {
        require(msg.sender == owner);
        _;
    }

    modifier tradingOpen() {
        require(tradingEnabled);
        _;
    }

    modifier tradingClosed() {
        require(!tradingEnabled);
        _;
    }

    modifier authorizedParticipant() {
        // currently anyone is authorized
        _;
    }

    function ETFToken() {
    }

    /**
     *  Halt trading. Shares may not be issued or redeemed unless trading is active
     *
     */
    function haltTrading() ownerOnly {
        tradingEnabled = true;
    }

    /**
     *  Resume trading. Shares may not be issued or redeemed unless trading is active
     *
     */
    function resumeTrading() ownerOnly {
        require(tokenTypes.length > 0);
        tradingEnabled = false;
    }
    
    /**
     * Update the assets and the ratios which make up a share.
     * This is an owner action for updating the structure of the ETF.
     * For now this may only be done once. This restriction will be lifted later.
     */
    function setTokenWeightings(address[] _tokens, uint[] _weightings) ownerOnly tradingClosed {
        require(_tokens.length == _weightings.length);
        tokenTypes.length = 0;
        for (uint8 i = 0; i < _tokens.length; i++) {
            tokenWeightings[_tokens[i]] = _weightings[i];
            tokenTypes[i] = ERC20(_tokens[i]);
        }
        IdealWeightingsChanged(_tokens, _weightings);
    }

    /**
     * Convert a basket of tokens into a single ETF token.
     */
    function createETFTokensFrom(address[] _tokens, uint[] _amounts) tradingOpen authorizedParticipant {
        if (validateSubmittedTokenBasket(_tokens, _amounts)) {
            
        }
    }

    /**
     * Convert an ETF token into a basket of underlying tokens.
     */
    function redeemETFTokensTo(address _token, uint _weighting) tradingOpen authorizedParticipant {
        // TODO Implement this!
        throw;
    }

    /**
     * 
     */
    function validateSubmittedTokenBasket(address[] _tokens, uint[] _amounts) private returns(bool) {
        if (!verifyTokenTypes(_tokens) || _amounts.length != tokenTypes.length) {
            return false;
        }
        // Put the _amounts in the same order as the stored tokenTypes...
        uint[] memory amounts = reorderAmounts(_tokens, _amounts);
        // ...ie the same order as these ratios:
        ufixed0x32[] memory ratios = calculateIdealTokenBasketRatios();
        uint amountsTotal = sumArray(amounts);
        for (uint i = 0; i < amounts.length; i++) {
            ufixed0x32 difference = ratios[i] - ufixed0x32(amounts[i]) / ufixed0x32(amountsTotal);
            // TODO This is pretty arbitrary. We need a more rigorous definition of "close enough"
            // Also should choose the appropriate ufixed0xXX type for the precision we need.
            if (difference < ufixed0x32(-0.00001) || difference > ufixed0x32(0.00001)) {
                return false;
            }
        }
        return true;
    }

    function verifyTokenTypes(address[] _tokens) private returns(bool) {
        if (_tokens.length != tokenTypes.length) {
            return false;
        }
        for (uint i = 0; i < _tokens.length; i++) {
            if (!isTokenInIdealBasket(_tokens[i])) {
                return false;
            }
        }
    }

    // Puts the given amounts into the same order as the tokens in the tokenTypes array
    function reorderAmounts(address[] _tokens, uint[] _amounts) private returns(uint[]) {
        uint[] memory amounts = new uint[](_tokens.length);
        // This is O(n^2) in the number of tokens. From my current understanding, mappings can't be 
        // created locally, so the alternative is _quite_ complex, but not impossible.
        for (uint i = 0; i < _tokens.length; i++) {
            amounts[uint(getTokenIndex(_tokens[i]))] = _amounts[i];
        }
        return amounts;
    }

    function getTokenIndex(address _token) private returns(int) {
        for (uint i = 0; i < tokenTypes.length; i++) {
            if (tokenTypes[i] == _token) {
                return int(i);
            }
        }
        return -1;
    }

    function isTokenInIdealBasket(address _token) private returns(bool inBasket) {
        return tokenWeightings[_token] > 0;
    }

    function sumArray(uint[] _array) private returns(uint total) {
        for (uint i = 0; i < _array.length; i++) {
            total += _array[i];
        }
    }

    function sumTokenWeightings() private returns(uint total) {
        for (uint i = 0; i < tokenTypes.length; i++) {
            total += tokenWeightings[tokenTypes[i]];
        }
    }

    // Calculates the weighting ratios of all the tokens in an ideal basket. The sum should be (approx) 1.
    function calculateIdealTokenBasketRatios() private returns(ufixed0x32[]) {
        uint totalWeight = sumTokenWeightings();
        ufixed0x32[] memory ratios = new ufixed0x32[](tokenTypes.length);
        for (uint i = 0; i < tokenTypes.length; i++) {
            ratios[i] = ufixed0x32(tokenWeightings[tokenTypes[i]]) / ufixed0x32(totalWeight);
        }
        return ratios;
    }
}
