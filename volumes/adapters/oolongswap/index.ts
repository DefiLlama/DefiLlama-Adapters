import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const endpoints = {
  [CHAIN.BOBA]: "https://api.thegraph.com/subgraphs/name/oolongswap/oolongswap-mainnet",
};

const adapter = univ2Adapter(endpoints, {});

adapter.volume.boba.start = async () => 1635938988;

export default adapter
