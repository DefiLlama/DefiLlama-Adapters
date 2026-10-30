const ADDRESSES = require('../../projects/helper/coreAssets.json')

// Additional sumTokens registry configs, split out of registries/sumTokens.js to keep that file manageable.
// Same config shape as the `configs` object in sumTokens.js.
module.exports = {
  // ----- migrated 2026-10-22 -----
  "BlastNYAN": {
    "misrepresentedTokens": true,
    "methodology": "Counts as TVL the ETH only. blNYAN and LP assets deposited are counted as Pool2 and staking Respectively",
    "blast": {
      "tvl": { "__resolveUnknownTokenLP": true, "owners": ["0x46B3a66ef4fAC801B455884035eF2862F01e6158", "0xBC8a7a845cC7A8246EB34856Afe6f1a3d62BD9C6", "0x00066Ed6c2F7d6CC6e66c678BaEE2C8683B632e6"], "tokens": [ADDRESSES.blast.WETH], "useDefaultCoreAssets": true, "lps": ["0x0E9309f32881899F6D4aC2711c6E21367A84CA26"] },
      "pool2": { "__resolveUnknownTokenLP": true, "owners": ["0xF63Ef9F4320f9d16731a40ff1f58a966ee086806"], "tokens": ["0x0E9309f32881899F6D4aC2711c6E21367A84CA26"], "useDefaultCoreAssets": true, "lps": ["0x0E9309f32881899F6D4aC2711c6E21367A84CA26"] },
      "staking": { "__resolveUnknownTokenLP": true, "owners": ["0xA76D6dc805d0EbEcb3787c781ce3A18feEF020cb", "0x46B3a66ef4fAC801B455884035eF2862F01e6158"], "tokens": ["0x9aAC39ca368D27bf03887CCe32f28b44F466072F"], "useDefaultCoreAssets": true, "lps": ["0x0E9309f32881899F6D4aC2711c6E21367A84CA26"] },
    },
  },
  "MeowMiner": {
    "methodology": "counts the number of MEOW tokens in the Meow Miner contract.",
    "start": "2024-03-13",
    "avax": { "__resolveUnknownTokenLP": true, "owner": "0xc0F9a97E46Fb0f80aE39981759eAB4a61eE36459", "tokens": ["0x8aD25B0083C9879942A64f00F20a70D3278f6187"], "lps": ["0xbbf8e4b9AD041edE1F5270CAf5b7B41F0e55f719"], "useDefaultCoreAssets": true },
  },
  "OCTOplace": {
    "kava": { "owner": "0x61F91266F6abEA61447E00EB781A3c38a3D1b925", "tokens": [ADDRESSES.null, "0xfa9343c3897324496a05fc75abed6bac29f8a40f"] },
    "theta": { "owner": "0x6e4c614da85DD861e08f84706742239dBA892Df1", "tokens": [ADDRESSES.null] },
  },
  "ada-harvest": {
    // Vault funds may later be deployed into Minswap/Liqwid, which have their own adapters
    "doublecounted": true,
    "methodology": "Counts only the ADA (lovelace) locked in the ADA Harvest PlutusV3 vault contract. Non-ADA assets are excluded. The vault earns flash loan fees and ADA staking rewards.",
    "cardano": { "scripts": ["addr1z9mhqtrnwpc76frp2xtgtfyt4lwzzdfwsye0uh335kycu4sgucktr6zta3rtuqlqam4395sry3vl5c7ss08m50qtnj6s5usxpa"], "tokens": ["lovelace"] },
  },
  "alyx-finance": {
    "misrepresentedTokens": true,
    "methodology": "Total amount of tokens in treasury and masterchef contract",
    "bsc": {
      "tvl": { "__resolveUnknownTokenLP": true, "tokens": ["0xf5Ea0B5AafC6eDACA15909a02C1e16bCaCd74C1e"], "owner": "0x576182b7a1b0bC67701ead28a087228c50Aa0982", "useDefaultCoreAssets": true },
      "pool2": { "__resolveUnknownTokenLP": true, "tokens": ["0xf5Ea0B5AafC6eDACA15909a02C1e16bCaCd74C1e"], "owner": "0x7Bd2f7641b875872c7c04ee3B426F753C7093aD5", "useDefaultCoreAssets": true },
      "staking": { "__resolveUnknownTokenLP": true, "tokens": ["0x2701C7cBf3220FFF6e6CEaabbCD9B932Eb11E3Ff"], "owner": "0x7Bd2f7641b875872c7c04ee3B426F753C7093aD5", "useDefaultCoreAssets": true, "lps": ["0xf5Ea0B5AafC6eDACA15909a02C1e16bCaCd74C1e"] },
    },
  },
  "applepie": {
    "methodology": "First Crosschain Pool as a Service Miner. Twist to generate 10%/daily reward.",
    "bsc": {
      "tvl": { "tokensAndOwners": [
        [ADDRESSES.null, "0xBc4719D9F347EB1d9551d71862d2Cb4db99916f9"],
        [ADDRESSES.bsc.CAKE, "0x4356c2d63e9376024e7E953e18cfC7125e643eE5"],
        [ADDRESSES.bsc.USDT, "0x6E8e3F4C058C5e0422E971CE27B0fc91175F4018"],
      ] },
      "staking": { "__resolveUnknownTokenLP": true, "owners": ["0x77F7285d23ca4A9FdAe238d29a20a38482d9B4B7"], "tokens": ["0x574f75bc522CB42ec2365dc54485D471f2eFb4B6"], "lps": ["0xf11A3f0EdB8D7B2ef36A4acDCf50D9214eC23FD1"], "useDefaultCoreAssets": true },
    },
  },
  "blastname": {
    "blast": {
      "tvl": { "tokensAndOwners": [
        [ADDRESSES.blast.WETH, "0xb5510aB65418d53961A9fd32A8E6343f942E20Aa"],
        [ADDRESSES.blast.USDB, "0xb5510aB65418d53961A9fd32A8E6343f942E20Aa"],
        [ADDRESSES.blast.WETH, "0x9d5d8Ca81FF96b676603a69282290c0D957C7060"],
      ] },
      "pool2": { "__resolveUnknownTokenLP": true, "useDefaultCoreAssets": true, "tokensAndOwners": [
        ["0x389daCE33EF8a7E020196F388cF107A881799872", "0xb5510aB65418d53961A9fd32A8E6343f942E20Aa"], // BND-USDB
        ["0xdD9B243A18Fb4e46AefFa26D42797f0Be9F9AfC8", "0xb5510aB65418d53961A9fd32A8E6343f942E20Aa"], // BNS-USDB
        ["0x44EA24695ECB6c09C3aB756224757a5D68707618", "0xb5510aB65418d53961A9fd32A8E6343f942E20Aa"], // BND-JUICE
        ["0xb6851BF01D81be84d13e92aDFE6F64A7D02A643f", "0xb5510aB65418d53961A9fd32A8E6343f942E20Aa"], // BND-BNS
      ] },
    },
  },
  "bryanonbase": {
    "misrepresentedTokens": true,
    "methodology": "Counts as TVL the ETH asset deposited through StakingETH Contract, and we count Staking and Pool2 parts in the same way",
    "base": {
      "tvl": { "__resolveUnknownTokenLP": true, "owners": ["0x9acDDdbEBED00107B3eF2931607F131F392f6996", "0xCf4543777342D93BEde085292E46D847BC59dc07", "0xC0c8BCAf6c1baE2d4A35f4D89A8EAc9A9E5D4Db0"], "tokens": [ADDRESSES.base.WETH] },
      "pool2": { "__resolveUnknownTokenLP": true, "owners": ["0x5DFF152F94E0EADeD36201f1D5AC37382f3Cf51D", "0xCf4543777342D93BEde085292E46D847BC59dc07"], "tokens": ["0xbCA1647EA6C7eB6916a5B33E21467ff78Bf5Ec55"], "useDefaultCoreAssets": true },
      "staking": { "__resolveUnknownTokenLP": true, "owners": ["0x32e5594F14de658b0d577D6560fA0d9C6F1aa724", "0xC0c8BCAf6c1baE2d4A35f4D89A8EAc9A9E5D4Db0"], "tokens": ["0xB75445A717D5A8c268f37045162837CFe72Ac337"], "lps": ["0xbCA1647EA6C7eB6916a5B33E21467ff78Bf5Ec55"], "useDefaultCoreAssets": true },
    },
  },
  "business-builders-nfts": {
    "misrepresentedTokens": true,
    "methodology": "Staking: we include locked tokens on the rewards contracts as staking",
    "meter": {
      "staking": { "__resolveUnknownTokenLP": true, "owner": "0x103ed6fb861a2651ff59f0852d3739c18d45cd9b", "tokens": ["0x6cfe9adad5215195c1aa9755daed29360e6ab986"], "useDefaultCoreAssets": true, "lps": ["0x88cdb3e764dedcc2e3a1642957ebd513765b252a"] },
    },
    "polygon": {
      "tvl": { "__empty": true },
      "staking": { "__resolveUnknownTokenLP": true, "owner": "0x0455e50b2822e6f3d8dc01246aca8378a8992466", "tokens": ["0xF305012EA754252184f1071C86ae99fAc5B40320"], "useDefaultCoreAssets": true, "lps": ["0x1Df39b565652eACa24dfB16A07dcfe4d7f8f02c3"] },
    },
  },
  "citrea": {
    "ethereum": { "tokensAndOwners": [
      [ADDRESSES.ethereum.USDC, "0xdaa289CC487Cf95Ba99Db62f791c7E2d2a4b868E"],
      [ADDRESSES.ethereum.USDT, "0x6925ccD29e3993c82a574CED4372d8737C6dbba6"],
      [ADDRESSES.ethereum.WBTC, "0x2c01390E10e44C968B73A7BcFF7E4b4F50ba76Ed"],
    ] },
    "bitcoin": { "owners": ["bc1pl7grnght2uhp75wm03djde5a56syp06ssdjf7ucm4wkq0tetpqas5e20e9"] },
  },
  "darkness": {
    "cronos": {
      "tvl": { "__resolveUnknownTokenLP": true, "owner": "0x92631e0e84ff01853ef1bb88fc9c9f7d1e1af1ca", "tokens": [
        ADDRESSES.cronos.WCRO_1,
        ADDRESSES.cronos.dai,
        ADDRESSES.cronos.USDC,
        "0x6582c738660bf0701f05b04dce3c4e5fcfcda47a",
        ADDRESSES.cronos.USDT,
        "0x83b2ac8642ae46fc2823bc959ffeb3c1742c48b5",
        ADDRESSES.cronos.WBTC,
        "0x9d3bbb0e988d9fb2d55d07fe471be2266ad9c81c",
        "0x1ecaf6a3551e5822f142c9689d8f36a9b5f68217",
        "0xfa202a63234a7089eddbfeee83c378ba248f0e9a",
      ] },
      "pool2": { "__resolveUnknownTokenLP": true, "owner": "0x63Df75d039f7d7A8eE4A9276d6A9fE7990D7A6C5", "tokens": [
        "0xbfaab211c3ea99a2db682fbc1d9a999861dcba2d",
        "0x8c183c81a5ae3e7a46ecaac17c4bf27a6a40bbe8",
        "0xa4aa24b8e855052071df60e174219e6c8fee45a3",
        "0xd9debaab797cb92c257b2988aafa92c728b124e6",
      ], "useDefaultCoreAssets": true },
      "staking": { "__resolveUnknownTokenLP": true, "owner": "0xA93248C548Ac26152F3b4F201C9101f4e032074e", "tokens": ["0xe727240728c1a5f95437b8b50afdd0ea4ae5f0c8"], "lps": ["0xd9debaab797cb92c257b2988aafa92c728b124e6"], "useDefaultCoreAssets": true },
    },
  },
  "djed-alliance": {
    "methodology": "The TVL of Djed is the reserve belonging to the deployment. The TVL within a given blockchain is the sum of the TVLs of all known Djed deployments within that blockchain.",
    "cardano": { "owner": "addr1z8mcpc26j64fmhhd6sv5qj5mk9xqnfxgm6k8zmk7h2rlu4qm5kjdmrpmng059yellupyvwgay2v0lz6663swmds7hp0qhxg9gt", "tokens": ["lovelace"] },
  },
  "everstrike": {
    "methodology": "Counts USDC and USDT balances held by Everstrike's custody contract on each supported chain. Includes native and legacy bridged USDC where both are deployed.",
    "ethereum": { "owner": "0x558FCAcE07fBf6A3D4449240685f29Ad6669fd81", "tokens": [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT] },
    "optimism": { "owner": "0xB9C1EC4647301828Bb10f6B52584201D1C16bC8F", "tokens": [ADDRESSES.optimism.USDC, ADDRESSES.optimism.USDC_CIRCLE, ADDRESSES.optimism.USDT] },
    "bsc": { "owner": "0x777108936Ed411b0598c1E35266FD92e76Cf834d", "tokens": [ADDRESSES.bsc.USDC, ADDRESSES.bsc.USDT] },
    "polygon": { "owner": "0x4f48c6a228a0bf0c03dc53765930c0cb06f1ecd0", "tokens": [ADDRESSES.polygon.USDC, ADDRESSES.polygon.USDC_CIRCLE, ADDRESSES.polygon.USDT] },
    "base": { "owner": "0xe26a4561b3d213f1479196e43fc532fb89142abd", "tokens": [ADDRESSES.base.USDC] },
    "arbitrum": { "owner": "0xAC66779A566143069A8E8590bDeaBe685054927F", "tokens": [ADDRESSES.arbitrum.USDC, ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.USDT] },
  },
  "firebot": {
    "methodology": "Counts the number of FBX and EP tokens in the Vault contracts.",
    "polygon": {
      "tvl": { "__empty": true },
      "staking": { "__resolveUnknownTokenLP": true, "tokensAndOwners": [
        ["0x60Ed6aCEF3a96F8CDaF0c0D207BbAfA66e751af2", "0x60Ed6aCEF3a96F8CDaF0c0D207BbAfA66e751af2"], // EP held by itself
        ["0xD125443F38A69d776177c2B9c041f462936F8218", "0x960d43BE128585Ca45365CD74a7773B9d814dfBE"], // FBX in fire vault
      ], "lps": ["0x41D9DE53EBF26F766229E42Aa02904eB2495E397"], "coreAssets": ["0xD125443F38A69d776177c2B9c041f462936F8218"], "restrictTokenRatio": 100 },
      "pool2": { "tokensAndOwners": [["0xcffbfa978ac3fb10e829ca6b763c307daafe8a77", "0x92a9180af33531A5d78d81D90AFc0523dc6c62c9"]] },
    },
  },
  "insuredefi": {
    "start": "2017-12-18",
    "ethereum": { "owner": "0xF4b2aa60Cd469717857a8A4129C3dB9108f54D74", "token": "0xcb86c6a22cb56b6cf40cafedb06ba0df188a416e" },
  },
  "minerPepe": {
    "methodology": "MinerPepe  the first mining PEPE Meme Coin on Binance Smart Chain. Miners enjoy 12% daily returns in BNB and MPEPE tokens",
    "bsc": {
      "tvl": { "tokensAndOwners": [
        [ADDRESSES.null, "0x93Fb89601B5C3253b50c8d650C11bDfe5FB7EE3F"],
        [ADDRESSES.bsc.CAKE, "0x18951EEe359A98fFC22b7F22641Db6E7f8571A5A"],
      ] },
      "staking": { "__resolveUnknownTokenLP": true, "owners": ["0x26e6B07013748a1C9C12ff17A51A95e40456689C"], "tokens": ["0x6d306C2C9CD931160763D99376a68C14D33DC954"], "lps": ["0xd60f323965eD3D6b90e66eA676414A31D53A0b98"], "useDefaultCoreAssets": true },
    },
  },
  "nest": {
    "methodology": "Counts NEST tokens that have been staked in the nest dapp",
    "ethereum": {
      "tvl": { "owners": ["0xE544cF993C7d477C7ef8E91D28aCA250D135aa03"], "tokens": ["0x0316EB71485b0Ab14103307bf65a021042c6d380"] },
      "staking": { "token": "0x04abEdA201850aC0124161F037Efd70c74ddC74C", "owners": [
        "0xaA7A74a46EFE0C58FBfDf5c43Da30216a8aa84eC",
        "0x505eFcC134552e34ec67633D1254704B09584227",
        "0x9a5C88aC0F209F284E35b4306710fEf83b8f9723",
        "0x34B931C7e5Dc45dDc9098A1f588A0EA0dA45025D",
        "0xE544cF993C7d477C7ef8E91D28aCA250D135aa03",
      ] },
    },
    "bsc": {
      "tvl": { "owners": ["0x9484f12044b9d5707AfeaC5BD02b5E0214381801"], "tokens": [ADDRESSES.bsc.USDT] },
      "staking": { "token": "0x98f8669F6481EbB341B522fCD3663f79A3d1A6A7", "owners": ["0x09CE0e021195BA2c1CDE62A8B187abf810951540"] },
    },
    "polygon": {
      "tvl": { "__empty": true },
      "staking": { "token": "0x98f8669F6481EbB341B522fCD3663f79A3d1A6A7", "owners": ["0x09CE0e021195BA2c1CDE62A8B187abf810951540"] },
    },
    "kcc": {
      "tvl": { "__empty": true },
      "staking": { "token": "0x98f8669F6481EbB341B522fCD3663f79A3d1A6A7", "owners": ["0x7DBe94A4D6530F411A1E7337c7eb84185c4396e6"] },
    },
  },
  "olympulsex": {
    "pulse": {
      "tvl": { "__empty": true },
      "staking": { "__resolveUnknownTokenLP": true, "owner": "0xf1Bc988e7EaBA7a2dbF0121E6ad9BEA82A1AB1ff", "tokens": ["0xBB366A397D7d4d2BEDABD9139D4c32a8826605Ed"], "lps": ["0x2d593b3472d6a5439bC1523a04C2aec314CBc44c"], "useDefaultCoreAssets": true },
    },
  },
  "pacifica": {
    "solana": { "tokenAccounts": ["72R843XwZxqWhsJceARQQTTbYtWy6Zw9et2YV4FpRHTa", "FvGqozihHY4Mmh4Nmx2rkXnMDcumiXEbjxA9oRu3mUeJ"], "solOwners": ["9sSr35zwnFTuv2kZ86i55sR9dqQLTG663homexrLYgYu"] },
  },
  "penpad": {
    "methodology": "Counts liquidty on the staking",
    "scroll": { "__resolveUnknownTokenLP": true, "tokensAndOwners": [
      [ADDRESSES.null, "0x8F53fA7928305Fd4f78c12BA9d9DE6B2420A2188"],
      [ADDRESSES.scroll.WETH, "0x88844c8f2b895792532AaE2a0F877208248F3585"],
      [ADDRESSES.scroll.USDT, "0xC72a7a21e3E12594c75Bc6418224E812e16a027E"],
      [ADDRESSES.scroll.USDC, "0xDc1FCFe40A5Cf9745cef0B75428eE28E81D7cC56"],
      [ADDRESSES.scroll.STONE, "0x20DE0435e5674Ef15E78adA570159984524B9E8F"],
      ["0xc4d46E8402F476F269c379677C99F18E22Ea030e", "0x0C530882C0900b13FC6E8312B52c26e7a5b8e505"], // pufETH
      ["0xa25b25548B4C98B0c7d3d27dcA5D5ca743d68b7F", "0x27D2B6cEcd759D289B0227966cC6Fe69Cc2b0424"], // wrsETH
      ["0xf610A9dfB7C89644979b4A0f27063E9e7d7Cda32", "0x96cB437706111548c3D2e1Dc21E5Ab69E5dA057a"], // wstETH
      ["0xcA0bFd5f735924e34Cc567146989e467fFbbCe1a", "0x25D710AC957A54bdD6578b5DC8187a355c805edb"], // weETH (Scroll Bridged)
      [ADDRESSES.scroll.WBTC, "0x1C04CedF3Aac5fE35A7811689Ac6Da25b01BDc81"], // WBTC
      ["0x01f0a31698c4d065659b9bdc21b3610292a1c506", "0x016d036ec56eed17b5f9dfa212e27f8e260cc7d0"], // weETH (Stargate Bridged)
      ["0x3ba89d490ab1c0c9cc2313385b30710e838370a4", "0xde12ec22c5c4eeeeaf8afdc4ec735d75cf9d15a5"], // SolvBTC.b
    ] },
  },
  "phission-finance": {
    "methodology": "Total amount of WETH split, plus the value of Pool2",
    "start": "2022-08-30",
    "ethereum": {
      "tvl": { "owner": "0x5b38A73f9dB3F5e12BB4dCb5a434FB3bd3972E53", "tokens": [ADDRESSES.ethereum.WETH] },
      "pool2": { "__resolveUnknownTokenLP": true, "owner": "0x569a157eac744b87a42314e8fc03a2e648ea33a2", "tokens": ["0x18174E80335B9fCbc8ac0AB7f40F25aba878ccCC"], "useDefaultCoreAssets": true },
    },
  },
  "privacy-cash": {
    "methodology": "Total value of all coins held in the smart contracts of the protocol",
    "solana": {
      "owners": ["2vV7xhCMWRrcLiwGoTaTRgvx98ku98TRJKPXhsS8jvBV"],
      "tokens": [
        ADDRESSES.solana.USDC,
        ADDRESSES.solana.USDT,
        "A7bdiYdS5GjqGFtxf17ppRHtDKPkkRqbKtR27dxvQXaS", // ZEC
        "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp", // ORE
        "sTorERYB6xAZ1SSbwpK3zoK2EEwbBrc7TZAzg1uCGiH", // legacy STORE
        "storenSbvkfzircixnaosc5CbzNZVrHJ6S3EKrS1yqR", // STORE
        "9BEcn9aPEmhSPbPQeFGjidRiEKki46fVQDyPpSQXPA2D", // jlUSDC
        "2uQsyo1fXXQkDtcpXnLofWy88PxcvnfH2L8FPSE62FVU", // jlwSOL
      ],
      "solOwners": ["4AV2Qzp3N4c9RfzyEbNZs2wqWfW4EwKnnxFAZCndvfGh"],
    },
    "base": { "owners": ["0x7F673790C08Ddf27c0Aa6fa9526CCC8dAaB081Ec", "0xe91dd4AB03909f5CEb87f42B4308B222995a905b"], "tokens": [ADDRESSES.null, ADDRESSES.base.USDC] },
    "ethereum": { "owners": ["0x77A10AE3E513c2D73D73eb52212c6918C8830dd0", "0xC88F4dF2B6EdDd6B6Bdf95A0177f50C90Fa7527f"], "tokens": [ADDRESSES.null, ADDRESSES.ethereum.USDT] },
    "bsc": { "owners": ["0x22D8509E7AF58b1EaFB311f8F76E81dC3a391F77", "0x9926A40B0879b36F9586c4285f0fae597bd56313"], "tokens": [ADDRESSES.null, ADDRESSES.bsc.USDT] },
    "robinhood": { "owners": ["0xEC5266c9e44631e1ba22FD6377C38130c1F3B738", "0xBB0C7F576B7bdAa8f2a119cb295076aCD0C9013f"], "tokens": [ADDRESSES.null, ADDRESSES.robinhood.USDG] },
  },
  "qilin": {
    "ethereum": { "owner": "0x57A0B07dcD834cAbB844BEc8E7903A3B2faE6245", "tokens": [ADDRESSES.ethereum.USDC] },
  },
  "ribbon-earn": {
    "ethereum": {
      "tvl": { "tokensAndOwners": [
        [ADDRESSES.ethereum.USDC, "0x84c2b16FA6877a8fF4F3271db7ea837233DFd6f0"], // rearnUSDC
        [ADDRESSES.ethereum.STETH, "0xCE5513474E077F5336cf1B33c1347FDD8D48aE8c"], // rearnstETH
      ] },
      "borrowed": { "__empty": true },
    },
  },
  "scorch": {
    "methodology": "TVL is the value of SPL and Token-2022 balances controlled by the authority PDA derived from the Scorch program on Solana.",
    // PDA: findProgramAddress(['authority'], SCoRcH8c2dpjvcJD6FiPbCSQyQgu3PcUAWj2Xxx3mqn)
    "solana": { "owner": "EHcege7dok1iYs7SxL2XzDPvhg6XzMVcx2V5SkMUurJP" },
  },
  "sprout": {
    "methodology": "TVL is the wINJ, USDC and native INJ reserves held by the three Sprout LaunchpadCore bonding curve contracts (current and two previous versions). SPROUT held as quote-asset reserves is reported under staking. Launched tokens are excluded, and liquidity that graduated to Choice is not counted.",
    "injective": {
      "tvl": { "owners": ["0x1333692eB905823df110762525c26f7489BB9300", "0xd948740da926E8908A08414879490d0D8F96D463", "0xeBF62508F322137EE0986935Ee3b4A60a3F0D227"], "tokens": ["0x0000000088827d2d103ee2d9A6b781773AE03FfB", "0xa00C59fF5a080D2b954d0c75e46E22a0c371235a", ADDRESSES.null] },
      "staking": { "owners": ["0x1333692eB905823df110762525c26f7489BB9300", "0xd948740da926E8908A08414879490d0D8F96D463", "0xeBF62508F322137EE0986935Ee3b4A60a3F0D227"], "tokens": ["0x503f2A7bAc1E2ff2800Aa92EdB82abeF0bFA631E"] },
    },
  },
  "tonnel": {
    "ton": {
      "tvl": {
        "owners": [
          "EQBemaU1eAM-fJP7tSniJGEmltPjitgGnlrP6UaXI7nzmEuV", // 5 TON
          "EQBZ0-2-isPEN_lIyg9eqXO_RFWrl_PWIJq5K6SVcUwne23W", // 50 TON
          "EQBYpQiQMwGBMzhOlJ52e4yXmcKCB_5uTTJ7bVSGqr-8YANi", // 250 TON
          "EQB-s4WzIgGP9U6DNlFH_kSn0JuxhBCBXr_rKz2ztEiozTto", // 1000 TON
          "EQD7U_FPYRFTGgiqrpiKh8_giyrIQHZtokUKvz2EmWvlmViC", // 500k GRAM
          "EQCZXyOWRih3jtyhdCA7DV7KXluNbzqeIpJPnRkF4KEE1STp", // 30k GRAM
          "EQC14SC0-P0iOXzn1971HVIDsCzQ0LllY0y5O7EE2pMLe9pT", // 100 DFC
        ],
        "tokens": [
          ADDRESSES.null,
          "0:b8ef4f77a17e5785bd31ba4da50abd91852f2b8febee97ad6ee16d941f939198", // GRAM
          "0:f6eb371de82aa9cfb5b22ca547f31fdc0fa0fbb41ae89ba84a73272ff0bf2157", // DFC
        ],
        "onlyWhitelistedTokens": true,
      },
      "staking": {
        "owners": [
          "EQDTs-yjPLn7XzaRRq8pjp7H8Nw4y_OJ51Bk2dcrPlIYgwtV", // 10000 TONNEL
          "EQAgoyECSzCIFTFkMIvDLgdUE3D9RxGfYQQGfxy3lBBc_Ke_", // 1000 TONNEL
          "EQDzAhS3Ev8cxEBJ96MIqPjxyD_k0L3enzDWnQ3Z-4tUK1h5", // 200 TONNEL
          "EQASyc8d2DjZHrFevnF432NRLc4qwh6HGUPAbMvbofMkeRZl", // 50 TONNEL
          "EQCNoApBzMacKKdTwcvi1iOx78e98bTSaN1Gx_nnmd3Ek5Yn", // 66 TONNEL
        ],
        "tokens": ["0:cd0efe78bff4c4539b76eab17293296c74f42cbf99ec499687fefec94893ed32"], // TONNEL
        "onlyWhitelistedTokens": true,
      },
    },
  },
  "touch-fan": {
    "methodology": "We count the ETH on 0x9842114F1d9c5286A6b8e23cF0D8142DAb2B3E9b and 0xC612eD7a1FC5ED084C967bD71F1e0F0a338Cf816",
    "misrepresentedTokens": true,
    "era": {
      "tvl": { "owners": ["0x9842114F1d9c5286A6b8e23cF0D8142DAb2B3E9b", "0xC612eD7a1FC5ED084C967bD71F1e0F0a338Cf816"], "tokens": [ADDRESSES.null] },
      "staking": { "__resolveUnknownTokenLP": true, "owners": ["0x9b470d1d40F437cAb76ea8fC80BC3b761e96D44D", "0x13B8C03990b7d782cB9c3ebF7E2aA5Dc28f6133B", "0x38a22eFB9eE73EdABdc4A15B17D28b70bA56BDA3"], "tokens": ["0x14acccd04393f26ba155e5402aa6fddbb8e2254a"], "lps": ["0xB075F49F4Bea5204d22B42E8d442e8E9e3400AF8"], "abis": { "getReservesABI": "function getReserves() external view  returns (uint,uint)" }, "useDefaultCoreAssets": true },
      "pool2": { "__resolveUnknownTokenLP": true, "owners": ["0x26854C6A28864D7E84893F45EDf366eE2494B09a"], "tokens": ["0xB075F49F4Bea5204d22B42E8d442e8E9e3400AF8"], "resolveLP": true, "abis": { "getReservesABI": "function getReserves() external view  returns (uint,uint)" }, "useDefaultCoreAssets": true },
    },
  },
  "turboflow": {
    "methodology": "TVL counts USDT and USDC balances held by TurboFlow on (i) on-chain bridge contracts on BSC and Solana that receive user deposits, and (ii) protocol-operated MPC custody wallets (Fireblocks) that back user deposits and settlement obligations.",
    "start": "2025-10-19",
    "bsc": { "owners": [
      "0x145CD0d5C3dD0eF1405dCf1b4D2BCE7c611625dB", // Bridge contract (user deposits)
      "0x8757f9E16d775759671e95e50D749CECCDA375AE", // Fireblocks MPC vault (SIG)
      "0x077Ab3f5D4372cA14c6AA417215Af3d91B55bAFc", // Fireblocks MPC vault (TFUSERS)
    ], "tokens": [ADDRESSES.bsc.USDC, ADDRESSES.bsc.USDT] },
    "solana": { "tokenAccounts": [
      "9ayXbTyhkJ49WtG6DA2PCN6EAKtM8DCneMzhJPTMRWcj", // Bridge USDC SPL account
      "6hVp2UaWWQwGo2c6yHj39WJWDNenR48GsLGKPzSa7EU2", // Bridge USDT SPL account
      "2ZEku38cWzGqMzhKG6tnpC42godiy8hjGFMZwf7uvPTc", // Fireblocks vault (SIG) USDC SPL account
      "FYmWdMq9KT87jpZomMQR7Y2r4a2KbEiXkoDJcHMAP1vq", // Fireblocks vault (SIG) USDT SPL account
      "3uCQ76uwDRur1udh4EPjzN84K2vrrcnyH2AnuUjFWNAF", // Fireblocks vault (TFUSERS) USDC SPL account
      "8ckjipCeccH3RrcPyXU8xCBGHRK9qgSPuU47ZfBKWGKC", // Fireblocks vault (TFUSERS) USDT SPL account
    ] },
  },
  "winr-protocol": {
    "methodology": "TVL is the tracked Arbitrum value of WINR held in the protocol bankroll vault and escrow contract. The bankroll holds liquidity provider funds backing all JustBet gameplay; the escrow holds user balances, settled on-chain via merkle roots. Prior-generation USDC contracts and the separate staking contract are excluded from this export.",
    "arbitrum": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0x5eD22F7693fea5A0B45dB31771aa94E941b6df8a", "0xD75a51364440dAF83B78B9888D2b8F28eaC0D280"], "tokens": [ADDRESSES.winr.WINR] }, // bankroll, escrow
    },
  },
  "wstgbp": {
    "methodology": "TVL is the tGBP reserve held by the Ethereum wstGBP contract. wstGBP is a non-rebasing token whose redemption value accrues through an oracle-updated NAV: minting deposits tGBP, while redeeming burns wstGBP and pays tGBP at NAV less the configured redemption fee. Canonically bridged wstGBP on L2s and sidechains is excluded because the corresponding Ethereum wstGBP is locked in bridge escrow and remains backed by the same tGBP reserve.",
    "start": "2026-04-10",
    "ethereum": { "owner": "0x57C3571f10767E49C9d7b60feb6c67804783B7aE", "tokens": ["0x27f6c8289550fCE67f6B50BeD1F519966aFE5287"] },
  },
  "zk-money": {
    "start": "2026-09-25",
    "methodology": "TVL is the DAI held in zk.money's Ethereum portal, which backs private DAI balances on Aztec. USDC and USDT deposits are swapped to DAI before entering the portal.",
    "ethereum": { "owner": "0xdf410ad448A0f7165181FBdB32f8896f4a0d9449", "tokens": [ADDRESSES.ethereum.DAI] },
  },
  "aeva-bridge": {
    "methodology": "TVL counts the USDG locked in the Aeva bridge's Hyperlane collateral router on Robinhood Chain, which backs aeUSD on Aeva Mainnet. $AEVA locked in the AEVA router is Aeva's own token and is counted under staking.",
    "start": "2026-09-28",
    "robinhood": {
      "tvl": { "owner": "0x856a649A84C8c6bB1e2541097bB293af5DD57857", "tokens": [ADDRESSES.robinhood.USDG] }, // USDG router
      "staking": { "__staking": ["0xA880B6e6511DAF5A0Bdde96EE8b36D8004D9D7eD", "0xe8729Dc9dCA85167e06b7E9c66a58b22457c5F30"] }, // AEVA router, AEVA
    },
  },
  "hectagon": {
    "methodology": "Total Value Lock in Hectagon protocol is calculated by sum of: Treasury locked value",
    "bsc": {
      "tvl": { "owner": "0x4059c4a0b8a2B528C4f2E101A3bB8fB169aBa4fB", "tokens": ["0xc7cee4cea7c76e11e9f5e5e5cbc5e3b798a1c4d0", ADDRESSES.bsc.BUSD] },
      "staking": { "__staking": ["0x7d31ed03c2442f9ffc4f22d90772ee1f32fa9b0d", "0x343915085b919fbd4414F7046f903d194c6F60EE"] }, // gHECTA, HECTA
    },
  },
  "drefinance": {
    "sonic": {
      "tvl": { "tokensAndOwners": [
        [ADDRESSES.sonic.USDC_e, "0xc589858dA047A4789e099FA2CfD1D974D14F344B"],
        [ADDRESSES.sonic.scUSD, "0xc589858dA047A4789e099FA2CfD1D974D14F344B"],
        ["0xd4eee4c318794bA6FFA7816A850a166FFf8310a9", "0xc589858dA047A4789e099FA2CfD1D974D14F344B"], // DRE
        ["0x18b6963ebe82b87c338032649aaad4eec43d3ecb", "0xc589858dA047A4789e099FA2CfD1D974D14F344B"], // DRE-USDC LP
        ["0x88640D840614BB63cfb1545897D6d228B381C659", "0xc589858dA047A4789e099FA2CfD1D974D14F344B"], // DRE-scUSD LP
        ["0xF8232259D4F92E44eF84F18A0B9877F4060B26F1", "0xb692e2706b628998B4403979D9117Ed746bf8128"], // old DRE in old deposit contract
        ["0xB781C624397C423Cb62bAe9996cEbedC6734B76b", "0xb692e2706b628998B4403979D9117Ed746bf8128"], // old DRE-USDC LP in old deposit contract
      ] },
      "staking": { "__staking": ["0x21Cfa934CEa191fBD874ee8B1B6CE2B2224De653", "0xd4eee4c318794bA6FFA7816A850a166FFf8310a9"] },
      "pool2": { "owners": ["0xc589858dA047A4789e099FA2CfD1D974D14F344B", "0xb692e2706b628998B4403979D9117Ed746bf8128"], "tokens": ["0x18b6963ebe82b87c338032649aaad4eec43d3ecb", "0xB781C624397C423Cb62bAe9996cEbedC6734B76b", "0x88640D840614BB63cfb1545897D6d228B381C659"], "resolveLP": true },
    },
  },
  "zenith": {
    "methodology": "TVL is comprised of tokens deposited to Zenith protocol as collateral, similar to Compound Finance and other lending protocols the borrowed tokens are not counted as TVL.",
    "ethereum": {
      "tvl": { "owners": ["0xb9e7008FA856D66680BeE9E0a24da407D9d7fAD5"], "tokens": [ADDRESSES.null, ADDRESSES.ethereum.STETH, ADDRESSES.ethereum.RETH] },
      "pool2": { "owners": ["0xb9e7008FA856D66680BeE9E0a24da407D9d7fAD5"], "tokens": ["0xAC0155CBd306e41C1287E2c53e1306178397b823"], "resolveLP": true },
    },
  },
  "optidoge": {
    "optimism": {
      "tvl": { "owner": "0xc911523c466b4E1dADE1bac9A2D4ceA3F9E1A2ae", "tokens": [ADDRESSES.null] },
      "pool2": { "owners": ["0x7Dbe3714371bB9FF72369AFc88703AbD2694E322"], "tokens": ["0x91d62ac270e5bb371a25f81c9e74f16b53448efd"], "resolveLP": true },
      "staking": { "__staking": ["0x015C4b2250F7aAC41274FeB95eFf00016C0CE08c", "0x93d97dbb1bb5290c78c23885e8026047dc8998a8"] },
    },
  },
  "photon-protocol": {
    "bsc": {
      "tvl": { "tokens": [ADDRESSES.bsc.BUSD], "owner": "0x0f90591b01DE6F832e8B8E4ec3525efD423BCaD1" }, // treasury
      "staking": { "__staking": ["0x81177472Ce36A9b1AB573804CD215C72cEb76F36", "0x2F1305F0619ADa14688A4291953bd7d284f9C2a5"] }, // staking contract, PHOTON
    },
  },
  "arrland": {
    "methodology": "Counts total value locked as the $RUM token staking, LP token staking",
    "polygon": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0x111e34bA90D1dE9a2A57f987b5711C71FA4c0Fa0"], "tokens": ["0x14e5386f47466a463f85d151653e1736c0c50fc3"] },
      "pool2": { "owners": ["0xEAf6E84B4E4C2Ce70a80fd781B6A7f177E7b60F5", "0xb94380939A15C574FE22B04FC95Ec5CCaAD783b8"], "tokens": ["0x6495b61b8088a0a82de737ffb142136119b016e6", "0x464b7eb1c66d662e652dfbfced35d465498ad9ac"], "resolveLP": true },
    },
  },
  "parcl-v3": {
    "timetravel": false,
    "solana": { "tokenAccounts": ["Ai9AuTfGncuFxEknjZT4HU21Rkv98M1QyXpbW9Xct6LK"] }
  },
  "nirvana-v2": {
    "timetravel": false,
    "solana": { "tokenAccounts": ["FhTJEGXVwj4M6NQ1tPu9jgDZUXWQ9w2hP89ebZHwrJPS"] }
  },
  "asol": {
    "timetravel": false,
    "methodology": "aSOL TVL is computed by looking at the token balances of the accounts holding the stake pool tokens backing the aSOL Crate. The token accounts come from https://asol.so/#/admin.",
    "solana": {
      "tokenAccounts": [
        "4Bo98VrTYkHLbE9zoXx3tCD3qEDcGZFCZFksgyYPKdG9",
        "7n1AmrpywC84MdALohPBipAx1SYhjpSLjYFb2EuTV9wm"
      ]
    }
  },
  "dflow-prediction-market": {
    "solana": {
      "tokenAccounts": [
        "C6tLX41pT7ke9LtJ25cdhzPxVbngWD6KsDaEFTSC4SKE",
        "82TCjUf5YjrbJro4XdEfeCokvpQrNUntD97Zjrip8knr"
      ]
    }
  },
  "bulk-trade": {
    "timetravel": false,
    "methodology": "Counts USDC held in BULK's Solana mainnet custody vault, which backs collateral deposited for trading and margin.",
    "solana": { "tokenAccounts": ["HwdwwKH1tMXo7ggTKcA5cdQrpcgqSoVib2eQh3BiyEQL"] }
  },
  "stakenova": {
    "methodology": "TVL represents all user-deposited SOL plus unclaimed USDC rewards. Calculated by reading vault token balances directly on-chain.",
    "solana": {
      "tokenAccounts": [
        "7MBk8DXFnZCpKDiSwEMFwtyDNqxXMdUSgm52fQ3Chit4", // INF_VAULT
        "HVpnjWTJCDvHL2pL2LeE5Y3mLEE4hP4MwpZpBvBLHQuA" // USDC_VAULT
      ]
    }
  },
  "pokeliquid": {
    "timetravel": false,
    "methodology": "TVL is the sum of USDC deposited in the liquidity pool, fee vault (which holds user margin collateral), and insurance fund.",
    "solana": {
      "tokenAccounts": [
        "H1YCpzUXcoYFnek3Qc8VtekAe4gDTDNZZDVLwYuC9J1C", // LP Vault
        "BFm4z6Z2H84GrpcKkydmE1qZVidwuj2sP3N3wTNZemJt", // Fee Vault
        "266CZZpRb1PFDGQf4bNE5ASPVxAUkon6tv6BvRYpP7x9" // Insurance Fund
      ]
    }
  },
  "arrowpad-fun": {
    // ArrowPad.fun launchpad on Robinhood Chain: every launch seeds the full
    // token supply as single-sided Uniswap V3 liquidity and the LP NFT is locked
    // forever in the ArrowPadLocker (no withdrawal function).
    "doublecounted": true,
    "methodology": 'TVL is the WETH side of the permanently locked Uniswap V3 LP positions held by the ArrowPadLocker.',
    "robinhood": {
      owners: ['0xBa9C247041a7715591c7B48f20dFBa520a7d68E9'], // ArrowPadLocker
      resolveUniV3: true,
      uniV3WhitelistedTokens: [ADDRESSES.robinhood.WETH],
      uniV3ExtraConfig: { nftAddress: '0x73991a25c818bf1f1128deaab1492d45638de0d3' },
    }
  },
  "prisma-pad": {
    // Prismapad launchpad on Stable (chain id 988).
    // v1 (bonding curve, legacy):
    // https://stablescan.xyz/address/0xdcb881fc8b472eb7797687b237e6cb123c425ff7#code
    // v2 / v3 (direct-to-DEX — every token launches straight into an official
    // StableSwap (Uniswap v3) pool; the LP position is locked in the launchpad).
    // v3 supersedes v2 for new launches; v2 stays live for its existing tokens:
    // https://stablescan.xyz/address/0xa96d9eadc4d6eed50fa408a33585c5f1df039db5#code
    // https://stablescan.xyz/address/0x7c1628681c18884a1a90977fdae034282892c842#code
    "doublecounted": true,
    "methodology": 'TVL is the USDT0 side of Prismapad liquidity: the bonding-curve reserves held by the legacy v1 launchpad, plus the USDT0 in the locked v3 NFTs',
    "stable": {
      owners: ['0xdcb881fc8b472eb7797687b237e6cb123c425ff7', '0xa96d9eadc4d6eed50fa408a33585c5f1df039db5', '0x7c1628681c18884a1a90977fdae034282892c842'],
      resolveUniV3: true,
      tokens: [ADDRESSES.stable.USDT0],
      uniV3WhitelistedTokens: [ADDRESSES.stable.USDT0],
    }
  },
  "katana": {
    "timetravel": false,
    "solana": {
      "tokenAccounts": [
        "8vyTqVVPmJfqFexRcMBGDAHoSCyZ52RC5sRVhYzbfU4j",
        "7zJVLbx3DjjwkoD6eUGk4cgoBv2JR3RW67c3ff8URXYh",
        "2CD9R7K7AjAswjTJDmdf9HyUZQztfck1B22h9WUJeTeh",
        "377U1dX3mRd96BeoRkpmsJC67wnVDqTpi1u6dALkR9V5",
        "DUrVECpx5EkVW12eWvpjR8Xk2AgNS3epqEQ6p63SujQb",
        "6F5XPaeEiAwfmD5Rv9TAt4x7VhVaEU7qV9q6MSrvbozC",
        "6sSZcCfPaeKfGnTRXX3Ybd97eqVnYg1TLfytwArfUVz",
        "E2VKdRPvfMXBj3ePMbuZPRz1fwT7z7Gd9pnh8R3n25eW",
        "AV3pjicfiJQoR96mGT9byQLbUAXL2Zi1a74wis9Ezh5S",
        "5aJ5NzNmLfVLbqcbvYsW1e1GdEccrkFkLZwLWVLrmm4A",
        "2sKjWWYcdBmUQbdHBJXKbJBwHB2G9JB7mRnLYuEtgRcp"
      ]
    }
  },
  "kyros": {
    "timetravel": false,
    "doublecounted": true,
    "methodology": "The TVL is calculated by summing all restaked assets.",
    "solana": {
      "tvl": {
        "tokenAccounts": [
          "CRFtzwkekKorgdTRSdvsYeqL1vEuVvwGRvweuWCyaRt3", // jitoSOL @ kySOL Vault
          "HzwDsHJBtuSTRx3VV6bz1R8yrLywxKgfGte7FASXU8Gd", // JTO @ kyJTO Vault
          "HmozbbPg927xtj6Z4oMUBUBSGKA2fDRmUFqWfJFEidbC" // kySOL @ Drip
        ]
      },
      "staking": {
        "tokenAccounts": ["Ct8QS77TMFF98gvN1ZXrNjGqUmdkJQACi5Xi2sCTSC7D"] // KYROS @ kyKYROS Vault
      }
    }
  },
  "hubble": {
    "timetravel": false,
    "solana": {
      "tvl": {
        "owners": [
          "HZYHFagpyCqXuQjrSCN2jWrMHTVHPf9VWP79UGyvo95L", // collateralVaultAuthority
          "8WrqMitrgjzfqaPJ5PK6X3VT6B1Z8rDgQQny2aWwvJ8q" // psmVaultAuthority
        ]
      },
      "staking": {
        "tokensAndOwners": [
          ["HBB111SCo9jkCejsZfz8Ec8nH7T6THF8KEKSnvwT6XK6", "GbjqYShCb3LeyXuxkjLBGcmrWakqePPpMoHraQJcTtJJ"]
        ]
      }
    }
  },
  "boop-fun": {
    "solana": {
      "tvl": {
        "tokensAndOwners": [
          [ADDRESSES.solana.SOL, "GVVUi6DaocSEAp8ATnXFAPNF5irCWjCvmPCzoaGAf5eJ"]
        ]
      },
      "staking": {
        "tokenAccounts": ["BZgWzdxHqytYrn3EuvkozE1Hg38CD5ajjxBppRHuV1nQ"]
      }
    }
  },
  "death-fun": {
    "start": 1748022475,
    "methodology": "Death.fun TVL is the native ETH held in the Death.fun game contract, which serves as the house bankroll used to pay player cashouts. Direct bankroll deposits and owner withdrawals affect TVL because they change the contract balance, but they are treasury movements rather than game outcomes.",
    "abstract": {
      "owners": ["0x27EDd16eE56958fddCBA08947f12C43DDeC2B20C"],
      "tokens": [ADDRESSES.null]
    }
  },
  "meme-wallet": {
    "methodology": "counts the TVL of tokens created by meme factory",
    "start": "2024-12-10",
    "wc": {
      "owner": "0xda601604ecd1cb5f12e4522f1138d5419daf0ee0",
      "tokens": [ADDRESSES.wc.WLD]
    }
  },
  "tbtc": {
    "timetravel": false,
    "methodology": "BTC on btc chain",
    "ethereum": { "__empty": true },
    "bitcoin": { "__btcBook": "tBTC" }
  },
  "vishwa": {
    "bitcoin": { "__btcBook": "vishwa" },
    "sui": { "__empty": true }
  },
  "deversifi": {
    "methodology": "Counts the tokens on 0x5d22045daceab03b158031ecb7d9d06fad24609b and on rhino.fi cross-chain swap smart-wallet contracts",
    "ethereum": {
      "owner": "0x5d22045daceab03b158031ecb7d9d06fad24609b",
      "tokens": [
        ADDRESSES.null,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.DAI,
        "0xd26114cd6EE289AccF82350c8d8487fedB8A0C07",
        "0x940a2db1b7008b6c776d4faaca729d6d4a4aa551",
        ADDRESSES.ethereum.YFI,
        ADDRESSES.ethereum.MKR,
        ADDRESSES.ethereum.WBTC,
        "0xe41d2489571d322189246dafa5ebde1f4699f498",
        "0xcc80c051057b774cd75067dc48f8987c4eb97a5e",
        ADDRESSES.ethereum.USDC,
        "0x419d0d8bdd9af5e606ae2232ed285aff190e711b",
        "0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d",
        "0xba100000625a3754423978a60c9317c58a424e3d",
        ADDRESSES.ethereum.UNI,
        "0xc00e94cb662c3520282e6f5717214004a7f26888",
        "0xec67005c4e498ec7f55e092bd1d35cbc47c91892",
        ADDRESSES.ethereum.BAT,
        ADDRESSES.ethereum.LINK,
        ADDRESSES.ethereum.SNX,
        ADDRESSES.ethereum.AAVE,
        "0xeef9f339514298c6a857efcfc1a762af84438dee",
        "0xa117000000f279d81a1d3cc75430faa017fa5a2e",
        "0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b",
        "0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9",
        ADDRESSES.ethereum.LIDO,
        "0xdddddd4301a082e62e84e43f474f044423921918",
        "0xaaaebe6fe48e54f431b0c390cfaf0b017d09d42d",
        ADDRESSES.ethereum.MATIC,
        "0x0a0e3bfd5a8ce610e735d4469bc1b3b130402267",
        ADDRESSES.ethereum.INU,
        ADDRESSES.ethereum.CRV,
        "0x03ab458634910aad20ef5f1c8ee96f1d6ac54919",
        "0x0391d2021f89dc339f60fff84546ea23e337750f",
        ADDRESSES.ethereum.TOKE,
        "0x33349b282065b0284d756f0577fb39c158f935e6",
        "0x767fe9edc9e0df98e07454847909b5e959d7ca0e",
        "0x25f8087ead173b73d6e8b84329989a8eea16cf73",
        "0xdddd0e38d30dd29c683033fa0132f868597763ab",
        ADDRESSES.ethereum.WSTETH,
        ADDRESSES.ethereum.SUSHI
      ]
    },
    "arbitrum": {
      "owner": "0x10417734001162Ea139e8b044DFe28DbB8B28ad0",
      "tokens": [
        ADDRESSES.null,
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.USDT,
        ADDRESSES.optimism.DAI
      ]
    },
    "polygon": {
      "owners": [
        "0xBA4EEE20F434bC3908A0B18DA496348657133A7E",
        "0xda7EeB4049dA84596937127855B50271ad1687E7"
      ],
      "tokens": [
        ADDRESSES.null,
        ADDRESSES.polygon.USDC,
        ADDRESSES.polygon.USDT,
        ADDRESSES.polygon.DAI
      ]
    }
  },
  "allchainbridge": {
    "methodology": "Assets staked in the pool and trading contracts",
    "ethereum": {
      "owner": "0x92e929d8b2c8430bcaf4cd87654789578bb2b786",
      "tokens": [
        ADDRESSES.null,
        ADDRESSES.ethereum.BUSD,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.DAI,
        "0x0316EB71485b0Ab14103307bf65a021042c6d380",
        ADDRESSES.ethereum.WETH,
        "0x0bb217e40f8a5cb79adf04e1aab60e5abd0dfc1e",
        "0x6f259637dcd74c767781e37bc6133cd6a68aa161"
      ]
    },
    "bsc": {
      "owner": "0x1ed5685f345b2fa564ea4a670de1fde39e484751",
      "tokens": [
        ADDRESSES.null,
        ADDRESSES.bsc.BUSD,
        ADDRESSES.bsc.USDC,
        ADDRESSES.bsc.USDT,
        ADDRESSES.bsc.DAI,
        ADDRESSES.bsc.WBNB,
        ADDRESSES.bsc.BTCB,
        ADDRESSES.bsc.ETH,
        "0xe64e30276c2f826febd3784958d6da7b55dfbad3",
        "0xba2ae424d960c26247dd6c32edc70b295c744c43"
      ]
    },
    "heco": {
      "owner": "0xaeAE2CBb1E024E27e80cc61eE9A8B300282209B4",
      "tokens": [
        ADDRESSES.null,
        ADDRESSES.heco.USDC_HECO,
        ADDRESSES.heco.USDT,
        "0x0298c2b32eae4da002a15f36fdf7615bea3da047",
        "0x64ff637fb478863b7468bc97d30a5bf3a428a1fd",
        "0x329dda64Cbc4DFD5FA5072b447B3941CE054ebb3"
      ]
    },
    "okexchain": {
      "owner": "0x37809F06F0Daf8f1614e8a31076C9bbEF4992Ff9",
      "tokens": [
        ADDRESSES.null,
        ADDRESSES.okexchain.USDC,
        ADDRESSES.okexchain.USDT,
        ADDRESSES.okexchain.ETHK,
        ADDRESSES.okexchain.OKB
      ]
    },
    "polygon": {
      "owner": "0x242Ea2A8C4a3377A738ed8a0d8cC0Fe8B4D6C36E",
      "tokens": [
        ADDRESSES.null,
        ADDRESSES.polygon.USDC,
        ADDRESSES.polygon.USDT,
        ADDRESSES.polygon.WMATIC_2
      ]
    },
    "fantom": {
      "owner": "0x8f957ed3f969d7b6e5d6df81e61a5ff45f594dd1",
      "tokens": [
        ADDRESSES.null,
        "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
        "0x049d68029688eabf473097a2fc38ef61633a3c7a",
        "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
        "0x74b23882a30290451A17c44f4F05243b6b58C76d"
      ]
    },
    "kava": {
      "owner": "0xa62a9c5cC8B92E00AB269BcA9f5539617AA65863",
      "tokens": [
        ADDRESSES.null
      ]
    }
  },
  "whitewhale": {
    "hallmarks": [
      ["2022-05-07", "UST depeg"]
    ],
    "terra": {
      "owner": "terra1ec3r2esp9cqekqqvn0wd6nwrjslnwxm7fh8egy"
    }
  },
  "rainbow": {
    "timetravel": false,
    "ethereum": {
      "owner": "0x6BFaD42cFC4EfC96f529D786D643Ff4A8B89FA52",
      "fetchCoValentTokens": true,
      "logCalls": true
    },
    "near": {
      "owners": ["factory.bridge.near", "fast.bridge.near"],
      "tokens": [
        "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
        "aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near"
      ]
    }
  },
  "ngmizone": {
    "methodology": "Totals the $NTRN balance held by the NGMI.zone contract.",
    "neutron": {
      "owner": "neutron1xcjn7d2f6p2kjqdxtvm4dzeqay98hcmtts92uugw7efnz4zc05csyhhvq6",
      "tokens": ["untrn"]
    }
  },
  "kopi": {
    "kopi": {
      "owner": "kopi14t4jnhmjejj08x5w8f4t0r3lv820gvh85xw8np",
      "blacklistedTokens": [
        // excluding projects own tokens
        "ukopi",
        "ukusd"
      ]
    }
  },
  "extended": {
    "ethereum": {
      "owners": ["0x1cE5D7f52A8aBd23551e91248151CA5A13353C65"],
      "tokens": [ADDRESSES.ethereum.USDC]
    },
    "starknet": {
      "owners": [
        "0x062da0780fae50d68cecaa5a051606dc21217ba290969b302db4dd99d2e9b470",
        "0x060c0f8cdfa28e8a3f719d1e2def2599785d7557a5650794c150d9b557603e48"
      ],
      "tokens": [
        ADDRESSES.starknet.USDC,
        ADDRESSES.starknet.USDC_CIRCLE,
        ADDRESSES.starknet.WBTC,
        ADDRESSES.starknet.ETH,
        ADDRESSES.starknet.USDT
      ]
    },
    "arc": {
      "owners": [
        "0x4445AACaCC2dE174B77b37Eb27529ce0B36bC580",
        "0x89103959Eef431bEa308027b8A5073c5ddc867A2"
      ],
      "tokens": [
        ADDRESSES.arc.USDC,
        ADDRESSES.arc.WETH,
        ADDRESSES.arc.cirBTC
      ]
    }
  },
  "Duality": {
    "timetravel": false,
    "methodology": "TVL in Duality module.",
    "neutron": {
      "owner": "neutron1n58mly6f7er0zs6swtetqgfqs36jaarqlplf59"
    }
  },
  "dogeswap": {
    "ethereum": {
      "tvl": { "__empty": true },
      "staking": {
        "tokensAndOwners": [
          ["0xb4FBed161bEbcb37afB1Cb4a6F7cA18b977cCB25", "0xd688F6223c11F601420d716d88d8C1AD018711B8"], // DOGES
          ["0xa9fb117df8d8a8e3db2f456078320548d6e107fa", "0x7a455859C5Bbe2a87c9c76FB684174B6cd31242E"]  // PUPPY
        ]
      }
    }
  },
  "calculated-finance": {
    "kujira": {
      "owner": "kujira1e6fjnq7q20sh9cca76wdkfg69esha5zn53jjewrtjgm4nktk824stzyysu"
    },
    "osmosis": {
      "owner": "osmo1zacxlu90sl6j2zf90uctpddhfmux84ryrw794ywnlcwx2zeh5a4q67qtc9"
    },
    "neutron": {
      "owner": "neutron1cc5adah6vekm2nz5yp6qs332g704q90jgc03v8zxpzaqh297jvqqae2eez"
    },
    "archway": {
      "owner": "archway1delmknshmvfuhv07uetes90crzrj32za23pgd9cvjtc5mrzfjauq3jqrpa"
    }
  },
  "keiko": {
    "methodology": "TVL consists of HYPE, wstHYPE, LHYPE, PURR and UBTC tokens deposited as collateral to mint KEI stablecoin in the protocol's vaults",
    "hyperliquid": {
      "owner": "0x67e70761E88C77ffF2174d5a4EaD42B44Df3F64a",
      "tokens": [
        ADDRESSES.hyperliquid.WHYPE, // HYPE
        ADDRESSES.hyperliquid.wstHYPE, // wstHYPE
        "0x5748ae796AE46A4F1348a1693de4b50560485562", // LHYPE
        "0x9b498C3c8A0b8CD8BA1D9851d40D186F1872b44E", // PURR
        "0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463" // UBTC
      ]
    }
  },
  "bridgekek": {
    "ethereum": {
      "owner": "0x53423b7bf445997e76ad94f820f0559e451a98e2",
      "tokens": ["0x67954768E721FAD0f0f21E33e874497C73ED6a82"],
      "logCalls": true
    },
    "kekchain": { "__empty": true }
  },
  "tornado": {
    "ethereum": {
      "tokensAndOwners": [
        // ETH: 0.1 / 1 / 10 / 100
        [ADDRESSES.null, "0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc"],
        [ADDRESSES.null, "0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936"],
        [ADDRESSES.null, "0x910cbd523d972eb0a6f4cae4618ad62622b39dbf"],
        [ADDRESSES.null, "0xa160cdab225685da1d56aa342ad8841c3b53f291"],
        // DAI
        [ADDRESSES.ethereum.DAI, "0xD4B88Df4D29F5CedD6857912842cff3b20C8Cfa3"],
        [ADDRESSES.ethereum.DAI, "0xFD8610d20aA15b7B2E3Be39B396a1bC3516c7144"],
        [ADDRESSES.ethereum.DAI, "0x07687e702b410Fa43f4cB4Af7FA097918ffD2730"],
        [ADDRESSES.ethereum.DAI, "0x23773E65ed146A459791799d01336DB287f25334"],
        // USDT
        [ADDRESSES.ethereum.USDT, "0x169AD27A470D064DEDE56a2D3ff727986b15D52B"],
        [ADDRESSES.ethereum.USDT, "0x0836222F2B2B24A3F36f98668Ed8F0B38D1a872f"],
        [ADDRESSES.ethereum.USDT, "0xF67721A2D8F736E75a49FdD7FAd2e31D8676542a"],
        [ADDRESSES.ethereum.USDT, "0x9AD122c22B14202B4490eDAf288FDb3C7cb3ff5E"],
        // USDC
        [ADDRESSES.ethereum.USDC, "0xd96f2B1c14Db8458374d9Aca76E26c3D18364307"],
        [ADDRESSES.ethereum.USDC, "0x4736dCf1b7A3d580672CcE6E7c65cd5cc9cFBa9D"],
        [ADDRESSES.ethereum.USDC, "0xD691F27f38B395864Ea86CfC7253969B409c362d"],
        // WBTC
        [ADDRESSES.ethereum.WBTC, "0x178169B423a011fff22B9e3F3abeA13414dDD0F1"],
        [ADDRESSES.ethereum.WBTC, "0x610B717796ad172B316836AC95a2ffad065CeaB4"],
        [ADDRESSES.ethereum.WBTC, "0xbB93e510BbCD0B7beb5A853875f9eC60275CF498"],
        // cDAI
        ["0x5d3a536e4d6dbd6114cc1ead35777bab948e3643", "0x22aaA7720ddd5388A3c0A3333430953C68f1849b"],
        ["0x5d3a536e4d6dbd6114cc1ead35777bab948e3643", "0x03893a7c7463AE47D46bc7f091665f1893656003"],
        ["0x5d3a536e4d6dbd6114cc1ead35777bab948e3643", "0x2717c5e28cf931547B621a5dddb772Ab6A35B701"],
        ["0x5d3a536e4d6dbd6114cc1ead35777bab948e3643", "0xD21be7248e0197Ee08E0c20D4a96DEBdaC3D20Af"]
      ]
    },
    "bsc": {
      "owners": [
        "0x84443CFd09A48AF6eF360C6976C5392aC5023a1F", // 0.1 BNB
        "0xd47438C816c9E7f2E2888E060936a499Af9582b3", // 1 BNB
        "0x330bdFADE01eE9bF63C209Ee33102DD334618e0a", // 10 BNB
        "0x1E34A77868E19A6647b1f2F47B51ed72dEDE95DD" // 100 BNB
      ],
      "tokens": [ADDRESSES.null]
    },
    "polygon": {
      "owners": [
        "0x1E34A77868E19A6647b1f2F47B51ed72dEDE95DD", // 100
        "0xdf231d99Ff8b6c6CBF4E9B9a945CBAcEF9339178", // 1000
        "0xaf4c0B70B2Ea9FB7487C7CbB37aDa259579fe040", // 10000
        "0xa5C2254e4253490C54cef0a4347fddb8f75A4998" // 100000
      ],
      "tokens": [ADDRESSES.null]
    },
    "optimism": {
      "owners": [
        "0x84443CFd09A48AF6eF360C6976C5392aC5023a1F", // 0.1 ETH
        "0xd47438C816c9E7f2E2888E060936a499Af9582b3", // 1 ETH
        "0x330bdFADE01eE9bF63C209Ee33102DD334618e0a", // 10 ETH
        "0x1E34A77868E19A6647b1f2F47B51ed72dEDE95DD" // 100 ETH
      ],
      "tokens": [ADDRESSES.null]
    },
    "arbitrum": {
      "owners": [
        "0x84443CFd09A48AF6eF360C6976C5392aC5023a1F", // 0.1 ETH
        "0xd47438C816c9E7f2E2888E060936a499Af9582b3", // 1 ETH
        "0x330bdFADE01eE9bF63C209Ee33102DD334618e0a", // 10 ETH
        "0x1E34A77868E19A6647b1f2F47B51ed72dEDE95DD" // 100 ETH
      ],
      "tokens": [ADDRESSES.null]
    },
    "xdai": {
      "owners": [
        "0x1E34A77868E19A6647b1f2F47B51ed72dEDE95DD", // 100
        "0xdf231d99Ff8b6c6CBF4E9B9a945CBAcEF9339178", // 1000
        "0xaf4c0B70B2Ea9FB7487C7CbB37aDa259579fe040", // 10000
        "0xa5C2254e4253490C54cef0a4347fddb8f75A4998" // 100000
      ],
      "tokens": [ADDRESSES.null]
    },
    "avax": {
      "owners": [
        "0x330bdFADE01eE9bF63C209Ee33102DD334618e0a", // 10
        "0x1E34A77868E19A6647b1f2F47B51ed72dEDE95DD", // 100
        "0xaf8d1839c3c67cf571aa74B5c12398d4901147B3" // 500
      ],
      "tokens": [ADDRESSES.null]
    },
    "ethereumclassic": {
      "owners": [
        "0x2f56d5aFC058B8734350B162EFEe75ee48f034e0", // 1
        "0x59fCB629A23e8eD0a60A0188771E221042260118", // 10
        "0x784B3a7a7981B959bd8d9D9e73c2013BE819Fbf2" // 100
      ],
      "tokens": [ADDRESSES.null]
    }
  },
  "foom-cash": {
    "ethereum": {
      "tvl": { "__empty": true },
      "staking": {
        "tokensAndOwners": [
          ["0xd0D56273290D339aaF1417D9bfa1bb8cFe8A0933", "0x239AF915abcD0a5DCB8566e863088423831951f8"] // FOOM
        ]
      }
    },
    "base": {
      "tvl": { "__empty": true },
      "staking": {
        "tokensAndOwners": [
          ["0x02300ac24838570012027e0a90d3feccef3c51d2", "0xdb203504ba1fea79164AF3CeFFBA88C59Ee8aAfD"] // FOOM
        ]
      }
    }
  },
  "privcash": {
    deadFrom: '2026-09-30',
    "kava": {
      "tokensAndOwners": [
        // KAVA: 100 / 1000 / 10000 / 100000 / 1000000
        [ADDRESSES.null, "0xCDFfa16631d2b6E78fE9Da3B0454EbF0d2edfFf3"],
        [ADDRESSES.null, "0xfe79e117875993da3c8332Be34B5F06A55c7d154"],
        [ADDRESSES.null, "0x8Bbd79F1E28006D2e7a6B7B29aa46E236F4DFE07"],
        [ADDRESSES.null, "0x29d9813881ADB448e9d94ae35a0015c996DB2d40"],
        [ADDRESSES.null, "0xD58b5EB926F2Ae88372Bb23C6D432932c705C53F"],
        // USDC: 10 / 100 / 1000 / 10000 / 100000
        ["0xfa9343c3897324496a05fc75abed6bac29f8a40f", "0xe4e992802314dbbd8BB9d050afae19ca1c45cB1A"],
        ["0xfa9343c3897324496a05fc75abed6bac29f8a40f", "0x8DFB4d1925cC8C7446AfA92f1cDd6c8be567Ae7C"],
        ["0xfa9343c3897324496a05fc75abed6bac29f8a40f", "0x00F5E31F0E33FBc23e723dCEd6C078fdD688D36a"],
        ["0xfa9343c3897324496a05fc75abed6bac29f8a40f", "0xCA0d7b385e9DC484C646C50F1BBA6B01CC60E361"],
        ["0xfa9343c3897324496a05fc75abed6bac29f8a40f", "0xc500DA72cCeA705aD5Ee3A4d77ABb1864DD30a4F"]
      ]
    }
  },
  "nsure": {
    "start": "2021-04-22",
    "ethereum": {
      "tokensAndOwners": [
        [ADDRESSES.ethereum.WETH, "0x1a66f065303299d78693f122c800Ab3dEbE9c966"], // stakePool
        [ADDRESSES.ethereum.WETH, "0x702aff99b08e8891fc70811174701fb7407b4477"], // buyPool
        [ADDRESSES.ethereum.WETH, "0x80e711b29e46d430ff1553eb2ada670e2a25593c"], // surplusPool
        [ADDRESSES.ethereum.WETH, "0xfd0D28539aeD12477dcba1575eB40fca53969440"], // treasuryPool
        ["0x20945ca1df56d237fd40036d47e866c7dccd2114", "0x1a66f065303299d78693f122c800Ab3dEbE9c966"],
        [ADDRESSES.null, "0xa6b658Ce4b1CDb4E7d8f97dFFB549B8688CAFb84"]
      ]
    }
  },
  "mirrosset": {
    deadFrom: '2026-09-30',
    "kava": {
      "tokensAndOwners": [
        ["0xfa9343c3897324496a05fc75abed6bac29f8a40f", "0x587Abb291379Ea84AcE583aB07A13109b9B3F347"], // USDC @ InsurancePool
        [ADDRESSES.null, "0xA6d5df932FFE35810389e00D1A3a698a44A14E85"] // KAVA @ MortgagePool
      ]
    }
  },
  "obsdn": {
    "methodology": "TVL is the total USDC deposited as collateral in the OBSDN contract.",
    "monad": {
      "tokensAndOwners": [
        [ADDRESSES.monad.USDC, "0x90c3747cd4E6bC6FbebB1b3C54D99737590eBE45"]
      ]
    }
  },
  "pingu": {
    "arbitrum": {
      "tvl": {
        "owners": ["0x7Cc41ee3Cba9a1D2C978c37A18A0d6b59c340224"],
        "tokens": [ADDRESSES.null, ADDRESSES.arbitrum.USDC_CIRCLE]
      },
      "staking": {
        "owners": ["0x7Cc41ee3Cba9a1D2C978c37A18A0d6b59c340224"],
        "tokens": ["0x83E60B9F7f4DB5cDb0877659b1740E73c662c55B"] // PINGU
      }
    },
    "monad": {
      "tvl": {
        "owners": ["0x576d51fB872065DC4Af6f83902fd4078eBCc2f03"],
        "tokens": [ADDRESSES.null, ADDRESSES.monad.USDC]
      },
      "staking": {
        "owners": ["0x576d51fB872065DC4Af6f83902fd4078eBCc2f03"],
        "tokens": ["0xA2426cD97583939E79Cfc12aC6E9121e37D0904d"] // PINGU
      }
    }
  },
  "rsk-bridge": {
    "bitcoin": { "__btcBook": "rskBridge" },
    "ethereum": {
      "owner": "0x12eD69359919Fc775bC2674860E8Fe2d2b6a7B5D",
      "fetchCoValentTokens": true,
      "logCalls": true
    },
    "rsk": {
      "owner": "0x9d11937E2179dC5270Aa86A3f8143232D6DA0E69",
      "tokens": [
        "0x44fcd0854d745EfdeF4Cfe9868efE4d4EB51eCD6",
        "0x70566D8541beaBe984c8BAbF8A816Ed908514Ba8",
        "0xFF9EA341d9ea91CB7c54342354377f5104Fd403f",
        "0x4991516DF6053121121274397A8C1DAD608bc95B",
        "0x1BDa44fda023F2af8280a16FD1b01D1A493BA6c4",
        "0x75c6e15702ebAcd51177154ff383DF9695E1B1DA",
        "0x9C3a5F8d686fadE293c0Ce989A62a34408C4e307",
        "0xe506F698B31a66049bD4653Ed934e7A07Cbc5549",
        "0x14ADAE34beF7Ca957ce2DDe5AdD97EA050123827",
        "0x73C08467E23F7DcB7DdbBc8d05041b74467A498A",
        "0x83cf9a58d31d9014f02ebe282d10c25C28E7De15",
        "0xB3D06103aF1A68026615e673D46047fAB77dB0Fa",
        "0xE700691Da7B9851F2F35f8b8182C69C53ccad9DB",
        "0xe0CFF8a40f540657c62EB4CAC34b915e5ed8d8FF",
        "0x6B1a73d547F4009A26B8485b63D7015D248AD406",
        "0x2aCc95758f8b5F583470bA265Eb685a8f45fC9D5"
      ],
      "logCalls": true,
      "permitFailure": true
    }
  },
  "northpole": {
    "methodology": "The cumulative market value of each vault collateral is TVL",
    "avax": {
      "owner": "0xBBe7bF1c422eFBb5B2cB7a91A6f0AA7CdE86C1d3",
      "tokens": [
        ADDRESSES.avax.WETH_e,
        ADDRESSES.avax.WBTC_e,
        ADDRESSES.avax.WAVAX,
        "0x321E7092a180BB43555132ec53AaA65a5bF84251"
      ]
    }
  },
  "standx": {
    "start": "2025-03-14",
    "methodology": "StandX TVL is calculated by aggregating the balances of bridged vault addresses on the respective chain. These vaults hold the underlying collateral for all DUSD bridged to the StandX ecosystem, representing the total value secured by the protocol.",
    "bsc": {
      "owners": [
        "0x11b660397382AE3A83c4Ad80e2F791189b39e433",
        "0x90bb5bdc6acd166237640c8707a694f1fc3aab84"
      ],
      "tokens": ["0xaf44A1E76F56eE12ADBB7ba8acD3CbD474888122"] // DUSD
    },
    "solana": {
      "tokenAccounts": [
        "5bGEXW6JkR3nHfFWdTYtr7AuVvgKEUF4MWcGW7wNza6M",
        "3GzZn1Qyzc6xzCgDn83teJysBW2bMCsK6DcRNhksMNo4"
      ]
    }
  },
  "wrappedBNB": {
    // deadFrom: "2024-12-12",  // migrated to bsc and alexar acting as the bridge now
    "timetravel": false,
    "methodology": "Counts the BNB held by the Kava BEP3 \"bnb\" deputy on BNB Beacon Chain, which backs the wrapped BNB minted on Kava.",
    "bsc": { "owners": ["bnb1jh7uv2rm6339yue8k4mj9406k3509kr4wt5nxn"] }
  },
  "wrappedfi": {
    "timetravel": false,
    "methodology": "The TVL consists of the underlying capital held in custody.",
    "ripple": { "owners": ["r4Pr9aBnqN84hbkmJo4HwUtLj63E5vGFyE"] },
    "celo": { "tokensAndOwners": [[ADDRESSES.null, "0x84d9dcAc2f00F2Cd903E340b5241EB6e5c198572"]] },
    "ethereum": { "tokensAndOwners": [[ADDRESSES.null, "0xD6873b9592AB601E6cE6a6A781799d54961942F3"]] }
  },
  "templar": {
    "bsc": {
      "tvl": { "__empty": true },
      "staking": {
        "owners": [
          "0xa1f61Ca61fe8655d2a204B518f6De964145a9324",
          "0xffC7B93b53BC5F4732b414295E989684702D0eb5"
        ],
        "tokens": ["0x19e6BfC1A6e4B042Fb20531244D47E252445df01"] // TEM
      }
    },
    "ethereum": { "tvl": { "__empty": true }, "staking": { "__empty": true } },
    "moonriver": { "tvl": { "__empty": true }, "staking": { "__empty": true } },
    "harmony": { "tvl": { "__empty": true }, "staking": { "__empty": true } }
  },
  "linear": {
    "methodology": "Counts LINA used to collateralize lUSD",
    "bsc": {
      "tvl": {
        "tokensAndOwners": [
          ["0x762539b45A1dCcE3D36d080F74d1AED37844b878", "0xcE2c94d40e289915d4401c3802D75f6cA5FEf57E"], // LINA @ LnCollateralSystem
          [ADDRESSES.bsc.BUSD, "0x072F11c46146Ce636691d387BFbF8fD28e818EE8"] // bUSD @ vault
        ]
      },
      "pool2": { "__pool2": ["0x12efdFF85f717ac1738CF50Be5f4Cdc916b0B8B1", "0x392f351fc02a3b74f7900de81a9aaac13ec28e95"] }
    }
  },
  "pascal": {
    "methodology": "TVL is the USDC collateral held in Pascal's vault token account on Solana.",
    "solana": { "tokenAccounts": ["5vRGRcwN4iYaiQdso1vgWbTDFYbS8GQNUDRMMKE2ycZS"] }
  },
  megapump: {
    // MegaPump v3: a bonding curve is quoted in ETH, USDm or MEGA (chosen at creation). The factory
    // (UUPS proxy) holds the quote of every active curve; it moves to the DEX pool at graduation,
    // where megapump-dex (registries/uniswapV2.js) counts it.
    methodology: "Value of the ETH, USDm and MEGA held by the MegaPump factory: the quote currency of every active bonding curve, plus fees not yet claimed or withdrawn.",
    megaeth: {
      owner: '0xB6bC3988d62D2979b3ab7AABCcf3c9443f7dAbc4',
      tokens: [ADDRESSES.null, ADDRESSES.megaeth.USDm, ADDRESSES.megaeth.MEGA],
    },
  },
  "n1-exchange-bridge": {
    "methodology": "Counts the USDC held in the N1 Exchange bridge custody wallet on Solana.",
    "solana": {
      "owners": ["2ds4b3zrkgZ9FU8vNBSpT1UzACnmfYtjGsazPRzsbCCz"],
      "tokens": [ADDRESSES.solana.USDC]
    }
  },
  "satrush": {
    "timetravel": false,
    "methodology": "Counts BTC (cbBTC) received from mining held in the Sats Vault. Staking counts RUSH received from mining held in the Rush Vault and RUSH staked in the SatRush staking program.",
    "solana": {
      "tvl": {
        "tokenAccounts": [
          "2zpcctvd7sCdtWe4bAYcNmfVFzaiFVtH81tfMAWCtMh9", // Sats Vault cbBTC
        ]
      },
      "staking": {
        "tokenAccounts": [
          "G9iBFqhbu3rPCtTEnHzZmn8UDqy3t5d7VLqbnU8faYdT", // Rush Vault RUSH
          "7c3iepAJkw8MRF6Rm5LyxB1Vbkxgq4EAAkGy7LNQtFfV", // Staking treasury staked RUSH
        ]
      }
    }
  },
  "tessera-v": {
    "methodology": "TVL is the value of SPL and Token-2022 balances held in Tessera V vaults controlled by its Solana authority account.",
    "solana": {
      "owner": "8ekCy2jHHUbW2yeNGFWYJT9Hm9FW7SvZcZK66dSZCDiF"
    }
  },
  "arcpad": {
    // every launch opens a Uniswap V3 token/USDC pool (1% tier) and the LP NFT is locked forever in ArcFeeLocker
    // https://arcpad.meme/docs#contracts
    "methodology": "USDC held in the locked Uniswap V3 launch positions owned by the ArcPad fee locker",
    "doublecounted": true, // already counted as uniswap v3 tvl
    "start": "2026-09-03", // first launch position locked, block 19015290
    "arc": {
      "owners": ["0x69A615DD32B89fE40D87b2e3123baE4162f2d450"],
      "resolveUniV3": true,
      "uniV3WhitelistedTokens": [ADDRESSES.arc.USDC],
    }
  },
  "popdex-bridge": {
    "methodology": "TVL is the USDT held by the PopDEX cross-chain bridge contracts on Arbitrum and Morph",
    "arbitrum": {
      "owners": ["0x0B15D6cF5e843C88034f64664D7fE66E5F79C5f2"],
      "tokens": [ADDRESSES.arbitrum.USDT]
    },
    "morph": {
      "owners": ["0x71FB3a05d02B48d358E4DEB55D0D461Dcb7cF71d"],
      "tokens": [ADDRESSES.morph.USDT0]
    }
  },
  "neby-dex": {
    // pools from the last good graph.api.neby.exchange response (subgraph host no longer resolves)
    "sapphire": {
      "ownerTokens": [
        [["0x3cabbe76ea8b4e7a2c0a69812cbe671800379ec8", "0xed57966f1566de1a90042d07403021ea52ad4724"], "0x09eebb65a41cc45543e596ce1dc10d071265ad04"],
        [["0x6665a6cae3f52959f0f653e3d04270d54e6f13d8", ADDRESSES.sapphire.ROSE], "0x2c47941cfdf58d2f9a9490d84fadecc284d63b0a"],
        [[ADDRESSES.sapphire.ROSE, "0x97eec1c29f745dc7c267f90292aa663d997a601d"], "0x3a2976b76b9af12639878b87b4ccef2e951ca5aa"],
        [[ADDRESSES.sapphire.ROSE, "0xa14167756d9f86aed12b472c29b257bbdd9974c2"], "0x419fe2b60f0ea02051b073b71f2326550d371f94"],
        [[ADDRESSES.sapphire.ROSE, "0x932dd32885eee8dccdb8e0475cf2e9bfc8527f9d"], "0x6cdcf811073b358031239e3792aefcdd875498b0"],
        [["0xa14167756d9f86aed12b472c29b257bbdd9974c2", "0xdd629e5241cbc5919847783e6c96b2de4754e438"], "0x85955d332de1ce53393f4dc6e3f0bb9d95436e56"],
        [["0x2f301d3b045544a9d7ec3fa090cd78986f11f2e7", "0x3cabbe76ea8b4e7a2c0a69812cbe671800379ec8"], "0x9b62a385c488b5c088cb9ade548f18e3953d5581"],
        [[ADDRESSES.sapphire.ROSE, "0xe4ea254e07c3403fc67ece108fb5eb039a246231"], "0xa0f83725a5a86e81992134ebdf6e7e4f2ff47886"],
        [["0x932dd32885eee8dccdb8e0475cf2e9bfc8527f9d", "0x97eec1c29f745dc7c267f90292aa663d997a601d"], "0xb4f45dd65046aeeee0ec56df60074b5d1c89f067"],
        [["0x8c4acd74ff4385f3b7911432fa6787aa14406f8b", "0x97eec1c29f745dc7c267f90292aa663d997a601d"], "0xbeb97bcda42c8de9e24fe7dfb0397dd4b069ddc3"],
        [["0x3cabbe76ea8b4e7a2c0a69812cbe671800379ec8", ADDRESSES.sapphire.ROSE], "0xda6b7b88f5c659b08df37e6daf043d52b985e8ff"],
        [[ADDRESSES.sapphire.ROSE, ADDRESSES.matchain.USDT], "0xeafb04b5d4fb753c32dbb2ec32b3bf7cdc7f5144"],
        [["0x3cabbe76ea8b4e7a2c0a69812cbe671800379ec8", "0xa14167756d9f86aed12b472c29b257bbdd9974c2"], "0xeb941037f8aa4ce8680666b8af62dd88b2227da2"],
        [[ADDRESSES.sapphire.ROSE, "0x8c4acd74ff4385f3b7911432fa6787aa14406f8b"], "0xee91352a9aba9ae2ce677545ef138a9759e50629"],
        [["0x3cabbe76ea8b4e7a2c0a69812cbe671800379ec8", "0xed57966f1566de1a90042d07403021ea52ad4724"], "0xf867baf89c435cea8d2938289924604bc95be3a2"],
      ]
    }
  },
}
