const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const utils = require('../helper/utils')
const { unwrapUniswapLPs, } = require('../helper/unwrapLPs')
const { getFixBalances } = require('../helper/portedTokens')
const { getConfig } = require('../helper/cache')

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
const current_kava_vaults_url =
  'https://raw.githubusercontent.com/kogecoin/vault-contracts/main/kava_vault_addresses.json'

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
const kava_BalancerForks = []
const kava_CrvVaultAddr = []

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

/*  const vaults_full = (await utils.fetchURL(current_polygon_vaults_url)).data
  let vaults = vaults_full.map( v => v['vault']) */
  let vaults = (await getConfig('kogefarm/polygon',current_polygon_vaults_url))

  if (include) {
    vaults = include
  }
  if (exclude) {
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
  const crvPositions = []

  vaults.forEach((v, idx) => {
    if (
      lp_symbols[idx] === 'UNI-V2' ||
      (lp_symbols[idx] === 'DFYNLP') |
        (lp_symbols[idx] === 'SLP') |
        (lp_symbols[idx] === 'WLP') |
        (lp_symbols[idx] === 'ELP') |
        (lp_symbols[idx] === 'FLP') |
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
    } else if ((lp_symbols[idx] === 'crvUSDBTCETH') | (lp_symbols[idx] === 'am3CRV') | (lp_symbols[idx] === 'btcCRV')) {
      crvPositions.push({
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

  await unwrapCrvLPs(
    balances,
    crvPositions,
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
  let balances = {}

  let vaults = (await getConfig('kogefarm/fantom', current_fantom_vaults_url))

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
    else if ((ftm_CrvVaultAddr.includes(vault.vault)) | (String(vault.__comment).toLowerCase().includes('curve '))) {
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
    crvPositions,
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

  // Convert wMEMO into Time by dividing by 10 ** 9 and multiplying by the wMemo to Memo ratio
  const TIME = 'avax:0xb54f16fb19478766a268f172c9480f8da1a7c9c3';
  if (TIME in balances){
    // First, find the wMemo to Memo ratio by looking at the total supply of wMemo divided by the Memo locked
    const wMemoSupply = (
      await sdk.api.abi.call({
        chain: 'avax',
        block: chainBlocks['avax'],
        target: "0x0da67235dD5787D67955420C84ca1cEcd4E5Bb3b",
        abi: abi.totalSupply,
      })
    ).output
    const memoLocked = (
      await sdk.api.abi.call({
        chain: 'avax',
        block: chainBlocks['avax'],
        target: "0x136Acd46C134E8269052c62A67042D6bDeDde3C9",
        params: ["0x0da67235dD5787D67955420C84ca1cEcd4E5Bb3b"],
        abi: abi.balanceOf,
      })
    ).output
    const memoPerWMemo = memoLocked / wMemoSupply * 10 ** 9

    // Then, multiply the wMEMO balance by memo per wMemo ratio, use price of Time as price of Memo since they are 1:1
    balances[TIME] = Math.floor(balances[TIME] * memoPerWMemo / 10 ** 9);
  }

  // Convert sSpell into Spell by multiplying by the appropriate ratio
  const sSpell = 'fantom:0xbb29d2a58d880af8aa5859e30470134deaf84f2b';
  if (sSpell in balances){
    // First, find the spell to staked spell ratio by looking at the total supply of staked spell divided by the spell locked
    const sSpellSupply = (
      await sdk.api.abi.call({
        chain: 'ethereum',
        block: chainBlocks['ethereum'],
        target: "0x26FA3fFFB6EfE8c1E69103aCb4044C26B9A106a9",
        abi: abi.totalSupply,
      })
    ).output
    const spellLocked = (
      await sdk.api.abi.call({
        chain: 'ethereum',
        block: chainBlocks['ethereum'],
        target: "0x090185f2135308BaD17527004364eBcC2D37e5F6",
        params: ["0x26FA3fFFB6EfE8c1E69103aCb4044C26B9A106a9"],
        abi: abi.balanceOf,
      })
    ).output
    const spellPersSpell = spellLocked / sSpellSupply

    // Then, multiply the staked spell balance by spell to staked spell ratio
    balances[sSpell] = Math.floor(balances[sSpell] * spellPersSpell);
  }

  // Convert sUSDT into USDT by multiplying by the appropriate ratio
  const sUSDT = 'polygon:0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c';
  if (sUSDT in balances){
    // First, find the USDT to staked USDT ratio by looking at the total supply of staked usdt divided by the s*usdt issued
    const sUSDTSupply = (
      await sdk.api.abi.call({
        chain: 'polygon',
        block: chainBlocks['polygon'],
        target: "0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c",
        abi: abi.totalSupply,
      })
    ).output
    const sUSDTLiquidity = (
      await sdk.api.abi.call({
        chain: 'polygon',
        block: chainBlocks['polygon'],
        target: "0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c",
        abi: abi.totalLiquidity,
      })
    ).output
    const usdtPersUSDT = sUSDTLiquidity / sUSDTSupply
    // Then, multiply the staked spell balance by spell to staked spell ratio
    balances[sUSDT] = Math.floor(balances[sUSDT] * usdtPersUSDT);
  }

  // Convert sUSDC into USDC by multiplying by the appropriate ratio
  const sUSDC = 'polygon:0x1205f31718499dBf1fCa446663B532Ef87481fe1';
  if (sUSDC in balances){
    // First, find the USDC to staked USDC ratio by looking at the total supply of staked usdc divided by the s*usdc issued
    const sUSDCSupply = (
      await sdk.api.abi.call({
        chain: 'polygon',
        block: chainBlocks['polygon'],
        target: "0x1205f31718499dBf1fCa446663B532Ef87481fe1",
        abi: abi.totalSupply,
      })
    ).output
    const sUSDCLiquidity = (
      await sdk.api.abi.call({
        chain: 'polygon',
        block: chainBlocks['polygon'],
        target: "0x1205f31718499dBf1fCa446663B532Ef87481fe1",
        abi: abi.totalLiquidity,
      })
    ).output
    const usdcPersUSDC = sUSDCLiquidity / sUSDCSupply

    // Then, multiply the staked spell balance by spell to staked spell ratio
    balances[sUSDC] = Math.floor(balances[sUSDC] * usdcPersUSDC);
  }

  return balances
}

const moonriverTvl = async (timestamp, block, chainBlocks) => {
  const balances = {}

  let vaults = (await getConfig('kogefarm/moonriver', current_moonriver_vaults_url))

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
    crvPositions,
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

const kavaTvl = async (timestamp, block, chainBlocks) => {

  let balances = {};

  let vaults = (await getConfig('kogefarm/kava', current_kava_vaults_url))
  if (typeof vaults === 'string') vaults = JSON.parse(vaults.replace(/,(\s*[}\]])/g, '$1'))

  const lp_addresses = (
    await sdk.api.abi.multiCall({
      chain: 'kava',
      block: chainBlocks['kava'],
      calls: vaults.map((vault) => ({
        target: vault.vault,
      })),
      abi: abi.token,
    })
  ).output.map((val) => val.output)

  vaults = vaults.map((e, idx) => ({ ...e, lp_address: lp_addresses[idx] }))

  const vault_balances = (
    await sdk.api.abi.multiCall({
      chain: 'kava',
      block: chainBlocks['kava'],
      calls: vaults.map((vault) => ({
        target: vault.vault,
      })),
      abi: abi.balance,
    })
  ).output.map((val) => val.output)

  vaults = vaults.map((e, idx) => ({ ...e, balance: vault_balances[idx] }))

  const lp_symbols = (
    await sdk.api.abi.multiCall({
      chain: 'kava',
      block: chainBlocks['kava'],
      calls: vaults.map((vault) => ({
        target: vault.lp_address,
      })),
      abi: abi.symbol,
    })
  ).output.map((val) => val.output)

  vaults = vaults.map((e, idx) => ({ ...e, symbol: lp_symbols[idx] }))

  const singlePositions = []
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
        symbol: vault.symbol,
        name: vault.__comment,
      })
    // Balancer
    if (
      kava_BalancerForks.length &&
      kava_BalancerForks
        .map((e) => String(vault.__comment).toLowerCase().includes(e.name))
        .reduce((p, c) => p && c, true)
    ) {
      pushElem(balancerPositions)
    }
    // CRV
    else if (kava_CrvVaultAddr.includes(vault.vault)) {
      pushElem(crvPositions)
    }
    // Uni-V2
    else if (vault.symbol==="Uni-V2" || vault.symbol==="SLP" || vault.symbol==="JUPITER-LP"){
      pushElem(uniV2Positions)
    }
    else{
      pushElem(singlePositions)
    }
  })

  const transformAddress = transformAddressKF('kava')

  await unwrapUniswapLPs(
    balances,
    uniV2Positions,
    chainBlocks['kava'],
    'kava',
    transformAddress,
  )

  await getSinglePositions(
    balances,
    singlePositions,
    chainBlocks['kava'],
    'kava',
    transformAddress,
  )

  const fixBalances = await getFixBalances('kava')
  fixBalances(balances)

  await unwrapCrvLPs(
    balances,
    crvPositions,
    chainBlocks['kava'],
    'kava',
    transformAddress,
  )

  await unwrapBalancerLPs(
    beethovenX,
    balances,
    balancerPositions,
    chainBlocks['kava'],
    'kava',
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
const kogecoinIrisVaultAddr = '0x55A2FedB176C09488102596Db21937A753025466'
const kogecoinCollarVaultAddr = '0x64c20BB3D9aCD870f748fe73B6541D500643e490'
const kogecoinShieldVaultAddr = '0x7a9be7CdF26C8311625ed97c174869fcA9b791eC'
const kogecoinBetaVaultAddr = '0xEab5DAC8E6E3da7679b2a01FCD17DBE1Ed519904'
const kogecoinAlphaVaultAddr = '0xD02064bEd4126ACCCe79431A52F206C558479648'
const kogecoinTamagoVaultAddr = '0xA838F1e986b27d7AC5a977c7d0eCbADFFCDC7Bb5'

const _kogePool2 = [
  kogecoinVaultAddr,
  kogecoinMaticVaultAddr,
  kogecoinSageVaultAddr,
  kogecoinIrisVaultAddr,
  kogecoinCollarVaultAddr,
  kogecoinShieldVaultAddr,
  kogecoinBetaVaultAddr,
  kogecoinAlphaVaultAddr,
  kogecoinTamagoVaultAddr
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
  kava: {
    tvl: kavaTvl,
  },
}
