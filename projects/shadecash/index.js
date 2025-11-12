const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress, } = require('../helper/unwrapLPs')
const addresses = require('./contracts.json')
const { staking } = require('../helper/staking');
const { pool2 } = require('../helper/pool2')

const tokens = Object.values({
  nullAddress,
  "USDC": ADDRESSES.fantom.USDC,
  "xBOO": "0xa48d959AE2E88f1dAA7D5F611E01908106dE7598",
  "SHADE": "0x3A3841f5fa9f2c283EA567d5Aeea3Af022dD2262"
})

async function tvl(api) {
  const owners = Object.values(addresses)
  return sumTokens2({ api, owners, tokens })
}

const MASTERCHEF = "0x1719ab3C1518eB28d570a1E52980Dbc137B12e66"

module.exports = {
  fantom: {
    tvl,
    pool2: pool2(MASTERCHEF, "0x20aa395F3bcc4dc44a94215D129650533B3da0b3"),
    staking: staking(MASTERCHEF, '0x3A3841f5fa9f2c283EA567d5Aeea3Af022dD2262'),
  },
}