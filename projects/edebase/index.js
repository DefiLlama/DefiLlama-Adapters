const sdk = require('@defillama/sdk');
const { gmxExports } = require("../helper/gmx");
const { sumTokens2 } = require('../helper/unwrapLPs');

module.exports = {
  base: {
    tvl: sdk.util.sumChainTvls([
      async (api) => {
        const vault = '0x251705b174386009ac82e08eAFDd7A9987e50e5d'
        const VaultStorage = '0xd878eA6c7aA749c88ad127852423BA8c508bcE08'
        const tokens = await api.call({  abi: 'address[]:fundingTokenList', target: VaultStorage})
        return sumTokens2({ api, owner: vault, tokens, })
      },
    ])
  },
}
