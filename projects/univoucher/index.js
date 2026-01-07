const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

const config = {
  ethereum: {
    owners: ["0x51553818203e38ce0E78e4dA05C07ac779ec5b58"],
    fromBlock: 22714895,
  },
  base: {
    owners: ["0x51553818203e38ce0E78e4dA05C07ac779ec5b58"],
    fromBlock: 31629302,
  },
  bsc: {
    owners: ["0x51553818203e38ce0E78e4dA05C07ac779ec5b58"],
    fromBlock: 51538912,
  },
  polygon: {
    owners: ["0x51553818203e38ce0E78e4dA05C07ac779ec5b58"],
    fromBlock: 72827473,
  },
  arbitrum: {
    owners: ["0x51553818203e38ce0E78e4dA05C07ac779ec5b58"],
    fromBlock: 347855002,
  },
  optimism: {
    owners: ["0x51553818203e38ce0E78e4dA05C07ac779ec5b58"],
    fromBlock: 137227100,
  },
  avax: {
    owners: ["0x51553818203e38ce0E78e4dA05C07ac779ec5b58"],
    fromBlock: 63937777,
  },
};

Object.keys(config).forEach(chain => {
  const { owners, fromBlock } = config[chain]
  const tokens = [ADDRESSES.null] // Native token (ETH/BNB/MATIC/etc)
  
  // Add common stablecoins and tokens
  if (ADDRESSES[chain]) {
    // Major stablecoins
    if (ADDRESSES[chain].USDT) tokens.push(ADDRESSES[chain].USDT)
    if (ADDRESSES[chain].USDC) tokens.push(ADDRESSES[chain].USDC) 
    if (ADDRESSES[chain].DAI) tokens.push(ADDRESSES[chain].DAI)
    if (ADDRESSES[chain].BUSD) tokens.push(ADDRESSES[chain].BUSD)
    if (ADDRESSES[chain].TUSD) tokens.push(ADDRESSES[chain].TUSD)
    if (ADDRESSES[chain].FDUSD) tokens.push(ADDRESSES[chain].FDUSD)
    
    // Other popular tokens
    if (ADDRESSES[chain].WETH) tokens.push(ADDRESSES[chain].WETH)
    if (ADDRESSES[chain].WBTC) tokens.push(ADDRESSES[chain].WBTC)
    
    // Gold-backed tokens
    if (ADDRESSES[chain].XAUT) tokens.push(ADDRESSES[chain].XAUT)
    if (ADDRESSES[chain].PAXG) tokens.push(ADDRESSES[chain].PAXG)
  }
  
  module.exports[chain] = { 
    tvl: sumTokensExport({ owners, tokens }), 
    start: fromBlock 
  }
})

module.exports.methodology = "UniVoucher TVL is calculated by summing all ETH and ERC20 tokens held in the UniVoucher contract across all supported chains. These represent funds deposited into active (unredeemed/uncancelled) gift cards."