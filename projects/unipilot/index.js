const sdk = require("@defillama/sdk");
const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require('../helper/unwrapLPs')
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
  },
  arbitrum: {
    activeFactory: "0xca69c359e3297aa855e77f83e071feab17f0ede6",
    passiveFactory: "0x6900c436cf15d6d0016dc71a5ce5ade843031efd",
  },
};

const VAULT_CREATION_TOPIC = {
  ethereum: "VaultCreated(address,address,uint24,address)",
  polygon: "VaultCreated(address,address,uint16,uint24,address)",
  arbitrum: "VaultCreated(address,address,uint16,uint24,address)",
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
  },
  arbitrum: {
    activeFactory: 59667444,
    passiveFactory: 58774134,
  },
};

async function getVaultLogs(chain, block, factoryType, api) {
  const vaults = {};

  const vaultLogs = await getLogs({
    target: FACTORY_ADDRESSES[chain][factoryType],
    topic: VAULT_CREATION_TOPIC[chain],
    fromBlock: START_BLOCKS[chain][factoryType],
    api,
  });

  for (let log of vaultLogs) {
    vaults[`0x${log.topics[3].substr(-40)}`] = {
      token0Address: `0x${log.topics[1].substr(-40)}`,
      token1Address: `0x${log.topics[2].substr(-40)}`,
    };
  }

  return vaults;
}

function protocolTvl(chain) {
  return async (timestamp, block, chainBlocks, { api }) => {
    const balances = {};
    let vaults = {};
    const activeVaultLogs = await getVaultLogs(chain, chainBlocks[chain], "activeFactory", api);
    const passiveVaultLogs = await getVaultLogs(chain, chainBlocks[chain], "passiveFactory", api);
    vaults = { ...activeVaultLogs, ...passiveVaultLogs };
    const ownerTokens = Object.entries(vaults).map(([v, i]) => [[i.token0Address, i.token1Address], v])
    const vaultKeys = Object.keys(vaults)

    //get vault reserves(amount, fees) from contract
    const vaultReserves = await api.multiCall({
      abi: getPositionDetails,
      calls: vaultKeys,
    })


    vaultKeys.forEach((v, i) => {
      i = vaultReserves[i]
      sdk.util.sumSingleBalance(balances,vaults[v].token0Address,i.amount0, api.chain)
      sdk.util.sumSingleBalance(balances,vaults[v].token1Address,i.amount1, api.chain)
    })
    return sumTokens2({ balances, api, ownerTokens})
  };
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: protocolTvl("ethereum"),
    staking: staking(PILOT_STAKING_CONTRACT, PILOT, "ethereum"),
  },
  polygon: {
    tvl: protocolTvl("polygon"),
  },
  arbitrum: {
    tvl: protocolTvl("arbitrum"),
  },
};
