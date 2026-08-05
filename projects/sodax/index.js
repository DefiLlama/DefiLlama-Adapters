const { sumTokens2 } = require('../helper/unwrapLPs');

// SODAX AssetManager per spoke chain (custodies bridged assets).
// Sonic is the hub; on Sonic we count the sodaX vault holdings of the
// Sonic-native tokens (USDC, USDT, WETH, wS) which are not represented
// on any spoke AssetManager. Other soda* vaults (sodaBNB, sodaBTC,
// sodaWBTC, sodaAVAX, sodaHASUI) intentionally excluded to avoid
// double counting the wrapped hub reps of assets already held on
// spoke AssetManagers.

const CONFIG = {
  ethereum: {
    owner: '0x39E77f86C1B1f3fbAb362A82b49D2E86C09659B4',
    tokens: [
      '0x0000000000000000000000000000000000000000',
      '0x1f22279C89B213944b7Ea41daCB0a868DdCDFd13', // bnUSD
      '0x4A1C82744cDDeE675A255fB289Cb0917A482e7C7', // SODA
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
      '0xdC035D45d973E3EC169d2276DDab16f1e407384F', // USDS
      '0x0921799CB1d702148131024d18fCdE022129Dc73', // LL
      '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee', // weETH
      '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0', // wstETH
      '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
      '0xD166337499E176bbC38a1FBd113Ab144e5bd2Df7', // sUSDat
      '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // AAVE
      '0x514910771AF9Ca656af840dff83E8264EcF986CA', // LINK
      '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI
      '0x6982508145454Ce325dDbE47a25d4ec3d2311933', // PEPE
      '0x57e114B691Db790C35207b2e685D4A43181e6061', // ENA
      '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3', // USDe
      '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497', // sUSDe
      '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8', // PYUSD
      '0x6985884C4392D348587B19cb9eAAf157F13271cd', // ZRO
      '0x45804880De22913dAFE09f4980848ECE6EcbAf78', // PAXG
      '0x68749665FF8D2d112Fa859AA293F07A622782F38', // XAUt
      '0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d', // USD1
      '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
      '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', // cbBTC
      '0xae78736Cd615f374D3085123A210448E74Fc6393', // rETH
    ],
  },
  avax: {
    owner: '0x5bDD1E1C5173F4c912cC919742FB94A55ECfaf86',
    tokens: [
      '0x0000000000000000000000000000000000000000',
      '0x6958a4CBFe11406E2a1c1d3a71A1971aD8B3b92F', // bnUSD
      '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', // USDT
      '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC
      '0x390ceed555905ec225Da330A188EA04e85570f00', // SODA
      '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', // WETH.e
    ],
  },
  arbitrum: {
    owner: '0x348BE44F63A458be9C1b13D6fD8e99048F297Bc3',
    tokens: [
      '0x0000000000000000000000000000000000000000',
      '0xA256dd181C3f6E5eC68C6869f5D50a712d47212e', // bnUSD
      '0x5979D7b546E38E414F7E9822514be443A4800529', // wstETH
      '0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe', // weETH
      '0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40', // tBTC
      '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', // WBTC
      '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC
      '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT
      '0x5bda87f18109CA85fa7ADDf1D48B97734e9dc6F5', // SODA
      '0xddb46999f8891663a8f2828d25298f70416d7610', // sUSDS
      '0x6491c05A82219b8D1479057361ff1654749b876b', // USDS
      '0x912CE59144191C1204E64559FE8253a0e49E6548', // ARB
      '0xba5DdD1f9d7F570dc94a51479a000E3BCE967196', // AAVE
      '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4', // LINK
      '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0', // UNI
      '0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978', // CRV
      '0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8', // PENDLE
      '0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8', // rETH
    ],
  },
  base: {
    owner: '0x348BE44F63A458be9C1b13D6fD8e99048F297Bc3',
    tokens: [
      '0x0000000000000000000000000000000000000000',
      '0xAcfab3F31C0a18559D78556BBf297EC29c6cf8aa', // bnUSD
      '0x04c0599ae5a44757c0af6f9ec3b93da8976c150a', // weETH
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
      '0x820C137fa70C8691f0e44Dc420a5e53c168921Dc', // USDS
      '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452', // wstETH
      '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', // cbBTC
      '0xdc5B4b00F98347E95b9F94911213DAB4C687e1e3', // SODA
      '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2', // USDT
      '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b', // VIRTUAL
      '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', // cbETH
      '0x940181a94A35A4569e4529A3CDfB74e38FD98631', // AERO
    ],
  },
  optimism: {
    owner: '0x348BE44F63A458be9C1b13D6fD8e99048F297Bc3',
    tokens: [
      '0x0000000000000000000000000000000000000000',
      '0xF4f7dC27c17470a26d0de9039Cf0EA5045F100E8', // bnUSD
      '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', // USDC
      '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb', // wstETH
      '0x5A7fACB970D094B6C7FF1df0eA68D99E6e73CBFF', // weETH
      '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', // USDT
      '0x1f22279C89B213944b7Ea41daCB0a868DdCDFd13', // SODA
      '0x4200000000000000000000000000000000000042', // OP
      '0x68f180fcCe6836688e9084f035309E29Bf0A2095', // WBTC
    ],
  },
  bsc: {
    owner: '0x348BE44F63A458be9C1b13D6fD8e99048F297Bc3',
    tokens: [
      '0x0000000000000000000000000000000000000000',
      '0x8428FedC020737a5A2291F46cB1B80613eD71638', // bnUSD
      '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', // ETHB
      '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', // BTCB
      '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
      '0xdc5B4b00F98347E95b9F94911213DAB4C687e1e3', // SODA
      '0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A', // weETH
      '0x55d398326f99059ff775485246999027b3197955', // USDT
      '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', // CAKE
      '0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409', // FDUSD
      '0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d', // USD1
      '0x000Ae314E2A2172a039B26378814C252734f556A', // ASTER
      '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE', // XRP
      '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47', // ADA
      '0xbA2aE424d960c26247Dd6c32edC70B295c744C43', // DOGE
      '0x570A5D26f7765Ecb712C0924E4De545B89fD43dF', // SOL
      '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402', // DOT
      '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD', // LINK
    ],
  },
  polygon: {
    owner: '0x348BE44F63A458be9C1b13D6fD8e99048F297Bc3',
    tokens: [
      '0x0000000000000000000000000000000000000000',
      '0x39E77f86C1B1f3fbAb362A82b49D2E86C09659B4', // bnUSD
      '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // USDC
      '0xDDF645F33eDAD18fC23E01416eD0267A1bF59D45', // SODA
      '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd', // wstETH
      '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT
      '0x1BFD67037B42Cf73acF2047067bd4F2C47D9bfD6', // WBTC
      '0xD6DF932A45C0f255f85145f286eA0b292B21C90B', // AAVE
      '0x53E0bca35eC356BD5dDDFebbD1Fc0fD03FaBad39', // LINK
      '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // DAI
    ],
  },
  hyperliquid: {
    owner: '0xAfd6A6e4287A511D3BAAd013093815268846FBb7',
    tokens: [
      '0x0000000000000000000000000000000000000000',
      '0x506Ba7C8d91dAdf7a91eE677a205D9687b751579', // bnUSD
      '0xA28C70F92a1B2513edCdDD29c2E5195a4B785aB2', // SODA
      '0xb88339CB7199b77E23DB6E890353E22632Ba630f', // USDC
      '0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb', // USDT0
      '0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463', // UBTC
      '0xBe6727B535545C67d5cAa73dEa54865B92CF7907', // UETH
      '0xfD739d4e423301CE9385c1fb8850539D657C296D', // kHYPE
      '0x111111a1a0667d36bD57c0A9f569b98057111111', // USDH
    ],
  },
  lightlink_phoenix: {
    owner: '0x4A1C82744cDDeE675A255fB289Cb0917A482e7C7',
    tokens: [
      '0x0000000000000000000000000000000000000000',
      '0x36134A03dcD03Bbe858B8F7ED28a71AAC608F9E7', // bnUSD
      '0x6BC8C37cba91F76E68C9e6d689A9C21E4d32079B', // SODA
      '0xbCF8C1B03bBDDA88D579330BDF236B58F8bb2cFd', // USDC
      '0x6308fa9545126237158778e74AE1b6b89022C5c0', // USDT
      '0x519d3443cACc61bD844546eDAea48E5502021802', // LL
    ],
  },
  klaytn: {
    // "kaia" chain slug (Kaia = rebrand of Klaytn); DefiLlama slug is klaytn.
    owner: '0x6D2126DB97dd88AfA85127253807D04A066b6746',
    tokens: [
      '0x0000000000000000000000000000000000000000',
      '0xF8D13cAcb8E2B6BA8396DbA35a7365EF6b603cd6', // bnUSD
      '0xd077a400968890eacc75cdc901f0356c943e4fdb', // USDT
      '0x772ffe538e45b2cddfb5823041ec26c44815b9ab', // SODA
    ],
  },
  hedera: {
    owner: '0x0df73542cC68bDC01b361d231c60F726B0e0bC05',
    tokens: [
      '0x0000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000a0286a', // bnUSD
      '0x0000000000000000000000000000000000a02869', // SODA
      '0x000000000000000000000000000000000006f89a', // USDC
    ],
  },
  sonic: {
    // Hub side: sodaX vaults hold the Sonic-native underlying tokens.
    // (SodaX vaults for non-Sonic-native assets are excluded because
    // their underlying is already counted on the spoke AssetManager.)
    // helper signature: [tokens[], owner]
    ownerTokens: [
      [['0x29219dd400f2Bf60E5a23d13Be72B486D4038894'], '0xAbbb91c0617090F0028BDC27597Cd0D038F3A833'], // sodaUSDC -> USDC
      [['0x6047828dc181963ba44974801FF68e538dA5eaF9'], '0xbDf1F453FCB61424011BBDDCB96cFDB30f3Fe876'], // sodaUSDT -> USDT
      [['0x50c42dEAcD8Fc9773493ED674b675bE577f2634b'], '0x4effB5813271699683C25c734F4daBc45B363709'], // sodaETH  -> WETH
      [['0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38'], '0x62ecc3Eeb80a162c57624B3fF80313FE69f5203e'], // sodaS    -> wS
    ],
  },
};

