const stringify = require('csv-stringify')
const generate = require('csv-generate')

generate({
    objectMode: true,
    seed: 1,
    headers: 2
})
    .pipe(stringify({
        header: true,
        columns: {
            year: 'birthYear',
            phone: 'phone'
        }
    }))
    .pipe(process.stdout)
