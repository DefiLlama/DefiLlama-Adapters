const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// === ITP Staking Vault (Optimism) ===
const ITP_VAULT_ADDRRESS= '0x23371aEEaF8718955C93aEC726b3CAFC772B9E37'
const ITP_ON_OPTIMISM = "0x0a7B751FcDBBAA8BB988B9217ad5Fb5cfe7bf7A0";
const VELO_PRICE_ORACLE = "0x395942C2049604a314d39F370Dfb8D87AAC89e16";
const WETH_TOKEN_ADDRESS = ADDRESSES.optimism.WETH_1;
const VELO_TOKEN_ADDRESS = ADDRESSES.optimism.VELO;
const OP_TOKEN_ADDRESS = ADDRESSES.optimism.OP;
const USDC_OP_TOKEN_ADDRESS = ADDRESSES.optimism.USDC_CIRCLE;
const ITP_STAKED_ABI = "function getVaultInfo() view returns (uint256, uint256, uint256, uint256, uint256, uint256[], uint256)";

// === stSATO (Ethereum) ===
const STSATO_ON_ETHEREUM = '0xdeE7f7A032326148E65EC3068F1c9b29E26B75b3'
const SATO_ON_ETHEREUM = '0x829f4B62EEBE12Af653b4dD4fFc480966F7d7f09'

// === Velodrome auto-compounder vaults (Optimism); each vault reports its LP via want() ===
const AUTO_COMPOUNDERS = [
  "0x569D92f0c94C04C74c2f3237983281875D9e2247", // ITP/VELO
  "0xFCEa66a3333a4A3d911ce86cEf8Bdbb8bC16aCA6", // ITP/DHT
  "0x2811a577cf57A2Aa34e94B0Eb56157066717563f", // ITP/wstETH
  "0x8A2e22BdA1fF16bdEf27b6072e087452fa874b69", // ITP/OP
  "0x3092F8dE262F363398F15DDE5E609a752938Cc11", // ITP/WBTC
  "0xC4628802a42F83E5bce3caB05A4ac2F6E485F276", // ITP/USDC
];

// === Aero auto-compounder factories (v2). Only vaults the DAO marks official are counted. ===
const AERO_FACTORIES = {
  optimism: "0x337Fe450bCD603B1c637AB0F4C073d926a1aE3Dc",
  base: "0xB60ce95161506EeC22A2D68A784DD21cf78adcA9",
}

// ITP per chain; Aero vault LP paired with it goes to pool2
const ITP = {
  optimism: ITP_ON_OPTIMISM,
  base: "0xBA8CD87120aCA631F59231f9fD6c5469BbEE3440",
}

// === Uniswap V3 auto-compounder vaults (Base); each holds one position NFT plus idle tokens ===
const UNIV3_VAULTS = [
  { vault: "0xf0e3305e81744e4dfa2d01c0a145814357a89018", pool: "0x16A1E7F62b702d84AAa0D1f534121DE9d17B0E18" }, // ITP/USDC
  { vault: "0xD248B1e882c4444674D83eF912713113B719f7Ce", pool: "0x95cb82d517a1ce4e6ac4312bcf718cd0ee9f3884" }, // cbEGGS/WETH
  { vault: "0x2fe57c7a0978d5bA39461572b87db41131b43646", pool: "0x33840ce3817ef3f79da49ec70e4653c4ae20ee3f" }, // ITP/cbXRP
  { vault: "0xa1bca9f6d9618348e7c33284082e2959a3449aa8", pool: "0x750813fbFBD24310A31e9dcaE3b143C75F241344" }, // ITP/cbEGGS
  { vault: "0xd75d5d3ef0880ff25fd66d4fdf5b461ffb97674d", pool: "0x3819e346E6347d75ceF0CfFd3FF41489f543a9Cc" }, // ITP/AERO
];

// === cbEGGS Contract (Base) - owned by Infinite Trading ===
const CBEGGS_CONTRACT = "0xddbabe113c376f51e5817242871879353098c296"

// === Treasury address (for managed dHEDGE vaults) ===
const TREASURY_1 = "0xb5dB6e5a301E595B76F40319896a8dbDc277CEfB"  // Main DAO treasury

