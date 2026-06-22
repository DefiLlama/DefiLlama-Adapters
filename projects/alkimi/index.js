const { getObject } = require('../helper/chain/sui')

const STAKING_VAULT = '0xc92fe84368fc3ff40713792c750709501fcfc4869f120755fd0bea5cac1ead94'
const ALKIMI_DECIMALS = 9n
const ALKIMI_COINGECKO_ID = 'alkimi-2'

const staking = async () => {
  const content = await getObject(STAKING_VAULT)
  const fields = content?.fields
  if (!fields) return {}

  const total = BigInt(fields.balance || '0')
  return {
    [ALKIMI_COINGECKO_ID]: Number(total / 10n ** ALKIMI_DECIMALS),
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Staking counts all ALKIMI tokens locked in the StakingVault (user + admin)',
  sui: {
    tvl: async () => 0,
    staking,
  },
}
