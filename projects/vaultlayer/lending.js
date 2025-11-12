// projects/vaultlayer/lending.js
const ADDRESSES = require("../helper/coreAssets.json");

// VaultLayer's P2P Lending Markets
const abi = {
  getActiveLoans:    "function getActiveLoans() view returns (uint256[])",
  loans:             "function loans(uint256) view returns (address borrower, address lender, address nftAddress, uint256 tokenId, uint256 loanAmount, uint256 maxInterestRate, uint256 currentInterestRate, uint256 duration, uint256 startTime, uint8 loanType, uint8 status, address principalToken, uint256 listingTime)",
};

// Markets deployed per chain
const MARKETS = [
  { chain: "core",  address: "0x485BDcF3134D56a5743Bbfe8614D6e8453a87B99" },
  { chain: "arbitrum", address: "0x12500049BDC5CD660B806697D7e82eea41c433eC" },
  { chain: "bsc",      address: "0xea252DA102748C84152260615D7E76958FE09597" },
  { chain: "avax",     address: "0xBb7A6Ddb6ED2089Cc2AB9A67F31c08E702F444b0" },
  { chain: "base",     address: "0xBb7A6Ddb6ED2089Cc2AB9A67F31c08E702F444b0" },
  { chain: "optimism", address: "0xBb7A6Ddb6ED2089Cc2AB9A67F31c08E702F444b0" },
  { chain: "ethereum", address: "0x0Cf14D297D2c17B66c7158A1A17C82a3e8Ad259F" },
  { chain: "polygon",  address: "0xA5E2Bc2BbB8F72de7a899730EAE35dC710AEee35" },
];

// Principal token per chain
const PRINCIPAL_TOKENS = {
  core:  "0x3093304eCE0F35969B580CbD155a1357829870f2", // vltCORE
  ethereum: ADDRESSES.ethereum.USDC, // USDC
  arbitrum: ADDRESSES.arbitrum.USDC_CIRCLE, // USDC
  avax:     ADDRESSES.avax.USDC, // USDC on Avalanche
  base:     ADDRESSES.base.USDC, // USDC on Base
  bsc:      ADDRESSES.bsc.USDC, // USDC on BSC
  optimism: ADDRESSES.optimism.USDC_CIRCLE, // USDC on Optimism
  polygon: ADDRESSES.polygon.USDC_CIRCLE, // USDC on Polygon
};

// vltCore contract address for convertToAssets
const VAULTER_CORE = PRINCIPAL_TOKENS.core;
const vltCoreAbi = {
  convertToAssets:   "function convertToAssets(uint256) view returns (uint256)",
};

async function borrowed(api) {
  // 1) Figure out which market _this_ chain uses
  const market = MARKETS.find((m) => m.chain === api.chain);
  if (!market) {
    // nothing to do on unsupported chains
    return api.getBalances();
  }
  
  const contract = market.address;
  const token    = PRINCIPAL_TOKENS[api.chain];

  // 2) Sum all active loans
  const loanIdsRaw = await api.call({
    abi: abi.getActiveLoans,
    target: contract,
  });
  const loanIds = Array.isArray(loanIdsRaw) ? loanIdsRaw : [];

  let sumLoans = BigInt(0);
  for (const id of loanIds) {
    const { loanAmount, status } = await api.call({
      abi:    abi.loans,
      target: contract,
      params: [id],
    });
    // 3) Only sum loans that are active (status 1)
    if (status == 1) {
      // Add to the total sum of loans
      sumLoans += BigInt(loanAmount);
    }
  }

  // 4) Convert vltCORE shares to actual CORE assets on CoreDAO
  if (api.chain === 'core') {
    const coreWei = await api.call({ abi: vltCoreAbi.convertToAssets, target: VAULTER_CORE, params: [sumLoans.toString()] });
    // Add as CORE
    api.addGasToken(coreWei);
  } else {
    // Add other ERC-20 principal tokens directly
    api.add(token, sumLoans.toString())
  }
  
  return api.getBalances();
}

module.exports = { borrowed };