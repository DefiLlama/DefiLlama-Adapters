// Just addresses by chains. No ABI/logic here.
    // Format:
    // {
    //   erc4626:        [vaultAddr, ...],
    //   issuanceTokens: [tokenAddr, ...],
    //   predeposit:     [tokenAddr, ...],
    //   boring:         [vaultAddr, ...],
    // }

const CONFIG = {
  ethereum: {
    erc4626: [
      '0xc824a08db624942c5e5f330d56530cd1598859fd', // Kelp High Growth ETH
      '0x59d675f75f973835b94d02b6d27b8539757dc65f', // Term UltraYield ETH
      '0x2be901715468c3c5393efa841525a713c583a8ec', // Term UltraYield USDC
      '0x0562ae950276b24f3eae0d0a518dadb7ad2f8d66', // Morpho Edge UltraYield USDC
      '0x9a6340ce1282e01cb4ec9faae5fc5f4b60ca8839', // Mellow UltraYield x Edge x Allnodes
      '0x8ecc0b419dfe3ae197bc96f2a03636b5e1be91db', // Kelp sbUSD Vault
      '0xeaa3b922e9febca37d1c02d2142a59595094c605', // Upshift upEDGE Vault
      '0x472425cc95be779126afa4aa17980210d299914f', // UltraYield BTC
      '0x546329a16dcedc46e93f7b03a65f49a84700bca1', // UltraYield USD
      '0xaa3cb36be406e6cf208d218fd214e0f1a71e957d', // LoopedBTC
      '0x965ec3552427b8258bd0a0c7baa234618fc98d01', // Edge UltraYield USDT (Morpho, Ethereum)
      '0xfacaa225fcfcd8644a77f2cce833907537198ae9', // Resolv USR Ecosystem Vault
    ],
    issuance: [
      '0xbb51e2a15a9158ebe2b0ceb8678511e063ab7a55', // Midas - mEDGE
      '0x2a8c22e3b10036f3aef5875d04f8441d4188b656', // Midas - mBASIS
      '0x2fe058ccf29f123f9dd2aec0418aa66a877d8e50', // Plasma syrupUSD
    ],
    predeposit: [
      '0x699e04f98de2fc395a7dcbf36b48ec837a976490', // Turtle tacUSD
    ],
  },
  hyperliquid: {
    erc4626: [
      '0xc061d38903b99ac12713b550c2cb44b221674f94', // Hyperbeat Ultra UBTC
      '0x96c6cbb6251ee1c257b2162ca0f39aa5fa44b1fb', // Hyperbeat Ultra HYPE
    ],
  },
  plume_mainnet: {
    issuance: [
      '0x69020311836d29ba7d38c1d3578736fd3ded03ed', // Midas - mEDGE
      '0x0c78ca789e826fe339de61934896f5d170b66d78', // Midas - mBASIS
    ],
  },
  base: {
    erc4626: [
      '0x5435bc53f2c61298167cdb11cdf0db2bfa259ca0', // Edge UltraYield USDC (Morpho, Base)
      '0x614bd506051a8ccfcbc57c34aedcf6caffcd5d17', // Euler Base WETH
      '0x1fd3a242a549d595431442f898fdbb374f15b885', // Euler Base wstETH
      '0xbc46393223990d024fcb2b0ff2f5a4cd52602ea2', // Euler Base ezETH
      '0xd7c286712bd46aa8acbec4ea99d3018b32edb190', // Euler Base wrsETH
      '0x78d6a3bc9d41b7c6fd52ff2e85a2df6d1f4f9b3a', // Euler Base cbBTC
      '0xa67a95971b8d010c16de4b33259d1c574d256121', // Euler Base LBTC
      '0x85114a78c512872df273ca12f35fbe4cf0749616', // Euler Base weETH
    ],
    issuance: [
      '0x1c2757c1fef1038428b5bef062495ce94bbe92b2', // Midas - mBASIS
    ],
  },
  etlk: {
    issuance: [
      '0x2247b5a46bb79421a314ab0f0b67ffd11dd37ee4', // Midas - mBASIS
    ],
  },
  tac: {
    erc4626: [
      '0xd5ffe1231f5610c68dd67ed3b870541d0a63af50', // Euler TAC sUSN
      '0xcc69e827ea1eb78da3ed1543256d3916b4078620', // Euler TAC USN
      '0xdd6eaef38f94d4724124cec14c819818714537ff', // Euler TAC USDT
      '0x73475c15fe4cb39ad0c58cb520e7a5771ae8fc44', // Euler TAC WETH
      '0x41068b2c61d535a370e39415e090ec2100b57934', // Euler TAC wstETH
      '0x72d0e285166b0dde84ee247c16e45979725d1399', // Euler TAC tsTON
      '0x2c8a93667d8909fa8f0c24f2c571c9163d3fb77a', // Euler TAC TON
      '0x994a7766a0e658098ca01a1adf114abd29e5629e', // Euler TAC cbBTC
      '0x522e6437b80b11c10aafdb321c3610b85127e4cd', // Euler TAC LBTC
      '0xe82a5ed2d6e0423317f2a7fdb3b21215411791e0', // Euler TAC RLP
      '0xf055eaa0802fd2a1a6320d2308925831092a534c', // Euler TAC wrsETH
      '0xcaa9c74f87d31bc280af5666bdc868dee2064fe8', // Euler TAC USR
      '0x921209493da603056de9b9a46ece14b996a75088', // Euler TAC wstUSR
    ],
    issuance: [
      '0x0e07999afff029894277c785857b4ca30ec07a5e', // Midas - mEDGE
      '0x06a317991f2f479a6213278b32d17a126fcab501', // UltraYield TacTON Vault
    ],
  },
  arbitrum: {
    erc4626: [
      '0x2d91466bcc6946b58869fe2ae521a856737c3f6e', // Edge UltraYield USDC (Morpho, Arbitrum)
    ],
  },
  linea: {
    erc4626: [
      '0x4789d8066cac17fd24f24206a49abc72830604f1', // Euler Linea WETH
      '0x1da14e692956382804a06ce38b984f56de457d7d', // Euler Linea weETH
      '0xe27c2571f6d1b942bbb438a37b0171c64b469e1f', // Euler Linea USDC
      '0x3cc7963fa503fe32053f177c444855a71068a839', // Euler Linea wstETH
      '0x140bd9a62ba84fbf78d9e3dd4a94fdafc999faf5', // Euler Linea wrsETH
    ],
  },
  monad: {
    erc4626: [
      '0x6b343f7b797f1488aa48c49d540690f2b2c89751', // Gearbox Monad USDC
      '0xc4173359087ce643235420b7bc610d9b0cf2b82d', // Gearbox Monad AUSD
      '0x164a35f31e4e0f6c45d500962a6978d2cbd5a16b', // Gearbox Monad USDT0
    ],
  },
  optimism: {
    erc4626: [
      '0x48921e52f70cec7d3425cf5103caace27fc0b2fe', // Edge UltraYield USDC (Morpho, Optimism)
      '0x53d83543a1462a3ec686bbcf36569ce24bdb87cc', // Gearbox Optimism USDC
    ],
  },
  plasma: {
    erc4626: [
      '0x53e4e9b8766969c43895839cc9c673bb6bc8ac97', // Gearbox Plasma USDT0
      '0x2ad9fd319b10bb59734e1dbbe42e0ad06869e2fb', // Euler Plasma USDT0 Earn
      '0xd3da8d58de01c99d9bb971ca284b89a2bb60798a', // Euler Plasma USDT0
      '0xf510385f5d74256bc677fbba4e0e3079be245bd2', // Euler Plasma sUSDe
      '0x230fb94b27da4e18f2eb6b66498ab3e9c860facd', // Euler Plasma syrupUSDT
      '0xa467ad3929e8ffdfd955f32756ec8b1522274ef2', // Euler Plasma USDe
    ],
  },
};

module.exports = { CONFIG };