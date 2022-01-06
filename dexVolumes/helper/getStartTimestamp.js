const { request, gql } = require("graphql-request");

const getStartTimestamp =
  ({
    endpoints,
    chain,
    dailyDataField,
    volumeField,
    dateField = "date",
    first = 1000,
  }) =>
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

    const firstValidDay = days.find((data) => data[volumeField] !== "0");

    return firstValidDay[dateField];
  };

module.exports = {
  getStartTimestamp,
};
