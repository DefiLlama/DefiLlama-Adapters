const { post } = require('../http')
const { getUniqueAddresses, } = require('../tokenMapping')
const { getFixBalancesSync } = require('../portedTokens')
const { sliceIntoChunks } = require('../utils')
const BigNumber = require('bignumber.js')
const chain = 'radixdlt'
const XRD_RESOURCE_ADDRESS = 'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd'


const ENTITY_DETAILS_URL = `https://mainnet.radixdlt.com/state/entity/details`

async function sumTokens({ owner, owners = [], api, }) {
  const fixBalances = getFixBalancesSync(chain)

  if (owner) owners.push(owner)
  owners = getUniqueAddresses(owners)
  if (!owners.length) return api.getBalances()
  console.log('fetching tokens for ', owners.length, 'addresses')

  let items = await queryAddresses({ addresses: owners })
  items.forEach((item) => {
    item.fungible_resources.items.forEach(({ resource_address, amount }) => {
      api.add(resource_address, +amount)
    });
  });
  return fixBalances(api.getBalances())
}

async function queryAddresses({ addresses = [], }) {
  let items = []
  const chunks  = sliceIntoChunks(addresses, 20)
  for (const chunk of chunks) {
    const body = {
      "addresses": chunk,
      "opt_ins": { "explicit_metadata": ["name"] }
    }
    let data = await post(ENTITY_DETAILS_URL, body)
    items.push(...data.items)
  }
  return items
}

async function queryLsus(addresses = []) {
  // Receives a list of lsu addresses and returns the redemption value in XRD

  let lsuRedemptionValues = {}
  const chunks  = sliceIntoChunks(addresses, 20)
  for (const chunk of chunks) {
    let body = {
      "addresses": chunk,
      "aggregation_level": "Vault"
    }
    let data = await post(ENTITY_DETAILS_URL, body)

    let validators = []
    for (const lsuResource of data.items) {
      let validator = lsuResource.metadata.items.filter(metadataItem => metadataItem.key === "validator")[0]
      lsuRedemptionValues[lsuResource.address] = {
        "totalSupplyOfStakeUnits": lsuResource.details.total_supply,
        "validatorAddress": validator.value.typed.value
      }

      validators.push(validator.value.typed.value)
    }

    let validatorsDetailsBody = {
      "addresses": validators,
      "aggregation_level": "Vault"
    }
    let validatorsData = await post(ENTITY_DETAILS_URL, validatorsDetailsBody)
    for (const validator of validatorsData.items) {
      let stakeUnitResourceAddress = validator.details.state.stake_unit_resource_address
      let stakeXrdVaultAddress = validator.details.state.stake_xrd_vault.entity_address

      let xrdStakeResource = validator.fungible_resources.items.filter(item => item.resource_address === XRD_RESOURCE_ADDRESS)
      let xrdStakeVault = xrdStakeResource[0].vaults.items.filter(vault => vault.vault_address === stakeXrdVaultAddress)
      let xrdStakeVaultBalance = new BigNumber(xrdStakeVault[0].amount)

      let totalSupplyOfStakeUnits = new BigNumber(lsuRedemptionValues[stakeUnitResourceAddress]["totalSupplyOfStakeUnits"])
      let xrdRedemptionValue =  xrdStakeVaultBalance / totalSupplyOfStakeUnits
      lsuRedemptionValues[stakeUnitResourceAddress]["xrdRedemptionValue"] = xrdRedemptionValue
    }
  }
  return lsuRedemptionValues
}

function sumTokensExport(...args) {
  return async (_, _1, _2, { api }) => sumTokens({ ...args, api, })
}

module.exports = {
  queryAddresses,
  queryLsus,
  sumTokens,
  sumTokensExport,
}
