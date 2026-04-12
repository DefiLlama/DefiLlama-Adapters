// DefiLlama Adapter for KortanaDEX
const { sumTokens2 } = require("../helper/unwrapLPs");

const FACTORY = "0x20A096cC7b435142856aB239fe43c2e245ed947e";
const PAIR = "0x8EbbEa445af4Cae8a2FA16b184EeB792d424CD45";

module.exports = {
  misrepresentedTokens: true,
  timetravel: false, // Set to false for new L1s
  kortana: {
    tvl: async (timestamp, ethBlock, chainBlocks) => {
      // Direct call to Kortana Mainnet RPC
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
// Note: We will likely need to help the DefiLlama team add 'kortana' 
// to their sdk/src/computeTVL/balances.ts if the automated test keeps failing.
