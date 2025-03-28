const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  hemi: {
    tvl: sumTokensExport({
      owners: [
        "0x4F5E928763CBFaF5fFD8907ebbB0DAbd5f78bA83",
      ],
      tokens: [
        '0x7A06C4AeF988e7925575C50261297a946aD204A8',
        '0x8154Aaf094c2f03Ad550B6890E1d4264B5DdaD9A',
        '0x78E26E8b953C7c78A58d69d8B9A91745C2BbB258',
        ADDRESSES.optimism.WETH_1,
        '0x6c851F501a3F24E29A8E39a29591cddf09369080',
        '0x027a9d301FB747cd972CFB29A63f3BDA551DFc5c',
        ADDRESSES.swellchain.rsETH,
        ADDRESSES.hemi.USDC_e,
        '0xbB0D083fb1be0A9f6157ec484b6C79E0A4e31C2e',
        '0x6A9A65B84843F5fD4aC9a0471C4fc11AFfFBce4a',
        '0x93919784C523f39CACaa98Ee0a9d96c3F32b593e',
        '0xAA40c0c7644e0b2B224509571e10ad20d9C4ef28',
        '0x0Af3EC6F9592C193196bEf220BC0Ce4D9311527D',
        '0x9BFA177621119e64CecbEabE184ab9993E2ef727',
        '0xf6718b2701D4a6498eF77D7c152b2137Ab28b8A3',
        '0xF9775085d726E782E83585033B58606f7731AB18',
        '0xF469fBD2abcd6B9de8E169d128226C0Fc90a012e',
        ADDRESSES.bob.WBTC,
      ]
    }),
  },
  doublecounted: true,
};
