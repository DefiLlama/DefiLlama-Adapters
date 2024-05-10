const { unwrapBalancerToken } = require("../helper/unwrapLPs")

const admins = {
  v1: '0xd584a5e956106db2fe74d56a0b14a9d64be8dc93',
  v2: '0x06cbD15D58069193717486CFDe37Ebf5Ec72a8A6',
  v2_1: '0x75C72F459f2054B46ceFD6D10eC99d0fbd777F05',
}

const strategiesVersioned = {
  v1: {
    wETH: "0x1225c53F510877074d0D1Bace26C4f0581c24cF7",
    wBTC: "0xef82200DC96a14af76f5fB7f27DbaDB5228f6A0C",
    OP: "0x6938b5b43b281bF24202437b86bbd2866a79cF6C",
  },
  v2: {
    wETH: "0x01Cd26dD056671DED555314d43841d8AaaBC72e3",
    wBTC: "0x8669CC362aa0AcB2b15423090B28acdc89163e84",
  },
  'v2.1': {
    wETH: "0x7c09733834873b1FDB8A70c19eE1A514023f74f9",
    wBTC: "0xbb341D8249c1C747708D4e6F7Cd967A2479CAD75",
    wstETH: "0xA70266C8F8Cf33647dcFEE763961aFf418D9E1E4",
  },
}

const strategies = Object.values(strategiesVersioned).map(i => Object.values(i)).flat()

async function tvl(api) {
  const vaults = Object.values(admins)
  const configs = await api.multiCall({ abi: 'address:collateralConfig', calls: vaults })
  const collaterals = await api.multiCall({ abi: 'address[]:getAllowedCollaterals', calls: configs })
  const pools = await api.multiCall({ abi: 'address:activePool', calls: vaults })

  const tokens = await api.multiCall({ abi: 'address:token', calls: strategies })
  const bals = await api.multiCall({ abi: 'uint256:totalSupply', calls: strategies })
  api.addTokens(tokens, bals)
  
  return api.sumTokens({ ownerTokens: pools.map((p, i) => [collaterals[i], p]) })
  // const calls = vaults.map((target, i) => collaterals[i].map(params => ({ params, target }))).flat()
  // const bals = await api.multiCall({ abi: 'function getEntireSystemColl(address) view returns (uint256)', calls })
  // const tokens = calls.map(i => i.params)
  // api.addTokens(tokens, bals)
}

async function pool2(api) {
  const toa = [
    ['0xd20f6F1D8a675cDCa155Cb07b5dC9042c467153f', '0x9425b96462b1940e7563cd765464300f6a774805'],
    ['0xD13D81aF624956327A24d0275CBe54b0eE0E9070', '0x6c56A0Ca937A3C9f29bCF386D3cD0667Ef9d7e88'],
    ['0xD13D81aF624956327A24d0275CBe54b0eE0E9070', '0x7D6a62d496D42d5E978C4eDa0d367Ac1Ba70A200'],
  ]
  return api.sumTokens({ tokensAndOwners: toa })
  // await Promise.all(toa.map(async ([balancerToken, owner]) => unwrapBalancerToken({ api, balancerToken, owner })))
}
module.exports = {
  doublecounted: true,
  methodology: `TVL is fetched from the Ethos Reserve subgraph and the Byte Masons token price api.`,
  optimism: {
    tvl,
    pool2,
  },
}
