const { post } = require('../http')

function getNameFromMetadata(metadata) {
  for(const item of metadata.items) {
    if (item.key == "name") {
      return item.value.typed.value.replace(/ /g, "-")
    }
  }
  return ""
}

// TODO: update the url below with the final url after babylon
const ENTITY_DETAILS_URL = `https://rcnet-v3.radixdlt.com/state/entity/details`

async function getBalances(components) {
  const body = {
    "addresses": components,
    "opt_ins": {
      "explicit_metadata": [
        "name"
      ]
    }
  }
  const data = await post(ENTITY_DETAILS_URL, body)

  const resourceAmounts = {}
  data.items.forEach((item) => {
    item.fungible_resources.items.forEach((resource) => {
      const resourceAddress = resource.resource_address;
      const amount = resource.amount;

      if (resourceAmounts.hasOwnProperty(resourceAddress)) {
        resourceAmounts[resourceAddress] += amount;
      } else {
        resourceAmounts[resourceAddress] = amount;
      }
    });
  });

  const balancesByName = {}
  body["addresses"] = Object.keys(resourceAmounts);
  const resourcesDetails = await post(ENTITY_DETAILS_URL, body)
  resourcesDetails.items.forEach(resource => {
    const resourceName = getNameFromMetadata(resource.explicit_metadata)
    balancesByName[resourceName] = parseFloat(resourceAmounts[resource.address])
  });

  return balancesByName
}

module.exports = {
  getBalances,
}
