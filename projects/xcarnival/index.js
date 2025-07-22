const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

const XETH = '0x6CC71cD03a70b4eF06d688716F611cE368f80530'

async function borrowed(api) {
  const bal = await api.call({  abi: 'uint256:totalBorrows', target: XETH})
  api.addGasToken(bal)
}

module.exports = {
  methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.",
  ethereum: {
    tvl: sumTokensExport({ owner: XETH, tokens: [nullAddress]}),
    borrowed,
  },
}