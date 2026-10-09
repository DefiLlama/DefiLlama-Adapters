const { nullAddress, sumTokens2 } = require("../helper/unwrapLPs");
const { sumTokensExport } = require("../helper/sumTokens");

// HBARX staking contract, holds the staked HBAR
// https://stader.gitbook.io/stader/hedera/smart-contracts
const HBARX_STAKING = "0.0.1412503";

async function ethTvl(api) {
  return await api.call({ abi: "uint256:totalAssets", target: "0xcf5ea1b38380f6af39068375516daf40ed70d299" });
}

module.exports = {
  timetravel: false,
  methodology: "We aggregated the assets staked across Stader staking protocols",
  /*terra: { tvl },*/
  hedera: { tvl: sumTokensExport({ owners: [HBARX_STAKING] }) },
  fantom: { tvl: () => ({}) },
  terra2: { tvl: () => ({}) },
  bsc: { tvl: () => ({}), },
  near: { tvl: () => ({}) },
  ethereum: {
    tvl: async (api) => {
      const nodeOperatorRegistry = "0x4f4bfa0861f62309934a5551e0b2541ee82fdcf1";
      const nodeOperatorCount = await api.call({
        abi: "uint256:totalActiveValidatorCount",
        target: nodeOperatorRegistry,
      });

      const SDCollateralPoolAddress =
        "0x7Af4730cc8EbAd1a050dcad5c03c33D2793EE91f";
      const SDTokenAddress = "0x30D20208d987713f46DFD34EF128Bb16C404D10f";

      const sdBalance = await api.call({
        abi: "erc20:balanceOf",
        target: SDTokenAddress,
        params: SDCollateralPoolAddress,
      });

      const SDToEth = await api.call({
        abi: "function convertSDToETH(uint256) view returns (uint256)",
        target: SDCollateralPoolAddress,
        params: [sdBalance],
      });

      const balances = {
        [nullAddress]:
          +SDToEth + +(await ethTvl(api)) + +nodeOperatorCount * 4 * 1e18, // 4 ETH per node operator
      };
      return sumTokens2({
        api,
        balances,
        owner: nodeOperatorRegistry,
        tokens: [nullAddress],
      });
    },
  },
  hallmarks: [['2022-05-07', "UST depeg"]],
};
