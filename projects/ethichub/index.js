const ADDRESSES = require('../helper/coreAssets.json')
const { pool2 } = require("../helper/pool2");
const { stakings } = require('../helper/staking');

// Mainnet
const ETHIX_TOKEN = '0xFd09911130e6930Bf87F2B0554c44F400bD80D3e';
const STAKED_ETHIX_MAINNET = '0x5b2bbbe7DFD83aA1f1CD0c498690E6EcC939CC2D';
const ETHIX_WETH_UNIV2 = '0xb14b9464b52F502b0edF51bA3A529bC63706B458';
const STAKED_UETHIX_MAINNET = '0x89cea15F68950DF830dFE3630d635a9eD79478F5';
const ORIGINATOR_BRAZIL = '0x3B61CD481Be3BA62a9a544c49d6C09FCb804d0e3';
const ORIGINATOR_HONDURAS = '0x7435C0232A69270D19F8E4010571175c3f1dd955';
// Celo
const ETHIX_TOKEN_CELO = ADDRESSES.celo.ETHIX;
const STAKED_ETHIX_CELO = '0xCb16E29d0B667BaD7266E5d0Cd59b711b6273C6B';

module.exports = {
      methodology: 'Count of the tokens in pools, reserves...',
  start: '2020-12-22',
  ethereum: {
    tvl: () => ({}),
    pool2: pool2(STAKED_UETHIX_MAINNET, ETHIX_WETH_UNIV2),
    staking: stakings([STAKED_ETHIX_MAINNET, ORIGINATOR_BRAZIL, ORIGINATOR_HONDURAS], ETHIX_TOKEN)
  },
  celo: {
    tvl: () => ({}),
    staking: stakings([STAKED_ETHIX_CELO], ETHIX_TOKEN_CELO)
  },
  hallmarks:[
    [1608640694, "Ethix launch"],
    [1655719625, "Ethix on Celo network"],
    [1626704101, "Originator Brazil"],
    [1634714203, "Originator Honduras"],
    [1610472600, "Grand Opening Cryptocafé in Madrid"],
  ]
}; 
