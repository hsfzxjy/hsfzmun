const gulp = require('gulp')
const sourcemaps = require('gulp-sourcemaps')
const babel = require('gulp-babel')
const sass = require('gulp-sass')
const path = require('path')

const deps = [
    ['bootstrap','node_modules/bootstrap/dist'],
    ['jquery', 'node_modules/jquery/dist'],
    ['tether', 'node_modules/tether/dist'],
    ['requirejs', 'node_modules/requirejs', 'node_modules/requirejs/require.js'],
    ['font-awesome', 'node_modules/font-awesome', ['node_modules/font-awesome/css/**/*', 'node_modules/font-awesome/fonts/**/*']],
    ['trumbowyg', 'node_modules/trumbowyg/dist'],
    ['mustache', 'node_modules/mustache', 'node_modules/mustache/mustache.min.js'],
    ['timeago', 'node_modules/timeago', ['node_modules/timeago/jquery.timeago.js', 'node_modules/timeago/locales/**/*']],
    ['file-upload', 'node_modules/blueimp-file-upload']
]

gulp.task('build-js', () => {
    gulp.src(['src/**/*.js', '!src/main.js'], { base: 'src' })
        .pipe(sourcemaps.init())
            .pipe(babel({ presets: ['es2015'], plugins: ['transform-es2015-modules-amd'] })
                .on('error', error => console.log(error.message, error.stack)))
        .pipe(sourcemaps.write('__maps__', {
            mapSources: name => path.basename(name)
        }))
        .pipe(gulp.dest('build'))
    gulp.src('src/main.js').pipe(gulp.dest('build'))
})

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
    gulp.run('build')
    gulp.watch('src/**/*.js', ['build-js'])
    gulp.watch('scss/**/*.scss', ['sass'])
})


gulp.task('build', () => {
    gulp.run('copy-deps')
    gulp.run('build-js')
    gulp.run('sass')
})
