const { sumTokens2 } = require('../helper/unwrapLPs');
const { getConfig } = require('../helper/cache');
const { staking } = require('../helper/staking')
const { pool2 } = require('../helper/pool2')

const SGREEN_CONTRACT = '0xaa0f13488ce069a7b5a099457c753a7cfbe04d36'
const GREEN_CONTRACT = '0xd1Eac76497D06Cf15475A5e3984D5bC03de7C707'
const GREEN_LP_CONTRACT = '0xd6c283655b42fa0eb2685f7ab819784f071459dc'
const RIPE_CONTRACT = '0x2A0a59d6B975828e781EcaC125dBA40d7ee5dDC0'
const RIPE_GREEN_LP_CONTRACT = '0x2aEf3eE3Eb64B7EC0B4ef57BB7E004747FE87eFc'
const RIPE_WETH_LP_CONTRACT = '0x765824aD2eD0ECB70ECc25B0Cf285832b335d6A9'
const ENDAOMENT_CONTRACT = '0x14F4f1CD5F4197DB7cB536B282fe6c59eACfE40d'
const RIPE_GOV_CONTRACT = '0xe42b3dC546527EB70D741B185Dc57226cA01839D'

const ROBINHOOD_RIPE_GOV = '0xFa767a19c0C2B80D5A8d5b88be67de153Df1b2f2'
const ROBINHOOD_STABILITY_POOL = '0xe238b50d79D566aa59A2deF4362a698eDC3dC395'
const ROBINHOOD_COLLATERAL_VAULT = '0x4F89C94636995eF20d40d5592bA2585348bE6D53'

async function getPairs() {
  const response = await getConfig('ripe', 'https://api.ripe.finance/api/ripe/assets');
  const stabilityPoolAddress = response.result.find(a => a.vaultId === 1).vaultAddress
  const nonSpAssets = response.result.filter(a => a.vaultId > 2)

  // Build token-owner pairs for sumTokens2
  const tokensAndOwners = [];

  for (const { tokenAddress, vaultAddress } of nonSpAssets) {
    tokensAndOwners.push([tokenAddress, vaultAddress]);
    tokensAndOwners.push([tokenAddress, stabilityPoolAddress]);
  }

  return tokensAndOwners;
}

async function getVaultAssets(api, vault) {
  const [assetCount] = await api.multiCall({
    target: vault,
    abi: 'uint256:getNumVaultAssets',
    calls: [{}],
  })
  const count = Number(assetCount)
  return api.multiCall({
    target: vault,
    abi: 'function vaultAssets(uint256) view returns (address)',
    calls: Array.from({ length: count }, (_, i) => ({ params: [i + 1] })),
  })
}

async function tvl(api) {
  const tokensAndOwners = await getPairs();

  return sumTokens2({
    api,
    tokensAndOwners,
    blackListedTokens: [SGREEN_CONTRACT, GREEN_CONTRACT, GREEN_LP_CONTRACT],
  });
}

async function robinhoodTvl(api) {
  const [govAssets, stabilityAssets, collateralAssets] = await Promise.all([
    getVaultAssets(api, ROBINHOOD_RIPE_GOV),
    getVaultAssets(api, ROBINHOOD_STABILITY_POOL),
    getVaultAssets(api, ROBINHOOD_COLLATERAL_VAULT),
  ])

  await sumTokens2({
    api,
    tokensAndOwners: govAssets.map((token) => [token, ROBINHOOD_RIPE_GOV]),
    resolveLP: true,
  })

  const stabilityTotals = await api.multiCall({
    target: ROBINHOOD_STABILITY_POOL,
    abi: 'function getTotalAmountForVault(address) view returns (uint256)',
    calls: stabilityAssets,
  })
  stabilityAssets.forEach((token, i) => api.add(token, stabilityTotals[i]))

  await sumTokens2({
    api,
    tokensAndOwners: collateralAssets.map((token) => [token, ROBINHOOD_COLLATERAL_VAULT]),
    resolveLP: true,
  })
}

module.exports = {
  methodology: 'Counts underlying collateral in Ripe vaults, unwrapping yield-bearing tokens to avoid double counting',
  start: 1754006400,
  base: {
    tvl,
    pool2: pool2([RIPE_GOV_CONTRACT, ENDAOMENT_CONTRACT], [RIPE_WETH_LP_CONTRACT, RIPE_GREEN_LP_CONTRACT]),
    staking: staking(RIPE_GOV_CONTRACT, RIPE_CONTRACT),
  },
  robinhood: {
    methodology: 'TVL is the value of assets deposited in Ripe Protocol\'s Robinhood deployment: RIPE and RIPE LP deposits in RipeGov, StabilityPool deposits valued through the vault\'s getTotalAmountForVault accounting view (including claimable liquidation collateral), and core collateral held in the SimpleErc20 vault. Vault assets are enumerated on-chain; community farm vaults are excluded as a separate ecosystem category.',
    tvl: robinhoodTvl,
    start: 1787807949,
  },
};
