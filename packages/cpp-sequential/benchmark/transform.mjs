import { parse } from '@fast-csv/parse';
import { createReadStream, createWriteStream } from 'fs';
import { finished } from 'stream/promises';
import { format } from '@fast-csv/format';
import _ from 'lodash'

const benchmarks = new Map();

(async () => {
    await finished(
        createReadStream(new URL('results/results.csv', import.meta.url)).pipe(
            parse({ headers: true, })
        )
            .on('data', (data => {
                const nameRest = data.name.split('/')
                const sizeThetaStat = nameRest[1].split('_')
                const name = nameRest[0]
                const sizeTheta = sizeThetaStat[0]
                const stat = sizeThetaStat[1]

                const key = `${name}_${sizeTheta}`
                const b = benchmarks.get(key) || { key, name, sizeTheta: +sizeTheta };
                b[stat] = Number(data.real_time) / 1e6
                benchmarks.set(key, b)
            }))
    )

    const byName = _.groupBy([...benchmarks.values()], 'name')
    for (const [name, entries] of Object.entries(byName)) {

        const stream = format({ headers: true })
        stream.pipe(createWriteStream(new URL(`../../../benchmark/cpp_theta_${name}.csv`, import.meta.url)))
        for (const entry of entries)
            stream.write(entry)
    }
})()
