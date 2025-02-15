const Abi = require('./abi.json');

module.exports = {
  methodology: "Sums the TVL of all Bamms Deployed via the factory",
};
const BAMMUIHELPER = "0xe205eE345Dc0a2b672ed04a78C4086bf5e6Bb41A";
const config = {
    fraxtal: {
        bamm: "0x19928170D739139bfbBb6614007F8EEeD17DB0Ba"
    }
};


Object.keys(config).forEach((chain) => {
    let fundsMap = config[chain];
    const bammFactories = Object.values(fundsMap);
  
    console.log(`~~~~> ${bammFactories}`);
  
    module.exports[chain] = {
      tvl: async (api) => {
        // Ensure api.multiCall is used correctly
        const bamms  = await api.multiCall({
          abi: Abi.bammsArray,
          calls: bammFactories.map((factory) => ({ target: factory })),
        });
        console.log(bamms, typeof(bamms))
        let bammsList = bamms[0];
        
        // Fetch TVL for each BAMM address
        const tvlResults = await api.multiCall({
            abi: Abi.getTVL,
            calls: bammsList.map((bamm) => ({ target: BAMMUIHELPER, params: bamm })),
        });
        for (let member of tvlResults) {
            api.addTokens(member[1], member[3]);
        }
      },
    };
  });