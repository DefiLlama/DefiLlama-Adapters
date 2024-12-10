const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
  chains: [
    {
      name: 'ethereum',
      tokens: [
        ADDRESSES.ethereum.USDC, // USDC,
        '0xd38BB40815d2B0c2d2c866e0c72c5728ffC76dd9', // SIS,
        ADDRESSES.ethereum.WETH, // WETH,
        ADDRESSES.ethereum.USDT, // USDT,
        ADDRESSES.ethereum.WBTC, // WBTC,
        '0x12970E6868f88f6557B76120662c1B3E50A646bf', // LADYS,
        '0xD9A442856C234a39a81a089C06451EBAa4306a72', // pufETH,
        ADDRESSES.ethereum.FRAX, // FRAX,
        '0x9C7BEBa8F6eF6643aBd725e45a4E8387eF260649', // G,
        '0x582d872A1B094FC48F5DE31D3B73F2D9bE47def1', // WTON
      ],
      holders: [
        '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8' // portal
      ]
    },
    {
      name: 'bsc',
      tokens: [
        ADDRESSES.bsc.USDC, // USDC,
        ADDRESSES.bsc.BUSD, // BUSD,
        ADDRESSES.bsc.ETH, // ETH,
        ADDRESSES.bsc.BTCB, // BTCB,
        '0xF98b660AdF2ed7d9d9D9dAACC2fb0CAce4F21835', // SIS,
        '0x9C7BEBa8F6eF6643aBd725e45a4E8387eF260649', // G,
        '0x76A797A59Ba2C17726896976B7B3747BfD1d220f', // WTON
      ],
      holders: [
        '0x5Aa5f7f84eD0E5db0a4a85C3947eA16B53352FD4' // portal
      ]
    },
    {
      name: 'avax',
      tokens: [
        ADDRESSES.avax.USDC, // USDC,
        ADDRESSES.avax.USDC_e, // USDC.e
      ],
      holders: [
        '0xE75C7E85FE6ADd07077467064aD15847E6ba9877' // portal
      ]
    },
    {
      name: 'polygon',
      tokens: [
        ADDRESSES.polygon.USDC, // USDC.e,
        ADDRESSES.polygon.WETH_1, // WETH,
        ADDRESSES.polygon.FRAX, // FRAX
      ],
      holders: [
        '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8' // portal
      ]
    },
    {
      name: 'telos',
      tokens: [
        ADDRESSES.telos.syUSDC, // USDC,
        '0x63d71E79AdF0886c989A23b04a0E86F1489b6BC3', // WETH,
        '0x7bD3ffe9f0C9CF08FD60e102FEa455A6EA580276', // USDT
      ],
      holders: [
        '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8' // portal
      ]
    },
    {
      name: 'aurora',
      tokens: [
        ADDRESSES.aurora.USDC_e,
      ],
      holders: [
        '0x17A0E3234f00b9D7028e2c78dB2caa777F11490F', // portal v1
        '0x7Ff7AdE2A214F9A4634bBAA4E870A5125dA521B8', // v1 pool with BNB chain
        '0x7F1245B61Ba0b7D4C41f28cAc9F8637fc6Bec9E4', // v1 pool with Polygon
      ]
    },
    {
      name: 'boba',
      tokens: [
        ADDRESSES.boba.USDC, // USDC
      ],
      holders: [
        '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8' // portal
      ]
    },
    {
      name: 'boba_bnb',
      tokens: [
        ADDRESSES.boba_bnb.USDC,
      ],
      holders: [
        '0x6148FD6C649866596C3d8a971fC313E5eCE84882', // pool v2
      ]
    },
    {
      name: 'kava',
      tokens: [
        ADDRESSES.kava.USDt, // USDt
      ],
      holders: [
        '0x292fC50e4eB66C3f6514b9E402dBc25961824D62' // portal
      ]
    },
    {
      name: 'era',
      tokens: [
        ADDRESSES.era.USDC, // USDC.e,
        '0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4', // USDC,
        ADDRESSES.era.WETH, // WETH,
        ADDRESSES.era.WBTC, // WBTC,
        '0xdd9f72afED3631a6C85b5369D84875e6c42f1827', // SIS,
        '0xED0c95EBe5a3E687cB2224687024FeC6518E683e', // syBTC
      ],
      holders: [
        '0x4f5456d4d0764473DfCA1ffBB8524C151c4F19b9' // portal
      ]
    },
    {
      name: 'arbitrum',
      tokens: [
        ADDRESSES.arbitrum.USDC_CIRCLE, // USDC,
        ADDRESSES.arbitrum.USDC, // USDC.e,
        ADDRESSES.arbitrum.WETH, // WETH,
        '0x9E758B8a98a42d612b3D38B66a22074DC03D7370', // SIS,
        '0x3b60FF35D3f7F62d636b067dD0dC0dFdAd670E4E', // LADYS,
        ADDRESSES.arbitrum.FRAX, // FRAX,
        '0x1A6B3A62391ECcaaa992ade44cd4AFe6bEC8CfF1', // UXLINK
      ],
      holders: [
        '0x01A3c8E513B758EBB011F7AFaf6C37616c9C24d9' // portal
      ]
    },
    {
      name: 'optimism',
      tokens: [
        ADDRESSES.optimism.USDC, // USDC.e,
        ADDRESSES.optimism.WETH_1, // WETH
      ],
      holders: [
        '0x292fC50e4eB66C3f6514b9E402dBc25961824D62' // portal
      ]
    },
    {
      name: 'arbitrum_nova',
      tokens: [
        ADDRESSES.arbitrum_nova.USDC, // USDC,
        ADDRESSES.arbitrum_nova.WETH, // WETH
      ],
      holders: [
        '0x292fC50e4eB66C3f6514b9E402dBc25961824D62' // portal
      ]
    },
    {
      name: 'polygon_zkevm',
      tokens: [
        ADDRESSES.astarzk.USDC, // USDC,
        ADDRESSES.polygon_zkevm.USDC_CIRCLE, // USDC.e,
        ADDRESSES.polygon_zkevm.WETH, // WETH
      ],
      holders: [
        '0x292fC50e4eB66C3f6514b9E402dBc25961824D62' // portal
      ]
    },
    {
      name: 'linea',
      tokens: [
        ADDRESSES.linea.WETH, // WETH,
        ADDRESSES.linea.USDC, // USDC,
        '0x6EF95B6f3b0F39508e3E04054Be96D5eE39eDE0d', // SIS
      ],
      holders: [
        '0x292fC50e4eB66C3f6514b9E402dBc25961824D62' // portal
      ]
    },
    {
      name: 'mantle',
      tokens: [
        ADDRESSES.mantle.USDC, // USDC,
        ADDRESSES.mantle.WETH, // WETH,
        '0x1Bdd8878252DaddD3Af2ba30628813271294eDc0', // CATI
      ],
      holders: [
        '0x292fC50e4eB66C3f6514b9E402dBc25961824D62' // portal
      ]
    },
    {
      name: 'base',
      tokens: [
        ADDRESSES.optimism.WETH_1, // WETH,
        ADDRESSES.base.USDbC, // USDbC,
        '0x9C7BEBa8F6eF6643aBd725e45a4E8387eF260649', // G
      ],
      holders: [
        '0xEE981B2459331AD268cc63CE6167b446AF4161f8' // portal
      ]
    },
    {
      name: 'tron',
      tokens: [
        ADDRESSES.tron.USDT, // USDT
      ],
      holders: [
        'TVgY3ayqTGUoe7th84ZNL5peVfRNdLFDjf' // portal
      ]
    },
    {
      name: 'scroll',
      tokens: [
        ADDRESSES.scroll.WETH, // WETH,
        ADDRESSES.scroll.USDC, // USDC,
        '0x1467b62A6AE5CdcB10A6a8173cfe187DD2C5a136', // SIS,
        '0xc4d46E8402F476F269c379677C99F18E22Ea030e', // pufETH
      ],
      holders: [
        '0x5Aa5f7f84eD0E5db0a4a85C3947eA16B53352FD4' // portal
      ]
    },
    {
      name: 'manta',
      tokens: [
        ADDRESSES.manta.WETH, // WETH,
        ADDRESSES.manta.USDC, // USDC,
        '0xA53E005Cecd3D7C89A4AE814617cC14828b6527E', // pufETH
      ],
      holders: [
        '0x5Aa5f7f84eD0E5db0a4a85C3947eA16B53352FD4' // portal
      ]
    },
    {
      name: 'metis',
      tokens: [
        ADDRESSES.metis.WETH, // WETH
      ],
      holders: [
        '0xd8db4fb1fEf63045A443202d506Bcf30ef404160' // portal
      ]
    },
    {
      name: 'mode',
      tokens: [
        ADDRESSES.optimism.WETH_1, // WETH
      ],
      holders: [
        '0x292fC50e4eB66C3f6514b9E402dBc25961824D62' // portal
      ]
    },
    {
      name: 'rsk',
      tokens: [
        ADDRESSES.rsk.rUSDT, // rUSDT,
        ADDRESSES.rsk.WRBTC1, // WRBTC
      ],
      holders: [
        '0x5aa5f7f84ed0e5db0a4a85c3947ea16b53352fd4' // portal
      ]
    },
    {
      name: 'blast',
      tokens: [
        ADDRESSES.blast.WETH, // WETH
      ],
      holders: [
        '0x5Aa5f7f84eD0E5db0a4a85C3947eA16B53352FD4' // portal
      ]
    },
    {
      name: 'merlin',
      tokens: [
        ADDRESSES.merlin.WBTC, // WBTC
      ],
      holders: [
        '0x292fC50e4eB66C3f6514b9E402dBc25961824D62' // portal
      ]
    },
    {
      name: 'ftn',
      tokens: [
        ADDRESSES.ftn.USDC, // USDC,
        '0xE5b3562A0fa9eC3e718C96FfE349e1280D2Be591', // WETH,
        '0xDeF886C55a79830C47108eeb9c37e78a49684e41', // USDT
      ],
      holders: [
        '0x318C2B9a03C37702742C3d40C72e4056e430135A' // portal
      ]
    },
    {
      name: 'zklink',
      tokens: [
        ADDRESSES.zklink.WETH, // WETH,
        '0x1B49eCf1A8323Db4abf48b2F5EFaA33F7DdAB3FC', // pufETH
      ],
      holders: [
        '0x8Dc71561414CDcA6DcA7C1dED1ABd04AF474D189' // portal
      ]
    },
    {
      name: 'core',
      tokens: [
        ADDRESSES.core.coreBTC, // coreBTC
      ],
      holders: [
        '0x292fC50e4eB66C3f6514b9E402dBc25961824D62' // portal
      ]
    },
    {
      name: 'taiko',
      tokens: [
        ADDRESSES.taiko.WETH, // WETH
      ],
      holders: [
        '0x5Aa5f7f84eD0E5db0a4a85C3947eA16B53352FD4' // portal
      ]
    },
    {
      name: 'sei',
      tokens: [
        '0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1', // USDC,
        '0xB75D0B03c06A926e488e2659DF1A861F860bD3d1', // USDT
      ],
      holders: [
        '0x292fC50e4eB66C3f6514b9E402dBc25961824D62' // portal
      ]
    },
    {
      name: 'zeta',
      tokens: [
        '0x1e4bF3CaBD7707089138dD5a545B077413FA83Fc', // pufETH,
        ADDRESSES.zeta.USDC_1, // USDC.ETH
      ],
      holders: [
        '0x8a7F930003BedD63A1ebD99C5917FD6aE7E3dedf' // portal
      ]
    },
    {
      name: 'cronos',
      tokens: [
        ADDRESSES.cronos.USDC, // USDC
      ],
      holders: [
        '0xE75C7E85FE6ADd07077467064aD15847E6ba9877' // portal
      ]
    },
    {
      name: 'fraxtal',
      tokens: [
        ADDRESSES.fraxtal.WETH, // WETH,
        ADDRESSES.fraxtal.FRAX, // FRAX
      ],
      holders: [
        '0x292fC50e4eB66C3f6514b9E402dBc25961824D62' // portal
      ]
    },
    {
      name: 'gravity',
      tokens: [
        ADDRESSES.rari.USDC_e, // USDC.e,
        ADDRESSES.gravity.wG, // wG
      ],
      holders: [
        '0x292fC50e4eB66C3f6514b9E402dBc25961824D62' // portal
      ]
    },
    {
      name: 'bsquared',
      tokens: [
        ADDRESSES.optimism.WETH_1, // WBTC
      ],
      holders: [
        '0x292fC50e4eB66C3f6514b9E402dBc25961824D62' // portal
      ]
    },
    {
      name: 'ton',
      tokens: [
        'EQD8AErK5HbmnftlHQuk8bXC_JuX1COLPeNIfMriw23gfO3I', // TON,
        ADDRESSES.ton.USDT, // USDT,
        'EQBh9XACT0B60U8Q48VnjyqCxzxpM4oA0c8rqKt4h70yk1V5', // UXLINK,
        'EQD-cvR0Nz6XAyRBvbhz-abTrRC6sI5tvHvvpeQraV9UAAD7', // CATI
      ],
      holders: [
        'EQDpUHhVl5lJ6Y47DCd0TWdXB_kd-U-N6KyAELePNjfj15HT' // portal
      ]
    },
    {
      name: 'cronos_zkevm',
      tokens: [
        ADDRESSES.cronos_zkevm.USDC, // USDC
      ],
      holders: [
        '0x2E818E50b913457015E1277B43E469b63AC5D3d7' // portal
      ]
    },
    {
      name: 'morph',
      tokens: [
        '0xe34c91815d7fc18A9e2148bcD4241d0a5848b693', // USDC
      ],
      holders: [
        '0x292fC50e4eB66C3f6514b9E402dBc25961824D62' // portal
      ]
    },
  ]
}