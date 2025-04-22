
module.exports = {
  hallmarks: [
    [1674838800, "Sunset Protocol"]
  ],
  timetravel: false,
  deadFrom: 1674838800,
  methodology:
    "TVL is scraped from the window.friktionSnapshot variable in app.friktion.fi and saved to the GitHub repo at Friktion-Labs/mainnet-tvl-snapshots. The data is the same as what is displayed on the app",
  solana: { tvl: () => ({}) },
};
