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
const current_moonriver_vaults_url =
  'https://raw.githubusercontent.com/kogecoin/vault-contracts/main/movr_vault_addresses.json'

const beethovenX = '0x20dd72Ed959b6147912C2e529F0a0C651c33c9ce'

const ftm_CrvVaultAddr = [
  '0x0a5E266afB071CB0F69310706154F2893a208D1c',
  '0x4Ef103DF324b20604e13170377233DDecD15074B',
]
const movr_CrvVaultAddr = []
const ftm_BalancerForks = [
  {
    name: 'beethoven',
    vault: beethovenX,
  },
]
const movr_BalancerForks = []

const polygonMasterChef = (masterChef, pid) => async (
  timestamp,
  block,
  chainBlocks,
) => {
  const balances = {}

  const lp_addresses = (
    await sdk.api.abi.multiCall({
      chain: 'polygon',
      block: chainBlocks['polygon'],
      calls: [
        {
          target: masterChef,
          params: [pid],
        },
      ],
      abi: abi.poolInfo,
    })
  ).output.map((val) => val.output.lpToken)

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
      calls: lp_addresses.map((lp) => ({
        target: lp,
        params: masterChef,
      })),
      abi: 'erc20:balanceOf',
    })
  ).output.map((val) => val.output)

  const lpPositions = []
  const singlePositions = []

  lp_addresses.forEach((v, idx) => {
    if (lp_symbols[idx] === 'UNI-V2') {
      lpPositions.push({
        vaultAddr: lp_addresses[idx],
        balance: vault_balances[idx],
        token: lp_addresses[idx],
      })
    } else if (lp_addresses[idx] !== '') {
      singlePositions.push({
        vaultAddr: lp_addresses[idx],
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

const polygonTvl = ({ include, exclude }) => async (
  timestamp,
  block,
  chainBlocks,
) => {
  const balances = {}

  let vaults = (await utils.fetchURL(current_polygon_vaults_url)).data

  if (!!include) {
    vaults = include
  }
  if (!!exclude) {
    vaults = vaults.filter(
      (v) => !exclude.find((e) => e.toLowerCase() === v.toLowerCase()),
    )
  }

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

const moonriverTvl = async (timestamp, block, chainBlocks) => {
  const balances = {}

  let vaults = (await utils.fetchURL(current_moonriver_vaults_url)).data

  const lp_addresses = (
    await sdk.api.abi.multiCall({
      chain: 'moonriver',
      block: chainBlocks['moonriver'],
      calls: vaults.map((vault) => ({
        target: vault.vault,
      })),
      abi: abi.token,
    })
  ).output.map((val) => val.output)

  vaults = vaults.map((e, idx) => ({ ...e, lp_address: lp_addresses[idx] }))

  const vault_balances = (
    await sdk.api.abi.multiCall({
      chain: 'moonriver',
      block: chainBlocks['moonriver'],
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
      movr_BalancerForks.length &&
      movr_BalancerForks
        .map((e) => String(vault.__comment).toLowerCase().includes(e.name))
        .reduce((p, c) => p && c, true)
    ) {
      pushElem(balancerPositions)
    }
    // CRV
    else if (movr_CrvVaultAddr.includes(vault.vault)) {
      pushElem(crvPositions)
    }
    // Uni-V2
    else {
      pushElem(uniV2Positions)
    }
  })

  const transformAddress = transformAddressKF('moonriver')

  await unwrapUniswapLPs(
    balances,
    uniV2Positions,
    chainBlocks['moonriver'],
    'moonriver',
    transformAddress,
  )

  await unwrapCrvLPs(
    balances,
    crvPositions.map((e) => e.token),
    chainBlocks['moonriver'],
    'moonriver',
    transformAddress,
  )

  await unwrapBalancerLPs(
    beethovenX,
    balances,
    balancerPositions,
    chainBlocks['moonriver'],
    'moonriver',
    transformAddress,
  )

  return balances
}

const kogeMasterChefAddr = '0x6275518a63e891b1bC54FEEBBb5333776E32fAbD'

// vKogeKoge
const _polygonStaking = polygonMasterChef(kogeMasterChefAddr, 1)

// Pool2
const kogecoinVaultAddr = '0x992Ae1912CE6b608E0c0d2BF66259ab1aE62A657'
const kogecoinMaticVaultAddr = '0xb7D3e1C5cb26D088d619525c6fD5D8DDC1B543d1'
const kogecoinSageVaultAddr = '0x4792b5943a05fc6AF3B20B5F1D1d7dDe33C42980'

const _kogePool2 = [
  kogecoinVaultAddr,
  kogecoinMaticVaultAddr,
  kogecoinSageVaultAddr,
]
const _polygonPool2 = async (timestamp, block, chainBlocks) => {
  return {
    ...(await polygonTvl({
      include: _kogePool2.filter((p) => p !== kogecoinVaultAddr),
    })(timestamp, block, chainBlocks)),
    ...(await polygonMasterChef(kogeMasterChefAddr, 0)(
      timestamp,
      block,
      chainBlocks,
    )),
  }
}
const _polygonTvl = polygonTvl({
  exclude: _kogePool2,
})

module.exports = {
  methodology: `The vaults are obtained through the following links: polygon:"${current_polygon_vaults_url}", fantom:"${current_fantom_vaults_url}, moonriver:"${current_moonriver_vaults_url}". By getting the vaults, we can then pull LP token deposit amounts. We then take the LP token deposits and unwrap them to count each token individually.`,
  polygon: {
    tvl: _polygonTvl,
    staking: _polygonStaking,
    pool2: _polygonPool2,
  },
  fantom: {
    tvl: fantomTvl,
  },
  moonriver: {
    tvl: moonriverTvl,
  },
  tvl: sdk.util.sumChainTvls([
    moonriverTvl,
    fantomTvl,
    _polygonTvl,
    _polygonStaking,
    _polygonPool2,
  ]),
}
