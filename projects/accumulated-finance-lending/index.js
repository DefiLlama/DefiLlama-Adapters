const ADDRESSES = require('../helper/coreAssets.json');
const BigNumber = require('bignumber.js').default;
const { sumTokens2 } = require('../helper/unwrapLPs');

const config = {
  velas: [
    {
      "velas": {
        address: "0x570ae1d228d54c2a29c52603f962f45331d66680",
        collateralToken: "0x8f0ecda9679ad16e30be3d83d183c482821f5325"
      }
    }
  ]
};

function transformConfig(config) {
  const result = {};
  Object.values(config).forEach(chainArray => {
    chainArray.forEach(chainConfig => {
      Object.entries(chainConfig).forEach(([chain, item]) => {
        if (!result[chain]) result[chain] = [];
        result[chain].push(item);
      });
    });
  });
  return result;
}

module.exports = {
  methodology: "We aggregated lending and borrowing tokens issued by Accumulated Finance",
};

const transformedConfig = transformConfig(config);

const totalAssetsABI = {
  type: "function",
  name: "totalAssets",
  stateMutability: "view",
  inputs: [],
  outputs: [{ name: "", type: "uint256", internalType: "uint256" }]
};

const totalCollateralABI = {
  type: "function",
  name: "totalCollateral",
  stateMutability: "view",
  inputs: [],
  outputs: [{ name: "", type: "uint256", internalType: "uint256" }]
};

const pricePerShareABI = {
  type: "function",
  name: "pricePerShare",
  inputs: [],
  outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
  stateMutability: "view"
};

Object.entries(transformedConfig).forEach(([chain, configs]) => {
  module.exports[chain] = {
    tvl: async (api) => {
      for (const { address, baseToken, collateralToken } of configs) {
        const [totalCollateralsRaw, totalAssetsRaw, pricePerShareRaw] = await Promise.all([
          api.call({ abi: totalCollateralABI, target: address }),
          api.call({ abi: totalAssetsABI, target: address }),
          api.call({ abi: pricePerShareABI, target: collateralToken })
        ]);
        const totalAssets = new BigNumber(totalAssetsRaw);
        const totalCollateral = new BigNumber(totalCollateralsRaw);
        const pricePerShare = new BigNumber(pricePerShareRaw)
        const result = totalAssets.plus(totalCollateral.times(pricePerShare).div(1e18));
        api.add(baseToken ?? ADDRESSES.null, result.toFixed(0));
      }
      return sumTokens2({ api });
    },
  };
});
