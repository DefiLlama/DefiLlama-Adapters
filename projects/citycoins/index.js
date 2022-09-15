const retry = require('../helper/retry')
const axios = require('axios')
const BigNumber = require('bignumber.js')
const sdk = require('@defillama/sdk')

const STACKS_API = 'https://stacks-node-api.mainnet.stacks.co/extended/v1/address'

const NYC_CONTRACT = 'SP2H8PY27SEZ03MWRKS5XABZYQN17ETGQS3527SA5.newyorkcitycoin-core-v1'
const NYC_CONTRACT_V2 = 'SPSCWDV3RKV5ZRN1FQD84YE1NQFEDJ9R1F4DYQ11.newyorkcitycoin-core-v2'
const MIAMI_CONTRACT = 'SP466FNC0P7JWTNM2R9T199QRZN1MYEDTAR0KP27.miamicoin-core-v1'
const MIAMI_CONTRACT_V2 = 'SP1H1733V5MZ3SZ9XRW9FKYGEZT0JDGEB8Y634C7R.miamicoin-core-v2'
const MIAMI_CITY_WALLET = 'SM2MARAVW6BEJCD13YV2RHGYHQWT7TDDNMNRB1MVT'
const NYC_CITY_WALLET = 'SM18VBF2QYAAHN57Q28E2HSM15F6078JZYZ2FQBCX'

async function tvl() {
  const balances = {}

  await Promise.all([
    addStacks(NYC_CONTRACT, balances),
    addStacks(MIAMI_CONTRACT, balances),
    addStacks(NYC_CONTRACT_V2, balances),
    addStacks(MIAMI_CONTRACT_V2, balances),
  ])
  return balances
}

async function treasury() {
  const balances = {}
  await Promise.all([
    addStacks(MIAMI_CITY_WALLET, balances),
    addStacks(NYC_CITY_WALLET, balances)
  ])
  return balances
}

async function staking() {
  const balances = {}

  await Promise.all([
    addTokens(NYC_CONTRACT, balances),
    addTokens(MIAMI_CONTRACT, balances),
    addTokens(NYC_CONTRACT_V2, balances),
    addTokens(MIAMI_CONTRACT_V2, balances),
  ])
  return balances
}

async function getStacksBalances(address) {
  const url = `${STACKS_API}/${address}/balances`
  return retry(async () => await axios.get(url))
}

async function addStacks(address, balances) {
  const stx_balance = (await getStacksBalances(address)).data.stx.balance
  sdk.util.sumSingleBalance(balances, 'blockstack', BigNumber(stx_balance).div(1e6).toFixed(0))
}

async function addTokens(address, balances) {
  const {
    data: {
      fungible_tokens
    }
  } = await getStacksBalances(address)

  const decimals = [MIAMI_CONTRACT_V2, NYC_CONTRACT_V2] ? 6 : 0

  const tokenBalances = {
    output: Object.keys(fungible_tokens)
      .map(token =>
      ({
        input: { target: token },
        success: true,
        output: BigNumber(fungible_tokens[token].balance / 10 ** decimals).toFixed(0)
      }))
  }
  sdk.util.sumMultiBalanceOf(balances, tokenBalances, true, transformStacksToken)
}

function transformStacksToken(token) {
  token = token.split('::')[1] // take only the part after :: in the token string

  if (token === 'newyorkcitycoin')
    return 'nycccoin' // I am guessing coingecko id for NYC city coin is 'nyccoin' hence this replacement

  return  token
}

module.exports = {
  stacks: {
    tvl,
    // treasury, Note: Treasury has been disabled upon team request since they view it as amount reserved for city governers and does not belong to team
    staking,
  },
  methodology: 'Added STX tokens in addresses marked as city wallets as treasury. Added STX in contracts as TVL, and native tokens in it as staking'
};