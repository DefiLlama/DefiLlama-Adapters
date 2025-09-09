async function tvl(api) {
    const abis = {
      asset: "function asset() view returns (address)",
      balance: "function totalAssets() external view returns (uint256)",
    };
  
    const vaults = [
      "0xE12EED61E7cC36E4CF3304B8220b433f1fD6e254",
      "0x5A285484126D4e1985AC2cE0E1869D6384027727",
      "0xf36a57369362eB1553f24C8ad50873723E6e1173"
    ];
  
    const assets = await api.multiCall({ abi: abis.asset, calls: vaults });
    const balances = await api.multiCall({ abi: abis.balance, calls: vaults });
    console.log(assets, balances);
    vaults.forEach((v, i) => {
      api.add(assets[i], balances[i]);
    });
  }
  
  module.exports = {
    doublecounted: true,
    methodology: 'TVL accounts for all assets deposited into the Vaults.',
    mantle: { tvl },
  };