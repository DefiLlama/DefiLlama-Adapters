const ADDRESSES = require('../helper/coreAssets.json')
const { sumERC4626VaultsExport } = require('../helper/erc4626');
const { sumTokensExport } = require('../helper/unwrapLPs');
const sdk = require('@defillama/sdk');

const config = {
  ethereum: {
    lvTokens: {
      totalAssets: [
        '0x3b022EdECD65b63288704a6fa33A8B9185b5096b', // ampr-LP-USD
        '0x2791EB5807D69Fe10C02eED6B4DC12baC0701744', // ampr-LP-ETH
        '0xC4A324fDF8a2495776B4d6cA46599B5a52f96489', // ampr-LP-BTC
        '0xf97ecda5F9ff31d83f635a6EA70D2D3B9C8f2e00', // amprPTweETH
        '0x0498b85FB4EC85EF5EFe82513aa9DaF767358A15', // amprPTrsETH
        '0x920F17e741029D904936c58a545DFFC72f82C079', // amprPTezETH
        '0xcdc51f2b0e5f0906f2fd5f557de49d99c34df54e', // amprETH
      ],
      totalSupply: [
        '0x06824C27C8a0DbDe5F72f770eC82e3c0FD4DcEc3', // amphrLRT
      ],
    },
  },
};

const claimableSilo = '0x06eCFaAde8fcb8C1bC58CB05104604282f8a8144';
const pendingSilo = '0x361a027e660844f336d5fa07E4cb38c40d5880d9';
const WETH = ADDRESSES.ethereum.WETH;

const totalAssetsVaults = config.ethereum.lvTokens.totalAssets;
const totalSupplyVaults = config.ethereum.lvTokens.totalSupply;

const tvl = sdk.util.sumChainTvls([
  sumERC4626VaultsExport({
    vaults: totalAssetsVaults,
    tokenAbi: 'asset',
    balanceAbi: 'totalAssets',
  }),
  sumERC4626VaultsExport({
    vaults: totalSupplyVaults,
    tokenAbi: 'asset',
    balanceAbi: 'totalSupply',
  }),
  sumTokensExport({ owners: [claimableSilo, pendingSilo], tokens: [WETH] }),
]);
module.exports['ethereum'] = { tvl };

module.exports.hallmarks = [
  [1710115200, 'Beta test closing'],
  [1712361600, 'ETH Boosted Vault Release'],
  [1718927999, 'Symbiotic LRT Vault Release'],
  [1734454404, 'Migration to InceptionLRT'],
];
