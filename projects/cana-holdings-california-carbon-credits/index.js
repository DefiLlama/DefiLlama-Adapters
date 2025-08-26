const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json');

// CANA Holdings California Carbon Credits
// Website: https://maseer.finance/
// Live Token Info: https://cana.maseer.finance/
// Dune Analytics: https://maseer.finance/dune
// CoinGecko ID: cana-holdings-california-carbon-credits
const CANA_CONTRACT_ADDRESS = "0x01995A697752266d8E748738aAa3F06464B8350B";
const AUTHORIZED_ISSUER_ADDRESS = "0xb56F413dbCe352cfd71f221029CFC84580133F66";

async function tvl(api) {
  const balances = {};

  try {
    // Get total supply of CANA tokens
    const totalSupply = await api.call({
      target: CANA_CONTRACT_ADDRESS,
      abi: "uint256:totalSupply"
    });

    // Get authorized issuer balance to subtract from total supply
    const issuerBalance = await api.call({
      target: CANA_CONTRACT_ADDRESS,
      abi: "function balanceOf(address) view returns (uint256)",
      params: [AUTHORIZED_ISSUER_ADDRESS]
    });

    // Get NAV price (in 6 decimal places, USDT denominated)
    const navPrice = await api.call({
      target: CANA_CONTRACT_ADDRESS,
      abi: "uint256:navprice"
    });

    // Validate data - ensure navPrice is reasonable (> 0 and < $1M per token)
    if (navPrice === 0 || navPrice > 1000000 * (10 ** 6)) {
      console.warn(`CANA: Unusual NAV price detected: ${navPrice}`);
      return balances; // Return empty if price seems invalid
    }

    // Calculate circulating supply (total supply minus issuer balance)
    const circulatingSupply = totalSupply - issuerBalance;

    // Ensure circulating supply is positive
    if (circulatingSupply <= 0) {
      console.warn(`CANA: Invalid circulating supply: ${circulatingSupply}`);
      return balances;
    }

    // Calculate TVL: circulatingSupply * navPrice
    // circulatingSupply is in 18 decimals (ERC20 standard)
    // navPrice is in 6 decimals (USDT terms)
    // Result should be in USDT base units (6 decimals)
    const tvlInUSDT = (circulatingSupply * navPrice) / (10 ** 18);

    // Add to balances using USDT address
    sdk.util.sumSingleBalance(
      balances,
      ADDRESSES.ethereum.USDT,
      tvlInUSDT,
      api.chain
    );

  } catch (error) {
    console.error(`CANA TVL calculation failed: ${error.message}`);
    // Return empty balances on error to prevent adapter from breaking
  }

  return balances;
}


module.exports = {
  methodology: "TVL is calculated by multiplying the circulating supply of CANA tokens (total supply minus authorized issuer balance) by their NAV price (in USDT terms). CANA represents tokenized California compliance carbon credits.",
  doublecounted: false, // Ensures accurate TVL accounting across DeFi
  start: '2025-06-20', // Jun-20-2025 07:48:47 PM +UTC
  ethereum: {
    tvl: tvl
  },
  hallmarks: [
    [1750651727, "CANA Protocol Launch"], // Jun-20-2025 07:48:47 PM +UTC
    [1752217391, "First Token Issuance"], // Jul-10-2025 04:03:11 PM UTC
    // Add other important events in your protocol's history
    // Format: [timestamp, "Description"]
  ]
};
