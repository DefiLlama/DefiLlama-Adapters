module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    hallmarks: [
      [Math.floor(new Date('2023-06-01')/1e3), 'Chain is abandoned'],
    ],
    deadFrom: '2023-06-01',
    polis: {
        tvl: () => 0
    },
}
