1. create adapter in {pegged asset's coingeckoID}/index.ts
2. test adapter: npx ts-node test {peggedAssetGeckoId}/index
3. add export to index.ts
4. add new data entry to peggedData.ts, including bridge info
5. add a chainlink feed to ChainlinkFeeds in prices/index.ts
6. add icon to defillama-app/public/pegged-icons
