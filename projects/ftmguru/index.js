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
const tvlGuru = "0x0786c3a78f5133F08C1c70953B8B10376bC6dCad";   //On-Chain Universal TVL Finder
const USD = "fantom:0x04068DA6C83AFCFA0e13ba15A6696662335D5B75";   //same as abi.call({target:tvlGuru,abi:ITVL[3]})
//NOTE: USD===fantom:USDC is used explicitly to reduce EVM calls by this adapter. It makes this process faster.
async function pool2(timestamp,block) {
   let _pool2 = await sdk.api.abi.call({
    target: tvlGuru,
    abi: ITVL[0],
    block: block,
    chain: 'fantom'
   });
   let balances={}
   balances[USD]=(Number(_pool2.output)/1e12).toFixed(0)
   return balances;
}
async function staking(timestamp,block) {
   let _staking = await sdk.api.abi.call({
    target: tvlGuru,
    abi: ITVL[1],
    block: block,
    chain: 'fantom'
   });
   let balances={}
   balances[USD]=(Number(_staking.output)/1e12).toFixed(0)
   return balances;
}
async function tvl(timestamp,block) {
   let _tvl = await sdk.api.abi.call({
    target: tvlGuru,
    abi: ITVL[2],
    block: block,
    chain: 'fantom'
   });
   let balances={}
   balances[USD]=(Number(_tvl.output)/1e12).toFixed(0)
   return balances;
}
module.exports = {
 methodology: "USD-denominated value aggregation of most Locked assets held across ftm.guru's contracts, powered by direct on-chain storage of quantity, pools and prices using ftm.guru's Universal TVL Finder Tool (tvlGuru.sol). More detailed documentation of TVL is available at https://ftm.guru/rawdata/tvl",
 fantom: {
   pool2: pool2,
   staking: staking,
   tvl: tvl
 },
}
