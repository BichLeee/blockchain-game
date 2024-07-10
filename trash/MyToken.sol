pragma solidity ^0.8.20;

import "./ERC721Full.sol";

contract MyToken is ERC721Full {
    constructor() public ERC721Full("My Token", "MY TOKEN") {}

    function mint(address _to, string memory _tokenURI) public returns (bool) {
        uint _tokenId = totalSupply().add(1);
        // totalSupply return number of token already existed
        // using it as a ID for new token
        _mint(_to, _tokenId);
        _setTokenURI(_tokenId, _tokenURI);
        return true;
    }
}
