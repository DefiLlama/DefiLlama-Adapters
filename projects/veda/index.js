const { chainTvl } = require("../helper/boringVault");
const ADDRESSES = require("../helper/coreAssets.json");

const { legacyVaultsEthereum, boringVaultsV0Ethereum } = require("./ethereum_constants");

const boringVaultsV0Berachain = [
  {
    name: "Prime Liquid Bera BTC",
    vault: "0x46fcd35431f5B371224ACC2e2E91732867B1A77e",
    accountant: "0x4faE50B524e0D05BD73fDF28b273DB7D4A57CCe9",
    teller: "0xf16Cd75E975163f3A0A1af42E5609aB67A6553D7",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 200107,
    baseAsset: ADDRESSES.berachain.WBTC,
  },
  {
    name: "Prime Liquid Bera ETH",
    vault: "0xB83742330443f7413DBD2aBdfc046dB0474a944e",
    accountant: "0x0B24A469d7c155a588C8a4ee24020F9f27090B0d",
    teller: "0xa6976B2211411461aB6DF4B3AAE896531Eb527df",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 198970,
    baseAsset: ADDRESSES.berachain.WETH,
  },
];

const boringVaultsV0Arbitrum = [
  {
    name: "Staked ETHFI",
    vault: "0x86B5780b606940Eb59A062aA85a07959518c0161",
    accountant: "0x05A1552c5e18F5A0BB9571b5F2D6a4765ebdA32b",
    teller: "0xe2acf9f80a2756E51D1e53F9f41583C84279Fb1f",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 230459109,
    baseAsset: ADDRESSES.arbitrum.ETHFI,
  },
  {
    name: "EBTC",
    vault: ADDRESSES.ethereum.EBTC,
    accountant: "0x1b293DC39F94157fA0D1D36d7e0090C8B8B8c13F",
    teller: "0xe19a43B1b8af6CeE71749Af2332627338B3242D1",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 283262327,
    baseAsset: ADDRESSES.arbitrum.WBTC,
  },
];

const boringVaultsV0Base = [
  {
    name: "Coinbase BTC",
    vault: "0x42A03534DBe07077d705311854E3B6933dD6Af85",
    accountant: "0x1c217f17d57d3CCD1CB3d8CB16B21e8f0b544156",
    teller: "0x66B912f197D9810d7b74E43d55bBbFC60034E98a",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 19387993,
    baseAsset: ADDRESSES.base.cbBTC,
  },
  {
    name: "Staked ETHFI",
    vault: "0x86B5780b606940Eb59A062aA85a07959518c0161",
    accountant: "0x05A1552c5e18F5A0BB9571b5F2D6a4765ebdA32b",
    teller: "0xe2acf9f80a2756E51D1e53F9f41583C84279Fb1f",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 19686016,
    baseAsset: ADDRESSES.base.ETHFI,
  },
  {
    name: "Lombard BTC",
    vault: "0x5401b8620E5FB570064CA9114fd1e135fd77D57c",
    accountant: "0x28634D0c5edC67CF2450E74deA49B90a4FF93dCE",
    teller: "0x2eA43384F1A98765257bc6Cb26c7131dEbdEB9B3",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 22113564,
    baseAsset: ADDRESSES.base.WBTC,
  },
  {
    name: "EBTC",
    vault: ADDRESSES.ethereum.EBTC,
    accountant: "0x1b293DC39F94157fA0D1D36d7e0090C8B8B8c13F",
    teller: "0xe19a43B1b8af6CeE71749Af2332627338B3242D1",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 22113992,
    baseAsset: ADDRESSES.base.WBTC,
  },
  {
    name: "Liquid ETH",
    vault: "0xf0bb20865277aBd641a307eCe5Ee04E79073416C",
    accountant: "0x0d05D94a5F1E76C18fbeB7A13d17C8a314088198",
    teller: "0x5c135e8eC99557b412b9B4492510dCfBD36066F5",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 17482303,
    baseAsset: ADDRESSES.base.WETH,
  }
];

