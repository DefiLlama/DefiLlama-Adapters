const { sumTokens } = require('../helper/unwrapLPs')
const { getPoolInfo, } = require('../helper/masterchef')

async function tvl(timestamp, _block, { harmony: block }) {
    const masterChef = '0x392a46162b8dd7E6F1a34E4829043619B1f5a9f3';

    const standardPoolInfoAbi = 'function getPoolInfo(uint256 _pid) external view returns (address _lp, uint256 _allocPoint)'
    const chain = 'sonic'
    const poolInfo = await getPoolInfo(masterChef, block, chain, standardPoolInfoAbi)
    const toa = poolInfo.map(i => [i.output[0], masterChef])
    return sumTokens({}, toa, block, chain)
}

module.exports = {

    sonic: {
        tvl
    }
};
