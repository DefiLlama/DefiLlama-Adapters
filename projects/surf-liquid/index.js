const { sumTokensExport } = require('../helper/unwrapLPs');
const ADDRESSES = require('../helper/coreAssets.json');

// Example configuration for Surf liquid protocol
// You'll need to replace these with actual contract addresses and tokens

const config = {
  base: {
    // Main vault contract where TVL is held
    owner: "0x663585f2464b673efbe6f46af2c0e2514a6f199a", // Replace with actual vault address
    // List of tokens supported by the protocol
    tokens: [
        "0x7082aa45919B49C8bC6F4bC06C058d7a043a94f4",
        "0x8A183E87726bdDf7fF6ff1b8440391141281CfEf", 
        "0xE74c499fA461AF1844fCa84204490877787cED56",
      // Add more supported tokens as needed
    ],
  }
};

module.exports = {
  methodology: "Counts the balances of the listed tokens in the Surf liquid vault contract on Base chain",
  start: 1734192000, // December 15, 2024 - adjust to actual protocol launch date
  misrepresentedTokens: false,
  base: {
    tvl: sumTokensExport({
      owner: config.base.owner,
      tokens: config.base.tokens,
    })
  }
};
