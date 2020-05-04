const fs = require('fs');
const xml2js = require('xml2js');
const moment = require('moment');

const parser = new xml2js.Parser();

const csvWriter = require('csv-writer').createObjectCsvWriter({
    path: './output/csv/offers_latest.csv',
    header: [
        {id: 'id', title: 'id'},
        {id: 'available', title: 'available'},
        {id: 'url', title: 'url'},
        {id: 'price', title: 'price'},
        {id: 'currencyId', title: 'currencyId'},
        {id: 'categoryId', title: 'categoryId'},
        {id: 'delivery', title: 'delivery'},
        {id: 'name', title: 'name'},
        {id: 'description', title: 'description'},
        {id: 'priceRetail', title: 'priceRetail'},
        {id: 'vendor', title: 'vendor'},
        {id: 'article', title: 'article'},
        {id: 'picture', title: 'picture'},
        {id: 'barcode', title: 'barcode'},
        {id: 'adult', title: 'adult'},
        {id: 'sizes', title: 'sizes'},
    ]
});

class EroItem {
    constructor(item){
        this.id = item['$'].id;
        this.available = item['$'].available;
        this.url = item.url[0];
        this.price = item.price[0];
        this.currencyId = item.currencyId[0];
        this.categoryId = item.categoryId[0];
        this.description = item.description[0];
        this.delivery = item.delivery[0];
        this.name = item.name[0];
        this.priceRetail = item.priceRetail[0];
        if(item.vendor && Array.isArray(item.vendor)){
            this.vendor = item.vendor[0];
        }
        if(item.article && Array.isArray(item.article)){
            this.article = item.article[0];
        }
        this.picture = [item.picture[0]];
        if(item.pictures && Array.isArray(item.pictures)){
            this.picture = [...this.picture,...item.pictures[0].picture].toString().split(',').join(',\n');
        }
        this.barcode = item.barcode[0];
        this.adult = item.adult[0];

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

