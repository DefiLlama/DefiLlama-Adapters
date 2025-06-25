const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const { pool2 } = require('../helper/pool2')

const STAKING_ADDRESS = '0x2d615795a8bdb804541C69798F13331126BA0c09';
const AAVE_TOKEN = ADDRESSES.ethereum.AAVE
const BOND_TOKEN = '0x0391d2021f89dc339f60fff84546ea23e337750f'
const COMP_TOKEN = '0xc00e94cb662c3520282e6f5717214004a7f26888'
const SNX_TOKEN = ADDRESSES.ethereum.SNX
const SUSHI_TOKEN = ADDRESSES.ethereum.SUSHI
const LINK_TOKEN = ADDRESSES.ethereum.LINK
const ILV_TOKEN = '0x767fe9edc9e0df98e07454847909b5e959d7ca0e'
const USDC_XYZ_SUSHI_LP_TOKEN = '0xbbbdb106a806173d1eea1640961533ff3114d69a'


module.exports = {
    methodology: 'TVL counts tokens that have been deposited to the yield farming vaults. Pool2 TVL counts SushiSwap LP tokens (USDC-XYZ) that have been deposited to the yield farm.',
    ethereum: {
        tvl: sumTokensExport({ owner: STAKING_ADDRESS, tokens: [AAVE_TOKEN, BOND_TOKEN, COMP_TOKEN, ILV_TOKEN, LINK_TOKEN, SNX_TOKEN, SUSHI_TOKEN]}),
        pool2: pool2(STAKING_ADDRESS, USDC_XYZ_SUSHI_LP_TOKEN),
    },
    start: '2021-05-25', // May-25-2021 10:39:49 AM +UTC
};