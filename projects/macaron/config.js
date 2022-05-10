module.exports = {
  bsc: {
    masterchef: '0xFcDE390bF7a8B8614EC11fa8bde7565b3E64fe0b',
    token: '0xacb2d47827c9813ae26de80965845d80935afd0b'.toLowerCase(),
    chocochef: 'https://api.macaronswap.finance/chocofalls?chainId=56',
    masterchefPools: 'https://api.macaronswap.finance/magicboxes?chainId=56',
    vaults: 'https://api.macaronswap.finance/boostpools',
    erc20s: [
      //MCRN
      // "0xacb2d47827c9813ae26de80965845d80935afd0b",
      //BANANA
      "0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95",
      //CAKE
      "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
      
    ],
    treasury: "0x67f1D48a8991009e0b092e9C34ca16f7d6072ec1",
    chainId: 56,
  },
  polygon: {
    masterchef: '0xC200cE4853d97e5f11320Bb8ee17F4D895f5e7BB',
    token: '0xba25b552c8a098afdf276324c32c71fe28e0ad40'.toLowerCase(),
    chocochef: 'https://api.macaronswap.finance/chocofalls?chainId=137',
    masterchefPools: 'https://api.macaronswap.finance/magicboxes?chainId=137',
    chainId: 137,
  }
}
