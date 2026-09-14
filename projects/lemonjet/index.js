// Candidate for DefiLlama-Adapters/projects/lemonjet/index.js.
// Native-token classification and LJT pricing require maintainer review.
const LJT = '0x25a52bf483e20f83d59058b680a956e8b239051c';
const VAULT = '0xf36fed68017f6e84d2eb1d4bd35ab56ae0cd914a';

async function staking(api) {
  const assets = await api.call({
    target: VAULT,
    abi: 'uint256:totalAssets',
  });
  api.add(LJT, assets);
}

module.exports = {
  methodology: 'Counts underlying LJT held by the Lemon Jet game vault once, using totalAssets(). Reports the protocol-native asset under staking, pending classification review. Excludes vault receipt shares, external DEX pools and native ETH used for VRF. The balance includes assets committed to pending games and is not immediately withdrawable liquidity.',
  base: {
    tvl: () => ({}),
    staking,
  },
};
