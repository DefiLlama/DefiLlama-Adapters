const DEPOSIT_POOL = '0xe8D294F3fff2A5CB34D15eCdEF34A53b01f5A462'
const CLAIM_POOL = '0x5F5a08fFFE8071410f3ECe2FCC40D81B457b28ce'

async function tvl(api) {
  const tokens = await api.call({  abi: 'address[]:getTokenList', target: DEPOSIT_POOL})
  return api.sumTokens({ tokens, owners: [DEPOSIT_POOL, CLAIM_POOL] })
}

module.exports = {
  methodology: 'TVL is the sum of all assets held in the DepositPool (user deposits awaiting transfer generation) and ClaimPool (funds backing outstanding transfers and the network fee pool) across ETH, USDC, DAI, and WBTC on Arbitrum One.',
  arbitrum: {
    tvl,
  },
}
