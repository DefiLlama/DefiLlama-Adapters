// DefiLlama Adapter for KortanaDEX
const { sumTokens2 } = require("../helper/unwrapLPs");

const FACTORY = "0x20A096cC7b435142856aB239fe43c2e245ed947e";
const PAIR = "0x8EbbEa445af4Cae8a2FA16b184EeB792d424CD45";

module.exports = {
  misrepresentedTokens: true,
  kortana: {
    tvl: async (timestamp, ethBlock, chainBlocks) => {
      // Direct on-chain verification of the ktUSD/DNR pool
      return sumTokens2({ 
        chain: 'kortana',
        owner: PAIR,
        tokens: [
          "0xF08ef4987108dD4AEE330Da1255CD0D7CaBEd0a3", // WDNR
          "0xB2Bc15d9d9Ce9FbD85Df647D4C945514751D111e"  // ktUSD
        ]
      });
    }
  }
};
