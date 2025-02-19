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

async function tonTvl() {
  const MINTER_ADDRESS = "EQCfvQW-thWpqKgyqtXCFbYayDlHqS0-frkyP6VD70paLFZa"
  const CGUSDT_ADDRESS = 'EQBIBw3mF_TDMJqWAZihVsyUBMWpWw_deftZLiCxTmrCUOKy'

  const minterResult = await call({ target: MINTER_ADDRESS, abi: "get_minter_data", stack: [] })
  // exchange rate from cgUSDT to USDT: decimal 9
  const cgusdtTousdt = (minterResult[5]) / 10 ** 9

  // cgUSDT total supply: decimal 6
  const jettonResult = await getJettonMetadata(CGUSDT_ADDRESS)
  const cgUsdtTotalSupply = jettonResult['total_supply']

  // subtract the amount of cgUSDT in the withdrawal vault
  const withdrawVaultBalance = await getJettonBalance(MINTER_ADDRESS, CGUSDT_ADDRESS)

  // caculate tvl
  const tvl = (cgUsdtTotalSupply - withdrawVaultBalance) / 10 ** 6 * cgusdtTousdt
  return { "coingecko:tether": tvl }
}


module.exports = {
  methodology: "Calculates the total cgUSD and cgUSDT Supply",
  start: START_TIME,
  base: {
    tvl: baseTvl,
  },
  ton: {
    tvl: tonTvl
  }
};
