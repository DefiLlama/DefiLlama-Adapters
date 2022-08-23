const sdk = require("@defillama/sdk");
const { toBigNumberJsOrZero } = require("./utils.js");

const { VOTING_ESCROW_ADDRESS, LAY_ADDRESS } = require("./constanrs");

const getLockedLAY = async (chain, block) => {
  const lockedLAYBalance = (await sdk.api.abi.call({
    target: LAY_ADDRESS,
    abi: 'erc20:balanceOf',
    params: [VOTING_ESCROW_ADDRESS],
    block,
    chain,
  })).output
  return  toBigNumberJsOrZero(lockedLAYBalance)
}

module.exports = {
  getLockedLAY
}
