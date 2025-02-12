const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const BigNumber = require("bignumber.js");

const constant = {
  treasuryPool: {
    address: "0xF4b2aa60Cd469717857a8A4129C3dB9108f54D74",
  }
};


async function underwriting(block) {
  let SURE = '0xcb86c6a22cb56b6cf40cafedb06ba0df188a416e';
  let balanceOf;
  balanceOf = await sdk.api.abi.call({
    block,
    target: SURE,
    abi: abi["balanceOf"],
    params: constant.treasuryPool.address,
  });
  balanceOf = balanceOf.output

  return { [SURE]: balanceOf }
}
//tracking SURE contributed to the community vaults.
async function tvl(timestamp, block) {
  let underwritingPool = await underwriting(block);
  
  let balances = {
    ...underwritingPool
  }

  return balances;
}


module.exports = {
  start: '2017-12-18', // 2020/10/21 6:34:47 (+UTC)
  ethereum: { tvl }
};

