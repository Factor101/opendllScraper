// noinspection JSCheckFunctionSignatures

import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { FileSize, SizeUnit } from "./FileSize.js"

(async () => {
    let res;
    const url = "https://www.opendll.com/index.php?letter=a&page=1";
    try {
        res = await fetch(url);
    } catch(err) {
        return console.error(err.message);
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    const fileNameRegex = /(\S+?\.dll|\S+?\.sys)/gi
    const fileSizeRegex = /(?<number>\d+\.?\d*)\s?(?<unit>KB|MB|GB)/gi;
    const totalSize = new FileSize();

    console.log(/(?:Page\s\d+\/)(\d+)/gi.exec(html))


    return;

    // Loop over all the anchor tag
    $("a").each((i, e) => {
        const text = $(e).text();
        const fileName = text.match(fileNameRegex);
        fileNameRegex.lastIndex = 0;

        if(fileName == null)
            return;

        const fileSize = fileSizeRegex.exec(text);
        fileSizeRegex.lastIndex = 0;

        if(fileSize == null) {
            console.error("File size not found for", fileName[0], "at", url);
            return;
        }

        totalSize.add(parseFloat(fileSize.groups["number"]), SizeUnit.SIZES[fileSize.groups["unit"]]);

        console.log(text + " " + fileSize.groups["unit"], " => ", $(e).attr("href"));
    });
    console.log("Total size:", totalSize.size, SizeUnit.sizeToName(totalSize.unit));
})();