const { sumTokens2, nullAddress, } = require('../helper/unwrapLPs')

async function tvl(_time, _ethBlock, { fantom: block }) {
  const contracts = {
    "trading": "0xD296169A91C8eD59C08eb2f7D831bd646a8AF2C8",
    "ftmPool": "0xBec7d4561037e657830F78b87e780AeE1d09Fc7B",
    "usdcPool": "0x7A494C755911Ce06444C47248108439a06Ac028C",
  };
  const usdc = "0x04068da6c83afcfa0e13ba15a6696662335d5b75";
  const chain = 'fantom'
  const tokens = [usdc, nullAddress]
  const owners = Object.values(contracts)
  return sumTokens2({ chain, block, tokens, owners, })
};

module.exports = {
  methodology: "FTM & USDC held in the pool and trading contracts",
  fantom: {
    tvl
  }
};
