#!/usr/bin/env node
// not: utf-8 kodlaması Node.js'de fs.readFileSync ile varsayılan olarak ele alınır.

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const cheerio = require('cheerio');

class WahyParser {
    static loadXml() {
        const enXmlPath = path.resolve(__dirname, 'data/config_en.xml');
        const trXmlPath = path.resolve(__dirname, 'data/config_tr.xml');

        return {
            en: fs.readFileSync(enXmlPath, 'utf-8'),
            tr: fs.readFileSync(trXmlPath, 'utf-8')
        };
    }
}

const XML_DATA = WahyParser.loadXml();
const ENGLISH = XML_DATA.en;
const TUR = XML_DATA.tr;

const SURELER = {
    tur: ["Fatiha", "Bakara", "Ali İmran", "Nisa", "Maide", "Enam", "Araf", "Enfal", "Tevbe", "Yunus", "Hud", "Yusuf", "Rad", "İbrahim", "Hicr", "Nahl", "Isra", "Kehf", "Meryem", "Taha", "Enbiya", "Hac", "Muminun", "Nur", "Furkan", "Suara", "Neml", "Kasas", "Ankebut", "Rum", "Lukman", "Secde", "Ahzab", "Sebe", "Fatir", "Yasin", "Saffat", "Sad", "Zümer", "Mumin", "Fussilet", "Sura", "Zuhruf", "Duhan", "Casiye", "Ahkaf", "Muhammed", "Fetih", "Hucurat", "Kaf", "Zariyat", "Tur", "Necm", "Kamer", "Rahman", "Vakia", "Hadid", "Mücadele", "Hasr", "Mümtahine", "Saf", "Cuma", "Münafikun", "Tegabun", "Talak", "Tahrim", "Mülk", "Kalem", "Hakka", "Mearic", "Nuh", "Cin", "Müzzemmil", "Müddessir", "Kıyamet", "İnsan", "Murselat", "Nebe", "Naziat", "Abese", "Tekvir", "İnfitar", "Mutaffifin", "İnsikak", "Buruc", "Tarik", "Ala", "Gasiye", "Fecr", "Beled", "Şems", "Leyl", "Duha", "İnşirah", "Tin", "Alak", "Kadir", "Beyyine", "Zilzal", "Adiyat", "Karia", "Tekasür", "Asr", "Hümeze", "Fil", "Kureyş", "Maun", "Kevser", "Kafirun", "Nasr", "Leheb", "İhlas", "Felak", "Nas"],
    eng: ["The Opening", "The Cow", "The Family Of Imran", "Women", "The Food", "The Cattle", "The Elevated Place", "The Spoils Of War", "Repentance", "Yunus", "Hud", "Yusuf", "The Thunder", "Ibrahim", "The Rock", "The Bee", "The Israelites", "The Cave", "Marium", "Ta Ha", "The Prophets", "The Pilgrimage", "The Believers", "The Light", "The Criterion", "The Poets", "The Ant", "The Narrative", "The Spider", "The Romans", "Luqman", "The Adoration", "The Allies", "Saba", "The Originator", "Ya Seen", "The Rangers", "Suad", "The Companies", "The Believer", "Ha Mim", "The Counsel", "The Embellishment", "The Evident Smoke", "The Kneeling", "The Sandhills", "Muhammad", "The Victory", "The Chambers", "Qaf", "The Scatterers", "The Mountain", "The Star", "The Moon", "The Beneficient", "The Great Event", "The Iron", "The Pleading One", "The Banishment", "The Examined One", "The Ranks", "Friday", "The Hypocrites", "Loss And Gain", "The Divorce", "The Prohibition", "The Kingdom", "The Pen", "The Sure Calamity", "The Ways Of Ascent", "Nuh", "The Jinn", "The Wrapped Up", "The Clothe Done", "The Resurrection", "The Man", "The Emissaries", "The Great Event", "Those Who Pull Out", "He Frowned", "The Covering Up", "The Cleaving Asund", "The Defrauders", "The Bursting Asund", "The Mansions Of The Stars", "The Night-Comer", "The Most High", "The Overwhelming", "The Daybreak", "The City", "The Sun", "The Night", "The Early Hours", "The Expansion", "The Fig", "The Clot", "The Majesty", "The Clear Evidence", "The Shaking", "The Assaulters", "The Terrible Calam", "The Multiplicatio", "Time", "The Slanderer", "The Elephant", "The Qureaish", "The Daily Necessar", "The Heavenly Fount", "The Unbelievers", "The Help", "The Flame", "The Unity", "The Dawn", "The Men"]
};

