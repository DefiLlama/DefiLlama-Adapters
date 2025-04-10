const { sumERC4626VaultsExport } = require('../helper/erc4626');
const sdk = require('@defillama/sdk');

const config = {
  ethereum: {
    lvTokens: {
      totalAssets: [
        "0x07ed467acD4ffd13023046968b0859781cb90D9B", // 9Summits Flagship ETH
        "0x03D1eC0D01b659b89a87eAbb56e4AF5Cb6e14BFc", // 9Summits Flagship USDC
        "0xB09F761Cb13baCa8eC087Ac476647361b6314F98", // 9Summits & Tulipa Capital cbBTC 
        "0x8092cA384D44260ea4feaf7457B629B8DC6f88F0", // Usual Invested USD0++ in stUSR
        "0x66dCB62da5430D800a1c807822C25be17138fDA8", // Unity Trust
        "0x71652D4898DE9A7DD35e472a5fe4577eC69d82f2", // Trinity Trust 
      ],
    },
  },
  base: {
    lvTokens: {
      totalAssets: [
        "0xFCE2064B4221C54651B21c868064a23695E78f09", // 722Capital-ETH
      ],
    },
  },
};

const totalAssetsVaults = config.ethereum.lvTokens.totalAssets;

const tvl = sdk.util.sumChainTvls([
  sumERC4626VaultsExport({
    vaults: totalAssetsVaults,
    tokenAbi: 'asset',
    balanceAbi: 'totalAssets',
  }),
]);
module.exports['ethereum'] = { tvl };
