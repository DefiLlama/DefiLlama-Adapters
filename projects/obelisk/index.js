const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const sdk = require("@defillama/sdk");

module.exports = {
  bitcoin: {
    tvl: async (api, block) => {
    const MINT_OBTC_TOKEN_CONTRACT = '0xB1e12802831Da99D2d47b6a55049D69bf7De0e3C';
        let result = await sdk.api.erc20.totalSupply({ target: MINT_OBTC_TOKEN_CONTRACT, block: block });
        console.log(result);
        return {
            [MINT_OBTC_TOKEN_CONTRACT]: ((result && result.output) || 0),
        }
    }
  },
  methodology: `TVL for oBTC consists of the BTC deposits in custody that were used to mint oBTC`,
}