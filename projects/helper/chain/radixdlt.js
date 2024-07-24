
const { getUniqueAddresses, } = require('../tokenMapping')
const { getFixBalancesSync } = require('../portedTokens')
const { sliceIntoChunks } = require('../utils')
const BigNumber = require('bignumber.js')
const { post } = require('../http')
const sdk = require('@defillama/sdk')
const ADDRESSES = require('../coreAssets.json')

const chain = 'radixdlt'


const ENTITY_DETAILS_URL = `https://mainnet.radixdlt.com/state/entity/details`

async function sumTokens({ owner, owners = [], api, transformLSU = false, }) {
  const fixBalances = getFixBalancesSync(chain)

  if (owner) owners.push(owner)
  owners = getUniqueAddresses(owners)
  if (!owners.length) return api.getBalances()
  sdk.log('fetching tokens for ', owners.length, 'addresses')

  let items = await queryAddresses({ addresses: owners })
  items.forEach((item) => {
    item.fungible_resources.items.forEach(({ resource_address, amount }) => {
      api.add(resource_address, +amount)
    });
  });
  if (transformLSU) await transformLSUs(api)
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


/**
 * queryLsus takes a list of addresses as argument.
 * The return value is a dictionary with the lsu address and it's valuation in xrd.
 * Example response:
 *
 * {
    resource_rdxabc1: {
      totalSupplyOfStakeUnits: '48921317.41255863564527699',
      validatorAddress: 'validator_rdx1s0lz5v68gtqwswu7lrx9yrjte4ts0l2saphmplsz68nsv2aux0xvfq',
      xrdRedemptionValue: 1.0087202808923446
    },
    resource_rdx1cde1: {
      totalSupplyOfStakeUnits: '27022271.985429161792201709',
      validatorAddress: 'validator_rdx1s0g5uuw3a7ad7akueetzq5lpejzp9uw5glv2qnflvymgendvepgduj',
      xrdRedemptionValue: 1.0087163411719327
    }
  }
  This function does not validate that list received is a proper LSU resources list,
  If no LSU resources used, this call could result in empty or partial returns.
**/
async function queryLiquidStakeUnitDetails(addresses = []) {
  addresses = addresses.filter(i => i !== ADDRESSES.radixdlt.XRD)
  let lsuRedemptionValues = {}

  const chunks  = sliceIntoChunks(addresses, 20)
  for (const chunk of chunks) {
    let body = {
      "addresses": chunk,
      "aggregation_level": "Vault",
      "explicit_metadata": ["validator"]
    }
    try {
      let data = await post(ENTITY_DETAILS_URL, body)
      let validators = []
      for (const lsuResource of data.items) {
        let v = lsuResource.metadata.items.filter(metadataItem => metadataItem.key === "validator")
        if (v !== undefined) {
          let validator = v[0]
          if (validator.value.typed.type === "GlobalAddress" && validator.value.typed.value.startsWith("validator_")) {
            lsuRedemptionValues[lsuResource.address] = {
              "totalSupplyOfStakeUnits": lsuResource.details.total_supply,
              "validatorAddress": validator.value.typed.value
            }
            validators.push(validator.value.typed.value)
          } else {
            console.log(`Validator: ${validator} is not a valid or it might not exist`)
          }
        } else {
          console.log(`resource: ${lsuResource.address} doesn't seem to be an LSU resource`)
        }

      }
      let validatorsDetailsBody = {
        "addresses": validators,
        "aggregation_level": "Vault"
      }
      let validatorsData = await post(ENTITY_DETAILS_URL, validatorsDetailsBody)
      for (const validator of validatorsData.items) {
        let stakeUnitResourceAddress = validator.details.state.stake_unit_resource_address
        let stakeXrdVaultAddress = validator.details.state.stake_xrd_vault.entity_address

        let xrdStakeResource = validator.fungible_resources.items.filter(item => item.resource_address === ADDRESSES.radixdlt.XRD)
        let xrdStakeVault = xrdStakeResource[0].vaults.items.filter(vault => vault.vault_address === stakeXrdVaultAddress)
        let xrdStakeVaultBalance = new BigNumber(xrdStakeVault[0].amount)

        let totalSupplyOfStakeUnits = new BigNumber(lsuRedemptionValues[stakeUnitResourceAddress]["totalSupplyOfStakeUnits"])
        let xrdRedemptionValue =  xrdStakeVaultBalance / totalSupplyOfStakeUnits
        lsuRedemptionValues[stakeUnitResourceAddress]["xrdRedemptionValue"] = xrdRedemptionValue
      }
    } catch(error) {
      console.log("There was an error getting the xrd redemption value. Check that all addressed used are LSU resource addresses")
      return {}
    }
  }
  return lsuRedemptionValues
}

function sumTokensExport({...args}) {
  return async (api) => sumTokens({ ...args, api, })
}

async function transformLSUs(api) {
  const balances = api.getBalances()
  const tokens = Object.keys(balances).filter(i => i.startsWith('radixdlt:resource_')).map(i => i.replace('radixdlt:', ''))
  if (tokens.length) {
    const lsuRedemptionValues = await queryLiquidStakeUnitDetails(tokens)
    Object.entries(lsuRedemptionValues).forEach(([lsuResourceAddress, { xrdRedemptionValue }]) => {
      const bals = balances[`radixdlt:${lsuResourceAddress}`] * xrdRedemptionValue
      api.add(ADDRESSES.radixdlt.XRD, bals)
      delete balances[`radixdlt:${lsuResourceAddress}`]
    })
  }
  return api.getBalances()
}

module.exports = {
  queryAddresses,
  queryLiquidStakeUnitDetails,
  sumTokens,
  sumTokensExport,
  transformLSUs,
}
