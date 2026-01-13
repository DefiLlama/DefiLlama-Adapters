// Vault addresses by chain
const config = {
  arbitrum: [
    '0x57C10bd3fdB2849384dDe954f63d37DfAD9d7d70', // tUSDC Vault
    '0xcd72118C0707D315fa13350a63596dCd9B294A30', // tUSDT Vault
  ],
  base: [
    '0x6C7013b3596623d146781c90b4Ee182331Af6148', // tUSDC Vault
  ]
};

// Provider addresses by chain (for reference)
// Note: Active provider is determined dynamically from each vault contract
const providers = {
  arbitrum: {
    aaveV3: '0xbeEdb89DC47cab2678eBB796cfc8131062F16E39',
    compoundV3: '0xaBD932E0Fff6417a4Af16431d8D86a4e62d62fA3',
    dolomite: '0x3D036B97482CC6c42753dA51917B3302D5d0E9AE',
    steakhouseHighYieldMorpho: '0x00651b3E70873AfC852d9068Da4d359C473aA6c3',
    yearnDegenMorpho: '0x7b77caFe29d62c984e569793AD1C1DC9eD542413',
    gauntletCoreMorpho: '0xfFD8B1A9B97787c169154a485925512C79CA53E7',
    hyperithmMorpho: '0x54E5FF7FF115E2B01332D81f7efFB02adEF3c23D',
  },
  base: {
    aaveV3: '0x034a62f9617E8A1770f7c7EbA04e2DAb2Fda7f12',
    compoundV3: '0xFFAc48125fa4Bd8BC03CDCA725459563aAe77406',
    re7Morpho: '0x642E31bE2fF6d3Eba38dC16760f3a146092d89e3',
    steakhouseHighYieldMorpho: '0x0EF8ceD75e5877c69ac8619145219b67D76193a1',
    steakhousePrimeMorpho: '0x4516F8324bfAcC71e5099FabFC51E97e4905c062',
    gauntletCoreMorpho: '0x34c164e7021e38921aE20a723234d2b1B52289E9',
  },
};

const abi = "function getDepositBalance(address user, address vault) view returns (uint256 balance)";

module.exports = {
  methodology: "TVL displays the total amount of assets stored in the Thesauros vaults. The balance is calculated by querying the active provider for each vault's deposit balance.",
  start: '2025-09-19',
  hallmarks: [[1758283200, "Protocol launch"]],
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl: (api) => tvl(api, config[chain]) };
});

const tvl = async (api, vaults) => {
  const [providers, assets] = await Promise.all([
    api.multiCall({ calls: vaults, abi: "address:activeProvider" }),
    api.multiCall({ calls: vaults, abi: "address:asset" }),
  ]);

  const balances = await api.multiCall({ 
    calls: vaults.map((vault, i) => ({ 
      target: providers[i], 
      params: [vault, vault] 
    })), 
    abi 
  });

  api.add(assets, balances);
};
