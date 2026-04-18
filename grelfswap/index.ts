import { SimpleAdapter, FetchOptions } from "../../helpers/types";

const adapter: SimpleAdapter = {
  version: 2,
  adapter: {
    hedera: {
      fetch: async (_options: FetchOptions) => {
        return {};
      },
      start: 1762473600,
    },
  },
  protocolType: "aggregator",
};

export default adapter;
