const axios = require('axios');
const fs = require('fs');
const { program } = require('commander');

// Function to fetch TVL data from Aave API
const fetchTVL = async () => {
    try {
        const response = await axios.get('https://aave-api-v2.aave.com/data/tvl');
        const data = response.data;

        console.log('Total TVL:');
        console.log(`  ETH: ${data.totalTvl.tvlInEth}`);
        console.log(`  USD: ${data.totalTvl.tvlInUsd}`);

        console.log('\nMarket TVLs:');
        Object.entries(data.marketTvls).forEach(([market, values]) => {
            console.log(`  ${market}:`);
            console.log(`    ETH: ${values.tvlInEth || 'N/A'}`);
            console.log(`    USD: ${values.tvlInUsd || 'N/A'}`);
        });

        console.log(`\nLast Updated At: ${data.updatedAt}`);
    } catch (error) {
        console.error('Error fetching TVL from Aave API:', error.message);
    }
};

// Function to fetch TVL data from Defillama API and save to file
const fetchDefillamaTVL = () => {
    const apiUrl = 'https://api.defillama.com/data/tvl'; // Defillama API endpoint

    axios.get(apiUrl)
        .then(response => {
            const tvlData = response.data;
            fs.writeFileSync('defillama_tvl_data.json', JSON.stringify(tvlData, null, 2));
            console.log("Data saved to defillama_tvl_data.json");
        })
        .catch(error => {
            console.error("Error fetching TVL data from Defillama:", error.message);
        });
};

// Set up the CLI command using Commander
program
    .option('-t, --tvl', 'Fetch TVL Data from Aave API')
    .option('-d, --defillama', 'Fetch TVL Data from Defillama API')
    .parse(process.argv);

// Conditional execution based on command-line options
if (program.tvl) {
    fetchTVL();
}

if (program.defillama) {
    fetchDefillamaTVL();
}

// Set up the interval to fetch TVL data from Defillama every 1 hour
setInterval(() => {
    fetchDefillamaTVL();
}, 3600000); // Every 1 hour (3600000ms)

