const ADDRESSES = require('../helper/coreAssets.json')
const { getCuratorExport, getCuratorTvl } = require("../helper/curators");
const { ABI } = require("../helper/curators/configs");
const sui = require("../helper/chain/sui");

// ==============================================
// HYPERBEAT MAPPINGS CONFIGURATION
// ==============================================
const HYPERBEAT_MAPPINGS = [
  { vault: '0x5e105266db42f78fa814322bce7f388b4c2e61eb', underlying: ADDRESSES.corn.USDT0, isOneToOne: true, vaultDecimals: 18, underlyingDecimals: 6 }, // Hyperbeat USDT -> USDT0
  { vault: '0xd8fc8f0b03eba61f64d08b0bef69d80916e5dda9', underlying: '0x96C6cBB6251Ee1c257b2162ca0f39AA5Fa44B1FB' }, // Hyperbeat beHYPE -> HBHYPE
  { vault: '0x81e064d0eb539de7c3170edf38c1a42cbd752a76', underlying: ADDRESSES.hyperliquid.WHYPE }, // Hyperbeat lstHYPE -> WHYPE
  { vault: '0xd3a9cb7312b9c29113290758f5adfe12304cd16a', underlying: '0x5C9f0d8057bE5eD36EEEAB9b78B9c5c3f8126aB1' }, // Hyperbeat USR -> USR (ethereum address)
  { vault: '0x6eb6724d8d3d4ff9e24d872e8c38403169dc05f8', underlying: '0xf4D9235269a96aaDaFc9aDAe454a0618eBE37949', isOneToOne: true, vaultDecimals: 18, underlyingDecimals: 6 }, // Hyperbeat XAUt -> XAUT0
  { vault: '0xd19e3d00f8547f7d108abfd4bbb015486437b487', underlying: ADDRESSES.hyperliquid.WHYPE }, // Hyperbeat WHYPE -> WHYPE
  { vault: '0x3bcc0a5a66bb5bdceef5dd8a659a4ec75f3834d8', underlying: ADDRESSES.corn.USDT0, isOneToOne: true, vaultDecimals: 18, underlyingDecimals: 6 }, // Hyperbeat USDT0 -> USDT0
  { vault: '0x949a7250Bb55Eb79BC6bCC97fCd1C473DB3e6F29', underlying: ADDRESSES.corn.USDT0, isOneToOne: true, vaultDecimals: 18, underlyingDecimals: 6},
  { vault: '0xD66d69c288d9a6FD735d7bE8b2e389970fC4fD42', underlying: ADDRESSES.corn.USDT0, isOneToOne: true, vaultDecimals: 18, underlyingDecimals: 6},
    { vault: '0x057ced81348D57Aad579A672d521d7b4396E8a61', underlying: ADDRESSES.corn.USDT0, isOneToOne: true, vaultDecimals: 18, underlyingDecimals: 6},
];

// ==============================================
// EMBER MAPPINGS CONFIGURATION
// ==============================================
const EMBER_MAPPINGS = [
  { vault: '0x323578c2b24683ca845c68c1e2097697d65e235826a9dc931abce3b4b1e43642', type: 'btc', symbol: 'EBTC', coingeckoId: 'bitcoin' }, // Ember eBTC -> BTC (uses rate)
  { vault: '0x1fdbd27ba90a7a5385185e3e0b76477202f2cadb0e4343163288c5625e7c5505', type: 'basis', symbol: 'EBASIS', coingeckoId: 'usd-coin' } // Ember eBASIS -> USDC (direct)
];

// ==============================================
// GENERIC TVL CALCULATION FUNCTIONS
// ==============================================

