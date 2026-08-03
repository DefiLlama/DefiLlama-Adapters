const ADDRESSES = require("../helper/coreAssets.json")
const { getCuratorExport } = require("../helper/curators")

// ---- Minimal ABIs / constants from Gearbox v3.1 adapter ----
const DEFILLAMA_COMPRESSOR_V310 = "0x81cb9eA2d59414Ab13ec0567EFB09767Ddbe897a"
const ETH_ALPHA_SAFE = "0x99b9F5F24205Cb88E33b1CC72008f644Fc23768b" // ETH Alpha Fund Portfolio Safe
const USD_ALPHA_SAFE = "0x38F6a1B46144fAEe6a6D9F79D8dE264C18e23848" // USD Alpha Fund Portfolio Safe

const GearboxCompressorABI = {
  // returns credit managers associated with the given legacy (market) configurators
  getLegacyCreditManagers:
    "function getCreditManagers(address[] memory configurators) external view returns (address[] memory creditManagers)",

  // pages credit accounts of a specific credit manager
  getCreditAccounts:
    "function getCreditAccounts(address creditManager, uint256 offset, uint256 limit) external view returns (tuple(address creditAccount, uint256 debt, tuple(address token, uint256 balance)[] tokens)[] memory data)",
}

// ---- Config (extend as needed) ----
const configs = {
  methodology:
    "Sum of curated vault deposits (Morpho, Aleph, Euler, Gearbox), Gearbox v3.1 credit account collateral, kpk Fund AUM, and positions in Safes actively managed by kpk via Zodiac Roles Modifier.",
  blockchains: {
    ethereum: {
      // Option 1: Use morphoVaultOwners to dynamically get all Morpho vaults owned by these addresses
      // (vaults are discovered from event logs, and de-duplication is automatically applied)
      morphoVaultOwners: [
        // Add owner addresses here to discover all their Morpho vaults
        // Example: '0x0000aeB716a0DF7A9A1AAd119b772644Bc089dA8',
      ],

      // Option 2: Use morpho: to specify static Morpho vault addresses
      // (de-duplication is automatically applied)
      // You can use BOTH morphoVaultOwners and morpho together - they will be combined
      morpho: [
        "0xe108fbc04852B5df72f9E44d7C29F47e7A993aDd", //Morpho v1 USDC Prime
        "0x0c6aec603d48eBf1cECc7b247a2c3DA08b398DC1", //Morpho v1 EURC Yield
        "0xd564F765F9aD3E7d2d6cA782100795a885e8e7C8", //Morpho v1 ETH Prime
        "0x4Ef53d2cAa51C447fdFEEedee8F07FD1962C9ee6", //Morpho v2 USDC Prime
        "0x1a1985F50352b58090eb36425AfdFacbaC7806F4", //Morpho v2 USDC Prime Core
        "0xa877D5bb0274dcCbA8556154A30E1Ca4021a275f", //Morpho v2 EURC Yield
        "0xbb50a5341368751024ddf33385ba8cf61fe65ff9", //Morpho v2 ETH Prime
        "0x5dbf760b4fd0cDdDe0366b33aEb338b2A6d77725", //Morpho v2 ETH Yield
        "0xc88eFFD6e74D55c78290892809955463468E982A", //Morpho v1 ETH Yield
        "0xD5cCe260E7a755DDf0Fb9cdF06443d593AaeaA13", //Morpho v2 USDC Yield
        "0x9178eBE0691593184c1D785a864B62a326cc3509", //Morpho v1 USDC Yield
        "0xdaD4e51d64c3B65A9d27aD9F3185B09449712065", //Morpho v1 USDT Prime
        "0x870F0BF29A25A40E7CC087cD5C53e70C11F2C8A8", //Morpho v2 USDT Prime
      ],

      // Other ERC-4626 vaults (non-Morpho)
      erc4626: [
        "0x2B47c128b35DDDcB66Ce2FA5B33c95314a7de245", //kpk USDC Prime RWA (Euler Earn)
        "0xB6D6D89ad4b4D61C15a293e28b74f77F6817fF48", //kpk ETH Yield Term (Euler Earn)
        "0x9396dcbf78fc526bb003665337c5e73b699571ef", //Gearbox ETH
        "0xA9d17f6D3285208280a1Fd9B94479c62e0AABa64", //Gearbox wstETH
      ],

      // Aleph vaults use underlyingToken() instead of asset(), so they
      // can't go through the standard ERC-4626 curator helper.
      alephVaults: [
        "0x9477df934574d47f240e18cd232e013118666690", //kpk Aleph rETH
        "0xf857caa91ea4007ec26aee2d039e870eb0fa91bf", //kpk Aleph stETH
        "0x6cbcc646d7422b734c6fc0954a1c3ca87b1b4ceb", //kpk Aleph osETH
      ],


      // NEW: Gearbox v3.1 Market Configurator (legacy configurator) to crawl
      gearboxMarketConfigurator: "0x1b265b97eb169fb6668e3258007c3b0242c7bdbe",
    },
    arbitrum: {
      // You can use either morphoVaultOwners or morpho here too
      morpho: [
        "0x2C609d9CfC9dda2dB5C128B2a665D921ec53579d", //Morpho USDC Yield
        "0x5837e4189819637853a357aF36650902347F5e73", //Morpho USDC Yield v2
      ],
    },
  },
}

