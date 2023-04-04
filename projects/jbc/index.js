const { pool2 } = require("../helper/unknownTokens");
const { nullAddress, sumTokensExport, } = require("../helper/unwrapLPs")

const tokensAndOwners = [
  ['0x1addd80e6039594ee970e5872d247bf0414c8903', '0xe964b6083F24dBC06e94C662b195c22C76923b22'], // GLP
  [nullAddress, '0x1F01d43E994C5d009Bd50F7c68EdF04f8966135F'], // ETH
  ['0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f', '0xAfC888621Ad39Ff6B54C2F6168DDCE8152de314B'], // WBTC
  ['0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', '0xE1308Ada37C64bDfC3F9547af945F524E968c549'], // USDC
  ['0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', '0x0411fED8A22191a3F9e94FD7a159230D9A3888AC'], // USDT
  ['0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', '0xd323d188d787CDa4c5f3D2BBC087d1149F72F322'], // DAI
  ['0x912ce59144191c1204e64559fe8253a0e49e6548', '0x8EAF69Ea32024246d3E8F869602ce7F0fE3a214C'], // ARB
]

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({ tokensAndOwners }),
    pool2: pool2({ stakingContract: '0x1939A441D006bD74a0034891972fa25789Af7A24', lpToken: '0x85c6da933a7451bf2a6d836304b30967f3e76e11', chain: 'arbitrum', useDefaultCoreAssets: true, }),
  }
};

