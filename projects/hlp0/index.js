const { sumERC4626VaultsExport } = require('../helper/erc4626');

const HLP0_VAULT = "0x3D75F2BB8aBcDBd1e27443cB5CBCE8A668046C81";

// As the vault is an ERC4626, we can use the helper to get the TVL
const tvl = sumERC4626VaultsExport({
  vaults: [HLP0_VAULT],
  balanceAbi: 'totalAssets',
  tokenAbi: 'asset',
});

module.exports = {
  arbitrum: {
    tvl,
  },
  methodology: "TVL is calculated by summing the total assets of the HLP0 vault on Arbitrum. The HLP0 token is a LayerZero OFT, but the underlying assets are held in the Arbitrum vault.",
};
