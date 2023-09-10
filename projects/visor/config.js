const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  polygon: { blacklistedHypes: ['0xa9782a2c9c3fb83937f14cdfac9a6d23946c9255'], },
  ethereum: {
    blacklistedHypes: [ADDRESSES.ethereum.WBTC],
    LIQUIDITY_MINING_POOLS: [
      "0x64fcdd0de44f4bd04c039b0664fb95ef033d4efb", // GAMMA/ETH UNI-V2
      "0x96c105e9e9eab36eb8e2f851a5dabfbbd397c085", // USDC
      "0xebae3cb14ce6c2f26b40b747fd92ccaf03b98659", // USDT
      "0xf178d88d2f6f97ca32f92b465987068e1cce41c5", // DAI
    ]
  },
}


/* List of hypervisor registries by chain
   One chain can have multiple registries for different underlying DEXes */
const HYPE_REGISTRY = {
  ethereum: [
    ["0x31ccdb5bd6322483bebd0787e1dabd1bf1f14946", 13659998], // Uniswap
  ],
  polygon: [
    ["0x0Ac4C7b794f3D7e7bF1093A4f179bA792CF15055", 25305922], // Uniswap
    ["0x97686103B3E7238Ca6c2C439146B30adBd84a593", 43578714], // Sushiswap
    ["0xAeC731F69Fa39aD84c7749E913e3bC227427Adfd", 35447517], // Quickswap
    ["0xcAC19d43C9558753d7535978A370055614Ce832E", 42562328], // Retro
    ["0x7b9c2f68f16c3618bb45616fb98d83f94fd7062e", 44933860], // Ascent
  ],
  polygon_zkevm: [
    ["0xD08B593eb3460B7aa5Ce76fFB0A3c5c938fd89b8", 152596,], // Quickswap
  ],
  optimism: [
    ["0xF5BFA20F4A77933fEE0C7bB7F39E7642A070d599", 6538026], // Uniswap
  ],
  arbitrum: [
    ["0x66CD859053c458688044d816117D5Bdf42A56813", 10617223], // Uniswap
    ["0x0f867F14b39a5892A39841a03bA573426DE4b1d0", 102240553], // Sushiswap
    ["0x37595FCaF29E4fBAc0f7C1863E3dF2Fe6e2247e9", 63562888], // Zyberswap
    ["0x34Ffbd9Db6B9bD8b095A0d156de69a2AD2944666", 99952729], // Ramses
    ["0xa216C2b6554A0293f69A1555dd22f4b7e60Fe907", 87343880], // Camelot
  ],
  bsc: [
    ["0x0b4645179C1b668464Df01362fC6219a7ab3234c", 26520492], // Uniswap
    ["0xd4bcFC023736Db5617E5638748E127581d5929bd", 26097149], // Thena
  ],
  moonbeam: [
    ["0xB7dfC304D9cd88D98A262cE5B6a39Bb9d6611063", 3591244], // Beamswap
    ["0x6002D7714e8038f2058e8162b0b86c0b19c31908", 3569487], // Stellaswap
  ],
  celo: [
    ["0x0F548d7AD1A0CB30D1872b8C18894484d76e1569", 14032548], // Uniswap
  ],
  avax: [
    ["0x3FE6F25DA67DC6AD2a5117a691f9951eA14d6f15", 29825241], // Glacier
  ],
  fantom: [
    ["0xf874d4957861e193aec9937223062679c14f9aca", 62144066], // Spiritswap
  ],
  mantle: [
    ["0x683292172E2175bd08e3927a5e72FC301b161300", 1000], // FusionX
  ],
  rollux: [
    ["0x683292172E2175bd08e3927a5e72FC301b161300", 1435083], // PegaSys
  ],
  linea: [
    ["0xc27ddd78fc49875fe6f844b72bbf31dfbb099881", 163300], // Lynex
  ],
  base: [
    ["0x1E86A593E55215957C4755f1BE19a229AF3286f6", 2798768], // SynthSwap
    ["0x6d5c54F535b073B9C2206Baf721Af2856E5cD683", 3785552], // Sushiswap
  ],
};

Object.keys(HYPE_REGISTRY).forEach(chain => {
  config[chain] = {
    ...config[chain],
    registries: HYPE_REGISTRY[chain].map(([factory, fromBlock]) => ({ factory, fromBlock, })),
  }
})

module.exports = config
