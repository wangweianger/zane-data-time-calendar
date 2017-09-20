// 日期插件
class calendar{
	constructor(){
		this.config={
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
			value:'2017-08-20',
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
			calendarHeight:325,
			// 选择年时展示的数量
			totalYear:18,
			// 插件加载完成之后调用
			mounted:()=>{},
			//时间变更之后调用
			change:()=>{},
			//选择完成之后调用
			done:()=>{},
		}
		this.obj={
			input:document.querySelector(this.config.elem),
			calendar:null,
			id:`#zane-calendar-${this.config.elem.substring(1)}`,
			fulldatas:{},
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
							<div class="left button">选择时间</div>
							<div class="right">
								<div class="button no-right-line">清空</div>
								<div class="button no-right-line">今天</div>
								<div class="button">确定</div>
							</div>
						</div>
					</div>
				</div>`
		return html
	}
	// day - top html
	topCheckDayHTML(json){
		let html =`	
		<div onclick="calendarObj.preMonth(${json.year},${json.month})" class="icom left"></div>
			<div class="center">
				<span onclick="calendarObj.getYearHtml(${json.year})">${json.year}年</span>
				<span onclick="calendarObj.getMonthHtml(${json.month})">${json.month}月</span>
			</div>
			<div onclick="calendarObj.nextMonth(${json.year},${json.month})" class="icom right"></div>
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
		<div class="icom left" onclick="calendarObj.perYear(${json.nowyear})"></div>
		<div class="center">
			<span>${json.firstYear}年</span>-
			<span>${json.lastYear}年</span>
		</div>
		<div class="icom right" onclick="calendarObj.nextYear(${json.nowyear})"></div>`
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
		<div class="icom left" onclick="calendarObj.perMonthYear(${json.year},${json.nowmonth})"></div>
		<div class="center">
			<span>${json.year}年</span>
		</div>
		<div class="icom right" onclick="calendarObj.nextMonthYear(${json.year},${json.nowmonth})"></div>`
		return html;	
	}
	// month -main html
	mainCheckMonthHTML(json){
		let html=`<div class="week-day">
			<table class="day">`
				for (let i = 0,len=json.datalist.length; i < len; i++) {
					let className = json.datalist[i].class||"";
					if(json.datalist[i] === json.nowmonth){
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
			};

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
		// 计算当前这个月的天数
		let monTotalDay = new Date(year,month,0).getDate()

		// 计算第一天是周几
		let firstDayMeek = new Date(`${year}/${month}/1`).getDay()
		let lastDayMeek  = new Date(`${year}/${month}/${monTotalDay}`).getDay()

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
				timeDatas.push({
					day:preMonTotalDay-i,
					week:len-1-i,
					class:'light',
					daytype:`pre`,
					fullday:`${preyear}/${premonth}/${preMonTotalDay-i}`
				})
			}
		}
		timeDatas = timeDatas.reverse();
		for (let i = 0,len=monTotalDay; i < len; i++) {
			let weekday = (firstDayMeek+i)%7;
			timeDatas.push({
				day:i+1,
				week:weekday,
				daytype:`now`,
				fullday:`${year}/${month}/${i+1}`
			})
		}
		if(lastDayMeek<6){
			let preyear  = year;
			let premonth = month+1;
			if(premonth === 13){
				preyear  = year+1;
				premonth = 1;
			}

			for(let i =0,len=6-lastDayMeek;i<len;i++){
				let weekday = (lastDayMeek+1+i)%7;
				timeDatas.push({
					day:i+1,
					week:weekday,
					class:'light',
					daytype:`next`,
					fullday:`${preyear}/${premonth}/${i+1}`
				})
			}
		}
		return {
			year:year,
			month:month,
			today:toDate,
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
		let tnodyhtml 	= this.mainCheckDayHTML(json);
		let tophtml		= this.topCheckDayHTML(json);
		this.obj.fulldatas = json;

		console.log(fulldate)

		document.querySelector(this.obj.id).querySelector('.main-check-day').innerHTML = tnodyhtml;
		document.querySelector(this.obj.id).querySelector('.top-check-day').innerHTML = tophtml;
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
		let tnodyhtml 	= this.mainCheckDayHTML(json);
		let tophtml		= this.topCheckDayHTML(json);
		this.obj.fulldatas = json;
		document.querySelector(this.obj.id).querySelector('.main-check-day').innerHTML = tnodyhtml;
		document.querySelector(this.obj.id).querySelector('.top-check-day').innerHTML = tophtml;
		this.getDay();
	}

	// 获得年月日
	getDay(){
		let objs = document.querySelector(this.obj.id)
		.querySelector('.main-check-day').querySelectorAll('td');
		this.on(objs,'click',function(e){
			console.log(this)
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

		let tnodyhtml 	= this.mainCheckYearHTML(yearDatas);
		let tophtml		= this.topCheckYearHTML(yearDatas);
		
		document.querySelector(this.obj.id).querySelector('.main-check-year').innerHTML = tnodyhtml;
		document.querySelector(this.obj.id).querySelector('.top-check-year').innerHTML = tophtml;

		this.showOrHide(document.querySelector(this.obj.id).querySelectorAll('.common-top'),'hide')
		this.showOrHide(document.querySelector(this.obj.id).querySelectorAll('.common-main'),'hide')

		document.querySelector(this.obj.id).querySelector('.main-check-year').style.display = 'block'
		document.querySelector(this.obj.id).querySelector('.top-check-year').style.display = 'block'

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
		let tnodyhtml 	= this.mainCheckMonthHTML(monthDatas);
		let tophtml		= this.topCheckMonthHTML(monthDatas);
		document.querySelector(this.obj.id).querySelector('.main-check-month').innerHTML = tnodyhtml;
		document.querySelector(this.obj.id).querySelector('.top-check-month').innerHTML = tophtml;
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
			console.log(this)
			let year 	= e.target.getAttribute('data-year')
			let month 	= e.target.getAttribute('data-month')

			let fulldate 	= `${year}/${month}/${_this.obj.fulldatas.today}`
			_this.monthYearCommon(fulldate)
		})
	}
	// 
	monthYearCommon(fulldate){
		let json 		= this.getTimeDates(fulldate);
		let tnodyhtml 	= this.mainCheckDayHTML(json);
		let tophtml		= this.topCheckDayHTML(json);
		
		this.obj.fulldatas = json;

		document.querySelector(this.obj.id).querySelector('.main-check-day').innerHTML = tnodyhtml;
		document.querySelector(this.obj.id).querySelector('.top-check-day').innerHTML = tophtml;

		this.showOrHide(document.querySelector(this.obj.id).querySelectorAll('.common-top'),'hide')
		this.showOrHide(document.querySelector(this.obj.id).querySelectorAll('.common-main'),'hide')

		document.querySelector(this.obj.id).querySelector('.main-check-day').style.display = 'block'
		document.querySelector(this.obj.id).querySelector('.top-check-day').style.display = 'block'

		this.getDay();
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


var calendarObj = new calendar();
