const ADDRESSES = require("../helper/coreAssets.json")
const { getCuratorExport } = require("../helper/curators")
const { sumTokens2 } = require("../helper/unwrapLPs")

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
        "0xb5ce3CA2C774b72955C25875022FdD91f7a7B938", //Morpho v2 wARS Yield
        "0x6251482812cE95d11b3E447FE6888b1a1bE66C25", //Morpho v2 EURe Yield
        "0x7a72bcD2c3F7F7e4D6679170a0625bAB15D7DDa1", //Morpho v2 USDC Yield RWA
      ],

      // Other ERC-4626 vaults (non-Morpho)
      erc4626: [
        "0x2B47c128b35DDDcB66Ce2FA5B33c95314a7de245", //kpk USDC Prime RWA (Euler Earn)
        "0x8BcD746976885b5832bAD07B4921E3f2dD1D3703", //kpk USDC RWA Liquidity (Symbiotic v2 Liquid Lane)
        "0xB6D6D89ad4b4D61C15a293e28b74f77F6817fF48", //kpk ETH Yield Term (Euler Earn)
        "0x9396dcbf78fc526bb003665337c5e73b699571ef", //Gearbox ETH
        "0xA9d17f6D3285208280a1Fd9B94479c62e0AABa64", //Gearbox wstETH
      ],

      // Upshift multiAssetVault: non-ERC4626, exposes asset() + getTotalAssets()
      upshiftV2: [
        "0x00E95754322D15aB8765961c6Ac5682B9282F54F", //kpk Upshift lsETH
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
    permitFailure: true
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

// Zodiac-managed institutional safes — each gated to its kpk mandate window (see TIME_GATED_ENTITIES)
const ENS_SAFES = [
  '0x4F2083f5fBede34C2714aFfb3105539775f7FE64', // ENS Endowment Fund (eth)
]
const COW_SAFES = [
  '0x616dE58c011F8736fa20c7Ae5352F7f6FB9F0669', // CoW Main Treasury (eth/gnosis/arb/base/polygon)
  '0x7F8987D6A8bee31bD7bE80E877732579E2582a28', // CoW Defense Fund (eth/gnosis)
  '0x9009B4411D0e1171cc042b77D7701f46B737Fdb9', // CoW Validator Safe (gnosis)
  '0x3E2897E71E504B0510Bed7983579280b32ac1CA5', // CoW wallet (eth)
  '0x523732d31b4432bcdd4baad108f7ebe54ad478b0', // CoW wallet (38M COW) (eth)
]
const ARBITRUM_SAFES = [
  '0x4D1D9D7741740A3E2ffC5507aC643DbA5e81cAe5', // Arbitrum DAO (arb)
]
const NEXUS_SAFES = [
  '0x8e53D04644E9ab0412a8c6bd228C84da7664cFE3', // Nexus Mutual (eth)
]

const AAVE_DAO_SAFES = [
  '0x205e795336610f5131be52f09218af19f0f3ec60',
  '0xa1c93d2687f7014aaf588c764e3ce80af016229b',
  '0xcdb4fa6ba08bf1fb7aa9fdf6002e78edc431a642',
  '0x2ce01c87fec1b71a9041c52caed46fc5f4807285',
  '0xa9e777d56c0ad861f6a03967e080e767ad8d39b6',
  '0xcaf8155d99a0d11567f039422bb8a0ba003788e5',
  '0x25f2226b597e8f9514b3f68f00f494cf4f286491',
  '0x464c71f6c2f760dda6093dcb91c24c39e5d6e18c',
  '0xB2289E329D2F85F1eD31Adbb30eA345278F21bcf',
  '0xBA9424d650A4F5c80a0dA641254d1AcCE2A37057',
  '0x3e652E97ff339B73421f824F5b03d75b62F1Fb51',
  '0x053D55f9B5AF8694c503EB288a1B7E552f590710',
  '0xe8599F3cc5D38a9aD6F3684cd5CEa72f10Dbc383',
  '0x5ba7fd868c40c16f7aDfAe6CF87121E13FC2F7a0',
]
const GNOSIS_DAO_SAFES = [
  '0x458cd345b4c05e8df39d0a07220feb4ec19f5e6f',
  '0x23b4f73fb31e89b27de17f9c5de2660cc1fb0cdf',
  '0x6bbe78ee9e474842dbd4ab4987b3cefe88426a92',
  '0xeb1f08afcc4da307ae4ccef00daf53488aa76979',
  '0x6378a40df79583eaa6ce70e951ba7da45ceb4fc7',
  '0x10720f58cf4a22fa540ff10430fd967d2ef102de',
  '0x9065a0f9545817d18b58436771b4d87bda8f008b',
  '0x509ad7278a2f6530bc24590c83e93faf8fd46e99',
  '0x1a3221e5a1daf12b39bfff0ef8a066029e50e6fe',
  '0x095e194302e851e1ddbd2795c0180b889ad01fef',
  '0x12dbe8705144fdbed126c818fc60faf5d679112b',
  '0x2730a02aef900520104adc8fd76b03e8c4be4bbb',
  '0x8cdb8ae1f5bb1d7d509c28685864ed70669cc63d',
  '0x49e8d6cbc93b36d356266d2e93ddee7fe475125f',
  '0xbf751b5a46c80930f4596d6bc72da81c2ec2b235',
  '0xb5695594f30b9a10889f30108248f8cfda43341b',
  '0x43e2e12a8c294657d94fe80bda9dd380e0598f4c',
  '0x8cc90c889b6e108976d3f66b5292570637350c7d',
  '0x87b6a922794a223eca493fb65dcaf44462843c2a',
  '0xeb5cd25a3855d21e3db6c5ccd8e78d43258aabe8',
  '0xca308c6b015f9ba3625d576a02e96d7cec58b932',
  '0x07643179f63f1e10c6ca04cccc6aba2db71fd60a',
  '0x849d52316331967b6ff1198e5e32a0eb168d039d',
  '0xf51842ebf4dc1e6f89d74ab0768c670ab04d928b',
  '0x2923c1b5313f7375fdaee80b7745106debc1b53e',
  '0xa5c629e04e563355c30885b62928fd6e03558548',
  '0x15a954001bb47890a4c46a7fe9f06f7c39ff3d68',
  '0xce0ef49b8fcd85531327abeabad10ea641299365',
  '0x7eea4286e9e82ba332f49400d037609bb1cf00da',
  '0x5b6e1acd8494092c166b390c17f09694b9ddb42c',
  '0x210ff2e26599d7146753bcbbc93afedf82d2802f',
  '0x7ce63a765341bc274fd5c5c4d80b17ac26f2062f',
  '0x3115f77805fe59ef9a31d5b38c68c171665cbb53',
]
const SAFE_GNOSIS_SAFES = [
  '0xd28b432f06cb64692379758b88b5fcdfc4f56922','0x0c6eeb232800fb86215438c4f7ae032b5463586c', '0x027e1CbF2C299CBa5eB8A2584910d04f1A8Aa403'
]

const ZODIAC_CHAINS = ['ethereum', 'xdai', 'arbitrum', 'base', 'polygon', 'optimism', 'bsc', 'avax']

// (A) Blacklist the kpk curated vaults — already counted by getCuratorExport's
// totalAssets(). Safe deposits into these must NOT be recounted here.
function getCuratedVaults(chain) {
  const cfg = configs.blockchains[chain]
  if (!cfg) return []
  return [...(cfg.morpho || []), ...(cfg.erc4626 || []), ...(cfg.alephVaults || []), ...(cfg.upshiftV2 || [])]
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
    '0x9Fb7b4477576Fe5B32be4C1843aFB1e55F251B33', // Fluid fUSDC
    '0x5C20B550819128074FD538Edf79791733ccEdd18', // Fluid fUSDT
    '0x6A29A46E21C730DcA1d8b23d637c101cec605C5B', // Fluid fGHO
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
    '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA', // CompoundV3 cUSDbCv3 (USDC.e)
    '0x037dFf1C12805707d7c29F163E0F09fC9102657A', // Fluid fGHO (priced; convertToAssets baked into price)
    '0x4A03F37e7d3fC243e3f99341d36f4b829BEe5E03', // Fluid fUSDT0
    '0x1A996cb54bb95462040408C06122D45D6Cdb6096', // Fluid fUSDC
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
  optimism: [ADDRESSES.optimism.WETH, ADDRESSES.optimism.USDC_CIRCLE],
  bsc: [ADDRESSES.bsc.WBNB, ADDRESSES.bsc.USDC],
}

const GNOSIS_DAO_TOKENS = {
  xdai: ['0x02e7e2dd3ba409148a49d5cc9a9034d2f884f245','0x5d7309a01b727d6769153fcb1df5587858d53b9c','0xbdf4488dcf7165788d438b62b4c8a333879b7078','0x28dbd35fd79f48bfa9444d330d14683e7101d817','0x321704900d52f44180068caa73778d5cd60695a6','0x5aa67e24ba8a3fbdc553e308d02377e03ce9e94f','0xf0376d1fafd1ff2f1367546da622ba8f26829d7a','0x1Ad6A0cFF3870b252492597B557F3e61F130663D','0x5fca4cbdc182e40aefbcb91afbde7ad8d3dc18a8','0xc25F6c9622ac3096bcca122272f511b6fF94d898','0xd7b118271b1b7d26c9e044fc927ca31dccb22a5a','0xDBF14bce36F661B29F6c8318a1D8944650c73F38','0xf6be7ad58f4baa454666b0027839a01bcd721ac3','0xFeDBA8b0Ccf72Ba983e5b7b5B4EE5Bc525bae339','0xF38c5b39F29600765849cA38712F302b1522C9B8','0xF48f01DCB2CbB3ee1f6AaB0e742c2D3941039d56','0xB973Ca96a3f0D61045f53255E319AEDb6ED49240','0x66F33Ae36dD80327744207a48122F874634B3adA','0xFEdb19Ec000d38d92Af4B21436870F115db22725','0x21d4c792Ea7E38e0D0819c2011A2b1Cb7252Bd99','0xa99FD9950B5D5dCeEaf4939E221dcA8cA9B938aB','0x388Cae2f7d3704C937313d990298Ba67D70a3709','0xac16c751f4c719a7ad54081a32ab0488b56f0ef4','0xd3078c1568Ece597f2dF457A4Bbf670FB8076e71','0x7aC5bBefAE0459F007891f9Bd245F6beaa91076c','0xA4eF9Da5BA71Cc0D2e5E877a910A37eC43420445','0xE6B448c0345bF6AA52ea3A5f17aabd0e58F23912','0x0CA1C1eC4EBf3CC67a9f545fF90a3795b318cA4a','0xbAd20c15A773bf03ab973302F61FAbceA5101f0A','0xA611A551b95b205ccD9490657aCf7899daee5DB7','0x5C78d05b8ECF97507d1cf70646082c54FaA4dA95','0x6c76971f98945ae98dd7d4dfca8711ebea946ea6','0x5519E2d8A0af0944EA639C6DBAD69A174DE3ECF8','0x2086f52651837600180dE173B09470F54EF74910','0xEb30C85CC528537f5350CF5684Ce6a4538e13394','0x4683e340a8049261057D5aB1b29C8d840E75695e','0x00dF7f58e1Cf932eBe5f54De5970Fb2Bdf0ef06D','0x0C1B9CE6Bf6C01f587C2ee98b0ef4B20C6648753','0x4cdABE9E07ca393943AcFB9286bBbd0D0a310Ff6','0xaf204776c7245bF4147c2612BF6e5972Ee483701','0xDd439304A77f54B1F7854751Ac1169b279591Ef7','0xBc2acf5E821c5c9f8667A36bB1131dAd26Ed64F9','0x870Bb2C024513B5c9A69894dCc65fB5c47e422f3','0x0d80D7f7719407523A09ee2ef7eD573e0eA3487a','0xBB7E99abCCCE01589Ad464Ff698aD139b0705d90','0x7644fa5d0ea14fcf3e813fdf93ca9544f8567655','0x004626A008B1aCdC4c74ab51644093b155e59A23','0x06135A9Ae830476d3a941baE9010B63732a055F4','0x610525b415c1BFAeAB1a3fc3d85D87b92f048221','0x91fD594c46D8B01E62dBDeBed2401dde01817834','0x98f7656A6C09388c646ff423ED82980675a152dD','0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1','0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0','0x845C8bc94610807fCbaB5dd2bc7aC9DAbaFf3c55','0xa555d5344f6FB6c65da19e403Cb4c1eC4a1a5Ee3','0x592878b920101946Fb5915aB97961bC546f211CC','0xe2343512dcF8a23d81E6cdc2Fac656Db1FF83aA1','0xdccAa73705dC7457bcfb3dAFEe529B30920e3008','0x3889c8b1f064a1a576cab04d5767a00bf2308bd4','0x35c089e2451633df9684564cccfe745aa5f3b465','0xc791240D1F2dEf5938E2031364Ff4ed887133C3d','0xfC095C811fE836Ed12f247BCf042504342B73FB7','0xA639FB3f8C52e10E10a8623616484d41765d5F82','0xD8a772fD2B7872230cCD92EF073bE81De87137D7','0x8DD4df4Ce580b9644437f3375e54f1ab09808228','0x71E1179C5e197FA551BEEC85ca2EF8693c61b85b','0x8189c4c96826D016A99986394103DFa9aE41e7ee','0xf490c80aae5f2616d3e3bda2483e30c4cb21d1a0','0x4b4406Ed8659D03423490D8b62a1639206dA0A7a','0x00025C729A3364FaEf02c7D1F577068d87E90ba6','0x456e1E2CF2F25d451c1603892f8485701cC88189','0x3220c83e953186f2b9ddfc0b5dd69483354edca2','0x2Cd404D9d75436e7d6dDbCcc2fB9cF7C06941BF1','0x079d2094e16210c42457438195042898a3CFF72d','0x6a83c4F5FE2205D84DCDcF9463Fe4C55A25A306b','0x71663f74490673706D7b8860B7D02b7c76160bAe','0xD7f99B1CDa3EeCf6b6eAa8a61ed21d061E745400','0x5089007DEC8E93f891dcB908c9E2Af8d9DEdb72E','0x33C346928eD9249Cf1d5fc16aE32a8CFFa1671AD','0x2f840f1575EE77adAa43415Ac5953F7Db9F8C6ba','0xEe9BFf933aDD313C4289E98dA80fEfbF9d5Cd9Ba','0x3CB4692177525dB38D983DA0445d4EB25C3826dE','0xe0A342ED4e0F0dBe97C4810534CfCB6550EA017D','0x9eeB6be79899CfE45018866A2113c6b77fa96F35','0x8898a1199a36023E9791F445BBF498755A180b7f','0xAD58D2Bc841Cb8e4f8717Cb21e3FB6c95DCBc286','0x5300648b1cFaa951bbC1d56a4457083D92CFa33F','0x809484b8579dC605917B8f94aA284282d5fe375d','0x9248f874AaA2c53AD9324d7A2D033ea133443874','0xeA50f402653c41cAdbaFD1f788341dB7B7F37816','0x272d6BE442E30D7c87390eDEb9B96f1E84cEcD8d','0xD1D7Fa8871d84d0E77020fc28B7Cd5718C446522','0x6e6bb18449fCF15B79EFa2CfA70ACF7593088029','0xB1EeAD6959cb5bB9B20417d6689922523B2B86C3','0xe9aBA835f813ca05E50A6C0ce65D0D74390F7dE7','0x717633A41211C944C7808013b44824C3D9BB63cD','0x889aC9F5c87e6CA075777D5E417b3634D3F84135','0xC2C6A23461FfFC71068a7Cb207336D68c91Fb8bD','0x9D376359b1C4975Aae4907E540C76838547E2Fe2','0x48094F85AEEb2D67D6F1EF2409d600C02859e57c','0xa50085fF1dfa173378e7D26a76117d68D5ebA539','0x70B3b56773aCE43fE86EE1d80CBe03176Cbe4C09','0x663a8C9e88c5cdc565Cc4bF0b2BEC8d862D744a6','0xaa56989Be5E6267fC579919576948DB3e1F10807','0xcE11e14225575945b8E6Dc0D4F2dD4C570f79d9f','0x420CA0f9B9b604cE0fd9C18EF134C705e5Fa3430'],
  ethereum: ['0x00A7BA8Ae7bca0B10A32Ea1f8e2a1Da980c6CAd2','0x3fa73f1e5d8a792c80f426fc8f84fbf7ce9bbcac','0x1e19cf2d73a72ef1332c882f20534b6519be0276','0x32296969ef14eb0c6d29669c550d4a0449130230','0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd','0x6a5ead5433a50472642cd268e584dafa5a394490','0x92762b42a06dcdddc5b7362cfb01e631c4d44b40','0xcfca23ca9ca720b6e98e3eb9b6aa0ffc4a5c08b9','0xde8c195aa41c11a0c4787372defbbddaa31306d2','0xf4c0dd9b82da36c07605df83c8a416f11724d88b','0x6B175474E89094C44Da98b954EedeAC495271d0F','0x06325440D014e39736583c165C2963BA99fAf14E','0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B','0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2','0x5c6ee304399dbdb9c8ef030ab642b10820db8f56','0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84','0x5f1f4e50ba51d723f12385a8a9606afc3a0555f5','0xac16927429c5c7af63dd75bc9d8a58c63ffd0147','0xE95A203B1a91a908F9B9CE46459d101078c2c3cb','0xc128a9954e6c874ea3d62ce62b468ba073093f25','0xa13a9247ea42d743238089903570127dda72fe44','0x7B50775383d3D6f0215A8F290f2C9e2eEBBEceb2','0xae78736Cd615f374D3085123A210448E74Fc6393','0xFe2e637202056d30016725477c5da089Ab0A043A','0xd6F3768E62Ef92a9798E5A8cEdD2b78907cEceF9','0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0','0xfebb0bbf162e64fb9d0dfe186e517d84c395f016','0x83F20F44975D03b1b09e64809B757c47f942BEeA','0x41503C9D499ddbd1dCdf818a1b05e9774203Bf46','0xc2B021133D1b0cF07dba696fd5DD89338428225B','0xdf17c739b666B259DA3416d01f0310a6e429f592','0x8353157092ED8Be69a9DF8F95af097bbF33Cb2aF','0xbE19d87Ea6cd5b05bBC34B564291c371dAe96747','0xb79565c01b7Ae53618d9B847b9443aAf4f9011e7','0x1ce8aAfb51e79F6BDc0EF2eBd6fD34b00620f6dB','0x79c58f70905F734641735BC61e45c19dD9Ad60bC','0x6c1edce139291af5b84fb1e496c9747f83e876c9','0x7e01A500805f8A52Fad229b3015AD130A332B7b3','0xa35b1b31ce002fbf2058d22f30f95d405200a15b','0x1a88Df1cFe15Af22B3c4c783D4e6F7F9e0C1885d','0xe6d8d8aC54461b1C5eD15740EEe322043F696C08','0x0a7cb434f96f65972d46a5c1a64a9654dc9959b2','0xB3AC09cd5201569a821d87446A4aF1b202B10aFd','0x39254033945AA2E4809Cc2977E7087BEE48bd7Ab','0xd7e470043241C10970953Bd8374ee6238e77D735','0xf790870ccF6aE66DdC69f68e6d05d446f1a6ad83','0xc4Ce391d82D164c166dF9c8336DDF84206b2F812','0x57c23c58B1D8C3292c15BEcF07c62C5c52457A42','0x4AB7aB316D43345009B2140e0580B072eEc7DF16','0xf1C9acDc66974dFB6dEcB12aA385b9cD01190E38','0xB36Fc5e542cb4fC562a624912f55dA2758998113','0xa1181481bEb2dc5De0DaF2c85392d81C704BF75D','0x040a9562201B2a3456A7c9052D88ce37e994EE9d','0x09fA04Aac9c6d1c6131352EE950CD67ecC6d4fB9','0x6b31a94029fd7840d780191B6D63Fa0D269bd883','0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee','0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7','0xB266274F55e784689e97b7E363B0666d92e6305B','0x3fCBC480f3Bb3ce8379Bb475D95De603f188D9C0','0xc6132FAF04627c8d05d6E759FAbB331Ef2D8F8fD','0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE','0xaAFD07D53A7365D3e9fb6F3a3B09EC19676B73Ce','0xf0bb20865277aBd641a307eCe5Ee04E79073416C','0x6d98a2b6cdbf44939362a3e99793339ba2016af4','0x78Fc2c2eD1A4cDb5402365934aE5648aDAd094d0','0x2371e134e3455e0593363cBF89d3b6cf53740618','0x9a8bC3B04b7f3D87cfC09ba407dCED575f2d61D8','0xf00B548f1b69cB5EE559d891E03A196FB5101d4A','0xBEEf050ecd6a16c4e7bfFbB52Ebba7846C4b8cD4','0xAC0F906E433d58FA868F936E8A43230473652885','0x85B2b559bC2D21104C4DEFdd6EFcA8A20343361D','0xdA89af5bF2eb0B225d787aBfA9095610f2E79e7D','0x1202F5C7b4B9E47a1A484E8B270be34dbbC75055','0x924359B91Eae607ba539fF6daB5bB914956ae624','0x9396DCbf78fc526bb003665337C5E73b699571EF','0x856c4Efb76C1D1AE02e20CEB03A2A6a08b0b8dC3','0xF5581dFeFD8Fb0e4aeC526bE659CFaB1f8c781dA','0x5aFE3855358E112B5647B952709E6165e1c1eEEe','0x8c213ee79581ff4984583c6a801e5263418c4b86','0x0001A500A6B18995B03f44bb040A5fFc28E45CB0','0x5a98fcbea516cf06857215779fd812ca3bef1b32'],
  arbitrum: ['0xb86AF5eB59A8e871bfA573FA656123ea86F47c3a','0x45d0736D77A72AE2Bd3c5770878bd85b72895057','0xDa492C29D88FfE9B7cbfA6DC068C2f9befaE851b','0x61B3184be0c95324BF00e0DE12765B5f6Cc6b7cA'],
  optimism: ['0x3C12765d3cFaC132dE161BC6083C886B2Cd94934','0x2C7FA89CC5Ea38d4e5193512b9C10808348Ba74F','0xB12A1Be740B99D845Af98098965af761be6BD7fE','0xeD6d021DcA3d31D63997e4985fa6Eb3A2B745472','0x3fa73f1e5d8a792c80f426fc8f84fbf7ce9bbcac'],
  bsc: ['0x223F6A3B8d087741BF99a2531DC53cd15745eBa7','0x9350470389848979fCdFEd28352Ff9e0C9Aa87e9','0xf9D88D200f3D9B45Bd9f8f3ae124f59a4fbdbae5','0xc170908481E928DfA39DE3D0d31bEa6292692F8e'],
}
const SAFE_GNOSIS_TOKENS = {
  ethereum: ['0x2e7E978DA0C53404a8cf66ED4bA2c7706C07B62a','0x93d199263632a4EF4Bb438F1feB99e57b4b5f0BD','0x1e19cf2d73a72ef1332c882f20534b6519be0276','0xbF8868b754A77E90Ea68ffC0b5B10A7c729457E1','0xAC0F906E433d58FA868F936E8A43230473652885','0x5aFE3855358E112B5647B952709E6165e1c1eEEe'], // last = SAFE
  xdai: ['0xaf204776c7245bF4147c2612BF6e5972Ee483701','0xa9B2234773cc6A4F3A34A770C52c931CbA5C24B2','0x2Cd404D9d75436e7d6dDbCcc2fB9cF7C06941BF1','0x00025C729A3364FaEf02c7D1F577068d87E90ba6','0x33C346928eD9249Cf1d5fc16aE32a8CFFa1671AD','0xAD58D2Bc841Cb8e4f8717Cb21e3FB6c95DCBc286'],
}
const AAVE_DAO_TOKENS = {
  ethereum: ['0x00A7BA8Ae7bca0B10A32Ea1f8e2a1Da980c6CAd2','0x3fa73f1e5d8a792c80f426fc8f84fbf7ce9bbcac','0xac16927429c5c7af63dd75bc9d8a58c63ffd0147','0xD1b5651E55D4CeeD36251c61c50C889B36F6abB5','0xaa0C3f5F7DFD688C6E646F66CD2a6B66ACdbE434','0x6c3f90f043a72fa612cbac8115ee7e52bde6e490', '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', '0x4da27a545c0c5B758a6BA100e3a049001de870f5', '0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb', '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f'],
}

const TIME_GATED_ENTITIES = {
  aave:       { safes: AAVE_DAO_SAFES,    tokens: AAVE_DAO_TOKENS,    start: '2023-12-01', end: '2025-07-31' },
  gnosisdao:  { safes: GNOSIS_DAO_SAFES,  tokens: GNOSIS_DAO_TOKENS,  start: '2022-01-01', end: '2025-11-30' },
  safegnosis: { safes: SAFE_GNOSIS_SAFES, tokens: SAFE_GNOSIS_TOKENS, start: '2024-04-01', end: '2025-10-31' },
  ens:        { safes: ENS_SAFES,         tokens: {},                 start: '2023-03-01' },
  cow:        { safes: COW_SAFES,         tokens: {},                 start: '2023-02-01' },
  arbitrum:   { safes: ARBITRUM_SAFES,    tokens: {},                 start: '2025-10-01', end: '2026-04-30' },
  nexus:      { safes: NEXUS_SAFES,       tokens: {},                 start: '2024-11-01' },
}
const toTs = d => Math.floor(new Date(d).getTime() / 1000)
const isEntityActive = (cfg, ts) => ts >= toTs(cfg.start) && (!cfg.end || ts <= toTs(cfg.end))

function activeSafes(api) {
  const ts = api.timestamp || Math.floor(Date.now() / 1000)
  const safes = []
  for (const cfg of Object.values(TIME_GATED_ENTITIES)) if (isEntityActive(cfg, ts)) safes.push(...cfg.safes)
  return safes
}
function activeTokens(api) {
  const ts = api.timestamp || Math.floor(Date.now() / 1000)
  const tokens = [...(PROTOCOL_TOKENS[api.chain] || [])]
  for (const cfg of Object.values(TIME_GATED_ENTITIES)) if (isEntityActive(cfg, ts)) tokens.push(...(cfg.tokens[api.chain] || []))
  return tokens
}

async function getSafesTvl(api) {
  const tokens = activeTokens(api)
  if (!tokens.length) return
  await api.sumTokens({
    owners: activeSafes(api),
    tokens,
    resolveLP: true,
    blacklistedTokens: getCuratedVaults(api.chain),
    permitFailure: true,
  })
}

const AAVE_V3_POOLS = {
  ethereum: ['0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2', '0x4e033931ad43597d96D6bcc25c280717730B58B1'], // main + Lido
  arbitrum: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  xdai: '0xb50201558B00496A145fE76f7424749556E326D8',
  base: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
  polygon: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  avax: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  optimism: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
}
const SPARK_POOLS = {
  ethereum: '0xC13e21B648A5Ee794902342038FF3aDAB66BE987',
  xdai: '0x2Dae5307c5E3FD1CF5A72Cb6F698f915860607e0',
}

const AAVE_V2_POOLS = {
  ethereum: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
  avax: '0x4F01AeD16D97E3aB5ab2B501154DC9bb0F1A5A2C',
  polygon: '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf',
}
const AAVE_RESERVE_DATA_ABI = 'function getReserveData(address asset) view returns (tuple(tuple(uint256 data) configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))'
const AAVE_V2_RESERVE_DATA_ABI = 'function getReserveData(address asset) view returns (tuple(tuple(uint256 data) configuration, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 currentLiquidityRate, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id))'

async function getLendingTvl(api, pools, owners, reserveAbi = AAVE_RESERVE_DATA_ABI) {
  for (const pool of [].concat(pools || [])) {
    if (!pool) continue
    const reserves = await api.call({ target: pool, abi: 'function getReservesList() view returns (address[])', permitFailure: true })
    if (!reserves) continue
    const reserveData = await api.multiCall({ target: pool, abi: reserveAbi, calls: reserves, permitFailure: true })
    const tokens = []
    for (const r of reserveData) if (r) tokens.push(r.aTokenAddress, r.variableDebtTokenAddress)
    await api.sumTokens({ owners, tokens, permitFailure: true })
  }
}

const getAaveV3Tvl = (api, owners) => getLendingTvl(api, AAVE_V3_POOLS[api.chain], owners || activeSafes(api))
const getAaveV2Tvl = (api, owners) => getLendingTvl(api, AAVE_V2_POOLS[api.chain], owners || activeSafes(api), AAVE_V2_RESERVE_DATA_ABI)
const getSparkTvl = (api, owners) => getLendingTvl(api, SPARK_POOLS[api.chain], owners || activeSafes(api))

const UNIV3_NFT = {
  ethereum: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  xdai: '0xAE8fbE656a77519a7490054274910129c9244FA3',
}
async function getUniV3Tvl(api, owners) {
  const nftAddress = UNIV3_NFT[api.chain]
  if (!nftAddress) return
  const factory = await api.call({ target: nftAddress, abi: 'address:factory', permitFailure: true })
  if (!factory) return // position manager not deployed yet at this (historical) block
  await sumTokens2({ api, owners: owners || activeSafes(api), resolveUniV3: true, uniV3ExtraConfig: { nftAddress } })
}

const STAKEWISE_V3_VAULTS = {
  ethereum: [
    { vault: '0xAC0F906E433d58FA868F936E8A43230473652885', asset: ADDRESSES.ethereum.WETH }, // Genesis Vault - ETH
    { vault: '0xe6d8d8aC54461b1C5eD15740EEe322043F696C08', asset: ADDRESSES.ethereum.WETH }, // Chorus One MEV Max - ETH
    { vault: '0x3fCBC480f3Bb3ce8379Bb475D95De603f188D9C0', asset: ADDRESSES.ethereum.WETH }, // Stakeway Private Vault 1 - ETH
    { vault: '0xB36Fc5e542cb4fC562a624912f55dA2758998113', asset: ADDRESSES.ethereum.WETH }, // Serenita Vault - ETH
    { vault: '0xB266274F55e784689e97b7E363B0666d92e6305B', asset: ADDRESSES.ethereum.WETH }, // Stakewise vault - ETH
  ],
  xdai: [{ vault: '0x4b4406Ed8659D03423490D8b62a1639206dA0A7a', asset: ADDRESSES.xdai.GNO }], // Genesis Vault - GNO
}
async function getStakewiseV3Tvl(api) {
  const vaults = STAKEWISE_V3_VAULTS[api.chain]
  if (!vaults) return
  for (const { vault, asset } of vaults) {
    const shares = await api.multiCall({ target: vault, abi: 'function getShares(address) view returns (uint256)', calls: activeSafes(api), permitFailure: true })
    let total = 0n
    for (const s of shares) if (s) total += BigInt(s)
    if (total === 0n) continue
    const assets = await api.call({ target: vault, abi: 'function convertToAssets(uint256) view returns (uint256)', params: [total.toString()], permitFailure: true })
    if (assets) api.add(asset, assets)
  }
}

const SAFE_TOKEN_LOCK = '0x0a7cB434f96F65972D46A5c1A64a9654dC9959b2'
const SAFE_TOKEN = '0x5aFE3855358E112B5647B952709E6165e1c1eEEe'
async function getSafeLockedTvl(api) {
  if (api.chain !== 'ethereum') return
  const users = await api.multiCall({ target: SAFE_TOKEN_LOCK, abi: 'function getUser(address) view returns (uint96 locked, uint96 unlocked, uint32 unlockStart, uint32 unlockEnd)', calls: activeSafes(api), permitFailure: true })
  let locked = 0n
  for (const u of users) if (u) locked += BigInt(u.locked || 0)
  if (locked > 0n) api.add(SAFE_TOKEN, locked.toString())
}

// Maker DSR: DAI deposited in the Dai Savings Rate via the DsrManager
// DAI = pieOf(safe) * pot.chi() / 1e27
const DSR_MANAGER = '0x373238337Bfe1146fb49989fc222523f83081dDb'
const MAKER_POT = '0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7'
async function getMakerDsrTvl(api) {
  if (api.chain !== 'ethereum') return
  const pies = await api.multiCall({ target: DSR_MANAGER, abi: 'function pieOf(address) view returns (uint256)', calls: activeSafes(api), permitFailure: true })
  let pie = 0n
  for (const p of pies) if (p) pie += BigInt(p)
  if (pie === 0n) return
  const chi = await api.call({ target: MAKER_POT, abi: 'uint256:chi', permitFailure: true })
  if (!chi) return
  api.add(ADDRESSES.ethereum.DAI, (pie * BigInt(chi) / 10n ** 27n).toString())
}

// StakeDAO liquid-locker gauges: gauge token is ERC20 1:1 with the underlying sdToken but unpriced,
// so read the staked balance and add as underlying.
const STAKEDAO_GAUGES = {
  ethereum: [
    { gauge: '0x7f50786A0b15723D741727882ee99a0BF34e3466', underlying: '0xD1b5651E55D4CeeD36251c61c50C889B36F6abB5' }, // sdCRV-gauge -> sdCRV
  ],
}
async function getStakeDaoGaugeTvl(api) {
  const gauges = STAKEDAO_GAUGES[api.chain]
  if (!gauges) return
  const owners = activeSafes(api)
  const calls = []
  for (const g of gauges) for (const o of owners) calls.push({ target: g.gauge, params: [o], underlying: g.underlying })
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: calls.map((c) => ({ target: c.target, params: c.params })), permitFailure: true })
  bals.forEach((b, i) => { if (b && b !== '0') api.add(calls[i].underlying, b) })
}

