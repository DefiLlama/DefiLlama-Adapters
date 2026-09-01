const ADDRESSES = require('../helper/coreAssets.json')

const { queryAddresses, sumTokens } = require('../helper/chain/radixdlt');

const componentAddress = 'component_rdx1cps7jyr7vqrtm2uxj8d77a9fyjkv804nhqzvfn2u7m58tg3wdk2qky'

const resources = [
    {
        address: ADDRESSES.radixdlt.XRD,
    },
    {
        address: 'resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf',
    }
]

async function tvl(api) {
  return sumTokens({ api, owners: [componentAddress] });
}

async function borrowed(api) {
    const componentData = await queryAddresses({ addresses: [componentAddress] });
    resources.forEach((resource) => {
        const matchingEntry = componentData[0].details.state.fields[12]?.entries.find((entry) => entry.key.value === resource.address);
        api.add(matchingEntry.key.value, Number(matchingEntry.value.value));
    });
}

module.exports = {
  radixdlt: { tvl, borrowed },
  timetravel: false,
};