const { staking } = require('../helper/staking');

const nestVault = '0x65e7506244CDdeFc56cD43dC711470F8B0C43beE';
const NEST_token = '0x98f8669F6481EbB341B522fCD3663f79A3d1A6A7'
const eth_nestVault = '0x12858F7f24AA830EeAdab2437480277E92B0723a';
const ETH_NEST_token = '0x04abEdA201850aC0124161F037Efd70c74ddC74C'

module.exports = {
  methodology: 'TVL counts NEST tokens used as collateral by the protocol.',
  bsc: {
    tvl: staking(nestVault, NEST_token),
  },
  ethereum: {
    tvl: staking(eth_nestVault, ETH_NEST_token),
  }
}