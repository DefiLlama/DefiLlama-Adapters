const { sumTokensExport } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking');

const stakerAddress = '0x54De3b7b5D1993Db4B2a93C897b5272FBd60e99E'

module.exports = {
  doublecounted: true,
  methodology: 'The sum of All staked Uniswap V3 NFTs and burnt Hermes for staked TVL.',
  arbitrum: {
    tvl: sumTokensExport({ owner: stakerAddress, resolveUniV3: true}),
    staking: staking('0x3A0000000000E1007cEb00351F65a1806eCd937C', '0x45940000009600102A1c002F0097C4A500fa00AB'),
  },
  hallmarks: [
    ['2025-12-15', "Yield Nest ynRWAx Liquidity Campaign Starts"],
  ],
};