const MAKER = {
  cdpManager: '0x5ef30b9986345249bc32d8928B7ee64DE9435E39',
  vat: '0x35D1b3F3D7966A1DFe207aa4514C12a259A0492B',
  proxyRegistry: '0x4678f0a6958e4D2Bc4F1BAF7Bc52E8F3564f3fE4',
  ilkRegistry: '0x5a464C28D19848f44199D003BeF5ecc87d090F87',
}
const ILK_INFO_ABI = 'function info(bytes32) view returns (string name, string symbol, uint256 class, uint256 dec, address gem, address pip, address join, address xlip)'
async function getMakerCdpTvl(api) {
  if (api.chain !== 'ethereum') return
  const safes = activeSafes(api)
  if (!safes.length) return
  const proxies = await api.multiCall({ target: MAKER.proxyRegistry, abi: 'function proxies(address) view returns (address)', calls: safes })
  const guys = safes.concat(proxies.filter((p) => p && !/^0x0+$/.test(p)))
  // discover each owner's CDPs via the manager
  const firsts = await api.multiCall({ target: MAKER.cdpManager, abi: 'function first(address) view returns (uint256)', calls: guys })
  const cdps = []
  for (const f of firsts) {
    let cdp = f
    while (cdp && cdp !== '0') {
      cdps.push(cdp)
      const l = await api.call({ target: MAKER.cdpManager, abi: 'function list(uint256) view returns (uint256 prev, uint256 next)', params: [cdp] })
      cdp = l.next
    }
  }
  if (!cdps.length) return
  const ilks = await api.multiCall({ target: MAKER.cdpManager, abi: 'function ilks(uint256) view returns (bytes32)', calls: cdps })
  const urns = await api.multiCall({ target: MAKER.cdpManager, abi: 'function urns(uint256) view returns (address)', calls: cdps })
  const pos = await api.multiCall({ target: MAKER.vat, abi: 'function urns(bytes32, address) view returns (uint256 ink, uint256 art)', calls: cdps.map((_, i) => ({ params: [ilks[i], urns[i]] })) })
  const ilkState = await api.multiCall({ target: MAKER.vat, abi: 'function ilks(bytes32) view returns (uint256 Art, uint256 rate, uint256 spot, uint256 line, uint256 dust)', calls: ilks.map((ilk) => ({ params: [ilk] })) })
  const info = await api.multiCall({ target: MAKER.ilkRegistry, abi: ILK_INFO_ABI, calls: ilks.map((ilk) => ({ params: [ilk] })) })
  for (let i = 0; i < cdps.length; i++) {
    const ink = BigInt(pos[i].ink)
    if (ink === 0n) continue
    const dec = Number(info[i].dec)
    // vat stores ink as wad (1e18) -> back to gem native decimals
    api.add(info[i].gem, (dec === 18 ? ink : (ink * 10n ** BigInt(dec)) / 10n ** 18n).toString())
    // net out DAI debt = art * rate / 1e27
    const debt = (BigInt(pos[i].art) * BigInt(ilkState[i].rate)) / 10n ** 27n
    if (debt > 0n) api.add(ADDRESSES.ethereum.DAI, (-debt).toString())
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
  const bpts = new Set(activeTokens(api).map((a) => a.toLowerCase()))
  const len = await api.call({ target: booster, abi: 'function poolLength() view returns (uint256)', permitFailure: true })
  if (!len) return // Booster not deployed yet at this (historical) block
  const infos = await api.multiCall({ target: booster, abi: AURA_POOL_INFO_ABI, calls: Array.from({ length: Number(len) }, (_, i) => i), permitFailure: true })
  const pools = infos.filter((i) => i && bpts.has(i.lptoken.toLowerCase()))
  const calls = []
  for (const p of pools) for (const owner of activeSafes(api)) calls.push({ bpt: p.lptoken, target: p.crvRewards, params: [owner] })
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: calls.map((c) => ({ target: c.target, params: c.params })), permitFailure: true })
  calls.forEach((c, i) => { if (bals[i] && bals[i] !== '0') api.add(c.bpt, bals[i]) })
}

