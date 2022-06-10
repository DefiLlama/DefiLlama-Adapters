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

//	TvlGuru:	On-Chain Universal TVL Finder
const tvlGuru = {
	"ftm"	:	"0x0786c3a78f5133F08C1c70953B8B10376bC6dCad",
	"kcc"	:	"0x426a4A4B73d4CD173C9aB78d18c0d79d1717eaA9",
	"mtv"	:	"0xe345A50C33e5c9D0284D6fF0b891c4Fc99a9C117",
	"ech"	:	"0x5C652A94c672f8F6D021417bB5eE75c322ecf1Fc"
}
//const tvlGuru = "0xe345A50C33e5c9D0284D6fF0b891c4Fc99a9C117";   //On-Chain Universal TVL Finder

//const USD = "0xEa1199d50Ee09fA8062fd9dA3D55C6F90C1bABd2";   //same as abi.call({target:tvlGuru,abi:ITVL["usd"]})
//NOTE: USD===multivac:USDC is used explicitly to reduce EVM calls by this adapter. It makes this process faster.
//temporary hack: New chain's USDC represented as Mainnet USDC
//    "multivac:0xEa1199d50Ee09fA8062fd9dA3D55C6F90C1bABd2": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
//    //Bridged USDC -> Mainnet USDC
const USD = {
	"ftm"	:	"fantom:0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
	"kcc"	:	"kcc:0x0039f574eE5cC39bdD162E9A88e3EB1f111bAF48",
	"mtv"	:	"0x6B175474E89094C44Da98b954EedeAC495271d0F",	//Rep. Mainnet DAI
	"ech"	:	"0x6B175474E89094C44Da98b954EedeAC495271d0F"	//Rep. Mainnet DAI
}
//const USD.mtv = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
//const USD.ech = "0xc42974d6554F9054265b477723C3f689d8699239";



module.exports = {
	methodology: "USD-denominated value aggregation of most Locked assets held across Guru Network's & Kompound Protocol's smart contracts across multiple chains, powered by direct on-chain storage of quantity, pools and prices using ftm.guru's Universal TVL Finder Tool (tvlGuru.sol). More detailed documentation of TVL is available at https://ftm.guru/rawdata/tvl",
	fantom: {
		pool2:	{ [USD.ftm] : ( await sdk.api.abi.call({target: tvlGuru.ftm, abi: ITVL[0], block: block, chain: 'fantom'}) ).output },
		staking:{ [USD.ftm] : ( await sdk.api.abi.call({target: tvlGuru.ftm, abi: ITVL[0], block: block, chain: 'fantom'}) ).output },
		tvl:	{ [USD.ftm] : ( await sdk.api.abi.call({target: tvlGuru.ftm, abi: ITVL[0], block: block, chain: 'fantom'}) ).output }
	},
	kcc: {
		pool2:	{ [USD.kcc] : ( await sdk.api.abi.call({target: tvlGuru.kcc, abi: ITVL[0], block: block, chain: 'kcc'}) ).output },
		staking:{ [USD.kcc] : ( await sdk.api.abi.call({target: tvlGuru.kcc, abi: ITVL[0], block: block, chain: 'kcc'}) ).output },
		tvl:	{ [USD.kcc] : ( await sdk.api.abi.call({target: tvlGuru.kcc, abi: ITVL[0], block: block, chain: 'kcc'}) ).output }
	},
	multivac: {
		pool2:	{ [USD.mtv] : ( await sdk.api.abi.call({target: tvlGuru.mtv, abi: ITVL[0], block: block, chain: 'multivac'}) ).output },
		staking:{ [USD.mtv] : ( await sdk.api.abi.call({target: tvlGuru.mtv, abi: ITVL[0], block: block, chain: 'multivac'}) ).output },
		tvl:	{ [USD.mtv] : ( await sdk.api.abi.call({target: tvlGuru.mtv, abi: ITVL[0], block: block, chain: 'multivac'}) ).output }
	},
	echelon: {
		pool2:	{ [USD.ech] : ( await sdk.api.abi.call({target: tvlGuru.ech, abi: ITVL[0], block: block, chain: 'echelon'}) ).output },
		staking:{ [USD.ech] : ( await sdk.api.abi.call({target: tvlGuru.ech, abi: ITVL[0], block: block, chain: 'echelon'}) ).output },
		tvl:	{ [USD.ech] : ( await sdk.api.abi.call({target: tvlGuru.ech, abi: ITVL[0], block: block, chain: 'echelon'}) ).output }
	},
}