const express = require('express')
const app = express()
const puppeteer = require("puppeteer");
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const port = 80;

app.post("/", (req, res) => {
    const scrape = async () => {
        const url = req.body.url;
        const browser = await puppeteer.launch({
			ignoreDefaultArgs: ['--disable-extensions'],
			 executablePath:  puppeteer.executablePath(),
			 headless:false, 
			 args: [
                "--disable-setupid-sandbox",
                "--no-sandbox",
                "--single-process",
                "--no-zygote",
            ],
			});

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.goto(url);

        let resolve;
        page.on('response', async response => {
            if (resolve && response.url() === 'https://www.enuygun.com/otel/search-core/search')
                resolve(await response.json());
        });

        var promise = new Promise(x => resolve = x);
        var output = await promise;
        var list = [];
        if (typeof output.hotels[0] !== 'undefined') {

            let sayac = 0;

            output.hotels[0].rooms.forEach(value => {
                let indirim = "";

                if (value.offers[0].discountTags != null) {
                    indirim = value.offers[0].discountTags[0].discountString;
                } else {
                    indirim = 0;
                }

                var feed = {
                    odaadi: value.type.name,
                    konsept: value.offers[0].name,
                    indirim: indirim,
                    tutar: Math.ceil(value.offers[0].price.total.amount) + " " + value.offers[0].price.total.currency
                };

                list.push(feed);

            });
            res.send(list);

        } else {
            res.send(list);
        }

        browser.close();
    };

    scrape();
})

app.get("/", (req, res) => {
    res.send(puppeteer.executablePath()+"puppeteer çalişiyor ve aktif.");
})

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})
