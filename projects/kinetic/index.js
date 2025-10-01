const { compoundExports2 } = require('../helper/compound')
const sdk = require('@defillama/sdk');

module.exports = {
    flare: {
        tvl: sdk.util.sumChainTvls([
          compoundExports2({ comptroller: '0x8041680Fb73E1Fe5F851e76233DCDfA0f2D2D7c8' }).tvl,
          compoundExports2({ comptroller: '0xDcce91d46Ecb209645A26B5885500127819BeAdd', cether: '0xd7291D5001693d15b6e4d56d73B5d2cD7eCfE5c6' }).tvl,
          compoundExports2({ comptroller: '0x15F69897E6aEBE0463401345543C26d1Fd994abB' }).tvl
        ]),
        borrowed: sdk.util.sumChainTvls([
          compoundExports2({ comptroller: '0x8041680Fb73E1Fe5F851e76233DCDfA0f2D2D7c8' }).borrowed,
          compoundExports2({ comptroller: '0xDcce91d46Ecb209645A26B5885500127819BeAdd', cether: '0xd7291D5001693d15b6e4d56d73B5d2cD7eCfE5c6' }).borrowed,
          compoundExports2({ comptroller: '0x15F69897E6aEBE0463401345543C26d1Fd994abB' }).borrowed
        ])
    }
}