const gulp = require('gulp')
const sourcemaps = require('gulp-sourcemaps')
const babel = require('gulp-babel')

const deps = [
    ['bootstrap','node_modules/bootstrap/dist'],
    ['jquery', 'node_modules/jquery/dist'],
    ['tether', 'node_modules/tether/dist'],
    ['requirejs', 'node_modules/requirejs', 'node_modules/requirejs/require.js']
]

gulp.task('build-js', () =>
    gulp.src('src/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({ presets: ['es2015'] }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build'))
)

gulp.task('copy-deps', () => {
    deps.forEach(([name, base, path]) => {
        gulp.src(path || `${base}/**/*.*`, { base })
            .pipe(gulp.dest(`build/${name}`))
    })
})

gulp.task('watch', () => {
    gulp.run('copy-deps')
    gulp.run('build-js')
    gulp.watch('src/**/*.js', ['build-js'])
})
