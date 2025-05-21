const { staking } = require("../helper/staking");


module.exports = {
  ethereum: {
    tvl: () => ({}), // Project rebranded. arNXM is now being managed by EASE.
    staking: staking('0x5afedef11aa9cd7dae4023807810d97c20791dec', '0x1337def16f9b486faed0293eb623dc8395dfe46a')
  },
  hallmarks: [
    [Math.floor(new Date('2022-10-31') / 1e3), 'Project rebranded as Ease. Stopped doublecounting Nexus Mutual tvl'],
  ],
};
