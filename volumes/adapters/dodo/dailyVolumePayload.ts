export default (chain: string) => ({
  operationName: "FetchDashboardDailyData",
  variables: { "where": { "day": 365 * 3 } },
  query: `query FetchDashboardDailyData($where: Dashboardchain_daily_data_filter) {
        dashboard_chain_day_data(where: $where) {
          list {
            timestamp
            volume {
                ${chain}
              __typename
            }
            __typename
          }
          __typename
        }
      }`
})