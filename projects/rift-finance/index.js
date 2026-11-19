const { cachedGraphQuery } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require("@defillama/sdk");

const NETWORKS = {
  aurora: {
    coreAddress: "0x40A01A4064b690cA33FA52d315ec02015eF5287E",
    startBlock: 58983267,
    graphUrl:
      sdk.graph.modifyEndpoint('GkqMC7XyPQFceCjT7rdqc62nzfF5WsVCn6HA9q17VBW'),
  },
  ethereum: {
    coreAddress: "0x5D7e616B2c0bf268494A482e315a60814F97dBC8",
    startBlock: 14845882,
    graphUrl:
      sdk.graph.modifyEndpoint('44q7UpeVu33BTDwHd1iHJnEYXwcF9NM6HRd5oSVdLFDQ'),
  },
};

const riftVaultAbi = {
  rewarder: "address:rewarder",
  pid: "uint256:pid",
};
const masterChefAbi = {
  userInfo: "function userInfo(uint256 pid, address user) view returns (tuple(uint256 amount, uint256 rewardDebt))",
}

async function tvl(api) {
  const chain = api.chain

  const { graphUrl } = NETWORKS[chain];

  const query = `
    query get_vaults{
      cores{
        vaults {
          id
          type
          token0 { id }
          token1 { id }
          pair { id }
        }
      }
    }
  `;

  const { cores } = await cachedGraphQuery('rift-fi/' + chain, graphUrl, query);
  const toa = []

  await Promise.all(cores[0].vaults.map(async vault => {
    toa.push([vault.token0.id, vault.id])
    toa.push([vault.token1.id, vault.id])
    toa.push([vault.pair.id, vault.id])

    // Look for MasterChef balance.
    if (vault.type === "SUSHI_SWAP") {
      const rewarder = await api.call({ target: vault.id, abi: riftVaultAbi.rewarder, })

      const pid = await api.call({ target: vault.id, abi: riftVaultAbi.pid, })

      const { amount: masterChefBal } = await api.call({ target: rewarder, abi: masterChefAbi.userInfo, params: [pid, vault.id], })
      api.add(vault.pair.id, masterChefBal)
    }
  }))

  return sumTokens2({ api, tokensAndOwners: toa, resolveLP: true });
}


module.exports = {
  aurora: {
    tvl,
  },
  ethereum: {
    tvl,
  },
};
