const { nullAddress } = require("../helper/tokenMapping");
const { get } = require("../helper/http");

const INDEXER_API = "https://events.glif.link/pool/0/tvl";

module.exports = {
  methodology:
    "The GLIF Pools protocol is a liquid leasing protocol for Filecoin that requires borrowers to collateralize FIL in order to borrow for their storage providing operation. This TVL calculation adds the total amount of FIL deposited into the protocol, and the total amount of locked FIL collateral by borrowers, to arrive at TVL.",
  filecoin: {
    tvl: async (_, height, _1, { api }) => {
      let url = INDEXER_API;
      if (!!height && height >= 0) {
        url += `?height=${height}`;
      }
      // this call is too costly to perform on chain in this environment,
      // we wrapped the tvl in a server that derives the information directly on-chain
      // but serves it in a more efficient manner to not overload defillama frontend
      // github repo: https://github.com/glifio/pools-metrics
      const { tvl } = await get(url);
      // this gets our tvl in attoFIL (wei denominated) without double counting
      api.add(nullAddress, tvl);
    },
  },
  timetravel: true,
  start: 1677628800, // 2023-03-01
  hallmarks: [
    // timestamp, event
    [1680206490, "Early deposits open"], // 2023-03-30
    [1685035830, "Protocol deployed"], // 2023-05-25
    [1691781060, "Exit ramp deployed"], // 2023-08-11
    [1711641600, "GLIF Points released"], // 2024-03-28
  ],
};
