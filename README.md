# zane-data-time-calendar
时间日历插件

### 说明：
此插件不依赖任何第三方插件，因此可以在任何地方单独使用
插件不兼容低版本的IE浏览器，IE浏览器请慎重使用
暂时只支持单个时间段选择，后期会推出多个时间段选择方式。

### images

![输入图片说明](https://git.oschina.net/uploads/images/2017/0929/170241_8561545c_818875.png "在这里输入图片标题")
![输入图片说明](https://git.oschina.net/uploads/images/2017/0929/170243_068b0494_818875.png "在这里输入图片标题")
![输入图片说明](https://git.oschina.net/uploads/images/2017/0929/170246_ee897477_818875.png "在这里输入图片标题")

### 文档说明  ：http://www.seosiwei.com/zjkf/166.html
### demo地址 ： http://www.seosiwei.com/zaneDate/index.html

### npm地址：https://www.npmjs.com/package/zane-calendar

### vue组件npm地址 支持vue1.0,vue2.0: https://www.npmjs.com/package/vue-date-calendar

### 使用方式


### 浏览器端使用
```
<link href="./dist/zane-calendar.min.css">
<script src="./dist/zane-calendar.min.js"></script>

<!-- 需要加时间插件的输入框 -->
<input type="" name="" id="zane-calendar">

初始化
zaneDate({
	elem:'#zane-calendar',
})

```


### Webpack 使用

```

npm install zane-calendar --save-dev


const zaneDate = require('zane-calendar') 或
import zaneDate from 'zane-calendar'


<!-- 需要加时间插件的输入框 -->
<input type="" name="" id="zane-calendar">


初始化
zaneDate({
	elem:'#zane-calendar',
})

```

### 项目运行方法
```
git clone https://github.com/wangweianger/zane-data-time-calendar.git
npm install
npm run dev
npm run build

```

### 参数说明

参数配置
```
{
	
	elem:'#zane-calendar',   控件的dom原生 注意：仅限制于id选择器
	type:'day',   可选类型 day year month time doubleday doubleyear doublemonth doubletime
	lang:'cn',   可选择语言类型 cn , en 
	width:280,  		插件宽度配置   250 <= X <= 500
	height:300, 		插件高度配置   250 <= X <= 350
	behindTop:10,   	插件于输入框的高度 
	format:'yyyy-MM-dd HH:mm:ss',  时间格式化
	begintime:'',  				开始时间  （单选择器默认选择此项）
	endtime:'',                 结束时间  （double选择器需要）
	min:'',  可选取时间最小范围 1900-10-01
	max: '',  可选取时间最大范围 2099-12-31
	position:'fixed',  定位方式  暂时只支持 fixed
	event:'click',   事件方式 暂时只支持 click 
	zindex:100,   z-index值
	showtime:true,  是否显示选择时间
	showclean:true,  是否显示清除按钮
	shownow:true,  是否显示当前按钮
	showsubmit:true, 是否显示提交按钮
	haveBotBtns:true, 是否有底部按钮列表
	calendarName:'', 此参数勿动 表示当前时间插件实例化对象
	mounted:()=>{}, 插件加载完成之后调用
	change:(fulltime,begintime,endtime)=>{}, 时间变更之后调用
	done:(fulltime,begintime,endtime)=>{}, 选择完成之后调用
}	


```
### 案例调用方式

```
	默认完整选项
	zaneDate({
		elem:'#zane-calendar',
	})

	只选择年月日
	zaneDate({
		elem:'#zane-calendar',
		showtime:false,
	})

	使用英文
	zaneDate({
		elem:'#zane-calendar',
		lang:'en',
	})

	只选择年
	zaneDate({
		elem:'#zane-calendar',
		type:'year',
	})

	只选择月
	zaneDate({
		elem:'#zane-calendar',
		type:'month',
	})

	只选择时间
	zaneDate({
		elem:'#zane-calendar',
		type:'time',
	})

	格式化方式
	zaneDate({
		elem:'#zane-calendar',
		format:'yyyy年MM月dd日 HH时mm分ss秒',
	})

	限定能选择的最小最大区间
	zaneDate({
		elem:'#zane-calendar',
		min:'2017-08-01',
		max:'2017-08-20',
	})

	......

	具体的请查看demo

```

### 1.1.0 版本新增 double选择器 

```
config.type  新增double类型  可选类型如下：day year month time doubleday doubleyear doublemonth doubletime

双日期范围选择
zaneDate({
	elem:'#demo21',
	type:'doubleday'
})

双年范围选择
zaneDate({
	elem:'#demo22',
	type:'doubleyear',
})

双月范围选择
zaneDate({
	elem:'#demo23',
	type:'doublemonth',
})

双时间选择
zaneDate({
	elem:'#demo24',
	type:'doubletime',
})


```

### 1.2.0 版本
### 1.doubleday类型新增选择时间，支持时分秒选择
### 2.double类型检测距离右边window边线的距离，若不足，自动排列为上下两个日期

```
config.type doubleday支持选择时间范围

双日期范围选择
zaneDate({
	elem:'#demo25',
	format:'yyyy-MM-dd HH:mm:ss',
	type:'doubleday',
	showtime:true
})

```

### 1.2.1 版本  新增z-index 参数
```
zaneDate({
	elem:'#zane-calendar',
	zindex:500,
})

```













