const { sumTokensExport } = require('../helper/unknownTokens')
const { sumTokensExport: ogSumExport } = require('../helper/unwrapLPs')

const FBX_TOKEN_CONTRACT = '0xD125443F38A69d776177c2B9c041f462936F8218';
const FIRE_VAULT_CONTRACT = '0x960d43BE128585Ca45365CD74a7773B9d814dfBE';
const EP_TOKEN_CONTRACT = '0x60Ed6aCEF3a96F8CDaF0c0D207BbAfA66e751af2';
const FBX_LP = '0xcffbfa978ac3fb10e829ca6b763c307daafe8a77'
const EP_FBX_LP = '0x41D9DE53EBF26F766229E42Aa02904eB2495E397'

module.exports = {
  polygon: {
    tvl: () => 0,
    staking: sumTokensExport({
      tokensAndOwners: [
        [EP_TOKEN_CONTRACT, EP_TOKEN_CONTRACT],
        [FBX_TOKEN_CONTRACT, FIRE_VAULT_CONTRACT],
      ],
      lps: [EP_FBX_LP],
      coreAssets: [FBX_TOKEN_CONTRACT],
      restrictTokenRatio: 100,
    }),
    pool2: ogSumExport({
      tokensAndOwners: [
        [FBX_LP, '0x92a9180af33531A5d78d81D90AFc0523dc6c62c9'],
      ],
    }),
  },
  methodology: 'Counts the number of FBX and EP tokens in the Vault contracts.'
};
