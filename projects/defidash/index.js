
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')
const DEFI_DASH_CONTRACT = '0x59B88318d239da34188C42B9e76aAC6D50265974';
const DEFI_DASH_TOKEN = '0xd6df108d516a5dc83f39020a349085c79d4edf0d';

module.exports = {
  methodology: 'Counts the ETH and/or ERC20 tokens held in the DefiDash contract as TVL.',
  base: {
    tvl: sumTokensExport({ owner: DEFI_DASH_CONTRACT, tokens: [nullAddress] }),
    staking: staking(DEFI_DASH_CONTRACT, DEFI_DASH_TOKEN)
  },
};
