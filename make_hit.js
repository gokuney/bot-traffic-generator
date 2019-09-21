const puppeteer = require("puppeteer");
const cheerio = require('cheerio');

class makeHit {
    
    constructor(){
        console.log(`Init makeHit!`)
        this.proxies = [];
        this.currentIndex = 0;
        this.availableProxySources = {
            "proxyNova" : 'https://www.proxynova.com/proxy-server-list/country-in/',
            "spys": 'http://spys.one/free-proxy-list/IN/'
        };
        this.proxySource = 'proxyNova'; // From where to fetch the list of rpoxies
        this.urlSource = 'https://www.iplocation.net'; // Target URL to make hits on 
    }

makeHits(){
    let self = this
    return new Promise( (resolve, reject) => {
        (async () => {

            for( let i = 0; i < self.proxies.length; i++  ){
                await console.log(`-------- PROCESS #${i+1}`)
                try{
                await self.screenGrab(self.proxies[i])
                }catch(e){
                    await console.log(`Error in processing with ip ${self.proxies[i]}`)
                }
                self.currentIndex = self.currentIndex+1
                if( i == self.proxies.length ){
                    resolve(true)
                }
            }

        })();
    })
}

init(){
    let self = this;
    self.proxies = [];
    self.currentIndex = 0;
    return new Promise( (resolve, reject) => {
        try{

            (async () => {
                //Prepare the proxies
                console.log(`Getting proxies`)
                await self.getProxies()
                //Count and process the proxies
                console.log(`Making hits`)
                await this.makeHits()
                resolve(true)

            })();
        }catch(err){
            reject(err)
        }
    })
}

//Get the list of proxies to process
getProxies(){
    let self = this
    return new Promise( (resolve, reject) => {
        if( typeof self.availableProxySources[ self.proxySource ] == "undefined" ){
            console.log(`Errored`)
            reject(`${self.proxySource} is not a valid proxy source. Please make sure the proxySource is a valid key in availableProxySources.`)
            return false;
        }
        var fn = `PROXY | screen-${new Date()}.png`;
        var url = self.availableProxySources[ self.proxySource ];
        try{
        (async function(){
            //const browser = await puppeteer.launch({headless: true})
            const browser = await puppeteer.launch({
            ignoreHTTPSErrors: true,
            slowMo : 150,
            args: [
                '--no-sandbox',
                '--window-size:1920,1080'
            ]
            });
            const page = await browser.newPage()
            await page.setViewport({width:1280, height: 800});
            console.log(`Getting proxies from:  ${url}`);

            try{
            await page.goto(url,{ 
            waitUntil: 'networkidle2'
            });

            //make list 
            // let _pages = await page.$$('#xpp');
            // _pages.value = "5";
            // var evt = new Event('change');
            // _pages.dispatchEvent(evt);

            const html = await page.content();
            const $ = await cheerio.load(html);

            switch( self.proxySource ){
                case 'spys':

                    let _td = await $("*").find("table").eq(2).find('td');
                    let _nth = 1;
                    for( let i = 14; i < _td.length; i+=10 ){
                        await console.log(`iTH ${i}`)
                        let _ip = _td.eq(i).text()
                        _ip = _ip.split(' ')[1].trim()
                        console.log(`-| ${_nth} | ${_ip} \n`)
                        _nth += 1;
                        if( _ip.length > 5 ){
                            self.proxies.push( _ip )
                        }
                    }
                    
                break;

                case 'proxyNova':
                    let _td2 = await $("*").find('#tbl_proxy_list').find('td');
                    for( let i = 0; i < _td2.length; i += 8 ){
                        //get ip
                        let _ip2 = _td2.eq(i).text().trim();
                        let port2 = _td2.eq(i+1).text().trim();
                        if(_ip2.length > 10){
                            self.proxies.push(`${_ip2}:${port2}`)
                        }
                    }
                break;

                default:
                    console.log('nothing to do')
            }
            console.log(`Done fetching proxy list`);
            resolve(true)

        }catch(e){
            console.log(`error in opening url `, e)
            reject(e)
        }

            await page.waitFor(2000)

            //click on the ad
            console.log(`Clicking the ad`)
            
            // page.click('a');

            // await page.waitForNavigation();
            console.log(`Taking Screenshot`)
            await page.screenshot({ path: `${__dirname}/${fn}` });
            browser.close();
            resolve('Processed')
        })();
        }catch(e){
            console.log(`error `, e)
            reject( e )
        }
    

        
    })
}

//start grabbing 
screenGrab(proxy){
    let self = this
    return new Promise( (resolve, reject) => {

        var fn = `screen-${new Date()}.png`;
        // var url = 'http://advertisement.wheelsindreams.com';
        var url = self.urlSource;
        try{
        (async function(){
            //const browser = await puppeteer.launch({headless: true})
            const browser = await puppeteer.launch({
            ignoreHTTPSErrors: true,
            slowMo : 150,
            args: [
                '--no-sandbox',
                '--window-size:1920,1080',
                // '--proxy-server=socks5://127.0.0.1:9050'
                `--proxy-server=${proxy}`
                // '--disable-setuid-sandbox',
            ]
            });
            const page = await browser.newPage()
            await page.setViewport({width:1280, height: 800});
            console.log(`Opening URL ${url} using proxy ${proxy}`);

            try{
            await page.goto(url,{ 
            waitUntil: 'networkidle2'
            });
        }catch(e){
            console.log(`error in opening url `, e)
            reject(e)
        }

            await page.waitFor(2000)

            //click on the ad
            console.log(`Clicking the ad`)
            
            // page.click('a');

            // await page.waitForNavigation();
            console.log(`Taking Screenshot`)
            await page.screenshot({ path: `${__dirname}/${fn}` });
            browser.close();
            resolve('Processed')
        })();
        }catch(e){
            console.log(`error `, e)
            reject( e )
        }

    })
}


}

module.exports = makeHit