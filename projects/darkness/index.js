const ADDRESSES = require('../helper/coreAssets.json')
const masterChef = "0x63Df75d039f7d7A8eE4A9276d6A9fE7990D7A6C5";
const ness = "0xe727240728c1a5f95437b8b50afdd0ea4ae5f0c8";
const nessroom = "0xA93248C548Ac26152F3b4F201C9101f4e032074e";

const { sumTokensExport } = require('../helper/unknownTokens');

module.exports = {
  cronos: {
    tvl: sumTokensExport({
      owner: '0x92631e0e84ff01853ef1bb88fc9c9f7d1e1af1ca',
      tokens: [
        ADDRESSES.cronos.WCRO_1,
        '0xf2001b145b43032aaf5ee2884e456ccd805f677d',
        ADDRESSES.cronos.USDC,
        '0x6582c738660bf0701f05b04dce3c4e5fcfcda47a',
        ADDRESSES.cronos.USDT,
        '0x83b2ac8642ae46fc2823bc959ffeb3c1742c48b5',
        ADDRESSES.cronos.WBTC,
        '0x9d3bbb0e988d9fb2d55d07fe471be2266ad9c81c',
        '0x1ecaf6a3551e5822f142c9689d8f36a9b5f68217',
        '0xfa202a63234a7089eddbfeee83c378ba248f0e9a',
      ],
    }),
    pool2: sumTokensExport({
      owner: masterChef,
      tokens: [
        '0xbfaab211c3ea99a2db682fbc1d9a999861dcba2d',
        '0x8c183c81a5ae3e7a46ecaac17c4bf27a6a40bbe8',
        '0xa4aa24b8e855052071df60e174219e6c8fee45a3',
        '0xd9debaab797cb92c257b2988aafa92c728b124e6',
      ],
      useDefaultCoreAssets: true,
    }),
    staking: sumTokensExport({
      owner: nessroom,
      tokens: [ness],
      lps: ['0xd9debaab797cb92c257b2988aafa92c728b124e6'],
      useDefaultCoreAssets: true,
    }),
  }
};
