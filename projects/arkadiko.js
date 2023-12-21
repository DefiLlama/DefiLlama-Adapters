const { sumTokens } = require('./helper/chain/stacks')

async function tvl() {
  // https://info.arkadiko.finance/balances
  return sumTokens({
    owners: [
      'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-stx-reserve-v1-1', // stacks reserve
      'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-sip10-reserve-v2-1', // other vaults
      'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-stacker-v3-1', // PoX stackers
      'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-stacker-2-v3-1',
      'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-stacker-3-v3-1',
      'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-stacker-4-v3-1',
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
