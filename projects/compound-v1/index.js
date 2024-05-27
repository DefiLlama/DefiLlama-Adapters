const v1abi = require('./v1Abi.json');
const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');

const v1Contract = '0x3FDA67f7583380E67ef93072294a7fAc882FD7E7'
async function v1Tvl(balances, block, borrowed) {
  const marketsLength = await sdk.api.abi.call({
    target: v1Contract,
    block,
    abi: v1abi.getCollateralMarketsLength
  });
  const underlyings = await sdk.api.abi.multiCall({
    calls: Array(Number(marketsLength.output)).fill().map((n, i) => ({
      target: v1Contract,
      params: [i]
    })),
    block,
    abi: v1abi.collateralMarkets
  });
  const markets = await sdk.api.abi.multiCall({
    calls: underlyings.output.map(m => ({
      target: v1Contract,
      params: [m.output]
    })),
    block,
    abi: v1abi.markets
  });
  markets.output.forEach(m => {
    const token = m.input.params[0]
    let amount
    if (borrowed) {
      amount = m.output.totalBorrows
    } else {
      amount = BigNumber(m.output.totalSupply).minus(m.output.totalBorrows).toFixed(0)
    }
    sdk.util.sumSingleBalance(balances, token, amount)
  })
}

async function borrowed(timestamp, block) {
    const balances = {};
    await v1Tvl(balances, block, true)
    return balances
}

async function tvl(timestamp, block) {
    let balances = {};

    await v1Tvl(balances, block, false)
    return balances;
}

module.exports = {
        ethereum: {
      tvl,
      borrowed
    },
};
  