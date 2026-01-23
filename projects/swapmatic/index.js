const { getLogs2 } = require('../helper/cache/getLogs');
const { nullAddress } = require('../helper/tokenMapping');

const START_BLOCK = 3285065 - 1;
const FACTORY = '0x90D882B2789523403ff263D1F93Ead986c38446C';

async function tvl(api) {
  const logs = (await getLogs2({
    api,
    target: FACTORY,
    fromBlock: START_BLOCK,
    eventAbi: 'event NewExchange (address indexed token, address indexed pool)',
    onlyUseExistingCache: true,
  }));

  const pools = logs.map(i => i.pool)
  await api.sumTokens({ owners: pools, token: nullAddress })

  const balancesV2 = api.getBalancesV2()
  return balancesV2.clone(2).getBalances()
}

module.exports = {
  misrepresentedTokens: true,
  polygon: { tvl }
}
