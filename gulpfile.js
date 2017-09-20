const gulp = require('gulp')
const babel = require('gulp-babel');
const sass = require('gulp-sass')
const uglify = require('gulp-uglify')
const minifyCss = require('gulp-clean-css')
const clean = require('gulp-clean')
const connect = require('gulp-connect');

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