// === dHEDGE Factory Contracts (for vault discovery) ===
const DHEDGE_FACTORY = {
  optimism: "0x5e61a079A178f0E5784107a4963baAe0c5a680c6",
  arbitrum: "0xffFb5fB14606EB3a548C113026355020dDF27535",
  polygon: "0xfdc7b8bFe0DD3513Cc669bB8d601Cb83e2F69cB0",
  base: "0x49Afe3abCf66CF09Fab86cb1139D8811C8afe56F"
}

// dHEDGE ABIs
const DHEDGE_V2_FACTORY_ABI = "function getManagedPools(address manager) view returns (address[] managedPools)"
const DHEDGE_V2_VAULT_SUMMARY_ABI = "function getFundSummary() view returns (tuple(string name, uint256 totalSupply, uint256 totalFundValue))"

const getStakedTVL = async (api) => {
  const { chain } = api
  let stakedTVL = 0;
  if(chain === 'optimism'){
    const fetchVeloPrice = await api.call( {
      abi: "function getManyRatesWithConnectors(uint8, address[]) view returns (uint256[] memory rates)",
      target: VELO_PRICE_ORACLE,
      params: [
        1,
        [
          ITP_ON_OPTIMISM,
          VELO_TOKEN_ADDRESS,
          WETH_TOKEN_ADDRESS,
          OP_TOKEN_ADDRESS,
          USDC_OP_TOKEN_ADDRESS,
        ],
      ],
    })
    const price = parseInt(fetchVeloPrice[0]) / Math.pow(10, 18)
  
    const stakedBalance = await api.call({
      abi: ITP_STAKED_ABI,
      target: ITP_VAULT_ADDRRESS,
    });
    const staked =  parseInt(stakedBalance[0]) / Math.pow(10, 18)
    stakedTVL = staked * price
  }
  api.addUSDValue(stakedTVL)
}

// Velodrome auto-compounders: LP each vault holds (vault.balance()), in the LP vault.want() reports
const addVelodromeCompounders = async (api) => {
  const [lps, balances] = await Promise.all([
    api.multiCall({ abi: "address:want", calls: AUTO_COMPOUNDERS }),
    api.multiCall({ abi: "uint256:balance", calls: AUTO_COMPOUNDERS }),
  ])
  lps.forEach((lp, i) => api.add(lp, balances[i]))
}

// Aero auto-compounders: every official vault from the v2 factory; LP held idle plus staked in the gauge
const addAeroVaults = async (api, isPool2) => {
  const factory = AERO_FACTORIES[api.chain]
  if (!factory) return
  const count = await api.call({ target: factory, abi: "uint256:vaultCount" })
  const vaults = await api.multiCall({
    target: factory,
    abi: "function vaults(uint256) view returns (address)",
    calls: Array.from({ length: Number(count) }, (_, i) => i),
  })
  const official = await api.multiCall({
    target: factory,
    abi: "function isOfficial(address) view returns (bool)",
    calls: vaults,
  })
  const ours = vaults.filter((_, i) => official[i])
  if (!ours.length) return
  const [assets, staked] = await Promise.all([
    api.multiCall({ abi: "address:asset", calls: ours }),
    api.multiCall({ abi: "uint256:stakedLp", calls: ours }),
  ])
  const [idle, token0s, token1s] = await Promise.all([
    api.multiCall({
      abi: "erc20:balanceOf",
      calls: ours.map((vault, i) => ({ target: assets[i], params: [vault] })),
    }),
    api.multiCall({ abi: "address:token0", calls: assets }),
    api.multiCall({ abi: "address:token1", calls: assets }),
  ])
  const itp = ITP[api.chain].toLowerCase()
  assets.forEach((lp, i) => {
    const pairsItp = [token0s[i], token1s[i]].some(t => t.toLowerCase() === itp)
    if (pairsItp === isPool2) api.add(lp, BigInt(idle[i]) + BigInt(staked[i]))
  })
}

