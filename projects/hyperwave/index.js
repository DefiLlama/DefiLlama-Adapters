const sdk = require('@defillama/sdk')
const { post } = require('../helper/http');
const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { hyperliquid } = require('../hypurrfi');
const { sumUnknownTokens } = require('../helper/unknownTokens');

// const HLP0_VAULT = "0x3D75F2BB8aBcDBd1e27443cB5CBCE8A668046C81";
const HWLP_VAULT = "0x9FD7466f987Fd4C45a5BBDe22ED8aba5BC8D72d1";
const BACKING_EOA_1 = "0x97885bC45B300D405E61B397B8f37379B597D809";
const BACKING_EOA_2 = "0xD73E844755b3d09DB80a277adCa00F9B4B2833e5";
const VAULT_TOKENS = [
    ADDRESSES.hyperliquid.USDT0,
    ADDRESSES.hyperliquid.USDe,
    '0xb50A96253aBDF803D85efcDce07Ad8becBc52BD5'
];

const vaultTvl = async (api) => {
  return sumTokens2({
    api,
    owner: HWLP_VAULT,
    chain: 'hyperliquid',
    tokens: VAULT_TOKENS,
  })
}

async function hlpTvl(api) {
    let data = await post('https://api.hyperliquid.xyz/info', { type: "userVaultEquities", user: BACKING_EOA_1 })
    const hlpVault = data.find(v => v.vaultAddress.toLowerCase() === '0xdfc24b077bc1425ad1dea75bcb6f8158e10df303');
    const hlpEquity = hlpVault ? parseFloat(hlpVault.equity) : 0;
    const hlpEquityUpscaled = hlpEquity * 1e6; // Convert to wei
    api.addTokens([ADDRESSES.arbitrum.USDC_CIRCLE], [hlpEquityUpscaled]) 

    return sumUnknownTokens({ api, useDefaultCoreAssets: true})
}

module.exports = {
  timetravel: false,
  methodology: 'TVL represents the sum of tokens deposited in the vault + HLP positions',
  doublecounted: false,
  arbitrum: {tvl: hlpTvl},
  hyperliquid: { tvl: sdk.util.sumChainTvls([
    vaultTvl, 
    hlpTvl, 
  ])},
}