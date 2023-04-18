const sdk = require('@defillama/sdk');
const mprAbi = require('./mprAbi.json');
const BigNumber = require("bignumber.js");
const { toUSDTBalances } = require("../helper/balances");
const BASE = BigNumber(10 ** 6);

async function tvl() {
  const { output: totalDeposit } = await sdk.api.abi.call({
    target: '0x05Cd3c8Ded966BE2556A8A83190aEF845f24eB76',
    abi: mprAbi['totalDeposit'],
    chain: 'polygon_zkevm'
  });
  const stakedValue = BigNumber(totalDeposit.toString()).div(BASE);
  return toUSDTBalances(stakedValue);
}

module.exports = {
  polygon_zkevm: {
    tvl
  }
};
