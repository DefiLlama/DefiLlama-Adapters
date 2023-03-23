// vaults are closed: https://articles.apollo.farm/apollo-dao-will-be-closing-vaults-on-terra-classic/

module.exports = {
    timetravel: false,
    methodology: "Total TVL on vaults",
    terra: {
        tvl: () => ({})
    },
},
    module.exports.hallmarks = [
        [1651881600, "UST depeg"],
        [Math.floor(new Date('2022-09-13') / 1e3), 'Stop supporting Terra Classic'],
    ]
