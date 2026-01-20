module.exports = {
  deadFrom: '2024-05-07',
  methodology: `Users deposit into OptyFi vaults and receive vault shares. These vault shares have a price called pricePerShare. TVL is calculated as: Vault Token Supply * pricePerShare`,
  ethereum: { tvl: () => ({}) },
  polygon: { tvl: () => ({}) },
};
