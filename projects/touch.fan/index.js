const { nullAddress } = require('../helper/unwrapLPs')

const fan_contract = "0x9842114F1d9c5286A6b8e23cF0D8142DAb2B3E9b"
const touch_contract = "0xC612eD7a1FC5ED084C967bD71F1e0F0a338Cf816"
const tft_address = "0x14acccd04393f26ba155e5402aa6fddbb8e2254a"
const zk_sync_swap_pool = "0xB075F49F4Bea5204d22B42E8d442e8E9e3400AF8"
const stake_tft_contract_address = "0x38a22eFB9eE73EdABdc4A15B17D28b70bA56BDA3"
const getReserves_abi = "function getReserves() external view  returns (uint,uint)"
const vester_address = "0x13B8C03990b7d782cB9c3ebF7E2aA5Dc28f6133B"

const { sumTokensExport } = require('../helper/unknownTokens')

module.exports = {
  methodology: `We count the ETH on ${fan_contract} and ${touch_contract}`,
  era: {
    tvl: sumTokensExport({ owners: [fan_contract, touch_contract], tokens: [nullAddress], }),
    staking: sumTokensExport({ owners: [vester_address, stake_tft_contract_address], tokens: [tft_address,], lps: [zk_sync_swap_pool], abis: {
      getReservesABI: getReserves_abi
    }, })
  }
}