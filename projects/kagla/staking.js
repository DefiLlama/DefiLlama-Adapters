const sdk = require("@defillama/sdk");
const { toBigNumberJsOrZero } = require("./utils.js");

const { VOTING_ESCROW_ADDRESS, KGL_ADDRESS, transformTokenAddress } = require("./addresses");

const getStaked = async (chain, block) => {
  const lockedKGLBalance = (await sdk.api.abi.call({
    target: KGL_ADDRESS,
    abi: 'erc20:balanceOf',
    params: [VOTING_ESCROW_ADDRESS],
    block,
    chain,
  })).output

  return {
    [transformTokenAddress(KGL_ADDRESS)]: toBigNumberJsOrZero(lockedKGLBalance).shiftedBy(-18)
  }
}

module.exports = {
  getStaked
}
