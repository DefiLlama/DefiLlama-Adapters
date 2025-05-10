const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const HEAD2HEAD_BATTLES_CONTRACT = '0x838E536DaE154D3F70e1e111cfBE552Dd40CD163';
const HYPEBOARD_BATTLES_CONTRACT = '0x3864B536fE3dbC967Be6B311d86135a6A672d85A';


module.exports = {
  methodology: `TVL is the total amount of USDC held in the Battles contracts - once the markets resolve, participants can withdraw theire share at their own discretion`,
  start: '2025-04-15',
  avax: {
    tvl: sumTokensExport({
      owners: [
        HEAD2HEAD_BATTLES_CONTRACT,
        HYPEBOARD_BATTLES_CONTRACT
      ],
      tokens: [ADDRESSES.avax.USDC]
    }),
  }
}; 