# zane-data-time-calendar
时间日历插件

### 说明：
此插件不依赖任何第三方插件，因此可以在任何地方单独使用
插件不兼容低版本的IE浏览器，IE浏览器请慎重使用
暂时只支持单个时间段选择，后期会推出多个时间段选择方式。

###项目运行方法
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
	//控件的dom原生 注意：仅限制于id选择器
	elem:'#zane-calendar',

	//可选类型day year month time datetime
	type:'day', 

	//可选择语言类型 cn , en 
	lang:'cn', 

	// 插件宽度配置
	width:280,

	// 时间格式化
	format:'yyyy-MM-dd HH:mm:ss',

	// 插件初始默认值
	value:'',

	// 可选取时间最小范围
	min:'', //'1900-10-01',

	// 可选取时间最大范围
	max: '', //'2099-12-31',

	// 定位方式  暂时只支持 fixed
	position:'fixed', 

	//事件方式 暂时只支持 click 
	event:'click',  

	//是否显示选择时间
	showtime:true, 

	//是否显示清除按钮
	showclean:true, 

	//是否显示当前按钮
	shownow:true, 

	//是否显示提交按钮
	showsubmit:true,

	// 是否有底部按钮列表
	haveBotBtns:true,

	//此参数勿动 表示当前时间插件实例化对象
	calendarName:'',

	// 插件加载完成之后调用
	mounted:()=>{},

	//时间变更之后调用
	change:()=>{},

	//选择完成之后调用
	done:()=>{},
}	

```
### 案例调用方式

```
	<!-- 默认完整选项 -->
	zaneDate({
		elem:'#zane-calendar',
	})

```
















