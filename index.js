const fs = require('fs');
const xml2js = require('xml2js');
const moment = require('moment');

const parser = new xml2js.Parser();

const settings = require('./settings/settings');

console.log(settings.csvSettings);

const csvWriter = require('csv-writer').createObjectCsvWriter(settings.csvSettings);

class EroItem {
    constructor(item){
        let that = this;
        settings.headers.forEach(function (header) {
                try {
                    if(item[header] && Array.isArray(item[header])){
                        that[header] = item[header][0];
                    }
                } catch (e) {
                    console.error('Странная ошибка',e);
                }
            }

        );

        this.id = item['$'].id;
        this.available = item['$'].available;
        if(item.pictures && Array.isArray(item.pictures)){
            this.picture = [...item.picture,...item.pictures[0].picture].toString().split(',').join(',\n');
        }
    }
}

class EroskladParser {
    constructor() {
        this.data = null;
        this.json = null;
        this.offers = null;
        this.xml = 'https://www.erosklad.com/catalog/export/2?token=545097b3fd298b090a590d7587817b08&store=368591';
    }

    parse() {
        try {
            const xml = fs.readFileSync(__dirname + '/xml/erosklad_02_05_2020.xml');
            let data = null;
            parser.parseString(xml, function (err, result) {
                if (err) console.log(err);
                //console.log(result);
                console.log('Файл успешно прочинтан');
                data = result;
            });
            this.data = data;
            this.toJson();
        } catch (e) {
            console.log(e);
        }

        return this;
    }

    toJson(){
        try {
            this.json = JSON.stringify(this.data, null, 4);
        } catch (e) {
            console.log(e);
        }

        return this;
    }

    saveJson(){
        try {
            fs.writeFileSync( __dirname + '/output/json/' + moment().format('DD_MM_YYYY_HH_mm_ss') + '.json', this.json);
            fs.writeFileSync( __dirname + '/output/json/' + 'latest' + '.json', this.json);
        } catch (e) {
            console.log(e);
        }

        return this;
    }

    parseOffers(){
        try {
            console.log(this.data.yml_catalog.shop[0].offers[0].offer[0]);
            let offers = this.data.yml_catalog.shop[0].offers[0].offer;
            this.offers = offers.reduce((acc, item) => {
                acc.push(new EroItem(item));
                return acc
            },[]);
            csvWriter
                .writeRecords(this.offers)
                .then(()=> console.log('The CSV file was written successfully'));
        }catch (e) {
            console.log(e);
        }
    }
}

let ero = new EroskladParser();

ero.parse().parseOffers();

