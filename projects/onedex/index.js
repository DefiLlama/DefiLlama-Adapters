const { sumTokensExport } = require('../helper/sumTokens')
const { call } = require("../helper/chain/elrond");
const ADDRESSES = require('../helper/coreAssets.json');

const swapsSC = 'erd1qqqqqqqqqqqqqpgqqz6vp9y50ep867vnr296mqf3dduh6guvmvlsu3sujc';
const boostedStakingSC = 'erd1qqqqqqqqqqqqqpgq8nlmvjm8gum6y2kqe0v296kgu8cm4jlemvlsays3ku';

const staking = async (_, _1, _2, { api }) => {
  // Swaps SC
  const oneTokenPrice = await call({ target: swapsSC, abi: 'getEquivalent', params: ['WEGLD-bd4d79', 'ONE-f9954f', 1e18], responseTypes: ['number']});

  // Boosted Staking SC
  const totalBoostedStaking = await call({ target: boostedStakingSC, abi: 'getTotalStaking', responseTypes: ['number']});
  api.add(ADDRESSES.null, totalBoostedStaking * oneTokenPrice / 1e18);
  const boostedStakingRewards = await call({ target: boostedStakingSC, abi: 'getDepositedRewards', responseTypes: ['number']});
  api.add(ADDRESSES.null, boostedStakingRewards * oneTokenPrice / 1e18);
};

module.exports = {
  timetravel: false,
  elrond: {
    tvl: sumTokensExport({ owner: swapsSC, }),
    staking,
  },
};
