const { tvl, borrowed, SWITCH_TS } = require('./core');

// TVL attributed to bluefin until partnership ended 2026-05-17
const gate = (fn) => async (api) => api.timestamp < SWITCH_TS ? {} : fn(api);

module.exports = {
  sui: {
      tvl: gate(tvl),
      borrowed: gate(borrowed),
  },
};