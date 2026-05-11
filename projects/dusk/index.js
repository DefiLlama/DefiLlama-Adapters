const { post } = require('../helper/http')

const DUSK_RPC = process.env.DUSK_RPC || 'https://nodes.dusk.network'
const LUX_PER_DUSK = 1_000_000_000n
const DUSK_COINGECKO_ID = 'dusk-network'

function luxToDusk(lux) {
  const whole = lux / LUX_PER_DUSK
  const fractional = lux % LUX_PER_DUSK
  return Number(whole) + Number(fractional) / 1e9
}

async function tvl(api) {
  const provisioners = await post(`${DUSK_RPC}/on/node/provisioners`)

  if (!Array.isArray(provisioners)) {
    throw new Error('Expected /on/node/provisioners response to be an array')
  }

  const totalLux = provisioners.reduce(
    (sum, provisioner) =>
      sum + BigInt(provisioner.amount ?? 0) + BigInt(provisioner.locked_amt ?? 0),
    0n
  )

  api.addCGToken(DUSK_COINGECKO_ID, luxToDusk(totalLux))
}

module.exports = {
  timetravel: false,
  methodology: 'Counts native DUSK staked by provisioners from Rusk chain state exposed by /on/node/provisioners. Sums stake amount plus locked stake, converts from LUX to DUSK, and excludes pending rewards.',
  dusk: { tvl },
}
