async function tvl() {
  return {}
}

module.exports = {
  timetravel: false,
  hallmarks: [
    [1670025600, "Private key compromised"],
    [1675728000, "Announcement to move from Ratio to PHNX"]
  ],
  solana: {
    tvl,
  },
  methodology:
    "To obtain the Ratio Finance TVL we make on-chain calls",
};
