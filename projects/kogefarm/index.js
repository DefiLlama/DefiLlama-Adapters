const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const utils = require('../helper/utils')
const { unwrapUniswapLPs, unwrapCrv } = require('../helper/unwrapLPs')
const { transformPolygonAddress } = require('../helper/portedTokens')
const {
  transformAddressKF,
  getSinglePositions,
  unwrapBalancerLPs,
  unwrapCrvLPs,
} = require('./helper.js')

const current_polygon_vaults_url =
  'https://raw.githubusercontent.com/kogecoin/vault-contracts/main/vaultaddresses'
const current_fantom_vaults_url =
  'https://raw.githubusercontent.com/kogecoin/vault-contracts/main/ftm_vault_addresses.json'

const beethovenX = '0x20dd72Ed959b6147912C2e529F0a0C651c33c9ce'

const ftm_CrvVaultAddr = ['0x0a5E266afB071CB0F69310706154F2893a208D1c']
const ftm_BalancerForks = [
  {
    name: 'beethoven',
    vault: beethovenX,
  },
]

const polygonTvl = async (timestamp, block, chainBlocks) => {
  const balances = {}

  let vaults = (await utils.fetchURL(current_polygon_vaults_url)).data

  const lp_addresses = (
    await sdk.api.abi.multiCall({
      chain: 'polygon',
      block: chainBlocks['polygon'],
      calls: vaults.map((vaultAddr) => ({
        target: vaultAddr,
      })),
      abi: abi.token,
    })
  ).output.map((val) => val.output)

  const lp_symbols = (
    await sdk.api.abi.multiCall({
      chain: 'polygon',
      block: chainBlocks['polygon'],
      calls: lp_addresses.map((address) => ({
        target: address,
      })),
      abi: abi.symbol,
    })
  ).output.map((val) => val.output)

  const vault_balances = (
    await sdk.api.abi.multiCall({
      chain: 'polygon',
      block: chainBlocks['polygon'],
      calls: vaults.map((vaultAddr) => ({
        target: vaultAddr,
      })),
      abi: abi.balance,
    })
  ).output.map((val) => val.output)

  const lpPositions = []
  const singlePositions = []

  vaults.forEach((v, idx) => {
    if (
      lp_symbols[idx] === 'UNI-V2' ||
      (lp_symbols[idx] === 'DFYNLP') |
        (lp_symbols[idx] === 'SLP') |
        (lp_symbols[idx] === 'WLP') |
        (lp_symbols[idx] === 'pWINGS-LP') |
        (lp_symbols[idx] === 'APE-LP') |
        (lp_symbols[idx] === 'GLP') |
        (lp_symbols[idx] === 'Cafe-LP')
    ) {
      lpPositions.push({
        vaultAddr: vaults[idx],
        balance: vault_balances[idx],
        token: lp_addresses[idx],
      })
    } else if (vaults[idx] !== '') {
      singlePositions.push({
        vaultAddr: vaults[idx],
        balance: vault_balances[idx],
        token: lp_addresses[idx],
      })
    }
  })

  const transformAddress = transformAddressKF()

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks['polygon'],
    'polygon',
    transformAddress,
  )

  await getSinglePositions(
    balances,
    singlePositions,
    chainBlocks['polygon'],
    'polygon',
    transformAddress,
  )

  return balances
}

const fantomTvl = async (timestamp, block, chainBlocks) => {
  const balances = {}

  let vaults = (await utils.fetchURL(current_fantom_vaults_url)).data

  const lp_addresses = (
    await sdk.api.abi.multiCall({
      chain: 'fantom',
      block: chainBlocks['fantom'],
      calls: vaults.map((vault) => ({
        target: vault.vault,
      })),
      abi: abi.token,
    })
  ).output.map((val) => val.output)

  vaults = vaults.map((e, idx) => ({ ...e, lp_address: lp_addresses[idx] }))

  const vault_balances = (
    await sdk.api.abi.multiCall({
      chain: 'fantom',
      block: chainBlocks['fantom'],
      calls: vaults.map((vault) => ({
        target: vault.vault,
      })),
      abi: abi.balance,
    })
  ).output.map((val) => val.output)

  vaults = vaults.map((e, idx) => ({ ...e, balance: vault_balances[idx] }))

  const uniV2Positions = []
  const balancerPositions = []
  const crvPositions = []

  // We populate the positions by protocol
  vaults.forEach((vault) => {
    const pushElem = (array) =>
      array.push({
        vaultAddr: vault.vault,
        balance: vault.balance,
        token: vault.lp_address,
        name: vault.__comment,
      })
    // Balancer
    if (
      ftm_BalancerForks
        .map((e) => String(vault.__comment).toLowerCase().includes(e.name))
        .reduce((p, c) => p && c, true)
    ) {
      pushElem(balancerPositions)
    }
    // CRV
    else if (ftm_CrvVaultAddr.includes(vault.vault)) {
      pushElem(crvPositions)
    }
    // Uni-V2
    else {
      pushElem(uniV2Positions)
    }
  })

  const transformAddress = transformAddressKF('fantom')

  await unwrapUniswapLPs(
    balances,
    uniV2Positions,
    chainBlocks['fantom'],
    'fantom',
    transformAddress,
  )

  await unwrapCrvLPs(
    balances,
    crvPositions.map((e) => e.token),
    chainBlocks['fantom'],
    'fantom',
    transformAddress,
  )

  await unwrapBalancerLPs(
    beethovenX,
    balances,
    balancerPositions,
    chainBlocks['fantom'],
    'fantom',
    transformAddress,
  )

  return balances
}

module.exports = {
  methodology:
    'The vaults are obtained through the following link: "https://raw.githubusercontent.com/kogecoin/vault-contracts/main/vaultaddresses". By getting the vaults, we can then pull LP token deposit amounts. We then take the LP token deposits and unwrap them to count each token individually.',
  polygon: {
    tvl: polygonTvl,
  },
  fantom: {
    tvl: fantomTvl,
  },
  tvl: sdk.util.sumChainTvls([fantomTvl, polygonTvl]),
}
