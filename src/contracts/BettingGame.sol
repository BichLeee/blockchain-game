// BettingGame.sol
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BettingGame is ERC721 {
    uint256 public betId;

    event BetPlaced(
        address indexed player,
        uint256 amount,
        uint256 betId,
        bool isHead
    );
    event BetResult(
        address indexed player,
        uint256 amount,
        bool win,
        uint256 betId
    );

    struct Bet {
        address player;
        uint256 amount;
        bool isHead;
    }

    mapping(uint256 => Bet) public bets;

    constructor() ERC721("BettingGame", "BET") {}

    function placeBet(bool _isHead) public payable {
        require(msg.value > 0, "Bet amount must be greater than zero");

        bets[betId] = Bet({
            player: msg.sender,
            amount: msg.value,
            isHead: _isHead
        });

        emit BetPlaced(msg.sender, msg.value, betId, _isHead);

        betId++;
    }

    function resolveBet(uint256 _betId) public {
        require(_betId < betId, "Invalid bet ID");
        Bet memory bet = bets[_betId];

        require(msg.sender == bet.player, "Not authorized");

        // Get the block hash of the previous block
        bytes32 blockHash = blockhash(block.number - 1);

        // Extract the first 5 bytes (10 hex characters) of the block hash
        uint40 firstFiveBytes = uint40(uint256(blockHash) >> (256 - 40));

        // Generate a random value using the extracted bytes
        bool outcome = firstFiveBytes % 2 == 0;

        bool win = (bet.isHead == outcome);
        uint256 payout = win ? bet.amount * 2 : 0;

        payable(bet.player).transfer(payout);
        emit BetResult(bet.player, payout, win, _betId);
    }
}
