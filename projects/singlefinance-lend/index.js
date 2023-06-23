const { sumTokens2 } = require("../helper/unwrapLPs")
const { getConfig } = require('../helper/cache')
const sdk = require('@defillama/sdk');
const { vaultAbi } = require("./abi")

const BASE_API_URL = 'https://api.singlefinance.io'

const constants = {
  'cronos': {
    chainId: 25,
  },
  'fantom': {
    chainId: 250,
  },
  'arbitrum': {
    chainId: 42161,
  }
}

const data = {}
const getHelpers = (chain) => {

  const fetchDataOnce = (() => {
    if (!data[chain]) return getConfig('single/contracts/'+chain, `${BASE_API_URL}/api/protocol/contracts?chainid=${constants[chain].chainId}`)
    return data[chain]
  })

  async function tvl(tx, _block, chainBlocks) {
    const { vaults } = await fetchDataOnce()
    return sumTokens2({ tokensAndOwners: vaults.map(({ token, address }) => [token, address]), chain })
  }

  async function borrowed(tx, _block, chainBlocks,{ api }) {
    const { vaults } = await fetchDataOnce()

    // get vault debt value for each vaults
    const vaultsDebtValue = (await sdk.api.abi.multiCall({
        calls: vaults.map(({address}) => ({target: address})),
        abi: vaultAbi.vaultDebtVal,
        chain,
    })).output.map(a => a.output);

    // get pending interest for each vaults
    const vaultsPendingInterest = (await sdk.api.abi.multiCall({
        calls: vaults.map(({address}) => ({target: address, params: 0})),
        abi: vaultAbi.pendingInterest,
        chain,
    })).output.map(a => a.output);

    vaults.forEach((v, i) => {
        api.add(v.token, +vaultsPendingInterest[i] + +vaultsDebtValue[i])
    })
  }

  return {
    tvl,
    borrowed,
  }
}

module.exports = {
  start: 1643186078,
  methodology: "Sum of token balance, vault debt value and pending interest for all vaults",
  cronos: getHelpers('cronos'),
  fantom: getHelpers('fantom'),
  arbitrum: getHelpers('arbitrum'),
}
