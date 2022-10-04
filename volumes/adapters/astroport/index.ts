import { DISABLED_ADAPTER_KEY, SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import disabledAdapter from "../../helper/disabledAdapter";

const adapter: SimpleVolumeAdapter = {
  volume: {
    [DISABLED_ADAPTER_KEY]: disabledAdapter,
    [CHAIN.TERRA]: disabledAdapter,
  },
};

export default adapter;
