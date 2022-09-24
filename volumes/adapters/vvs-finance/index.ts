import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapter = univ2Adapter({
  "cronos": "https://graph.cronoslabs.com/subgraphs/name/vvs/exchange"
},{
  factoriesName: "vvsFactories",
  dayData: "vvsDayData",
});

adapter.volume.cronos.start = async()=> 1632035122; // 1 a year ago

export default adapter
