
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasuries = ['0x74B97d2097D64b4D2A3317d4Bda2dAb88B80e7ab', '0xd22faE190736eFFc8ceB3d8845a5D33ae7805392']

module.exports = treasuryExports({
  ethereum: {
    owners: treasuries,
    tokens: [nullAddress, '0x23878914efe38d27c4d67ab83ed1b93a74d4086a'],
  },
});
