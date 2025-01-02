module.exports = {
    timetravel: false,
    methodology: 'TVL counts the UST that has been deposted to the Protocol. Data is pulled from the Pylon API:"https://api.pylon.money/api/launchpad/v1/projects/mine".',
    terra: {
        tvl: () => ({}),
    },
    deadFrom: '2022-05-26',
     hallmarks:[
    [1651881600, "UST depeg"],
  ]
}
