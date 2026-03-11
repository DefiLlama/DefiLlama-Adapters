const instituitionalContractAddress = {
  ethereum: {
    address: '0xF80bA51189763B7AC484A23f7d7695345B1149C9',
    startBlock: 18467881
  },
  arbitrum: {
    address: '0x45dCf4F9d1B47C138Bc1E490a878790932d66caf',
    startBlock: 188232859
  },
  base: {
    address: '0x07D7bf6dCc4A2f03E82E3da52eBfBAe871443322',
    startBlock: 23596015
  },
  hedera: {
    address: '0xF80bA51189763B7AC484A23f7d7695345B1149C9',
    startBlock: 84085356
  }
};

const edgeContractAddress = {
  ethereum: {
    address: '0xb5337C2e320D61bE3511216b9b4d32b2c41F3e55',
    startBlock: 20882902
  },
  arbitrum: {
    address: '0x4C28F5c87e5557db971c9a2F862BfdCf9f561Bd4',
    startBlock: 273904688
  },
  base: {
    address: '0xe76C20761BFCD471196bB61f68250DAf3dA3568B',
    startBlock: 23604031
  },
  hedera: {
    address: '0x78B17FbE17925622139382FE7809A9D687C5e7Bd',
    startBlock: 84093455
  }
};

const pdnContractAddress = {
  address: '0x67A1fc35961dD0E293BB4481b48491aDF95b1395',
  startBlock: 218221531
};

// csUSD multi-asset vault configuration per chain
// Supports multiple vaults per chain
const csUSDVaults = {
  ethereum: [
    {
      vault: '0xd5d097f278a735d0a3c609deee71234cac14b47e', // USDC vault (csUSD)
      startBlock: 23251807,
      underlyings: [
        'USDC',
      ],
    },
    {
      vault: '0xbd3f0befa86794b999b29a91d201124d8fbdf777', // USDT vault (csUSD)
      startBlock: 23251807,
      underlyings: [
        'USDT',
      ],
    },
  ],
  hedera: [
    {
      vault: '0x4896a087f78E1DcB44B9231f9a6f35EA2aA0c8AC', // USDC vault (csUSDh)
      startBlock: 85080753,
      underlyings: [
        'USDC',
      ],
    },
  ],
};

const csLYDVaults = {
  ethereum: [
    {
      vault: '0xead9190db1a6a5f4262572845cf75c31e474fd4c',
      startBlock: 23645911,
      underlyings: [
        'USDC',
      ],
    },
    {
      vault: '0x1922d16cc88cd60499906915b30ec891ceb6e151',
      startBlock: 23645923,
      underlyings: [
        'USDT',
      ],
    },
  ],
};

const invalidPDNPaymentIds = [
  "0x99460d3affdd3d92b7947811ee9d3081c9c2f0a9d0ee9b30af2d842f4423dd83",
  "0x0d299443084dc8cc186ef3b641a82b05067687b94c03317345c3b2f25847de38",
  "0x2f795b76f222b3e7a5bdf6e03f34972a72ff55ee893e70af58e638e7fb3a24d2",
  "0x25faefe8041a9e5e6da9bea88c188c3bd563e09b3db3515034ecf54dbfd77eed",
  "0xe206373ef521d6a43c1501252d4b93a77ca2c73219645561d93f8c1285ace4e3",
  "0xf7105def091d0d87b5ec278b039017addf64a8c16f405adccd58204a20ee9f75",
  "0x95487262748ad72d4ce68ef6df658e88c4194d4752d9d1c9f34994f41f047255",
  "0x732e6bb2ec07cfaa156fbe35e1e5240e129ac568eb2df4e343497c9c7500113c",
]

module.exports = {
  instituitionalContractAddress,
  edgeContractAddress,
  pdnContractAddress,
  csUSDVaults,
  csLYDVaults,
  invalidPDNPaymentIds
};