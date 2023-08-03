const axios = require("axios");
async function tvl() {
  const friktionSnapshotResponse = await axios.get(
    "https://raw.githubusercontent.com/Friktion-Labs/mainnet-tvl-snapshots/main/friktionSnapshot.json"
  );

  const friktionSnapshot = friktionSnapshotResponse.data;

  if (
    !(
      friktionSnapshot &&
      typeof friktionSnapshot === "object" &&
      typeof friktionSnapshot.totalTvlUSD === "number" &&
      friktionSnapshot.coinsByCoingeckoId !== null &&
      typeof friktionSnapshot.coinsByCoingeckoId === "object" &&
      Object.keys(friktionSnapshot.coinsByCoingeckoId).length > 5
    )
  ) {
    console.log(friktionSnapshot);
    throw new Error("Unexpected shape of friktionShapshot");
  }

  if (!friktionSnapshot.totalTvlUSD || friktionSnapshot.totalTvlUSD < 1000) {
    console.log(friktionSnapshot);
    throw new Error("Unexpected totalTvlUSD");
  }

  return friktionSnapshot.coinsByCoingeckoId;
}

module.exports = {
  hallmarks:[
    [1674838800, "Sunset Protocol"]
  ],
  timetravel: false,
  methodology:
    "TVL is scraped from the window.friktionSnapshot variable in app.friktion.fi and saved to the GitHub repo at Friktion-Labs/mainnet-tvl-snapshots. The data is the same as what is displayed on the app",
  solana: {tvl},
};
