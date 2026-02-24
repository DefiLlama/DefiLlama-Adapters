const SHARED_OWNER = "0x25e5e82f5702A27C3466fE68f14abDbbAdFca826";

const ownerByChain = {
  ethereum: SHARED_OWNER,
  arbitrum: SHARED_OWNER,
  optimism: SHARED_OWNER,
  polygon: SHARED_OWNER,
  base: SHARED_OWNER,
};

module.exports = ownerByChain;
