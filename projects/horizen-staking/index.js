const ADDRESSES = require('../helper/coreAssets.json');
const STAKING_CONTRACT = '0x6BF7CF29a8bcE11Aa62Cf593d165C244fA4d3E31';
const ZEN = ADDRESSES.horizen.ZEN;

async function staking(api) {
  const totalStaked = await api.call({ abi: 'uint256:totalStaked', target: STAKING_CONTRACT });
  api.add(ZEN, totalStaked);
}

module.exports = {
  methodology:
    'ZEN deposited in the Horizen ZenStaker contract, read via totalStaked(), which equals the ZEN held across its delegation surrogates. Undistributed rewards held by the staker are excluded.',
  start: '2026-07-22',
  horizen: {
    tvl: () => ({}),
    staking,
  },
};
