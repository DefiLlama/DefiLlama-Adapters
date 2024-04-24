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
    ["0x2E18B825b049c4994370b0DB6C35d0100295b96C", 18319961], // Pancakeswap
  ],
  polygon: [
    ["0x0Ac4C7b794f3D7e7bF1093A4f179bA792CF15055", 25305922], // Uniswap
    ["0x97686103B3E7238Ca6c2C439146B30adBd84a593", 43578714], // Sushiswap
    ["0xAeC731F69Fa39aD84c7749E913e3bC227427Adfd", 35447517], // Quickswap
    ["0xcAC19d43C9558753d7535978A370055614Ce832E", 42562328], // Retro
    ["0x7b9c2f68f16c3618bb45616fb98d83f94fd7062e", 44933860], // Ascent
  ],
  polygon_zkevm: [
    ["0xff8Fae227edb4Ab23e61EC6cf0a65F3bCdCf45Bd", 11479842], // Uniswap
    ["0xD08B593eb3460B7aa5Ce76fFB0A3c5c938fd89b8", 152596], // Quickswap Algebra
    ["0xf9aDaa55014242c1005dB307C4e41c541f26bAAA", 10725633], // Quickswap UniV3
  ],
  optimism: [
    ["0xF5BFA20F4A77933fEE0C7bB7F39E7642A070d599", 6538026], // Uniswap
  ],
  arbitrum: [
    ["0x66CD859053c458688044d816117D5Bdf42A56813", 10617223], // Uniswap
    ["0x166cD995F9301590e381c488FFD4f18C3ca38A27", 144400180], // Pancakeswap
    ["0x0f867F14b39a5892A39841a03bA573426DE4b1d0", 102240553], // Sushiswap
    ["0x37595FCaF29E4fBAc0f7C1863E3dF2Fe6e2247e9", 63562888], // Zyberswap
    ["0x34Ffbd9Db6B9bD8b095A0d156de69a2AD2944666", 99952729], // Ramses
    ["0xa216C2b6554A0293f69A1555dd22f4b7e60Fe907", 87343880], // Camelot
  ],
  bsc: [
    ["0x0b4645179C1b668464Df01362fC6219a7ab3234c", 26520492], // Uniswap
    ["0x8d7884666C056555fDD423Cd37846968040651b3", 32490558], // Pancakeswap
    ["0xd4bcFC023736Db5617E5638748E127581d5929bd", 26097149], // Thena
  ],
  moonbeam: [
    ["0x688cb9492bd2C72016f1765d813B2D713aa1F4C7", 4485966], // Uniswap
    ["0xB7dfC304D9cd88D98A262cE5B6a39Bb9d6611063", 3591244], // Beamswap
    ["0x6002D7714e8038f2058e8162b0b86c0b19c31908", 3569487], // Stellaswap
  ],
  celo: [
    ["0x0F548d7AD1A0CB30D1872b8C18894484d76e1569", 14032548], // Uniswap
  ],
  avax: [
    ["0xbF145c5239B1327909f3e37CA0cF890d014105E2", 43083367], // Uniswap
    ["0x71ea9545ED7f8662a8B461d7cb0899745E3fb3E6", 39225125], // Pharaoh
  ],
  fantom: [
    ["0xf874d4957861e193aec9937223062679c14f9aca", 62144066], // Spiritswap
  ],
  mantle: [
    ["0x849214C123Ba690D5fBc9301Ef2e66491fCd6FE6", 62288178], // Uniswap
    ["0x683292172E2175bd08e3927a5e72FC301b161300", 1000], // FusionX
    ["0xa5E9006C17740Cb9e4898657721c4dFE103d8456", 58580400], // Cleopatra
  ],
  rollux: [
    ["0x683292172E2175bd08e3927a5e72FC301b161300", 1435083], // PegaSys
  ],
  linea: [
    ["0xA8E2fD481342976a3259591FBc08999369a43C5A", 3554431], // Uniswap
    ["0xc27ddd78fc49875fe6f844b72bbf31dfbb099881", 163300], // Lynex
    ["0x9C3E0445559E6de1fe6391E8e018DcA02B480836", 3952143], // Nile
  ],
  base: [
    ["0x829432679F69DBd8b2575f006EC0129894a39D86", 12465470], // Uniswap
    ["0x339685503dD534D27ce4a064314c2E5c7144aa92", 7783229], // Pancakeswap
    ["0x6d5c54F535b073B9C2206Baf721Af2856E5cD683", 3785552], // Sushiswap
    ["0x1E86A593E55215957C4755f1BE19a229AF3286f6", 2798768], // SynthSwap
    ["0xB24DC81f8Be7284C76C7cF865b803807B3C2EF55", 4249062], // BaseX
    ["0x39ce2eB762e7bFe19b6AD4D5bA384c67CE4051f0", 7310157], // Swapbased
    ["0x8118C33513feC13f8cf488CCb4509190650F0e92", 7310111], // Baseswap
    ["0xf1DF4F17e34Ba710DfFC487F73f1e19476E815a6", 8743213], // Thick
  ],
  kava: [
    ["0x683292172E2175bd08e3927a5e72FC301b161300", 6384272], // Kinetix
  ],
  op_bnb: [
    ["0x683292172E2175bd08e3927a5e72FC301b161300", 5150910], // Pancakeswap
    ["0xf14Fb95d6E7E1ab5fCdFfF7Ab203a84b9361E6FC", 10038113], // Thena
  ],
  manta: [
    ["0x683292172E2175bd08e3927a5e72FC301b161300", 394949], // Apertureswap
    ["0x8a9570ec97534277Ade6e46d100939FbCE4968f0", 689622], // Quickswap
  ],
  metis: [
    ["0xFc13Ebe7FEB9595D70195E9168aA7F3acE153621", 9080358], // Hercules
  ],
  xdai: [
    ["0x683292172E2175bd08e3927a5e72FC301b161300", 31760496], // Swapr
  ],
  astrzk: [
    ["0x683292172E2175bd08e3927a5e72FC301b161300", 306151], // Quickswap
  ],
  imx: [
    ["0x683292172E2175bd08e3927a5e72FC301b161300", 3951377], // Quickswap
  ],
  scroll: [
    ["0x683292172E2175bd08e3927a5e72FC301b161300", 4651930], // Uniswap
  ],
  blast: [
    ["0xFc13Ebe7FEB9595D70195E9168aA7F3acE153621", 1727054], // Uniswap
    ["0xF44cECB1CF40ee12303E85Eb8651263c01812EaD", 1815717], // Thruster
    ["0xC27DDd78FC49875Fe6F844B72bbf31DFBB099881", 1005700], // Blaster
  ],
  xlayer: [
    ["0x683292172E2175bd08e3927a5e72FC301b161300", 696737], // Quickswap
    ["0xC27DDd78FC49875Fe6F844B72bbf31DFBB099881", 697096], // xtrade
  ],
};

Object.keys(HYPE_REGISTRY).forEach(chain => {
  config[chain] = {
    ...config[chain],
    registries: HYPE_REGISTRY[chain].map(([factory, fromBlock]) => ({ factory, fromBlock, })),
  }
})

module.exports = config
