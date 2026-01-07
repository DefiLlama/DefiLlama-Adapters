const { treasuryExports } = require('../helper/treasury');

const betswirlToken = '0x94025780a1aB58868D9B2dBBB775f44b32e8E6e5';

module.exports = treasuryExports({
  ethereum: {
    owners: ['0x9f72820ee00d54330F9Ba31ff6006116D7ddFE67'],
    ownTokens:[betswirlToken],
  },
  polygon: {
    owners: ['0xfA695010bF9e757a1abCd2703259F419217aa756'],
    ownTokens:[betswirlToken],
    blacklistedTokens:['0x9246a5F10A79a5a939b0C2a75A3AD196aAfDB43b']
  },
  bsc: {
    owners: ['0xCD25325a6eF20BC5dF9bceAc0cC22a48d2e8f6eF'],
    ownTokens:[betswirlToken],
    blacklistedTokens:['0x3e0a7C7dB7bB21bDA290A80c9811DE6d47781671']
  },
  avax: {
    owners: ['0x1a75280F832280Af93f588f715a5Fb4Ca7918430'],
    ownTokens: [betswirlToken],
    blacklistedTokens: ['0xc763f8570A48c4c00C80B76107cbE744dDa67b79']
  },
  arbitrum: {
    owners: ['0xf14C79a7fA22c1f97C779F573c9bF39b6b43381c'],
    ownTokens: [betswirlToken],
    blacklistedTokens: ['0xe26Ae3d881f3d5dEF58D795f611753804E7A6B26']
  },
  xdai: {
    owners: ['0x6e36cFcD5d59b96AaBC8699C2Ad31a874224D86e']
  },
  base: {
    owners: ['0xBf1998e1F1cD52fBfb63e7E646bb39c091A7B70A'],
    ownTokens: [betswirlToken],
  },
  optimism: {
    owners: ['0xE901680E2E754Fc97288631dc29D91f7a989Cc10']
  },
  unichain: {
    owners: ['0xBf1998e1F1cD52fBfb63e7E646bb39c091A7B70A']
  }
})

