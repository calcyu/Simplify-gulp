/**
 * A Web lightweight framework (Simplify-gulp)
 * WEB前端轻量级环境，只需要NODEJS环境
 * Author: calcyu
 * Date: 2016/11/8
 */

// 1.实现CSS合并压缩
// 2.实现JS合并压缩
// 3.实现文件与文件夹监控、同步
// 4.实现非压缩CSS、JS调试
// 5.实现服务器端口修改
// 6.浏览器前缀和兼容等问题
// 7.给压缩的CSS和JS加头注释


//命令行参数
var yargs = require('yargs').argv;
var gulp = require('gulp');
//添加头注释
var header = require('gulp-header');
//css压缩
var nano = require('gulp-cssnano');
//css插件组合运行
var postcss = require('gulp-postcss');
//css前缀自动添加
var autoprefixer = require('autoprefixer');
//合并
var concat = require('gulp-concat');  
var uglify = require('gulp-uglify'); 
var rename = require('gulp-rename');
//浏览器同步
var browserSync = require('browser-sync');
//压缩图片
var imagemin = require('gulp-imagemin');		
var notify = require('gulp-notify');
var cache = require('gulp-cache');

var pkg = require('./package.json');
var dist = __dirname + '/dist';
 var banner = [
        '/*!',
        ' * Simplify-gulp v<%= pkg.version %> (<%= pkg.homepage %>)',
        ' * Author: <%= pkg.author %> ',
        ' * Copyright <%= new Date().getFullYear() %> geek5.cn.',
        ' * Licensed under the <%= pkg.license %> license',
        ' */',
        ''].join('\n');
gulp.task('build:css', function (){
    gulp.src('src/css/*.css')
        .pipe(concat('app.css'))
        .pipe(postcss([autoprefixer(['iOS >= 7', 'Android >= 4.1'])]))
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(gulp.dest(dist+'/css'))
        .pipe(browserSync.reload({stream: true}))
        .pipe(nano({
            zindex: false,
            autoprefixer: false
        }))
        .pipe(rename(function (path) {
            path.basename += '.min';
        }))
        .pipe(gulp.dest(dist+'/css'))
        .pipe(notify({ message: 'CSS task complete' }));
});

gulp.task('build:js', function () {
  gulp.src('src/js/*.js')
    .pipe(concat('app.js'))
    .pipe(header(banner, { pkg : pkg } ))
    .pipe(gulp.dest(dist+'/js'))
    .pipe(browserSync.reload({stream: true}))
    .pipe(uglify())
    .pipe(rename(function (path) {
        path.basename += '.min';
    }))
    .pipe(gulp.dest(dist+'/js'))
    .pipe(notify({ message: 'JS task complete' }));
});

gulp.task('build:images', function (){
    gulp.src('src/images/*.?(png|jpg|gif)')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest(dist))
    .pipe(browserSync.reload({stream: true}))
    .pipe(notify({ message: 'Images task complete' }));
});

gulp.task('build:html', function (){
    gulp.src('src/*.html')
    .pipe(gulp.dest(dist))
    .pipe(browserSync.reload({stream: true}))
    .pipe(notify({ message: 'HTML task complete' }));
});

gulp.task('release', ['build:css', 'build:js', 'build:images', 'build:html']);

gulp.task('watch', ['release'], function () {
    gulp.watch('src/css/*.css', ['build:css']);
    gulp.watch('src/css/*.js', ['build:js']);
    gulp.watch('src/images/*.?(png|jpg|gif)', ['build:images']);
    gulp.watch('src/*.html', ['build:html']);
});

gulp.task('server', function () {
    yargs.p = yargs.p || 8080;
    browserSync.init({
        server: {
            baseDir: "./dist"
        },
        ui: {
            port: yargs.p + 1,
            weinre: {
                port: yargs.p + 2
            }
        },
        port: yargs.p,
        startPath: '/'
    });
});

// 参数说明
//  -w: 实时监听
//  -s: 启动服务器
//  -p: 服务器启动端口，默认8080
gulp.task('default', ['release'], function () {
    if (yargs.s) {
        gulp.start('server');
    }

    if (yargs.w) {
        gulp.start('watch');
    }
});


