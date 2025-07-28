const { call } = require("../helper/chain/ton")
const { get } = require('../helper/http')

// helper function of getting jetton metadata
async function getJettonMetadata(addr) {
  const res = await get(`https://tonapi.io/v2/jettons/${addr}`)
  return res
}

async function tvl(api) {
  const CLTON_MINTER_ADDRESS = 'EQDz48al4FfPnapvXYJOfkBOIj3xvNZ0t5vSpQN-Qukqwm7W'
  const CLTON_TOKEN_ADDRESS = 'EQCxd6SJQ8KiLkEpN3OoBfUIHqPE3yp0j80UnPysQqcTikNF'

  const cltonMinterResult = await call({ target: CLTON_MINTER_ADDRESS, abi: "get_minter_data", stack: [] })
  // exchange rate from clTON to TON: decimal 9

  const cltonToTon = cltonMinterResult[4] / 1e9
  const cltonMetadata = await getJettonMetadata(CLTON_TOKEN_ADDRESS)

  // Now the tokens in the withdrawal vault will be correctly destroyed, so the TOTAL SUPPLY can be a true indication of tvl
  const cltonTotalSupply = (cltonMetadata['total_supply']) / 1e9

  const cltonTvl = cltonTotalSupply * cltonToTon
  api.addCGToken("the-open-network", cltonTvl)
}

module.exports = {
  ton: {
    tvl
  }
};