const ADDRESSES = require('../helper/coreAssets.json')
const { function_view, getResources } = require("../helper/chain/aptos");

const primary_fungible_asset_balance = "0x1::primary_fungible_store::balance"
const AGDEX = "0xfa69897532f069bc0806868eaeec3328727d90c0cec710a17dde327e0bfab44f";
const LZ_ASSETS = "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset";

// each market: the resource account holding the fungible asset, its metadata object, the
// AGDEX vault type carrying the reserved amount, and the token the total is reported as
const markets = [
  { resourceAccount: "0x19fb80bd79fa8f7538404af85196396973e3fbbda1503495598172c8813f7ca5", metadata: "0x2b3be0a97a73c87ff62cbdd36837a9fb5bbd1d7f06a73b7ed62ec15c5326c1b8", vault: `${LZ_ASSETS}::USDC`, token: ADDRESSES.aptos.USDC_2 }, // layerzero USDC
  { resourceAccount: "0xb27c95e40594d6f5765e0183ccca5ebcd0942f9c9a66578af1c743f5bd0d90e5", metadata: ADDRESSES.aptos.USDC_3, vault: `${AGDEX}::token_map::USDC`, token: ADDRESSES.aptos.USDC_2 }, // native USDC
  { resourceAccount: "0xbb3c1b88599c563062e2b08fe3a92ab048d700f9aa44617c680d59a4aa69b23f", metadata: ADDRESSES.aptos.USDt, vault: `${AGDEX}::token_map::USDT`, token: ADDRESSES.aptos.USDT_2 },
  { resourceAccount: "0x38bca0c288df1e13d9a30d33c4ce8ee778333c52bd4e730b49c6c9379be39b10", metadata: "0xae02f68520afd221a5cd6fda6f5500afedab8d0a2e19a916d6d8bc2b36e758db", vault: `${LZ_ASSETS}::WETH`, token: ADDRESSES.aptos.zWETH },
  { resourceAccount: "0x70d303ed5dbfbae1f5ac76d50d5073f69a7115dfdfa737e82bb7c3c9364b3d17", metadata: "0xa64d2d6f5e26daf6a3552f51d4110343b1a8c8046d0a9e72fa4086a337f3236c", vault: `${LZ_ASSETS}::WBTC`, token: ADDRESSES.aptos.zWBTC },
  { resourceAccount: "0x8afc7aaa4616c0defbe655f3928a72ff849ef9a6889178f1c18c7c3ad006ebf7", metadata: "0xa", vault: ADDRESSES.aptos.APT, token: ADDRESSES.aptos.APT },
]

async function tvl(api) {
  // all vaults live on the AGDEX account, so one resources call covers every reserved amount
  const resources = await getResources(AGDEX)
  const reservedByVault = {}
  resources.forEach(({ type, data }) => {
    if (type.startsWith(`${AGDEX}::pool::Vault<`)) reservedByVault[type.slice(type.indexOf('<') + 1, -1)] = data.reserved_amount
  })

  for (const { resourceAccount, metadata, vault, token } of markets) {
    const balance = await function_view({
      functionStr: primary_fungible_asset_balance,
      type_arguments: ["0x1::fungible_asset::Metadata"],
      args: [resourceAccount, metadata],
    })
    if (reservedByVault[vault] === undefined) throw new Error(`agdex: vault resource missing for ${vault}`)
    api.add(token, +balance + +reservedByVault[vault])
  }
}

module.exports = {
  timetravel: false,
  aptos: { tvl },
};
