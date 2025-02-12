const { call, getJettonBalances, getTonBalance, sumTokens } = require("../helper/chain/ton");
const { sleep } = require('../helper/utils')
const ADDRESSES = require('../helper/coreAssets.json')

const TON_POOL_ADDRESS = "EQAze1aSZHY1yUGz1BFndH62k-VYpXYeDiYofCXTRZClF8Qr"
const USD_POOL_ADDRESS = "EQBy7pjr6IBzqW8vuVCZ780evtnkiIF3jZSRRDxeqScfZoU9"
const CTON_ADDRESS = "0:86cf8401d283627a87b58c367b440cad933ab8aa7b383419e8ff7d1a00c945f8"
const CTUSDT_ADDRESS = "0:9fb449ce8fb43d0f682c713c01d9d8357c7cd0d4a49dd64dd585926990174a4e"
const USDT_ADDRESS = "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe"

async function tvl(api) {
  return sumTokens({ owners: [TON_POOL_ADDRESS, USD_POOL_ADDRESS, "UQDFlyZ5zsWyowbZvZjZwIW_Vzm-1uvf8z_PUfvQtHrV14dp"], tokens: [ADDRESSES.null, USDT_ADDRESS], api, onlyWhitelistedTokens: true })
}

module.exports = {
  methodology: 'Total amount of collateral locked in the Catton Protocol',
  timetravel: false,
  ton: {
    tvl
  }
}
