const { sumTokensExport } = require("../helper/unknownTokens");
const { nullAddress } = require("../helper/unwrapLPs");

const stakingContractAddress = '0xefC170513C4026771279D453EF57cEEb66881929';
const whiteTokenAddress = '0x39B44F9C6e3ed4F1b4F7b01B9176B1F440195a2f';
const LP = '0x177f0bcEF458cb379581A9B8e67E02abfe4a3d08'

module.exports = {
  misrepresentedTokens: true,
  op_bnb: {
    tvl: sumTokensExport({ owner: stakingContractAddress, tokens: [nullAddress] }),
    pool2: sumTokensExport({ owner: '0xdB9320dDE030cEF08C615E7547cee98848Bd297e', tokens: [LP], useDefaultCoreAssets: true }),
  },
};