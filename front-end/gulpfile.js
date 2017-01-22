const gulp = require('gulp')
const sourcemaps = require('gulp-sourcemaps')
const babel = require('gulp-babel')
const sass = require('gulp-sass')

const deps = [
    ['bootstrap','node_modules/bootstrap/dist'],
    ['jquery', 'node_modules/jquery/dist'],
    ['tether', 'node_modules/tether/dist'],
    ['requirejs', 'node_modules/requirejs', 'node_modules/requirejs/require.js'],
    ['font-awesome', 'node_modules/font-awesome', ['node_modules/font-awesome/css/**/*', 'node_modules/font-awesome/fonts/**/*']]
]

gulp.task('build-js', () =>
    gulp.src('src/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({ presets: ['es2015'] }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build'))
        .on('error', error => console.log(error))
)

gulp.task('copy-deps', () => {
    deps.forEach(([name, base, path]) => {
        gulp.src(path || `${base}/**/*.*`, { base })
            .pipe(gulp.dest(`build/${name}`))
    })
})

gulp.task('sass', () => {
    return gulp.src('./scss/**/*.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(gulp.dest('build/css/'))
})

gulp.task('dev', () => {
    gulp.run('copy-deps')
    gulp.run('build-js')
    gulp.run('sass')
    gulp.watch('src/**/*.js', ['build-js'])
    gulp.watch('scss/**/*.scss', ['sass'])
})
