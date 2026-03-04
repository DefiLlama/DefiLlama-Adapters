const { staking } = require("../helper/staking")
const { pool2 } = require("../helper/pool2")
const ADDRESSES = require('../helper/coreAssets.json')

const VAULTS = {
  bsc: {
    STABLECOINS: '0xf1f25A26499B023200B3f9A30a8eCEE87b031Ee1',
    ETH: '0x941ef9AaF3277052e2e6c737ae9a75b229A20988',
    BTC: '0xed18f1CE58fED758C7937cC0b8BE66CB02Dc45c6',
    ALTCOINS: '0x5d735e9ffE9664B80c405D16921912E5B989688C',
  },
  polygon: {
    STABLECOINS: '0x0aF9F3297f34921Acd5Ac81970929964c9f3d0a7',
  }
}

async function tvl(api) {
  const balances = {};
  const vaults = Object.values(VAULTS[api.chain])
  const bals  = await api.multiCall({  abi: 'uint256:getTotalDeposit', calls: vaults})
  let usd = 0
  if(api.chain === 'bsc') {
    usd = bals.reduce((acc, i) => Number(acc) + Number(i), 0)
  } else {
    usd = bals.reduce((acc, i) => Number(acc) + Number(i)/1e12, 0)
  }
  balances[`${api.chain}:${ADDRESSES[api.chain].USDT}`] = usd
  return balances
}

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl,
    staking: staking('0x3782c47e62b13d579fe748946aef7142b45b2cf7', '0x766AFcf83Fd5eaf884B3d529b432CA27A6d84617'),
    pool2: pool2('0x3782c47e62b13d579fe748946aef7142b45b2cf7', '0x12c35ed2405bc70721584594723351bf5db6235c'),
  },
  polygon: { tvl, }
}
