const ADDRESSES = require("../helper/coreAssets.json");
const { staking } = require("../helper/staking");
const { sumTokensExport } = require("../helper/unknownTokens");
const LP = '0xd2eb1de935fe66501aece023b0437fa7b9c40a25'

module.exports = {
  methodology: "Counts USDC deposited to trade and to mint BLP. Staking counts BSM and esBSM deposited to earn esBSM",
  base: {
    tvl: staking("0xEDFFF5d0C68cFBd44FA12659Fd9AD55F04748874", ADDRESSES.base.USDbC),
    pool2: sumTokensExport({ owner: "0xe2cb504d51fd16d8bdf533c58553ed3f4f755f00", tokens: [LP], useDefaultCoreAssets: true, }),
    staking: sumTokensExport({ owner: "0x957e6844aa7e963dc26447646be268932b785200", tokens: ['0xc5dc1b9413c47089641d811b6336c0f2fe440883'], useDefaultCoreAssets: true, lps: [LP] }),
  }
};
