import { request, gql } from "graphql-request";

import { DEFAULT_DAILY_VOLUME_FACTORY, DEFAULT_DAILY_VOLUME_FIELD } from "./getUniSubgraphVolume";

export const DEFAULT_DATE_FIELD = "date"

interface IGetStartTimestamp {
  endpoints: {
    [chain: string]: string;
  }
  chain: string
  dailyDataField?: string
  volumeField?: string
  dateField?: string
  first?: number
}

const getStartTimestamp =
  ({
    endpoints,
    chain,
    dailyDataField = `${DEFAULT_DAILY_VOLUME_FACTORY}s`,
    volumeField = DEFAULT_DAILY_VOLUME_FIELD,
    dateField = DEFAULT_DATE_FIELD,
    first = 1000,
  }: IGetStartTimestamp) =>
    async () => {
      const query = gql`
        {
            ${dailyDataField}(first: ${first}) {
                ${dateField}
                ${volumeField}
            }
        }
    `;

      const result = await request(endpoints[chain], query);

      const days = result?.[dailyDataField];

      const firstValidDay = days.find((data: any) => data[volumeField] !== "0");

      return firstValidDay[dateField];
    };

export {
  getStartTimestamp,
};