// Yalnızca betik doğrudan çalıştırıldığında CLI işlemlerini yap
if (require.main === module) {
    program
        .name('wahy')
        .usage('[options]')
        .option('-l, --lang <LANGUAGE>', 'Which language that you want to read signs?', 'eng')
        .option('-s, --scripture <SCRIPTURE>', 'Scripture name or number', '1')
        .option('-a, --ayah <SIGN>', 'Sign number', 'all')
        .parse(process.argv);

    const options = program.opts();
    const LANG = options.lang === 'tur' ? 'tur' : 'eng';
    let SCRIPTURE = 0;
    let SIGN = options.ayah;

    // SCRIPTURE çözümlemesi
    if (!isNaN(options.scripture)) {
        SCRIPTURE = parseInt(options.scripture, 10) - 1;
    } else if (options.scripture.toLowerCase() === 'all') {
        SCRIPTURE = 'all';
    } else {
        const inputScripture = options.scripture.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        const langKey = LANG === 'tur' ? 'tur' : 'eng';
        const index = SURELER[langKey].indexOf(inputScripture);
        if (index !== -1) {
            SCRIPTURE = index;
        }
    }

    // SIGN çözümlemesi
    if (SIGN !== 'all') {
        SIGN = parseInt(SIGN, 10) - 1;
    }

    const xmlSource = LANG === 'tur' ? TUR : ENGLISH;
    const $ = cheerio.load(xmlSource, { xmlMode: true });
    const elements = $('[ChapterName]'); // Nokogiri //*[@ChapterName] karşılığı

    function showWahy() {
        const chapter = elements.eq(SCRIPTURE);
        if (!chapter.length) {
            console.error(chalk.red("Scripture not found."));
            process.exit(1);
        }

        const chapterName = chapter.attr('ChapterName').toUpperCase();

        // Ruby'deki string.center(40, "*") davranışının simülasyonu
        const padding = Math.max(0, 40 - chapterName.length);
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        console.log('*'.repeat(leftPad) + chapterName + '*'.repeat(rightPad));

        const verses = chapter.find('Verse');

        if (SIGN === 'all') {
            verses.each((i, el) => {
                console.log(`${chalk.red(`[${i + 1}]:`)} ${chalk.green($(el).text())}`);
            });
        } else {
            const verse = verses.eq(SIGN);
            if (verse.length) {
                console.log(`${chalk.red(`[${SIGN + 1}]:`)} ${chalk.green(verse.text())}`);
            } else {
                console.error(chalk.red("Ayah not found."));
            }
        }
    }

    showWahy();
}

// Ruby'deki yardımcı kütüphane fonksiyonlarını dışa aktarılabilir şekilde tanımlama
module.exports = {
    newData: function(lang) {
        if (lang === 'tur') {
            return cheerio.load(TUR, { xmlMode: true });
        } else if (lang === 'eng') {
            return cheerio.load(ENGLISH, { xmlMode: true });
        } else {
            throw new Error('Please, select a correct option ("tur" or "eng")');
        }
    },
    chaptersData: function(parsedXmlData) {
        return parsedXmlData('[ChapterName]');
    },
    scriptureData: function(parsedChapterData, scriptureName) {
        let sData = 0;
        if (!isNaN(scriptureName)) {
            sData = parseInt(scriptureName, 10) - 1;
        } else {
            const sc = scriptureName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            Object.values(SURELER).forEach(arr => {
                const idx = arr.indexOf(sc);
                if (idx !== -1) sData = idx;
            });
        }
        return parsedChapterData.eq(sData);
    },
    signData: function(scriptureData) {
        const signs = [];
        scriptureData.find('Verse').each((_, el) => {
            signs.push(cheerio(el).text());
        });
        return signs;
    },
    signDataObject: function(scriptureData) {
        return scriptureData.find('Verse');
    },
    takeSpecificSign: function(signDataArray, signNumber) {
        return signDataArray[signNumber];
    },
    specificSignObject: function(scriptureData, signNumber) {
        return scriptureData.find('Verse').eq(signNumber);
    }
};
