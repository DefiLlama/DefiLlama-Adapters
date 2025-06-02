const { staking } = require("../helper/unknownTokens")

const ETH_DRAGON_UNIV2 = "0xd53881caee96d3a94fd0e2eb027a05fd44d8c470";
const DRAGON = "0x528757e34a5617aa3aabe0593225fe33669e921c";

module.exports = {
  misrepresentedTokens: true,
  base: {
    staking: staking({ owner: '0xbb595F34190c6eA1adD1C78F6d12DF181542763c', tokens: [DRAGON], lps: [ETH_DRAGON_UNIV2], useDefaultCoreAssets: true, chain: 'ethereum' }),
    pool2: staking({ owner: '0x5F020174baEe486d88bea279195a0A3bCD40A41E', tokens: [ETH_DRAGON_UNIV2], lps: [ETH_DRAGON_UNIV2], useDefaultCoreAssets: true, chain: 'ethereum' }),
    tvl: () => ({}),
  },
}