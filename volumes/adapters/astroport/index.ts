import { DISABLED_ADAPTER_KEY, SimpleVolumeAdapter } from "../../dexVolume.type";
import disabledAdapter from "../../helper/disabledAdapter";

const adapter: SimpleVolumeAdapter = {
  volume: {
    [DISABLED_ADAPTER_KEY]: disabledAdapter,
  },
};

export default adapter;
