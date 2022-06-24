const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');

const contracts = {
  "trading": "0xD296169A91C8eD59C08eb2f7D831bd646a8AF2C8",
  "ftmPool": "0xBec7d4561037e657830F78b87e780AeE1d09Fc7B",
  "usdcPool": "0x7A494C755911Ce06444C47248108439a06Ac028C",
};
const wftm = "0x4e15361fd6b4bb609fa63c81a2be19d873717870";
const usdc = "0x04068da6c83afcfa0e13ba15a6696662335d5b75";

async function tvl(_time, _ethBlock, chainBlocks) {
  let balances = {};

  balances[`fantom:${usdc}`] = (await sdk.api.erc20.balanceOf({
    target: usdc,
    owner: contracts.usdcPool,
    chain: 'fantom',
    block: chainBlocks.fantom
  })).output;

  const ethLocked = await sdk.api.eth.getBalances({
    targets: [
      contracts.trading,
      contracts.ftmPool
    ],
    chain: 'fantom',
    block: chainBlocks.fantom
  });

  balances[wftm] = ethLocked.output.reduce((total, item) =>
    BigNumber(item.balance).plus(total), 0).toFixed(0);

  return balances;
};

module.exports = {
  methodology: "FTM & USDC held in the pool and trading contracts",
  fantom: {
    tvl
  }
};
