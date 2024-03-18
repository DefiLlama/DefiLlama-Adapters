const MAIN_CONTRACT = '0xdC0C0746CA0954E6C2284D1a97cC85474B051EbB';
const TOKEN_CONTRACT = '0x800ce05BaDE6B87E1552d0301Ea3393ccFf42F4A';
const LP_CONTRACT = '0x974D36201171cA8D28Cc3F46972349d24Be3A303';

const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  blast: {
    tvl: sumTokensExport({ owners: [LP_CONTRACT, MAIN_CONTRACT], tokens: [ADDRESSES.null, ADDRESSES.blast.WETH, TOKEN_CONTRACT] }),
  },
  methodology: "Counts the amount of ETH, WETH and BLASTX tokens locked on the ThrusterSwap Pair and Blastex contracts",
};
