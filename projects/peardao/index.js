const { stakings } = require('../helper/staking');
const { pool2 } = require('../helper/pool2');
const { sumTokensExport } = require('../helper/unwrapLPs')

const PEX_TOKEN_CONTRACT = '0x6a0b66710567b6beb81A71F7e9466450a91a384b';
const BUSD_TOKEN_CONTRACT = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
const USDT_TOKEN_CONTRACT = '0x55d398326f99059ff775485246999027b3197955';
const USDC_TOKEN_CONTRACT = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d';
const WBNB_TOKEN_CONTRACT = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
const BTCB_TOKEN_CONTRACT = '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c';
const USTC_TOKEN_CONTRACT = '0x23396cF899Ca06c4472205fC903bDB4de249D6fC';

const PEX_BNB_LP_CONTRACT = '0x5ca96E8bDe0Bc587DaC9e02422Fd205b1102DAa4';
const PEX_BNB_LP_MASTER_CHEF = '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652';
const PEX_STAKING_POOL_CONTRACT = '0x5F57dCa7D4f81D56C777E060D9dC81AF112d23eb';
const DOTC_CONTRACT = '0x8996Da635aFabd360fbABB80e7Be5028324B8323'; // P2P trade escrow contract
const TREASURY_ADDRESS = '0x263e0910C8c1B77B80CB9947B0FAC3735a6FEf4C';
const tokens =  [
  BUSD_TOKEN_CONTRACT, USDC_TOKEN_CONTRACT, USDT_TOKEN_CONTRACT, WBNB_TOKEN_CONTRACT, USTC_TOKEN_CONTRACT, BTCB_TOKEN_CONTRACT,
]

module.exports = {
  methodology: 'Counts the value of LP tokens and PEX tokens in the staking contracts, assets locked in the P2P escrow contract, and assets in the treasury contract.',
  start: 15966251, // Mar-11-2022 01:00:01 PM +UTC
  bsc: {
    tvl: sumTokensExport({ chain: 'bsc', tokens, owner: DOTC_CONTRACT, }),
    staking: stakings([TREASURY_ADDRESS, PEX_STAKING_POOL_CONTRACT], PEX_TOKEN_CONTRACT, "bsc"),
    pool2: pool2(PEX_BNB_LP_MASTER_CHEF, PEX_BNB_LP_CONTRACT, 'bsc')
  }
};