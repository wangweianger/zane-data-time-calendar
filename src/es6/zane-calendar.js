/*!
 * zaneDate Javascript Library 1.1.0
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

if(noGlobal) require ('./zane-calendar.min.css')

if(!new Date().Format){
	Date.prototype.Format = function (fmt) { //author: meizz 
	    var o = {
	        "M+": this.getMonth() + 1, //月份 
	        "d+": this.getDate(), //日 
	        "h+": this.getHours()>12?this.getHours()-12:this.getHours(), //小时 
			"H+": this.getHours(),
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

let  doc 	= document,
	query   = 'querySelector',
	quall 	= 'querySelectorAll';

// 日期插件
class calendar{
	constructor(json={}){
		this.config={
			//控件的dom原生仅限制于id
			elem:'#zane-calendar',
			//可选 day year month time doubleday doubleyear doublemonth doubletime
			type:'day', 
			//absolute , fixed   
			position:'fixed', 
			//cn , en 
			lang:'cn', 
			// 宽度
			width:250,
			// 插件高度配置
			height:280,
			//插件于输入框的高度 
			behindTop:10,
			// 格式化
			format:'yyyy/MM/dd', //'yyyy-MM-dd HH:mm:ss'
			// 初始默认值
			value:'',
			// 可选取时间最小范围
			min:'', //'1900-10-01',
			// 可选取时间最大范围
			max: '', //'2099-12-31',
			//事件方式 click 
			event:'click',
			// z-index的值
			zindex:100,  
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
		if(!this.config.value)this.config.value = ''
		if(!this.config.min)this.config.min = ''
		if(!this.config.max)this.config.max = ''

		// 初始化
		this.init();
	}

	// 生成对象obj
	generateCalendarObj(){
		this.obj={
			input:doc[query](this.config.elem),
			calendar:null,
			id:`#zane-calendar-${this.config.calendarName}`,
			$obj:null,
			fulldatas:{},
			$noDoubleObj:null,
			isDoubleOne:false,
			handleType:'date',
			initVal:'',//每次进来的初始值
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

		this.vision = '2.0.9'
		this.auther = 'zane'	

		this.obj.lang = this.obj[this.config.lang];

		if(this.config.type == 'year' || this.config.type == 'month'){
			this.config.haveBotBtns = false;
		}

		if(this.config.type == 'time'){
			this.config.showtime =false;
		}

		// double 处理
		if(this.config.isDouble){
			this.obj.input.nodeName !== 'INPUT'?
				this.obj.input.textContent	=  this.config.doublevalue :
				this.obj.input.value  		=  this.config.doublevalue;
		}else if(!this.config.isDouble){
			this.obj.input.nodeName !== 'INPUT'?
				this.obj.input.textContent	=	this.config.value :
				this.obj.input.value  		=  this.config.value;
		}
	}

	init(){
		this.generateCalendarObj()
		this.on(this.obj.input,this.config.event, (e)=>{
			e.preventDefault();
			e.stopPropagation();

			// 隐藏其他时间插件框
			let objs = doc[quall]('.zane-calendar');
			this.forEach(objs,(index,item)=>{
				if(('#'+item.getAttribute('id')).replace(/DOUBLE/,'') !== this.obj.id.replace(/DOUBLE/,'') ){
					this.removeCalendar()
				}
			})


			let obj = doc[query](this.obj.id);

			if(obj){
				this.obj.calendar 	= obj;
				this.$obj 			= obj;
			};

			
			// double 赋值
			this.obj.isDoubleOne = this.config.calendarName.indexOf('DOUBLE') != -1?true:false;
			if(this.obj.isDoubleOne ){
				let noDoubleObj 		=  this.config.calendarName.replace(/DOUBLE/,'')
				this.obj.$noDoubleObj 	=  window[noDoubleObj];
				window[noDoubleObj].obj.$noDoubleObj = this;
			};

			// // 设置默认值
			let defaultValue,inpValue;
			defaultValue = this.obj.input.nodeName === 'INPUT'?this.obj.input.value.trim():this.obj.input.textContent.trim()
			if(defaultValue){
				// 中文处理
				defaultValue = defaultValue.replace(/[\u4e00-\u9fa5]+/g,function($a,$b){
					if($a=='年'||$a=='月'){
						return '/'
					}else if($a=='时'||$a=='分'){
						return ':'
					}else if($a=='秒'||$a=='日'){
						return ''
					}
				})
				if(this.config.isDouble){
					let arr = defaultValue.split('-')
					this.config.value = this.obj.isDoubleOne?arr[1].trim():arr[0].trim()
				}else{
					this.config.value = defaultValue
				}
			}

			// 获得年月日
			let html 	= this.objHTML();//生成时间选择器HTML
			var divElement = doc.createElement("div");
			divElement.innerHTML = html
			doc.body.appendChild(divElement)
			
			this.$obj 	= doc[query](this.obj.id);

			switch(this.config.type){
				case 'day':
					this.judgeCalendarRender('day',this.config.value)
					break;
				case 'year':
					this.getYearHtml(this.config.value);
					break;
				case 'month':
					this.getMonthHtml(this.config.value);
					break;
				case 'time':
					this.getTimeHtml(this.config.value);
					break;			
			}
			
			//定位并显示选择器
			this.elemEventPoint(e);
			this.documentClick();
			this.calendarClick(); 
			
			this.obj.initVal = this.obj.input.value;
		});
		this.config.mounted&&this.config.mounted();
	}

	//生成时间选择器区域
	objHTML(json){
		let html =`<div class="zane-calendar" style="width:${this.config.width}px;z-index:${this.config.zindex}" id="${this.obj.id.substring(1)}">
					<div class="zane-calendar-one left" style="width:${this.config.width}px;">
						<div class="zane-date-top">
							<div class="common-top top-check-day"></div>
							<div class="common-top top-check-year"></div>	
							<div class="common-top top-check-month"></div>	
							<div class="common-top top-check-time"></div>		
						</div>
						<div class="zane-date-main" style="height:${this.config.height-80}px">
							<div class="common-main main-check-day"></div>
							<div class="common-main main-check-year"></div>
							<div class="common-main main-check-month"></div>
							<div class="common-main main-check-time"></div>
						</div>
						<div class="zane-date-bottom" style="display:${this.config.haveBotBtns||this.config.isDouble?'block':'none'};
												border-left:${this.obj.isDoubleOne?'none':'solid 1px #eee'};">
							<div class="btn-select-time" style="display:${this.config.showtime?'blcok':'none'}">
								<div class="zane-date-left button btn-select-time-item" onclick="${this.config.calendarName}.getTimeHtml()">${this.obj.lang.timeTips}</div>
							</div>	
				 			<div class="zane-date-right">
								<div class="button ${this.config.shownow?'no-right-line':''}" 
									style="display:${this.config.showclean?'blcok':'none'}"
									onclick="${this.config.calendarName}.cleanInputVal()">${this.obj.lang.tools.clear}</div>
								<div class="button ${this.config.showsubmit?'no-right-line':''}"
									style="display:${this.config.shownow&&!this.config.min||this.config.shownow&&!this.config.max?'blcok':'none'}" 
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
		<div onclick="${this.config.calendarName}.preMonth(${json.year},${json.month})" class="zane-date-icom zane-icon-left"></div>`
		if (this.config.lang == 'cn'){
			html += `<div class="zane-icon-center">
				<span onclick="${this.config.calendarName}.getYearHtml(${json.year})">${json.year}年</span>
				<span onclick="${this.config.calendarName}.getMonthHtml(${json.month})">${json.month}月</span>
			</div>`
		}else{
			html += `<div class="zane-icon-center">
				<span onclick="${this.config.calendarName}.getMonthHtml(${json.month})">${this.weekToEn(json.month)}</span>
				<span onclick="${this.config.calendarName}.getYearHtml(${json.year})">${json.year}</span>
			</div>`
		}
		html +=`<div onclick="${this.config.calendarName}.nextMonth(${json.year},${json.month})" class="zane-date-icom zane-icon-right"></div>`
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
		<div class="zane-date-icom zane-icon-left" onclick="${this.config.calendarName}.perYear(${json.nowyear})"></div>
		<div class="zane-icon-center">
			<span>${json.firstYear}${this.config.lang=='cn'?'年':''}</span>-
			<span>${json.lastYear}${this.config.lang=='cn'?'年':''}</span>
		</div>
		<div class="zane-date-icom zane-icon-right" onclick="${this.config.calendarName}.nextYear(${json.nowyear})"></div>`
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
		<div class="zane-date-icom zane-icon-left" style="display:${this.obj.handleType=='month'?'none':'block'}" onclick="${this.config.calendarName}.perMonthYear(${json.year},${json.nowmonth})"></div>
		<div class="zane-icon-center">
			<span>${json.year}年</span>
		</div>
		<div class="zane-date-icom zane-icon-right" style="display:${this.obj.handleType=='month'?'none':'block'}" onclick="${this.config.calendarName}.nextMonthYear(${json.year},${json.nowmonth})"></div>`
		return html;	
	}
	// month -main html 时间选择器选择月份状态内容块
	mainCheckMonthHTML(json){
		let html=`<div class="week-day">
			<table class="day" border="0" cellspacing="0">`
				for (let i = 0,len=json.datalist.length; i < len; i++) {
					let className = json.datalist[i].class||"";
					if((i+1) === parseInt(json.nowmonth)){
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
		let html=`<div class="zane-icon-center"><span>${this.obj.lang.timeTips}</span></div>`
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
			html+= `<div class="zane-date-left button" onclick="${this.config.calendarName}.backDateHtml()">${this.obj.lang.dateTips}</div>`
		}else{
			html+= `<div class="zane-date-left button" onclick="${this.config.calendarName}.getTimeHtml()">${this.obj.lang.timeTips}</div>`
		}
		return html;
	}

	// 插件位置定位并显示
	elemEventPoint(e){
		let secElement = e.srcElement || e.target
		this.obj.calendar 		= this.$obj;
		let rectObject = secElement.getBoundingClientRect()
		let objOffsetLeft = rectObject.left
		let objOffsetTop = rectObject.top
		let winWidth  			= doc.documentElement.clientWidth
		let screenClientHeight 	= doc.documentElement.clientHeight
		let screenScrolTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
		let objOffsetHeight		= e.target.offsetHeight
		let objBotton 			= screenClientHeight-(objOffsetTop+objOffsetHeight+this.config.behindTop)
		let betweenRight 		=  winWidth-objOffsetLeft-this.config.width
		let calendHeight 		= this.$obj.offsetHeight
		this.obj.calendar.style.display = 'block';

		// 设置插件point位置
		if(this.obj.isDoubleOne&&betweenRight>=this.config.width){
			this.obj.calendar.style.left 	=	objOffsetLeft+this.config.width+'px';
		}else{
			this.obj.calendar.style.left 	=	objOffsetLeft+'px';
		};
		//double 处理
		if(objBotton > calendHeight){
			//插件在input框之下 
			this.config.isDouble&&this.obj.isDoubleOne&&betweenRight<this.config.width?
			this.obj.calendar.style.top = objOffsetTop+screenScrolTop+objOffsetHeight+this.config.behindTop+calendHeight-2-40+'px'
			:this.obj.calendar.style.top = objOffsetTop+screenScrolTop+objOffsetHeight+this.config.behindTop+'px';
		}else{
			//插件在input框之上
			this.config.isDouble&&!this.obj.isDoubleOne&&betweenRight<this.config.width?
			this.obj.calendar.style.top = objOffsetTop+screenScrolTop-this.config.behindTop-calendHeight*2+42+'px'
			:this.obj.calendar.style.top = objOffsetTop+screenScrolTop-this.config.behindTop-calendHeight+'px';
		}
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
		if(this.config.isDouble&&this.obj.isDoubleOne&&clickType=='next'){
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
		let isreset 	= this.config.isDouble&&this.obj.isDoubleOne?true:false
		this.judgeCalendarRender('day',fulldate,isreset,'pre')
	}

	// 选择下一月
	nextMonth(year,month){
		month = month+1
		if(month == 13) {
			month 	= 1;
			year 	= year+1
		}
		let fulldate 	= `${year}/${month}/${this.obj.fulldatas.today}`
		let isreset 	= this.config.isDouble&&!this.obj.isDoubleOne?true:false
		this.judgeCalendarRender('day',fulldate,isreset,'next')
	}

	// 获得年月日,如果showtime=true,日期加样式，如果为false,直接设置当前选择的日期
	getDay(){
		let _this=this;
		let objs = this.$obj
		[query]('.main-check-day')[quall]('td');
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
		!this.config.isDouble&&this.on(objs,'dblclick',function(e){
			if(e.type === 'dblclick') _this.makeSureSelectTime();
		})
	}

	// 获得年html
	getYearHtml(year,isreset,clickType){
		year = year || new Date().getFullYear();
		year = parseInt(year)

		// double 处理
		if(this.config.isDouble&&this.obj.isDoubleOne&&clickType=='next'){
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
		let isreset 	= this.config.isDouble&&this.obj.isDoubleOne?true:false
		this.getYearHtml(year,isreset,'pre')
	}

	// 下一年
	nextYear(year){
		year = year+this.obj.totalYear
		let isreset 	= this.config.isDouble&&!this.obj.isDoubleOne?true:false
		this.getYearHtml(year,isreset,'next')
	}

	// 获得年
	getYear(){
		let _this = this;
		let objs = this.$obj
		[query]('.main-check-year')[quall]('td');
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
		[query]('.main-check-month')[quall]('td');
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

	// 获得时间HTML
	getTimeHtml(time){
		//double 处理
		if(this.config.isDouble&&!this.obj.isDoubleOne&&this.config.type=='day') this.obj.$noDoubleObj.getTimeHtml();
		let nowday = new Date().Format('yyyy/MM/dd')
		let date 	= time?new Date(nowday+' '+time):new Date();
		let hour 	= date.getHours();
		let minute 	= date.getMinutes();
		let second 	= date.getSeconds();
		hour 			= (hour+'').length<2? '0'+hour : hour;
		minute 			= (minute+'').length<2? '0'+minute:minute;
		second 			= (second+'').length<2? '0'+second:second;

		this.obj.fulldatas.hour = this.obj.fulldatas.hour||hour
		this.obj.fulldatas.minute = this.obj.fulldatas.minute||minute
		this.obj.fulldatas.second = this.obj.fulldatas.second||second

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
		let hourObjs 	= this.$obj[query]('ul.hour')[quall]('li')
		let minuteObjs 	= this.$obj[query]('ul.minute')[quall]('li')
		let secondObjs 	= this.$obj[query]('ul.second')[quall]('li')
		
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
		//double 处理
		if(this.config.isDouble&&!this.obj.isDoubleOne&&this.config.type=='day') this.obj.$noDoubleObj.backDateHtml();

		this.obj.handleType = 'date';
		let bottomHTML  	= this.bottomCheckTimeHTML();
		this.renderCommonHtml('day','','',bottomHTML,false);
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
			value = `${this.obj.fulldatas.year}/${this.obj.fulldatas.month}/${this.obj.fulldatas.today} ${this.obj.fulldatas.hour}:${this.obj.fulldatas.minute}:${this.obj.fulldatas.second}`					
		}else if(this.config.type == 'time'&&!this.config.isDouble){
			isFormat 	= false;
			value = `${this.obj.fulldatas.hour}:${this.obj.fulldatas.minute}:${this.obj.fulldatas.second}`
		}else{
			//doubule 处理
			if(this.config.isDouble){
				let noDoubleData 		=  this.obj.$noDoubleObj.obj.fulldatas;
				let noDoubleStr,haveDoubleStr

				switch(this.config.type){
					case 'day':
						if(this.obj.$noDoubleObj.config.showtime){
							noDoubleStr		=  `${noDoubleData.year}/${noDoubleData.month}/${noDoubleData.today} ${noDoubleData.hour}:${noDoubleData.minute}:${noDoubleData.second}`
							haveDoubleStr	=  `${this.obj.fulldatas.year}/${this.obj.fulldatas.month}/${this.obj.fulldatas.today} ${this.obj.fulldatas.hour}:${this.obj.fulldatas.minute}:${this.obj.fulldatas.second}`
						}else{
							noDoubleStr		=  `${noDoubleData.year}/${noDoubleData.month}/${noDoubleData.today}`
							haveDoubleStr	=  `${this.obj.fulldatas.year}/${this.obj.fulldatas.month}/${this.obj.fulldatas.today}`
						};
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
		let begintime='';
		let endtime='';

		//doubule 处理
		if(datatime&&datatime.indexOf('|') != -1){
			let arr 	= datatime.split('|');
			let val1 	= null
			let val2 	= null
			if(isFormat){
				val1 = begintime = new Date(arr[0]).Format(this.config.format)
				val2 = endtime = new Date(arr[1]).Format(this.config.format)
			}else{
				val1 = begintime = arr[0]
				val2 = endtime = arr[1]
			}
			formatTime = val1 +' - '+ val2
		}else{
			formatTime = begintime = isFormat?new Date(datatime).Format(this.config.format):datatime;
		}
		 
		if(this.obj.input.nodeName !== 'INPUT'){
			this.obj.input.textContent	=	formatTime;
		}else{
			this.obj.input.value  		= formatTime;
		}

		// 移除事件插件dom元素
		this.removeCalendar();

		this.config.done&&this.config.done(formatTime,begintime,endtime);
		if(this.obj.initVal!=formatTime&&this.config.change)this.config.change(formatTime,begintime,endtime)
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

				this.renderCommonHtml('day',topHTML,mainHTML);
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

				this.renderCommonHtml('year',topHTML,mainHTML);

				// 计算表格高度
				this.countHeight('.main-check-year',6);
				this.getYear();
				break;	
			case 'month':
				this.obj.handleType = 'month';
				mainHTML 	= this.mainCheckMonthHTML(any);
				topHTML		= this.topCheckMonthHTML(any);

				this.renderCommonHtml('month',topHTML,mainHTML);

				// 计算表格高度
				this.countHeight('.main-check-month',4);
				this.getMonth();
				break;
			case 'time':
				this.obj.handleType = 'time';
				mainHTML 	= this.mainCheckTimeHTML(any);
				topHTML		= this.topCheckTimeHTML();
				bottomHTML  = this.bottomCheckTimeHTML();

				this.renderCommonHtml('time',topHTML,mainHTML,bottomHTML);
				this.$obj[query]('.select-time').style.height = this.config.height-115 +'px'
				let hourScrollTop = this.$obj[query]('ul.hour')[query]('li.active').offsetTop
				let minuteScrollTop = this.$obj[query]('ul.minute')[query]('li.active').offsetTop
				let secondScrollTop = this.$obj[query]('ul.second')[query]('li.active').offsetTop
				this.$obj[query]('ul.hour').scrollTop 		= 	hourScrollTop-150
				this.$obj[query]('ul.minute').scrollTop 	= 	minuteScrollTop-150
				this.$obj[query]('ul.second').scrollTop 	=	secondScrollTop-150
				this.selectTime();
				break;		
		}
		
	}

	renderCommonHtml(type,topHTML,mainHTML,bottomHTML,isrender=true){
		if(type == 'time'|| !isrender) this.$obj[query](`.btn-select-time`).innerHTML = bottomHTML;
		if(isrender){
			this.$obj[query](`.top-check-${type}`).innerHTML 	= topHTML;
			this.$obj[query](`.main-check-${type}`).innerHTML 	= mainHTML;
		};
		this.showOrHide(this.$obj[quall]('.common-top'),'hide')
		this.showOrHide(this.$obj[quall]('.common-main'),'hide')
		this.$obj[query](`.main-check-${type}`).style.display 	= 'block'
		this.$obj[query](`.top-check-${type}`).style.display 	= 'block'
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
				prefullstr 		= `${json.prev.year}/${json.prev.month}/${json.prev.today}`
				nextfullstr 	= `${json.next.year}/${json.next.month}/${json.next.today}`
				perTime 		= new Date(prefullstr).getTime()
				nextTime 		= new Date(nextfullstr).getTime()
				if(perTime >= nextTime-86400000) {
					this.obj.$noDoubleObj.judgeCalendarRender('day',nextTime,false,json.clickType)
				}
				break;
			case 'year':
				perTime 	= `${json.prev.year}`
				nextTime 	= `${json.next.year}`
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

  	// 计算table tr高度
  	countHeight(elename,length){
  		let mainH  		=  	this.$obj[query]('.zane-date-main').offsetHeight;
  		let trObj		= 	this.$obj[query](elename)[quall]('tr')
  		let itemH 		=  Math.floor(mainH/length)
  		this.forEach(trObj,(index,item)=>{
  			item.style.height = itemH + 'px';
  		})
  	}

  	// document点击隐藏插件
  	documentClick(){
  		this.on(doc,'click',(e)=>{
  			this.removeCalendar()
  		})
  	}

  	// 移除事件选择器
  	removeCalendar(calobj){
  		let zaneCalendarObjs = doc[quall]('.zane-calendar')
  		if(zaneCalendarObjs&&zaneCalendarObjs.length){
  			zaneCalendarObjs.forEach(item=>{
  				let parent = item.parentElement;
				let parents = parent.parentElement;
				let removed = parents.removeChild(parent);
  			})
  		}
  	}

};

// 实例化日期插件 双选择器DOUBLE区分
let zaneDate = function(option){
	let begintime,endtime,format;
	format 	= option.format?option.format.replace(/-/g,'/'):'yyyy/MM/dd'
	if(option.type){
		if(option.type.indexOf('time')!=-1) format 	= 'HH:mm:ss';
		if(option.type.indexOf('year')!=-1) format 	= 'yyyy';
		if(option.type.indexOf('month')!=-1) format = 'MM';
	}
	option.type = option.type || 'day'

	//处理begintime
	if(option.begintime&&typeof(option.begintime)==='string'){
		begintime 	= option.begintime.replace(/-/g,'/')
		if(option.type&&option.type.indexOf('time')==-1 || !option.type){
			begintime 	= new Date(begintime).Format(format)
		}
	}else if(option.begintime&&typeof(option.begintime)==='number'){
		begintime 	= new Date(option.begintime).Format(format)
	}

	// 处理begintime
	if(option.endtime&&typeof(option.endtime)==='string'){
		endtime 	= option.endtime.replace(/-/g,'/')
		if(option.type&&option.type.indexOf('time')==-1 || !option.type){
			endtime 	= new Date(endtime).Format(format)
		}
	}else if(option.endtime&&typeof(option.endtime)==='number'){
		endtime 	= new Date(option.endtime).Format(format)
	}
	
	if(option.type.indexOf('double') != -1){
		option.type = option.type.replace(/double/,'');
		createCalendar({
			showclean:false,
			shownow:false,
			showsubmit:false,
			isDouble:true,
			value:begintime,
			format:format,
			doublevalue:begintime&&endtime?begintime+' - '+endtime:''
		});
		createCalendar({
			shownow:false,
			showtime:false,
			isDouble:true,
			double:'DOUBLE',
			value:endtime,
			format:format,
			doublevalue:begintime&&endtime?begintime+' - '+endtime:''
		});
	}else{
		createCalendar({
			format:format,
			value:begintime,
		});
	}
	// 新建日期插件
	function createCalendar(json={}){
		let calendarName 		= option.elem.substring(1);
		calendarName 			= calendarName.replace(/[_-]/g,'').toUpperCase();
		option.calendarName 	= json&&json.double ?calendarName+json.double:calendarName;
		if(option.width){
			option.width = option.width<250?250:option.width
			option.width = option.width>500?500:option.width
		}
		if(option.height){
			option.height = option.height<250?250:option.height
			option.height = option.height>350?350:option.height
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