// Nexus Mutual staked NXM — find the safe's StakingNFTs, then let Nexus's own
// StakingViewer report each position's active stake (in NXM).
const NEXUS_STAKING_NFT = '0xcafeA508a477D94c502c253A58239fb8F948e97f'
const NEXUS_STAKING_PRODUCTS = '0xcafea573fBd815B5f59e8049E71E554bde3477E4'
const NXM_TOKEN = '0xd7c49CEE7E9188cCa6AD8FF264C1DA2e69D4Cf3B'

async function getNexusStakedNXM(api) {
  if (api.chain !== 'ethereum') return
  const totalSupply = await api.call({ target: NEXUS_STAKING_NFT, abi: 'uint256:totalSupply', permitFailure: true })
  if (!totalSupply) return // contract not deployed at this block

  const ids = Array.from({ length: Number(totalSupply) }, (_, i) => i + 1)
  const owners = await api.multiCall({ target: NEXUS_STAKING_NFT, abi: 'function ownerOf(uint256) view returns (address)', calls: ids, permitFailure: true })
  const safes = new Set(activeSafes(api).map((a) => a.toLowerCase()))
  const ours = ids.filter((_, i) => owners[i] && safes.has(owners[i].toLowerCase()))
  if (!ours.length) return

  // read stake from the StakingPool contracts since the StakingViewer was deployed later
  const poolIds = await api.multiCall({ target: NEXUS_STAKING_NFT, abi: 'function stakingPoolOf(uint256) view returns (uint256)', calls: ours, permitFailure: true })
  const pools = await api.multiCall({ target: NEXUS_STAKING_PRODUCTS, abi: 'function stakingPool(uint256) view returns (address)', calls: poolIds.map((p) => ({ params: [p] })), permitFailure: true })
  const uniqPools = [...new Set(pools.filter(Boolean))]
  if (!uniqPools.length) return
  const actives = await api.multiCall({ abi: 'uint256:getActiveStake', calls: uniqPools.map((p) => ({ target: p })), permitFailure: true })
  const supplies = await api.multiCall({ abi: 'uint256:getStakeSharesSupply', calls: uniqPools.map((p) => ({ target: p })), permitFailure: true })
  const poolActive = {}, poolSupply = {}
  uniqPools.forEach((p, i) => { poolActive[p] = actives[i]; poolSupply[p] = supplies[i] })
  // deposits sit in 91-day tranches; up to 8 are active at once
  const ts = api.timestamp || Math.floor(Date.now() / 1000)
  const firstTranche = Math.floor(ts / (91 * 86400))
  const calls = []
  ours.forEach((id, i) => { if (pools[i]) for (let t = 0; t < 8; t++) calls.push({ target: pools[i], params: [id, firstTranche + t], pool: pools[i] }) })
  const deps = await api.multiCall({ abi: 'function deposits(uint256, uint256) view returns (uint256 lastAccNxmPerRewardShare, uint256 pendingRewards, uint256 stakeShares, uint256 rewardsShares)', calls: calls.map((c) => ({ target: c.target, params: c.params })), permitFailure: true })
  let nxmWei = 0n
  deps.forEach((d, i) => {
    if (!d || !d.stakeShares || d.stakeShares === '0') return
    const act = poolActive[calls[i].pool], sup = poolSupply[calls[i].pool]
    if (!act || !sup || sup === '0') return
    nxmWei += (BigInt(d.stakeShares) * BigInt(act)) / BigInt(sup)
  })
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

      // kpk Fund (OIV)
      if (OIV_CHAINS.includes(chain)) {
        await getAaveV3Tvl(api, OIV_SAFES)
        await getSparkTvl(api, OIV_SAFES)
      }

      // Zodiac-managed Safe TVL
      if (ZODIAC_CHAINS.includes(chain)) {
        await getSafesTvl(api)
        await getAaveV3Tvl(api)
        await getAaveV2Tvl(api)
        await getSparkTvl(api)
        await getStakewiseV3Tvl(api)
        await getAuraTvl(api)
        await getNexusStakedNXM(api)
        await getUniV3Tvl(api)
        await getSafeLockedTvl(api)
        await getMakerDsrTvl(api)
        await getMakerCdpTvl(api)
        await getStakeDaoGaugeTvl(api)
      }
    }
  }
}

module.exports = exportObjects