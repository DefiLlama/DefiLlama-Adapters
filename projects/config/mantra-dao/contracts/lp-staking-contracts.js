const ADDRESSES = require('../../../helper/coreAssets.json')
const lpStakingAssetsETH = [
  // LABS-ETH UNI LP simple staking
  {
    contract: "0x5f81a986611C600a3656d9adc202283186C6121D",
    pairAddress: "0x2d9fd51e896ff0352cb6d697d13d04c2cb85ca83",
    token1: "0x2D9FD51E896Ff0352Cb6D697D13D04C2CB85CA83",
    price1: "labs-group",
    token2: ADDRESSES.ethereum.WETH,
    price2: "weth",
  },
  // LABS-ETH UNI LP staking with exit tollbooth
  {
    contract: "0xfc8e3b55897d8cef791451bbe69b204b9c58fc8a",
    pairAddress: "0x2d9fd51e896ff0352cb6d697d13d04c2cb85ca83",
    token1: "0x2D9FD51E896Ff0352Cb6D697D13D04C2CB85CA83",
    price1: "labs-group",
    token2: ADDRESSES.ethereum.WETH,
    price2: "weth",
  },
  // MANTRA DAO OM-ETH LP staking
  {
    contract: "0x91fe14df53eae3a87e310ec6edcdd2d775e1a23f",
    pairAddress: "0xe46935ae80e05cdebd4a4008b6ccaa36d2845370",
    token1: "0x3593D125a4f7849a1B059E64F4517A86Dd60c95d",
    price1: "mantra-dao",
    token2: ADDRESSES.ethereum.WETH,
    price2: "weth",
  },
  // ROYA-ETH LP staking
  {
    contract: "0x55e0F2cE66Fa8C86ef478fa47bA0bE978eFC2647",
    pairAddress: "0x6d9d2427cfa49e39b4667c4c3f627e56ae586f37",
    token1: "0x4Cd4c0eEDb2bC21f4e280d0Fe4C45B17430F94A9",
    price1: "royale",
    token2: ADDRESSES.ethereum.WETH,
    price2: "weth",
  },
  // BITE-ETH LP staking
  {
    contract: "0xb12f0CbcC89457d44323139e6Bb0526Fd82f12F2",
    pairAddress: "0x1f07f8e712659087914b96db4d6f6e4fee32285e",
    token1: "0x4eed0fa8de12d5a86517f214c2f11586ba2ed88d",
    price1: "dragonbite",
    token2: ADDRESSES.ethereum.WETH,
    price2: "weth",
  },
  // BITE-ETH LP staking w/ tollbooth
  {
    contract: "0x18Ba986ED3128fc7E3E86a09E902436e900a899c",
    pairAddress: "0x1f07f8e712659087914b96db4d6f6e4fee32285e",
    token1: "0x4eed0fa8de12d5a86517f214c2f11586ba2ed88d",
    price1: "dragonbite",
    token2: ADDRESSES.ethereum.WETH,
    price2: "weth",
  },
  // BBANK-ETH LP staking
  {
    contract: "0x6406788d1CD4fdD823ef607A924c00a4244a841d",
    pairAddress: "0x2a182e532a379cb2c7f1b34ce3f76f3f7d3596f7",
    token1: ADDRESSES.ethereum.WETH,
    price1: "weth",
    token2: "0xf4b5470523ccd314c6b9da041076e7d79e0df267",
    price2: "blockbank",
  },
  // RAZE-ETH LP staking
  {
    contract: "0xe2a80A76B084B51CFAe5B2C3e0FF5232e0408201",
    pairAddress: "0x4fc47579ecf6aa76677ee142b6b75faf9eeafba8",
    token1: "0x5eaa69b29f99c84fe5de8200340b4e9b4ab38eac",
    price1: "raze-network",
    token2: ADDRESSES.ethereum.WETH,
    price2: "weth",
  },
  // BCUBE-ETH LP staking
  {
    contract: "0xFF964d0bf9f81c401932A6B975EAE54129712eE5",
    pairAddress: "0xc62bf2c79f34ff24e2f97982af4f064161ed8949",
    token1: "0x93c9175e26f57d2888c7df8b470c9eea5c0b0a93",
    price1: "b-cube-ai",
    token2: ADDRESSES.ethereum.WETH,
    price2: "weth",
  },
];

