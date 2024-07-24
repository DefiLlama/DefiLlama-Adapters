const { sumTokens } = require('./helper/chain/stacks')

async function tvl() {
  // https://info.arkadiko.finance/balances
  return sumTokens({
    owners: [
      'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-vaults-pool-active-v1-1', // STX and SIP10 tokens for vaults
      'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-swap-v2-1', // swap tokens
    ],
    blacklistedTokens: [
      'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.wrapped-stx-token::wstx',
      'stacks:SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token::diko',
      'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token::usda',
    ]
  })
}

module.exports = {
  stacks: {
    tvl,
  },
};
