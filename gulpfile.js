const gulp = require('gulp')
const babel = require('gulp-babel');
const sass = require('gulp-sass')
const uglify = require('gulp-uglify')
const minifyCss = require('gulp-clean-css')
const clean = require('gulp-clean')
const connect = require('gulp-connect')
const rename = require('gulp-rename')
const gulpSequence = require('gulp-sequence')

let baseRrl = './src/'

gulp.task('connect', function() {
  	connect.server({
  		port: 8888,
	    root: baseRrl,
	    livereload: true
  	});
});
 
gulp.task('html', function () {
  	gulp.src(baseRrl+'*.html')
    .pipe(connect.reload());
});
 
gulp.task('watch', function () {
  	gulp.watch([baseRrl+'*.html'], ['html']);
  	gulp.watch([baseRrl+'sass/*.scss'], ['sass','html']);
  	gulp.watch([baseRrl+'es6/*.js'], ['babel','html']);
});
 
gulp.task('sass', function () {
  return gulp.src(baseRrl+'sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(baseRrl+'css'));
});

gulp.task('babel', () =>
    gulp.src(baseRrl+'es6/*.js')
    .pipe(babel({
        presets: ['env']
    }))
    .pipe(gulp.dest(baseRrl+'js'))
); 

gulp.task('default', ['connect', 'watch','sass','babel']);


// build
gulp.task('clean', function() {
    return gulp.src(['./dist/*.*'], {
            read: false
        })
        .pipe(clean());
});

gulp.task('minCss',()=>{
    return gulp.src([baseRrl+'css/*.css'])
    .pipe(minifyCss())
    .pipe(rename('zane-calendar.min.css'))
    .pipe(gulp.dest('dist'));
})
gulp.task('miJS',()=>{
    return gulp.src([baseRrl+'js/*.js'])
    .pipe(uglify())
    .pipe(rename('zane-calendar.min.js'))
    .pipe(gulp.dest('dist'));
})

gulp.task('build', gulpSequence(['clean','minCss', 'miJS']));




