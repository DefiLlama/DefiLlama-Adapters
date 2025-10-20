const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const vaults = [
  '0x5401b8620E5FB570064CA9114fd1e135fd77D57c', // Lombard DeFi Vault https://www.lombard.finance/app/vault/
];

const vault1 = ['0x309f25d839a2fe225e80210e110c99150db98aaf'];

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: sumTokensExport({ owners: [...vaults, ...vault1], fetchCoValentTokens: true, tokenConfig: {
      onlyWhitelisted: false,
    }, resolveUniV3: true,}),
  },
  base: {
    tvl: sumTokensExport({ owners: vaults, fetchCoValentTokens: true, tokenConfig: {
      onlyWhitelisted: false,
    }, resolveUniV3: true,}),
  },
  bsc: {
    tvl: sumTokensExport({ owners: vaults, fetchCoValentTokens: true, tokenConfig: {
      onlyWhitelisted: false,
    }, resolveUniV3: true,}),
  },
  sonic: {
    tvl: sumTokensExport({ owners: ['0x309f25d839A2fe225E80210e110C99150Db98AAF'], tokens: [ADDRESSES.sonic.LBTC]}),
  },
};