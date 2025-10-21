const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require("../helper/treasury");
const axios = require('axios')

const evm_owners = ['0x8f456e525ed0115e22937c5c8afac061cc697f21']
const btc_owners= ['bc1qe02p6kqe40g826zp3yfyzgs87c5az2v6wfvn30']
const API_URL = 'https://api.hyperliquid.xyz/info'

const tvl = async (api) => {
  const { data } = await axios.post(API_URL, { "type": "userVaultEquities", user: evm_owners[0] })
  data.forEach(({ equity }) => {
    api.add(ADDRESSES.ethereum.USDC, +equity * 1e6, { skipChain: true })
  })
}

module.exports = {
  hyperliquid: { tvl },
  ...treasuryExports({
    isComplex: true,
    complexOwners: evm_owners,
    bitcoin: { owners: btc_owners },
    ethereum: {  },
    mantle: {  },
  })
}