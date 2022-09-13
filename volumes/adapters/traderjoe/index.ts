import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const endpoints = {
  avax: "https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange",
};

export default univ2Adapter(endpoints, "factories");
