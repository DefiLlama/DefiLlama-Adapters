const { FixedPointNumber } = require("@acala-network/sdk-core")
const { getAPI, getWallet } = require('./api')


const getTotalStaking = async (api, token) => {
  const toBond = await api.query.homa.toBondPool();
  const stakingLedgers = await api.query.homa.stakingLedgers.entries();
  let totalInSubAccount = FixedPointNumber.ZERO;

  stakingLedgers.map(item => {
    const ledge = item[1].unwrapOrDefault();
    totalInSubAccount = totalInSubAccount.add(FixedPointNumber.fromInner(ledge.bonded.unwrap().toString(), token.decimals));
  })

  const total = FixedPointNumber.fromInner(toBond.toString(), token.decimals).add(totalInSubAccount);

  return total;
}

async function staking(chain) {
  const api = await getAPI(chain)
  const wallet = await getWallet(chain)
  const getStakingCurrencyId = api.consts.prices.getStakingCurrencyId;
  const stakingToken = await wallet.getToken(getStakingCurrencyId);
  const price = await wallet.getPrice(stakingToken);

  const total = await getTotalStaking(api, stakingToken)

  return {
    tether: total.times(price).toNumber(),
  }
}

module.exports = {
  staking,
  getTotalStaking,
}