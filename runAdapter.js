const { fetch } = require(`./projects/${process.env.PROJECT}`);

fetch().then((value) => {
    console.log(`Reported TVL: ${value} USD`)
});