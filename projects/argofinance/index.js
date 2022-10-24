const { fetchURL } = require("../helper/utils");
const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const cryptoOrgUrl = 'https://mainnet.crypto.org:1317/cosmos/staking/v1beta1/delegations/cro1klkxkl2c59m5dcw4w0683ctfaxklsy9py26jg3'

async function tvl(timestamp, chain) {
  const data = await fetchURL(cryptoOrgUrl)
  let total = new BigNumber(0)
  data.data.delegation_responses.forEach(delegation => {
    total = BigNumber.sum(total, new BigNumber(delegation.balance.amount))
  })
  let balance = {
    'cronos:0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23': total.multipliedBy(new BigNumber(10000000000), 10),
  }
  return balance
}

async function staking(timestamp, chain) {
  const { output: xargoBalance } = await sdk.api.erc20.totalSupply({ target: "0x1dE93ce995d1bC763c2422ba30b1E73dE4A45a01", chain: 'cronos' })
  
  const bigXArgoBalance = new BigNumber(xargoBalance)
  let balance = {
    "cronos:0x47A9D630dc5b28F75d3AF3be3AAa982512Cd89Aa": bigXArgoBalance
  }
  return balance
}

module.exports = {
  timetravel: false,
  methodology: `The TVL is counted as the total CRO that is currently being delegated. We query the crypto.org api for the delegations and sum up the CRO being delegated. The Staking TVL is computed as the total XARGO being pledged on our platform. ARGO and XARGO has a 1:1, with XARGO being a pledged version of ARGO. The Staking TVL is calculated by getting the totalSupply() of XARGO in our contract.`,
  cronos: {
    tvl,
    staking
  }
}