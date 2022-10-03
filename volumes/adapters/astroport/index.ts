import { DISABLED_ADAPTER_KEY, SimpleVolumeAdapter } from "../../dexVolume.type";

const adapter: SimpleVolumeAdapter = {
  volume: {
    [DISABLED_ADAPTER_KEY]: {
      fetch: async () => ({
        timestamp: 0
      }),
      start: async () => 0
    },
  },
};

export default adapter;
