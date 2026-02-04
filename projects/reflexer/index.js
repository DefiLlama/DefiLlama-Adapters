const ADDRESSES = require('../helper/coreAssets.json')

const { sumTokensExport } = require('../helper/unwrapLPs');

const ethCollateralJoin = "0x2D3cD7b81c93f188F3CB8aD87c8Acc73d6226e3A";

module.exports = {
  start: '2021-02-17',
  ethereum: { tvl: sumTokensExport({ owner: ethCollateralJoin, token: ADDRESSES.ethereum.WETH }) },
};
