module.exports = {
  ethereum: {
    pool2: sumTokensExport({
      owner: '0x0541a21e9e8f07a286e582a13b3ff509f902da0d',
      tokens: [
        '0xC02aaa39b223FE8D0A0E5C4F27eAD9083C756Cc2', // WETH
        '0x6507A08A37947Cfd1a3d7b282B6c26E8E3d6b3b5'  // EDV token
      ],
    }),
    tvl: () => ({})
  },
};
