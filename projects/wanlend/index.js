const { compoundExports } = require("../helper/compound");
const sdk = require("@defillama/sdk");


const { tvl: v1Tvl, borrowed: v1Borrowed } = compoundExports(
  "0x21c72522005ccf570f40acaa04b448918aecc2ad",
  "wan",
  "0xE8548014f731194764AF27C8edc9bbAA7d2f4C46",
  "0xdabd997ae5e4799be47d6e69d9431615cba28f48",
  
);

const { tvl: v2Tvl, borrowed: v2Borrowed } = compoundExports(
  "0xd6980C52C20Fb106e54cC6c8AE04c089C3F6B9d6",
  "wan",
  "0x48c42529c4c8e3d10060e04240e9ec6cd0eb1218",
  "0xdabd997ae5e4799be47d6e69d9431615cba28f48",
  
);

module.exports = {
  timetravel: true,
  incentivized: false,
  methodology: `As in Compound Finance, TVL counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are counted as "Borrowed" TVL and can be toggled towards the regular TVL.`,
  wan: {
    tvl: sdk.util.sumChainTvls([v1Tvl,v2Tvl]),
    borrowed: sdk.util.sumChainTvls([v1Borrowed,v2Borrowed]),
  },
};