const TVL_HANDLERS = {
  erc4626: async (api, vaults) => {
    const assets = await api.multiCall({ abi: ABI.ERC4626.asset, calls: vaults, permitFailure: true });
    const totalAssets = await api.multiCall({ abi: ABI.ERC4626.totalAssets, calls: vaults, permitFailure: true });
    
    for (let i = 0; i < assets.length; i++) {
      if (!assets[i] || !totalAssets[i]) continue;
      api.add(assets[i], totalAssets[i]);
    }
  },
  
  totalSupply: async (api, vaults) => {
    const totalSupplies = await api.multiCall({
      abi: 'uint256:totalSupply',
      calls: vaults,
      permitFailure: true
    });
    
    for (let i = 0; i < vaults.length; i++) {
      if (totalSupplies[i] === null || totalSupplies[i] === undefined) continue;
      api.add(vaults[i], totalSupplies[i]);
    }
  },
  
  mizuType: async (api, vaults) => {
    const [totalBalances, underlyingAssets] = await Promise.all([
      api.multiCall({
        abi: 'function getTotalBalance() view returns (uint256)',
        calls: vaults,
        permitFailure: true
      }),
      api.multiCall({
        abi: 'function asset() view returns (address)',
        calls: vaults,
        permitFailure: true
      })
    ]);
    
    for (let i = 0; i < vaults.length; i++) {
      if (totalBalances[i] === null || totalBalances[i] === undefined) continue;
      if (underlyingAssets[i] === null || underlyingAssets[i] === undefined) continue;
      api.add(underlyingAssets[i], totalBalances[i]);
    }
  },
  
  napierType: async (api, vaults) => {
    const [totalSupplies, underlyingAssets] = await Promise.all([
      api.multiCall({
        abi: 'uint256:totalSupply',
        calls: vaults,
        permitFailure: true
      }),
      api.multiCall({
        abi: 'function underlying() view returns (address)',
        calls: vaults,
        permitFailure: true
      })
    ]);
    
    for (let i = 0; i < vaults.length; i++) {
      if (totalSupplies[i] === null || totalSupplies[i] === undefined) continue;
      if (underlyingAssets[i] === null || underlyingAssets[i] === undefined) continue;
      api.add(underlyingAssets[i], totalSupplies[i]);
    }
  },
  
  hyperbeat: async (api, vaults) => {
    const totalSupplies = await api.multiCall({
      abi: 'uint256:totalSupply',
      calls: vaults,
      permitFailure: true
    });
    
    for (let i = 0; i < vaults.length; i++) {
      if (!totalSupplies[i] || totalSupplies[i] === '0') continue;
      
      const mapping = HYPERBEAT_MAPPINGS.find(m =>
          m.vault.toLowerCase() === vaults[i].toLowerCase()
      );
      
      if (mapping) {
        let amount = BigInt(totalSupplies[i]);
        
        if (mapping.isOneToOne && mapping.vaultDecimals && mapping.underlyingDecimals) {
          const decimalDiff = mapping.vaultDecimals - mapping.underlyingDecimals;
          if (decimalDiff > 0) {
            amount = amount / (10n ** BigInt(decimalDiff));
          }
        }
        
        api.add(mapping.underlying, amount.toString());
      } else {
        api.add(vaults[i], totalSupplies[i]);
      }
    }
  },

  ember: async (api, vaults) => {
    for (const vault of vaults) {
      try {
        const obj = await sui.getObject(vault);

        if (obj && obj.fields && obj.fields.receipt_token_treasury_cap) {
          const totalSupply = obj.fields.receipt_token_treasury_cap.fields.total_supply.fields.value;
          const rate = obj.fields.rate?.fields?.value; // Rate field for BTC calculation

          if (totalSupply) {
            const mapping = EMBER_MAPPINGS.find(m =>
              m.vault.toLowerCase() === vault.toLowerCase()
            );

            if (mapping) {
              let amount;

              if (mapping.type === 'basis') {
                // eBASIS: shares_supply_raw / 1e6
                amount = Number(totalSupply) / 1e6;
              } else if (mapping.type === 'btc' && rate) {
                // eBTC: (shares_supply_raw / 1e8) * (rate / 1e9)
                amount = (Number(totalSupply) / 1e8) * (Number(rate) / 1e9);
              } else {
                // Fallback
                amount = Number(totalSupply);
              }

              // Add using standard Sui token addresses
              if (mapping.coingeckoId === 'bitcoin') {
                // For BTC, use Sui WBTC address and convert to proper decimals
                const amountInSatoshi = Math.floor(amount * 1e8).toString();
                api.add(ADDRESSES.sui.WBTC, amountInSatoshi);
              } else if (mapping.coingeckoId === 'usd-coin') {
                // For USDC, use Sui USDC address and convert to proper decimals
                const amountInUsdc = Math.floor(amount * 1e6).toString();
                api.add(ADDRESSES.sui.USDC, amountInUsdc);
              } else {
                // Fallback: add as vault token
                api.add(vault, totalSupply);
              }
            } else {
              // Fallback to vault token
              api.add(vault, totalSupply);
            }
          }
        }
      } catch (error) {
        // If RPC call fails, add vault as token (fallback)
        api.add(vault, 0);
      }
    }
  }
};

