const FACTORY_CONTRACT = "0x8796747946871B6b8ea495CCE8d7814b17959296";
const vaultAbi = require('../charmfinance/vaultAbi.json')
const { getLogs } = require('../helper/cache/getLogs');
const { getUniqueAddresses } = require("@defillama/sdk/build/generalUtil");
const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(timestamp, block, _, { api }) {
  let fromBlock = 0;
  switch (api.chain) {
    case 'polygon': fromBlock = 49831226; break
    case 'arbitrum': fromBlock = 150521724; break;
  }

  const logs = await getLogs({
    api,
    target: FACTORY_CONTRACT,
    eventAbi: 'event NewShuttle (address indexed lpTokenPair, uint256 indexed shuttleId, uint256 orbiterId, address borrowable, address collateral)',
    onlyArgs: true,
    fromBlock,
  })
  const pools = getUniqueAddresses(logs.map(i => [i.collateral, i.borrowable]).flat())
  const tokens = await api.multiCall({ abi: 'address:underlying', calls: pools })
  const bals = await api.multiCall({ abi: 'address:totalBalance', calls: pools })
  const isHypervisor = await api.multiCall({ abi: 'address:pool', calls: tokens, permitFailure: true })
  const hypervisorPools = { pools: [], bals: [] }
  isHypervisor.forEach((i, idx) => {
    if (i) {
      hypervisorPools.pools.push(tokens[idx])
      hypervisorPools.bals.push(bals[idx])
    } else {
      api.add(tokens[idx], bals[idx])
    }
  })
  const hypervisorBals = await api.multiCall({ abi: vaultAbi.getTotalAmounts, calls: hypervisorPools.pools })
  const tokens0s = await api.multiCall({ abi: vaultAbi.token0, calls: hypervisorPools.pools })
  const tokens1s = await api.multiCall({ abi: vaultAbi.token1, calls: hypervisorPools.pools })
  const totalSupplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: hypervisorPools.pools })
  hypervisorPools.pools.forEach((pool, idx) => {
    const ratio = hypervisorPools.bals[idx] / totalSupplies[idx]
    api.add(tokens0s[idx], hypervisorBals[idx][0] * ratio)
    api.add(tokens1s[idx], hypervisorBals[idx][1] * ratio)
  })
  // const tvls= await api.fetchList({  lengthAbi: abi.shuttlesDeployed, itemAbi: abi.shuttleTvlUsd, target: FACTORY_CONTRACT, startFrom: 2, })
  // tvls.forEach(i => api.add(ADDRESSES.polygon.USDC, i))
}

async function borrowed(_, _b, _cb, { api, }) {
  api.add(ADDRESSES.polygon.USDC, await api.call({ abi: 'uint256:cygnusTotalBorrows', target: FACTORY_CONTRACT }))
  api.add(ADDRESSES.arbitrum.USDC, await api.call({ abi: 'uint256:cygnusTotalBorrows', target: FACTORY_CONTRACT }))
  return api.getBalances()
}

module.exports = {
  doublecounted: true,
  methodology: "TVL of all shuttles (borrowable + collateral).",
  arbitrum: {
    tvl, borrowed,
  },
  polygon: {
    tvl, borrowed,
  },
};

