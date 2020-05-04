class Settings {
    constructor() {
        this.headers = [
            'id',
            'available',
            'url',
            'price',
            'currencyId',
            'categoryId',
            'delivery',
            'name',
            'description',
            'priceRetail',
            'vendor',
            'article',
            'picture',
            'barcode',
            'adult',
            'sizes',
        ];
        this.csvSettings = {
            path: './output/csv/offers_latest.csv',
            header: this.SetCsvHeaderSettings(),
        };

    }
    SetCsvHeaderSettings(){
        return this.headers.map((item)=>{
            return {
                id: item,
                title: item,
            }
        });
    }
}

module.exports = new Settings();

