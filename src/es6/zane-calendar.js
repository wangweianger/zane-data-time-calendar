// 日期插件
class calendar{
	constructor(json={}){

		this.config={
			calendarName:'',
			//控件的dom原生仅限制于id
			elem:'#zane-calendar',
			//year month date time datetime
			type:'year', 
			//absolute , fixed   
			position:'absolute', 
			//cn , en 
			lang:'cn', 
			format:'yyyy-MM-dd HH:mm:ss',
			// 初始默认值
			value:'',
			min:'1900-10-01',
			max: '2099-12-31',
			//click , focus
			event:'click',  
			//是否显示选择时间
			showtime:true,  
			//是否显示清除按钮
			showclean:true, 
			//是否显示当前按钮
			shownow:true,  
			//是否显示提交按钮
			showsubmit:true,
			//插件于输入框的高度 
			behindTop:10,
			calendarHeight:318,
			// 选择年时展示的数量
			totalYear:18,
			// 插件加载完成之后调用
			mounted:()=>{},
			//时间变更之后调用
			change:()=>{},
			//选择完成之后调用
			done:()=>{},
		}

		this.config = this.extend(this.config,json);

		this.obj={
			input:document.querySelector(this.config.elem),
			calendar:null,
			id:`#zane-calendar-${this.config.elem.substring(1)}`,
			fulldatas:{},
			handleType:'date',
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
		
		// 初始化
		this.init();
	}

	init(){
		this.elemEventPoint();
	}
	
	objHTML(json){
		let html =`<div class="zane-calendar" id="zane-calendar-${this.config.elem.substring(1)}">
					<div class="zane-calendar-one left">
						<div class="top">
							<div class="common-top top-check-day">`+this.topCheckDayHTML(json)+`</div>
							<div class="common-top top-check-year"></div>	
							<div class="common-top top-check-month"></div>	
							<div class="common-top top-check-time"></div>		
						</div>
						<div class="main">
							<div class="common-main main-check-day">`+this.mainCheckDayHTML(json)+`</div>
							<div class="common-main main-check-year"></div>
							<div class="common-main main-check-month"></div>
							<div class="common-main main-check-time"></div>
						</div>
						<div class="bottom">
							<div class="btn-select-time">
								<div class="left button btn-select-time-item" onclick="${this.config.calendarName}.getTimeHtml()">选择时间</div>
							</div>	
				 			<div class="right">
								<div class="button no-right-line" onclick="${this.config.calendarName}.cleanInputVal()">清空</div>
								<div class="button no-right-line" onclick="${this.config.calendarName}.changeToToday()">今天</div>
								<div class="button" onclick="${this.config.calendarName}.makeSureSelectTime()">确定</div>
							</div>
						</div>
					</div>
				</div>`
		return html
	}
	// day - top html
	topCheckDayHTML(json){
		let html =`	
		<div onclick="${this.config.calendarName}.preMonth(${json.year},${json.month})" class="icom left"></div>
			<div class="center">
				<span onclick="${this.config.calendarName}.getYearHtml(${json.year})">${json.year}年</span>
				<span onclick="${this.config.calendarName}.getMonthHtml(${json.month})">${json.month}月</span>
			</div>
			<div onclick="${this.config.calendarName}.nextMonth(${json.year},${json.month})" class="icom right"></div>
		`
		return html;
	}

	// day - main html
	mainCheckDayHTML(json){
		let html =`
		<div class="week-day"><table class="day">
			<tr>
				<th>日</th>
				<th>一</th>
				<th>二</th>
				<th>三</th>
				<th>四</th>
				<th>五</th>
				<th>六</th>
			</tr>
			<tbody class="tbody">`

			for (let i = 0,len=json.datalist.length; i < len; i++) {
				let className = json.datalist[i].class||"";
				if(json.datalist[i].day === json.today&&json.datalist[i].daytype==='now'){
					className+=` active`
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

		html+=`</tbody></table></div>`
		return html;
	}

	// year - top html
	topCheckYearHTML(json){
		let html=`
		<div class="icom left" onclick="${this.config.calendarName}.perYear(${json.nowyear})"></div>
		<div class="center">
			<span>${json.firstYear}年</span>-
			<span>${json.lastYear}年</span>
		</div>
		<div class="icom right" onclick="${this.config.calendarName}.nextYear(${json.nowyear})"></div>`
		return html;
	}
	// year - main html
	mainCheckYearHTML(json){
		let html=`<div class="week-day">
			<table class="day">`
				for (let i = 0,len=json.datalist.length; i < len; i++) {
					let className = json.datalist[i].class||"";
					if(json.datalist[i].year === json.nowyear){
						className+=` active`
					}
					if(i == 0){
						html+=`<tr><td data-year="${json.datalist[i].year}" class="${className}">${json.datalist[i].year}年</td>`;
					}else if(i == len-1){
						html+=`<td data-year="${json.datalist[i].year}" class="${className}">${json.datalist[i].year}年</td></tr>`;
					}else{
						if((i+1)%3 == 0){
							html+=`<td data-year="${json.datalist[i].year}" class="${className}">${json.datalist[i].year}年</td></tr><tr>`;
						}else{
							html+=`<td data-year="${json.datalist[i].year}" class="${className}">${json.datalist[i].year}年</td>`;
						}
					}
				}
		html+=`</table>
		</div>`
		return html;
	}

	// month -top html
	topCheckMonthHTML(json){
		let html=`
		<div class="icom left" onclick="${this.config.calendarName}.perMonthYear(${json.year},${json.nowmonth})"></div>
		<div class="center">
			<span>${json.year}年</span>
		</div>
		<div class="icom right" onclick="${this.config.calendarName}.nextMonthYear(${json.year},${json.nowmonth})"></div>`
		return html;	
	}
	// month -main html
	mainCheckMonthHTML(json){
		let html=`<div class="week-day">
			<table class="day">`
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

	// time -top  html
	topCheckTimeHTML(){
		let html=`<div class="center"><span>选择时间</span></div>`
		return html;	
	}
	// time -main html
	mainCheckTimeHTML(json){
		let html = `<div class="week-day"><ul class="nav"><li>小时</li><li>分钟</li><li>秒数</li></ul><div class="select-time">
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

	// time -bottom html
	bottomCheckTimeHTML(){
		let html = '';
		if(this.obj.handleType === 'time'){
			html+= `<div class="left button" onclick="${this.config.calendarName}.backDateHtml()">返回时间</div>`
		}else{
			html+= `<div class="left button" onclick="${this.config.calendarName}.getTimeHtml()">选择时间</div>`
		}
		return html;
	}

	// 插件位置定位
	elemEventPoint(){
		this.on(this.obj.input,this.config.event, (e)=>{
			e.preventDefault();
			e.stopPropagation();

			if(!this.obj.calendar){
				// 获得年月日
				let json 	= this.getTimeDates(this.config.value);
				let html 	= this.objHTML(json);
				this.obj.fulldatas = json;

				var divElement = document.createElement("div");
				divElement.innerHTML = html
				document.body.appendChild(divElement)

				this.obj.calendar = document.querySelector(this.obj.id);
			
				let screenClientHeight 	= document.documentElement.clientHeight
				let screenScrolTop	 	= document.documentElement.scrollTop
				let objOffsetTop		= e.target.offsetTop
				let objOffsetLeft		= e.target.offsetLeft
				let objOffsetHeight		= e.target.offsetHeight

				let objBotton = screenClientHeight-(objOffsetTop+objOffsetHeight+this.config.behindTop-screenScrolTop)

				this.obj.calendar.style.display = 'block';
				// 设置插件point位置
				this.obj.calendar.style.left 	=	objOffsetLeft+'px';
				objBotton > this.config.calendarHeight?
					//插件在input框之下 
					this.obj.calendar.style.top = objOffsetTop+objOffsetHeight+this.config.behindTop+'px':
					//插件在input框之上
					this.obj.calendar.style.top = objOffsetTop-this.config.behindTop-this.config.calendarHeight+'px';
			    
				this.documentClick();
				this.calendarClick(); 
				this.getDay();
			}else{
				document.querySelector(this.obj.id).style.display 	= 	"block";
			};
		});
	}

	// 插件内容渲染
	getTimeDates(deraultDay){
		let timeDatas 	= [];
		let date    	= deraultDay?new Date(deraultDay):new Date()
		let year		= date.getFullYear()
		let month   	= date.getMonth()+1
		let toDate  	= date.getDate()
		let weekday 	= date.getDay()
		let hour 		= date.getHours()
		let minute 		= date.getMinutes()
		let second 		= date.getSeconds()
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
		let premonth 	= month+1;
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

	// 上一月
	preMonth(year,month){
		month = month-1
		if(month == 0) {
			month 	= 12;
			year 	= year-1
		}
		let fulldate 	= `${year}/${month}/${this.obj.fulldatas.today}`
		let json 		= this.getTimeDates(fulldate);
		let mainHTML 	= this.mainCheckDayHTML(json);
		let topHTML		= this.topCheckDayHTML(json);
		this.obj.fulldatas = json;

		document.querySelector(this.obj.id).querySelector('.main-check-day').innerHTML = mainHTML;
		document.querySelector(this.obj.id).querySelector('.top-check-day').innerHTML = topHTML;
		this.getDay();
	}

	// 下一月
	nextMonth(year,month){
		month = month+1
		if(month == 13) {
			month 	= 1;
			year 	= year+1
		}
		let fulldate 	= `${year}/${month}/${this.obj.fulldatas.today}`
		let json 		= this.getTimeDates(fulldate);
		let mainHTML 	= this.mainCheckDayHTML(json);
		let topHTML		= this.topCheckDayHTML(json);
		this.obj.fulldatas = json;
		document.querySelector(this.obj.id).querySelector('.main-check-day').innerHTML = mainHTML;
		document.querySelector(this.obj.id).querySelector('.top-check-day').innerHTML = topHTML;
		this.getDay();
	}

	// 获得年月日
	getDay(){
		let _this=this;
		let objs = document.querySelector(this.obj.id)
		.querySelector('.main-check-day').querySelectorAll('td');
		this.on(objs,'click',function(e){
			let dataTime 				= 	this.getAttribute('data-time');
			let arr 					=	dataTime.split('/')
			_this.obj.fulldatas.year 	=	arr[0]
			_this.obj.fulldatas.month 	=	arr[1]
			_this.obj.fulldatas.today 	=	arr[2]

			if(_this.config.showtime){
				_this.forEach(objs,(index,item)=>{
					_this.removeClass(item,'active');
				})
				_this.addClass(this,'active');
			}else{
				let value = `${_this.obj.fulldatas.year}/${_this.obj.fulldatas.month}/${_this.obj.fulldatas.today}`
				_this.getYearMonthAndDay(value)
			}
		})
	}

	// 获得年html
	getYearHtml(year){
		let yearDatas 	= {
			nowyear:year,
			datalist:[]
		};
		for (var i = 0; i < this.config.totalYear; i++) {
			let getyear = year-Math.floor(this.config.totalYear/2)+i
			if(i === 0) yearDatas.firstYear = getyear;
			if(i === this.config.totalYear-1) yearDatas.lastYear = getyear;
			yearDatas.datalist.push({
				class:'',
				year:getyear
			})
		}

		let mainHTML 	= this.mainCheckYearHTML(yearDatas);
		let topHTML		= this.topCheckYearHTML(yearDatas);
		
		document.querySelector(this.obj.id).querySelector('.main-check-year').innerHTML = mainHTML;
		document.querySelector(this.obj.id).querySelector('.top-check-year').innerHTML = topHTML;

		this.showOrHide(document.querySelector(this.obj.id).querySelectorAll('.common-top'),'hide')
		this.showOrHide(document.querySelector(this.obj.id).querySelectorAll('.common-main'),'hide')

		document.querySelector(this.obj.id).querySelector('.main-check-year').style.display = 'block'
		document.querySelector(this.obj.id).querySelector('.top-check-year').style.display = 'block'

		this.obj.handleType = 'year';
		this.getYear();
	}

	// 上一年
	perYear(year){
		year = year-this.config.totalYear
		this.getYearHtml(year)
	}

	// 下一年
	nextYear(year){
		year = year+this.config.totalYear
		this.getYearHtml(year)
	}

	// 获得年
	getYear(){
		let _this = this;
		let objs = document.querySelector(this.obj.id)
		.querySelector('.main-check-year').querySelectorAll('td');
		this.on(objs,'click',function(e){
			let year = e.target.getAttribute('data-year')

			let fulldate 	= `${year}/${_this.obj.fulldatas.month}/${_this.obj.fulldatas.today}`
			_this.monthYearCommon(fulldate)
		})
	}

	// 获得month html
	getMonthHtml(month){
		let monthDatas 	= {
			nowmonth:month,
			year:this.obj.fulldatas.year,
			datalist:this.obj.cn.month
		};

		this.obj.handleType = 'month';
		this.monthHTML(monthDatas);
	}

	perMonthYear(year,month){
		let monthDatas 	= {
			nowmonth:month,
			year:year-1,
			datalist:this.obj.cn.month
		};
		this.monthHTML(monthDatas);
	}

	nextMonthYear(year,month){
		let monthDatas 	= {
			nowmonth:month,
			year:year+1,
			datalist:this.obj.cn.month
		};
		this.monthHTML(monthDatas);
	}

	monthHTML(monthDatas){
		let mainHTML 	= this.mainCheckMonthHTML(monthDatas);
		let topHTML		= this.topCheckMonthHTML(monthDatas);
		document.querySelector(this.obj.id).querySelector('.main-check-month').innerHTML = mainHTML;
		document.querySelector(this.obj.id).querySelector('.top-check-month').innerHTML = topHTML;
		this.showOrHide(document.querySelector(this.obj.id).querySelectorAll('.common-top'),'hide')
		this.showOrHide(document.querySelector(this.obj.id).querySelectorAll('.common-main'),'hide')
		document.querySelector(this.obj.id).querySelector('.main-check-month').style.display = 'block'
		document.querySelector(this.obj.id).querySelector('.top-check-month').style.display = 'block'
		this.getMonth();
	}

	// 获得月
	getMonth(){
		let _this = this;
		let objs = document.querySelector(this.obj.id)
		.querySelector('.main-check-month').querySelectorAll('td');
		this.on(objs,'click',function(e){
			let year 	= e.target.getAttribute('data-year')
			let month 	= e.target.getAttribute('data-month')

			let fulldate 	= `${year}/${month}/${_this.obj.fulldatas.today}`
			_this.monthYearCommon(fulldate)
		})
	}

	// 选择月份公共代码
	monthYearCommon(fulldate){
		let json 		= this.getTimeDates(fulldate);
		let mainHTML 	= this.mainCheckDayHTML(json);
		let topHTML		= this.topCheckDayHTML(json);
		
		this.obj.fulldatas = json;

		document.querySelector(this.obj.id).querySelector('.main-check-day').innerHTML = mainHTML;
		document.querySelector(this.obj.id).querySelector('.top-check-day').innerHTML = topHTML;

		this.showOrHide(document.querySelector(this.obj.id).querySelectorAll('.common-top'),'hide')
		this.showOrHide(document.querySelector(this.obj.id).querySelectorAll('.common-main'),'hide')

		document.querySelector(this.obj.id).querySelector('.main-check-day').style.display = 'block'
		document.querySelector(this.obj.id).querySelector('.top-check-day').style.display = 'block'

		this.obj.handleType = 'date';
		this.getDay();
	}

	// 选择时间
	getTimeHtml(){
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
		this.obj.handleType = 'time';

		let mainHTML 	= this.mainCheckTimeHTML(datas);
		let topHTML		= this.topCheckTimeHTML();
		let bottomHTML  = this.bottomCheckTimeHTML();
		document.querySelector(this.obj.id).querySelector('.main-check-time').innerHTML = mainHTML;
		document.querySelector(this.obj.id).querySelector('.top-check-time').innerHTML = topHTML;
		document.querySelector(this.obj.id).querySelector('.btn-select-time').innerHTML = bottomHTML;

		this.showOrHide(document.querySelector(this.obj.id).querySelectorAll('.common-top'),'hide')
		this.showOrHide(document.querySelector(this.obj.id).querySelectorAll('.common-main'),'hide')
		document.querySelector(this.obj.id).querySelector('.main-check-time').style.display = 'block'
		document.querySelector(this.obj.id).querySelector('.top-check-time').style.display = 'block'

		let hourScrollTop = document.querySelector(this.obj.id).querySelector('ul.hour').querySelector('li.active').offsetTop
		let minuteScrollTop = document.querySelector(this.obj.id).querySelector('ul.minute').querySelector('li.active').offsetTop
		let secondScrollTop = document.querySelector(this.obj.id).querySelector('ul.second').querySelector('li.active').offsetTop

		document.querySelector(this.obj.id).querySelector('ul.hour').scrollTop 		= 	hourScrollTop-150
		document.querySelector(this.obj.id).querySelector('ul.minute').scrollTop 	= 	minuteScrollTop-150
		document.querySelector(this.obj.id).querySelector('ul.second').scrollTop 	=	secondScrollTop-150
		
		this.selectTime();
	}

	// 选择时间
	selectTime(){
		let _this 		= this
		let hourObjs 	= document.querySelector(this.obj.id).querySelector('ul.hour').querySelectorAll('li')
		let minuteObjs 	= document.querySelector(this.obj.id).querySelector('ul.minute').querySelectorAll('li')
		let secondObjs 	= document.querySelector(this.obj.id).querySelector('ul.second').querySelectorAll('li')
		
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
		document.querySelector(this.obj.id).querySelector('.btn-select-time').innerHTML = bottomHTML;

		this.showOrHide(document.querySelector(this.obj.id).querySelectorAll('.common-top'),'hide')
		this.showOrHide(document.querySelector(this.obj.id).querySelectorAll('.common-main'),'hide')
		document.querySelector(this.obj.id).querySelector('.main-check-day').style.display = 'block'
		document.querySelector(this.obj.id).querySelector('.top-check-day').style.display = 'block'
	}

	// 今天
	changeToToday(){
		let json 		= 	this.getTimeDates();
		let value 		=	null;

		if(this.config.showtime){
			value = `${json.year}/${json.month}/${json.today} ${json.hour}:${json.minute}:${json.second}`
		}else{
			value = `${json.year}/${json.month}/${json.today}`
		}
		this.getYearMonthAndDay(value)
	}

	// 清空
	cleanInputVal(){
		let value = ""
		this.getYearMonthAndDay(value)
	}

	// 确定
	makeSureSelectTime(){
		let value = null;
		if(this.config.showtime){
			value = `${this.obj.fulldatas.year}/${this.obj.fulldatas.month}/${this.obj.fulldatas.today} ${this.obj.fulldatas.hour}:${this.obj.fulldatas.minute}:${this.obj.fulldatas.second}`
		}else{
			value = `${this.obj.fulldatas.year}/${this.obj.fulldatas.month}/${this.obj.fulldatas.today}`
		}
		this.getYearMonthAndDay(value)
	}

	// 获得年月日的值
	getYearMonthAndDay(datatime){
		document.querySelector(this.config.elem).value		=	datatime;
		document.querySelector(this.obj.id).style.display 	= 	"none";
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

  	// document点击隐藏插件
  	documentClick(){
  		this.on(document,'click',(e)=>{
  			if(!this.obj.calendar) return;
  			this.obj.calendar.style.display = 'none';
  		})
  	}
};

// 实例化日期插件
var zaneDate = function(option){
	let calendarName 		= option.elem.substring(1);
	calendarName 			= calendarName.replace(/[_-]/g,'').toUpperCase();
	option.calendarName 	= calendarName;
	window[calendarName] 	= new calendar(option)
}


