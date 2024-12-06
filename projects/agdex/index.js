const ADDRESSES = require('../helper/coreAssets.json')
const { function_view } = require("../helper/chain/aptos");

const primary_fungible_asset_balance = "0x1::primary_fungible_store::balance"
const AGDEX =
  "0xfa69897532f069bc0806868eaeec3328727d90c0cec710a17dde327e0bfab44f";
const lzUSDC =
  ADDRESSES.aptos.USDC_2;
const USDT =
  ADDRESSES.aptos.USDT_2;
const APT =
  ADDRESSES.aptos.APT;
const BTC =
  ADDRESSES.aptos.CELER_WBTC;
const ETH =
  ADDRESSES.aptos.CELER_ETH;

const usdc_resource_account = "0x19fb80bd79fa8f7538404af85196396973e3fbbda1503495598172c8813f7ca5";
const usdc_metadata = "0x2b3be0a97a73c87ff62cbdd36837a9fb5bbd1d7f06a73b7ed62ec15c5326c1b8";

const usdt_resource_account = "0xbb3c1b88599c563062e2b08fe3a92ab048d700f9aa44617c680d59a4aa69b23f";
const usdt_metadata = "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b";

const eth_resource_account = "0x38bca0c288df1e13d9a30d33c4ce8ee778333c52bd4e730b49c6c9379be39b10";
const eth_metadata = "0xae02f68520afd221a5cd6fda6f5500afedab8d0a2e19a916d6d8bc2b36e758db";

const btc_resource_account = "0x70d303ed5dbfbae1f5ac76d50d5073f69a7115dfdfa737e82bb7c3c9364b3d17";
const btc_metadata = "0xa64d2d6f5e26daf6a3552f51d4110343b1a8c8046d0a9e72fa4086a337f3236c";

const apt_resource_account = "0x8afc7aaa4616c0defbe655f3928a72ff849ef9a6889178f1c18c7c3ad006ebf7";
const apt_metadata = "0xa";

async function tvl(api) {
  const usdc_value  = 
    await function_view({
        "functionStr": primary_fungible_asset_balance,
        "type_arguments": ["0x1::fungible_asset::Metadata"],
        "args": [usdc_resource_account, usdc_metadata]
    });
    api.add(lzUSDC, usdc_value);

  const usdt_value  = 
    await function_view({
        "functionStr": primary_fungible_asset_balance,
        "type_arguments": ["0x1::fungible_asset::Metadata"],
        "args": [usdt_resource_account, usdt_metadata]
    });
  api.add(lzUSDC, usdc_value);

  const eth_value  = 
    await function_view({
       "functionStr": primary_fungible_asset_balance,
        "type_arguments": ["0x1::fungible_asset::Metadata"],
        "args": [eth_resource_account, eth_metadata]
      });
  api.add(lzUSDC, eth_value);

  const btc_value  = 
    await function_view({
        "functionStr": primary_fungible_asset_balance,
        "type_arguments": ["0x1::fungible_asset::Metadata"],
        "args": [btc_resource_account, btc_metadata]
      });
  api.add(lzUSDC, btc_value);

  const apt_value  = 
    await function_view({
        "functionStr": primary_fungible_asset_balance,
        "type_arguments": ["0x1::fungible_asset::Metadata"],
        "args": [apt_resource_account, apt_metadata]
    });
  api.add(lzUSDC, usdc_value);
  api.add(BTC, btc_value);
  api.add(ETH, eth_value);
  api.add(USDT, usdt_value);
  api.add(APT, apt_value);
}

module.exports = {
  timetravel: false,
  aptos: { tvl },
};
