const { queryV1Beta1 } = require('../helper/chain/cosmos')
const ADDRESSES = require('../helper/coreAssets.json')

// Public Cronos POS validator operator address, published on stake-only.org.
const VALIDATOR = 'crocncl15wphtrqekhsted9fg4t7mm2a00u7ke7pu3965e'

async function tvl() {
  // The existing Cosmos helper's "cronos" LCD points to Cronos POS,
  // https://rest.mainnet.crypto.org, not the Cronos EVM JSON-RPC.
  const { validator } = await queryV1Beta1({
    chain: 'cronos',
    url: `/staking/v1beta1/validators/${VALIDATOR}`,
  })

  if (validator?.operator_address !== VALIDATOR || !/^\d+$/.test(validator.tokens))
    throw new Error('Invalid Stake-Only validator response')

  // Cronos POS CRO uses eight decimals. DefiLlama prices CRO using the
  // existing Cronos WCRO key (18 decimals), as in other CRO adapters.
  // This only selects the CRO price; no EVM balance is included.
  return { [`cronos:${ADDRESSES.cronos.WCRO_1}`]: (BigInt(validator.tokens) * 10n ** 10n).toString() }
}

module.exports = {
  timetravel: false,
  methodology: 'Counts native CRO backing current delegations to the Stake-Only Cronos POS validator, read directly from the Cosmos staking module validator.tokens field. Includes validator self-delegation; excludes pending undelegations, unclaimed rewards, wallet holdings, loyalty reward reserves, treasury balances, and liquidity or staking positions in other protocols. Proposed Staking Pool classification, following existing validator-based adapters; classification remains subject to DefiLlama review.',
  cronos: { tvl },
}
