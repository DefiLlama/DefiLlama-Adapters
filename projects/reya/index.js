const totalSupplyBalanceFetcher = async ({
  address,
  network,
}) => {
  const response = await fetch(
    `https://explorer.${network}.network/api/v2/tokens/${address}`,
  );
  if (response.status === 200) {
    const data = await response.json();

    const supplyString = data.total_supply;
    const decimalsString = data.decimals;

    if (!supplyString || !decimalsString) {
      return null;
    }
    const decimalsInt = parseInt(decimalsString, 10);
    const value = parseInt(supplyString, 10);
    const divider = 10 ** decimalsInt;
    const balance = value / divider;

    return balance;
  }
  return null;
};

const coins = {
  "usd-coin": "0x3B860c0b53f2e8bd5264AA7c3451d41263C933F2",
  "WETH": "0x6B48C2e6A32077ec17e8Ba0d98fFc676dfab1A30",
}

async function tvl(api){
  const fetchCoinBalance = async (coin) => {
    const balance = await totalSupplyBalanceFetcher({ network: api.chain, address: coins[coin] });
    return ({ coin, balance });
  }

  const fetchResults = await Promise.all(Object.keys(coins).map(fetchCoinBalance));
  return fetchResults.reduce((acc, item) => {
    if (!item) {
      return acc;
    }
    return ({ ...acc, [item.coin]: item.balance })
  }, {});
}

module.exports={
  reya:{
      tvl
  }
}