const boringVaultsV0Bnb = [
  {
    name: "Lombard BTC",
    vault: "0x5401b8620E5FB570064CA9114fd1e135fd77D57c",
    accountant: "0x28634D0c5edC67CF2450E74deA49B90a4FF93dCE",
    teller: "0x2eA43384F1A98765257bc6Cb26c7131dEbdEB9B3",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 42143259,
    baseAsset: ADDRESSES.bsc.WBTC,
  }
];

const boringVaultsV0Bob = [
  {
    name: "Hybrid BTC",
    vault: "0x9998e05030Aee3Af9AD3df35A34F5C51e1628779",
    accountant: "0x22b025037ff1F6206F41b7b28968726bDBB5E7D5",
    teller: "0x19ab8c9896728d3A2AE8677711bc852C706616d3",
    lens: "0xb1DB783AfdBb0076486692152608f2E762bB75AE",
    startBlock: 13262672,
    baseAsset: ADDRESSES.bob.WBTC,
  }
];

const boringVaultsV0Sonic = [
  {
    name: "Sonic scETH",
    vault: ADDRESSES.sonic.scETH,
    accountant: "0x3a592F9Ea2463379c4154d03461A73c484993668",
    teller: "0x31A5A9F60Dc3d62fa5168352CaF0Ee05aA18f5B8",
    lens: "0xE0eFE934DC4744090e8eF93f1D125E4015a857FE",
    startBlock: 591869,
    baseAsset: ADDRESSES.sonic.WETH,
  },
  {
    name: "Sonic scUSD",
    vault: ADDRESSES.sonic.scUSD,
    accountant: "0xA76E0F54918E39A63904b51F688513043242a0BE",
    teller: "0x358CFACf00d0B4634849821BB3d1965b472c776a",
    lens: "0xE0eFE934DC4744090e8eF93f1D125E4015a857FE",
    startBlock: 588029,
    baseAsset: ADDRESSES.sonic.USDC_e,
  },
  {
    name: "Sonic scBTC",
    vault: "0xBb30e76d9Bb2CC9631F7fC5Eb8e87B5Aff32bFbd",
    accountant: "0xC1a2C650D2DcC8EAb3D8942477De71be52318Acb",
    teller: "0xAce7DEFe3b94554f0704d8d00F69F273A0cFf079",
    lens: "0xE0eFE934DC4744090e8eF93f1D125E4015a857FE",
    startBlock: 6833997,
    baseAsset: ADDRESSES.sonic.LBTC,
  },
  {
    name: "Sonic LBTC Vault",
    vault: "0x309f25d839A2fe225E80210e110C99150Db98AAF",
    accountant: "0x0639e239E417Ab9D1f0f926Fd738a012153930A7",
    teller: "0x258f532CB41393c505554228e66eaf580B0171b2",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 6794046,
    baseAsset: ADDRESSES.sonic.LBTC,
  }
];