// Redbelly (EVM) omitted: DefiLlama does not yet list "redbelly" in
// projects/helper/chains.json. AssetManager on Redbelly is
// 0x39E77f86C1B1f3fbAb362A82b49D2E86C09659B4; will be added once the
// chain is recognized upstream.
//
// Non-EVM spokes (deferred; DefiLlama support + SODAX docs to be confirmed):
//   solana:    AnCCJjheynmGqPp6Vgat9DTirGKD4CtQzP8cwTYV8qKH
//   bitcoin:   bc1pcz4pyrfgv7v6tx8a404mafyvt73cnm80yuv8tqwrywxmqxpja8ys4pjyl5
//   stellar:   CCGF33A4CO6D3BXFEKPXVCFCZBK76I3AQOZK6KIKRPAWAZR3632WHCJ3
//   sui:       0xa17a409164d1676db71b411ab50813ba2c7dd547d2df538c699049566f1ff922
//   icon:      cx1be33c283c7dc7617181d1b21a6a2309e71b1ee7
//   near:      asset-manager.sodax.near
//   stacks:    SP3031RGK734636C8KGW2Y76TEQBTVX59Q472EQH0.asset-manager-state
//   injective: inj1dg6tm62uup53wn2kn97caeqfwt0sukx3qjk8rw

