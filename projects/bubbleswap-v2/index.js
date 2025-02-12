
module.exports = {
  hedera: {
    tvl: () => ({}),
  },
  deadFrom: '2023-07-01',
  timetravel: false,
  methodology: "Data is retrieved from the api at https://api.bubbleswap.io/",
  hallmarks: [
    [1683288000, "V2 Launch"],
    [Math.floor(new Date('2023-07-01')/1e3), 'Project shutdown'],
  ]
}