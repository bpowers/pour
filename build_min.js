({
    baseUrl: 'lib',
    include: ['pour'],
    name: 'vendor/almond',
    wrap: {
        startFile: 'lib/build/start.frag.js',
        endFile: 'lib/build/end.frag.js'
    },
    out: 'www/pour.min.js',
})
