const { addFundsInMasterChef } = require("../helper/masterchef.js");
const masterchefAddress = '0x8459d87618e45dc801bc384ea60596ddb7223aae';

const abiPoolInfo = {
  "poolInfo": {
    "inputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "name": "poolInfo",
    "outputs": [
        {
            "internalType": "contract IBEP20",
            "name": "lpToken",
            "type": "address"
        },
        {
            "internalType": "uint256",
            "name": "allocPoint",
            "type": "uint256"
        },
        {
            "internalType": "uint256",
            "name": "lastRewardBlock",
            "type": "uint256"
        },
        {
            "internalType": "uint256",
            "name": "accCakePerShare",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
  },
};

async function tvl(timestamp, chain, chainBlocks) {
  let balances = {};
  await addFundsInMasterChef(balances, masterchefAddress, chainBlocks.bsc, "bsc", addr=>`bsc:${addr}`, abiPoolInfo.poolInfo, [], true);
  return balances;
}

module.exports = {
  methodology: "The most powerful decentralized limit orders on Binance Smart Chain",
  bsc:{
    tvl,
  },
};
