const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unknownTokens')

const WETH = ADDRESSES.ethereum.WETH;
const GOV_POOL = '0x18174E80335B9fCbc8ac0AB7f40F25aba878ccCC';
const SPLIT_CONTRACT = '0x5b38A73f9dB3F5e12BB4dCb5a434FB3bd3972E53';
const STAKING_CONTRACT = '0x569a157eac744b87a42314e8fc03a2e648ea33a2'

module.exports = {
    methodology: 'Total amount of WETH split, plus the value of Pool2',
    start: '2022-08-30',
    ethereum: {
        tvl: sumTokensExport({ owner: SPLIT_CONTRACT, tokens: [WETH] }),
        pool2: sumTokensExport({ owner: STAKING_CONTRACT, tokens: [GOV_POOL], useDefaultCoreAssets: true }),
    }
};