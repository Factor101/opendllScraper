import { Scraper } from "./Scraper.js";
import { DownloadManager } from "./DownloadManager.js";

(async () => {
    const scraper = new Scraper();
    const downloadManager = new DownloadManager(scraper);

    const files = await scraper.scrapeDirectory("Z");
    await downloadManager.download(files);
})();