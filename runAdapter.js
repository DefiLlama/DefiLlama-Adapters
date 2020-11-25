const { fetch } = require(`./projects/${process.env.PROJECT}`);

fetch().then(`Reported TVL: ${console.log}`);