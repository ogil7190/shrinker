const express = require("express");
const { getRouter } = require("./router");
const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const { sleep, randomBtwn, randomSizeStringWithCustomPossibles } = require("./utils");
const UserAgent = require('user-agents');

const PORT = process.env.PORT || 3000;
const app = express();
const router = getRouter(global);
app.use(express.json());
app.use(router);
app.listen(PORT);

const LINK = process.env.LINK || 'http://fumacrom.com/nsto';
async function execute(browser) {
    const page = await browser.newPage();

    const userAgent = new UserAgent();
    await page.setUserAgent(userAgent.toString());
    await page.setExtraHTTPHeaders({ referer: 'https://www.facebook.com/' });
    await fingerPrintListener(page);

    try {
        await sleep(500);
        await page.goto(LINK, { waitUntil: "networkidle2" });
        await sleep( randomBtwn(8 * 1000, 10 * 1000) );
        
        const haveShrinkBtn = await page.$$('#shrink_submit');
        if( haveShrinkBtn.length > 0 ) {
            console.log('NO AD, we are blocked');
        }
        await page.evaluate( () => {
            const element = document.getElementById('skip_bu2tton');
            if( element ) {
                element.click();
            }
        });
        await sleep(15 * 1000);
    } catch {
        console.log('error');
    }

    const pages = await browser.pages();
    if( pages.length > 1 ) {
        pages.map( (_page, index) => index !== 0 && _page.close() );
    }

    await sleep(10 * 1000);
    return execute(browser);
}

async function fingerPrintListener(page) {
    const size = Math.floor( Math.random() * 64 );
    const str = randomSizeStringWithCustomPossibles(size, 'qwertyuiopasdfghjklzxcvbnmQAZWSXEDCRFVTGBYHNUJMIKOLP1234567890');
    await page.evaluateOnNewDocument((str) => {
        const originalFunction = HTMLCanvasElement.prototype.toDataURL;
        
        /********************/
        window.navigator.deviceMemory = 4 + Math.floor( Math.random() * 12 );
        /********************/

        HTMLCanvasElement.prototype.toDataURL = function () {
            console.log( 'Function Called', this.width, this.height );
            const _width = this.width;
            const _height = this.height;

            const dimensions = [
                {
                    w : 300,
                    h : 150
                },
                {
                    w : 240,
                    h : 140
                },
                {
                    w : 122,
                    h : 110
                },
                {
                    w : 240,
                    h : 60
                },
                {
                    w : 4,
                    h : 4
                }
            ]

            const items = dimensions.filter( (obj) => obj.h === _height && obj.w === _width );

            if (items && items.length > 0) {
                console.log( 'Fingerprint attempt', str);
                // this is likely a fingerprint attempt, return fake fingerprint
                return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANwAAAAeCAAAAABiES/iAAACeElEQVRYw+2YzUtUURjGf47OmDPh5AyFomUiEeEmyghXtWsh4dcswlYV2KYWfZh/QRBUVLhTCCJXEgmKUCIkFhJREARBkbkyKBlTRmUC82lxZ7z3TjM4whwXwz2ry3vO87znx33Pey4XFfHAg/PgPDgPzoPz4Dy4rFIKscSkAfmnsUY+iTfXFhxue4Zm4QpfaKbg8k+EsZNsGG6iNVzRMrkZeRPmjp6eCgcae5f+3wJIgtWLldG+DUnfzoail1etaVsEa1f2lUqw2hPd3T7nCrkMtlkQ24YDwP8+FZkI+gY3uq2cTcu54GIA/dJCDUAnSE4RdAESdALUxZ0hl4E5OMs49iE528E5a+cj5YFhDVI3vLA2c4K+zLXpvR37tNRDs3STg1OJqXqQSwS14wlJUD+VeHWAW86Qy8BwQ5Ek/WK/JBgqC72UTvJakmY5lAvurTRPSDrMmKRRcIvgeUo2KmmEI86Qy8DwmVu/ezQIBCSBLzwjKZhujv5cZZmUNkAq57ekRXCLYDG12pre5Qy5DAzDXbPfIOB/JqmCzNafCZd+dMA5RfZxdsBlNTAMF+FJfD2eSvSI0iGpm${str}Xe5GnbG3qyyHAO3yCZxlGV2uBLWDcJVMZKc7UrnfIBvQI+pHpxbS34ZaNkK7gYN0yvTDSCXyCZxNJTscFFe/DUH1w3QvpnzPiUPdTXfsvxZDdBGmeQU2SQd9lWQHS5m9J6Ln4/suZCwc96D25qM1formq5/3ApOX1uDkZ7P7JXkENkkK5eqQm3flRtuvitSYgCucKOf0zv01bazcG3Tyz8GKukvSjjrlB3/U5Rw42dqAo29yypKOO8figeX1/gH+zX9JqfOeUwAAAAASUVORK5CYII=`;
            }
            console.log( 'DoubtFull' );
            // otherwise, just use the original function
            return originalFunction.apply(this, arguments);
        };
    }, str);
}
 
(async () => {
    const options = {
        headless: process.env.IS_DEV === 'false' ? true : false,
        ignoreHTTPSErrors: true,
        args: [
          "--disable-web-security",
          "--window-position=000,000",
          "--window-size=1440,821",
          "--no-sandbox",
          "--disable-dev-shm-usage",
          "--disable-features=site-per-process",
          '--js-flags="--max-old-space-size=300"',
        ],
      };
    puppeteer.use(pluginStealth());
    const browser = await puppeteer.launch(options);
    await execute(browser);
})()