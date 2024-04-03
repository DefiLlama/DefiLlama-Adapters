const ADDRESSES = require('../helper/coreAssets.json')

const nullAddress = ADDRESSES.null
const sdk = require("@defillama/sdk");
const addresses = require("./addresses.json");

async function useParsedStakingMetadata(block) {
  const curAddresses = addresses.avax;

  const stratViewer = await sdk.api.abi.call({
    block,
    target: curAddresses.CurvePoolRewards,
    abi: 'function stakingMetadata(address account) view returns (tuple(address stakingToken, address rewardsToken, uint256 totalSupply, uint256 tvl, uint256 aprPer10k, uint256 vestingCliff, uint256 periodFinish, uint256 stakedBalance, uint256 vestingStart, uint256 earned, uint256 rewards, uint256 vested))',
    chain: "avax",
    params: [nullAddress],
  });

  const normalResults = stratViewer.output;
  return [normalResults];
}

module.exports = {
  useParsedStakingMetadata: useParsedStakingMetadata,
};
