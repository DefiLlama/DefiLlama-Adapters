const ADDRESSES = require("../helper/coreAssets.json");
const contracts = require("./contracts");
const { staking } = require("../helper/staking");
const { getLogs } = require("../helper/cache/getLogs");
const steth = ADDRESSES.ethereum.STETH;
const config = {
  ethereum: {
    factory: "0x27b1dacd74688af24a64bd3c9c1b143118740784",
    fromBlock: 16032059,
  },
  arbitrum: {
    factory: "0xf5a7de2d276dbda3eef1b62a9e718eff4d29ddc8",
    fromBlock: 62979673,
  },
  bsc: {
    factory: "0x2bEa6BfD8fbFF45aA2a893EB3B6d85D10EFcC70E",
    fromBlock: 29484286,
  },
};

module.exports = {};

Object.keys(config).forEach((chain) => {
  const { factory, fromBlock } = config[chain];
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api }) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: [
          "0x166ae5f55615b65bbd9a2496e98d4e4d78ca15bd6127c0fe2dc27b76f6c03143",
        ],
        eventAbi:
          "event CreateNewMarket (address indexed market, address indexed PT, int256 scalarRoot, int256 initialAnchor)",
        onlyArgs: true,
        fromBlock,
      });
      const pt = logs.map((i) => i.PT);
      let sy = [
        ...new Set(
          (
            await api.multiCall({
              abi: "address:SY",
              calls: pt,
            })
          ).map((s) => s.toLowerCase())
        ),
      ];

      const [data, supply, decimals] = await Promise.all([
        api.multiCall({
          abi: "function assetInfo() view returns (uint8 assetType , address uAsset , uint8 decimals )",
          calls: sy,
        }),
        api.multiCall({ abi: "erc20:totalSupply", calls: sy }),
        api.multiCall({ abi: "erc20:decimals", calls: sy }),
      ]);

      const tokenAssetTypeSy = sy.filter((_, i) => data[i].assetType === "0");
      const exchangeRates = await api.multiCall({
        abi: "function exchangeRate() view returns (uint256 res)",
        calls: tokenAssetTypeSy,
      });

      data.forEach((v, i) => {
        let value = supply[i] * 10 ** (v.decimals - decimals[i]);
        let index = tokenAssetTypeSy.indexOf(sy[i]);
        if (index !== -1) {
          value = (value * exchangeRates[index]) / 10 ** 18;
        }
        api.add(v.uAsset.toLowerCase(), value);
      });
      let balances = api.getBalances();
      const bridged = `arbitrum:${steth}`;
      if (bridged in balances) {
        balances[steth] = balances[bridged];
        delete balances[bridged];
      }
      return balances;
    },
  };
});

module.exports.ethereum.staking = staking(
  contracts.v2.vePENDLE,
  contracts.v2.PENDLE
);
