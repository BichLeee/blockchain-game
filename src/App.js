// App.js
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import BettingGame from "./abis/BettingGame.json";
import { BigInt } from 'global';

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [betAmount, setBetAmount] = useState(0);
  const [betId, setBetId] = useState(null);
  const [betResult, setBetResult] = useState(null);

  console.log(accounts);

  useEffect(() => {
    async function loadWeb3() {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setWeb3(web3Instance);

        const accounts = await web3Instance.eth.getAccounts();
        setAccounts(accounts);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = BettingGame.networks[networkId];
        const contractInstance = new web3Instance.eth.Contract(
          BettingGame.abi,
          deployedNetwork && deployedNetwork.address
        );
        setContract(contractInstance);
      }
    }
    loadWeb3();
  }, []);

  const placeBet = async (isHead) => {
    if (contract && accounts.length > 0) {
      await contract.methods.placeBet(isHead).send({
        from: accounts[0],
        value: web3.utils.toWei(betAmount, "ether"),
      });
      const currentBetId = await contract.methods.betId().call();
      setBetId(BigInt(currentBetId) - BigInt(1));
    }
  };

  const resolveBet = async () => {
    try {
      if (contract && accounts.length > 0 && betId !== null) {
        await contract.methods.resolveBet(betId).send({ from: accounts[0] });
        const betResultEvent = await contract.getPastEvents("BetResult", {
          filter: { betId: betId },
          fromBlock: "latest",
        });
        setBetResult(betResultEvent[0].returnValues);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h1>Coin Flip Betting Game</h1>
      <input
        type="number"
        value={betAmount}
        onChange={(e) => setBetAmount(e.target.value)}
        placeholder="Bet amount in Ether"
      />
      <button onClick={() => placeBet(true)}>Bet on Heads</button>
      <button onClick={() => placeBet(false)}>Bet on Tails</button>
      <button onClick={resolveBet}>Resolve Bet</button>

      {betResult && (
        <div>
          <h2>Bet Result</h2>
          <p>Player: {betResult.player}</p>
          <p>Amount: {web3.utils.fromWei(betResult.amount, "ether")} Ether</p>
          <p>Win: {betResult.win ? "Yes" : "No"}</p>
        </div>
      )}
    </div>
  );
}

export default App;

// import { useEffect, useState } from "react";
// import Web3 from "web3";

// import BettingGame from "./abis/BettingGame.json";

// import "./App.css";

// function App() {
//   const [account, setAccount] = useState("0x0");
//   const [token, setToken] = useState(null);
//   const [totalSupply, setTotalSupply] = useState(0);
//   const [tokenURIs, setTokenURIs] = useState([]);

//   const [flip, setFlip] = useState(false);

//   const loadWeb3 = async () => {
//     if (window.ethereum) {
//       window.web3 = new Web3(window.ethereum);
//       await window.ethereum.enable();
//     } else if (window.web3) {
//       window.web3 = new Web3(window.web3.currentProvider);
//     } else {
//       window.alert(
//         "Non-Ethereum browser detected. You should consider trying MetaMask!"
//       );
//     }
//   };
//   const loadBlockChainData = async () => {
//     const web3 = window.web3;
//     const accounts = await web3.eth.getAccounts();
//     console.log("account", accounts[0]);
//     setAccount(accounts[0]);

//     //load smart contract
//     const networkId = await web3.eth.net.getId();
//     const networdData = BettingGame.networks[networkId];
//     if (networdData) {
//       const abi = BettingGame.abi;
//       const address = networdData.address;
//       const token = new web3.eth.Contract(abi, address);
//       setToken(token);

//       const totalSupply = await token.methods.totalSupply().call();
//       setTotalSupply(totalSupply);

//       //load tokens
//       let balanceOf = await token.methods.balanceOf(accounts[0]).call();
//       for (let i = 0; i < balanceOf; i++) {
//         let id = await token.methods.tokenOfOwnerByIndex(accounts[0], i).call();
//         let tokenURI = await token.methods.tokenURI(id).call();
//         setTokenURIs((prev) => ({ ...prev, tokenURI }));
//       }
//     } else {
//       window.alert("Smart contract not deployed to detected network.");
//     }
//     console.log(networkId);
//   };

//   useEffect(() => {
//     loadWeb3();
//     loadBlockChainData();
//   }, []);
//   return (
//     <div className="App">
//       <div>Account: {account}</div>
//     </div>
//   );
// }

// export default App;
