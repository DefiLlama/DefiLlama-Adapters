export default (chain: string) => ({
    "operationName": "FetchDashboardInfoData",
    "variables": {
        "where": {
            "chain": chain
        }
    },
    "query": `query FetchDashboardInfoData($where: Dashboardtype_filter) {\n  dashboard_pairs_count_data(where: $where) {\n    totalVolume\n    txes\n    txesUsers\n    __typename\n  }\n}\n`
})