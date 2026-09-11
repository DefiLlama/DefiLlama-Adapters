const BigNumber = require("bignumber.js");
const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')

// Pareto credit vaults are Idle CDOs whose strategy lends the whole deposit to a single
// borrower (Fasanara, Bastion, FalconX, ...). getContractValue() is the vault's accounting
// value: deposits plus accrued interest, wherever the money sits. pendingWithdraws is
// principal that redeeming lenders are owed and the borrower has not yet returned. The
// only part still held by the protocol is the underlying sitting in the CDO or its strategy
// between epochs, so that is tvl and the rest is borrowed.
const contracts = {
  ethereum: {
    usp: '0x97cCC1C046d067ab945d3CF3CC6920D3b1E54c88', // USP
    factory: {
      block: 22938055,
      address: '0x59aabdad8fdabd227cc71543b128765f93906626',
    },
    credits: [
      "0xf6223C567F21E33e859ED7A045773526E9E3c2D5", // Fasanara Yield vault,
      "0x4462eD748B8F7985A4aC6b538Dfc105Fce2dD165", // Bastion
      "0x14B8E918848349D1e71e806a52c13D4e0d3246E0", // Adaptive Frontier
      "0x433D5B175148dA32Ffe1e1A37a939E1b7e79be4d", // FalconX
    ],
  },
  polygon: {
    credits: [
      '0xF9E2AE779a7d25cDe46FccC41a27B8A4381d4e52' // Bastion CV
    ]
  },
  optimism: {
    credits: [
      "0xD2c0D848aA5AD1a4C12bE89e713E70B73211989B", // FalconX
    ],
    excludeVaultsAfterTimestamp: {
      '0xD2c0D848aA5AD1a4C12bE89e713E70B73211989B': 1756936799
    }
  },
  arbitrum: {
    credits: [
      "0x3919396Cd445b03E6Bb62995A7a4CB2AC544245D" // Bastion Credit Vault
    ]
  }
}

// USP is minted against USDC that the queue deploys into yield sources. The share deployed
// into Pareto's own credit vaults is already covered by the credit vault figures below, so
// only the remainder is counted here.
async function getUspResidual(api, usp, credits) {
  const [queueAddress, uspTotalSupply] = await Promise.all([
    'address:queue',
    'uint256:totalSupply',
  ].map(abi => api.call({ abi, target: usp })))

  const yieldSources = await api.call({
    abi: 'function getAllYieldSources() view returns (tuple(address token, address source, address vaultToken, uint256 maxCap, tuple(bytes4 method, uint8 methodType)[] allowedMethods, uint8 vaultType)[] yieldSources)',
    target: queueAddress,
  })

  const creditSet = new Set(credits.map(addr => addr.toLowerCase()))
  const creditSources = yieldSources.filter(s => creditSet.has(s.source.toLowerCase()))
  const creditAmounts = await api.multiCall({
    abi: 'function getCollateralsYieldSourceScaled(address) returns (uint256)',
    target: queueAddress,
    calls: creditSources.map(s => s.source),
  })
  const residual = creditAmounts.reduce((acc, amount) => acc.minus(amount), BigNumber(uspTotalSupply))
  if (residual.lte(0)) return '0'
  return residual.div(1e12).toFixed(0) // USP has 18 decimals, USDC has 6
}

async function getCreditVaults(api) {
  const { credits = [], excludeVaultsAfterTimestamp = {}, factory } = contracts[api.chain]
  const vaults = [...credits]

  if (factory) {
    const logs = await getLogs({
      api,
      target: factory.address,
      topics: ['0x22d236b886e994153ab139e04b213355a725846284c6018c26c6af0988bd58d7'],
      eventAbi: 'event CreditVaultDeployed(address proxy)',
      onlyArgs: true,
      fromBlock: factory.block,
    })
    const known = new Set(vaults.map(addr => addr.toLowerCase()))
    logs.forEach(l => {
      if (!known.has(l.proxy.toLowerCase())) vaults.push(l.proxy)
    })
  }

  return vaults.filter(addr => {
    const cutoff = excludeVaultsAfterTimestamp[addr]
    return !cutoff || !api.timestamp || Number(cutoff) > Number(api.timestamp)
  })
}

async function getCreditVaultData(api) {
  const vaults = await getCreditVaults(api)
  const [tokens, strategies, contractValue] = await Promise.all([
    'address:token',
    'address:strategy',
    'uint256:getContractValue',
  ].map(abi => api.multiCall({ abi, calls: vaults })))

  // A strategy without the pending-withdraw methods has nothing pending, so a failed call
  // counts as zero rather than taking down tvl, which only needs the held balances.
  const [pendingWithdraws, pendingInstantWithdraws, heldByVault, heldByStrategy] = await Promise.all([
    api.multiCall({ abi: 'uint256:pendingWithdraws', calls: strategies, permitFailure: true }),
    api.multiCall({ abi: 'uint256:pendingInstantWithdraws', calls: strategies, permitFailure: true }),
    api.multiCall({ abi: 'erc20:balanceOf', calls: vaults.map((vault, i) => ({ target: tokens[i], params: [vault] })) }),
    api.multiCall({ abi: 'erc20:balanceOf', calls: strategies.map((strategy, i) => ({ target: tokens[i], params: [strategy] })) }),
  ])

  return vaults.map((vault, i) => ({
    vault,
    token: tokens[i],
    held: BigInt(heldByVault[i]) + BigInt(heldByStrategy[i]),
    receivable: BigInt(contractValue[i]) + BigInt(pendingWithdraws[i] ?? 0) + BigInt(pendingInstantWithdraws[i] ?? 0),
  }))
}

async function tvl(api) {
  const { usp, credits = [] } = contracts[api.chain]

  if (usp) {
    const residual = await getUspResidual(api, usp, credits)
    api.add(ADDRESSES[api.chain].USDC, residual)
  }

  const vaultData = await getCreditVaultData(api)
  vaultData.forEach(({ token, held }) => api.add(token, held))
}

async function borrowed(api) {
  const vaultData = await getCreditVaultData(api)
  vaultData.forEach(({ token, held, receivable }) => {
    const lent = receivable - held
    if (lent > 0n) api.add(token, lent)
  })
}

module.exports = {
  hallmarks: [],
  methodology: 'TVL is the underlying held by Pareto credit vaults and their strategies between epochs, plus USP collateral not deployed into credit vaults. Capital lent to credit vault borrowers, including accrued interest and principal owed to redeeming lenders, is reported separately as borrowed.',
};

Object.keys(contracts).forEach(chain => {
  module.exports[chain] = { tvl, borrowed }
})
