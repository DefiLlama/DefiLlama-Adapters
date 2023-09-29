const { post } = require('../http')

function getNameFromMetadata(metadata) {
  for(const item of metadata.items) {
    if (item.key == "name") {
      return item.value.typed.value.replace(/ /g, "-")
    }
  }
  return ""
}

const ENTITY_DETAILS_URL = `https://mainnet.radixdlt.com/state/entity/details`

/**
 * getBalances expects a list of components addresses like
 * [
 *  component_rdx1cptxxxxxxxxxajhkjahkaj,
 *  component_rdx1cptxxxxxxxxxlkjljljlkkj
 * ]
 *
 * Each component has a list of fungible resources so we call state/entity/details
 * with all the components addresses as params and we get a list of items as result
 *
 * We iterate over all items and we add up the amount for each fungible resource
 * DefiLlama sdk expects an input in the for of
 *
 * {
 *  token_one_name_in_coin_gecko: amount_token_one,
 *  token_two_name_in_coin_gecko: amount_token_two
 * }
 *
 */

async function getBalances(components) {
  const body = {
    "addresses": components,
    "opt_ins": {"explicit_metadata": ["name"]}
  }
  let data;
  try {
    data = await post(ENTITY_DETAILS_URL, body)
  } catch (error) {
    console.log(error)
    return {}
  }
  const resourceAmounts = {}
  data.items.forEach((item) => {
    item.fungible_resources.items.forEach((resource) => {
      const resourceAddress = resource.resource_address;
      const amount = resource.amount;

      if (resourceAmounts.hasOwnProperty(resourceAddress)) {
        resourceAmounts[resourceAddress] += parseFloat(amount);
      } else {
        resourceAmounts[resourceAddress] = parseFloat(amount);
      }
    });
  });

  let balancesByName = {}
  body["addresses"] = Object.keys(resourceAmounts);

  let resourcesDetails
  try {
    resourcesDetails = await post(ENTITY_DETAILS_URL, body)
  } catch (error) {
    console.log(error)
    resourcesDetails.items = []
  }

  resourcesDetails.items.forEach(resource => {
    const resourceName = getNameFromMetadata(resource.explicit_metadata)
    balancesByName[resourceName] = resourceAmounts[resource.address]
  });

  console.log(balancesByName)
  return balancesByName
}

module.exports = {
  getBalances,
}