// ---- Gearbox v3.1 credit-account collateral TVL ----

async function getGearboxV31Collateral(api, marketConfigurator, pageSize = 1e3) {
  if (!marketConfigurator) return

  // fetch credit managers associated with this configurator
  const creditManagers = await api.call({
    abi: GearboxCompressorABI.getLegacyCreditManagers,
    target: DEFILLAMA_COMPRESSOR_V310,
    params: [[marketConfigurator]],
  })
  if (!creditManagers?.length) return

  // page through credit accounts for each CM
  for (const cm of creditManagers) {
    let offset = 0
    while (true) {
      const accounts = await api.call({
        abi: GearboxCompressorABI.getCreditAccounts,
        target: DEFILLAMA_COMPRESSOR_V310,
        params: [cm, offset, pageSize],
        permitFailure: true,
      })

      if (!accounts || !accounts.length) break
      offset += accounts.length

      // keep only accounts with non-zero debt (active)
      for (const acc of accounts) {
        if (!acc) continue
        const hasDebt = BigInt(acc.debt || 0n) !== 0n
        if (!hasDebt) continue

        // Add each token balance in the account as collateral TVL
        // Imitates Gearbox's internal adapter filter: ignore ~dust (<= 1)
        for (const t of (acc.tokens || [])) {
          if (!t?.token || t.balance == null) continue
          try {
            if (BigInt(t.balance) > 1n) api.add(t.token, t.balance)
          } catch {
            // in case a malformed balance slips through, just skip it
          }
        }
      }

      // stop if this page was not full
      if (accounts.length < pageSize) break
    }
  }
}

// ---- Aleph vault TVL (uses underlyingToken() instead of asset()) ----

async function getAlephVaultTvl(api, vaults) {
  if (!vaults?.length) return
  const underlyingTokens = await api.multiCall({ abi: "address:underlyingToken", calls: vaults, permitFailure: true })
  const totalAssets = await api.multiCall({ abi: "uint256:totalAssets", calls: vaults, permitFailure: true })
  for (let i = 0; i < vaults.length; i++) {
    if (underlyingTokens[i] && totalAssets[i]) api.add(underlyingTokens[i], totalAssets[i])
  }
}

// ---- kpk Fund (OIV) safes ----
const OIV_SAFES = [ETH_ALPHA_SAFE, USD_ALPHA_SAFE]
const OIV_CHAINS = ['ethereum', 'arbitrum', 'base', 'xdai', 'optimism']

