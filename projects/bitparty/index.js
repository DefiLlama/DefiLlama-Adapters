const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  btr: {
    tvl: sumTokensExport({
      owners: ['0xb002b938d63fe8762f2a0eff9e49a8e20a0078e8',],
      tokens: [
        nullAddress,
        ADDRESSES.btr.ETH,
        ADDRESSES.btr.USDT,
        '0xf8c374ce88a3be3d374e8888349c7768b607c755',
        ADDRESSES.btr.WBTC,
        '0x07373d112edc4570b46996ad1187bc4ac9fb5ed0',
        '0x2729868df87d062020e4a4867ff507fb52ee697c',
        '0x68879ca2af24941fc3b6eb89fdb26a98aa001fc1',
        ADDRESSES.swellchain.stBTC,
        '0xe277aed3ff3eb9824edc52fe7703df0c5ed8b313',
        '0xf6fa83e30c7d3978f86141016ee9471d77f48ae0',
        '0xbb0cb5c5e49d5c3903932d07831fb8c1bb1651d2',
        '0xab7f136bbb18808f0c981d0307d3360ca92ad171'
      ],
    }),
  }
}
