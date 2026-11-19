const sdk = require('@defillama/sdk')
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { sumTokens } = require('../helper/sumTokens')

const { xrpl } = sdk.chains

const abi = {
  assetManager: 'address:assetManager',
  getAllAgents: 'function getAllAgents(uint256 _start, uint256 _end) view returns (address[] _agents, uint256 _totalLength)',
  getAgentInfo: 'function getAgentInfo(address _agentVault) view returns (tuple(uint8 status, address ownerManagementAddress, address ownerWorkAddress, address collateralPool, address collateralPoolToken, string underlyingAddressString, bool publiclyAvailable, uint256 feeBIPS, uint256 poolFeeShareBIPS, address vaultCollateralToken, uint256 mintingVaultCollateralRatioBIPS, uint256 mintingPoolCollateralRatioBIPS, uint256 freeCollateralLots, uint256 totalVaultCollateralWei, uint256 freeVaultCollateralWei, uint256 vaultCollateralRatioBIPS, address poolWNatToken, uint256 totalPoolCollateralNATWei, uint256 freePoolCollateralNATWei, uint256 poolCollateralRatioBIPS, uint256 totalAgentPoolTokensWei, uint256 announcedVaultCollateralWithdrawalWei, uint256 announcedPoolTokensWithdrawalWei, uint256 freeAgentPoolTokensWei, uint256 mintedUBA, uint256 reservedUBA, uint256 redeemingUBA, uint256 poolRedeemingUBA, uint256 dustUBA, uint256 liquidationStartTimestamp, uint256 maxLiquidationAmountUBA, uint256 liquidationPaymentFactorVaultBIPS, uint256 liquidationPaymentFactorPoolBIPS, int256 underlyingBalanceUBA, uint256 requiredUnderlyingBalanceUBA, int256 freeUnderlyingBalanceUBA, uint256 announcedUnderlyingWithdrawalId, uint256 buyFAssetByAgentFactorBIPS, uint256 poolExitCollateralRatioBIPS, uint256 redemptionPoolFeeShareBIPS))',
  getCoreVaultManager: 'address:getCoreVaultManager',
  coreVaultAddress: 'string:coreVaultAddress',
}

// every FXRP agent, read from the AssetManager that the FXRP token points to
async function getAgents(api) {
  const assetManager = await api.call({ target: ADDRESSES.flare.FXRP, abi: abi.assetManager })
  const vaults = []
  let total = 1
  for (let start = 0; start < total; start += 100) {
    const { _agents, _totalLength } = await api.call({ target: assetManager, abi: abi.getAllAgents, params: [start, start + 100] })
    vaults.push(..._agents)
    total = Number(_totalLength)
  }
  const infos = await api.multiCall({ target: assetManager, abi: abi.getAgentInfo, calls: vaults })
  const agents = infos.map((info, i) => ({
    vault: vaults[i],
    vaultCollateralToken: info.vaultCollateralToken,
    pool: info.collateralPool,
    poolCollateralToken: info.poolWNatToken,
    underlyingAddress: info.underlyingAddressString,
  }))
  return { assetManager, agents }
}

// vault collateral in each agent vault and WFLR in each collateral pool; FXRP fees and pool tokens held there are
// skipped, as they are claims on the XRP and WFLR already counted
async function flareTvl(api) {
  const { agents } = await getAgents(api)
  return sumTokens2({
    api,
    tokensAndOwners: agents.flatMap(a => [
      [a.vaultCollateralToken, a.vault],
      [a.poolCollateralToken, a.pool],
    ]),
  })
}

// XRP backing FXRP: agents' underlying addresses, the core vault and the escrows it created
async function xrplTvl(api) {
  const flareApi = new sdk.ChainApi({ chain: 'flare', timestamp: api.timestamp })
  const { assetManager, agents } = await getAgents(flareApi)
  const owners = agents.map(a => a.underlyingAddress)

  const coreVaultManager = await flareApi.call({ target: assetManager, abi: abi.getCoreVaultManager })
  const coreVault = coreVaultManager === ADDRESSES.null ? undefined : await flareApi.call({ target: coreVaultManager, abi: abi.coreVaultAddress })
  if (coreVault) owners.push(coreVault)

  await sumTokens({ api, chain: 'ripple', owners })
  if (!coreVault) return

  // core vault escrows return to the core vault at expiry; escrows other accounts made towards it are skipped
  const escrows = await xrpl.getAccountObjects({ account: coreVault, type: 'escrow' })
  const escrowedDrops = escrows
    .filter(e => e.Account === coreVault && typeof e.Amount === 'string')
    .reduce((sum, e) => sum + Number(e.Amount), 0)
  api.addCGToken('ripple', escrowedDrops / 1e6)
}

module.exports = {
  methodology: 'XRPL: XRP held in the underlying XRPL address of every FXRP agent and in the FAssets core vault, plus the XRP in escrows created by the core vault. Agents and the core vault address are read from the FXRP AssetManager and CoreVaultManager contracts on Flare. Flare: vault collateral (currently USDT0) in each agent vault and WFLR in each agent collateral pool.',
  timetravel: false,
  flare: { tvl: flareTvl },
  ripple: { tvl: xrplTvl },
}