const ZODIAC_MANAGED_SAFES = [
  '0x4F2083f5fBede34C2714aFfb3105539775f7FE64', // ENS Endowment Fund (eth)
  '0x616dE58c011F8736fa20c7Ae5352F7f6FB9F0669', // CoW Main Treasury (eth/gnosis/arb/base/polygon)
  '0x7F8987D6A8bee31bD7bE80E877732579E2582a28', // CoW Defense Fund (eth/gnosis)
  '0x9009B4411D0e1171cc042b77D7701f46B737Fdb9', // CoW Validator Safe (gnosis)
  '0x3E2897E71E504B0510Bed7983579280b32ac1CA5', // CoW wallet (eth)
  '0x523732d31b4432bcdd4baad108f7ebe54ad478b0', // CoW wallet (38M COW) (eth)
  '0x4D1D9D7741740A3E2ffC5507aC643DbA5e81cAe5', // Arbitrum DAO (arb)
  '0x8e53D04644E9ab0412a8c6bd228C84da7664cFE3', // Nexus Mutual (eth)
]
const ZODIAC_CHAINS = ['ethereum', 'xdai', 'arbitrum', 'base', 'polygon']

// (A) Blacklist the kpk curated vaults — already counted by getCuratorExport's
// totalAssets(). Safe deposits into these must NOT be recounted here.
function getCuratedVaults(chain) {
  const cfg = configs.blockchains[chain]
  if (!cfg) return []
  return [...(cfg.morpho || []), ...(cfg.erc4626 || []), ...(cfg.alephVaults || [])]
}

