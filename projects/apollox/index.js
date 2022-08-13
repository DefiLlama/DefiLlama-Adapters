const { pool2 } = require('../helper/pool2');
const { stakings } = require('../helper/staking');
const { sumTokens } = require('../helper/unwrapLPs');

const stakingContract = '0x7eb5af418f199ea47494023c3a8b83a210f8846f'
const stakingContract_APX = '0x6bE863e01E17A226c945e3629D0D9Cb6E52Ce90E'
const poolContract = '0xa0ee789a8f581cb92dd9742ed0b5d54a0916976c'
const treasureContract = '0xe2e912f0b1b5961be7cb0d6dbb4a920ace06cd99'
const daoContract = "0x7f878994507F5B0588cF0EBEE07128d9A742ad9d"

const TOKEN_APX = '0x78f5d389f5cdccfc41594abab4b0ed02f31398b3'
const TOKEN_BSC_USD = '0x55d398326f99059fF775485246999027B3197955'
const TOKEN_BUSD = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
const TOKEN_CAKE = '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82'
const TOKEN_BABY = '0x53e562b9b7e5e94b81f10e96ee70ad06df3d2657'
const TOKEN_LEOS = '0x2c8368f8f474ed9af49b87eac77061beb986c2f1'

const TreasureTokens = [
  TOKEN_BSC_USD,
  TOKEN_BUSD,
  TOKEN_CAKE,
  TOKEN_BABY,
  TOKEN_LEOS,
]

async function tvl(timestamp, _block, { bsc: block }) {
  const toa = TreasureTokens.map(t => [t, treasureContract])
  return sumTokens({}, toa, block, 'bsc')
}

module.exports = {
  start: 1640100600,  // 12/21/2021 @ 15:30pm (UTC)
  bsc: {
    tvl,
    staking: stakings([stakingContract_APX, daoContract], TOKEN_APX, 'bsc'),
    pool2: pool2(stakingContract, poolContract, 'bsc'),
  },
};
