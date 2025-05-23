const { stellar } = require("../helper/chain/rpcProxy");

const BACKSTOP_ID = "CAQQR5SWBXKIGZKPBZDH3KM5GQ5GUTPKB7JAFCINLZBC5WXPJKRG3IM7";
async function tvl() {
  return stellar.blendBackstopTvl(BACKSTOP_ID)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: `Counts the total amount of BLND-USDC LP shares held by the Blend V2 backstop contract.`,
  stellar: {
    tvl: () => ({}),
    pool2: tvl
  },
};