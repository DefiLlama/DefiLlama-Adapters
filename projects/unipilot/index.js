const { cachedGraphQuery } = require('../helper/cache')
const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const getPositionDetails =
  "function getPositionDetails() returns (uint256 amount0, uint256 amount1, uint256 fees0, uint256 fees1, uint128 baseLiquidity, uint128 rangeLiquidity)";

const FACTORY_ADDRESSES = {
  ethereum: {
    activeFactory: "0x4b8e58d252ba251e044ec63125e83172eca5118f",
    passiveFactory: "0x06c2ae330c57a6320b2de720971ebd09003c7a01",
  },
  polygon: {
    activeFactory: "0x95b77505b38f8a261ada04f54b8d0cda08904708",
    passiveFactory: "0x2536527121fc1048ae5d45327a34241a355a6a95",
    activeFactoryQ: "0xC99fA77AB721817Da9dD3C3b4F8ecB13772FCECE",
    passiveFactoryQ: "0xbd712D4dbd4b8d0cD2A98aDb0f9fC2928031b16F",
  },
  arbitrum: {
    activeFactory: "0xca69c359e3297aa855e77f83e071feab17f0ede6",
    passiveFactory: "0x6900c436cf15d6d0016dc71a5ce5ade843031efd",
  },
  bsc: {
    activeFactory: "0x9c7cB0BB03044D6c1c472b26058bFA61B9956D22",
    passiveFactory: "0x6900c436CF15D6D0016dC71A5CE5ADe843031eFd",
  },
  polygon_zkevm: {
    activeFactoryQ: "0xC99fA77AB721817Da9dD3C3b4F8ecB13772FCECE",
    passiveFactoryQ: "0xbd712D4dbd4b8d0cD2A98aDb0f9fC2928031b16F",
  },
  dogechain: {
    activeFactoryQ: "0x16C6D274e076c7b36a4D3fEE2f9AB2E12d220bd5",
    passiveFactoryQ: "0x30BeB7A1d66CBE9594E159979F0c7e31A9F68e74",
  },
};

const DEFAULT_VAULT_CREATION_TOPIC = "VaultCreated(address,address,uint16,uint24,address)";
const VAULT_CREATION_TOPIC = {
  ethereum: "VaultCreated(address,address,uint24,address)",
};

const PILOT_STAKING_CONTRACT = "0xc9256e6e85ad7ac18cd9bd665327fc2062703628";
const PILOT = "0x37c997b35c619c21323f3518b9357914e8b99525";

const START_BLOCKS = {
  ethereum: {
    activeFactory: 14495907,
    passiveFactory: 14495929,
  },
  polygon: {
    activeFactory: 34288237,
    passiveFactory: 34371363,
    activeFactoryQ: 42886155,
    passiveFactoryQ: 42212527,
  },
  arbitrum: {
    activeFactory: 59667444,
    passiveFactory: 58774134,
  },
  bsc: {
    activeFactory: 27139991,
    passiveFactory: 27140068,
  },
  polygon_zkevm: {
    activeFactoryQ: 300919,
    passiveFactoryQ: 209294,
  },
  dogechain: {
    activeFactoryQ: 12700049,
    passiveFactoryQ: 12829893,
  },
};

async function getVaultLogs(vaults, factoryType, api) {
  const chain = api.chain
  let topic = DEFAULT_VAULT_CREATION_TOPIC
  if (VAULT_CREATION_TOPIC[chain])
    topic = VAULT_CREATION_TOPIC[chain]

  if (factoryType === "activeFactoryQ" || factoryType === "passiveFactoryQ")
    topic = 'VaultCreated(address,address,uint16,address)'

  const vaultLogs = await getLogs({
    target: FACTORY_ADDRESSES[chain][factoryType],
    topic,
    fromBlock: START_BLOCKS[chain][factoryType],
    api,
  });

  for (let log of vaultLogs) {
    vaults[`0x${log.topics[3].substr(-40)}`.toLowerCase()] = {
      token0Address: `0x${log.topics[1].substr(-40)}`,
      token1Address: `0x${log.topics[2].substr(-40)}`,
    };
  }

  return vaults;
}

async function tvl(api) {
  let vaults = {};
  if (api.chain === "dogechain") {
    const res = await cachedGraphQuery('unipilot/'+api.chain, 'https://apis.unipilot.io:5000/subgraphs/name/hamzabhatti125/stats-dogechain', `{
      vaults {
        token0 {
          id
        }
        token1 {
          id
        }
        id
      }
    }`)
    res.vaults.forEach(({ token0, token1, id }) => {
      vaults[id] = {
        token0Address: token0.id,
        token1Address: token1.id,
      }
    })
  } else {
    for (const label of Object.keys(START_BLOCKS[api.chain]))
      await getVaultLogs(vaults, label, api)

  }

  const ownerTokens = Object.entries(vaults).map(([v, i]) => [[i.token0Address, i.token1Address], v])
  const vaultKeys = Object.keys(vaults)

  //get vault reserves(amount, fees) from contract
  const vaultReserves = await api.multiCall({ abi: getPositionDetails, calls: vaultKeys, })

  vaultKeys.forEach((v, i) => {
    i = vaultReserves[i]
    api.add(vaults[v].token0Address, i.amount0)
    api.add(vaults[v].token0Address, i.fees0)
    api.add(vaults[v].token1Address, i.amount1)
    api.add(vaults[v].token1Address, i.fees1)
  })
  return sumTokens2({ api, ownerTokens })
}

module.exports = {
  doublecounted: true,
};

Object.keys(FACTORY_ADDRESSES).forEach(chain => {
  module.exports[chain] = { tvl }
})

module.exports.ethereum.staking = staking(PILOT_STAKING_CONTRACT, PILOT)