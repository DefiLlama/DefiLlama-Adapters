const { function_view, getResource } = require("../helper/chain/aptos");

const vaults = [
  '0x77d56ce63cf4d8c36a60a8a8f29e11ebbf7a1c0e22d6cd069d7f2e950d2fd0bd', // APT-USDC
  '0x7a6ef286a6d3f482dcb56d683678dadc7a18be133bf5f01626d5164a52e68eeb', // APT-USDt
  '0xab8fdae5dd99a4379362c01218cd7aef40758cd8111d11853ce6efd2f82b7cad', // USDt-USDC
  '0x41cfdef11efd671cbcffa66f57716ee5698308b233359481d52d6dac34b42af2', // APT-kAPT
  '0xfee3dc8a7d53e4ababf77033bb429ecbcaf2d58ba6c2809ab0f503bb14098ea7', // USDt-USDC private
  '0xb60a7fb8a217de3d44085cf37c680a99100e393005081545a5e237797e71952f', // APT-USDC private
];
async function getVaultsLiquidity() {
  const vaultResources = await Promise.all(vaults.map(vault => getResource(vault, '0x19bcbcf8e688fd5ddf52725807bc8bf455a76d4b5a6021cfdc4b5b2652e5cd55::vaults::Vault')));
  const vaultsLiquidityList = await Promise.all(vaultResources.map(({position_id}) => function_view({
    functionStr: "0x8b4a2c4bb53857c718a04c020b98f8c2e1f99a68b0f57389a8bf5434cd22e05c::router_v3::get_amount_by_liquidity",
    args: [position_id],
    type_arguments: [],
  })));
  return {vaultResources, vaultsLiquidityList};
}

async function _getCoinInfo(faType) {
  const coinInfo = await function_view({
    functionStr: "0x1::coin::paired_coin",
    args: [faType],
    type_arguments: [],
  });

  if (coinInfo.vec.length > 0) {
    const address = coinInfo.vec[0].account_address;
    const module = Buffer.from(coinInfo.vec[0].module_name.replace('0x', ''), 'hex').toString('utf-8');
    const struct = Buffer.from(coinInfo.vec[0].struct_name.replace('0x', ''), 'hex').toString('utf-8');

    return (address + "::" + module + "::" + struct);
  } else {
    return null;
  }
}

module.exports = {
  timetravel: false,
  methodology: "Counts the total vault position in the corresponding liquidity pool on Hyperion.",
  aptos: {
    tvl: async (api) => {
      const {vaultResources, vaultsLiquidityList} = await getVaultsLiquidity();

      for (const [index, vaultResource] of vaultResources.entries()) {
        const coin1 = await _getCoinInfo(vaultResource.token_a.inner) || vaultResource.token_a.inner;
        const coin2 = await _getCoinInfo(vaultResource.token_b.inner) || vaultResource.token_b.inner;

        api.add(coin1, vaultsLiquidityList[index][0]);
        api.add(coin2, vaultsLiquidityList[index][1]);
      }
    },
  },
};