async function tvl(api) {
  const cfg = CONFIG[api.chain];
  if (!cfg) return {};
  return sumTokens2({
    api,
    owner: cfg.owner,
    tokens: cfg.tokens,
    ownerTokens: cfg.ownerTokens,
  });
}

// Sonic-only: SODA held by xSODA and stSoda staking contracts.
const SODA_SONIC = '0x7c7d53EEcda37a87ce0D5bf8E0b24512A48dC963';
const XSODA = '0xADC6561Cc8FC31767B4917CCc97F510D411378d9';
const STSODA = '0x4333B324102d00392038ca92537DfbB8CB0DAc68';

async function sonicStaking(api) {
  return sumTokens2({
    api,
    owners: [XSODA, STSODA],
    tokens: [SODA_SONIC],
  });
}

module.exports = {
  methodology:
    'TVL sums assets custodied by the SODAX AssetManager on each supported spoke chain plus the Sonic-native assets held in the hub-side sodaX vault tokens (sodaUSDC, sodaUSDT, sodaETH, sodaS). Money-market supplied collateral is not counted separately because it is the same wrapped representation of assets already locked on spoke AssetManagers. Solver inventory is external and excluded. Staked SODA (xSODA + stSoda) is reported under staking rather than TVL. Non-EVM spokes (Solana, Bitcoin, Stellar, Sui, ICON, NEAR, Stacks, Injective) will be added in a follow-up.',
};

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl };
});

module.exports.sonic.staking = sonicStaking;
