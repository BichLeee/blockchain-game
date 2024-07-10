pragma solidity ^0.5.0;

import "./ERC721Full.sol";

contract MyToken is ERC721Full {
    constructor() public ERC721Full("My Token", "MY TOKEN") {}
}
