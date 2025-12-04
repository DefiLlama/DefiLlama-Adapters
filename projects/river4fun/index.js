const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');

function createExports({
  farmList, // { address, asset }[]
}) {
  return {
    tvl: async api => {
      const tokensAndOwners = [];
      if (farmList) {
        for (let index = 0; index < farmList.length; index++) {
          const { address: farmAddress, asset } = farmList[index];
          tokensAndOwners.push([asset, farmAddress]);
        }
      }

      return sumTokens2({ api, tokensAndOwners });
    },
  };
}

module.exports = {
  bsc: createExports({
    farmList: [
      {
        address: '0xc1BFd0b70D9A8a397437d32039051B1b4814AC02',
        asset: ADDRESSES.bsc.WBNB, // WBNB
      },
      {
        address: '0x36fcA82042fe13570455f7C9A9b08b0f758000e6',
        asset: '0xAF558b832C290C29f59Ddf317e6E010fb5758f27', // GOLD
      },
      {
        address: '0xD480a0Aab2Bc4A536449B18B7d0C1b3a3c326C93',
        asset: ADDRESSES.bsc.USD1, // USD1
      },
      {
        address: '0x9dA4F7DF9d6D4789b9fd47aa98630546FE0DC839',
        asset: '0x87d00066cf131ff54B72B134a217D5401E5392b6', // PUFFER
      },
      {
        address: '0x0F1c38CEA75bD9521996d1E6778E0d8Da514ae10',
        asset: '0x783c3f003f172c6Ac5AC700218a357d2D66Ee2a2', // B2
      },
      {
        address: '0x1aF72A4A25fef21b6db385c5842Dafc754e703Dc',
        asset: '0xCAAE2A2F939F51d97CdFa9A86e79e3F085b799f3', // TUT
      },
      {
        address: '0x527BB020493724aEbAD66744AFc811B15402F032',
        asset: '0xabE8E5CabE24Cb36df9540088fD7cE1175b9bc52', // SOLV
      },
      {
        address: '0x67cF8c8CF57587eAD064E02F5FeF73Aa6CFcC038',
        asset: '0x3aee7602b612de36088f3ffed8c8f10e86ebf2bf', // BANK
      },
      {
        address: '0xcB6e19606eECc93b21AE847a7506be571f58F1e6',
        asset: '0xa0c56a8c0692bD10B3fA8f8bA79Cf5332B7107F9', // MERL
      },
      {
        address: '0x668c8F77442F92e60707102e289DE5AFa84A5382',
        asset: '0x0C808F0464C423d5Ea4F4454fcc23B6E2Ae75562', // EDGEN
      },
      {
        address: '0xaB7695c6613162C6319fbfFc08b5606E9c21A442',
        asset: '0xFf7d6A96ae471BbCD7713aF9CB1fEeB16cf56B41', // Bedrock
      },
      {
        address: '0x6C87b5B856F6d3ec8BcB80CD0613356691206FAd',
        asset: '0x0000028a2eB8346cd5c0267856aB7594B7a55308', // ZetaChain
      },
      {
        address: '0xC7020Ea170c484E8Ef27A0DCB9441F5373DF88aa',
        asset: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', // CAKE
      },
      {
        address: '0x854394b4792F967F9b0C0A0b79352ea115a3B214',
        asset: '0x103071Da56e7cD95b415320760D6a0dDC4DA1ca5', // XTER
      },
      {
        address: '0x516b51d47EEf84df74D91475C4aDC061EA4E3529',
        asset: '0x74836cC0E821A6bE18e407E6388E430B689C66e9', // JAGER
      },
      {
        address: '0x358Cd0aC98e662E428A463D11b5967c5119B4e20',
        asset: '0x51363F073b1E4920fdA7AA9E9d84BA97EdE1560e', // BOB
      },
      {
        address: '0x7397CD23b450C1e7e0DB5A91cdcE8E90A7974c13',
        asset: '0xf4B385849f2e817E92bffBfB9AEb48F950Ff4444', // EGL1
      },
      {
        address: '0x09d764e46bd9355f8086761a4771f522984dfd28',
        asset: '0x208bF3E7dA9639f1Eaefa2DE78c23396B0682025', // Tagger
      },
      {
        address: '0x25213f3B73382B7be037332D626255b36242CAd8',
        asset: '0x3c8D20001FE883934A15c949a3355a65Ca984444', // Janitor
      },
      {
        address: '0x84F9C0d827BB03696616BD28020F58514cDADF32',
        asset: '0x6EA8211A1E47dBD8b55c487c0B906ebC57B94444', // Liberty
      },
      {
        address: '0xC3F64F628E28B6Ba1565dcaF88660ACd449394F8',
        asset: '0xFE8bF5B8F5e4eb5f9BC2be16303f7dAB8CF56aA8', // BIBI
      },
      {
        address: '0x34471ccFc8f9bFAa4800eFB639C4c7080033aa18',
        asset: '0x9C7BEBa8F6eF6643aBd725e45a4E8387eF260649', // G
      },
      {
        address: '0x48e791F20c524fA6800D65cA52063eFB66d4E590',
        asset: '0xc08Cd26474722cE93F4D0c34D16201461c10AA8C', // CARV
      },
      {
        address: '0x69288E9489a557Bb05b26989B8FfD2f5bd4943dF',
        asset: '0xB78C8F4e04F9d5Fc6Db469DBa25006D9AAa38888', // Pengu
      },
      {
        address: '0xB27773c1F72d74a77DC84409791b4752AE9ef065',
        asset: '0x6f88DBed8f178F71F6A0C27Df10D4f0B8dDf4444', // Usagi
      },
      {
        address: '0x6671bC9Ef65ac81D57eE22Bc63Cf63B67C34C723',
        asset: '0x47474747477b199288bF72a1D702f7Fe0Fb1DEeA', // WLFI
      },
    ],
  }),
};
