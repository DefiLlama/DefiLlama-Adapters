const ADDRESSES = require('../helper/coreAssets.json')
const { queryV1Beta1 } = require("../helper/chain/cosmos");
const sdk = require("@defillama/sdk");

async function tvl() {
  const data = await queryV1Beta1({ chain: 'cronos', url: '/staking/v1beta1/delegations/cro1klkxkl2c59m5dcw4w0683ctfaxklsy9py26jg3', })
  let total = data.delegation_responses.reduce((a, i) => a += +i.balance.amount, 0)
  const balances = {}
  sdk.util.sumSingleBalance(balances, 'cronos:' + ADDRESSES.cronos.WCRO_1, total * 1e10)
  return balances
}

async function staking(api) {
  const xargoBalance = await api.call({ target: '0x1dE93ce995d1bC763c2422ba30b1E73dE4A45a01', abi: 'erc20:totalSupply' })
  let balance = {
    "cronos:0x47A9D630dc5b28F75d3AF3be3AAa982512Cd89Aa": xargoBalance
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