// ==============================================
// VAULT CONFIGURATIONS BY BLOCKCHAIN
// ==============================================
const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by MEV Capital.',
  blockchains: {
    ethereum: {
      morpho: [
        '0xd63070114470f685b75b74d60eec7c1113d33a3d', // MEV Capital USDC
        '0x9a8bc3b04b7f3d87cfc09ba407dced575f2d61d8', // MEV Capital wETH
        '0xd50da5f859811a91fd1876c9461fd39c23c747ad', // MEV Capital Resolv USR
        '0x749794e985af5a9a384b9cee6d88dab4ce1576a1', // MEV Capital USD0
        '0x2f1abb81ed86be95bcf8178ba62c8e72d6834775', // Pendle WBTC
        '0x98cf0b67da0f16e1f8f1a1d23ad8dc64c0c70e0b', // MEV Capital cbBTC
        '0x28d24d4380b26a1ef305ad8d8db258159e472f33', // USUAL Vault
        '0xd41830d88dfd08678b0b886e0122193d54b02acc', // MEV Capital PTs USDC
        '0x1265a81d42d513df40d0031f8f2e1346954d665a', // MEV Capital Elixir USDC
        '0x5F7827FDeb7c20b443265Fc2F40845B715385Ff2', // MEV Capital EURCV
        '0x5422374B27757da72d5265cC745ea906E0446634', // MEV Capital USDCV
          '0xda4063ec62c3f3c1d2bdbf7dbfb2b2c906f8e8b2', // MORPHO USDT
          '0xc0a14627d6a23f70c809777ced873238581c1032', // MORPHO USD0
          '0x8e3c0a68f8065dc666065f16cf902596a60d540e', // MORPHO WBTC
      ],
      mellow: [
        '0x5fd13359ba15a84b76f7f87568309040176167cd', // Amphor Restaked ETH
        '0xc65433845ecd16688eda196497fa9130d6c47bd8', // Ethena LRT Vault ENA
        '0x0f37f1ff51fc2f8a9907ef3e226a12fdc47de4ad', // MEV Capital Lidov3 stVault x Kiln
        '0x73d596efeae0a6833079e4fc999fd5cee55770a5', // MEV Capital Lidov3 stVault x Nodeinfra
        '0x70558848f6b31ae03ad5a25868cd3d25e0fe8506', // MEV Capital Lidov3 stVault x Blockscape
        '0x1af14ebc81e8f92e0da13d2912091d556a4ac47b', // MEV Capital Lidov3 stVault x Alchemy
        '0x64047dd3288276d70a4f8b5df54668c8403f877f', // Amphor Restaked BTC
      ],
      symbiotic: [
        '0xdc47953c816531a8ca9e1d461ab53687d48eea26', // MEV Capital LBTC Vault
        '0xea0f2ea61998346ad39dddef7513ae90915afb3c', // MEV Capital Restaked LsETH Vault
        '0x0fdf3b986d62be6ae1d5228e5da90ff6f00c15f6', // MEV Capital USBD Vault
        '0x9205c82d529a79b941a9df2f621a160891f57a0d', // MEV Capital cbETH Vault
        '0xf60e6e6d8648fdbc2834ef7bc6f5e49ab55bec31', // MEV Capital mETH Vault
        '0xd25f31806de8d608d05dfeaeb1140c1d365864b3', // MEV Capital rETH Vault
        '0x446970400e1787814ca050a4b45ae9d21b3f7ea7', // MEV Capital restaked ETH
        '0x3b512427ca6345e67101eccb78d9c8508714818c', // MEV Capital sfrxETH Vault
        '0x4e0554959a631b3d3938ffc158e0a7b2124af9c5', // MEV Capital wstETH Vault
      ],
      euler: [
        '0xe2d6a2a16ff6d3bbc4c90736a7e6f7cc3c9b8fa9', // wETH
        '0xe3ea69f8661ffac04e269f99c14ba73e2bb10633', // ezETH
        '0x6b6976aa97cd2473b388fa9b9eeb8cca4f5a77a4', // wstETH
        '0xe00a44e1210bae0eaceeeaf202c349d4b16480fe', // pzETH
        '0x2306e17c7198282985a95b1ce0f63820846d0290', // INWSTETHS
        '0xb07bf05af5a13d357aa1220c661bb0fb791bedcb', // weETH
        '0x463af6add7b5806cf0ea30ec30f2030bf4f05175', // rstETH
        '0x0de3821015518a6179a51d27bc7ed4a0a3c45b52', // ETH+
        '0x1334d0e5ca5855a803998fcc78548142bef36e3b', // wstETH (7d)
        '0x01d1a1cd5955b2fefb167e8bc200a00bfada8977', // WOETH
        '0x9426c7a40d5c9dd709cbc2894a7e6481f265b6bb', // rETH
        '0xfc1b4e3d8291746ccdeb813805c8912bbe0a7316', // steakLRT
        '0xc5ff8dde483903ffd2fbe5bf54a02b80f2bae7f7', // amphrETH
        '0x9913790dd5d3d8389f682a15e4fa90a22891ff49', // rsETH
        '0x6c37d34a895456aa29cabe0cacb60fc56309c7ac', // cbETH
      ],
      terminal: [
        '0xa01227a26a7710bc75071286539e47adb6dea417', // Terminal tUSDe
        '0xa1150cd4a014e06f5e0a6ec9453fe0208da5adab', // Terminal tWETH
      ],
      midas: [
        '0x030b69280892c888670edcdcd8b69fd8026a0bf3', // Midas mMEV Vault
        '0xb64c014307622eb15046c66ff71d04258f5963dc', // Midas mevBTC Vault (price not in the api yet)
      ],
      upshift: [
        '0x5fde59415625401278c4d41c6befce3790eb357f', // The Treehouse Growth Vault
      ],
      termmax: [
        '0xdadeacc03a59639c0ece5ec4ff3bc0d9920a47ec', // Termmax wstETH Vault
      ],
      mizu: [
        '0x416ec6e04c009f9bae99a47ef836bf2cc64ec93c', // Hype ETH Deposit Vault (price not in the api yet)
        '0xd6fd5d4fa64fc7131e0ec3a4a53dc620a0ffc1bc', // Hype USD Deposit Vault (price not in the api yet)
        '0x164645fbc7220a3b4f8f5c6b473bcf1b6db146dd', // Hype BTC Deposit Vault (price not in the api yet)
      ],
      term: [
        '0xa10c40f9e318b0ed67ecc3499d702d8db9437228', // MEV Capital USDC
      ],
      napier: [
        '0x3bae96aa06fe7b52f28fd41e544cc76a5f532f81', // cUSDO
        '0xa97087d21d0b470cb1a09255d26e34e1a392cbfd', // MEV Capital Resolv USR (Morpho)
        '0xdc87d00d83153374e150d17b960fc74aa413d03a', // MEV Capital wETH (Morpho)
        '0x8eb9f9e97d6a63aab7572ad0d96fa3f09255cce9', // yUSD (v1)
      ],
        ipor: [

            '0xd731f94c778f7c1090e2e0d797150a647de5188a'
        ]
    },
    unichain: {
      morpho: [
        '0xc063181747e56c034ac14dc82db663409566fdf6', // MEV Capital USDC (Unichain)
        '0x3f93576d13091bfbf6825f7421ef33cc353dc433' // Morpho WETH Unichain Cluster
      ]
    },
    plume: {
      morpho: [
        '0x0b14d0bdaf647c541d3887c5b1a4bd64068fcda7', // Mystic pUSD MEV Capital
      ]
    },
    arbitrum: {
      morpho: [
          '0xa60643c90a542a95026c0f1dbdb0615ff42019cf', // Morpho USDC Cluster
          '0x9B33073eB98A9a1eb408DedcD08616fE850b3f09', // Morpho WETH Cluster
          '0x6d57dAd0F1c4da0C1d5443AE8F7f8a50BDb9Cf75'  // Morpho USDT0 Cluster
      ]
    },
    // solana: {
    //   kamino: [
    //     'QAYtEKciq4gc42K683rTaWu3JxqceA7JkEkZxwWUWBo', // MEV Capital SOL
    //     'EPC2N3AAv84P9TKsnDt2x41p6T7c5vTewBhQbh4RVx4r', // MEV CAPITAL USDC Prime
    //   ]
    // },
    berachain: {
      euler: [
        '0xd538b6aef78e4bdde4fd4576e9e3a403704602bc', // HONEY
        '0xad9e5e2647efb9137b6b8d688d4906fa51476870', // wBERA
        '0x1371dd58ce95ecd624340f072f97212a2661a280', // USDC.e
        '0x6d976915bd9de43de1a60c39e128e320dadda000', // wETH
        '0x558b16e07b8558b2a54946ca973b7b20b86a8b87', // USDe
        '0x3de0ca4af11108c94c9066a935ee67e53b7f9447', // sUSDe
        '0x2cccd307bb616e5f896ab61cae09ef4e5e9fedb7', // rUSD
        '0x413dfb1814a6b5fe4488c49f86e2a74d285ffd5b', // NECT
        '0x34018ac9dc4b114036ca148aa18c8f75594e5e95', // WBERA (Blue Cluster)
        '0x4eb3351066494852a03ffbbde40a9776380ce20d', // LBGT (Blue Cluster)
        '0x91e1ec1e948f635c127dad41eae1af899399f15a', // BYUSD
        '0x1dfb669df5e70d4238f2cc0a9ee3b1a21ff91bc0', // iBERA
        '0xb758d6ec8111feb9b0ec758a61b7874e5821dffd', // wBTC
        '0x85dba39b85218229a4c3b9b037d05cd6eb4cf05d', // beraETH (not in the api yet)
        '0xb8064453b25a91d7a4e8b7e7883a817d5742de34', // srUSD
        '0xbabf4ce18fbab547ad5939deff825f3e2f8d9402', // PT-sUSDE-25SEP2025
        '0x826244d9db2a0f438c3190a0f393c13d41ad7a2e', // STONE
      ],
    },
    bsc: {
      euler: [
        '0xd98125a23faeb48180e33ca6eef8f128e07418d1', // USDC
        '0x107a441c473517a37b03dcd8024c5b63e3cc13df', // wBNB
        '0x777c95b204e2ed3906885ef09f4531882587b52c', // BTCB
        '0xe54dffd36177975938a3873e522dee535adebe01', // USDT
        '0x7593931d08e3baa750ca3cb6a0d0fde6acd65107', // slisBNB
        '0x216f6d6c2ca15f83b656f3e9a8fcdf615dbc1710', // ETH
        '0x0dd93eb321a768a274d21062067b52527abd4506', // lisUSD
        '0xd6f4ee21c946071cf13d773e2ab1e31d44a27a54', // USDe
        '0x088241d1c5c951c59fb66083b291b69e3cc27e8c', // sUSDe
      ],
      lista: [
        '0x6402d64f035e18f9834591d3b994dfe41a0f162d', // MEV Capital USDT Vault
      ]
    },
    hyperliquid: {
      hyperbeat: [
        '0x5e105266db42f78fa814322bce7f388b4c2e61eb', // Hyperbeat USDT
        '0xd8fc8f0b03eba61f64d08b0bef69d80916e5dda9', // Hyperbeat beHYPE (price not in the api yet)
        '0x81e064d0eb539de7c3170edf38c1a42cbd752a76', // Hyperbeat lstHYPE (price not in the api yet)
        '0xd3a9cb7312b9c29113290758f5adfe12304cd16a', // Hyperbeat USR (price not in the api yet)
        '0x6eb6724d8d3d4ff9e24d872e8c38403169dc05f8', // Hyperbeat XAUt (price not in the api yet)
        '0xd19e3d00f8547f7d108abfd4bbb015486437b487', // Hyperbeat WHYPE (price not in the api yet)
        '0x3bcc0a5a66bb5bdceef5dd8a659a4ec75f3834d8', // Hyperbeat USDT0 (price not in the api yet)
        '0x949a7250Bb55Eb79BC6bCC97fCd1C473DB3e6F29', // Hyperbeat dnHYPE (price not in the api yet)
        '0xD66d69c288d9a6FD735d7bE8b2e389970fC4fD42', // Hyperbeat wVLP (price not in the api yet)
          '0x057ced81348D57Aad579A672d521d7b4396E8a61', // Hyperbeat USDC (price not in the api yet)
      ],
        morpho: [
            '0xdd1f54b1edc141f47ec5294ad5aa62243bfa6d59', // Morpho USR
            '0xd2af7ca672453604c537ca9d6293b224b7744d7a', // Morpho USR2
            '0xd19e3d00f8547f7d108abfd4bbb015486437b487', // Morpho WHYPE
            '0xd3a9cb7312b9c29113290758f5adfe12304cd16a', // Morpho USR3
            '0x8e1650d3343023c527b6a6cc0c2551bb100fe22b', // Morpho UBTC
            '0x4851d4891321035729713d43be1f4bb883dffd34', // Morpho USDC
            '0x3bcc0a5a66bb5bdceef5dd8a659a4ec75f3834d8' // Morpho USDT0
        ]
    },
    sonic: {
      euler: [
        '0x0806af1762bdd85b167825ab1a64e31cf9497038', // scETH
        '0xb38d431e932fea77d1df0ae0dfe4400c97e597b8', // scUSD
        '0x196f3c7443e940911ee2bb88e019fd71400349d9', // USDC.e
        '0x90a804d316a06e00755444d56b9ef52e5c4f4d73', // wS
        '0x6832f3090867449c058e1e3088e552e12ab18f9e', // stS
        '0xa5cd24d9792f4f131f5976af935a505d19c8db2b', // wETH
        '0x9144c0f0614dd0ace859c61cc37e5386d2ada43a', // wS
        '0x05d57366b862022f76fe93316e81e9f24218bbfc', // wstkscETH
        '0x1cda7e7b2023c3f3c94aa1999937358fa9d01aab', // wstkscUSD
        '0xfffc9d22304cf49784e9b31ddbeb066344b2b856', // PT-wstkscETH-29MAY2025
        '0xeeaab5c863f4b1c5356af138f384adc25cb70da6', // stS
        '0xf6e2ddf7a149c171e591c8d58449e371e6dc7570', // PT-wstkscUSD-29MAY2025
        '0xdbc46ff39cae7f37c39363b0ca474497dad1d3cf', // PT-stS-29MAY2025
        '0x08f04a3db30b0cd7e42e61b4e412b1123c52e8a1', // PT-aSonUSDC-14AUG2025
        '0x6f2ab32a6487a2996c74ed2b173dfdf3d5eedb58', // wOS
        '0xd506f1e4adfcf1196b7c5d2ebf4e858e33d7a93e', // PT-wOS-29MAY2025
        '0xb936137169d777fcb8b7cf02329620b78fccec0a', // PT-stS-29MAY2025 (bis)
        '0xdEBdAB749330bb976fD10dc52f9A452aaF029028', // xUSD
        '0x12ac805F4596C3E55bb100B4593A1B8025CD2056', // yUSD
        '0x8D024593d781B1C86EcD5d0f899d10C5E9de7069', // HLP0
        '0xC37fa1c70D77bdEd373C551a92bAbcee44a9d04E', // wmetaS
        '0x7aD07B280A17Ac7af489E487eaAf004b69786a0A', // x33
        '0xDE604f03E44247b31f71C4Fa055F9F3ea08D1271', // PT-wstkscETH-18DEC2025
        '0xF71B17cCF362B6dcC1b6917A05820477cF7802A0', // PT-stS-18DEC2025
        '0x6e14A20334724a194D2f8B38162522CAD202b986', // PT-wstkscUSD-18DEC2025
        '0x6F11663766bB213003cD74EB09ff4c67145023c5', // wmetaUSD
      ],
      napier: [
        '0x0532d4f06ba9b159d0b456662cc488eefe2fe34f', // scETH
      ]
    },
    avax:{
      silo: [
        '0x1f8e769b5b6010b2c2bbcd68629ea1a0a0eda7e3', // BTC.b
        '0x4dc1ce9b9f9ef00c144bfad305f16c62293dc0e8', // USDC
        '0x4c9edf85b8b33198f0c29a799965b6df1ae67435' // AVAX
      ]
    },
    sui: {
      ember: [
        "0x323578c2b24683ca845c68c1e2097697d65e235826a9dc931abce3b4b1e43642", // ember ebtc
        "0x1fdbd27ba90a7a5385185e3e0b76477202f2cadb0e4343163288c5625e7c5505" // ember basis
      ]
    },
      polygon: {
            morpho: [
                '0xf2532428472a4cbdf27f20ca39e81da6deb420b5', // Morpho USDC
            ]
      },
      base: {
            morpho: [
                '0x8773447e6369472d9b72f064ea62e405216e9084', // Morpho USDC
                '0x45f8cc9a58285b7e7000eb14738346569963179d' // Morpho LCAP
            ]
      }
  }
}



