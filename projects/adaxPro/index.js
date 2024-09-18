
module.exports={
    methodology: "Data is retrieved from the api at https://amm-api.adax.pro/",
    timetravel: false, // but there's historical data, this can be changed!
    cardano: {
        tvl: () => ({}),
    },
    hallmarks: [
      [Math.floor(new Date('2023-08-29')/1e3), 'Website offline! Rug pull?'],
    ],
    deadFrom: Math.floor(new Date('2023-08-29')/1e3)
}