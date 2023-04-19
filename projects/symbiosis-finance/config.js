module.exports = {
  chains: [
    {
      id: 1,
      name: 'ethereum',
      stable: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
      holders: [
        '0xb80fDAA74dDA763a8A158ba85798d373A5E84d84', // portal v1
        '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8', // portal v2
      ]
    },
    {
      id: 56,
      name: 'bsc',
      stable: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
      holders: [
        '0xD7F9989bE0d15319d13d6FA5d468211C89F0b147', // portal v1
        '0x5Aa5f7f84eD0E5db0a4a85C3947eA16B53352FD4', // portal v2
        '0xab0738320A21741f12797Ee921461C691673E276', // v1 pool with Ethereum
      ]
    },
    {
      id: 43114,
      name: 'avax',
      stable: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', // USDC.e
      holders: [
        '0xD7F9989bE0d15319d13d6FA5d468211C89F0b147', // portal v1
        '0xE75C7E85FE6ADd07077467064aD15847E6ba9877', // portal v2
        '0xab0738320A21741f12797Ee921461C691673E276', // v1 pool with Ethereum
        '0xF4BFF06E02cdF55918e0ec98082bDE1DA85d33Db', // v1 pool with BNB chain
      ]
    },
    {
      id: 137,
      name: 'polygon',
      stable: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC
      holders: [
        '0xD7F9989bE0d15319d13d6FA5d468211C89F0b147', // portal v1
        '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8', // portal v2
        '0xab0738320A21741f12797Ee921461C691673E276', // v1 pool with Ethereum
        '0xF4BFF06E02cdF55918e0ec98082bDE1DA85d33Db', // v1 pool with BNB chain
        '0x3F1bfa6FA3B6D03202538Bf0cdE92BbE551104ac', // v1 pool with Avalanche
      ]
    },
    {
      id: 40,
      name: 'telos',
      stable: '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b', // USDC
      holders: [
        '0x17A0E3234f00b9D7028e2c78dB2caa777F11490F', // portal v1
        '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8', // portal v2
        '0x7f3C1E54b8b8C7c08b02f0da820717fb641F26C8', // v1 pool with BNB chain
      ]
    },
    {
      id: 1313161554,
      name: 'aurora',
      stable: '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802', // USDC
      holders: [
        '0x17A0E3234f00b9D7028e2c78dB2caa777F11490F', // portal v1
        '0x7Ff7AdE2A214F9A4634bBAA4E870A5125dA521B8', // v1 pool with BNB chain
        '0x7F1245B61Ba0b7D4C41f28cAc9F8637fc6Bec9E4', // v1 pool with Polygon
      ]
    },
    // {
    //   id: 2001,
    //   name: 'milkomeda',
    //   stable: '0x42110A5133F91B49E32B671Db86E2C44Edc13832', // sUSDC
    //   holders: [
    //     '0x3Cd5343546837B958a70B82E3F9a0E857d0b5fea', // portal v1
    //   ]
    // },
    {
      id: 288,
      name: 'boba',
      stable: '0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc', // USDC
      holders: [
        '0xD7F9989bE0d15319d13d6FA5d468211C89F0b147', // portal v1
        '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8', // portal v2
        '0xab0738320A21741f12797Ee921461C691673E276', // v1 pool with Ethereum
        '0xe0ddd7afC724BD4B320472B5C954c0abF8192344', // v1 pool with BNB chain
      ]
    },
    {
      id: 43288,
      name: 'boba_avax',
      stable: '0x126969743a6d300bab08F303f104f0f7DBAfbe20', // USDC.e
      holders: [
        '0xd8db4fb1fEf63045A443202d506Bcf30ef404160', // portal v2
      ]
    },
    {
      id: 56288,
      name: 'boba_bnb',
      stable: '0x9F98f9F312D23d078061962837042b8918e6aff2', // USDC
      holders: [
        '0x6148FD6C649866596C3d8a971fC313E5eCE84882', // pool v2
      ]
    },
    {
      id: 2222,
      name: 'kava',
      stable: '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f', // USDC
      holders: [
        '0x292fC50e4eB66C3f6514b9E402dBc25961824D62', // portal v2
      ]
    },
    {
      id: 324,
      name: 'era',
      stable: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4', // USDC
      holders: [
        '0x39dE19C9fF25693A2311AAD1dc5C790194084A39', // portal v2
      ]
    },
    {
      id: 42161,
      name: 'arbitrum',
      stable: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // USDC
      holders: [
        '0x01A3c8E513B758EBB011F7AFaf6C37616c9C24d9', // portal v2
      ]
    },
  ]
}