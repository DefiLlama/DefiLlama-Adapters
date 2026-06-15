const SHARED_OWNER = "0x25e5e82f5702A27C3466fE68f14abDbbAdFca826";

const ownerByChain = {
  ethereum: SHARED_OWNER,
  arbitrum: SHARED_OWNER,
  optimism: SHARED_OWNER,
  polygon: SHARED_OWNER,
  base: SHARED_OWNER,
  tron: "TKFUxULu53pSfDkSZwF85PFuKBw1K9axaw",
  solana: "HrcpUS1oFVqeNVZxwHZP2fHSiXJWpv4DTN6qyQX4tAJa",
};

module.exports = ownerByChain;
