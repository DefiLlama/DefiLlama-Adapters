const { compoundExports } = require("../helper/compound");

module.exports = {
    timetravel: true,
    aurora: {
        ...compoundExports(
            '0x6De54724e128274520606f038591A00C5E94a1F6',
            'aurora',
            '0x4E8fE8fd314cFC09BDb0942c5adCC37431abDCD0',
            '0xc9bdeed33cd01541e1eed10f90519d2c06fe3feb'
        )
    }
};