// held directly, added via sumTokens
const PROTOCOL_TOKENS = {
  ethereum: [
    // --- LSD / LRT (ERC20) ---
    '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', // stETH
    '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', // wstETH
    '0xae78736Cd615f374D3085123A210448E74Fc6393', // rETH
    '0xA35b1B31Ce002FBF2058D22F30f95D405200A15b', // ETHx
    '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb', // ankrETH
    '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee', // weETH
    '0x35fA164735182de50811E8e2E824cFb9B6118ac2', // eETH
    '0xf1C9acDc66974dFB6dEcB12aA385b9cD01190E38', // osETH
    // --- staked stables (ERC20 / ERC4626) ---
    '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497', // sUSDe (Ethena)
    '0x1202F5C7b4B9E47a1A484E8B270be34dbbC75055', // stUSR (Resolv)
    '0x004626A008B1aCdC4c74ab51644093b155e59A23', // stEUR (Angle)
    '0x83F20F44975D03b1b09e64809B757c47f942BEeA', // sDAI (Maker DSR)
    '0xa3931d71877C0E7a3148CB7Eb4463524FEc27fbD', // sUSDS (Sky SSR)
    '0x1a88Df1cFe15Af22B3c4c783D4e6F7F9e0C1885d', // stkGHO (Aave Staked GHO)
    '0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE', // Spark USDC Vault
    '0xdA89af5bF2eb0B225d787aBfA9095610f2E79e7D', // Upshift Resolv USR Maxi
    '0xBC6736d346a5eBC0dEbc997397912CD9b8FAe10a', // Pendle PT-USDe-25SEP2025
    '0x80ac24aA929eaF5013f6436cdA2a7ba190f5Cc0b', // syrupUSDC (Maple)
    '0xc3d688B66703497DAA19211EEdff47f25384cdc3', // CompoundV3 cUSDCv3 (balanceOf = supply, priced)
    '0xA17581A9E3356d9A858b789D68B4d866e593aE94', // CompoundV3 cWETHv3
    '0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840', // CompoundV3 cUSDTv3
    // --- LP / BPT / CoW-AMM (resolveLP) ---
    '0x05ff47AFADa98a98982113758878F9A8B9FddA0a', // weETH/rETH
    '0x06966b4Ae338CE20f283086914388133F27D1d3e', // 50wstETH/25WBTC/25SOL (CoW AMM)
    '0x1e19cf2d73a72ef1332c882f20534b6519be0276', // rETH/WETH
    '0x32296969ef14eb0c6d29669c550d4a0449130230', // wstETH/WETH
    '0x41503C9D499ddbd1dCdf818a1b05e9774203Bf46', // wstETH/bb-a-WETH
    '0x6fF0531EE19272675b3c7d30401A5b2b2C7b0c67', // COW/WETH (CoW AMM)
    '0x75eB3D7976f0bf848F4Bc22a7563fA50BD73c504', // wstETH/SOL (CoW AMM)
    '0x85B2b559bC2D21104C4DEFdd6EFcA8A20343361D', // GHO/USDT/USDC (BalancerV3)
    '0x909d829C549e1f1B04adB939D8a641A256f5fe11', // USDC/WETH (CoW AMM)
    '0x92762b42a06dcdddc5b7362cfb01e631c4d44b40', // COW/GNO
    '0x93d199263632a4EF4Bb438F1feB99e57b4b5f0BD', // wstETH/WETH v2
    '0x9bd702E05B9c97E4A4a3E47Df1e0fe7A0C26d2F1', // COW/wstETH (CoW AMM)
    '0xDACf5Fa19b1f720111609043ac67A9818262850c', // osETH/WETH
    '0xa13a9247ea42d743238089903570127dda72fe44', // bb-a-USD
    '0xbF5e1e2a89312Bc792aFEe22d6bEBdd46Bd1Eae2', // COW/WETH (CoW AMM)
    '0xc9D5204e7c04A1be300B33E3979479bE75132AC5', // USDC/WETH (CoW AMM)
    '0xde8c195aa41c11a0c4787372defbbddaa31306d2', // COW/WETH
    '0xf08D4dEa369C456d26a3168ff0024B904F2d8b91', // USDC/WETH (CoW AMM)
    '0xf25a3b5A965c59f88873Da93FC2a244B00616Be4', // WBTC/wstETH (CoW AMM)
    '0xf4c0dd9b82da36c07605df83c8a416f11724d88b', // GNO/WETH
    '0xfebb0bbf162e64fb9d0dfe186e517d84c395f016', // bb-a-USD v3
    '0xd321300ef77067D4A868F117d37706EB81368E98', // COW/WETH ReClamm (BalancerV3)
    '0x06325440D014e39736583c165C2963BA99fAf14E', // Curve stETH/ETH
    '0xBa3436Fd341F2C8A928452Db3C5A3670d1d5Cc73', // Curve EURA/EURC
    // --- wallet core + gov ---
    ADDRESSES.ethereum.WETH,
    ADDRESSES.ethereum.USDC,
    ADDRESSES.ethereum.USDT,
    ADDRESSES.ethereum.DAI,
    ADDRESSES.ethereum.WBTC,
    '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB', // COW
    '0x6810e776880C02933D47DB1b9fc05908e5386b96', // GNO
    '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72', // ENS
    '0x0d438F3b5175Bebc262bF23753C1E53d03432bDE', // wNXM
    '0xd7c49CEE7E9188cCa6AD8FF264C1DA2e69D4Cf3B', // NXM (wallet; staked NXM handled separately)
  ],
  xdai: [
    '0x6C76971f98945AE98dD7d4DFcA8711ebea946eA6', // wstETH (gnosis)
    '0xA4eF9Da5BA71Cc0D2e5E877a910A37eC43420445', // sGNO
    '0xaf204776c7245bF4147c2612BF6e5972Ee483701', // sDAI (Gnosis Savings)
    '0x4683e340a8049261057D5aB1b29C8d840E75695e', // Balancer wstETH/GNO
    '0xFEdb19Ec000d38d92Af4B21436870F115db22725', // Balancer bb-ag-USD
    '0xbAd20c15A773bf03ab973302F61FAbceA5101f0A', // Balancer wstETH/WETH
    '0x0CA1C1eC4EBf3CC67a9f545fF90a3795b318cA4a', // Curve EURe/WXDAI/USDC/USDT
    ADDRESSES.xdai.WXDAI,
    '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb', // GNO (gnosis)
  ],
  arbitrum: [
    '0x10Cab08D1490a56bDa21A191C20771fcB5453F54', // UniV2 COW/WETH
    '0x940098b108fB7D0a7E374f6eDED7760787464609', // Spark USDC Vault (sUSDC)
    '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf', // CompoundV3 cUSDCv3
    '0x037dFf1C12805707d7c29F163E0F09fC9102657A', // Fluid fGHO (priced; convertToAssets baked into price)
    '0x4A03F37e7d3fC243e3f99341d36f4b829BEe5E03', // Fluid fUSDT0
    ADDRESSES.arbitrum.WETH,
    ADDRESSES.arbitrum.USDC_CIRCLE,
  ],
  base: [
    '0x155e0971A2392c446be02373A4F4c8dC4266f015', // Aerodrome WETH/COW
    '0xFf028c1eC4559d3Aa2B0859AA582925B5Cc28069', // BalancerV3 COW/WETH ReClamm
    '0x6b2F4eD81Cb5DaAE4aBA9b85D64C00dD3E4605E2', // UniV2 COW/WETH
    ADDRESSES.base.WETH,
    ADDRESSES.base.USDC,
  ],
  polygon: [
    ADDRESSES.polygon.WETH,
    ADDRESSES.polygon.USDC_CIRCLE,
  ],
}

