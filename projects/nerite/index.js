const sdk = require('@defillama/sdk');
const { collaterals } = require('./contracts');


async function tvl(api) {
  const collateralBalance = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: Object.values(collaterals).map((collateral) => ({
      target: collateral.token,
      params: [collateral.activePool],
    })),
  });

  collateralBalance.output.forEach((balance, index) => {
    api.add(collaterals[index].id, balance.output);
  });
}

module.exports = {
  methodology: 'counts the collateral tokens in the active pools for TVL.',
  start: 356661350,
  arbitrum: {
    tvl,
  }
}; 