const {usdCompoundExports} = require('../helper/compound');
const sdk = require("@defillama/sdk");

const unitroller_classic_oasis = '0xA7684aE7e07Dac91113900342b3ef25B9Fd1D841';
const ftoken_classic_oasis = '0xD7d588bAbFb99E82Cd6dd0cA7677A5599AA678B5';

const unitroller_usd_oasis = '0x1C0C30795802Bf2B3232a824f41629BbBCF63127';
const ftoken_usd_oasis ='0x2552707D66C102c12b0f8284824F80e1299cB6B7';

const unitroller_lpt_oasis = '0x7c4d0c834701C6E7F57b8c1424d30aDC46eA0840';
const ftoken_lpt_oasis ='0x63f1Fe2E1da490611FC16E4a5d92b7ec7d0911a9';

const classic_lending = usdCompoundExports(unitroller_classic_oasis, "oasis", ftoken_classic_oasis)
const stable_lending  = usdCompoundExports(unitroller_usd_oasis, "oasis", ftoken_usd_oasis)
const lpt_lending     = usdCompoundExports(unitroller_lpt_oasis, "oasis", ftoken_lpt_oasis)

module.exports={
    oasis:{
	tvl: sdk.util.sumChainTvls([classic_lending.tvl, stable_lending.tvl, lpt_lending.tvl]),
	borrowed: sdk.util.sumChainTvls([classic_lending.borrowed, stable_lending.borrowed, lpt_lending.borrowed])
  },
  methodology:  "TVL is comprised of tokens deposited to the protocol as collateral from serveral pools, similar to Compound Finance and the borrowed tokens are not counted as TVL. ",
};