async function getSafesTvl(api) {
  const tokens = PROTOCOL_TOKENS[api.chain]
  if (!tokens || !tokens.length) return
  await api.sumTokens({
    owners: ZODIAC_MANAGED_SAFES,
    tokens,
    resolveLP: true,
    blacklistedTokens: getCuratedVaults(api.chain),
  })
}

const AAVE_V3_POOLS = {
  ethereum: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
  arbitrum: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  xdai: '0xb50201558B00496A145fE76f7424749556E326D8',
  base: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
  polygon: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
}
const SPARK_POOLS = {
  ethereum: '0xC13e21B648A5Ee794902342038FF3aDAB66BE987',
  xdai: '0x2Dae5307c5E3FD1CF5A72Cb6F698f915860607e0',
}
const AAVE_RESERVE_DATA_ABI = 'function getReserveData(address asset) view returns (tuple(tuple(uint256 data) configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))'

async function getLendingTvl(api, pool, owners) {
  if (!pool) return
  const reserves = await api.call({ target: pool, abi: 'function getReservesList() view returns (address[])', permitFailure: true })
  if (!reserves) return
  const reserveData = await api.multiCall({ target: pool, abi: AAVE_RESERVE_DATA_ABI, calls: reserves, permitFailure: true })
  const tokens = []
  for (const r of reserveData) if (r) tokens.push(r.aTokenAddress, r.variableDebtTokenAddress)
  await api.sumTokens({ owners, tokens })
}

const getAaveV3Tvl = (api, owners = ZODIAC_MANAGED_SAFES) => getLendingTvl(api, AAVE_V3_POOLS[api.chain], owners)
const getSparkTvl = (api, owners = ZODIAC_MANAGED_SAFES) => getLendingTvl(api, SPARK_POOLS[api.chain], owners)

const STAKEWISE_V3_VAULTS = {
  ethereum: [{ vault: '0xAC0F906E433d58FA868F936E8A43230473652885', asset: ADDRESSES.ethereum.WETH }], // Genesis Vault - ETH
  xdai: [{ vault: '0x4b4406Ed8659D03423490D8b62a1639206dA0A7a', asset: ADDRESSES.xdai.GNO }], // Genesis Vault - GNO
}
async function getStakewiseV3Tvl(api) {
  const vaults = STAKEWISE_V3_VAULTS[api.chain]
  if (!vaults) return
  for (const { vault, asset } of vaults) {
    const shares = await api.multiCall({ target: vault, abi: 'function getShares(address) view returns (uint256)', calls: ZODIAC_MANAGED_SAFES, permitFailure: true })
    let total = 0n
    for (const s of shares) if (s) total += BigInt(s)
    if (total === 0n) continue
    const assets = await api.call({ target: vault, abi: 'function convertToAssets(uint256) view returns (uint256)', params: [total.toString()], permitFailure: true })
    if (assets) api.add(asset, assets)
  }
}

const AURA_BOOSTER = {
  ethereum: '0xA57b8d98dAE62B26Ec3bcC4a365338157060B234',
  xdai: '0x98Ef32edd24e2c92525E59afc4475C1242a30184',
}
const AURA_POOL_INFO_ABI = 'function poolInfo(uint256) view returns (address lptoken, address token, address gauge, address crvRewards, address stash, bool shutdown)'

