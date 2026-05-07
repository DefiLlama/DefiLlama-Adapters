const ADDRESSES = require('../helper/coreAssets.json')

const LENDING_POOL_ADDRESS = "0x9BE2e5739B1a6A175d36Ce043f44E66965a433EB";
const GMI_TOKEN_ADDRESS = "0xAad4187a81689AF72d91966c8119756E425cD7CF";

const supportedTokens = [
  "0x47c031236e19d024b42f8AE6780E44A573170703", // GM_BTC_ADDRESS
  "0x70d95587d40A2caf56bd97485aB3Eec10Bee6336", // GM_ETH_ADDRESS
  "0x09400D9DB990D5ed3f35D7be61DfAEB900Af03C9", // GM_SOL_ADDRESS
  ADDRESSES.arbitrum.USDC_CIRCLE, // USDC_ADDRESS
];

const abi = {
  "treasuryVaults": "function treasuryVaults(uint256) view returns (bytes32)",
  "vaults": "function vaults(bytes32) view returns (address bank, address token, uint256 weight, address oracle, bool active)",
}

async function tvl(api) {
  // GMI Index TVL
  const treasuryVaults = await api.fetchList({ lengthAbi: 'x', itemCount: 4, itemAbi: abi.treasuryVaults, target: GMI_TOKEN_ADDRESS })
  const vaults = await api.multiCall({ abi: abi.vaults, calls: treasuryVaults, target: GMI_TOKEN_ADDRESS })
  const tokensAndOwners = vaults.map(vault => [vault.token, vault.bank])

  // Get GM Lending TVL by calling totalUnderlying for each supported token
  tokensAndOwners.push([ADDRESSES.arbitrum.USDC_CIRCLE, '0xfe81b0866a8fbbd7c00f5aab84e4e531ea7591c2']) // USDC Lending Pool
  supportedTokens.forEach(t => tokensAndOwners.push([t, LENDING_POOL_ADDRESS]))
  return api.sumTokens({ tokensAndOwners})
}

async function borrowed(api) {
  // Get total borrowed by calling totalBorrows with USDC address
  const totalBorrowed = await api.call({
    abi: "function totalBorrows(address) view returns (uint256)",
    target: LENDING_POOL_ADDRESS,
    params: [ADDRESSES.arbitrum.USDC_CIRCLE],
  });

  api.add(ADDRESSES.arbitrum.USDC_CIRCLE, totalBorrowed);
}

module.exports = {
  methodology:
    "Gloop TVL consists of two parts: (1) GMI Index TVL from totalControlledValue(true) which tracks the total USD value of GM tokens in the index, and (2) GM Lending TVL from totalUnderlying() for each supported token (GM BTC, GM ETH, GM SOL, USDC) in the lending pools.",
  // A little after Lending Pool contract was deployed
  start: 1744340400,
  arbitrum: {
    tvl,
    borrowed,
  },
};

