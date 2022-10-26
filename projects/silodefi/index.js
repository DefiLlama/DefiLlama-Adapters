async function tvl() {
  const call = 913906096;
 
  const put = 913951447;

  const apps = [call,put]

  const usdc = 31566704;

  const path = `https://algoindexer.algoexplorerapi.io/v2/accounts?application-id=`;
  let tvlAlgo = 0;
  let tvlUSDC = 0;

  for (let i = 0; i < apps.length; i++) {
    let data = await fetch(path + apps[i]);
    let dataJSON = await data.json();
    //console.log(dataJSON.accounts)
    dataJSON.accounts.forEach((account) => {
      if (account["created-assets"]) {
        account["created-assets"].forEach((asset) => {
          let name = asset.params["unit-name"];
          if (name === "SILO") {
            tvlAlgo += account.amount;
            account.assets.forEach((asset) => {
              if (asset["asset-id"] === usdc) {
                tvlUSDC += asset.amount;
              }
            });
          }
        });
      }
    });
  }

  let data2 = await fetch("https://price.algoexplorerapi.io/price/algo-usd");
  let data2JSON = await data2.json();
  let price = data2JSON.price;
  let total = tvlAlgo * price + tvlUSDC;
  console.log(total);
  return total;
}
//example usage:
tvl();