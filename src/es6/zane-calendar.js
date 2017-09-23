/*!
 * zaneDate Javascript Library 1.0.0
 * https://github.com/wangweianger/zane-data-time-calendar
 * Date : 2017-09-22
 * auther :zane
 */
;( function( global, factory ) {
	"use strict";
	if ( typeof module === "object" && typeof module.exports === "object" ) {
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "zaneDate requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

if(noGlobal) require ('./zane-calendar.css')

if(!new Date().Format){
	Date.prototype.Format = function (fmt) { //author: meizz 
	    var o = {
	        "M+": this.getMonth() + 1, //月份 
	        "d+": this.getDate(), //日 
	        "h+": this.getHours(), //小时 
			"H+":this.getHours()>12?this.getHours()-12:this.getHours(),
	        "m+": this.getMinutes(), //分 
	        "s+": this.getSeconds(), //秒 
	        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
	        "S": this.getMilliseconds() //毫秒 
	    };
	    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	    for (var k in o)
	    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	    return fmt;
	}
};

// 日期插件
class calendar{
	constructor(json={}){
		this.config={
			//控件的dom原生仅限制于id
			elem:'#zane-calendar',
			//day year month time datetime
			type:'day', 
			//absolute , fixed   
			position:'fixed', 
			//cn , en 
			lang:'cn', 
			// 宽度
			width:280,
			// 格式化
			format:'yyyy-MM-dd',
			// 初始默认值
			value:'',
			// 可选取时间最小范围
			min:'', //'1900-10-01',
			// 可选取时间最大范围
			max: '', //'2099-12-31',
			//事件方式 click 
			event:'click',  
			//是否显示选择时间
			showtime:false,  
			//是否显示清除按钮
			showclean:true, 
			//是否显示当前按钮
			shownow:true,  
			//是否显示提交按钮
			showsubmit:true,
			// 是否有底部按钮列表
			haveBotBtns:true,
			calendarName:'',
			isDouble:false,
			// 插件加载完成之后调用
			mounted:()=>{},
			//时间变更之后调用
			change:()=>{},
			//选择完成之后调用
			done:()=>{},
		}

		this.config = this.extend(this.config,json);
		//校验时间格式
		if(isNaN(new Date(this.config.value)))this.config.value = ''
		if(isNaN(new Date(this.config.min)))this.config.min = ''
		if(isNaN(new Date(this.config.max)))this.config.max = ''

		this.obj={
			input:document.querySelector(this.config.elem),
			calendar:null,
			id:`#zane-calendar-${this.config.calendarName}`,
			$obj:null,
			fulldatas:{},
			$noDoubleObj:null,
			isDoubleOne:false,
			handleType:'date',
			initVal:'',//每次进来的初始值
			//插件于输入框的高度 
			behindTop:10,
			calendarHeight:307,
			// 选择年时展示的数量
			totalYear:18,
			cn:{
		        weeks: ['日', '一', '二', '三', '四', '五', '六'],
		        time: ['时', '分', '秒'],
		        timeTips: '选择时间',
		        startTime: '开始时间',
		        endTime: '结束时间',
		        dateTips: '返回日期',
		        month: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
		        tools: {
		          	confirm: '确定',
		          	clear: '清空',
		          	now: '现在'
		        }
		     },
		     en:{
		        weeks: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
		        time: ['Hours', 'Minutes', 'Seconds'],
		        timeTips: 'Select Time',
		        startTime: 'Start Time',
		        endTime: 'End Time',
		        dateTips: 'Select Date',
		        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		        tools: {
		          	confirm: 'Confirm',
		          	clear: 'Clear',
		          	now: 'Now'
		        }
		      }
		}

		this.vision = '1.0.0'
		this.auther = 'zane'	

		this.obj.lang = this.obj[this.config.lang];

		if(this.config.type == 'year' || this.config.type == 'month'){
			this.config.haveBotBtns = false;
		}

		if(this.config.type == 'time'){
			this.config.showtime =false;
		}

		// 初始化
		this.init();
	}

	init(){
		this.on(this.obj.input,this.config.event, (e)=>{
			e.preventDefault();
			e.stopPropagation();

			if(!this.obj.calendar){//没有calendar为第一次生成
				// double 赋值
				this.obj.isDoubleOne = this.config.calendarName.indexOf('DOUBLE') != -1?true:false;
				if(this.obj.isDoubleOne ){
					let noDoubleObj 		=  this.config.calendarName.replace(/DOUBLE/,'')
					this.obj.$noDoubleObj 	=  window[noDoubleObj];
					window[noDoubleObj].obj.$noDoubleObj = this;
				};

				// 获得年月日
				let html 	= this.objHTML();//生成时间选择器HTML
				var divElement = document.createElement("div");
				divElement.innerHTML = html
				document.body.appendChild(divElement)
				
				this.$obj 	= document.querySelector(this.obj.id);

				switch(this.config.type){
					case 'day':
						this.judgeCalendarRender('day',this.config.value)
						break;
					case 'year':
						this.getYearHtml();
						break;
					case 'month':
						this.getMonthHtml();
						break;
					case 'time':
						this.getTimeHtml();
						break;			
				}
				
				//定位并显示选择器
				this.elemEventPoint(e);
				this.documentClick();
				this.calendarClick(); 

			}else{
				this.elemEventPoint(e);//定位并显示选择器
			};
			this.obj.initVal = this.obj.input.value;

			// 隐藏其他时间插件框
			let objs = document.querySelectorAll('.zane-calendar');
			this.forEach(objs,(index,item)=>{
				if(('#'+item.getAttribute('id')).replace(/DOUBLE/,'') !== this.obj.id.replace(/DOUBLE/,'') ){
					item.style.display 	= 	"none";
				}
			})
		});
		this.config.mounted&&this.config.mounted();
	}
	
	//生成时间选择器区域
	objHTML(json){
		let html =`<div class="zane-calendar" style="width:${this.config.width}px;" id="${this.obj.id.substring(1)}">
					<div class="zane-calendar-one left" style="width:${this.config.width}px;">
						<div class="top">
							<div class="common-top top-check-day"></div>
							<div class="common-top top-check-year"></div>	
							<div class="common-top top-check-month"></div>	
							<div class="common-top top-check-time"></div>		
						</div>
						<div class="main">
							<div class="common-main main-check-day"></div>
							<div class="common-main main-check-year"></div>
							<div class="common-main main-check-month"></div>
							<div class="common-main main-check-time"></div>
						</div>
						<div class="bottom" style="display:${this.config.haveBotBtns||this.config.isDouble?'block':'none'};
												border-left:${this.obj.isDoubleOne?'none':'solid 1px #ddd'};">
							<div class="btn-select-time" style="display:${this.config.showtime?'blcok':'none'}">
								<div class="left button btn-select-time-item" onclick="${this.config.calendarName}.getTimeHtml()">${this.obj.lang.timeTips}</div>
							</div>	
				 			<div class="right">
								<div class="button ${this.config.shownow?'no-right-line':''}" 
									style="display:${this.config.showclean?'blcok':'none'}"
									onclick="${this.config.calendarName}.cleanInputVal()">${this.obj.lang.tools.clear}</div>
								<div class="button ${this.config.showsubmit?'no-right-line':''}"
									style="display:${this.config.shownow?'blcok':'none'}" 
									onclick="${this.config.calendarName}.changeToToday()">${this.obj.lang.tools.now}</div>
								<div class="button" 
									style="display:${this.config.showsubmit?'blcok':'none'}"
									onclick="${this.config.calendarName}.makeSureSelectTime()">${this.obj.lang.tools.confirm}</div>
							</div>
						</div>
					</div>
				</div>`
		return html
	}
	// day - top html   时间选择器选择年月块
	topCheckDayHTML(json){
		let html =`	
		<div onclick="${this.config.calendarName}.preMonth(${json.year},${json.month})" class="icom left"></div>`
		if (this.config.lang == 'cn'){
			html += `<div class="center">
				<span onclick="${this.config.calendarName}.getYearHtml(${json.year})">${json.year}年</span>
				<span onclick="${this.config.calendarName}.getMonthHtml(${json.month})">${json.month}月</span>
			</div>`
		}else{
			html += `<div class="center">
				<span onclick="${this.config.calendarName}.getMonthHtml(${json.month})">${this.weekToEn(json.month)}</span>
				<span onclick="${this.config.calendarName}.getYearHtml(${json.year})">${json.year}</span>
			</div>`
		}
		html +=`<div onclick="${this.config.calendarName}.nextMonth(${json.year},${json.month})" class="icom right"></div>`
		
		return html;
	}

	// day - main html 时间选择器选择日期块
	mainCheckDayHTML(json){
		let html =`
		<div class="week-day"><table class="day" border="0" cellspacing="0">
			<tr>`
			for (let j = 0,len = 7; j<len; j++){
				html += `<th>${this.obj.lang.weeks[j]}</th>`
			}
		html +=`</tr>`
			for (let i = 0,len=json.datalist.length; i < len; i++) {
				let className = json.datalist[i].class||"";
				if(json.datalist[i].day === parseInt(json.today)&&json.datalist[i].daytype==='now'){
					className+=` active`
					
				}
				//如果超出min时间或者max时间的，给禁止选中样式
				if((this.config.min!='' && new Date(json.datalist[i].fullday).getTime()<new Date(this.config.min).getTime()) || (this.config.max!='' && new Date(json.datalist[i].fullday).getTime()>new Date(this.config.max).getTime())){
					className+=` calendar-disabled`
				}

				if(i == 0){
					html+=`<tr><td data-time="${json.datalist[i].fullday}" class="${className}">${json.datalist[i].day}</td>`;
				}else if(i == len-1){
					html+=`<td data-time="${json.datalist[i].fullday}" class="${className}">${json.datalist[i].day}</td></tr>`;
				}else{
					if((i+1)%7 == 0){
						html+=`<td data-time="${json.datalist[i].fullday}" class="${className}">${json.datalist[i].day}</td></tr><tr>`;
					}else{
						html+=`<td data-time="${json.datalist[i].fullday}" class="${className}">${json.datalist[i].day}</td>`;
					}
				}
			}

		html+=`</table></div>`
		return html;
	}

	// year - top html 时间选择器选择年份状态头部
	topCheckYearHTML(json){
		let html=`
		<div class="icom left" onclick="${this.config.calendarName}.perYear(${json.nowyear})"></div>
		<div class="center">
			<span>${json.firstYear}${this.config.lang=='cn'?'年':''}</span>-
			<span>${json.lastYear}${this.config.lang=='cn'?'年':''}</span>
		</div>
		<div class="icom right" onclick="${this.config.calendarName}.nextYear(${json.nowyear})"></div>`
		return html;
	}
	// year - main html 时间选择器选择年份状态内容块
	mainCheckYearHTML(json){
		let html=`<div class="week-day">
			<table class="day" border="0" cellspacing="0">`
				for (let i = 0,len=json.datalist.length; i < len; i++) {
					let className = json.datalist[i].class||"";
					if(json.datalist[i].year === json.nowyear){
						className+=` active`
					}
					if(i == 0){
						html+=`<tr><td data-year="${json.datalist[i].year}" class="${className}">${json.datalist[i].year}${this.config.lang=='cn'?'年':''}</td>`;
					}else if(i == len-1){
						html+=`<td data-year="${json.datalist[i].year}" class="${className}">${json.datalist[i].year}${this.config.lang=='cn'?'年':''}</td></tr>`;
					}else{
						if((i+1)%3 == 0){
							html+=`<td data-year="${json.datalist[i].year}" class="${className}">${json.datalist[i].year}${this.config.lang=='cn'?'年':''}</td></tr><tr>`;
						}else{
							html+=`<td data-year="${json.datalist[i].year}" class="${className}">${json.datalist[i].year}${this.config.lang=='cn'?'年':''}</td>`;
						}
					}
				}
		html+=`</table>
		</div>`
		return html;
	}

	// month -top html 时间选择器选择月份头部
	topCheckMonthHTML(json){
		let html=`
		<div class="icom left" onclick="${this.config.calendarName}.perMonthYear(${json.year},${json.nowmonth})"></div>
		<div class="center">
			<span>${json.year}年</span>
		</div>
		<div class="icom right" onclick="${this.config.calendarName}.nextMonthYear(${json.year},${json.nowmonth})"></div>`
		return html;	
	}
	// month -main html 时间选择器选择月份状态内容块
	mainCheckMonthHTML(json){
		let html=`<div class="week-day">
			<table class="day" border="0" cellspacing="0">`
				for (let i = 0,len=json.datalist.length; i < len; i++) {
					let className = json.datalist[i].class||"";
					if((i+1) === json.nowmonth){
						className+=` active`
					}
					if(i == 0){
						html+=`<tr><td data-month="${i+1}" data-year="${json.year}" class="${className}">${json.datalist[i]}</td>`;
					}else if(i == len-1){
						html+=`<td data-month="${i+1}" data-year="${json.year}" class="${className}">${json.datalist[i]}</td></tr>`;
					}else{
						if((i+1)%3 == 0){
							html+=`<td data-month="${i+1}" data-year="${json.year}" class="${className}">${json.datalist[i]}</td></tr><tr>`;
						}else{
							html+=`<td data-month="${i+1}" data-year="${json.year}" class="${className}">${json.datalist[i]}</td>`;
						}
					}
				}
		html+=`</table>
		</div>`
		return html;
	}

	// time -top  html 时间选择器选择时间状态头部
	topCheckTimeHTML(){
		let html=`<div class="center"><span>${this.obj.lang.timeTips}</span></div>`
		return html;	
	}
	// time -main html 时间选择器选择时间状态内容块
	mainCheckTimeHTML(json){
		let html = `<div class="week-day"><ul class="nav"><li>${this.obj.lang.time[0]}</li><li>${this.obj.lang.time[1]}</li><li>${this.obj.lang.time[2]}</li></ul><div class="select-time">
				<ul class="hour">`
				for (let i = 0,len=json.hours.length; i < len; i++) {
					let className='';
					if(json.hours[i] == json.hour) className='active';
					html +=`<li class="${className}" data-time="${json.hours[i]}">${json.hours[i]}</li>`
				}
			html+=`</ul><ul class="minute">`
				for (let i = 0,len=json.minutes.length; i < len; i++) {
					let className='';
					if(json.minutes[i] == json.minute) className='active';
					html +=`<li class="${className}" data-time="${json.minutes[i]}">${json.minutes[i]}</li>`
				}
			html+=`</ul><ul class="second">`
				for (let i = 0,len=json.seconds.length; i < len; i++) {
					let className='';
					if(json.seconds[i] == json.second) className='active';
					html +=`<li class="${className}" data-time="${json.seconds[i]}">${json.seconds[i]}</li>`
				}
			html+=`</ul></div></div>`
		return html;
	}

	// time -bottom html 时间选择器日期/时间切换块
	bottomCheckTimeHTML(){
		let html = '';
		if(this.obj.handleType === 'time'){
			html+= `<div class="left button" onclick="${this.config.calendarName}.backDateHtml()">${this.obj.lang.dateTips}</div>`
		}else{
			html+= `<div class="left button" onclick="${this.config.calendarName}.getTimeHtml()">${this.obj.lang.timeTips}</div>`
		}
		return html;
	}

	// 插件位置定位并显示
	elemEventPoint(e){
		this.obj.calendar = this.$obj;
		let screenClientHeight 	= document.documentElement.clientHeight
		let screenScrolTop	 	= document.documentElement.scrollTop
		let objOffsetTop		= e.target.offsetTop
		let objOffsetLeft		= e.target.offsetLeft
		let objOffsetHeight		= e.target.offsetHeight
		let objBotton = screenClientHeight-(objOffsetTop+objOffsetHeight+this.obj.behindTop-screenScrolTop)
		this.obj.calendar.style.display = 'block';
		this.obj.calendarHeight = this.$obj.offsetHeight
		// 设置插件point位置
		if(this.obj.isDoubleOne){
			this.obj.calendar.style.left 	=	objOffsetLeft+this.config.width+'px';
		}else{
			this.obj.calendar.style.left 	=	objOffsetLeft+'px';
		};
		
		objBotton > this.obj.calendarHeight?
			//插件在input框之下 
			this.obj.calendar.style.top = objOffsetTop+objOffsetHeight+this.obj.behindTop+'px':
			//插件在input框之上
			this.obj.calendar.style.top = objOffsetTop-this.obj.behindTop-this.obj.calendarHeight+'px';
	}

	// 插件数据渲染
	getTimeDates(deraultDay,clickType){
		let timeDatas 	= [];
		let date    	= deraultDay?new Date(deraultDay):new Date()
		let year		= date.getFullYear()
		let month   	= date.getMonth()+1
		let toDate  	= date.getDate()
		let weekday 	= date.getDay()
		let hour 		= date.getHours()
		let minute 		= date.getMinutes()
		let second 		= date.getSeconds()

		// double 处理
		if(this.config.isDouble&&this.obj.isDoubleOne&&clickType!='pre'){
			if(month >= 12){
				year 	= year + 1;
				month 	= 1;
			}else{
				month = month + 1;
			}
		}else if(this.config.isDouble&&!this.obj.isDoubleOne&&clickType=='pre'){
			if(month <= 1){
				year 	= year - 1;
				month 	= 12;
			}else{
				month = month - 1;
			}
		}

		month 			= (month+'').length<2? '0'+month : month;
		toDate 			= (toDate+'').length<2? '0'+toDate : toDate;
		hour 			= (hour+'').length<2? '0'+hour : hour;
		minute 			= (minute+'').length<2? '0'+minute:minute;
		second 			= (second+'').length<2? '0'+second:second;

		// 计算当前这个月的天数
		let monTotalDay = new Date(year,month,0).getDate()

		// 计算第一天是周几
		let firstDayMeek = new Date(`${year}/${month}/1`).getDay()
		let lastDayMeek  = new Date(`${year}/${month}/${monTotalDay}`).getDay()
		let preweek	 = null;
		let preday      = null;	
		// 计算需要补充的时间
		if(firstDayMeek>0){
			let preMonTotalDay =  new Date(year,month-1,0).getDate()
			let preyear  = year;
			let premonth = month-1;
			if(premonth === 0){
				preyear = year-1;
				premonth = 12;
			}	
			for (var i = 0,len=firstDayMeek; i < len; i++) {
				let day 	= preMonTotalDay-i;
				premonth 	= (premonth+'').length<2?'0'+premonth:premonth;
				day 		= (day+'').length<2?'0'+day:day;

				timeDatas.push({
					day:preMonTotalDay-i,
					week:len-1-i,
					class:'light',
					daytype:`pre`,
					fullday:`${preyear}/${premonth}/${day}`
				})
			}
		}
		timeDatas = timeDatas.reverse();
		for (let i = 0,len=monTotalDay; i < len; i++) {
			let weekday 	= (firstDayMeek+i)%7;
			let premonth 	= month;
			let day 		= i+1
				premonth 	= (premonth+'').length<2?'0'+premonth:premonth;
				day 		= (day+'').length<2?'0'+day:day;

			timeDatas.push({
				day:i+1,
				week:weekday,
				daytype:`now`,
				fullday:`${year}/${premonth}/${day}`
			})
			if(i === len-1){
				preweek 	= weekday;
				preday 		= i+1;
			}
		}

		let totalLength 	= timeDatas.length;
		let haveNeedLength 	= 42-totalLength;

		let preyear  	= year;
		let premonth 	= parseInt(month)+1;
		if(premonth === 13){
			preyear  	= year+1;
			premonth 	= 1;
		}

		for (var i = 0; i < haveNeedLength; i++) {
			let weekday = (preweek+1+i)%7;
			let day 	= i+1;
				premonth 	= (premonth+'').length<2?'0'+premonth:premonth;
				day 		= (day+'').length<2?'0'+day:day;

			timeDatas.push({
				day:i+1,
				week:weekday,
				class:'light',
				daytype:`next`,
				fullday:`${preyear}/${premonth}/${day}`
			})
		}
		return {
			year:year,
			month:month,
			today:toDate,
			hour:hour,
			minute:minute,
			second:second,
			datalist:timeDatas
		}
	}

	// 选择上一月
	preMonth(year,month){
		month = month-1
		if(month == 0) {
			month 	= 12;
			year 	= year-1
		}
		let fulldate 	= `${year}/${month}/${this.obj.fulldatas.today}`
		this.judgeCalendarRender('day',fulldate,true,'pre')
	}

	// 选择下一月
	nextMonth(year,month){
		month = month+1
		if(month == 13) {
			month 	= 1;
			year 	= year+1
		}
		let fulldate 	= `${year}/${month}/${this.obj.fulldatas.today}`
		this.judgeCalendarRender('day',fulldate,true)
	}

	// 获得年月日,如果showtime=true,日期加样式，如果为false,直接设置当前选择的日期
	getDay(){
		let _this=this;
		let objs = this.$obj
		.querySelector('.main-check-day').querySelectorAll('td');
		// 绑定单击
		this.on(objs,'click',function(e){
			if(!_this.hasClass(e.target,'calendar-disabled')){//有calendar-disabled样式的不赋予事件
				let dataTime 				= 	this.getAttribute('data-time');
				let arr 					=	dataTime.split('/')
				_this.obj.fulldatas.year 	=	arr[0]
				_this.obj.fulldatas.month 	=	arr[1]
				_this.obj.fulldatas.today 	=	arr[2]

				//选择具体日期添加样式
				_this.forEach(objs,(index,item)=>{
					_this.removeClass(item,'active');
				})
				_this.addClass(this,'active');

				// double 处理
				if(!_this.config.showtime && !_this.config.isDouble){
					let value = `${_this.obj.fulldatas.year}/${_this.obj.fulldatas.month}/${_this.obj.fulldatas.today}`
					_this.getYearMonthAndDay(value,true)
				}
			}
		})
		// 绑定双击
		this.on(objs,'dblclick',function(e){
			if(e.type === 'dblclick') _this.makeSureSelectTime();
		})
	}

	// 获得年html
	getYearHtml(year,isreset,clickType){
		year = year || new Date().getFullYear();
		year = parseInt(year)

		// double 处理
		if(this.config.isDouble&&this.obj.isDoubleOne&&clickType!='pre'){
			year 	= year + 1;
		}else if(this.config.isDouble&&!this.obj.isDoubleOne&&clickType=='pre'){
			year 	= year - 1;
		}

		let yearDatas 	= {
			nowyear:year,
			datalist:[]
		};
		for (var i = 0; i < this.obj.totalYear; i++) {
			let getyear = year-Math.floor(this.obj.totalYear/2)+i
			if(i === 0) yearDatas.firstYear = getyear;
			if(i === this.obj.totalYear-1) yearDatas.lastYear = getyear;
			yearDatas.datalist.push({
				class:'',
				year:getyear
			})
		}

		this.obj.fulldatas.year = this.config.isDouble?yearDatas.nowyear:''

		this.judgeCalendarRender('year',yearDatas,isreset,clickType);
	}

	// 上一年
	perYear(year){
		year = year-this.obj.totalYear
		this.getYearHtml(year,true,'pre')
	}

	// 下一年
	nextYear(year){
		year = year+this.obj.totalYear
		this.getYearHtml(year,true)
	}

	// 获得年
	getYear(){
		let _this = this;
		let objs = this.$obj
		.querySelector('.main-check-year').querySelectorAll('td');
		this.on(objs,'click',function(e){
			let year = e.target.getAttribute('data-year')

			//选择具体日期添加样式
			_this.forEach(objs,(index,item)=>{
				_this.removeClass(item,'active');
			})
			_this.addClass(this,'active');

			let fulldate 	= `${year}/${_this.obj.fulldatas.month}/${_this.obj.fulldatas.today}`
			if(_this.config.type === 'year'){
				_this.config.isDouble ? _this.obj.fulldatas.year = year : _this.getYearMonthAndDay(year,false)
			}else{
				//double 处理
				let clickType = _this.obj.isDoubleOne?'pre':'';
				_this.judgeCalendarRender('day',fulldate,true,clickType)
			}
		})
	}

	// 获得month html
	getMonthHtml(month){
		let date 	= new Date();
		let year 	= this.obj.fulldatas.year || date.getFullYear();
		month 		= month || date.getMonth()+1
		let monthDatas 	= {
			nowmonth:month,
			year:year,
			datalist:this.obj.lang.month
		};
		this.obj.fulldatas.month = this.config.isDouble?monthDatas.nowmonth:''
		this.judgeCalendarRender('month',monthDatas);
	}

	// 上一月
	perMonthYear(year,month){
		let monthDatas 	= {
			nowmonth:month,
			year:year-1,
			datalist:this.obj.lang.month
		};
		this.judgeCalendarRender('month',monthDatas);
	}

	// 下一月
	nextMonthYear(year,month){
		let monthDatas 	= {
			nowmonth:month,
			year:year+1,
			datalist:this.obj.lang.month
		};
		this.judgeCalendarRender('month',monthDatas);
	}

	// 获得月
	getMonth(){
		let _this = this;
		let objs = this.$obj
		.querySelector('.main-check-month').querySelectorAll('td');
		this.on(objs,'click',function(e){
			let year 	= e.target.getAttribute('data-year')
			let month 	= e.target.getAttribute('data-month')

			//选择具体日期添加样式
			_this.forEach(objs,(index,item)=>{
				_this.removeClass(item,'active');
			})
			_this.addClass(this,'active');

			let fulldate 	= `${year}/${month}/${_this.obj.fulldatas.today}`
			if(_this.config.type === 'month'){
				_this.config.isDouble ? _this.obj.fulldatas.month = month : _this.getYearMonthAndDay(month,false)

			}else{
				_this.judgeCalendarRender('day',fulldate)
			}
		})
	}

	// 选择时间
	getTimeHtml(){
		let date 	= new Date();
		let hour 	= date.getHours();
		let minute 	= date.getMinutes();
		let second 	= date.getSeconds();
		hour 			= (hour+'').length<2? '0'+hour : hour;
		minute 			= (minute+'').length<2? '0'+minute:minute;
		second 			= (second+'').length<2? '0'+second:second;

		this.obj.fulldatas.hour = this.obj.fulldatas.hour||hour
		this.obj.fulldatas.minute = this.obj.fulldatas.hour||minute
		this.obj.fulldatas.second = this.obj.fulldatas.hour||second

		let datas ={
			hour:this.obj.fulldatas.hour,
			minute:this.obj.fulldatas.minute,
			second:this.obj.fulldatas.second,
			hours:[],
			minutes:[],
			seconds:[]
		}
		for (var i = 0; i < 24; i++) {
			if(i<10){
				datas.hours.push('0'+i)
			}else{
				datas.hours.push(i+'')
			}
		}
		for (var i = 0; i < 60; i++) {
			if(i<10){
				datas.minutes.push('0'+i)
				datas.seconds.push('0'+i)
			}else{
				datas.minutes.push(i+'')
				datas.seconds.push(i+'')
			}
		}
		this.judgeCalendarRender('time',datas);
	}

	// 选择时间
	selectTime(){
		let _this 		= this
		let hourObjs 	= this.$obj.querySelector('ul.hour').querySelectorAll('li')
		let minuteObjs 	= this.$obj.querySelector('ul.minute').querySelectorAll('li')
		let secondObjs 	= this.$obj.querySelector('ul.second').querySelectorAll('li')
		
		this.on(hourObjs,'click',function(e){
			_this.forEach(hourObjs,(index,item)=>{
				_this.removeClass(item,'active');
			})
			_this.addClass(this,'active');
			_this.obj.fulldatas.hour = this.getAttribute('data-time');
		})

		this.on(minuteObjs,'click',function(e){
			_this.forEach(minuteObjs,(index,item)=>{
				_this.removeClass(item,'active');
			})
			_this.addClass(this,'active');
			_this.obj.fulldatas.minute = this.getAttribute('data-time');
		})

		this.on(secondObjs,'click',function(e){
			_this.forEach(secondObjs,(index,item)=>{
				_this.removeClass(item,'active');
			})
			_this.addClass(this,'active');
			_this.obj.fulldatas.second = this.getAttribute('data-time');
		})
	}

	// 返回日期
	backDateHtml(){
		this.obj.handleType = 'date';
		let bottomHTML  = this.bottomCheckTimeHTML();
		this.$obj.querySelector('.btn-select-time').innerHTML = bottomHTML;
		this.showOrHide(this.$obj.querySelectorAll('.common-top'),'hide')
		this.showOrHide(this.$obj.querySelectorAll('.common-main'),'hide')
		this.$obj.querySelector('.main-check-day').style.display = 'block'
		this.$obj.querySelector('.top-check-day').style.display = 'block'
	}

	// 今天
	changeToToday(){
		let json 		= 	this.getTimeDates();
		let value 		=	null;
		let isFormat 	= true;
		if(this.config.showtime){
			value = `${json.year}/${json.month}/${json.today} ${json.hour}:${json.minute}:${json.second}`
		}else if(this.config.type == 'time'){
			isFormat 	= false;
			value = `${json.hour}:${json.minute}:${json.second}`
		}else{
			value = `${json.year}/${json.month}/${json.today}`
		}
		this.getYearMonthAndDay(value,isFormat)
	}

	// 清空
	cleanInputVal(){
		let value = ""
		this.getYearMonthAndDay(value,false)
	}

	// 确定
	makeSureSelectTime(){
		let value 		= null;
		let isFormat 	= true;
		if(this.config.showtime){
			// double 处理
			if(this.config.isDouble){
				console.log('------')
			}else{
				value = `${this.obj.fulldatas.year}/${this.obj.fulldatas.month}/${this.obj.fulldatas.today} ${this.obj.fulldatas.hour}:${this.obj.fulldatas.minute}:${this.obj.fulldatas.second}`					
			}
		}else if(this.config.type == 'time'&&!this.config.isDouble){
			isFormat 	= false;
			value = `${this.obj.fulldatas.hour}:${this.obj.fulldatas.minute}:${this.obj.fulldatas.second}`
		}else{
			//doubule 处理
			if(this.config.isDouble){
				let noDoubleData 	=  this.obj.$noDoubleObj.obj.fulldatas;
				let noDoubleStr,haveDoubleStr

				switch(this.config.type){
					case 'day':
						noDoubleStr		=  `${noDoubleData.year}/${noDoubleData.month}/${noDoubleData.today}`
						haveDoubleStr	=  `${this.obj.fulldatas.year}/${this.obj.fulldatas.month}/${this.obj.fulldatas.today}`
						break;
					case 'year':
						isFormat = false
						noDoubleStr 	=  `${noDoubleData.year}`
						haveDoubleStr 	=  `${this.obj.fulldatas.year}`
						break;
					case 'month':
						isFormat = false
						noDoubleStr 	=  `${noDoubleData.month}`
						haveDoubleStr 	=  `${this.obj.fulldatas.month}`
						break;	
					case 'time' :		
						isFormat = false
						noDoubleStr 	=  `${noDoubleData.hour}:${noDoubleData.minute}:${noDoubleData.second}`
						haveDoubleStr 	=  `${this.obj.fulldatas.hour}:${this.obj.fulldatas.minute}:${this.obj.fulldatas.second}`
						break;		
				};
				value					=  noDoubleStr +'|'+ haveDoubleStr
			}else{
				value = `${this.obj.fulldatas.year}/${this.obj.fulldatas.month}/${this.obj.fulldatas.today}`
			}
		}
		this.getYearMonthAndDay(value,isFormat)
	}

	// 确定年月日的值并在input里面显示，时间选择器隐藏
	getYearMonthAndDay(datatime,isFormat=true){
		let formatTime = null;
		//doubule 处理
		if(datatime&&datatime.indexOf('|') != -1){
			let arr 	= datatime.split('|');
			let val1 	= null
			let val2 	= null
			if(isFormat){
				val1 = new Date(arr[0]).Format(this.config.format)
				val2 = new Date(arr[1]).Format(this.config.format)
			}else{
				val1 = arr[0]
				val2 = arr[1]
			}
			formatTime = val1 +' - '+ val2
		}else{
			formatTime = isFormat?new Date(datatime).Format(this.config.format):datatime;
		}
		 
		if(this.obj.input.nodeName !== 'INPUT'){
			this.obj.input.textContent	=	formatTime;
		}else{
			this.obj.input.value  		= formatTime;
		}

		this.$obj.style.display 	= 	"none";
		//doubule 处理
		if(this.obj.isDoubleOne) document.querySelector(this.obj.$noDoubleObj.obj.id).style.display = "none";

		this.config.done&&this.config.done(formatTime);
		if(this.obj.initVal!=formatTime&&this.config.change)this.config.change(formatTime)
	}

	// 判断插件渲染类型 day | year | month | time
	judgeCalendarRender(type,any,isreset,clickType){
		let mainHTML,topHTML,bottomHTML
		switch(type){
			case 'day':
				this.obj.handleType = 'day';
				let json 			= this.getTimeDates(any,clickType);
				this.obj.fulldatas 	= json;
				// double 处理
				this.compareSize(isreset,clickType);
				
				topHTML 			= this.topCheckDayHTML(json)
				mainHTML 			= this.mainCheckDayHTML(json);
				this.$obj.querySelector('.top-check-day').innerHTML = topHTML;
				this.$obj.querySelector('.main-check-day').innerHTML = mainHTML;
				this.showOrHide(this.$obj.querySelectorAll('.common-top'),'hide')
				this.showOrHide(this.$obj.querySelectorAll('.common-main'),'hide')
				this.$obj.querySelector('.main-check-day').style.display = 'block'
				this.$obj.querySelector('.top-check-day').style.display = 'block'
				// 计算表格高度
				this.countHeight('.main-check-day',7);
				this.getDay();
				break;
			case 'year':
				this.obj.handleType = 'year';
				// double 处理
				this.compareSize(isreset,clickType);

				mainHTML 	= this.mainCheckYearHTML(any);
				topHTML		= this.topCheckYearHTML(any);
				this.$obj.querySelector('.main-check-year').innerHTML = mainHTML;
				this.$obj.querySelector('.top-check-year').innerHTML = topHTML;
				this.showOrHide(this.$obj.querySelectorAll('.common-top'),'hide')
				this.showOrHide(this.$obj.querySelectorAll('.common-main'),'hide')
				this.$obj.querySelector('.main-check-year').style.display = 'block'
				this.$obj.querySelector('.top-check-year').style.display = 'block'
				// 计算表格高度
				this.countHeight('.main-check-year',6);
				this.getYear();
				break;	
			case 'month':
				this.obj.handleType = 'month';
				mainHTML 	= this.mainCheckMonthHTML(any);
				topHTML		= this.topCheckMonthHTML(any);
				this.$obj.querySelector('.main-check-month').innerHTML = mainHTML;
				this.$obj.querySelector('.top-check-month').innerHTML = topHTML;
				this.showOrHide(this.$obj.querySelectorAll('.common-top'),'hide')
				this.showOrHide(this.$obj.querySelectorAll('.common-main'),'hide')
				this.$obj.querySelector('.main-check-month').style.display = 'block'
				this.$obj.querySelector('.top-check-month').style.display = 'block'
				// 计算表格高度
				this.countHeight('.main-check-month',4);
				this.getMonth();
				break;
			case 'time':
				this.obj.handleType = 'time';
				mainHTML 	= this.mainCheckTimeHTML(any);
				topHTML		= this.topCheckTimeHTML();
				bottomHTML  = this.bottomCheckTimeHTML();
				this.$obj.querySelector('.main-check-time').innerHTML = mainHTML;
				this.$obj.querySelector('.top-check-time').innerHTML = topHTML;
				this.$obj.querySelector('.btn-select-time').innerHTML = bottomHTML;
				this.showOrHide(this.$obj.querySelectorAll('.common-top'),'hide')
				this.showOrHide(this.$obj.querySelectorAll('.common-main'),'hide')
				this.$obj.querySelector('.main-check-time').style.display = 'block'
				this.$obj.querySelector('.top-check-time').style.display = 'block'
				let hourScrollTop = this.$obj.querySelector('ul.hour').querySelector('li.active').offsetTop
				let minuteScrollTop = this.$obj.querySelector('ul.minute').querySelector('li.active').offsetTop
				let secondScrollTop = this.$obj.querySelector('ul.second').querySelector('li.active').offsetTop
				this.$obj.querySelector('ul.hour').scrollTop 		= 	hourScrollTop-150
				this.$obj.querySelector('ul.minute').scrollTop 	= 	minuteScrollTop-150
				this.$obj.querySelector('ul.second').scrollTop 	=	secondScrollTop-150
				this.selectTime();
				break;		
		}
		
	}

	// 比较double数据之间的大小，并从新赋值
	compareSize(isreset,clickType){
		if(!isreset) return;
		// double 处理
		let prev = this.obj.fulldatas
		let next = this.obj.$noDoubleObj
		if(this.config.isDouble&&prev&&next){
			next = next.obj.fulldatas
			if(this.obj.isDoubleOne){
				this.getDoubleTime({
					prev:next,
					next:prev,
					clickType:clickType
				})
			}else{
				this.getDoubleTime({
					prev:prev,
					next:next,
					clickType:clickType
				})
			}
		};
	}

	getDoubleTime(json){
		let nextfullstr,prefullstr,perTime,nextTime
		switch(this.config.type){
			case 'day':
				nextfullstr = `${json.prev.year}/${json.prev.month}/${json.prev.today} ${json.prev.hour}:${json.prev.minute}:${json.prev.second}`
				prefullstr = `${json.next.year}/${json.next.month}/${json.next.today} ${json.next.hour}:${json.next.minute}:${json.next.second}`
				perTime 	= new Date(prefullstr).getTime()
				nextTime 	= new Date(nextfullstr).getTime()
				if(perTime >= nextTime-86400000) {
					this.obj.$noDoubleObj.judgeCalendarRender('day',nextTime,false,json.clickType)
				}
				break;
			case 'year':
				perTime = `${json.prev.year}`
				nextTime = `${json.next.year}`
				if(perTime >= nextTime) {
					this.obj.$noDoubleObj.getYearHtml(nextTime,false,json.clickType)
				}
				break;	
		}

	}

	//插件自身点击阻止冒泡
	calendarClick(){
		this.on(this.obj.calendar,'click',(e)=>{
			e.preventDefault();
			e.stopPropagation();	
		})
	} 

	// 继承方法
	extend(obj1,obj2){
		return Object.assign(obj1,obj2);
	}

	hasClass(obj, cls) {  
    	return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));  
	}  
	  
	addClass(obj, cls) {  
	    if (!this.hasClass(obj, cls)) obj.className += " " + cls;  
	}  
	  
	removeClass(obj, cls) {  
	    if (this.hasClass(obj, cls)) {  
	        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');  
	        obj.className = obj.className.replace(reg, ' ');  
	    }  
	} 

	//对象遍历
  	forEach(obj, fn){
	    let key
	    if(typeof fn !== 'function') return this;
	    obj = obj || [];
	    if(Object.prototype.toString.call(obj) == '[object Object]'){
		    for(key in obj){
		        	if(fn.call(obj[key], key, obj[key])) break;
		    }
	    } else if(Object.prototype.toString.call(obj) =='[object NodeList]' || Object.prototype.toString.call(obj) =='[object Array]'){
	      	for(key = 0; key < obj.length; key++){
	        	if(fn.call(obj[key], key, obj[key])) break;
	      	}	
	    }else{
	    	fn.call(obj,0,obj);  
	    }
	    return this;
	  };

	//事件绑定
  	on(obj,eventName, fn){
	    return this.forEach(obj,(index, item)=>{
	      	item.attachEvent ? item.attachEvent('on' + eventName, function(e){
	        	e.target = e.srcElement;
	        	fn.call(item, e);
	      	}) : item.addEventListener(eventName, fn, false);
	    });
	};

	//中英文月份枚举
	weekToEn(val){
		let num = typeof val == 'string'?parseInt(val):val;
		return this.obj.en.month[num-1];
	}

	// 
	showOrHide(obj,type){
		for (var i = 0,len=obj.length; i < len; i++) {
			if(type==='hide'){
				obj[i].style.display = 'none'
			}else{
				obj[i].style.display = 'block'
			}
		}
	}

	//解除事件
  	off(obj,eventName, fn){
    	return this.forEach(obj,(index, item)=>{
	      	item.detachEvent 
	        ? item.detachEvent('on'+ eventName, fn)  
	      	: item.removeEventListener(eventName, fn, false);
    	});
  	};

  	// 计算table tr高度
  	countHeight(elename,length){
  		let mainH  		=  	this.$obj.querySelector('.main').offsetHeight;
  		let trObj		= 	this.$obj.querySelector(elename).querySelectorAll('tr')
  		let itemH 		=  Math.floor(mainH/length)
  		this.forEach(trObj,(index,item)=>{
  			item.style.height = itemH + 'px';
  		})
  	}

  	// document点击隐藏插件
  	documentClick(){
  		this.on(document,'click',(e)=>{
  			if(!this.obj.calendar) return;
  			this.obj.calendar.style.display = 'none';
  		})
  	}
};

// 实例化日期插件 双选择器DOUBLE区分
let zaneDate = function(option){
	option.type = option.type || 'day'
	if(option.type.indexOf('double') != -1){
		option.type = option.type.replace(/double/,'');
		createCalendar({
			showclean:false,
			shownow:false,
			showsubmit:false,
			isDouble:true,
		});
		createCalendar({
			shownow:false,
			showtime:false,
			isDouble:true,
			double:'DOUBLE',
		});
		
	}else{
		createCalendar();
	}
	
	// 新建日期插件
	function createCalendar(json={}){
		let calendarName 		= option.elem.substring(1);
		calendarName 			= calendarName.replace(/[_-]/g,'').toUpperCase();
		option.calendarName 	= json&&json.double ?calendarName+json.double:calendarName;
		if(option.width){
			option.width = option.width<260?260:option.width
			option.width = option.width>500?500:option.width
		}

		let cloneOption = Object.assign(extendDeep(option),json);
		window[option.calendarName] 	= new calendar(cloneOption)
	}
	//深度复制
	function extendDeep(parent, child) {
		child = child || {};
		for(var i in parent) {
			if(parent.hasOwnProperty(i)) {
				if(typeof parent[i] === "object") {
					child[i] = (Object.prototype.toString.call(parent[i]) === "[object Array]") ? [] : {};
					extendDeep(parent[i], child[i]);
				} else {
					child[i] = parent[i];
				}
			}
		}
		return child;
	};
		
}
if ( !noGlobal ) window.zaneDate = zaneDate;

return zaneDate;

});