async function getAuraTvl(api) {
  const booster = AURA_BOOSTER[api.chain]
  if (!booster) return
  const bpts = new Set((PROTOCOL_TOKENS[api.chain] || []).map((a) => a.toLowerCase()))
  const len = await api.call({ target: booster, abi: 'function poolLength() view returns (uint256)' })
  const infos = await api.multiCall({ target: booster, abi: AURA_POOL_INFO_ABI, calls: Array.from({ length: Number(len) }, (_, i) => i) })
  const pools = infos.filter((i) => i && bpts.has(i.lptoken.toLowerCase()))
  const calls = []
  for (const p of pools) for (const owner of ZODIAC_MANAGED_SAFES) calls.push({ bpt: p.lptoken, target: p.crvRewards, params: [owner] })
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: calls.map((c) => ({ target: c.target, params: c.params })), permitFailure: true })
  calls.forEach((c, i) => { if (bals[i] && bals[i] !== '0') api.add(c.bpt, bals[i]) })
}

// Nexus Mutual staked NXM — find the safe's StakingNFTs, then let Nexus's own
// StakingViewer report each position's active stake (in NXM).
const NEXUS_STAKING_NFT = '0xcafeA508a477D94c502c253A58239fb8F948e97f'
const NEXUS_STAKING_VIEWER = '0xcafea5c7d25a192ba70ECA0E2dB62F835c1cF81F'
const NXM_TOKEN = '0xd7c49CEE7E9188cCa6AD8FF264C1DA2e69D4Cf3B'
const NEXUS_GET_TOKENS_ABI = 'function getTokens(uint256[] tokenIds) view returns (tuple(uint256 tokenId, uint256 poolId, uint256 activeStake, uint256 expiredStake, uint256 rewards, tuple(uint256 tokenId, uint256 trancheId, uint256 stake, uint256 stakeShares, uint256 reward)[] deposits)[] tokens)'

async function getNexusStakedNXM(api) {
  if (api.chain !== 'ethereum') return
  const totalSupply = await api.call({ target: NEXUS_STAKING_NFT, abi: 'uint256:totalSupply', permitFailure: true })
  if (!totalSupply) return // contract not deployed at this block

  const ids = Array.from({ length: Number(totalSupply) }, (_, i) => i + 1)
  const owners = await api.multiCall({ target: NEXUS_STAKING_NFT, abi: 'function ownerOf(uint256) view returns (address)', calls: ids, permitFailure: true })
  const safes = new Set(ZODIAC_MANAGED_SAFES.map((a) => a.toLowerCase()))
  const ours = ids.filter((_, i) => owners[i] && safes.has(owners[i].toLowerCase()))
  if (!ours.length) return

  const tokens = await api.call({ target: NEXUS_STAKING_VIEWER, abi: NEXUS_GET_TOKENS_ABI, params: [ours] })
  let nxmWei = 0n
  for (const t of tokens) nxmWei += BigInt(t.activeStake)
  if (nxmWei > 0n) api.add(NXM_TOKEN, nxmWei.toString())
}

// ---- Combined TVL export per chain ----

const allChains = [...new Set([...Object.keys(configs.blockchains), ...ZODIAC_CHAINS, ...OIV_CHAINS])]
const exportObjects = getCuratorExport(configs)

for (const chain of allChains) {
  const curatorTvl = exportObjects[chain]?.tvl
  exportObjects[chain] = {
    tvl: async (api) => {
      // Curated vault deposits (Morpho, Euler, etc.) via getCuratorExport
      if (curatorTvl) await curatorTvl(api)

      // Gearbox v3.1 credit account collateral + Aleph vault TVL
      const chainCfg = configs.blockchains[chain]
      const hasGearbox = chainCfg?.gearboxMarketConfigurator
      const hasAleph = chainCfg?.alephVaults
      if (hasGearbox) await getGearboxV31Collateral(api, hasGearbox)
      if (hasAleph) await getAlephVaultTvl(api, hasAleph)

      // Zodiac-managed Safe TVL
      if (ZODIAC_CHAINS.includes(chain)) {
        await getSafesTvl(api)
        await getAaveV3Tvl(api)
        await getSparkTvl(api)
        await getStakewiseV3Tvl(api)
        await getAuraTvl(api)
        await getNexusStakedNXM(api)
      }

      // kpk Fund (OIV)
      if (OIV_CHAINS.includes(chain)) {
        await getAaveV3Tvl(api, OIV_SAFES)
        await getSparkTvl(api, OIV_SAFES)
      }
    }
  }
}

module.exports = exportObjects