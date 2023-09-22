const { post } = require('../http')

function getNameFromMetadata(metadata) {
  for(const item of metadata.items) {
    if (item.key == "name") {
      return item.value.typed.value
    }
  }
  return ""
}

// TODO: update the url below with the final url after babylon
const ENTITY_DETAILS_URL = `https://rcnet-v3.radixdlt.com/state/entity/details`

async function getBalances(component) {
  const body = {
    "addresses": [component]
  }
  const data = await post(ENTITY_DETAILS_URL, body)
  const fungibleResources =  data["items"][0]["fungible_resources"]["items"]

  const balancesByName = {}
  const balancesByResource = {}
  const resourceAddresses = []
  fungibleResources.forEach(resource => {
    resourceAddresses.push(resource.resource_address)
    balancesByResource[resource.resource_address] = resource.amount
  });

  body["addresses"] = resourceAddresses

  const resourcesDetails = await post(ENTITY_DETAILS_URL, body)
  resourcesDetails.items.forEach(resource => {
    const resourceName = getNameFromMetadata(resource.metadata)
    balancesByName[resourceName] = parseFloat(balancesByResource[resource.address])
  });

  return balancesByName
}

module.exports = {
  getBalances,
}
