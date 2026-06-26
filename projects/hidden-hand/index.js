const { sumTokens2 } = require('../helper/unwrapLPs')
const { cachedGraphQuery } = require('../helper/cache')

async function marionetteTvl(api) {
  const owners = ["0x60443fd265b4a4D51DFE2569569D45DBde393B14", "0x6045648cF69285fC2018Ca8F3ee8844d5e05Ee5d"]; //marionette adapters

  return sumTokens2({
    api,
    owners,
    solidlyVeNfts: [
      {
        isAltAbi: true,
        baseToken: "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11",
        veNft: "0xfBBF371C9B0B994EebFcC977CEf603F7f31c070D"
      }, // veTHENA
    ],
    permitFailure: true,
  });
}

const marionette = {
  methodology: `Sums veTokens deposited on Hidden Hand Marionette Adapters.`,
  bsc: { tvl: marionetteTvl },
};

const protocol_contracts = {
  ethereum: {
    v1: {
      distributor: "0x0b139682d5c9df3e735063f46fb98c689540cf3a",
      vault: "0x9DDb2da7Dd76612e0df237B89AF2CF4413733212",
    },
    v2: {
      distributor: "0xa9b08B4CeEC1EF29EdEC7F9C94583270337D6416",
      vault: "0xE00fe722e5bE7ad45b1A16066E431E47Df476CeC",
      harvester: "0xd23aa7EdF42CD3Fc4CD391faAbc0c207B1c86542",
    },
  },
  optimism: {
    v1: {
      distributor: "0x0b139682d5c9df3e735063f46fb98c689540cf3a",
      vault: "0x9DDb2da7Dd76612e0df237B89AF2CF4413733212",
    },
    v2: {
      distributor: "0x7354BB6842E421773E7b78f8875A1B85991677c0",
      vault: "0xa9b08B4CeEC1EF29EdEC7F9C94583270337D6416",
      harvester: "0x4573F58461acd1a6C743d9CDE34A142Ca18B6873",
    },
  },
  arbitrum: {
    v2: {
      distributor: "0x0A390DE04B7717B078CF5c8A7Eb891130d4a843b",
      vault: "0x8d89593c199Cb763bDEF04529F978f82503E4669",
      harvester: "0xcA795Dc6f668add4801D2B92cF36C8FBcBEb8Ac4",
    },
  },
};

const subgraphs = {
  ethereum: {
    v1: "https://api.thegraph.com/subgraphs/name/albuquerque-rafael/hidden-hand",
    v2: "https://api.thegraph.com/subgraphs/name/albuquerque-rafael/hidden-hand-v2",
  },
  optimism: {
    v1: "https://api.thegraph.com/subgraphs/name/albuquerque-rafael/hidden-hand-v1-optimism",
    v2: "https://api.thegraph.com/subgraphs/name/albuquerque-rafael/hidden-hand-v2-optimism",
  },
  arbitrum: {
    v2: "https://api.thegraph.com/subgraphs/name/albuquerque-rafael/hidden-hand-v2-arbitrum",
  },
};

async function getTokens(chain, version) {
  const graphQuery = `
    {
      tokens {
        address
      }
    }
  `;

  const { tokens } = await cachedGraphQuery(`hidden-hand/${chain}-${version}`, subgraphs[chain][version], graphQuery);
  const addresses = tokens.map((token) => token.address);

  return addresses;
}

async function tvl(api) {
  const { chain } = api
  const ownerTokens = []

  for (const version of Object.keys(protocol_contracts[chain])) {
    const tokens = await getTokens(chain, version);
    for (const owner of Object.values(protocol_contracts[chain][version])) {
      ownerTokens.push([tokens, owner])
    }
  }

  return sumTokens2({ api, ownerTokens, permitFailure: true, });
}

module.exports = {
  methodology: `Sums bribe tokens deposited on Hidden Hand Reward Distributors, Bribe Vaults and Harvester contracts and veTHE deposited in Marionette.`,
  ethereum: { tvl },
  optimism: { tvl },
  arbitrum: { tvl },
  bsc: marionette.bsc,
};
