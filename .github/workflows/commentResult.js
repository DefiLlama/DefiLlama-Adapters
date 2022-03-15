const { readFileSync } = require('fs');
const axios = require('axios');

async function main() {
    const [, , log, author, repo, pr, path, token] = process.argv;
    const file = readFileSync(log, 'utf-8');
    // only show the summary TVL cos the comments could end up long
    const summaryIndex = file.indexOf('------ TVL ------');
    if (summaryIndex == -1) {
        return;
    };

    console.log('SENDING POST')
    const response = await axios.post(
        `https://api.github.com/repos/${author}/${repo}/issues/${pr}/comments`,
        {
            body: `The adapter at ${path} exports TVL: 
                \n \n ${file.substring(summaryIndex + 17)}`
        }, {
        headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json'
        }
    });
    console.log(response)
};
main();