
async function tvl(api) {
}

module.exports = {
  timetravel: false,
  deadFrom: '2025-10-21',
  sui: {
    tvl
  },
  methodology: "Calculates TVL by tracking deposit and withdrawal events",
  hallmarks: [
    ['2025-10-21', 'Project is sunset'],
  ],
} 