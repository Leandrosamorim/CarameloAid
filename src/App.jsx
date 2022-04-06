import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [count, setCount] = useState("");
  const [allChimken, setAllChimken] = useState([]);
  const contractAddress = "0xa941B73248aFBAccCb6b2139455f740B1d1eAB42";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllChimken();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getAllChimken = async () => {
    try{
      const {ethereum} = window;
      if (ethereum){
         const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const chimkens = await wavePortalContract.getAllChimken();
         const chimkenCleaned = chimkens.map(chimken => {
           return {
             address: chimken.sharer,
             timestamp: new Date(chimken.timestamp * 1000),
            message: chimken.message
           }
         })

        /*
         * Store our data in React State
         */
        setAllChimken(chimkenCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
      }
    }

  const countChimken = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const chimkenCount = await wavePortalContract.getTotalChimken();
        setCount(chimkenCount.toNumber())
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }



  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const share = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
        * Execute the actual wave from your smart contract
        */
        const msg = document.getElementById("txt").value;
        const waveTxn = await wavePortalContract.shareChimken(msg, {gasLimit: 300000});
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait()
        console.log("Mined -- ", waveTxn.hash);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
}



  useEffect(() => {
    checkIfWalletIsConnected();
    countChimken();
    currentAccount ? getAllChimken() : null ;
    let wavePortalContract;

    const onNewShare = (from, timestamp, message) => {
      console.log("NewChimken", from, timestamp, message);
      setAllChimken(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewChimken", onNewShare);
    }
    return () => {
      if(wavePortalContract) {
        wavePortalContract.off("NewChimken", onNewShare);
      }
    };
  }, []);

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        {currentAccount ?
      <div>
              <div className="header">
        <img src = 'src/caramelo.png'/> Hello hooman!
        </div>
        <div className="hungry">
        Are you eating whole chimken alone? <b>*smells the air*</b>
        </div>
        <div id="form">
          <input
        type="text"
        id = "txt"
      />
            <button className="waveButton" onClick={share}>
          Share chimken
        </button>
          </div>
        
        <div className="tableContainer">
                  <table>
                    <th scope="col" width="1">Address</th><th scope="col" width="1">Time</th><th scope="col" width="1">Message</th>
                    <tbody>
                      {allChimken.map((chimken, index) => {
        return(
          <tr key= {index}><td>{chimken.address}</td>
            <td>{chimken.timestamp.toLocaleDateString("pt-BR")}</td>
<td>{chimken.message}</td></tr>
                    
        )

            
          
        })}</tbody> </table>
          </div>
        

        </div>   : <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        }
      </div>
      {count ? 
      <p>I ate {count} chimken today!</p> : null}
    </div>
  );
}
export default App
