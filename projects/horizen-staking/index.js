const { getChainTransform } = require('../helper/portedTokens');
const ADDRESSES = require('../helper/coreAssets.json');

const STAKING_CONTRACT = '0x6BF7CF29a8bcE11Aa62Cf593d165C244fA4d3E31';
const ZEN = ADDRESSES.horizen.ZEN;

async function tvl(api) {
  const transform = getChainTransform('horizen');
  const totalStaked = await api.call({
    abi: 'uint256:totalStaked',
    target: STAKING_CONTRACT,
  });
  api.add(transform(ZEN), totalStaked, { skipChain: true });
}

module.exports = {
  methodology: 'Counts ZEN tokens staked in the Horizen ZenStaker contract on Horizen L3.',
  horizen: {
    tvl,
  },
};
