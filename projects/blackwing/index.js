const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const BLACKWING_VAULT_ARBITRUM = '0xc6aDE8A68026d582AB37B879D188caF7e405dD09'
const BLACKWING_VAULT_ETH = '0xc6aDE8A68026d582AB37B879D188caF7e405dD09'
const BLACKWING_VAULT_BSC = '0xD00789260984160a64DcF19A03896DfF73BF4514'

const ARBITRUM_WEETH = "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe";
const ARBITRUM_EZETH = "0x2416092f143378750bb29b79eD961ab195CcEea5";

const ETHEREUM_MAINNET_RSWETH = '0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0';
const ETHEREUM_MAINNET_RSETH = "0xa1290d69c65a6fe4df752f95823fae25cb99e5a7";
const ETHEREUM_MAINNET_WEETH = "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee";
const ETHEREUM_MAINNET_EZETH = "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110";

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({ tokens: [ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.USDC, ADDRESSES.arbitrum.WETH, ARBITRUM_EZETH, ARBITRUM_WEETH,], owner: BLACKWING_VAULT_ARBITRUM, fetchCoValentTokens: true, }),
  },
  ethereum: {
    tvl: sumTokensExport({
      tokens: [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.WETH, ETHEREUM_MAINNET_RSWETH, ETHEREUM_MAINNET_RSETH, ETHEREUM_MAINNET_EZETH, ADDRESSES.ethereum.EETH, ETHEREUM_MAINNET_WEETH, ADDRESSES.ethereum.sUSDe,
      ], owner: BLACKWING_VAULT_ETH, fetchCoValentTokens: true,
    })
  },
  bsc: {
    tvl: sumTokensExport({
      tokens: [ADDRESSES.bsc.USDT, ADDRESSES.bsc.WBNB,], owner: BLACKWING_VAULT_BSC, fetchCoValentTokens: true,
    })
  }
}
