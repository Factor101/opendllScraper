import * as fs from "fs";
import * as https from "https";

export function DownloadManager(scraper)
{
    this.scraper = scraper;

    this.download = async (links) =>
    {
        const downloadLinks = await Promise.all(links.map(async (e) => {
            return {
                name: e.name,
                url: await this.scraper.getDownloadUrl(e.url)
            };
        }));

        // download all links in parallel
        await Promise.all(this.requestFactory(downloadLinks));
    }

    this.requestFactory = (urls) =>
    {
        return urls.map(e => {
            return this.makeRequest(e.url, e.name);
        });
    }

    this.makeRequest = (url, fileName) =>
    {
        return new Promise((resolve, reject) => {
            https.get(url, async (res) => {
                //TODO: fix downloader
                const path = await fs.createWriteStream(`./out/${fileName}.zip`);
                res.setEncoding('binary');
                path.on("open", () => {
                    res.pipe(path);
                }).on("close", () => {
                    path.close();
                    resolve(true);
                });
            });
        });
    }

    this.unzip = async () =>
    {

    }
}