const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const owners = [  
  "0xc912B5684a1dF198294D8b931B3926a14d700F64", // treasury ETH0
  
];
const tokens = [  
  ADDRESSES.ethereum.WSTETH, // wstEth,
];

module.exports = { 
  methodology: "ETH0 is a synthetic Ethereum-based assetfully collateralized by Lido’s wrapped staked ETH (wstETH).",
  ethereum: {
    tvl: sumTokensExport({ owners , tokens, resolveUniV3: true }),
  }
}