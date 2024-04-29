const Lendings = [
  "0x561920028545985c60fb93d48717ff0070cb4e74",
  "0xBAE99752dA245089698Bc1b5F0a14eAE91694FBc",
  "0xc1b677039892C048f2eFb7E9C5da1B51fDE92504"
];

async function tvl(api) {
  const balances = {};

  const collateralBalance = await api.multiCall({
    abi: "uint256:totalSupplied",
    calls: Lendings.map(i => ({ target: i }))
  });

  const lendingTokens = await api.multiCall({
    abi: "address:token",
    calls: Lendings.map(i => ({ target: i }))
  });


  for (let i = 0; i < collateralBalance.length; i++) {
    balances[`arbitrum:${lendingTokens[i]}`] = collateralBalance[i];
  }

  return balances;
}

module.exports = {
    arbitrum: {
    tvl
  }
};


