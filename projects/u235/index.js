const { aaveChainTvl } = require('../helper/aave');


function v3(chain) {
    const section = borrowed => aaveChainTvl(chain, '0xE58Ebf93885c8Ea0368fCe84aF79EC983b80c8D5', undefined, ['0x01B24202080395f9F6A9AE47f8431D9f0040f927'], borrowed, true);
    return {
        tvl: section(false),
        borrowed: section(true)
    }
}

module.exports = {
    methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending`,
    scroll: v3("scroll"),
};
// node test.js projects/aave/index.js
