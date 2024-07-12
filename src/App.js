import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  Modal,
  InputGroup,
  Navbar,
  Form,
} from "react-bootstrap";
import Web3 from "web3";
import { BigInt } from "global";

import BettingGame from "./abis/BettingGame.json";

import "./App.css";

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [betAmount, setBetAmount] = useState(0);
  const [betId, setBetId] = useState(null);
  const [betResult, setBetResult] = useState(null);
  const [isBetting, setIsBetting] = useState(null);

  const [showAlert, setShowAlert] = useState(false);

  console.log(accounts);

  useEffect(() => {
    async function loadWeb3() {
      try {
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
      } catch (err) {
        console.log(err);
      }
    }
    loadWeb3();
  }, []);

  const placeBet = async (isPig) => {
    try {
      if (contract && accounts.length > 0) {
        await contract.methods.placeBet(isPig).send({
          from: accounts[0],
          value: web3.utils.toWei(betAmount, "ether"),
        });
        const currentBetId = await contract.methods.betId().call();
        setBetId(BigInt(currentBetId) - BigInt(1));
      }
    } catch (err) {
      //denied transaction signature
      console.log(err);
      setIsBetting(null);
    }
  };

  const resolveBet = async () => {
    try {
      if (contract && accounts.length > 0 && betId !== null) {
        await contract.methods.resolveBet(betId).send({ from: accounts[0] });
        contract
          .getPastEvents("BetResult", {
            filter: { betId: betId },
            fromBlock: "latest",
          })
          .then((betResultEvent) => {
            console.log(betResultEvent);
            setBetResult(betResultEvent[0].returnValues);
            setShowAlert(true);
          })
          .catch((err) => console.log(err));
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsBetting(null);
    }
  };

  const handleBetting = (isPig) => {
    setIsBetting(isPig);
    placeBet(isPig);
  };

  return (
    <div className="App">
      <Navbar>
        <Container>
          <Navbar.Brand href="#home">Betting Game</Navbar.Brand>
          <div className="account">{accounts[0]}</div>
        </Container>
      </Navbar>
      {accounts.length !== 0 && (
        <Container style={{ paddingTop: "20px" }}>
          <img src="./coin.gif" style={{ maxWidth: "300px" }} />

          <div style={{ textAlign: "-webkit-center", marginBottom: "30px" }}>
            <InputGroup className="amount">
              <Form.Control
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                type="number"
                step={0.1}
                placeholder="Bet amount"
              />
              <InputGroup.Text>ETH</InputGroup.Text>
            </InputGroup>
          </div>
          <h6 style={{ color: "white", fontWeight: "normal" }}>
            You will bet on ...
          </h6>
          <Button
            className={`bet-button ${isBetting === true ? "choosing" : ""}`}
            variant="light"
            onClick={() => handleBetting(true)}
            disabled={isBetting !== null}
          >
            <span>🐷</span> <br />
            Pig
          </Button>
          <Button
            className={`bet-button ${isBetting === false ? "choosing" : ""}`}
            variant="light"
            onClick={() => handleBetting(false)}
            disabled={isBetting !== null}
          >
            <span>🍦</span> <br />
            Ice cream
          </Button>
          <div style={{ marginTop: "50px" }}>
            <Button
              variant="warning"
              onClick={resolveBet}
              disabled={isBetting === null}
            >
              Resolve Bet
            </Button>
          </div>
          <Modal
            size="sm"
            show={showAlert}
            centered
            onHide={() => setShowAlert(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-vcenter">
                Bet Result
              </Modal.Title>
            </Modal.Header>
            {betResult && (
              <Modal.Body
                style={{
                  textAlign: "center",
                  minHeight: "100px",
                  marginTop: "20px",
                }}
              >
                <h5>{betResult.win ? "Win 🎆" : "Lose 🥺"}</h5>
                <p>
                  {betResult.win
                    ? `${web3.utils.fromWei(betResult.amount, "ether")}  ETH`
                    : ""}
                </p>
              </Modal.Body>
            )}
          </Modal>
        </Container>
      )}
      {accounts.length === 0 && (
        <h6 style={{ marginTop: "100px", color: "white" }}>
          Waiting for connection...
        </h6>
      )}
    </div>
  );
}

export default App;
