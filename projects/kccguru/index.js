const sdk = require("@defillama/sdk")
const ITVL = [
 {
   "inputs": [],
   "name": "pool2",   //POOL2 TVL : 1e18 === 1 USD
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
   "name": "staking",   //STAKING TVL : 1e18 === 1 USD
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
   "name": "tvl",   //GLOABL TVL : 1e18 === 1 USD
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
 "name": "usd",   //On-chain USD Reference Token
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
const tvlGuru = "0x426a4A4B73d4CD173C9aB78d18c0d79d1717eaA9";   //On-Chain Universal TVL Finder
const USD = "kcc:0x0039f574eE5cC39bdD162E9A88e3EB1f111bAF48";   //same as abi.call({target:tvlGuru,abi:ITVL["usd"]})
//NOTE: USD===kcc:USDT is used explicitly to reduce EVM calls by this adapter. It makes this process faster.
async function pool2(timestamp,block) {
   let _pool2 = await sdk.api.abi.call({
    target: tvlGuru,
    abi: ITVL[0],
    block: block,
    chain: 'kcc'
   });
   let balances={}
   balances[USD]=(_pool2.output)
   return balances;
}
async function staking(timestamp,block) {
   let _staking = await sdk.api.abi.call({
    target: tvlGuru,
    abi: ITVL[1],
    block: block,
    chain: 'kcc'
   });
   let balances={}
   balances[USD]=(_staking.output)
   return balances;
}
async function tvl(timestamp,block) {
   let _tvl = await sdk.api.abi.call({
    target: tvlGuru,
    abi: ITVL[2],
    block: block,
    chain: 'kcc'
   });
   let balances={}
   balances[USD]=(_tvl.output)
   return balances;
}
module.exports = {
 methodology: "USD-denominated value aggregation of most Locked assets held across kcc.guru's & Kompound Protocol's smart contracts, powered by direct on-chain storage of quantity, pools and prices using ftm.guru's Universal TVL Finder Tool (tvlGuru.sol). More detailed documentation of TVL is available at https://ftm.guru/rawdata/tvl",
 kcc: {
   pool2: pool2,
   staking: staking,
   tvl: tvl
 },
}
