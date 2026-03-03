// CANA Holdings California Carbon Credits
// Website: https://maseer.finance/
// Live Token Info: https://cana.maseer.finance/
// Dune Analytics: https://maseer.finance/dune
// CoinGecko ID: cana-holdings-california-carbon-credits
const CANA_CONTRACT_ADDRESS = "0x01995A697752266d8E748738aAa3F06464B8350B";
const AUTHORIZED_ISSUER_ADDRESS = "0xb56F413dbCe352cfd71f221029CFC84580133F66";

async function tvl(api) {
  // Get total supply of CANA tokens
  const totalSupply = await api.call({ target: CANA_CONTRACT_ADDRESS, abi: "uint256:totalSupply" });

  // Get authorized issuer balance to subtract from total supply
  const issuerBalance = await api.call({
    target: CANA_CONTRACT_ADDRESS,
    abi: "function balanceOf(address) view returns (uint256)",
    params: [AUTHORIZED_ISSUER_ADDRESS]
  });

  // Calculate circulating supply (total supply minus issuer balance)
  const circulatingSupply = totalSupply - issuerBalance;
  api.add(CANA_CONTRACT_ADDRESS, circulatingSupply);
}


module.exports = {
  methodology: "TVL is calculated by multiplying the circulating supply of CANA tokens (total supply minus authorized issuer balance) by their NAV price (in USDT terms). CANA represents tokenized California compliance carbon credits.",
  start: '2025-06-20', // Jun-20-2025 07:48:47 PM +UTC
  ethereum: {
    tvl
  },
  hallmarks: [
    ['2025-07-10', "First Token Issuance"], // Jul-10-2025 04:03:11 PM UTC
  ]
};
