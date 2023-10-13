// noinspection JSCheckFunctionSignatures

import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { FileSize, SizeUnit } from "./FileSize.js"

export function Scraper()
{
    this.regex = {
        fileName: /(\S+?\.dll|\S+?\.sys)/gi,
        fileSizeRegex: /(?<number>\d+\.?\d*)\s?(?<unit>KB|MB|GB)/gi,
        numPages: /Page\s\d+\/(\d+)/gi,
        downloadUrl: /(?<=token=)\d+/gi
    }

    this.totalSize = new FileSize();

    this.getNumberOfPages = async (letter) =>
    {
        const url = this.getUrl(letter);
        const text = await this.fetchPage(url);

        const totalPages = this.regex.numPages.exec(text)?.[1];
        this.regex.numPages.lastIndex = 0;

        if(!totalPages) {
            console.error("Total pages not found for", letter, "at", url);
            return 0;
        } else {
            return parseInt(totalPages);
        }
    }

    this.getDownloadUrl = async (url) =>
    {
        const text = await this.fetchPage(`https://www.opendll.com/${url}`);
        const downloadUrl = `https://www.opendll.com/download.php?token=${text.match(this.regex.downloadUrl)?.[0]}`;
        this.regex.downloadUrl.lastIndex = 0;
        return downloadUrl;
    }

    this.scrapeDirectory = async (letter) =>
    {
        const currentPage = 1;
        const numPages = await this.getNumberOfPages(letter);
        /** @type {File[]} */
        const urls = [];

        for(let i = 0; i < numPages; i++) {
            const $ = cheerio.load(await this.fetchPage(this.getUrl(letter, i)));
            $("a").each((i, e) => {
                const text = $(e).text();
                const fileName = text.match(this.regex.fileName);
                this.regex.fileName.lastIndex = 0;

                if(fileName == null)
                    return;

                const fileSize = this.regex.fileSizeRegex.exec(text);
                this.regex.fileSizeRegex.lastIndex = 0;

                if(fileSize == null) {
                    console.error("File size not found for", fileName[0], "at", this.getUrl(letter, i));
                } else {
                    this.totalSize.add(parseFloat(fileSize.groups["number"]), SizeUnit.SIZES[fileSize.groups["unit"]]);
                }

                urls.push(new File(fileName[0], $(e).attr("href")));
            });
        }
        return urls;
    }

    /**
     * @method
     * @param {string} url
     * @returns {Promise<string>} - Or empty string if error
     */
    this.fetchPage = async (url) =>
    {
        let res;
        try {
            res = await fetch(url);
        } catch(err) {
            console.error(err.message);
            return "";
        }

        return res.text();
    }

    this.getUrl = (letter, page = 1) => `https://www.opendll.com/index.php?letter=${letter.toUpperCase()}&page=${page}`;
}

function File(name, url)
{
    this.name = name;
    this.url = url;
}