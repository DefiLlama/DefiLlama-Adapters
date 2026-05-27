const { getLogs2 } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs');
const ADDRESSES = require('../helper/coreAssets.json');

const FACTORY = '0x99A1F02f56E8356e6E90A880DBb1be6EC7485737';
const START_BLOCK = 83360171;

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: FACTORY,
    fromBlock: START_BLOCK,
    eventAbi: 'event TokenLaunched(address indexed tokenAddress, address indexed bondingCurveAddress, address indexed creator)',
  });

  const bondingCurves = logs
    .map((log) => log.bondingCurveAddress)
    .filter(Boolean);

  return sumTokens2({
    api,
    owners: bondingCurves,
    tokens: [ADDRESSES.null],
  });
}

module.exports = {
  bsc: {
    tvl,
  },
  methodology: 'TVL is the total BNB locked in all active BondingCurve contracts created by the hodl.dance factory',
};
