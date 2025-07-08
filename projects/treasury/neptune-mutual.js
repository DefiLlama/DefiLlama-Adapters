const { treasuryExports } = require("../helper/treasury");

const npm = {
  ethereum: "0x57f12fe6a4e5fe819eec699fadf9db2d06606bb4",
  arbitrum: "0x57f12fe6a4e5fe819eec699fadf9db2d06606bb4",
  bsc: "0x57f12fe6a4e5fe819eec699fadf9db2d06606bb4",
};
const treasury = {
  arbitrum: "0x808ca06eec8d8645386be4293a7f4428d4994f5b",
}

module.exports = treasuryExports({
  arbitrum: {
    owners: [treasury.arbitrum],
    ownTokens: [npm.arbitrum],
    resolveUniV3: true,
  },
})