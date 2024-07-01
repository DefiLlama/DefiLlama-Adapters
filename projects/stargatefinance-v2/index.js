const abi = require('./abi.json')

const CONFIG = {
  ethereum: {
    stakingContract: '0xFF551fEDdbeDC0AeE764139cCD9Cb644Bb04A6BD',
    pools: [
      '0x77b2043768d28E9C9aB44E1aBfC95944bcE57931',
      '0xc026395860Db2d07ee33e05fE50ed7bD583189C7',
      '0x933597a323Eb81cAe705C5bC29985172fd5A3973',
      '0xcDafB1b2dB43f366E48e6F614b8DCCBFeeFEEcD3',
      '0x268Ca24DAefF1FaC2ed883c598200CcbB79E931D',
    ],
  },
  bsc: {
    stakingContract: '0x26727C78B0209d9E787b2f9ac8f0238B122a3098',
    pools: [
      '0x138EB30f73BC423c6455C53df6D89CB01d9eBc63',
    ],
  },
  avax: {
    stakingContract: '0x8db623d439C8c4DFA1Ca94E4CD3eB8B3Aaff8331',
    pools: [
      '0x5634c4a5FEd09819E3c46D86A965Dd9447d86e47',
      '0x12dC9256Acc9895B076f6638D628382881e62CeE',
    ],
  },
  polygon: {
    stakingContract: '0x4694900bDbA99Edf07A2E46C4093f88F9106a90D',
    pools: [
      '0x9Aa02D4Fae7F58b8E8f34c66E756cC734DAc7fe4',
      '0xd47b03ee6d86Cf251ee7860FB2ACf9f91B9fD4d7',
    ],
  },
  arbitrum: {
    stakingContract: '0x3da4f8E456AC648c489c286B99Ca37B666be7C4C',
    pools: [
      '0xA45B5130f36CDcA45667738e2a258AB09f4A5f7F',
      '0xe8CDF27AcD73a434D661C84887215F7598e7d0d3',
      '0xcE8CcA271Ebc0533920C83d39F417ED6A0abB7D0',
    ],
  },
  optimism: {
    stakingContract: '0xFBb5A71025BEf1A8166C9BCb904a120AA17d6443',
    pools: [
      '0xe8CDF27AcD73a434D661C84887215F7598e7d0d3',
      '0xcE8CcA271Ebc0533920C83d39F417ED6A0abB7D0',
      '0x19cFCE47eD54a88614648DC3f19A5980097007dD',
    ],
  },
  metis: {
    stakingContract: '0xF1fCb4CBd57B67d683972A59B6a7b1e2E8Bf27E6',
    pools: [
      '0xD9050e7043102a0391F81462a3916326F86331F0',
      '0x36ed193dc7160D3858EC250e69D12B03Ca087D08',
      '0x4dCBFC0249e8d5032F89D6461218a9D2eFff5125',
    ],
  },
  linea: {
    stakingContract: '0x25BBf59ef9246Dc65bFac8385D55C5e524A7B9eA',
    pools: [
      '0x81F6138153d473E8c5EcebD3DC8Cd4903506B075',
    ],
  },
  mantle: {
    stakingContract: '0x02DC1042E623A8677B002981164ccc05d25d486a',
    pools: [
      '0x4c1d3Fc3fC3c177c3b633427c2F769276c547463',
      '0xAc290Ad4e0c891FDc295ca4F0a6214cf6dC6acDC',
      '0xB715B85682B731dB9D5063187C450095c91C57FC',
      '0xF7628d84a2BbD9bb9c8E686AC95BB5d55169F3F1',
    ],
  },
  base: {
    stakingContract: '0xDFc47DCeF7e8f9Ab19a1b8Af3eeCF000C7ea0B80',
    pools: [
      '0xdc181Bd607330aeeBEF6ea62e03e5e1Fb4B6F7C7',
      '0x27a16dc786820B16E5c9028b75B99F6f604b5d26',
    ],
  },
  kava: {
    stakingContract: '0x10e28bA4D7fc9cf39F34E20bbC5C58694b2f1A92',
    pools: [
      '0x41A5b0470D96656Fb3e8f68A218b39AdBca3420b',
    ],
  },
  scroll: {
    stakingContract: '0x10e28bA4D7fc9cf39F34E20bbC5C58694b2f1A92',
    pools: [
      '0xC2b638Cb5042c1B3c5d5C969361fB50569840583',
      '0x3Fc69CC4A842838bCDC9499178740226062b14E4',
    ],
  },
  aurora: {
    stakingContract: '0x25BBf59ef9246Dc65bFac8385D55C5e524A7B9eA',
    pools: [
      '0x81F6138153d473E8c5EcebD3DC8Cd4903506B075',
    ],
  },
}

const createTvlFunction = (pools) => {
  return async (api) => {
    const [tokens, balances] = await Promise.all([
      api.multiCall({
        abi: abi.token,
        calls: pools,
      }),
      api.multiCall({
        abi: abi.tvl,
        calls: pools,
      }),
    ]);

    api.add(tokens, balances);
  };
};

Object.keys(CONFIG).forEach((chain) => {
  const { pools } = CONFIG[chain];
  module.exports[chain] = {
    tvl: createTvlFunction(pools),
  };
});