const boringVaultsV0Scroll = [
  {
    name: "Liquid ETH",
    vault: "0xf0bb20865277aBd641a307eCe5Ee04E79073416C",
    accountant: "0x0d05D94a5F1E76C18fbeB7A13d17C8a314088198",
    teller: "0x5c135e8eC99557b412b9B4492510dCfBD36066F5",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 12748860,
    baseAsset: ADDRESSES.scroll.WETH,
  },
    {
    name: "Liquid USD",
    vault: "0x08c6F91e2B681FaF5e17227F2a44C307b3C1364C",
    accountant: "0xc315D6e14DDCDC7407784e2Caf815d131Bc1D3E7",
    teller: "0x221Ea02d409074546265CCD1123050F4D498ef64",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 12749211,
    baseAsset: ADDRESSES.scroll.USDC,
  },
    {
    name: "Liquid BTC",
    vault: "0x5f46d540b6eD704C3c8789105F30E075AA900726",
    accountant: "0xEa23aC6D7D11f6b181d6B98174D334478ADAe6b0",
    teller: "0x9E88C603307fdC33aA5F26E38b6f6aeF3eE92d48",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 13951017,
    baseAsset: ADDRESSES.scroll.WBTC,
  },
    {
    name: "eBTC",
    vault: ADDRESSES.ethereum.EBTC,
    accountant: "0x1b293DC39F94157fA0D1D36d7e0090C8B8B8c13F",
    teller: "0xe19a43B1b8af6CeE71749Af2332627338B3242D1",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 12677428,
    baseAsset: ADDRESSES.scroll.WBTC,
  },
    {
    name: "eUSD",
    vault: ADDRESSES.ethereum.EUSD,
    accountant: "0xEB440B36f61Bf62E0C54C622944545f159C3B790",
    teller: "0xCc9A7620D0358a521A068B444846E3D5DebEa8fA",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 12775217,
    baseAsset: ADDRESSES.arbitrum.USDe,
  },
];

const boringVaultsV0Hyperevm = [
  {
    name: "KHYPE",
    vault: "0x9BA2EDc44E0A4632EB4723E81d4142353e1bB160",
    accountant: "0x74392Fa56405081d5C7D93882856c245387Cece2",
    teller: "0x29C0C36eD3788F1549b6a1fd78F40c51F0f73158",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 8440831,
    baseAsset: ADDRESSES.hyperliquid.WHYPE,
  },
];

const boringVaultsV0Plasma = [
  {
    name: "Plasma USD",
    vault: "0xd1074E0AE85610dDBA0147e29eBe0D8E5873a000",
    accountant: "0x737f2522d09E58a3Ea9dcCFDB127dD0dF5eB3F18",
    teller: "0x4E7d2186eB8B75fBDcA867761636637E05BaeF1E",
    lens: "0xC67Af7c42b64c2Bb5BdF20716cCFa995a07F6903",
    startBlock: 687884,
    baseAsset: ADDRESSES.plasma.USDT0
  },
];

const boringVaultsV0Ink = [
  {
    name: "Sentora Advanced Yields USD",
    vault: "0x63D124cF1afC22F0CCEa376168200508d2A0868E",
    accountant: "0x8C9C454C51eCc717eA03eC03B904565f405DEAF7",
    teller: "0x50e951CB35aa8e36459436fB4515Bb8361Cac522",
    lens: "0x90983EBF38E981AE38f7Da9e71804380e316A396",
    startBlock: 29559921,
    baseAsset: ADDRESSES.ink.USDC,
  },
  {
    name: "Advanced Strategies USDC",
    vault: "0x9761DDF8e79930b334f1Be1BD93aBE3695061CcA",
    accountant: "0x427a3c091F09fa6212d177060bb7456Abf538b22",
    teller: "0x48639C1934F14Dc666Af663299294F9e863BDedB",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 29501466,
    baseAsset: ADDRESSES.ink.USDC,
  },
  {
    name: "Balanced Yield USDC",
    vault: "0xcaae49fb7f74cCFBE8A05E6104b01c097a78789f",
    accountant: "0x0C4dF79d9e35E5C4876BC1aE4663E834312DDc67",
    teller: "0xC151E263d5c890FD0Bceb33a6525F1A76a8329fC",
    lens: "0x90983EBF38E981AE38f7Da9e71804380e316A396",
    startBlock: 29483710,
    baseAsset: ADDRESSES.ink.USDC,
  },
  {
    name: "Boosted Yield USDC",
    vault: "0xDbD87325D7b1189Dcc9255c4926076fF4a96A271",
    accountant: "0x9c2477D4Ea17d3cCC45e6b1087c94d14926F54C9",
    teller: "0xc46f2443b3521632E2E2a903D6da8f965B46f6a0",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    startBlock: 29554306,
    baseAsset: ADDRESSES.ink.USDC,
  },
  {
    name: "Advanced Strategies BTC",
    vault: "0x7Dee0120739b7ec048B469939EFB178ADbbB19B2",
    accountant: "0x4Bb6C416a00561ad6657110b76552c42d55Ff1d6",
    teller: "0x498b6baA9Fb4530570Ec06aEa343162DbF32604B",
    lens: "0x90983EBF38E981AE38f7Da9e71804380e316A396",
    startBlock: 38589053,
    baseAsset: ADDRESSES.ink.KBTC,
  },
];

