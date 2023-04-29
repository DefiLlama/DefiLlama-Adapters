const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
  chains: [
    {
      name: 'ethereum',
      stable: ADDRESSES.ethereum.USDC, // USDC
      holders: [
        '0xb80fDAA74dDA763a8A158ba85798d373A5E84d84', // portal v1
        '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8', // portal v2
      ]
    },
    {
      name: 'bsc',
      stable: ADDRESSES.bsc.BUSD, // BUSD
      holders: [
        '0xD7F9989bE0d15319d13d6FA5d468211C89F0b147', // portal v1
        '0x5Aa5f7f84eD0E5db0a4a85C3947eA16B53352FD4', // portal v2
        '0xab0738320A21741f12797Ee921461C691673E276', // v1 pool with Ethereum
      ]
    },
    {
      name: 'avax',
      stable: ADDRESSES.avax.USDC_e, // USDC.e
      holders: [
        '0xD7F9989bE0d15319d13d6FA5d468211C89F0b147', // portal v1
        '0xE75C7E85FE6ADd07077467064aD15847E6ba9877', // portal v2
        '0xab0738320A21741f12797Ee921461C691673E276', // v1 pool with Ethereum
        '0xF4BFF06E02cdF55918e0ec98082bDE1DA85d33Db', // v1 pool with BNB chain
      ]
    },
    {
      name: 'polygon',
      stable: ADDRESSES.polygon.USDC, // USDC
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
      stable: ADDRESSES.telos.USDC, // USDC
      holders: [
        '0x17A0E3234f00b9D7028e2c78dB2caa777F11490F', // portal v1
        '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8', // portal v2
        '0x7f3C1E54b8b8C7c08b02f0da820717fb641F26C8', // v1 pool with BNB chain
      ]
    },
    {
      name: 'aurora',
      stable: ADDRESSES.aurora.USDC_e, // USDC
      holders: [
        '0x17A0E3234f00b9D7028e2c78dB2caa777F11490F', // portal v1
        '0x7Ff7AdE2A214F9A4634bBAA4E870A5125dA521B8', // v1 pool with BNB chain
        '0x7F1245B61Ba0b7D4C41f28cAc9F8637fc6Bec9E4', // v1 pool with Polygon
      ]
    },
    // {
    //   name: 'milkomeda',
    //   stable: ADDRESSES.milkomeda.sUSDC, // sUSDC
    //   holders: [
    //     '0x3Cd5343546837B958a70B82E3F9a0E857d0b5fea', // portal v1
    //   ]
    // },
    {
      name: 'boba',
      stable: ADDRESSES.boba.USDC, // USDC
      holders: [
        '0xD7F9989bE0d15319d13d6FA5d468211C89F0b147', // portal v1
        '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8', // portal v2
        '0xab0738320A21741f12797Ee921461C691673E276', // v1 pool with Ethereum
        '0xe0ddd7afC724BD4B320472B5C954c0abF8192344', // v1 pool with BNB chain
      ]
    },
    {
      name: 'boba_avax',
      stable: ADDRESSES.boba_avax.USDC_e, // USDC.e
      holders: [
        '0xd8db4fb1fEf63045A443202d506Bcf30ef404160', // portal v2
      ]
    },
    {
      name: 'boba_bnb',
      stable: ADDRESSES.boba_bnb.USDC, // USDC
      holders: [
        '0x6148FD6C649866596C3d8a971fC313E5eCE84882', // pool v2
      ]
    },
    {
      name: 'kava',
      stable: ADDRESSES.telos.ETH, // USDC
      holders: [
        '0x292fC50e4eB66C3f6514b9E402dBc25961824D62', // portal v2
      ]
    },
    {
      name: 'era',
      stable: ADDRESSES.era.USDC, // USDC
      holders: [
        '0x39dE19C9fF25693A2311AAD1dc5C790194084A39', // portal v2
      ]
    },
    {
      name: 'arbitrum',
      stable: ADDRESSES.arbitrum.USDC, // USDC
      holders: [
        '0x01A3c8E513B758EBB011F7AFaf6C37616c9C24d9', // portal v2
      ]
    },
  ]
}