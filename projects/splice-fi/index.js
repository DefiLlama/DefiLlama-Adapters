const { getLogs, getLogs2 } = require("../helper/cache/getLogs");

const config = {
  mode: [{
    factoryV3: "0x9e6d12097339ddd5402FDD39fc0Ef86Eec54AB39",
    fromBlockV3: 7764229,
  }],
  blast: [{
    factoryV3: "0x96A6C433078059577F0CEB707d596A5F81d64375",
    fromBlockV3: 1850297,
  }, {
    factoryV3: "0xf87E18913f7143E7C7eFee714813ABbC8e0E34bf",
    fromBlockV3: 1850297,
  },],
}

Object.keys(config).forEach((chain) => {
  const factories = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const logsV3 = (await Promise.all(factories.map(i => getLogs2({
        api,
        target: i.factoryV3,
        topic: [
          "0xae811fae25e2770b6bd1dcb1475657e8c3a976f91d1ebf081271db08eef920af",
        ],
        eventAbi:
          "event CreateNewMarket (address indexed market, address indexed PT, int256 scalarRoot, int256 initialAnchor, uint256 lnFeeRateRoot)",
        fromBlock: i.fromBlockV3,
      })))).flat()

      const pt = logsV3.map((i) => i.PT)
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
    },
  };
});