const boringVaultsV0Optimism = [
  {
    name: "Liquid ETH",
    vault: "0xf0bb20865277aBd641a307eCe5Ee04E79073416C",
    accountant: "0x0d05D94a5F1E76C18fbeB7A13d17C8a314088198",
    teller: "0x9AA79C84b79816ab920bBcE20f8f74557B514734",
    lens: "0xe0efe934dc4744090e8ef93f1d125e4015a857fe",
    startBlock: 123081511,
    baseAsset: ADDRESSES.optimism.WETH_1,
  },
  {
    name: "Liquid BTC",
    vault: "0x5f46d540b6eD704C3c8789105F30E075AA900726",
    accountant: "0xEa23aC6D7D11f6b181d6B98174D334478ADAe6b0",
    teller: "0x8Ea0B382D054dbEBeB1d0aE47ee4AC433C730353",
    lens: "0xe0efe934dc4744090e8ef93f1d125e4015a857fe",
    startBlock: 149698604,
    baseAsset: ADDRESSES.optimism.WBTC,
  },
  {
    name: "Liquid USD",
    vault: "0x08c6F91e2B681FaF5e17227F2a44C307b3C1364C",
    accountant: "0xc315D6e14DDCDC7407784e2Caf815d131Bc1D3E7",
    teller: "0x4DE413a26fC24c3FC27Cc983be70aA9c5C299387",
    lens: "0xe0efe934dc4744090e8ef93f1d125e4015a857fe",
    startBlock: 149698249,
    baseAsset: ADDRESSES.optimism.USDC_CIRCLE,
  },
  {
    name: "Staked ETHFI",
    vault: "0x86B5780b606940Eb59A062aA85a07959518c0161",
    accountant: "0x05A1552c5e18F5A0BB9571b5F2D6a4765ebdA32b",
    teller: "0x35dD2463fA7a335b721400C5Ad8Ba40bD85c179b",
    lens: "0xe0efe934dc4744090e8ef93f1d125e4015a857fe",
    startBlock: 149699005,
    baseAsset: ADDRESSES.optimism.ETHFI,
  },
];

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  start: 1710745200,
  doublecounted: true,
  ["ethereum"]: { tvl: (api) => chainTvl(api, boringVaultsV0Ethereum, legacyVaultsEthereum) },
  ["berachain"]: { tvl: (api) => chainTvl(api, boringVaultsV0Berachain) },
  ["arbitrum"]: { tvl: (api) => chainTvl(api, boringVaultsV0Arbitrum) },
  ["base"]: { tvl: (api) => chainTvl(api, boringVaultsV0Base) },
  ["bsc"]: { tvl: (api) => chainTvl(api, boringVaultsV0Bnb) },
  ["bob"]: { tvl: (api) => chainTvl(api, boringVaultsV0Bob) },
  ["sonic"]: { tvl: (api) => chainTvl(api, boringVaultsV0Sonic) },
  ["scroll"]: { tvl: (api) => chainTvl(api, boringVaultsV0Scroll) },
  ["hyperliquid"]: { tvl: (api) => chainTvl(api, boringVaultsV0Hyperevm) },
  ["plasma"]: { tvl: (api) => chainTvl(api, boringVaultsV0Plasma) },
  ["ink"]: { tvl: (api) => chainTvl(api, boringVaultsV0Ink) },
  ["optimism"]: { tvl: (api) => chainTvl(api, boringVaultsV0Optimism) },
};
