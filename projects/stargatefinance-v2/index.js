const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const CONFIG = {
  ethereum: {
    pools: [
      '0x77b2043768d28E9C9aB44E1aBfC95944bcE57931',
      '0xc026395860Db2d07ee33e05fE50ed7bD583189C7',
      '0x933597a323Eb81cAe705C5bC29985172fd5A3973',
      '0xcDafB1b2dB43f366E48e6F614b8DCCBFeeFEEcD3',
      '0x268Ca24DAefF1FaC2ed883c598200CcbB79E931D',
    ],
  },
  bsc: {
    pools: [
      '0x138EB30f73BC423c6455C53df6D89CB01d9eBc63',
    ],
  },
  avax: {
    pools: [
      '0x5634c4a5FEd09819E3c46D86A965Dd9447d86e47',
      '0x12dC9256Acc9895B076f6638D628382881e62CeE',
    ],
  },
  polygon: {
    pools: [
      '0x9Aa02D4Fae7F58b8E8f34c66E756cC734DAc7fe4',
      '0xd47b03ee6d86Cf251ee7860FB2ACf9f91B9fD4d7',
    ],
  },
  arbitrum: {
    pools: [
      '0xA45B5130f36CDcA45667738e2a258AB09f4A5f7F',
      '0xe8CDF27AcD73a434D661C84887215F7598e7d0d3',
      '0xcE8CcA271Ebc0533920C83d39F417ED6A0abB7D0',
    ],
  },
  optimism: {
    pools: [
      '0xe8CDF27AcD73a434D661C84887215F7598e7d0d3',
      '0xcE8CcA271Ebc0533920C83d39F417ED6A0abB7D0',
      '0x19cFCE47eD54a88614648DC3f19A5980097007dD',
    ],
  },
  metis: {
    pools: [
      '0xD9050e7043102a0391F81462a3916326F86331F0',
      '0x36ed193dc7160D3858EC250e69D12B03Ca087D08',
      '0x4dCBFC0249e8d5032F89D6461218a9D2eFff5125',
    ],
  },
  linea: {
    pools: [
      '0x81F6138153d473E8c5EcebD3DC8Cd4903506B075',
    ],
  },
  mantle: {
    pools: [
      '0x4c1d3Fc3fC3c177c3b633427c2F769276c547463',
      '0xAc290Ad4e0c891FDc295ca4F0a6214cf6dC6acDC',
      '0xB715B85682B731dB9D5063187C450095c91C57FC',
      '0xF7628d84a2BbD9bb9c8E686AC95BB5d55169F3F1',
    ],
  },
  base: {
    pools: [
      '0xdc181Bd607330aeeBEF6ea62e03e5e1Fb4B6F7C7',
      '0x27a16dc786820B16E5c9028b75B99F6f604b5d26',
    ],
  },
  kava: {
    pools: [
      '0x41A5b0470D96656Fb3e8f68A218b39AdBca3420b',
    ],
  },
  scroll: {
    pools: [
      '0xC2b638Cb5042c1B3c5d5C969361fB50569840583',
      '0x3Fc69CC4A842838bCDC9499178740226062b14E4',
    ],
  },
  aurora: {
    pools: [
      '0x81F6138153d473E8c5EcebD3DC8Cd4903506B075',
    ],
  },
  sei: {
    pools: [
      '0x45d417612e177672958dC0537C45a8f8d754Ac2E', //usdc pool
      '0x0dB9afb4C33be43a0a0e396Fd1383B4ea97aB10a'
    ],
  },
  soneium: {
    pools: [
      '0x45f1A95A4D3f3836523F5c83673c797f4d4d263B', //usdc pool
      ADDRESSES.fuse.WETH_3
    ],
  },
  unichain: {
    pools: [
      '0xe9aBA835f813ca05E50A6C0ce65D0D74390F7dE7',
    ],
  },
  abstract: {
    pools: [
      '0x221F0E1280Ec657503ca55c708105F1e1529527D',
    ],
  },
  xdai: {
    pools: [
      '0xB1EeAD6959cb5bB9B20417d6689922523B2B86C3', //usdc pool
      '0xe9aBA835f813ca05E50A6C0ce65D0D74390F7dE7' //weth pool
    ],
  },
  lightlink_phoenix: {
    pools: [
      '0x8731d54E9D02c286767d56ac03e8037C07e01e98', //eth pool
    ],
  },
  hemi: {
    pools: [
      ADDRESSES.fuse.WETH_3, //eth pool
    ],
  },
  sonic: {
    pools: [
      '0xA272fFe20cFfe769CdFc4b63088DCD2C82a2D8F9', //usdc pool
    ],
  },
}

const createTvlFunction = (pools) => {
  return async (api) => {
    const tokens = await api.multiCall({ abi: 'address:token', calls: pools, })
    return sumTokens2({ api, tokensAndOwners2: [tokens, pools] })
  };
};

Object.keys(CONFIG).forEach((chain) => {
  const { pools } = CONFIG[chain];
  module.exports[chain] = {
    tvl: createTvlFunction(pools),
  };
});
