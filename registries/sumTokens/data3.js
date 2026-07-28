// Bulk-migrated static sumTokens adapters (behavior-verified equivalent to their
// former projects/ source files). Same config shape as data1.js / data2.js.
module.exports = {
  "edgeX": {
    "ethereum": {
      "tvl": { "owners": ["0xc0a1a1e4af873e9a37a0cac37f3ab81152432cc5","0xfAaE2946e846133af314d1Df13684c89fA7d83DD","0x7F861a7db997B4f6E5Ef9954A3b5D5b29c463Cb2"], "tokens": ["0xdac17f958d2ee523a2206206994597c13d831ec7","0x23878914efe38d27c4d67ab83ed1b93a74d4086a","0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","0x0000000000000000000000000000000000000000"] },
    },
    "arbitrum": {
      "tvl": { "owners": ["0xceeed84620e5eb9ab1d6dfc316867d2cda332e41","0x6F4836aFD5e21EDcee9b838C5a4125829EC198d0","0x107695630130919cb040B095b9b20511D6e211bB","0x81144d6E7084928830f9694a201E8c1ce6eD0cb2"], "tokens": ["0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9","0xaf88d065e77c8cC2239327C5EDb3A432268e5831","0x0000000000000000000000000000000000000000"] },
    },
    "bsc": {
      "tvl": { "owners": ["0x3EedB0d9C95263778a62081F2A62FC77a392116d"], "tokens": ["0x55d398326f99059ff775485246999027b3197955"] },
    },
    "edgex": {
      "tvl": { "owners": ["0xc8B4cF96bBC915f11C4f8B6F7654eF46C7af3783"], "tokens": ["0x98d2919b9A214E6Fa5384AC81E6864bA686Ad74c"] },
    },
  },
  "gblin": {
    "methodology": "TVL is calculated by summing the balances of WETH, cbBTC, and USDC strictly locked as backing collateral inside the GBLIN V6 Vault contract on Base.",
    "base": {
      "tvl": { "owner": "0x36C81d7E1966310F305eA637e761Cf77F90852f0", "tokens": ["0x4200000000000000000000000000000000000006","0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf","0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"] },
    },
  },
  "risq": {
    "bsc": {
      "tvl": { "tokensAndOwners": [["0x0000000000000000000000000000000000000000","0x55D10490C500FBF334C0fD91A0b205a5D64b9367"]] },
    },
  },
  "pred": {
    "methodology": "USDC held in ConditionalTokens contracts and NegRisk WrappedCollateral contracts (latest and legacy deployments).",
    "base": {
      "tvl": { "owners": ["0x76c175e7ad7f794e2478345ee50d8290088a797d","0x4e9608d5cf77f22b2d5543b6c65a8c5417e8122c","0xc7e015b63d8226444a028c57fcaa1d30bfc3178c","0xa291d33e4670ab6bcd2c631231396ef12e138380","0xc83c5cca746d213d9cf63fe668e7eb8dee35314b","0xb365835f194e383354367572d0eb9d2dce46b693"], "tokens": ["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"] },
    },
  },
  "ethos-network": {
    "methodology": "Measures the total amount of ETH stored in the Vouch contract. Each vouch represents a trust relationship backed by ETH.",
    "start": "2025-01-21",
    "base": {
      "tvl": { "owner": "0xD89E6B7687f862dd6D24B3B2D4D0dec6A89A6fdd", "tokens": ["0x0000000000000000000000000000000000000000"] },
    },
  },
  "ethos-markets": {
    "methodology": "Measures the total amount of ETH stored in the Reputation Markets contract. Markets allow trading trust/distrust votes against Ethos network profiles on an AMM.",
    "start": "2025-01-21",
    "base": {
      "tvl": { "owner": "0xC26F339F4E46C776853b1c190eC17173DBe059Bf", "tokens": ["0x0000000000000000000000000000000000000000"] },
    },
  },
  "king-finance": {
    "bsc": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0x66e5388c84da5a30ebe58eeac73bbceb59c9f1ae"], "tokens": ["0x74f08aF7528Ffb751e3A435ddD779b5C4565e684"] },
    },
  },
  "blasterswap-vaults": {
    "blast": {
      "tvl": { "owners": ["0x0464a36beCf9967111D2dCAb57CAf4a2376f6E3F"], "tokens": ["0xb1a5700fA2358173Fe465e6eA4Ff52E36e88E2ad"] },
      "staking": { "owners": ["0xC52fb7E613e401a0195C2fdB369618580D58C91D","0x013249266842e078999088807033D80531A84260"], "tokens": ["0xd43D8aDAC6A4C7d9Aeece7c3151FcA8f23752cf8","0x5ffd9EbD27f2fcAB044c0f0a26A45Cb62fa29c06"] },
    },
  },
  "stakin-gg": {
    "methodology": "Counts WETH in the project’s main contract",
    "start": 28896428,
    "base": {
      "tvl": { "owners": ["0xEF5E916de82839A8131eaac866280492966cd37C"], "tokens": ["0x4200000000000000000000000000000000000006"] },
    },
  },
  "nomad": {
    "methodology": "counts the total amount of assets locked in the Nomad token bridge.",
    "ethereum": {
      "tvl": { "tokensAndOwners": [["0x853d955aCEf822Db058eb8505911ED77F175b99e","0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3"],["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3"],["0x6b175474e89094c44da98b954eedeac495271d0f","0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3"],["0xdac17f958d2ee523a2206206994597c13d831ec7","0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3"],["0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0","0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3"],["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3"],["0x2260fac5e5542a773aa44fbcfedf7c193bc2c599","0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3"],["0x40EB746DEE876aC1E78697b7Ca85142D178A1Fc8","0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3"],["0xD417144312DbF50465b1C641d016962017Ef6240","0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3"],["0xf1a91C7d44768070F711c68f33A7CA25c8D30268","0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3"],["0x3431F91b3a388115F00C5Ba9FdB899851D005Fb5","0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3"],["0x3d6F0DEa3AC3C607B3998e6Ce14b6350721752d9","0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3"],["0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D","0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3"],["0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6","0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3"],["0x0316EB71485b0Ab14103307bf65a021042c6d380","0x88A69B4E698A4B090DF6CF5Bd7B2D47325Ad30A3"]] },
    },
    "moonbeam": {
      "tvl": { "tokensAndOwners": [] },
    },
    "milkomeda": {
      "tvl": { "tokensAndOwners": [] },
    },
    "evmos": {
      "tvl": { "tokensAndOwners": [] },
    },
  },
  "ivx": {
    "berachain": {
      "tvl": { "owners": ["0x598eE20d8D372665a96AFba9d3B0Bfd817f1f340"], "tokens": ["0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce","0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590","0x6969696969696969696969696969696969696969","0x0555e30da8f98308edb960aa94c0db47230d2b9c"] },
    },
  },
  "component": {
    "ethereum": {
      "tvl": {  },
      "staking": { "owners": ["0x79876b5062160C107e02826371dD33c047CCF2de"], "tokens": ["0x9f20Ed5f919DC1C1695042542C13aDCFc100dcab"] },
    },
    "xdai": {
      "tvl": {  },
    },
    "bsc": {
      "tvl": {  },
    },
  },
  "truefeedback": {
    "celo": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0x588069878442856b683ab39f410ed96b72fb542a"], "tokens": ["0xbDd31EFfb9E9f7509fEaAc5B4091b31645A47e4b"] },
    },
    "kava": {
      "staking": { "owners": ["0x067543c3D97753dDA22A2cF6a806f47BD6A17B6A"], "tokens": ["0xbd10f04b8b5027761fcaad42421ad5d0787211ee"] },
    },
  },
  "ryoshi-royale": {
    "methodology": "TVL counts native CRO held in the Battle Rewards contract. Staking counts RYOSHI held in the Vaults contract.",
    "cronos": {
      "tvl": { "owner": "0x15b7d7402441DEA17637D5Edb373Ea773f135EDe", "tokens": ["0x0000000000000000000000000000000000000000"] },
      "staking": { "owner": "0x200246E9c5E80496EaD817632d543B869A4537cC", "tokens": ["0x055c517654d72A45B0d64Dc8733f8A38E27Fd49C"] },
    },
  },
  "pegasusfinance": {
    "methodology": "WETH supplied to liquidity pool + leftover weth in treasury",
    "optimism": {
      "tvl": { "owners": ["0x7398c321449d836cec83582a678ccb8650360a18"], "tokens": ["0x4200000000000000000000000000000000000006"] },
    },
  },
  "keel-finance": {
    "methodology": "TVL is calculated by summing token balances in Keel Finance's AllocatorVault, AllocatorBuffer, and ALM Proxy contracts on Ethereum.",
    "ethereum": {
      "tvl": { "owners": ["0xe4470DD3158F7A905cDeA07260551F72d4bB0e77","0x065E5De3D3A08c9d14BF79Ce5A6d3D0E8794640c","0xa5139956eC99aE2e51eA39d0b57C42B6D8db0758"], "tokens": ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","0xdac17f958d2ee523a2206206994597c13d831ec7","0x6b175474e89094c44da98b954eedeac495271d0f","0xdC035D45d973E3EC169d2276DDab16f1e407384F","0x83f20f44975d03b1b09e64809b757c47f942beea","0xa3931d71877C0E7a3148CB7Eb4463524FEc27fbD","0x9D39A5DE30e57443BfF2A8307A4256c8797A3497","0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE","0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0","0xae78736cd615f374d3085123a210448e74fc6393","0x2260fac5e5542a773aa44fbcfedf7c193bc2c599","0x18084fba666a33d37592fa2633fd49a74dd93a88"] },
    },
  },
  "premio": {
    "methodology": "TVL counts staked PREMIO coins on the platform itself. CoinGecko is used to find the price of tokens in USD.",
    "celo": {
      "staking": { "owners": ["0x1DA2C9f15E2399960032dCF709B873712626ABF1"], "tokens": ["0x94140c2ea9d208d8476ca4e3045254169791c59e"] },
    },
    "kava": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0x0281CBD3e40Ce01b514360a47BdB4dB26Dd76bc3"], "tokens": ["0x9B82ee2C5e811d9849D7766edC3D750d9ab6492c"] },
    },
  },
  "astriddao": {
    "methodology": "Total locked collateral assets (in ERC-20 form) in ActivePool and DefaultPool",
    "astar": {
      "tvl": { "tokensAndOwners": [["0x19574c3c8fafc875051b665ec131b7e60773d2c9","0x70724b57618548eE97623146F76206033E67086e"],["0x19574c3c8fafc875051b665ec131b7e60773d2c9","0x2fE3FDf91786f75C92e8AB3B861588D3D051D83F"],["0x4bf769b05e832fcdc9053fffbc78ca889acb5e1e","0x892af684Afd5fCee1023f7811C35fd695Bf0cd6f"],["0x4bf769b05e832fcdc9053fffbc78ca889acb5e1e","0xe487b9066A8fFde840b29892f1052CBEdccc3073"],["0x6de33698e9e9b787e09d3bd7771ef63557e148bb","0xCE90059FbCEc696634981945600d642A79e262aD"],["0x6de33698e9e9b787e09d3bd7771ef63557e148bb","0x3aD8FE12674B4c9481d5C7585ed5bDC4E35025b9"],["0xffffffffffffffffffffffffffffffffffffffff","0x8cd0b101838b082133e25eEb76C916Ae2AC56f36"],["0xffffffffffffffffffffffffffffffffffffffff","0x4e8B4867899A69bB05EFa6A16e68363C2BBeB02f"],["0x6a2d262d56735dba19dd70682b39f6be9a931d98","0x5070d543654D866964C44E610a3b7f85fcAf2859"],["0x6a2d262d56735dba19dd70682b39f6be9a931d98","0xEb80f1a9ede36412cF26E1e35ae74dbA30cCfF02"],["0x81ecac0d6be0550a00ff064a4f9dd2400585fe9c","0x5Ec419F08602caE5e4C591dE65bD640d66673035"],["0x81ecac0d6be0550a00ff064a4f9dd2400585fe9c","0x2eE0F3daa042af6Fdd56f0194d5aBfdA0A723D95"],["0xad543f18cff85c77e140e3e5e3c3392f6ba9d5ca","0x1685E4f68FD9A50246ce92F0eb07a977591F5Ba2"],["0xad543f18cff85c77e140e3e5e3c3392f6ba9d5ca","0xD69eB04d9ff456A31Da6D2a20538512C433ac1Ca"],["0x3795c36e7d12a8c252a20c5a7b455f7c57b60283","0x74dFF63491B39E5fFE0Be44Ee3B23F674C27DB7c"],["0x3795c36e7d12a8c252a20c5a7b455f7c57b60283","0x8EE2f5403246b86d7493ddCeED19f9347bc4DF1D"]] },
    },
  },
  "luchadores": {
    "methodology": "- Staking : Players can stake their $LUCHA to earn $MASK and access in-game services or equipment.\r\n    - Treasury : 100% of the funds collected during the first raffle (purchase of wearable) have been kept in treasury to build a long term economic strategy. Luchadores.io own 60% of LP token to improve liquidity and facilitate user swaps.\r\n    - Reward Pool : 90% of the revenues generated in the game are redistributed to the players in this wallet (the 10% is shared between treasury and dev)\r",
    "polygon": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0xC5E9E8574c27747B4D537ef94e2448a3A0525dF4","0x72104d619BaEDf632936d9dcE38C089CA3bf12Dc"], "tokens": ["0x6749441Fdc8650b5b5a854ed255C82EF361f1596"] },
      "pool2": { "owners": ["0x1F0ee42D005b89814a01f050416b28c3142ac900"], "tokens": ["0x924EC7ed38080E40396c46F6206A6d77D0B9f72d"] },
    },
  },
  "miner": {
    "misrepresentedTokens": true,
    "ethereum": {
      "tvl": { "owners": ["0x39cae2CE1bFC446d22b423D08CfC50F04DFD10b6","0xDc0fE7b8579995ABf20b1FCb61Fd57986844b6Ac"], "tokens": ["0x68BbEd6A47194EFf1CF514B50Ea91895597fc91E","0xDc0fE7b8579995ABf20b1FCb61Fd57986844b6Ac"] },
      "staking": { "owners": ["0x335D87736b4693E5ED3e5C4f6C737A5a87aFA029"], "tokens": ["0x23CbB9F0de3258DE03baaD2BCeA4FCCC55233af0"] },
    },
    "base": {
      "tvl": { "owners": ["0x335D87736b4693E5ED3e5C4f6C737A5a87aFA029"], "tokens": ["0x18A8BD1fe17A1BB9FFB39eCD83E9489cfD17a022"] },
    },
  },
  "unibtc": {
    "ethereum": {
      "tvl": { "owner": "0x047D41F2544B7F63A8e991aF2068a363d210d6Da", "tokens": ["0x2260fac5e5542a773aa44fbcfedf7c193bc2c599","0xc96de26018a54d51c097160568752c4e3bd6c364","0xd681C5574b7F4E387B608ed9AF5F5Fc88662b37c"] },
    },
    "arbitrum": {
      "tvl": { "owner": "0x84E5C854A7fF9F49c888d69DECa578D406C26800", "tokens": ["0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f"] },
    },
    "mode": {
      "tvl": { "owner": "0x84E5C854A7fF9F49c888d69DECa578D406C26800", "tokens": ["0xcdd475325d6f564d27247d1dddbb0dac6fa0a5cf"] },
    },
    "optimism": {
      "tvl": { "owner": "0xF9775085d726E782E83585033B58606f7731AB18", "tokens": ["0x68f180fcCe6836688e9084f035309E29Bf0A2095"] },
    },
    "mantle": {
      "tvl": { "owner": "0xF9775085d726E782E83585033B58606f7731AB18", "tokens": ["0xc96de26018a54d51c097160568752c4e3bd6c364","0xd681C5574b7F4E387B608ed9AF5F5Fc88662b37c"] },
    },
    "bob": {
      "tvl": { "owner": "0x2ac98DB41Cbd3172CB7B8FD8A8Ab3b91cFe45dCf", "tokens": ["0x03c7054bcb39f7b2e5b2c7acb37583e32d70cfa3"] },
    },
    "zeta": {
      "tvl": { "owner": "0x84E5C854A7fF9F49c888d69DECa578D406C26800", "tokens": ["0x13A0c5930C028511Dc02665E7285134B6d11A5f4"] },
    },
    "bsc": {
      "tvl": { "owner": "0x84E5C854A7fF9F49c888d69DECa578D406C26800", "tokens": ["0xc96de26018a54d51c097160568752c4e3bd6c364","0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c"] },
    },
    "bsquared": {
      "tvl": { "owner": "0xF9775085d726E782E83585033B58606f7731AB18", "tokens": ["0x0000000000000000000000000000000000000000","0x4200000000000000000000000000000000000006"] },
    },
    "merlin": {
      "tvl": { "owner": "0xF9775085d726E782E83585033B58606f7731AB18", "tokens": ["0x0000000000000000000000000000000000000000","0xF6D226f9Dc15d9bB51182815b320D3fBE324e1bA","0xB880fd278198bd590252621d4CD071b1842E9Bcd"] },
    },
    "btr": {
      "tvl": { "owner": "0xF9775085d726E782E83585033B58606f7731AB18", "tokens": ["0x0000000000000000000000000000000000000000","0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f"] },
    },
  },
  "alienx": {
    "ethereum": {
      "tvl": { "owners": ["0x69aB55146Bc52A0b31F74dBDc527b8B7e9c7C27c","0x5625d2a46fc582b3e6dE5288D9C5690B20EBdb8D"], "tokens": ["0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1","0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","0xdac17f958d2ee523a2206206994597c13d831ec7"] },
    },
  },
  "aquabank": {
    "methodology": "TVL is calculated from the total supply of bUSDT, bUSDC, and bAUSD, each fully backed 1:1 by stablecoins deposited into Benqi and Euler vaults.",
    "avax": {
      "tvl": { "owners": ["0x7D336B49879a173626E51BFF780686D88b8081ec","0xb06DE2E9a339d201661045b7D845De3d20373b4F","0xcCB7De5b7788de551E3b85b50e4834D5B7e3F27c","0x61E8f77eD693d3edeCBCc2dd9c55c1d987c47775"], "tokens": ["0xd8fcDa6ec4Bdc547C0827B8804e89aCd817d56EF","0xa446938b0204Aa4055cdFEd68Ddf0E0d1BAB3E9E","0xB715808a78F6041E46d61Cb123C9B4A27056AE9C","0x190D94613A09ad7931FcD17CD6A8F9B6B47ad414"] },
    },
  },
  "unit": {
    "ethereum": {
      "tvl": { "owner": "0xb1cff81b9305166ff1efc49a129ad2afcd7bcf19", "tokens": ["0x92e187a03b6cd19cb6af293ba17f2745fd2357d5","0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44","0x2ba592F78dB6436527729929AAf6c908497cB200","0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","0x0Ae055097C6d159879521C384F1D2123D1f195e6","0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","0xbC396689893D065F41bc2C6EcbeE5e0085233447","0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9","0x4E15361FD6b4BB609Fa63C81A2be19d873717870","0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e","0xd533a949740bb3306d119cc777fa900ba034cd52","0x6b3595068778dd592e39a122f4f5a5cf09c90fe2","0x4688a8b1f292fdab17e9a90c8bc379dc1dbd8713","0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272","0xb753428af26e81097e7fd17f40c88aaa3e04902c","0xc944e90c64b2c07662a292be6244bdf05cda44a7","0x3472A5A71965499acd81997a54BBA8D852C6E53d","0xc5bddf9843308380375a611c18b50fb9341f502a","0x1337def16f9b486faed0293eb623dc8395dfe46a","0x2260fac5e5542a773aa44fbcfedf7c193bc2c599","0xeb4c2781e4eba804ce9a9803c67d0893436bb27d","0xd291e7a03283640fdc51b121ac401383a46cc623","0x6b175474e89094c44da98b954eedeac495271d0f"] },
    },
  },
  "perp": {
    "ethereum": {
      "staking": { "owners": ["0x0f346e19F01471C02485DF1758cfd3d624E399B4"], "tokens": ["0xbC396689893D065F41bc2C6EcbeE5e0085233447"] },
    },
    "optimism": {
      "tvl": { "owners": ["0xAD7b4C162707E0B2b5f6fdDbD3f8538A5fbA0d60"], "tokens": ["0x7F5c764cBc14f9669B88837ca1490cCa17c31607","0x94b008aa00579c1307b0ef2c499ad98a8ce58e58","0x4200000000000000000000000000000000000042","0x4200000000000000000000000000000000000006","0x2e3d870790dc77a83dd1d18184acc7439a53f475"] },
      "staking": { "owners": ["0xD360B73b19Fb20aC874633553Fb1007e9FcB2b78"], "tokens": ["0x9e1028F5F1D5eDE59748FFceE5532509976840E0"] },
    },
  },
  "bitmap-game": {
    "merlin": {
      "tvl": { "owners": ["0x8567bD39b8870990a2cA14Df3102a00A7d72f7E3","0xb311c4b8091aff30Bb928b17Cc59Ce5D8775b13A"], "tokens": ["0x5c46bFF4B38dc1EAE09C5BAc65872a1D8bc87378"] },
      "staking": { "owners": ["0x8567bD39b8870990a2cA14Df3102a00A7d72f7E3","0xb311c4b8091aff30Bb928b17Cc59Ce5D8775b13A"], "tokens": ["0x7b0400231Cddf8a7ACa78D8c0483890cd0c6fFD6"] },
    },
  },
  "nestfi": {
    "methodology": "TVL counts NEST tokens used as collateral by the protocol.",
    "bsc": {
      "tvl": { "owners": ["0x65e7506244CDdeFc56cD43dC711470F8B0C43beE"], "tokens": ["0x98f8669F6481EbB341B522fCD3663f79A3d1A6A7"] },
    },
    "ethereum": {
      "tvl": { "owners": ["0x12858F7f24AA830EeAdab2437480277E92B0723a"], "tokens": ["0x04abEdA201850aC0124161F037Efd70c74ddC74C"] },
    },
  },
  "impact-market": {
    "celo": {
      "tvl": { "__empty": true },
      "staking": { "tokensAndOwners": [["0x46c9757C5497c5B1f2eb73aE79b6B67D119B0B58","0x8f8BB984e652Cb8D0aa7C9D6712Ec2020EB1BAb4"]] },
    },
  },
  "memeta": {
    "manta": {
      "tvl": { "owner": "0xD76A1A03C4873042c50ba77cE455C793C70d1b2d", "tokens": ["0x0Dc808adcE2099A9F62AA87D9670745AbA741746","0xb73603c5d87fa094b7314c74ace2e64d165016fb","0xf417f5a458ec102b90352f697d6e2ac3a3d2851f","0x305E88d809c9DC03179554BFbf85Ac05Ce8F18d6"] },
    },
  },
  "dotflat": {
    "methodology": "TVL counts ETH collateral locked in CDP positions.",
    "start": "2025-01-21",
    "ethereum": {
      "tvl": { "owners": ["0xbCf58DE37791eFe60fE87a6d420FE8F7AEA99ef8"], "tokens": ["0x0000000000000000000000000000000000000000"] },
    },
  },
  "openLedger": {
    "ethereum": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0xC4B6A514449375eD2208E050540dBDf0dCAdA619","0xaDB85bDF08E492E9B62B0d0F705113d1E379ED85"], "tokens": ["0xA227Cc36938f0c9E09CE0e64dfab226cad739447"] },
    },
    "bsc": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0xaDB85bDF08E492E9B62B0d0F705113d1E379ED85"], "tokens": ["0xA227Cc36938f0c9E09CE0e64dfab226cad739447"] },
    },
    "open": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0xF8Cc9204543Bc0CBf289c7af5AD7E28441529150"], "tokens": ["0x0000000000000000000000000000000000000000"] },
    },
  },
  "blastup": {
    "hallmarks": [["2024-06-05","IDO Farming Launch"]],
    "blast": {
      "tvl": { "owners": ["0x0E84461a00C661A18e00Cab8888d146FDe10Da8D"], "tokens": ["0x4300000000000000000000000000000000000003","0x4300000000000000000000000000000000000004"] },
      "staking": { "owners": ["0x115ebda9489cf250ff0e8ea9f473c96c222a874c","0x2e36e05e7ecd36164ada93752a9a82c1efaa9582","0xf399110e921d25dd1ad6a0eef020991df3dd0cd3","0xb0d7902685a4f4d916a21a0ed721298d590cd9cd","0x520bf8e72f9e808102eb421fb03764624d1984e9","0xc3524c6fdce9e60c1a1ddce54953973264097542"], "tokens": ["0x59c159e5a4f4d1c86f7abdc94b7907b7473477f6","0xf8a5d147a3a3416ab151758d969eff15c27ab743"] },
    },
  },
  "zkdx": {
    "methodology": "zkDX counts the staking values as tvl",
    "era": {
      "tvl": { "owners": ["0x79033C597B7d8e752a7511cF24512f4A7217C0B8","0xd6cce119B45Efcb378a4735a96aE08826A37ca1c","0xDC9e925D2BB683d47203eCEddBD1d733EC035CaE","0xA9C595C8F718898f7eb96964Bc92517365c901C9"], "tokens": ["0x5aea5775959fbc2557cc8789bc1bf90a239d9a91","0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4"] },
    },
    "linea": {
      "tvl": { "owners": ["0x3e636c4dC9Bd55831055c3400160e1e8A25DaD8a","0xE0D1977a23cb90252B9997aB07b03136E214E0C6","0x3a85b87e81cD99D4A6670f95A4F0dEdAaC207Da0"], "tokens": ["0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f","0x176211869cA2b568f2A7D4EE941E073a821EE1ff"] },
    },
    "zklink": {
      "tvl": { "owners": ["0xb5e635f2cB9eAC385D679069f8e0d1740436b355","0xa6DbD1bdB1DC4339Df51d90Ce306CCE6edFbbbb1"], "tokens": ["0x0000000000000000000000000000000000000000","0x1a1a3b2ff016332e866787b311fcb63928464509"] },
    },
  },
  "g7": {
    "arbitrum": {
      "tvl": { "owners": ["0x404922a9B29b4a5205a6074AbA31A7392BD28944"], "tokens": ["0xaf88d065e77c8cC2239327C5EDb3A432268e5831"] },
    },
  },
  "felix-usdhl": {
    "ethereum": {
      "tvl": { "owners": ["0x36f586A30502AE3afb555b8aA4dCc05d233c2ecE"], "tokens": ["0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"] },
    },
    "hyperliquid": {
      "tvl": { "owners": ["0xb50a96253abdf803d85efcdce07ad8becbc52bd5"], "tokens": ["0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b"] },
    },
  },
  "aark": {
    "arbitrum": {
      "tvl": { "owner": "0x7A5df878e195D09F1C0bbba702Cfdf0ac9d0a835", "tokens": ["0x82af49447d8a07e3bd95bd0d56f35241523fbab1","0xff970a61a04b1ca14834a43f5de4533ebddb5cc8","0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F","0xaf88d065e77c8cC2239327C5EDb3A432268e5831","0x5979D7b546E38E414F7E9822514be443A4800529","0xda10009cbd5d07dd0cecc66161fc93d7c9000da1","0x912ce59144191c1204e64559fe8253a0e49e6548","0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9","0x9C2433dFD71096C435Be9465220BB2B189375eA7","0x6853EA96FF216fAb11D2d930CE3C508556A4bdc4","0x47c031236e19d024b42f8AE6780E44A573170703","0xC25cEf6061Cf5dE5eb761b50E4743c1F5D7E5407","0xD9535bB5f58A1a75032416F2dFe7880C30575a41","0xB686BcB112660343E6d15BDb65297e110C8311c4","0xec70dcb4a1efa46b8f2d97c310c9c4790ba5ffa8","0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f","0x9bEcd6b4Fb076348A455518aea23d3799361FE95"] },
    },
  },
  "sharwa-finance": {
    "start": 385225783,
    "methodology": "Sums tokens supplied to liquidity pools and assets stored in margin accounts.",
    "arbitrum": {
      "tvl": { "tokensAndOwners": [["0x82af49447d8a07e3bd95bd0d56f35241523fbab1","0xc2c105e981F46a011D19511F8a118991663B136b"],["0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f","0x20D96638DA7B7e8FD7B78427EA49048d4A847946"],["0xaf88d065e77c8cC2239327C5EDb3A432268e5831","0x02434cD23972C82FbAbf610D157b41bFB45A45a3"],["0xff970a61a04b1ca14834a43f5de4533ebddb5cc8","0x5c479762C8Fe57B6D874893a4B4932B40F612580"],["0xaf88d065e77c8cC2239327C5EDb3A432268e5831","0x5c479762C8Fe57B6D874893a4B4932B40F612580"],["0x82af49447d8a07e3bd95bd0d56f35241523fbab1","0x5c479762C8Fe57B6D874893a4B4932B40F612580"],["0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f","0x5c479762C8Fe57B6D874893a4B4932B40F612580"],["0xaf88d065e77c8cC2239327C5EDb3A432268e5831","0xA4113Ac6Cc41141B819f34d81F6ccdabcA07AecF"],["0x82af49447d8a07e3bd95bd0d56f35241523fbab1","0x2839851d52e4dce3c714D199716b5f0fc9dbbaAa"],["0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f","0x6302e6683422cAFdC48fBA98309b559AABa95386"],["0xaf88d065e77c8cC2239327C5EDb3A432268e5831","0x069cdfF47380bFcFa40D84f70834779DAaE96726"],["0xff970a61a04b1ca14834a43f5de4533ebddb5cc8","0x069cdfF47380bFcFa40D84f70834779DAaE96726"],["0x82af49447d8a07e3bd95bd0d56f35241523fbab1","0x069cdfF47380bFcFa40D84f70834779DAaE96726"],["0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f","0x069cdfF47380bFcFa40D84f70834779DAaE96726"]] },
    },
  },
  "paragons-dao": {
    "methodology": "TVL of ParagonsDAO corresponds to the staking of PDT tokens in the staking contract.",
    "start": 18751707,
    "base": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0x51e025cb3ee0b99a84f7fb80994198281e29aa3e"], "tokens": ["0xeff2A458E464b07088bDB441C21A42AB4b61e07E"] },
    },
  },
  "cardstarter": {
    "ethereum": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0xad2fd18932c39fa5085429853e1f0d39a65a438e"], "tokens": ["0x3d6f0dea3ac3c607b3998e6ce14b6350721752d9"] },
      "pool2": { "owners": ["0x7Dca3372A0a236A305FdEC3D48d52B09dff82E14"], "tokens": ["0x94ae6d2390680ac6e6ee6069be42067d6ad72e2a","0x984A3eAB3Cf2Fc2b4ca6E4A3768624a8272fe2a3","0x5b6be21c4d1f2c1c5A3d6Af3599f3BB0a785AE2F"] },
    },
  },
  "oceanpoint": {
    "ethereum": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0x13299657e662894b933Bb3Ee73F7f8dA94b55451","0x1802f66868d0649687a7a6bc9b8a4292e148daec","0x6f1e92fb8a685aaa0710bad194d7b1aa839f7f8a","0x57ba886442d248C2E7a3a5826F2b183A22eCc73e"], "tokens": ["0x509A38b7a1cC0dcd83Aa9d06214663D9eC7c7F4a"] },
      "pool2": { "owners": ["0x13299657e662894b933Bb3Ee73F7f8dA94b55451","0x1802f66868d0649687a7a6bc9b8a4292e148daec","0x6f1e92fb8a685aaa0710bad194d7b1aa839f7f8a","0x57ba886442d248C2E7a3a5826F2b183A22eCc73e"], "tokens": ["0x0E85fB1be698E777F2185350b4A52E5eE8DF51A6"] },
    },
  },
  "shimmerbridge": {
    "methodology": "Tokens bridged via shimmerbridge.org are counted as TVL",
    "misrepresentedTokens": true,
    "hallmarks": [["2023-12-27","First Launch"]],
    "ethereum": {
      "tvl": { "tokensAndOwners": [["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"],["0xdac17f958d2ee523a2206206994597c13d831ec7","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"],["0x2260fac5e5542a773aa44fbcfedf7c193bc2c599","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"],["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"]] },
    },
    "bsc": {
      "tvl": { "tokensAndOwners": [["0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"],["0x55d398326f99059ff775485246999027b3197955","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"],["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"]] },
    },
    "arbitrum": {
      "tvl": { "tokensAndOwners": [["0xaf88d065e77c8cC2239327C5EDb3A432268e5831","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"],["0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"],["0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"],["0x82af49447d8a07e3bd95bd0d56f35241523fbab1","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"]] },
    },
    "polygon": {
      "tvl": { "tokensAndOwners": [["0x3c499c542cef5e3811e1192ce70d8cc03d5c3359","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"],["0xc2132d05d31c914a87c6611c10748aeb04b58e8f","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"],["0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"],["0x7ceb23fd6bc0add59e62ac25578270cff1b9f619","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"],["0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"]] },
    },
    "base": {
      "tvl": { "tokensAndOwners": [["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"],["0x4200000000000000000000000000000000000006","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"]] },
    },
    "avax": {
      "tvl": { "tokensAndOwners": [["0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"],["0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"],["0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"]] },
    },
    "optimism": {
      "tvl": { "tokensAndOwners": [["0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"],["0x94b008aa00579c1307b0ef2c499ad98a8ce58e58","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"],["0x68f180fcCe6836688e9084f035309E29Bf0A2095","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"],["0x4200000000000000000000000000000000000006","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"]] },
    },
    "fantom": {
      "tvl": { "tokensAndOwners": [["0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"],["0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83","0x9C6D5a71FdD306329287a835e9B8EDb7F0F17898"]] },
    },
  },
  "creo": {
    "methodology": "TVL counted from the staking contract",
    "bsc": {
      "tvl": { "__empty": true },
      "staking": { "owner": "0x077bd3104413c555Aa985a585CE9D2174349ddc3", "tokens": ["0x9521728bF66a867BC65A93Ece4a543D817871Eb7"] },
    },
  },
  "gale": {
    "methodology": "Counts tokens on the windmill for tvl",
    "bsc": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0x0b374F3C618FF06583E7C4a1207bcaF22343737E"], "tokens": ["0x627E86E9eC832b59018Bf91456599e752288Aa97"] },
    },
  },
  "perion": {
    "ethereum": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0xf64F48A4E27bBC299273532B26c83662ef776b7e"], "tokens": ["0x60bE1e1fE41c1370ADaF5d8e66f07Cf1C2Df2268"] },
    },
  },
  "ethx": {
    "ethereum": {
      "tvl": { "owners": ["0x7b0Eff0C991F0AA880481FdFa5624Cb0BC9b10e1"], "tokens": ["0x0000000000000000000000000000000000000000","0xae7ab96520de3a18e5e111b5eaab095312d7fe84","0x5E8422345238F34275888049021821E8E08CAa1f","0xae78736cd615f374d3085123a210448e74fc6393"] },
    },
  },
  "kinetix-derivatives-v2": {
    "kava": {
      "tvl": { "owners": ["0xB5CE30B6EBAA252bDEac2F768EF9b1e4Bdf8d120"], "tokens": ["0x0000000000000000000000000000000000000000","0x919C1c267BC06a7039e03fcc2eF738525769109c"] },
    },
  },
  "aethir": {
    "ethereum": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0x3f69Bb14860f7F3348Ac8A5f0D445322143F7feE"], "tokens": ["0xbe0ed4138121ecfc5c0e56b40517da27e6c5226b"] },
    },
  },
  "reform": {
    "ethereum": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0x74ef3b69e8c475df8450eddda5dabd9b6dd17972"], "tokens": ["0xea3eed8616877F5d3c4aEbf5A799F2e8D6DE9A5E"] },
      "pool2": { "owners": ["0x74ef3b69e8c475df8450eddda5dabd9b6dd17972"], "tokens": ["0xf4e14a7766a3316d6cefbaec614c714f2d4965d8"] },
    },
  },
  "btcst": {
    "methodology": "Counts liquidty on all the Vaults through their Contracts",
    "bsc": {
      "tvl": { "owners": ["0x18a144B11feE170230177a481Ba5C2532c0279BD","0xeA17a97705BB74b2c6270830943b7663890D7ceB","0x216944bAf1182e49252223E78B783fE7d5a02223","0xDC06E57f3987feDdA1567b49791e78B4712E8A28","0x68C59C11601BcC6bc515137aD8063382446cBA77","0xb94B8e65FD03a7C5cB5bC39C604563ab8F800d21"], "tokens": ["0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c","0x2cd1075682b0fccaadd0ca629e138e64015ba11c","0xe550a593d09fbc8dcd557b5c88cea6946a8b404a","0xba2ae424d960c26247dd6c32edc70b295c744c43"] },
      "staking": { "owners": ["0x18a144B11feE170230177a481Ba5C2532c0279BD","0xeA17a97705BB74b2c6270830943b7663890D7ceB","0x216944bAf1182e49252223E78B783fE7d5a02223","0xDC06E57f3987feDdA1567b49791e78B4712E8A28","0x68C59C11601BcC6bc515137aD8063382446cBA77","0xb94B8e65FD03a7C5cB5bC39C604563ab8F800d21"], "tokens": ["0x78650B139471520656b9E7aA7A5e9276814a38e9"] },
    },
  },
  "treasury/shibui": {
    "boba": {
      "tvl": { "owners": ["0x9596E01Ad72d2B0fF13fe473cfcc48D3e4BB0f70"], "tokens": ["0xa18bf3994c0cc6e3b63ac420308e5383f53120d7","0x5de1677344d3cb0d7d465c10b72a8f60699c062d","0xcE9F38532B3d1e00a88e1f3347601dBC632E7a82","0x3f714fe1380ee2204ca499d1d8a171cbdfc39eaa"] },
    },
  },
  "treasury/maxapy": {
    "methodology": "Counts assets held by treasury in ERC4626 vault tokens",
    "start": 1729675931,
    "ethereum": {
      "tvl": { "owner": "0x5000Ba796Fd84a0f929AF80Cfe27301f0358F268", "tokens": ["0x9847c14FCa377305c8e2D10A760349c667c367d4"] },
    },
    "polygon": {
      "tvl": { "owner": "0x91044419869d0921D682a50B41156503A4E484F6", "tokens": ["0xA02aA8774E8C95F5105E33c2f73bdC87ea45BD29","0xE7FE898A1EC421f991B807288851241F91c7e376"] },
    },
    "base": {
      "tvl": { "owner": "0x5000Ba796Fd84a0f929AF80Cfe27301f0358F268", "tokens": ["0x7a63e8fc1d0a5e9be52f05817e8c49d9e2d6efae","0xb272e80042634bca5d3466446b0c48ba278a8ae5"] },
    },
  },
  "treasury/turtle": {
    "methodology": "Sums native CRO on Treasury, NFT contracts.",
    "cronos": {
      "tvl": { "tokensAndOwners": [["0x0000000000000000000000000000000000000000","0x88524dca00112b9915f73a1d25cb4140897a9f53"],["0x0000000000000000000000000000000000000000","0x2baa455e573df4019b11859231dd9e425d885293"]] },
    },
  },
  "treasury/gale": {
    "bsc": {
      "tvl": { "owners": ["0x973Abe726E3e37bbD8501B2D8909Fa59535Babdd"], "tokens": ["0xe9e7cea3dedca5984780bafc599bd69add087d56"] },
    },
  },
  "treasury/croblanc": {
    "cronos": {
      "tvl": { "owners": ["0xb20234c33337537111f4ab6f5EcaD400134aC143"], "tokens": ["0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23"] },
    },
  },
  "treasury/galaxygoogle": {
    "methodology": "Counts tokens on the treasury for tvl and staked GG for staking",
    "avax": {
      "tvl": { "owners": ["0xD5F922e23693e552793fE0431F9a95ba67A60A23","0xDEEdd1646984F9372Cc9D3d7E13AC1606cC2B548"], "tokens": ["0x130966628846BFd36ff31a822705796e8cb8C18D","0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7","0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd","0xe9E8d6b6ce6D94Fc9d724711e80784Ec096949Fc"] },
    },
    "bsc": {
      "tvl": { "owners": ["0xF76C9753507B3Df0867EB02D86d07C6fFcEecaf1"], "tokens": ["0xe9e7cea3dedca5984780bafc599bd69add087d56","0x13Cf29b3F58f777dDeD38278F7d938401f6b260c"] },
    },
  },
  "algoblocks": {
    "methodology": "We are computing the tvl from algoblocks staking pools.",
    "bsc": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0xaC87dE420894eAA8234d288334FAec08bB46ffe7"], "tokens": ["0xfecCa80fF6DeB2B492E93df3B67f0C523Cfd3a48"] },
    },
  },
  "gmsvaults": {
    "doublecounted": true,
    "methodology": "staked gms + vault balance",
    "base": {
      "tvl": { "owners": ["0xe1515D3A8c503a0fc68015844a9fc742D1c80927"], "tokens": ["0x2D5875ab0eFB999c1f49C798acb9eFbd1cfBF63c"] },
      "staking": { "owners": ["0x3D893CC2C70242907cAac245D04C565056174EF7"], "tokens": ["0x13dE6E0290C19893949650fe6fdf9CDfFAFa6040"] },
    },
  },
  "megamble": {
    "methodology": "TVL is the native ETH held in Megamble smart contracts (game pot, player credits, and referral balances). Treasury funds distributed externally are excluded.",
    "megaeth": {
      "tvl": { "owners": ["0x051B5a8B20F3e49E073Cf7A37F4fE2e5117Af3b6","0x9F0708145BCCD1F5B16F610cB8a75A63fA4A9a24"], "tokens": ["0x0000000000000000000000000000000000000000"] },
    },
  },
  "optfun": {
    "methodology": "Sum of all USDT deposits in Collateral Vault",
    "start": 6195000,
    "hyperliquid": {
      "tvl": { "owner": "0xaD7094D06818d9C0cce6D3f97E709D84f964F144", "tokens": ["0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb"] },
    },
  },
  "basafish": {
    "methodology": "Counts USDC and USDT held in the fund multi-sig wallet that receives user deposits.",
    "base": {
      "tvl": { "owners": ["0x7C4c871366F2Fd7ee891542fB1a0685096388824"], "tokens": ["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913","0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2"] },
    },
  },
  "jelly": {
    "misrepresentedTokens": true,
    "methodology": "TVL accounts for the liquidity on Sushiswap. Staking accounts for the JELLY locked in our farming contracts",
    "ethereum": {
      "tvl": { "__empty": true },
      "pool2": { "owners": ["0xF897C014a57298DA3453f474312079cC6cB140c0","0xcC43331067234a0014d298b5226A1c22cb0ac66a"], "tokens": ["0x64C2F792038f1FB55da1A9a22749971eAC94463E"] },
    },
  },
  "aurora-plus": {
    "methodology": "Aurora tokens locked in staking contract",
    "aurora": {
      "tvl": { "owners": ["0xf075c896cbbb625e7911e284cd23ee19bdccf299"], "tokens": ["0x8bec47865ade3b172a928df8f990bc7f2a3b9f79"] },
    },
  },
  "dexio-protocol": {
    "methodology": "TVL counts staked DEXI coins on the platform itself. CoinGecko is used to find the price of tokens in USD.",
    "polygon": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0x6e17539F792A31F39cEEc0BcaB4079032523e3c7","0x233a2901EB51380E7Bf30fA3D31d4c326471B489","0x0C693035837C52Da8c2A4505bdf0f2aC43f9909C","0xA17c08d8FC00481A937ecE7FDF5C94082bdFFE17"], "tokens": ["0x65ba64899c2c7dbfdb5130e42e2cc56de281c78b"] },
    },
    "kava": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0xB8e29c001E41Bc3A3dF7E1A549bdd898640189F5","0x732Bb01c38b7092eB554A7779ad5F7BCd3430266","0x5a4C7C9d3126C57CDDc7856dfA085e5B775ce212","0x6FA2d43f7D766Fd9b2990426a06Bb24B4FBcE959"], "tokens": ["0xd22a58f79e9481d1a88e00c343885a588b34b68b"] },
    },
  },
  "hotfries": {
    "bsc": {
      "tvl": { "owners": ["0x849741B79bc1618b46CF9ec600E94E771DEde601"], "tokens": ["0xe9e7cea3dedca5984780bafc599bd69add087d56"] },
    },
  },
  "dreamdex": {
    "methodology": "dreamDEX is a central limit order book (CLOB) spot exchange on Somnia. TVL is the base and quote token balances held on-chain by each market's SpotPool (resting-order principal plus internal ERC20Vault balances, including market-maker deposits) and its SpotStopOrderRegistry (native SOMI that funds stop-order execution). Base assets SOMI (native), USDC.e, WBTC and WETH are priced by DefiLlama. The quote asset USDso is a USD-pegged stablecoin backed 1:1 by FraxUSD (bridged via LayerZero).",
    "somnia": {
      "tvl": { "tokensAndOwners": [["0x28BEc7E30E6faee657a03e19Bf1128AaD7632A00","0x47fD2f18426f67106DBaC82F6d21D446c5F2120b"],["0x28BEc7E30E6faee657a03e19Bf1128AaD7632A00","0xD53E3F3b73513F2147377ef8f573f649cF60100c"],["0xC5098b3cA516784323872F17235fa074E167D3D2","0x25bfF6B7B5E2243424F38E75de7ab03C0522a5EA"],["0xC5098b3cA516784323872F17235fa074E167D3D2","0xed32F048D6a47923D38eCeD868d6f8b0eB4852bd"],["0x936ab8c674bcb567cd5deb85d8a216494704e9d8","0xa936da11B57b50A344e1293AAaE5232885ea2bDE"],["0x936ab8c674bcb567cd5deb85d8a216494704e9d8","0x9653a7355849B7691802A6AA49fDe18eF5ba633d"]] },
    },
  },
  "infinit": {
    "methodology": "INFINIT helps user execute transactions and earn yields and rewards on protocols. INFINIT does not hold custody of user's assets thus, it does not have any TVL. See the yield dashboard for a list of INFINIT strategies.",
    "bsc": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0xc8e6c14ccebed218a64df570025c5a1eeb0cdadc"], "tokens": ["0x61fac5f038515572d6f42d4bcb6b581642753d50"] },
    },
    "ethereum": {
      "tvl": { "__empty": true },
    },
    "arbitrum": {
      "tvl": { "__empty": true },
    },
    "base": {
      "tvl": { "__empty": true },
    },
    "optimism": {
      "tvl": { "__empty": true },
    },
    "sonic": {
      "tvl": { "__empty": true },
    },
    "hyperliquid": {
      "tvl": { "__empty": true },
    },
    "mantle": {
      "tvl": { "__empty": true },
    },
    "plasma": {
      "tvl": { "__empty": true },
    },
    "berachain": {
      "tvl": { "__empty": true },
    },
  },
  "instrumental": {
    "methodology": "Instrumental can be LP'ed and LP can be staked or locked (pool2s). Plus STRM itself can be locked against veSTRM (staking). Vaults coming soon.",
    "ethereum": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0x62ae88697782f474b2537b890733cc15d3e01f1d"], "tokens": ["0x0edf9bc41bbc1354c70e2107f80c42cae7fbbca8"] },
      "pool2": { "owners": ["0xc5124896459d3c219be821d1a9146cd51e4bc759","0x4f4f6b428af559db1dbe3cb32e1e3500deffa799"], "tokens": ["0xb301d7efb4d46528f9cf0e5c86b065fbc9f50e9a"] },
    },
  },
  "ubi-poh": {
    "methodology": "UBI/ETH and UBI/DAI LP can be staked in a uni-v2 pool2 contract",
    "ethereum": {
      "tvl": { "__empty": true },
      "pool2": { "owners": ["0xf9ae19cf447b3560afc407d9aac9e2007d4efe43","0x81c071e795ce29eb155c9818f06786640d0adb2b"], "tokens": ["0xea7952fac7ff6e997d895c1566599b86b91444c0","0xe632ded5195e945a31f56d674aab0c0c9e7e812c"] },
    },
  },
  "sparkdex-perps": {
    "flare": {
      "tvl": { "owners": ["0x74DA11B3Bb05277CF1cd3572a74d626949183e58"], "tokens": ["0x1d80c49bbbcd1c0911346656b529df9e5c2f783d","0x12e605bc104e93B45e1aD99F9e555f659051c2BB","0xe7cd86e13AC4309349F30B3435a9d337750fC82D","0xad552a648c74d49e10027ab8a618a3ad4901c5be"] },
    },
  },
  "corex": {
    "methodology": "Corex Markets TVL includes trader collaterals held in the Markets contract during active trades, plus vaults liquidity that backs trader profits and losses.",
    "core": {
      "tvl": { "owners": ["0xb212b1E9b00aD54fB5419E6231E0b4300dB9F40F","0xE82A6936CC50EBA10e424843CC348b9794244051","0xB42942DecDEE7ac9b2b1bb4bd2fE6a5DC7ae448f"], "tokens": ["0x900101d06a7426441ae63e9ab3b9b0f63be145f1","0x40375c92d9faf44d2f9db9bd9ba41a3317a2404f"] },
    },
  },
  "alphasec-bridge": {
    "methodology": "TVL is the total value of tokens locked in the AlphaSec bridge gateway contracts on Kaia L1.",
    "klaytn": {
      "tvl": { "tokensAndOwners": [["0x0000000000000000000000000000000000000000","0xF31CE581A8440f0f4850eDEb343a28372572a088"],["0xd077a400968890eacc75cdc901f0356c943e4fdb","0x483A9ed25747711F38778a69d4d99b7e5365e506"],["0x98a8345bb9d3dda9d808ca1c9142a28f6b0430e1","0x483A9ed25747711F38778a69d4d99b7e5365e506"],["0x02cbe46fb8a1f579254a9b485788f2d86cad51aa","0x483A9ed25747711F38778a69d4d99b7e5365e506"],["0x18bc5bcc660cf2b9ce3cd51a404afe1a0cbd3c22","0x483A9ed25747711F38778a69d4d99b7e5365e506"],["0x15d9f3ab1982b0e5a415451259994ff40369f584","0x483A9ed25747711F38778a69d4d99b7e5365e506"]] },
    },
  },
  "alpacacity": {
    "methodology": "Counts liquidity on the Farms through AlpacaFarm Contracts; and there are Staking and Pool2 parts only. We export the comunity amount as Treasury Part",
    "ethereum": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0x741Cee6e4Bd99Df866ab0dD0D0C0b5ED7033344A"], "tokens": ["0x7cA4408137eb639570F8E647d9bD7B7E8717514A"] },
      "pool2": { "owners": ["0x217a7D0Ac6573b0f013e12f92B6d5B250FA15D97"], "tokens": ["0x441f9e2c89a343cefb390a8954b3b562f8f91eca"] },
    },
    "bsc": {
      "staking": { "owners": ["0xa24FBFE379Ecb914c205BE4d9214592F64194059"], "tokens": ["0xc5E6689C9c8B02be7C49912Ef19e79cF24977f03"] },
      "pool2": { "owners": ["0x25B0dc84b62D7e2bd4eBba0Dda6C25E3e7c0D717","0x03625c4156A010065D135A18123a9e25FF5AEd12"], "tokens": ["0x4cC442220BE1cE560C1f2573f8CA8f460B3E4172","0x837cD42282801E340f1F17AAdf3166fEE99fb07c"] },
    },
  },
  "chapool": {
    "methodology": "TVL: USDT balance held by ChapoolEarnVault (1:1 custody; CPP rewards by weighted share). Staking: CPOT locked in VeCPOTLocker for veCPOT boost (up to +5% CPP rate).",
    "op_bnb": {
      "tvl": { "owners": ["0xA8C48A4443292a903BbAD19270dD268B9d42a546"], "tokens": ["0x9e5aac1ba1a2e6aed6b32689dfcf62a509ca96f3"] },
      "staking": { "owners": ["0xFACd2BB6332efDC116c48F4E952DF1a9515c8102"], "tokens": ["0x549d576069099F524A42ABa0b7CcB1b9b148B505"] },
    },
  },
  "tranche": {
    "start": "2021-05-18",
    "ethereum": {
      "tvl": { "owners": ["0x05060F5ab3e7A98E180B418A96fFc82A85b115e7","0xAB4235a9ACf00A45557E90F7dB127f3b293cA45A"], "tokens": ["0x39aa39c021dfbae8fac545936693ac917d5e7563","0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643","0x0AeE8703D34DD9aE107386d3eFF22AE75Dd616D1","0xccf4429db6322d5c611ee964527d42e5d685dd6a","0xface851a4921ce59e912d19329929ce6da6eb0c7"] },
    },
    "fantom": {
      "tvl": { "owners": ["0xe572401aFa7405Ea8EBf657D2b2Ed0Bce0bCf288"], "tokens": ["0x637ec617c86d24e421328e6caea1d92114892439","0x0a0b23d9786963de69cb2447dc125c49929419d8","0xef0210eb96c7eb36af8ed1c20306462764935607","0x0dec85e74a92c52b7f708c4b10207d9560cefaf0","0x2c850cced00ce2b14aa9d658b7cad5df659493db"] },
    },
    "avax": {
      "tvl": { "owners": ["0x50F0C239f51d470BFDEb2E76E0E76D4344D89D6B"], "tokens": ["0xd45b7c061016102f9fa220502908f2c0f1add1d7","0x47afa96cdc9fab46904a55a6ad4bf6660b53c38a","0x46a51127c3ce23fb7ab1de06226147f446e4a857","0x532e6537fea298397212f09a61e03311686f548e","0xdfe521292ece2a4f44242efbcd66bc594ca9714b","0x686bef2417b6dc32c50a3cbfbcc3bb60e1e9a15d","0x53f7c5869a859f0aec3d334ee8b4cf01e3492f21"] },
    },
    "polygon": {
      "tvl": { "owners": ["0x03f44E563dD447449F48f8103b5dF70aFf7CF577"], "tokens": ["0x1a13f4ca1d028320a707d99520abfefca3998b7f","0x8df3aad3a84da6b69a4da8aec3ea40d9091b2ac4","0x27f8d03b3a2196956ed754badc28d73be8830a6e"] },
    },
  },
  "derify": {
    "bsc": {
      "tvl": { "owners": ["0x75777494496f6250DdB9A1B96a6203e219d3698f"], "tokens": ["0xe9e7cea3dedca5984780bafc599bd69add087d56"] },
    },
  },
  "openoracle": {
    "methodology": "TVL is the native ETH and USDC held by the openOracle contract on Base.",
    "base": {
      "tvl": { "owner": "0xa731450131bE0120420e211a35704A19382489fb", "tokens": ["0x0000000000000000000000000000000000000000","0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"] },
    },
  },
  "linehub-perps": {
    "linea": {
      "tvl": { "owners": ["0xC94cFd8F4fB8Ef3EB360Ec92e2A9Ca969Cadf095","0x00744A65cFC59ACBa312Ade7ABf77379A041Ae26"], "tokens": ["0x0000000000000000000000000000000000000000","0x176211869cA2b568f2A7D4EE941E073a821EE1ff"] },
    },
  },
  "zeno": {
    "start": "2024-03-13",
    "metis": {
      "tvl": { "owner": "0xFaEee486F4A53cdBEaBE37216bcf1016eB4E52D6", "tokens": ["0x420000000000000000000000000000000000000a","0xea32a96608495e54156ae48931a7c20f0dcc1a21","0xbb06dca3ae6887fabf931640f67cab3e3a16f4dc"] },
    },
  },
  "vest": {
    "methodology": "Total USDC locked in the Vest Exchange.",
    "start": "2024-03-17",
    "era": {
      "tvl": { "owners": ["0xf7483A1464DeF6b8d5A6Caca4A8ce7E5be8F1F68","0x7ccF5BbeC69c790D27dA3b5398B9e0d6D6EeC9F3","0xf0bcF4eDe69e5cb0EB1c9E35b4d408a5e7fdA56b"], "tokens": ["0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4"] },
    },
    "base": {
      "tvl": { "owners": ["0xE80F92077131b9890599E418AE323de71cE1C35a","0x32d95F243F9E2c1344E4BAa91a8D32711527ef7e"], "tokens": ["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"] },
    },
    "optimism": {
      "tvl": { "owners": ["0xE80F92077131b9890599E418AE323de71cE1C35a"], "tokens": ["0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85"] },
    },
    "ethereum": {
      "tvl": { "owners": ["0xE80F92077131b9890599E418AE323de71cE1C35a"], "tokens": ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"] },
    },
    "polygon": {
      "tvl": { "owners": ["0xE80F92077131b9890599E418AE323de71cE1C35a"], "tokens": ["0x3c499c542cef5e3811e1192ce70d8cc03d5c3359"] },
    },
    "arbitrum": {
      "tvl": { "owners": ["0x80C526d1c2fddADB3Cd39810cd7A79E07b0EDa00"], "tokens": ["0xaf88d065e77c8cC2239327C5EDb3A432268e5831"] },
    },
    "bsc": {
      "tvl": { "owners": ["0xef14da66876476C1A75dC057343B97b6Bd372c41"], "tokens": ["0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"] },
    },
  },
  "unifi-protocol-staking": {
    "timetravel": false,
    "misrepresentedTokens": true,
    "harmony": {
      "tvl": { "__empty": true },
    },
    "icon": {
      "tvl": { "__empty": true },
    },
    "ontology": {
      "tvl": { "__empty": true },
    },
    "tron": {
      "tvl": { "__empty": true },
    },
    "iotex": {
      "tvl": { "__empty": true },
    },
  },
  "kerne-protocol": {
    "methodology": "TVL is the USDC reserve held by Kerne's Peg Stability Module (PSM) contracts on Base, which back all circulating kUSD 1:1. kUSD is minted 1:1 from USDC through the live mint PSM (0xaBDE1138) and redeemed 1:1 back to USDC through the redeem PSM (0xFf3025ec); a prior mint PSM (0x07eBb486) still retains USDC from earlier mints. All PSM USDC reserves are summed; the kUSD supply itself is not added (that would double count). This matches the published headline TVL at kerne.fi/api/stats. The v1 KerneVault is intentionally excluded: it has been superseded by a v2 redeploy, its deposits are disabled, and its totalAssets() reports off-chain balances that are not part of the on-chain PSM reserves.",
    "base": {
      "tvl": { "owners": ["0xaBDE1138aa1Ce88d1dF06422C0c3b05D70569803","0x07eBb486e11BD217e6085eb5ab663e4517595993","0xFf3025ec18e301855aB0f36Ec6ECa115a29A5Fbc"], "tokens": ["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"] },
    },
  },
  "allspark": {
    "methodology": "allspark counts the staking values as tvl",
    "zklink": {
      "tvl": { "owners": ["0xD06B5A208b736656A8F9cD04ed43744C738BD8A9"], "tokens": ["0x0000000000000000000000000000000000000000"] },
    },
  },
  "bogged": {
    "bsc": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0xc3ab35d3075430f52D2636d08D4f29bD39a18B65","0xcD48268d66068963242681Ed7ca39d349Fb690B9","0x2F0596b989d79fda9b0A89F57D982ea02f8D978B"], "tokens": ["0xb09fe1613fe03e7361319d2a43edc17422f36b09"] },
      "pool2": { "owners": ["0x2F0596b989d79fda9b0A89F57D982ea02f8D978B","0xc3ab35d3075430f52D2636d08D4f29bD39a18B65"], "tokens": ["0xdD901faf9652D474b0A70263E13DA294990d49AE"] },
    },
  },
  "nftb": {
    "methodology": "TVL comes from the Staking Vaults and Launchpad Tiers",
    "bsc": {
      "tvl": { "tokensAndOwners": [["0xde3dbbe30cfa9f437b293294d1fd64b26045c71a","0x0158aF415642A0879802cdb2e1347f0Af1b47eF9"],["0xde3dbbe30cfa9f437b293294d1fd64b26045c71a","0x1240F9904c02d7e48FF03a7C71894bF2530838EB"],["0xde3dbbe30cfa9f437b293294d1fd64b26045c71a","0x50D888179581D540753Aa6E2B6fe5EDCa594158a"],["0xde3dbbe30cfa9f437b293294d1fd64b26045c71a","0xB634a7f635C6367C7F07485363750C09184Fd3F4"],["0xde3dbbe30cfa9f437b293294d1fd64b26045c71a","0x45994757C035892AE66b91925a4Cf561D6aa66f6"],["0xde3dbbe30cfa9f437b293294d1fd64b26045c71a","0x1b5A0D734786ef666abCDfD4153f3EaB9062a1F8"],["0xde3dbbe30cfa9f437b293294d1fd64b26045c71a","0x1386FdB83a0Ce87E146E8BCF807F2B969D29A97a"],["0xde3dbbe30cfa9f437b293294d1fd64b26045c71a","0x3a154b615447CD79D5617CD864d693e9CdD95685"],["0xde3dbbe30cfa9f437b293294d1fd64b26045c71a","0x44D86d4DE4bAe10c85Da7C7D2CDC3333b4b515C8"],["0xf81628edeb110a73c016ab7afa57d80afae07f59","0xC5d72B45C09d2509e66F78D19BfA3B5DD7C04f5a"],["0xf81628edeb110a73c016ab7afa57d80afae07f59","0x3213F00f2aa67BdC6eCF1502C99cCA044C87690F"],["0xf81628edeb110a73c016ab7afa57d80afae07f59","0x3746ff9590A1ca9bC9a2067481324a75d3C528Ef"],["0x22168882276e5d5e1da694343b41dd7726eeb288","0x01ba0f95Ca1Ba5Dd9981398fE79103F058381B12"],["0x22168882276e5d5e1da694343b41dd7726eeb288","0x83ed2A12943c67e66f4084368A07F2B51CbF5e51"],["0x22168882276e5d5e1da694343b41dd7726eeb288","0x3314CfD1c5538c7521790347FA129ec23FEDED4E"],["0xE69cAef10A488D7AF31Da46c89154d025546e990","0x40F75a74D725e31aD2E609c11068931B64e30b8D"],["0xE69cAef10A488D7AF31Da46c89154d025546e990","0x8040ddeAf7f5F961e1F7B82d434541EA4215c42E"],["0xE69cAef10A488D7AF31Da46c89154d025546e990","0xe88933A9F3aeBf01eB2EEb6E77040DbB924f2698"],["0x205f93cd558aac99c4609d0511829194b5405533","0xD260D4Ca6d00386a23acA47ACE37217b23F37582"],["0x205f93cd558aac99c4609d0511829194b5405533","0x1Aa2E43Ff8591865b0575E905331da2Bb6C0FfEE"],["0x205f93cd558aac99c4609d0511829194b5405533","0x4915B0b43a0B8ccbec1cB8EE4112EF3644F75Df6"]] },
    },
  },
  "vanillaFinance": {
    "bsc": {
      "tvl": { "owners": ["0x994B9a6c85E89c42Ea7cC14D42afdf2eA68b72F1","0xaAd5005D2EF036d0a8b0Ab5322c852e55d9236cF"], "tokens": ["0x55d398326f99059ff775485246999027b3197955"] },
    },
  },
  "foxify": {
    "methodology": "Counts the totalSupply of Foxify protocol tokens and totalAssets from Arbitrum contract",
    "sonic": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0xBD87A909F9A40FdaD6D9BE703E89A0383064D0Ab","0x3725B740b33E75898e4e2E616E9BB519884edd37"], "tokens": ["0x261dfa2528dfa19011f10b168c856e02baaf0eb6"] },
    },
    "arbitrum": {
      "tvl": { "owners": ["0xe5a4f22fcb8893ba0831babf9a15558b5e83446f"], "tokens": ["0xaf88d065e77c8cC2239327C5EDb3A432268e5831"] },
    },
  },
  "rss3-staking": {
    "hallmarks": [["2024-03-10","Mainnet Alpha Staking Launch"]],
    "rss3_vsl": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0x28F14d917fddbA0c1f2923C406952478DfDA5578"], "tokens": ["0x4200000000000000000000000000000000000042"] },
    },
  },
  "veil": {
    "base": {
      "tvl": { "tokensAndOwners": [["0x0000000000000000000000000000000000000000","0x6c206B5389de4e5a23FdF13BF38104CE8Dd2eD5f"],["0x0000000000000000000000000000000000000000","0xC53510D6F535Ba0943b1007f082Af3410fBeA4F7"],["0x0000000000000000000000000000000000000000","0x844bB2917dD363Be5567f9587151c2aAa2E345D2"],["0x0000000000000000000000000000000000000000","0xD3560eF60Dd06E27b699372c3da1b741c80B7D90"],["0x0000000000000000000000000000000000000000","0x9cCdFf5f69d93F4Fcd6bE81FeB7f79649cb6319b"],["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913","0xA4dB5eC5d0a2ee01CcD8D6e2e53224CF4E81A9b3"],["0x4200000000000000000000000000000000000006","0x293dcda114533ff8f477271c5ca517209ffdeee7"]] },
      "staking": { "owners": ["0x3225b5a7c842cC227C773636F5C574443C62bb86"], "tokens": ["0x767A739D1A152639e9Ea1D8c1BD55FDC5B217D7f"] },
    },
  },
  "stipend": {
    "kava": {
      "tvl": { "owners": ["0xfc30fE377f7E333cC1250B7768107a7Da0277c44"], "tokens": ["0xc86c7c0efbd6a49b35e8714c5f59d99de09a225b"] },
    },
  },
  "taikodrips": {
    "methodology": "We count the TVL on the Taiko token in the farming contract.",
    "taiko": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0xf90209C44dBf5Fa3d40ac85a008206b5A8c24899"], "tokens": ["0xA9d23408b9bA935c230493c40C73824Df71A0975"] },
    },
  },
  "freeliquid": {
    "methodology": "Counts liquidity on the Save through StakingReward Contracts",
    "ethereum": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0x5E4935fe0f1f622bfc9521c0e098898e7b8b573c","0x975Aa6606f1e5179814BAEf22811441C5060e815"], "tokens": ["0xffed56a180f23fd32bc6a1d8d3c09c283ab594a8"] },
      "pool2": { "owners": ["0x001F7C987996DBD4f1Dba243b0d8891D0Bf693A2","0x34e2B546D1819fE428c072080829028aF36540DD"], "tokens": ["0xA8216F6eb1f36E1dE04D39C3BC7376D2385f3455","0x85790C03400b7F6d35895dBB7198c41ecDe4a7F7","0xeDf7a6fB0d750dd807375530096Ebf2e756eaEE0","0x481c830edC1710E06e65c32bd7c05ADd5516985b","0xc869935EFE9264874BaF7940449925318f193322","0xF03756E7a2B088A8c5D042C764184E8748dFA10d","0x6E35996aE06c45E9De2736C44Df9c3f1aAb781af","0xeC314D972FC771EAe56EC5063A5282A554FD54a2"] },
    },
  },
  "roseonx": {
    "hallmarks": [["2023-10-16","RoseonX Launch"]],
    "arbitrum": {
      "tvl": { "owners": ["0x832f80e93c77966dd343810c254f10ad58d9876d"], "tokens": ["0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"] },
      "staking": { "owners": ["0x42fa477A24d5471A24b798d5B4d9eC3a2C3dD49a"], "tokens": ["0xDC8184ba488e949815d4AAfb35B3c56ad03B4179"] },
    },
  },
  "exodia": {
    "methodology": "Counts tokens on the treasury for TVL and staked EXOD for staking",
    "fantom": {
      "tvl": { "owners": ["0x6a654d988eebcd9ffb48ecd5af9bd79e090d8347"], "tokens": ["0xfb98b335551a418cd0737375a2ea0ded62ea213b","0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e","0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83","0x91fa20244fb509e8289ca630e5db3e9166233fdc"] },
      "staking": { "owners": ["0x8b8d40f98a2f14e2dd972b3f2e2a2cc227d1e3be"], "tokens": ["0x3b57f3feaaf1e8254ec680275ee6e7727c7413c7"] },
    },
  },
  "molten-network": {
    "arbitrum": {
      "tvl": { "owners": ["0x5a6f8ea5e1028C80CB98Fd8916afBBC4E6b23D80","0xE1d32C985825562edAa906fAC39295370Db72195"], "tokens": ["0x82af49447d8a07e3bd95bd0d56f35241523fbab1","0xaf88d065e77c8cC2239327C5EDb3A432268e5831"] },
    },
  },
  "boltz": {
    "methodology": "TVL accounts for current Boltz RBTC balance on Rootstock and tBTC balance on Arbitrum",
    "rsk": {
      "tvl": { "owner": "0x1Bdf482F5da32ef51c20D9A94960385c5be9AaB7", "tokens": ["0x0000000000000000000000000000000000000000"] },
    },
    "arbitrum": {
      "tvl": { "owner": "0xa6d0956216da39aa1989066a9b22b64c30924dcd", "tokens": ["0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40"] },
    },
  },
  "wbrockstaking": {
    "methodology": "Wrapped Bitrock tokens locked in staking contract",
    "bitrock": {
      "tvl": { "owners": ["0x1a71F508d536c7Ab1D1B53a5D261abD494524C96"], "tokens": ["0x413f0e3a440aba7a15137f4278121450416882d5"] },
    },
    "ethereum": {
      "tvl": { "owners": ["0x46363C31Be0c677Bd6F3eD429686753794ee8b97"], "tokens": ["0xde67d97b8770dc98c746a3fc0093c538666eb493"] },
    },
  },
  "kalmydas": {
    "methodology": "TVL is the sum of tokens (USDC, WETH, KAL) held by the KalSwap liquidity pairs plus the USDC held by the five KalPool strategy vaults (deposits and platform reserve) on Base mainnet. USDC temporarily allocated to the on-chain operator (max 20% of each vault reserve) leaves the vaults while a trade is open and returns on close. KAL staked single-side and KAL locked in veKAL are reported under staking.",
    "base": {
      "tvl": { "owners": ["0x3315E6E788E2B30aF8f4c35124695E60D510c31B","0xEA071fa5a8aD4dEa8c672569da366D7d90E5924d","0x83c26f5C90B81adDf50845CCFCdcd02B819ADeB5","0x96869F08F5B5C52664c9620269394eFF4efd065b","0x6dd6e7A6154293b22Dcd5d07d8f61F446646B15d","0x9A9990fdFf702f7aEd10f873eeD2baB60e493038","0x03FEC25393C38cC5DE1F2D2DB620b8478cAC4Ae0","0x55F8D85749EA9C374b3aBFaEF7B07429546F6A97"], "tokens": ["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913","0x4200000000000000000000000000000000000006","0xe99556D5594faf533fcB346A8a9B11259D29afA8"] },
      "staking": { "owners": ["0xF392A8F1B6c85f607F988B44EcAE2B4d652585f5","0x58CfcB5A67Aac6255cA13771EbdCFF45bAd5d605"], "tokens": ["0xe99556D5594faf533fcB346A8a9B11259D29afA8"] },
    },
  },
  "sfi": {
    "ethereum": {
      "tvl": { "owners": ["0xd8831608954c7C4044938aC76E32dA81d692f0a6"], "tokens": ["0x018008bfb33d285247A21d44E50697654f754e63","0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c","0x23878914EFE38d27C4D67Ab83ed1b93A74D4086a"] },
    },
  },
  "basis-cash": {
    "ethereum": {
      "tvl": { "tokensAndOwners": [["0x6b175474e89094c44da98b954eedeac495271d0f","0xEBd12620E29Dc6c452dB7B96E1F190F3Ee02BDE8"],["0x57Ab1ec28D129707052df4dF418D58a2D46d5f51","0xdc42a21e38c3b8028b01a6b00d8dbc648f93305c"],["0xdac17f958d2ee523a2206206994597c13d831ec7","0x2833bdc5B31269D356BDf92d0fD8f3674E877E44"],["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","0x51882184b7F9BEEd6Db9c617846140DA1d429fD4"],["0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8","0xC462d8ee54953E7d7bF276612b75387Ea114c3bf"]] },
    },
  },
  "baseprotocol": {
    "misrepresentedTokens": true,
    "methodology": "Counts liquidty on the staking and pool2s only",
    "ethereum": {
      "tvl": { "__empty": true },
      "staking": { "owners": ["0x15AE3846d7183Ba27Ad5772FeC55aeeFdd365975","0x6f29466949de9E9Fb906193b97916739Fa982cB5","0x1EF25079FB3F74856A31EF45dD925D203B168721","0x32260d3574E1c698Eb728Ac1E69DCf33f581C25b","0x84f0b803c7EA123fd1eE3e7Dd7aA6552f65dAc88"], "tokens": ["0x07150e919b4de5fd6a63de1f9384828396f25fdc"] },
      "pool2": { "owners": ["0x84f0b803c7EA123fd1eE3e7Dd7aA6552f65dAc88","0xef73903956E599611bF36aC1F209045544AAD423","0x6D075dF51cdF493FB3AA09f33166a9815339b206","0x3fa7D6dC3836B03d8766BBf5054ac0C2AcaB3Ae9"], "tokens": ["0xdE5b7Ff5b10CC5F8c95A2e2B643e3aBf5179C987"] },
    },
  },
  "crafting": {
    "methodology": "Counts tvl of all the Assets staked through Staking Contracts",
    "ethereum": {
      "tvl": { "owners": ["0x9353177049757A21f19a28C3055c03871e6428cf","0xF70A76AfFD4c368eD16a2593C4D9FAee3562a4Ba","0x321Fd763B8220b5697E41862AcAa41AeB1e2556d","0xF70A76AfFD4c368eD16a2593C4D9FAee3562a4Ba"], "tokens": ["0x0000000000000000000000000000000000000000","0x2260fac5e5542a773aa44fbcfedf7c193bc2c599","0xdac17f958d2ee523a2206206994597c13d831ec7","0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"] },
    },
    "aurora": {
      "tvl": { "owners": ["0xB0D10De43eb7D6F43e376aA5dA9022A9baB4313C","0x508df5aa4746bE37b5b6A69684DfD8BDC322219d"], "tokens": ["0x8bec47865ade3b172a928df8f990bc7f2a3b9f79","0xc42c30ac6cc15fac9bd938618bcaa1a1fae8501d"] },
    },
  },
  "lachainBridge": {
    "polygon": {
      "tvl": { "owners": ["0xE372D290F83c7487bdc925ddA187671bfF9e347b","0x82E4d5d7F36a22f2FEaaF87eCcDcDA7e0EFc98C3"], "tokens": ["0xc2132d05d31c914a87c6611c10748aeb04b58e8f","0x0000000000000000000000000000000000000000"] },
    },
    "bsc": {
      "tvl": { "owners": ["0xC926f267418d69147c88Edf88e93E78F2153f923","0x6571DD15430a455118EC6e24Dc7820489ED7019b"], "tokens": ["0x55d398326f99059ff775485246999027b3197955","0x0000000000000000000000000000000000000000"] },
    },
    "ethereum": {
      "tvl": { "owners": ["0xc7fc91a0a93d570738b2af6efb1595c3183809d7","0xAB49eb8Ca42f42fd7e8b745F2CC5BeDfb78d2D3E"], "tokens": ["0xdac17f958d2ee523a2206206994597c13d831ec7","0x0000000000000000000000000000000000000000"] },
    },
    "avax": {
      "tvl": { "owners": ["0xD4aE8F772dcf2e20b103c740AfD9D9f9E78dbfFC","0x8783256443217856B716464A068aabdecc3F0b95"], "tokens": ["0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7","0x0000000000000000000000000000000000000000"] },
    },
    "fantom": {
      "tvl": { "owners": ["0x012cebA65fD071473a9E0d3C5048702734a1eE5e","0x73Ec53a1Ee3Ea275D95212b41Dcce8cb9e0206Cd"], "tokens": ["0x049d68029688eabf473097a2fc38ef61633a3c7a","0x0000000000000000000000000000000000000000"] },
    },
    "arbitrum": {
      "tvl": { "owners": ["0xD4aE8F772dcf2e20b103c740AfD9D9f9E78dbfFC","0x43d92690D302C0e9f2fBD624eb9589F52b5AD115"], "tokens": ["0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9","0x0000000000000000000000000000000000000000"] },
    },
    "harmony": {
      "tvl": { "owners": ["0x0A19afbE4519A40Df3b48BE46EDc0720724B4A6B","0x5DDDc78C8a59CeD4d25a8FD96BF9D9FdA561D0FF"], "tokens": ["0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f","0x0000000000000000000000000000000000000000"] },
    },
    "heco": {
      "tvl": { "owners": ["0xbBF0b12A0Be425Db284905A3Cb0Ab72b178b6A4F","0x334d6D6c5EaE4bf5ec7De39a1547e6bDBdDcfbf3"], "tokens": ["0xa71edc38d189767582c38a3145b5873052c3e47a","0x0000000000000000000000000000000000000000"] },
    },
  },
  "brokoli": {
    "methodology": "Counts liquidty on the staking and pool2 only",
    "ethereum": {
      "tvl": { "__empty": true },
      "pool2": { "owners": ["0xd723e387D4B8a45d19C25a2e919F510C8B65eFe1","0x8C9e9635861b2C8A9C92D8319AfA2C2c6324b671"], "tokens": ["0xEBd17511F46A877199Ff08f0eA4f119c9b4Aea50"] },
    },
    "bsc": {
      "staking": { "owners": ["0x6A4fab0070f2402F00f12D54250E47BcE36c4F4e"], "tokens": ["0x66cafcf6c32315623c7ffd3f2ff690aa36ebed38"] },
      "pool2": { "owners": ["0x58351236275E6f378BB2211B9fd623fd6E5e9D17","0x9B937aB45Bab1e8CC4590eCF55dC5577caF89dE1"], "tokens": ["0x0e537bb44eb6064D12326fF2543d918e9b9a5482"] },
    },
  },
}
