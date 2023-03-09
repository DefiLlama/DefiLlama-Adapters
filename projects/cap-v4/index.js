const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const vault = "0xba9736a3fc948f8c489a7e975114eaf2b7f1c3fc";
const fundStore = "0xe00975A0D7def3FAE93832cc72D5ff50432fc857";
const cap = "0x031d35296154279dc1984dcd93e392b1f946737b";

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({ owners: [vault, fundStore], tokens: [
      nullAddress,
      '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',//USDC
    ]}),
    staking: sumTokensExport({ owners: [vault, fundStore], tokens: [cap]})
  },
}
