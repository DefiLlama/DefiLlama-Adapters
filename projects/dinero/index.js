const { nullAddress } = require("../helper/unwrapLPs");
const { sumERC4626VaultsExport } = require("../helper/erc4626");
const sdk = require("@defillama/sdk");

const PXETH = '0x04C154b66CB340F3Ae24111CC767e0184Ed00Cc6';
const APXETH = '0x9Ba021B0a9b958B5E75cE9f6dff97C7eE52cb3E6';
const LOCKBOXES = [
  '0x96B6AAE5Cdc5B6d2e1aC2EFc46162402F5a868B1', // ERA
  '0xf2B2BBdC9975cF680324De62A30a31BC3AB8A4d5', // INK
  '0xaAA55490721b72A3112323FC274e9798796CcE85', // FLR
  '0xA8A3A5013104e093245164eA56588DBE10a3Eb48', // SEI
  '0x043eF1DC118b5039203AECfAc680CEA4E58b0eBb'  // PLUME
];

const convertToAssetsAbi = 'function convertToAssets(uint256) view returns (uint256)';

async function getBalances(api, token, convertToAssets = false) {
  const balances = await Promise.all(
    LOCKBOXES.map((lockbox) =>
      api.call({ abi: 'erc20:balanceOf', target: token, params: lockbox })
    )
  );

  const total = balances.reduce((sum, balance) => sum + sdk.util.convertToBigInt(balance), BigInt(0));

  if (convertToAssets) {
    return sdk.util.convertToBigInt(await api.call({ target: token, abi: convertToAssetsAbi, params: [total] }));
  }

  return total;
}

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const totalSupply = sdk.util.convertToBigInt(await api.call({ target: PXETH, abi: 'uint256:totalSupply' }));

      const pxEthBalances = await getBalances(api, PXETH);
      const apxEthBalances = await getBalances(api, APXETH, true);
      const adjustedSupply = totalSupply - pxEthBalances - apxEthBalances;

      return {[nullAddress]: adjustedSupply.toString(),};
    },
    staking: sumERC4626VaultsExport({vaults: ['0x55769490c825CCb09b2A6Ae955203FaBF04857fd'], isOG4626: true,}),
  },
};
