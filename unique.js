var fs = require('fs');
const readline = require("readline");

const FOLDER = './verified';
(async () => {
    const map = {};
    const files = fs.readdirSync(FOLDER);
    files.forEach( async (file, index) => {
        const fileStream = fs.createReadStream(FOLDER + '/' + file);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });

        for await (const line of rl) {
            if( !map[line.trim()] ) {
                map[line.trim()] = true;
            }
        }

        if( index === files.length - 1){
            var str = '';
            const keys = Object.keys(map);
            keys.forEach( (key, index) => {
                str = str + key + '\n';

                if( index === keys.length - 1){
                    fs.writeFileSync(FOLDER + '/unique.txt', str);
                }
            });
        }
    });

})()