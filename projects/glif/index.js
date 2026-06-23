const { nullAddress } = require("../helper/tokenMapping");
const { get } = require("../helper/http");
const { sumUnknownTokens } = require("../helper/unknownTokens");

const INDEXER_API = "https://events.glif.link/pool/0/tvl";

// Base network ERC4626 vault address for ICNT tokens
const BASE_ICNT_VAULT = "0xAeD7C2eD7Bb84396AfCB55fF72c8F8E87FFb68f3";

module.exports = {
  methodology:
    "This TVL calculation combines GLIF's two pools: (1) Filecoin pool (on Filecoin network) and (2) Impossible Cloud Network pool (on Base network). For the Filecoin pool, tvl tracks the total amount of FIL deposited into the protocol, and the total amount of locked FIL collateral by borrowers, to arrive at TVL. For the Impossible Cloud Network pool, tvl tracks the total ICNT assets locked in the pool.",
  filecoin: {
    tvl: async (api) => {
      let url = INDEXER_API;
      url += `?timestamp=${api.timestamp}`;
      // this call is too costly to perform on chain in this environment,
      // we wrapped the tvl in a server that derives the information directly on-chain
      // but serves it in a more efficient manner to not overload defillama frontend
      // github repo: https://github.com/glifio/pools-metrics
      const { tvl } = await get(url);
      // this gets our tvl in attoFIL (wei denominated) without double counting
      api.add(nullAddress, tvl);
    },
  },
  base: {
    tvl: async (api) => {
      // Get the total assets from the ERC4626 vault
      const totalAssets = await api.call({
        abi: "function totalAssets() view returns (uint256)",
        target: BASE_ICNT_VAULT,
      });
      
      // Get the underlying asset address from the vault
      const asset = await api.call({
        abi: "function asset() view returns (address)",
        target: BASE_ICNT_VAULT,
      });
      
      // Add the ICNT tokens to the balance
      api.add(asset, totalAssets);
      
      // Use sumUnknownTokens to handle pricing of the unknown ICNT token
      return sumUnknownTokens({ 
        api, 
        useDefaultCoreAssets: true,
        resolveLP: true 
      });
    },
  },
  timetravel: true,
  start: '2023-03-01', // 2023-03-01
  hallmarks: [
  ],
};
