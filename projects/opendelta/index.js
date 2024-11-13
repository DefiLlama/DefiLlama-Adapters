const { PublicKey, } = require("@solana/web3.js")
const { getConnection, } = require("../helper/solana")

const OPB_MINT_ADDRESS = "opbrKSFxFXRHNg75xjpEAbJ5R6e6GYZ6QKEqdvcBq7c"

async function tvl(api) {
  const connection = getConnection()
  const { value: { data: { parsed: { info: { supply, decimals, extensions }}}}} = await connection.getParsedAccountInfo(new PublicKey(OPB_MINT_ADDRESS))
  const { state } = extensions.find(e => e.extension === 'interestBearingConfig')
  api.addUSDValue(computeSupply(supply, state, decimals))

  function computeSupply(supply, extensionData, decimals) {
    // Compute the supply based on the interest-bearing extension
    const { currentRate, initializationTimestamp, preUpdateAverageRate, lastUpdateTimestamp, } = extensionData

    const currentTimestamp = Math.floor(Date.now() / 1000)
    const timeElapsed = lastUpdateTimestamp - initializationTimestamp
    const timeElapsedSinceLastUpdate = currentTimestamp - lastUpdateTimestamp
    const interestRate = currentRate / 1e4
    const interestRatePre = preUpdateAverageRate / 1e4
    const ONE_YEAR = 365 * 24 * 60 * 60
    const interestAccruedCurrent = interestRate * timeElapsedSinceLastUpdate / ONE_YEAR
    const interestAccruedPre = interestRatePre * timeElapsed / ONE_YEAR

    const computedSupply = supply * (1 + interestAccruedCurrent + interestAccruedPre)
    return computedSupply / Math.pow(10, decimals)
  }

}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "TVL is calculated by multiplying OPB token supply by the current USD value of 1.0 OPB. Initially worth $1.0, 1.0 OPB now reflects its increased value from accrued interest, derived via amountToUiAmount using the Interest Bearing extension.",
  solana: {
    tvl,
  },
}
