import { SimpleVolumeAdapter } from "../../dexVolume.type";
const { getUniqStartOfTodayTimestamp } = require("../../helper/getUniSubgraphVolume");

const { get } = require('../../../projects/helper/http')

const fetch = async (timestamp: number) => {

  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const data = await get('https://api.flamingo.finance/project-info/defillama-volume?timestamp=' + dayTimestamp);

  return {
    dailyVolume: data.volume,
    timestamp: data.timestamp,
  };
};

const adapter: SimpleVolumeAdapter = {
  volume: {
    neo: {
      fetch,
      start: async () => 1639130007,
    },
  },
};

export default adapter;