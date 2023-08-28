module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    hallmarks: [
      [Math.floor(new Date('2023-06-01')/1e3), 'Chain is abandoned'],
    ],
    polis: {
        tvl: () => 0
    },
}