// ==============================================
// ADAPTER CONFIGURATION AND EXPORT
// ==============================================

const PROTOCOL_HANDLERS = {
  erc4626: ['upshift', 'term', 'termmax', 'lista', 'ipor'],
  totalSupply: ['terminal', 'midas'],
  mizuType: ['mizu'],
  napierType: ['napier'],
  hyperbeat: ['hyperbeat'],
  ember: ['ember']
};

function createChainTvlFunction(chainConfig) {
  return async (api) => {
    const standardProtocols = {
      morpho: chainConfig.morpho || [],
      mellow: chainConfig.mellow || [],
      symbiotic: chainConfig.symbiotic || [],
      euler: chainConfig.euler || [],
      silo: chainConfig.silo || []
    };
    
    const hasStandardProtocols = Object.values(standardProtocols).some(arr => arr.length > 0);
    
    const promises = [];
    
    if (hasStandardProtocols) {
      promises.push(getCuratorTvl(api, standardProtocols));
    }
    
    Object.entries(PROTOCOL_HANDLERS).forEach(([handlerType, protocols]) => {
      protocols.forEach(protocol => {
        if (chainConfig[protocol]) {
          promises.push(TVL_HANDLERS[handlerType](api, chainConfig[protocol]));
        }
      });
    });
    
    await Promise.all(promises);
  };
}

const adapterExport = getCuratorExport(configs);

adapterExport.ethereum.tvl = createChainTvlFunction(configs.blockchains.ethereum);
adapterExport.hyperliquid.tvl = createChainTvlFunction(configs.blockchains.hyperliquid);
adapterExport.bsc.tvl = createChainTvlFunction(configs.blockchains.bsc);
adapterExport.unichain.tvl = createChainTvlFunction(configs.blockchains.unichain);
adapterExport.plume.tvl = createChainTvlFunction(configs.blockchains.plume);
adapterExport.berachain.tvl = createChainTvlFunction(configs.blockchains.berachain);
adapterExport.sonic.tvl = createChainTvlFunction(configs.blockchains.sonic);
adapterExport.avax.tvl = createChainTvlFunction(configs.blockchains.avax);
adapterExport.sui.tvl = createChainTvlFunction(configs.blockchains.sui);

module.exports = adapterExport;