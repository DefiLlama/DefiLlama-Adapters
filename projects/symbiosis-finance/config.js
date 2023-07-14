const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
  chains: [
    {
      name: 'ethereum',
      tokens: [
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WETH,
      ],
      holders: [
        '0xb80fDAA74dDA763a8A158ba85798d373A5E84d84', // portal v1
        '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8', // portal v2
      ]
    },
    {
      name: 'bsc',
      tokens: [
        ADDRESSES.bsc.BUSD,
        ADDRESSES.bsc.USDC,
        ADDRESSES.bsc.ETH,
      ],
      holders: [
        '0xD7F9989bE0d15319d13d6FA5d468211C89F0b147', // portal v1
        '0x5Aa5f7f84eD0E5db0a4a85C3947eA16B53352FD4', // portal v2
        '0xab0738320A21741f12797Ee921461C691673E276', // v1 pool with Ethereum
      ]
    },
    {
      name: 'avax',
      tokens: [
        ADDRESSES.avax.USDC_e,
        ADDRESSES.avax.USDC,
      ],
      holders: [
        '0xD7F9989bE0d15319d13d6FA5d468211C89F0b147', // portal v1
        '0xE75C7E85FE6ADd07077467064aD15847E6ba9877', // portal v2
        '0xab0738320A21741f12797Ee921461C691673E276', // v1 pool with Ethereum
        '0xF4BFF06E02cdF55918e0ec98082bDE1DA85d33Db', // v1 pool with BNB chain
      ]
    },
    {
      name: 'polygon',
      tokens: [
        ADDRESSES.polygon.USDC,
        ADDRESSES.polygon.WETH_1,
      ],
      holders: [
        '0xD7F9989bE0d15319d13d6FA5d468211C89F0b147', // portal v1
        '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8', // portal v2
        '0xab0738320A21741f12797Ee921461C691673E276', // v1 pool with Ethereum
        '0xF4BFF06E02cdF55918e0ec98082bDE1DA85d33Db', // v1 pool with BNB chain
        '0x3F1bfa6FA3B6D03202538Bf0cdE92BbE551104ac', // v1 pool with Avalanche
      ]
    },
    {
      name: 'telos',
      tokens: [
        ADDRESSES.telos.USDC,
      ],
      holders: [
        '0x17A0E3234f00b9D7028e2c78dB2caa777F11490F', // portal v1
        '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8', // portal v2
        '0x7f3C1E54b8b8C7c08b02f0da820717fb641F26C8', // v1 pool with BNB chain
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
        ADDRESSES.boba.USDC,
      ],
      holders: [
        '0xD7F9989bE0d15319d13d6FA5d468211C89F0b147', // portal v1
        '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8', // portal v2
        '0xab0738320A21741f12797Ee921461C691673E276', // v1 pool with Ethereum
        '0xe0ddd7afC724BD4B320472B5C954c0abF8192344', // v1 pool with BNB chain
      ]
    },
    {
      name: 'boba_avax',
      tokens: [
        ADDRESSES.boba_avax.USDC_e,
      ],
      holders: [
        '0xd8db4fb1fEf63045A443202d506Bcf30ef404160', // portal v2
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
        ADDRESSES.kava.USDC,
        ADDRESSES.kava.USDt,
      ],
      holders: [
        '0x292fC50e4eB66C3f6514b9E402dBc25961824D62', // portal v2
      ]
    },
    {
      name: 'era',
      tokens: [
        ADDRESSES.era.USDC,
        ADDRESSES.era.WETH,
      ],
      holders: [
        '0x39dE19C9fF25693A2311AAD1dc5C790194084A39', // portal v2
      ]
    },
    {
      name: 'arbitrum',
      tokens: [
        ADDRESSES.arbitrum.USDC, // USDC.e
        ADDRESSES.arbitrum.USDC_CIRCLE,
        ADDRESSES.arbitrum.WETH,
      ],
      holders: [
        '0x01A3c8E513B758EBB011F7AFaf6C37616c9C24d9', // portal v2
      ]
    },
    {
      name: 'optimism',
      tokens: [
        ADDRESSES.optimism.USDC,
        ADDRESSES.optimism.WETH_1,
      ],
      holders: [
        '0x292fC50e4eB66C3f6514b9E402dBc25961824D62', // portal v2
      ]
    },
    {
      name: 'arbitrum_nova',
      tokens: [
        ADDRESSES.arbitrum_nova.USDC,
        ADDRESSES.arbitrum_nova.WETH,
      ],
      holders: [
        '0x292fC50e4eB66C3f6514b9E402dBc25961824D62', // portal v2
      ]
    },
    {
      name: 'polygon_zkevm',
      tokens: [
        ADDRESSES.polygon_zkevm.USDC,
        ADDRESSES.polygon_zkevm.WETH,
      ],
      holders: [
        '0x292fC50e4eB66C3f6514b9E402dBc25961824D62', // portal v2
      ]
    },
  ]
}