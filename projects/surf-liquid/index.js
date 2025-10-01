const { sumTokensExport } = require('../helper/unwrapLPs');

const config = {
  base: {
    owner: "0x663585f2464b673efbe6f46af2c0e2514a6f199a",
    tokens: [
      "0x7082aa45919B49C8bC6F4bC06C058d7a043a94f4",
      "0x8A183E87726bdDf7fF6ff1b8440391141281CfEf", 
      "0xE74c499fA461AF1844fCa84204490877787cED56"
    ]
  }
};

module.exports = {
  methodology: "Counts the balances of the listed tokens in the Surf liquid vault contract on Base chain",
  start: 1734192000,
  misrepresentedTokens: false,
  timetravel: true,
  base: {
    tvl: sumTokensExport({
      owner: config.base.owner,
      tokens: config.base.tokens,
    }),
  }
};