// Uniswap V3 auto-compounders (Base): position NFTs held by the vaults plus their idle pool tokens; every pool pairs ITP or cbEGGS
const addUniV3Vaults = async (api) => {
  const pools = UNIV3_VAULTS.map(v => v.pool)
  const [token0s, token1s] = await Promise.all([
    api.multiCall({ abi: "address:token0", calls: pools }),
    api.multiCall({ abi: "address:token1", calls: pools }),
  ])
  return sumTokens2({
    api,
    resolveLP: true, // also unwraps Aero LP added earlier for this chain
    resolveUniV3: true,
    owners: UNIV3_VAULTS.map(v => v.vault),
    tokensAndOwners: UNIV3_VAULTS.flatMap((v, i) => [[token0s[i], v.vault], [token1s[i], v.vault]]),
  })
}

// dHEDGE managed vaults TVL: Infinite Trading manages dHEDGE vaults across chains (protocol TVL)
const getDhedgeVaultsTVL = async (api) => {
  const { chain } = api
  const factory = DHEDGE_FACTORY[chain]
  
  if (!factory) return
  
  // Get all vaults managed by TREASURY_1 (the main DAO wallet acting as manager)
  const managedVaults = await api.call({
    abi: DHEDGE_V2_FACTORY_ABI,
    target: factory,
    params: [TREASURY_1],
  })
  
  if (!managedVaults || managedVaults.length === 0) return
  
  // Get total fund value for each vault
  const summaries = await api.multiCall({
    abi: DHEDGE_V2_VAULT_SUMMARY_ABI,
    calls: managedVaults,
    permitFailure: true,
  })
  
  // Sum up all vault TVLs (totalFundValue is in USD with 18 decimals)
  const totalAUM = summaries.reduce((acc, vault) => {
    return acc + (vault && vault.totalFundValue ? Number(vault.totalFundValue) : 0)
  }, 0)
  
  // Add as USD value
  api.addUSDValue(totalAUM / 1e18)
}

// cbEGGS TVL on Base: ETH backing in the contract
const getCbEggsTVL = async (api) => {
  // Get ETH balance of the cbEGGS contract (the "backing")
  const ethBalance = await api.call({
    target: CBEGGS_CONTRACT,
    abi: 'function getBacking() view returns (uint256)',
  })
  
  // Add native ETH balance
  api.add(ADDRESSES.null, ethBalance)

  return api.getBalances()
}

// stSATO TVL on Ethereum: the SATO backing the stSATO token, read on-chain via getBacking()
const getStsatoTVL = async (api) => {
  const backing = await api.call({ target: STSATO_ON_ETHEREUM, abi: 'uint256:getBacking' })
  api.add(SATO_ON_ETHEREUM, backing)
}

module.exports = {
  methodology: "TVL: Aero auto-compounder vaults on Optimism and Base whose LP does not pair ITP (every DAO-official vault from the Aero v2 factories: LP held idle plus staked in the gauge, unwrapped); dHEDGE vaults managed by the DAO across multiple chains; cbEGGS.finance protocol TVL (ETH backing on Base); and stSATO TVL on Ethereum from on-chain SATO backing via getBacking(). cbEGGS is owned by Infinite Trading. Pool2: auto-compounder vaults holding ITP- or cbEGGS-paired liquidity (Velodrome and ITP-paired Aero vaults on Optimism, ITP-paired Aero vaults and Uniswap V3 position NFTs plus idle tokens on Base). Staking: ITP staking vault.",
  doublecounted: true,
  ethereum: {
    tvl: getStsatoTVL,
  },
  optimism: {
    tvl: async (api) => {
      await addAeroVaults(api, false)
      await sumTokens2({ api, resolveLP: true })
      await getDhedgeVaultsTVL(api)
      return api.getBalances()
    },
    pool2: async (api) => {
      await addVelodromeCompounders(api)
      await addAeroVaults(api, true)
      return sumTokens2({ api, resolveLP: true })
    },
    staking: getStakedTVL
  },
  arbitrum: {
    tvl: getDhedgeVaultsTVL,
  },
  polygon: {
    tvl: getDhedgeVaultsTVL,
  },
  base: {
    tvl: async (api) => {
      await getCbEggsTVL(api)
      await addAeroVaults(api, false)
      await sumTokens2({ api, resolveLP: true })
      await getDhedgeVaultsTVL(api)
      return api.getBalances()
    },
    pool2: async (api) => {
      await addAeroVaults(api, true)
      return addUniV3Vaults(api)
    },
  },
}
