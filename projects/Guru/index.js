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

//NOTE: USD===<chainslug>:USDC is used explicitly to reduce EVM calls by this adapter. It makes this process faster.
//temporary hack: New chain's USDC represented as Mainnet DAI
//    "multivac:0xEa1199d50Ee09fA8062fd9dA3D55C6F90C1bABd2": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
//    //MultiVAC Bridged USDC -> Mainnet DAI
//NOTE: Actual USDC on the new chains (sdk-unmapped)
//const USD.mtv = "0xEa1199d50Ee09fA8062fd9dA3D55C6F90C1bABd2";
//const USD.ech = "0xc42974d6554F9054265b477723C3f689d8699239";
//TODO: Create mappings for bridged tokens on new chains
const USD = {
	"ftm"	:	{"addr":"fantom:0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",	"deci":6},
	"kcc"	:	{"addr":"kcc:0x0039f574eE5cC39bdD162E9A88e3EB1f111bAF48",	"deci":18},
	"mtv"	:	{"addr":"0x6B175474E89094C44Da98b954EedeAC495271d0F",		"deci":18},	//Rep. Mainnet DAI
	"ech"	:	{"addr":"0x6B175474E89094C44Da98b954EedeAC495271d0F",		"deci":18}	//Rep. Mainnet DAI
}

async function ftm_p_2(timestamp,ethBlock,chainBlocks) { return {[USD.ftm.addr]:(Number( ( await sdk.api.abi.call({ target: tvlGuru.ftm, abi: ITVL[0], block: chainBlocks.fantom, chain: 'fantom' }) ).output )/(10**(18-USD.ftm.deci)))} }
async function ftm_stk(timestamp,ethBlock,chainBlocks) { return {[USD.ftm.addr]:(Number( ( await sdk.api.abi.call({ target: tvlGuru.ftm, abi: ITVL[1], block: chainBlocks.fantom, chain: 'fantom' }) ).output )/(10**(18-USD.ftm.deci)))} }
async function ftm_tvl(timestamp,ethBlock,chainBlocks) { return {[USD.ftm.addr]:(Number( ( await sdk.api.abi.call({ target: tvlGuru.ftm, abi: ITVL[2], block: chainBlocks.fantom, chain: 'fantom' }) ).output )/(10**(18-USD.ftm.deci)))} }

async function kcc_p_2(timestamp,ethBlock,chainBlocks) { return {[USD.kcc.addr]:(Number( ( await sdk.api.abi.call({ target: tvlGuru.kcc, abi: ITVL[0], block: chainBlocks.kcc, chain: 'kcc' }) ).output )/(10**(18-USD.kcc.deci)))} }
async function kcc_stk(timestamp,ethBlock,chainBlocks) { return {[USD.kcc.addr]:(Number( ( await sdk.api.abi.call({ target: tvlGuru.kcc, abi: ITVL[1], block: chainBlocks.kcc, chain: 'kcc' }) ).output )/(10**(18-USD.kcc.deci)))} }
async function kcc_tvl(timestamp,ethBlock,chainBlocks) { return {[USD.kcc.addr]:(Number( ( await sdk.api.abi.call({ target: tvlGuru.kcc, abi: ITVL[2], block: chainBlocks.kcc, chain: 'kcc' }) ).output )/(10**(18-USD.kcc.deci)))} }

async function mtv_p_2(timestamp,ethBlock,chainBlocks) { return {[USD.mtv.addr]:(Number( ( await sdk.api.abi.call({ target: tvlGuru.mtv, abi: ITVL[0], block: chainBlocks.multivac, chain: 'multivac' }) ).output )/(10**(18-USD.mtv.deci)))} }
async function mtv_stk(timestamp,ethBlock,chainBlocks) { return {[USD.mtv.addr]:(Number( ( await sdk.api.abi.call({ target: tvlGuru.mtv, abi: ITVL[1], block: chainBlocks.multivac, chain: 'multivac' }) ).output )/(10**(18-USD.mtv.deci)))} }
async function mtv_tvl(timestamp,ethBlock,chainBlocks) { return {[USD.mtv.addr]:(Number( ( await sdk.api.abi.call({ target: tvlGuru.mtv, abi: ITVL[2], block: chainBlocks.multivac, chain: 'multivac' }) ).output )/(10**(18-USD.mtv.deci)))} }

async function ech_p_2(timestamp,ethBlock,chainBlocks) { return {[USD.ech.addr]:(Number( ( await sdk.api.abi.call({ target: tvlGuru.ech, abi: ITVL[0], block: chainBlocks.echelon, chain: 'echelon' }) ).output )/(10**(18-USD.ech.deci)))} }
async function ech_stk(timestamp,ethBlock,chainBlocks) { return {[USD.ech.addr]:(Number( ( await sdk.api.abi.call({ target: tvlGuru.ech, abi: ITVL[1], block: chainBlocks.echelon, chain: 'echelon' }) ).output )/(10**(18-USD.ech.deci)))} }
async function ech_tvl(timestamp,ethBlock,chainBlocks) { return {[USD.ech.addr]:(Number( ( await sdk.api.abi.call({ target: tvlGuru.ech, abi: ITVL[2], block: chainBlocks.echelon, chain: 'echelon' }) ).output )/(10**(18-USD.ech.deci)))} }

module.exports = {
	methodology: "USD-denominated value aggregation of most Locked assets held across Guru Network's & Kompound Protocol's smart contracts across multiple chains, powered by direct on-chain storage of quantity, pools and prices using ftm.guru's Universal TVL Finder Tool (tvlGuru.sol). More detailed documentation of TVL is available at https://ftm.guru/rawdata/tvl",
	fantom:		{ pool2: ftm_p_2, staking: ftm_stk, tvl: ftm_tvl },
	kcc:		{ pool2: kcc_p_2, staking: kcc_stk, tvl: kcc_tvl },
	multivac:	{ pool2: mtv_p_2, staking: mtv_stk, tvl: mtv_tvl },
	echelon:	{ pool2: ech_p_2, staking: ech_stk, tvl: ech_tvl },
}
