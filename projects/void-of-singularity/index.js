import { FetchOptions, SimpleAdapter } from "../adapters/types";
import { CHAIN } from "../helpers/chains";
import { queryDune } from "../helpers/dune";

const fetch: any = async (options: FetchOptions) => {
  const dailyFees = options.createBalances();
  const value = (await queryDune("3521814", {
    start: options.startTimestamp,
    end: options.endTimestamp,
    receiver: '9yMwSPk9mrXSN7yDHUuZurAh1sjbJsfpUqjZ7SvVtdco'
  }));
  dailyFees.add('So11111111111111111111111111111111111111112', value[0].fee_token_amount);

  return { dailyFees, dailyRevenue: dailyFees }
}

export default {
  version: 2,
  adapter: {
    [CHAIN.SOLANA]: {
      fetch: fetch,
      start: 0,
    },
  },
};