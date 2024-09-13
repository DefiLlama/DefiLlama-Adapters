const { call } = require("../helper/chain/ton")
const { get } = require('../helper/http')

const CGUSD_CONTRACT = "0xCa72827a3D211CfD8F6b00Ac98824872b72CAb49"
const START_TIME = 1708351200

async function baseTvl(api) {
  await api.erc4626Sum({ calls: [CGUSD_CONTRACT], balanceAbi: 'getTotalPooledAssets', tokenAbi: "asset" })
}

// helper function of getting jetton metadata
async function getJettonMetadata(addr) {
  const res = await get(`https://tonapi.io/v2/jettons/${addr}`)
  return res
}
async function getJettonBalance(address, jettonMasterAddress) {
  const res = await get(`https://tonapi.io/v2/accounts/${address}/jettons/${jettonMasterAddress}`)
  return res.balance
}

async function getCgUsdtTvl() {
  const CGUSDT_MINTER_ADDRESS = "EQCfvQW-thWpqKgyqtXCFbYayDlHqS0-frkyP6VD70paLFZa"
  const CGUSDT_ADDRESS = 'EQBIBw3mF_TDMJqWAZihVsyUBMWpWw_deftZLiCxTmrCUOKy'

  const cgusdtMinterResult = await call({ target: CGUSDT_MINTER_ADDRESS, abi: "get_minter_data", stack: [] })
  // exchange rate from cgUSDT to USDT: decimal 9
  const cgusdtToUsdt = (cgusdtMinterResult[5]) / 10 ** 9

  // cgUSDT total supply: decimal 6
  const jettonResult = await getJettonMetadata(CGUSDT_ADDRESS)
  const cgUsdtTotalSupply = jettonResult['total_supply']

  // subtract the amount of cgUSDT in the withdrawal vault
  const withdrawVaultBalance = await getJettonBalance(CGUSDT_MINTER_ADDRESS, CGUSDT_ADDRESS)

  // caculate tvl
  const tvl = (cgUsdtTotalSupply - withdrawVaultBalance) / 10 ** 6 * cgusdtToUsdt
  return tvl
}

async function getClTonTvl() {
  const CLTON_MINTER_ADDRESS = 'EQDz48al4FfPnapvXYJOfkBOIj3xvNZ0t5vSpQN-Qukqwm7W'
  const CLTON_TOKEN_ADDRESS = 'EQCxd6SJQ8KiLkEpN3OoBfUIHqPE3yp0j80UnPysQqcTikNF'

  const cltonMinterResult = await call({ target: CLTON_MINTER_ADDRESS, abi: "get_minter_data", stack: [] })
  // exchange rate from clTON to TON: decimal 9

  const cltonToTon = cltonMinterResult[4] / 10 ** 9
  const cltonMetadata = await getJettonMetadata(CLTON_TOKEN_ADDRESS)

  // Now the tokens in the withdrawal vault will be correctly destroyed, so the TOTAL SUPPLY can be a true indication of tvl
  const cltonTotalSupply = cltonMetadata['total_supply']

  // 
  const cltonTvl = cltonTotalSupply / 10 ** 9 * cltonToTon

  return cltonTvl

}

async function tonTvl() {
  const cgusdtTvl = await getCgUsdtTvl()
  const cltonTvl = await getClTonTvl()

  return { "coingecko:tether": cgusdtTvl, "coingecko:the-open-network": cltonTvl }

}


module.exports = {
  methodology: "Calculates the total cgUSD,cgUSDT and clTON Supply",
  start: START_TIME,
  base: {
    tvl: baseTvl,
  },
  ton: {
    tvl: tonTvl
  }
};