// BSC LP Staking
const lpStakingAssetsBSC = [
  // FINE-BNB LP staking
  {
    contract: "0xF25897a7EDf1Dfa9C65f5DB7Ec4Bad868873805B",
    pairAddress: "0xC309a6d2F1537922E06f15aA2eb21CaA1b2eEDb6",
    token1: "0x4e6415a5727ea08aae4580057187923aec331227",
    price1: "refinable",
    token2: ADDRESSES.bsc.WBNB,
    price2: "wbnb",
  },
  // OM-BNB LP staking
  {
    contract: "0xcbf42ace1dbd895ffdcabc1b841488542626014d",
    pairAddress: "0x49837a48abde7c525bdc86d9acba39f739cbe22c",
    token1: ADDRESSES.bsc.WBNB,
    price1: "wbnb",
    token2: "0xf78d2e7936f5fe18308a3b2951a93b6c4a41f5e2",
    price2: "mantra-dao",
  },
  // CBD-BNB LP staking
  {
    contract: "0x92fCe8AfFB2A68d418BaDF8E360E0CDe06c39356",
    pairAddress: "0x0b49580278b403ca13055bf4d81b6b7aa85fd8b9",
    token1: "0x0e2b41ea957624a314108cc4e33703e9d78f4b3c",
    price1: "greenheart-cbd",
    token2: ADDRESSES.bsc.WBNB,
    price2: "wbnb",
  },
  // BBANK-BNB LP staking
  {
    contract: "0x1E8BC897bf03ebac570Df7e5526561f8a42eCe05",
    pairAddress: "0x538e61bd3258304e9970f4f2db37a217f60436e1",
    token1: ADDRESSES.bsc.WBNB,
    price1: "wbnb",
    token2: "0xf4b5470523ccd314c6b9da041076e7d79e0df267",
    price2: "blockbank",
  },
  // BONDLY-BNB LP staking
  {
    contract: "0xD862866599CA681c492492E1B7B9aB80066f2FaC",
    pairAddress: "0xb8b4383b49d451bbea63bc4421466e1086da6f18",
    token1: "0x96058f8c3e16576d9bd68766f3836d9a33158f89",
    price1: "bondly",
    token2: ADDRESSES.bsc.WBNB,
    price2: "wbnb",
  },
  // MIST-BNB LP staking
  {
    contract: "0x4F905f75F5576228eD2D0EA508Fb0c32a0696090",
    pairAddress: "0x5a26eb7c9c72140d01039eb172dcb8ec98d071bd",
    token1: "0x68e374f856bf25468d365e539b700b648bf94b67",
    price1: "mist",
    token2: ADDRESSES.bsc.WBNB,
    price2: "wbnb",
  },
  // ROSN-BNB LP staking
  {
    contract: "0x5B4463bBD7B2E870601e91161e0F1F7f84CDE214",
    pairAddress: "0x5548bd47293171d3bc1621edccd953bcc9b814cb",
    token1: "0x651Cd665bD558175A956fb3D72206eA08Eb3dF5b",
    price1: "roseon-finance",
    token2: ADDRESSES.bsc.WBNB,
    price2: "wbnb",
  },
  // MLT-BNB LP staking
  {
    contract: "0x398a5FEE22E0dEb67dA1bD15FA4841b6Aa64c471",
    pairAddress: "0x560b96f81a2190ff6ac84ebfd17788bab3679cbc",
    token1: "0x4518231a8fdf6ac553b9bbd51bbb86825b583263",
    price1: "media-licensing-token",
    token2: ADDRESSES.bsc.WBNB,
    price2: "wbnb",
  },
  // L3P-BNB LP staking
  {
    contract: "0x3ba3E2f3cACcDbE3C56D3046FFe859cc9deE08a0",
    pairAddress: "0xB62c57Bda4C126E21A726e3D28734bfb1151231e",
    token1: ADDRESSES.bsc.WBNB,
    price1: "wbnb",
    token2: "0xdeF1da03061DDd2A5Ef6c59220C135dec623116d",
    price2: "lepricon",
  },
];

// POLYGON  LP Staking
const lpStakingAssetsPOLYGON = [
  // OM-WETH LP staking
  {
    contract: "0xCBf42Ace1dBD895FFDCaBC1b841488542626014d",
    pairAddress: "0xff2bbcb399ad50bbd06debadd47d290933ae1038",
    token1: ADDRESSES.polygon.WETH_1,
    price1: "weth",
    token2: "0xC3Ec80343D2bae2F8E680FDADDe7C17E71E114ea",
    price2: "mantra-dao",
  },
  // GAMER-WETH LP staking
  {
    contract: "0x11c70CAA910647d820bD014d676Dcd97EDD64A99",
    pairAddress: "0x1dF661fC4319415a2f990bd5F49D5cA70EFDee1C",
    token1: "0x3f6b3595ecF70735D3f48D69b09C4E4506DB3F47",
    price1: "gamestation",
    token2: ADDRESSES.polygon.WETH_1,
    price2: "weth",
  },
];

module.exports = {
  lpStakingAssetsETH,
  lpStakingAssetsBSC,
  lpStakingAssetsPOLYGON,
};
