const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum:{
    tvl: sumTokensExport({
      owner: '0x1B8568FbB47708E9E9D31Ff303254f748805bF21',
      tokens: [
        '0xaFEf0965576070D1608F374cb14049EefaD218Ec',
        '0x4f5704D9D2cbCcAf11e70B34048d41A0d572993F',
        ADDRESSES.ethereum.BAT,
        '0x319eAd06eb01E808C80c7eb9bd77C5d8d163AddB',
        '0xF047ee812b21050186f86106f6cABDfEc35366c6',
        '0x155ff1A85F440EE0A382eA949f24CE4E0b751c65',
        ADDRESSES.ethereum.MKR,
        ADDRESSES.ethereum.LINK,
        '0x4575f41308EC1483f3d399aa9a2826d74Da13Deb',
        ADDRESSES.ethereum.DAI,
        '0x93ED3FBe21207Ec2E8f2d3c3de6e058Cb73Bc04d',
        '0x42476F744292107e34519F9c357927074Ea3F75D',
        '0x890ff7533Ca0C44F33167FdEEeaB1cA7E690634F',
      ],
      resolveLP: true,
    }),
  },
}