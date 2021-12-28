const sdk = require("@defillama/sdk")	//The base
const ITVL = [
  {
    "inputs": [],
    "name": "pool2",	//POOL2 TVL : 1e18 === 1 USD
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "staking",	//STAKING TVL : 1e18 === 1 USD
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tvl",	//GLOABL TVL : 1e18 === 1 USD
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
  "inputs": [],
  "name": "usd",	//On-chain USD Reference Token
  "outputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "stateMutability": "view",
  "type": "function"
  }
]
const tvlGuru = "0x3f0458FfB6D106d2F5CdeC9CEdc9054A69275489";	//On-Chain Universal TVL Finder
const USD = "fantom:0x04068DA6C83AFCFA0e13ba15A6696662335D5B75";	//same as abi.call({target:tvlGuru,abi:ITVL["usd"]})
//NOTE: USDC===fantom:USDC is used explicitly to reduce EVM calls by this adapter. It makes this process faster.
async function pool2(timestamp,block) {
	let _pool2 = await sdk.api.abi.call({
  	target: tvlGuru,
  	abi: ITVL["pool2"],
  	block: blocknumber,
  	chain: 'fantom'
	});
	return({USD:((_pool2.output)/(1e12)).toFixed(0)});
	//Divide by 1e12 because _pool2.output has 18 & USDC has 6 decimals.
}
async function staking(timestamp,block) {
	let _staking = await sdk.api.abi.call({
  	target: tvlGuru,
  	abi: ITVL["staking"],
  	block: blocknumber,
  	chain: 'fantom'
	});
	return({USD:((_staking.output)/(1e12)).toFixed(0)});
	//Divide by 1e12 because _staking.output has 18 & USDC has 6 decimals.
}
async function tvl(timestamp,block) {
	let _tvl = await sdk.api.abi.call({
  	target: tvlGuru,
  	abi: ITVL["tvl"],
  	block: blocknumber,
  	chain: 'fantom'
	});
	return({USD:((_tvl.output)/(1e12)).toFixed(0)});
	//Divide by 1e12 because _tvl.output has 18 & USDC has 6 decimals.
}
module.exports = {
  methodology: "USD-denominated aggregation of most Locked assets held across ftm.guru's contracts, powered by direct on-chain storage of quantity, pools and prices using ftm.guru's Universal TVL Finder Tool (tvlGuru.sol). More detailed documentation of TVL is available at https://ftm.guru/rawdata/tvl",
  fantom: {
    pool2: pool2,
    staking: staking,
    tvl: tvl
  }
}
