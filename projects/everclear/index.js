const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const TOKENS_BY_CHAIN = {
  ethereum: [
    ADDRESSES.ethereum.WETH, // WETH
    ADDRESSES.ethereum.USDC, // USDC
    ADDRESSES.ethereum.USDT, // USDT
    "0xD7D2802f6b19843ac4DfE25022771FD83b5A7464", // xPufETH
  ],
  polygon: [
    ADDRESSES.polygon.WETH_1, // WETH
    ADDRESSES.polygon.USDC_CIRCLE, // USDC
    ADDRESSES.polygon.USDT, // USDT
  ],
  bsc: [
    ADDRESSES.bsc.ETH, // WETH
    ADDRESSES.bsc.USDC, // USDC
    ADDRESSES.bsc.USDT, // USDT
  ],
  avax: [
    ADDRESSES.avax.WETH_e, // WETH
    ADDRESSES.avax.USDC, // USDC
    ADDRESSES.avax.USDt, // USDT
  ],
  arbitrum: [
    ADDRESSES.arbitrum.WETH, // WETH
    ADDRESSES.arbitrum.USDC_CIRCLE, // USDC
    ADDRESSES.arbitrum.USDT, // USDT
  ],
  optimism: [
    ADDRESSES.optimism.WETH_1, // WETH
    ADDRESSES.optimism.USDC_CIRCLE, // USDC
    ADDRESSES.optimism.USDT, // USDT
  ],
  base: [
    ADDRESSES.optimism.WETH_1, // WETH
    ADDRESSES.base.USDC, // USDC
    ADDRESSES.base.USDT, // USDT
  ],
  xdai: [
    ADDRESSES.xdai.WETH, // WETH
    "0x2a22f9c3b484c3629090feed35f17ff8f88f76f0", // USDC
    ADDRESSES.xdai.USDT, // USDT
  ],
  unichain: [
    ADDRESSES.optimism.WETH_1, // WETH
    ADDRESSES.unichain.USDC, // USDC
    "0x588CE4F028D8e7B53B687865d6A67b3A54C75518", // USDT
  ],
  era: [
    ADDRESSES.era.WETH, // WETH
    "0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4", // USDC
    ADDRESSES.era.USDT, // USDT
  ],
  mantle: [
    ADDRESSES.mantle.WETH, // WETH
    ADDRESSES.mantle.USDC, // USDC
  ],
  apechain: [
    ADDRESSES.apechain.ApeETH, // WETH
    "0x6234E5ef39B12EFdFcbd99dd7F452F27F3fEAE3b", // xPufETH
  ],
  scroll: [
    ADDRESSES.scroll.WETH, // WETH
    ADDRESSES.scroll.USDC, // USDC
    ADDRESSES.scroll.USDT, // USDT
  ],
  ink: [
    ADDRESSES.optimism.WETH_1, // WETH
    ADDRESSES.ink.USDT0, // USDT
  ],
  berachain: [
    ADDRESSES.fuse.WETH_3, // WETH
  ],
  ronin: [
    ADDRESSES.ronin.WETH, // WETH 
    ADDRESSES.ronin.USDC, // USDC
  ],
  mode: [
    ADDRESSES.optimism.WETH_1, // WETH
    ADDRESSES.mode.USDT, // USDT 
    ADDRESSES.mode.USDC, // USDC
  ],
  zircuit: [
    "0x9346A5043C590133FE900aec643D9622EDddBA57", // xPufETH
  ],
  linea: [
    ADDRESSES.linea.USDT, // USDT
    ADDRESSES.linea.USDC, // USDC
    ADDRESSES.linea.WETH, // WETH
  ],
  blast: [
    ADDRESSES.blast.WETH, // WETH
  ],
  taiko: [
    ADDRESSES.taiko.USDT, // USDT
    ADDRESSES.taiko.USDC, // USDC
    ADDRESSES.taiko.WETH, // WETH
  ],
  sonic: [
    ADDRESSES.sonic.WETH, // WETH
  ],
};

// ---- Replace these with actual spoke addresses ----
const SPOKES_BY_CHAIN = {
  ethereum: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816", "0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"], //1
  polygon: ["0x7189C59e245135696bFd2906b56607755F84F3fD", "0x26CFF54f11608Cd3060408690803AB4a43f462f2"], //137
  bsc: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816", "0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"], //56
  avax: ["0x9aA2Ecad5C77dfcB4f34893993f313ec4a370460", "0x7EB63a646721de65eBa79ffe91c55DCE52b73c12"], //43114
  arbitrum: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816", "0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"], //42161
  optimism: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816", "0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"], //10
  base: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816", "0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"], //8453
  xdai: ["0xe0F010e465f15dcD42098dF9b99F1038c11B3056", "0xeFa6Ac3F931620fD0449eC8c619f2A14A0A78E99"], //100
  unichain: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816", "0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"], //130
  era: ["0x7F5e085981C93C579c865554B9b723B058AaE4D3", "0xbD82E5503461913a70566E66a454465a46F5C903"], //324
  mantle: ["0xe0F010e465f15dcD42098dF9b99F1038c11B3056", "0xeFa6Ac3F931620fD0449eC8c619f2A14A0A78E99"], //5000
  apechain: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816", "0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"], //33139
  scroll: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816", "0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"], //534352
  ink: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816", "0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"], //57073  
  berachain: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816", "0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"], //80094
  ronin: ["0xdCA40903E271Cc76AECd62dF8d6c19f3Ac873E64", "0x1FC1f47a6a7c61f53321643A14bEc044213AbF95"], //2020
  mode: ["0xeFa6Ac3F931620fD0449eC8c619f2A14A0A78E99", "0xD1daF260951B8d350a4AeD5C80d74Fd7298C93F4"], //34443
  zircuit: ["0xD0E86F280D26Be67A672d1bFC9bB70500adA76fe", "0x2Ec2b2CC1813941b638D3ADBA86A1af7F6488A9E"], //48900
  linea: ["0xc24dC29774fD2c1c0c5FA31325Bb9cbC11D8b751", "0xC1E5b7bE6c62948eeAb40523B33e5d0121ccae94"], //59144
  blast: ["0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7", "0x4e2bbbFb10058E0D248a78fe2F469562f4eDbe66"], //81457
  taiko: ["0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7", "0x4e2bbbFb10058E0D248a78fe2F469562f4eDbe66"], //167000
  sonic: ["0xa05A3380889115bf313f1Db9d5f335157Be4D816", "0x9ADA72CCbAfe94248aFaDE6B604D1bEAacc899A7"], //146

};

const tvl = async (api) => {
  const owners = SPOKES_BY_CHAIN[api.chain]
  const tokens = TOKENS_BY_CHAIN[api.chain]
  return api.sumTokens({ owners, tokens, });
};

module.exports = {
  methodology:
    "TVL counts all tokens held inside Everclear Spoke contracts (WETH, USDC, USDT, xPufETH).",
}

Object.keys(SPOKES_BY_CHAIN).forEach((chain) => module.exports[chain] = { tvl });
