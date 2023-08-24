const { sumTokens } = require("../helper/chain/cosmos");
const { getFactoryTvl } = require("../terraswap/factoryTvl");

// Helper func to get the tvl on luna-classic/the old terra
async function tvl() {
  return sumTokens({
    chain: "terra",
    owner: "terra1ec3r2esp9cqekqqvn0wd6nwrjslnwxm7fh8egy",
  });
}

// Module exports for WW includes
// Past info about Terra (tvl) including the Depeg as a hallmark
// and the current info about the DEXs on all supported chains
// TODO: This wont be done in initial PR but here more as a note, would be cool to include more hallmarks such as
// relaunch of dex on first market or launch of dex on 5th/nth chain, release of bonding or incentives on dex, etc
module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Liquidity on the DEX",
  terra: {
    tvl,
  },
  hallmarks: [[1651881600, "UST depeg"]],
  migaloo: {
    tvl: getFactoryTvl(
      "migaloo1z89funaazn4ka8vrmmw4q27csdykz63hep4ay8q2dmlspc6wtdgq92u369"
    ),
  },
  injective: {
    tvl: getFactoryTvl("inj1x22q8lfhz7qcvtzs0dakhgx2th64l79kfye5lk"),
  },
  terra2: {
    tvl: getFactoryTvl(
      "terra1f4cr4sr5eulp3f2us8unu6qv8a5rhjltqsg7ujjx6f2mrlqh923sljwhn3"
    ),
  },
  chihuahua: {
    tvl: getFactoryTvl(
      "chihuahua1s8ehad3r9wxyk08ls2nmz8mqh4vlfmaxd2nw0crxwh04t4l5je4s8ljv0j"
    ),
  },
  juno: {
    tvl: getFactoryTvl(
      "juno14m9rd2trjytvxvu4ldmqvru50ffxsafs8kequmfky7jh97uyqrxqs5xrnx"
    ),
  },
  sei: {
    tvl: getFactoryTvl(
      "sei1tcx434euh2aszzfsjxqzvjmc4cww54rxvfvv8v7jz353rg779l2st699q0"
    ),
  },
  comdex: {
    tvl: getFactoryTvl(
      "comdex1gurgpv8savnfw66lckwzn4zk7fp394lpe667dhu7aw48u40lj6jswv4mft"
    ),
  },
  stargaze: {
    tvl: getFactoryTvl(
      "stars13av7gw2mwejlkhsst8luva2q24kqql04afzpxmrrceuafehsg84q7pgtgu"
    ),
  },
}; // node test.js projects/astroport/index.js
