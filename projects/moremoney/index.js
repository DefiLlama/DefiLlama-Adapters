const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require("@defillama/sdk");
const addresses = require("./addresses.json");

const useStrategyMetadata = require("./StrategyMetadata").useStrategyMetadata;
const useLegacyIsolatedStrategyMetadata =
  require("./StrategyMetadata").useLegacyIsolatedStrategyMetadata;

async function useParsedStakingMetadata(block) {
  const curAddresses = addresses.avax;

  const stratViewer = await sdk.api.abi.call({
    block,
    target: curAddresses.CurvePoolRewards,
    abi: 'function stakingMetadata(address account) view returns (tuple(address stakingToken, address rewardsToken, uint256 totalSupply, uint256 tvl, uint256 aprPer10k, uint256 vestingCliff, uint256 periodFinish, uint256 stakedBalance, uint256 vestingStart, uint256 earned, uint256 rewards, uint256 vested))',
    chain: "avax",
    params: [ADDRESSES.null],
  });

  const normalResults = stratViewer.output;
  return [normalResults];
}

async function tvl(api) {
  const [allStratMeta, legacyStratMeta] = await Promise.all([
    useStrategyMetadata(api.block), useLegacyIsolatedStrategyMetadata(api.block)
  ])
  const stratMeta = [...allStratMeta, ...legacyStratMeta]
  const stakeMeta = await useParsedStakingMetadata(api.block);

  const tvlsFarm = stakeMeta
    .reduce((tvl, row) => {
      return tvl + +row.tvl
    }, 0);

  const tvlNoFarm = stratMeta
    .reduce(
      (tvl, row) => tvl + (row.tvl * row.valuePer1e18 / 1e18),
      0);

  const tvl = tvlNoFarm + tvlsFarm

  api.add(ADDRESSES.avax.USDC, tvl / 1e12);
  return sumTokens2({ owner: '0x3d3cd4856ceca1639150549A4F2cE3F37f92Bd91', fetchCoValentTokens: true, api,})
}

module.exports = {
  misrepresentedTokens: true,
  avax: {
    tvl,
  },
};
