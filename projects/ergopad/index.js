const utils = require('../helper/utils');

async function staking() {
  const { data: { 'Total amount staked': totalStaked } } = await utils.fetchURL('https://api.ergopad.io/staking/status/');
  const price = await getErgopadPrice()
  return {
    ergo: totalStaked * price
  }
}

async function getErgopadPrice() {
  const { data: { lockedX, lockedY, } } = await utils.fetchURL('https://api.spectrum.fi/v1/amm/pool/d7868533f26db1b1728c1f85c2326a3c0327b57ddab14e41a2b77a5d4c20f4b2/stats');
  let ergQuantity, padQunatity

  const ergId = '0000000000000000000000000000000000000000000000000000000000000000'
  if (lockedX.id === ergId) {
    ergQuantity = getQuantity(lockedX)
    padQunatity = getQuantity(lockedY)
  } else {
    ergQuantity = getQuantity(lockedY)
    padQunatity = getQuantity(lockedX)
  }

  function getQuantity({ amount, decimals }) {
    return amount / 10 ** decimals
  }

  return ergQuantity / padQunatity

}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ergo: {
    tvl: () => ({}),
    staking
  },
  methodology: `Ergopad TVL is achieved by making a call to its API: https://ergopad.io/api/blockchain/tvl/d71693c49a84fbbecd4908c94813b46514b18b67a99952dc1e6e4791556de413 and consists of both staked ergopad tokens.`
}
