"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*!
 * zaneDate Javascript Library 1.0.0
 * https://github.com/wangweianger/zane-data-time-calendar
 * Date : 2017-09-22
 * auther :zane
 */
;(function (global, factory) {
	"use strict";

	if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && _typeof(module.exports) === "object") {
		module.exports = global.document ? factory(global, true) : function (w) {
			if (!w.document) {
				throw new Error("zaneDate requires a window with a document");
			}
			return factory(w);
		};
	} else {
		factory(global);
	}
})(typeof window !== "undefined" ? window : undefined, function (window, noGlobal) {

	if (noGlobal) require('./zane-calendar.css');

	if (!new Date().Format) {
		Date.prototype.Format = function (fmt) {
			//author: meizz 
			var o = {
				"M+": this.getMonth() + 1, //月份 
				"d+": this.getDate(), //日 
				"h+": this.getHours(), //小时 
				"H+": this.getHours() > 12 ? this.getHours() - 12 : this.getHours(),
				"m+": this.getMinutes(), //分 
				"s+": this.getSeconds(), //秒 
				"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
				"S": this.getMilliseconds() //毫秒 
			};
			if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
			for (var k in o) {
				if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
			}return fmt;
		};
	};

	// 日期插件

	var calendar = function () {
		function calendar() {
			var json = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, calendar);

			this.config = {
				//控件的dom原生仅限制于id
				elem: '#zane-calendar',
				//day year month time datetime
				type: 'day',
				//absolute , fixed   
				position: 'fixed',
				//cn , en 
				lang: 'cn',
				// 宽度
				width: 280,
				// 格式化
				format: 'yyyy-MM-dd',
				// 初始默认值
				value: '',
				// 可选取时间最小范围
				min: '', //'1900-10-01',
				// 可选取时间最大范围
				max: '', //'2099-12-31',
				//事件方式 click 
				event: 'click',
				//是否显示选择时间
				showtime: true,
				//是否显示清除按钮
				showclean: true,
				//是否显示当前按钮
				shownow: true,
				//是否显示提交按钮
				showsubmit: true,
				// 是否有底部按钮列表
				haveBotBtns: true,
				calendarName: '',
				// 插件加载完成之后调用
				mounted: function mounted() {},
				//时间变更之后调用
				change: function change() {},
				//选择完成之后调用
				done: function done() {}
			};

			this.config = this.extend(this.config, json);
			//校验时间格式
			if (isNaN(new Date(this.config.value))) this.config.value = '';
			if (isNaN(new Date(this.config.min))) this.config.min = '';
			if (isNaN(new Date(this.config.max))) this.config.max = '';

			this.obj = {
				input: document.querySelector(this.config.elem),
				calendar: null,
				// id:`#zane-calendar-${this.config.elem.substring(1)}`,
				id: "#zane-calendar-" + this.config.calendarName,
				$obj: null,
				fulldatas: {},
				handleType: 'date',
				initVal: '', //每次进来的初始值
				//插件于输入框的高度 
				behindTop: 10,
				calendarHeight: 307,
				// 选择年时展示的数量
				totalYear: 18,
				cn: {
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
				en: {
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
			};

			this.vision = '1.0.0';
			this.auther = 'zane';

			this.obj.lang = this.obj[this.config.lang];

			if (this.config.type == 'year' || this.config.type == 'month') {
				this.config.haveBotBtns = false;
			}

			if (this.config.type == 'time') {
				this.config.showtime = false;
			}

			// 初始化
			this.init();
		}

		_createClass(calendar, [{
			key: "init",
			value: function init() {
				var _this2 = this;

				this.on(this.obj.input, this.config.event, function (e) {
					e.preventDefault();
					e.stopPropagation();

					if (!_this2.obj.calendar) {
						//没有calendar为第一次生成
						// 获得年月日
						var html = _this2.objHTML(); //生成时间选择器HTML
						var divElement = document.createElement("div");
						divElement.innerHTML = html;
						document.body.appendChild(divElement);

						_this2.$obj = document.querySelector(_this2.obj.id);

						switch (_this2.config.type) {
							case 'day':
								_this2.judgeCalendarRender('day', _this2.config.value);
								break;
							case 'year':
								_this2.getYearHtml();
								break;
							case 'month':
								_this2.getMonthHtml();
								break;
							case 'time':
								_this2.getTimeHtml();
								break;
						}

						//定位并显示选择器
						_this2.elemEventPoint(e);
						_this2.documentClick();
						_this2.calendarClick();
					} else {
						_this2.elemEventPoint(e); //定位并显示选择器
					};
					_this2.obj.initVal = _this2.obj.input.value;

					// 隐藏其他时间插件框
					var objs = document.querySelectorAll('.zane-calendar');
					_this2.forEach(objs, function (index, item) {
						if (('#' + item.getAttribute('id')).replace(/DOUBLE/, '') !== _this2.obj.id.replace(/DOUBLE/, '')) {
							item.style.display = "none";
						}
					});
				});
				this.config.mounted && this.config.mounted();
			}

			//生成时间选择器区域

		}, {
			key: "objHTML",
			value: function objHTML(json) {
				var html = "<div class=\"zane-calendar\" style=\"width:" + this.config.width + "px;\" id=\"" + this.obj.id.substring(1) + "\">\n\t\t\t\t\t<div class=\"zane-calendar-one left\" style=\"width:" + this.config.width + "px;\">\n\t\t\t\t\t\t<div class=\"top\">\n\t\t\t\t\t\t\t<div class=\"common-top top-check-day\"></div>\n\t\t\t\t\t\t\t<div class=\"common-top top-check-year\"></div>\t\n\t\t\t\t\t\t\t<div class=\"common-top top-check-month\"></div>\t\n\t\t\t\t\t\t\t<div class=\"common-top top-check-time\"></div>\t\t\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"main\">\n\t\t\t\t\t\t\t<div class=\"common-main main-check-day\"></div>\n\t\t\t\t\t\t\t<div class=\"common-main main-check-year\"></div>\n\t\t\t\t\t\t\t<div class=\"common-main main-check-month\"></div>\n\t\t\t\t\t\t\t<div class=\"common-main main-check-time\"></div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"bottom\" style=\"display:" + (this.config.haveBotBtns ? 'block' : 'none') + "\">\n\t\t\t\t\t\t\t<div class=\"btn-select-time\" style=\"display:" + (this.config.showtime ? 'blcok' : 'none') + "\">\n\t\t\t\t\t\t\t\t<div class=\"left button btn-select-time-item\" onclick=\"" + this.config.calendarName + ".getTimeHtml()\">" + this.obj.lang.timeTips + "</div>\n\t\t\t\t\t\t\t</div>\t\n\t\t\t\t \t\t\t<div class=\"right\">\n\t\t\t\t\t\t\t\t<div class=\"button " + (this.config.shownow ? 'no-right-line' : '') + "\" \n\t\t\t\t\t\t\t\t\tstyle=\"display:" + (this.config.showclean ? 'blcok' : 'none') + "\"\n\t\t\t\t\t\t\t\t\tonclick=\"" + this.config.calendarName + ".cleanInputVal()\">" + this.obj.lang.tools.clear + "</div>\n\t\t\t\t\t\t\t\t<div class=\"button " + (this.config.showsubmit ? 'no-right-line' : '') + "\"\n\t\t\t\t\t\t\t\t\tstyle=\"display:" + (this.config.shownow ? 'blcok' : 'none') + "\" \n\t\t\t\t\t\t\t\t\tonclick=\"" + this.config.calendarName + ".changeToToday()\">" + this.obj.lang.tools.now + "</div>\n\t\t\t\t\t\t\t\t<div class=\"button\" \n\t\t\t\t\t\t\t\t\tstyle=\"display:" + (this.config.showsubmit ? 'blcok' : 'none') + "\"\n\t\t\t\t\t\t\t\t\tonclick=\"" + this.config.calendarName + ".makeSureSelectTime()\">" + this.obj.lang.tools.confirm + "</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>";
				return html;
			}
			// day - top html   时间选择器选择年月块

		}, {
			key: "topCheckDayHTML",
			value: function topCheckDayHTML(json) {
				var html = "\t\n\t\t<div onclick=\"" + this.config.calendarName + ".preMonth(" + json.year + "," + json.month + ")\" class=\"icom left\"></div>";
				if (this.config.lang == 'cn') {
					html += "<div class=\"center\">\n\t\t\t\t<span onclick=\"" + this.config.calendarName + ".getYearHtml(" + json.year + ")\">" + json.year + "\u5E74</span>\n\t\t\t\t<span onclick=\"" + this.config.calendarName + ".getMonthHtml(" + json.month + ")\">" + json.month + "\u6708</span>\n\t\t\t</div>";
				} else {
					html += "<div class=\"center\">\n\t\t\t\t<span onclick=\"" + this.config.calendarName + ".getMonthHtml(" + json.month + ")\">" + this.weekToEn(json.month) + "</span>\n\t\t\t\t<span onclick=\"" + this.config.calendarName + ".getYearHtml(" + json.year + ")\">" + json.year + "</span>\n\t\t\t</div>";
				}
				html += "<div onclick=\"" + this.config.calendarName + ".nextMonth(" + json.year + "," + json.month + ")\" class=\"icom right\"></div>";

				return html;
			}

			// day - main html 时间选择器选择日期块

		}, {
			key: "mainCheckDayHTML",
			value: function mainCheckDayHTML(json) {
				var html = "\n\t\t<div class=\"week-day\"><table class=\"day\" border=\"0\" cellspacing=\"0\">\n\t\t\t<tr>";
				for (var j = 0, len = 7; j < len; j++) {
					html += "<th>" + this.obj.lang.weeks[j] + "</th>";
				}
				html += "</tr>";
				for (var i = 0, _len = json.datalist.length; i < _len; i++) {
					var className = json.datalist[i].class || "";
					if (json.datalist[i].day === parseInt(json.today) && json.datalist[i].daytype === 'now') {
						className += " active";
					}
					//如果超出min时间或者max时间的，给禁止选中样式
					if (this.config.min != '' && new Date(json.datalist[i].fullday).getTime() < new Date(this.config.min).getTime() || this.config.max != '' && new Date(json.datalist[i].fullday).getTime() > new Date(this.config.max).getTime()) {
						className += " calendar-disabled";
					}

					if (i == 0) {
						html += "<tr><td data-time=\"" + json.datalist[i].fullday + "\" class=\"" + className + "\">" + json.datalist[i].day + "</td>";
					} else if (i == _len - 1) {
						html += "<td data-time=\"" + json.datalist[i].fullday + "\" class=\"" + className + "\">" + json.datalist[i].day + "</td></tr>";
					} else {
						if ((i + 1) % 7 == 0) {
							html += "<td data-time=\"" + json.datalist[i].fullday + "\" class=\"" + className + "\">" + json.datalist[i].day + "</td></tr><tr>";
						} else {
							html += "<td data-time=\"" + json.datalist[i].fullday + "\" class=\"" + className + "\">" + json.datalist[i].day + "</td>";
						}
					}
				}

				html += "</table></div>";
				return html;
			}

			// year - top html 时间选择器选择年份状态头部

		}, {
			key: "topCheckYearHTML",
			value: function topCheckYearHTML(json) {
				var html = "\n\t\t<div class=\"icom left\" onclick=\"" + this.config.calendarName + ".perYear(" + json.nowyear + ")\"></div>\n\t\t<div class=\"center\">\n\t\t\t<span>" + json.firstYear + (this.config.lang == 'cn' ? '年' : '') + "</span>-\n\t\t\t<span>" + json.lastYear + (this.config.lang == 'cn' ? '年' : '') + "</span>\n\t\t</div>\n\t\t<div class=\"icom right\" onclick=\"" + this.config.calendarName + ".nextYear(" + json.nowyear + ")\"></div>";
				return html;
			}
			// year - main html 时间选择器选择年份状态内容块

		}, {
			key: "mainCheckYearHTML",
			value: function mainCheckYearHTML(json) {
				var html = "<div class=\"week-day\">\n\t\t\t<table class=\"day\" border=\"0\" cellspacing=\"0\">";
				for (var i = 0, len = json.datalist.length; i < len; i++) {
					var className = json.datalist[i].class || "";
					if (json.datalist[i].year === json.nowyear) {
						className += " active";
					}
					if (i == 0) {
						html += "<tr><td data-year=\"" + json.datalist[i].year + "\" class=\"" + className + "\">" + json.datalist[i].year + (this.config.lang == 'cn' ? '年' : '') + "</td>";
					} else if (i == len - 1) {
						html += "<td data-year=\"" + json.datalist[i].year + "\" class=\"" + className + "\">" + json.datalist[i].year + (this.config.lang == 'cn' ? '年' : '') + "</td></tr>";
					} else {
						if ((i + 1) % 3 == 0) {
							html += "<td data-year=\"" + json.datalist[i].year + "\" class=\"" + className + "\">" + json.datalist[i].year + (this.config.lang == 'cn' ? '年' : '') + "</td></tr><tr>";
						} else {
							html += "<td data-year=\"" + json.datalist[i].year + "\" class=\"" + className + "\">" + json.datalist[i].year + (this.config.lang == 'cn' ? '年' : '') + "</td>";
						}
					}
				}
				html += "</table>\n\t\t</div>";
				return html;
			}

			// month -top html 时间选择器选择月份头部

		}, {
			key: "topCheckMonthHTML",
			value: function topCheckMonthHTML(json) {
				var html = "\n\t\t<div class=\"icom left\" onclick=\"" + this.config.calendarName + ".perMonthYear(" + json.year + "," + json.nowmonth + ")\"></div>\n\t\t<div class=\"center\">\n\t\t\t<span>" + json.year + "\u5E74</span>\n\t\t</div>\n\t\t<div class=\"icom right\" onclick=\"" + this.config.calendarName + ".nextMonthYear(" + json.year + "," + json.nowmonth + ")\"></div>";
				return html;
			}
			// month -main html 时间选择器选择月份状态内容块

		}, {
			key: "mainCheckMonthHTML",
			value: function mainCheckMonthHTML(json) {
				var html = "<div class=\"week-day\">\n\t\t\t<table class=\"day\" border=\"0\" cellspacing=\"0\">";
				for (var i = 0, len = json.datalist.length; i < len; i++) {
					var className = json.datalist[i].class || "";
					if (i + 1 === json.nowmonth) {
						className += " active";
					}
					if (i == 0) {
						html += "<tr><td data-month=\"" + (i + 1) + "\" data-year=\"" + json.year + "\" class=\"" + className + "\">" + json.datalist[i] + "</td>";
					} else if (i == len - 1) {
						html += "<td data-month=\"" + (i + 1) + "\" data-year=\"" + json.year + "\" class=\"" + className + "\">" + json.datalist[i] + "</td></tr>";
					} else {
						if ((i + 1) % 3 == 0) {
							html += "<td data-month=\"" + (i + 1) + "\" data-year=\"" + json.year + "\" class=\"" + className + "\">" + json.datalist[i] + "</td></tr><tr>";
						} else {
							html += "<td data-month=\"" + (i + 1) + "\" data-year=\"" + json.year + "\" class=\"" + className + "\">" + json.datalist[i] + "</td>";
						}
					}
				}
				html += "</table>\n\t\t</div>";
				return html;
			}

			// time -top  html 时间选择器选择时间状态头部

		}, {
			key: "topCheckTimeHTML",
			value: function topCheckTimeHTML() {
				var html = "<div class=\"center\"><span>" + this.obj.lang.timeTips + "</span></div>";
				return html;
			}
			// time -main html 时间选择器选择时间状态内容块

		}, {
			key: "mainCheckTimeHTML",
			value: function mainCheckTimeHTML(json) {
				var html = "<div class=\"week-day\"><ul class=\"nav\"><li>" + this.obj.lang.time[0] + "</li><li>" + this.obj.lang.time[1] + "</li><li>" + this.obj.lang.time[2] + "</li></ul><div class=\"select-time\">\n\t\t\t\t<ul class=\"hour\">";
				for (var i = 0, len = json.hours.length; i < len; i++) {
					var className = '';
					if (json.hours[i] == json.hour) className = 'active';
					html += "<li class=\"" + className + "\" data-time=\"" + json.hours[i] + "\">" + json.hours[i] + "</li>";
				}
				html += "</ul><ul class=\"minute\">";
				for (var _i = 0, _len2 = json.minutes.length; _i < _len2; _i++) {
					var _className = '';
					if (json.minutes[_i] == json.minute) _className = 'active';
					html += "<li class=\"" + _className + "\" data-time=\"" + json.minutes[_i] + "\">" + json.minutes[_i] + "</li>";
				}
				html += "</ul><ul class=\"second\">";
				for (var _i2 = 0, _len3 = json.seconds.length; _i2 < _len3; _i2++) {
					var _className2 = '';
					if (json.seconds[_i2] == json.second) _className2 = 'active';
					html += "<li class=\"" + _className2 + "\" data-time=\"" + json.seconds[_i2] + "\">" + json.seconds[_i2] + "</li>";
				}
				html += "</ul></div></div>";
				return html;
			}

			// time -bottom html 时间选择器日期/时间切换块

		}, {
			key: "bottomCheckTimeHTML",
			value: function bottomCheckTimeHTML() {
				var html = '';
				if (this.obj.handleType === 'time') {
					html += "<div class=\"left button\" onclick=\"" + this.config.calendarName + ".backDateHtml()\">" + this.obj.lang.dateTips + "</div>";
				} else {
					html += "<div class=\"left button\" onclick=\"" + this.config.calendarName + ".getTimeHtml()\">" + this.obj.lang.timeTips + "</div>";
				}
				return html;
			}

			// 插件位置定位并显示

		}, {
			key: "elemEventPoint",
			value: function elemEventPoint(e) {
				this.obj.calendar = this.$obj;
				var screenClientHeight = document.documentElement.clientHeight;
				var screenScrolTop = document.documentElement.scrollTop;
				var objOffsetTop = e.target.offsetTop;
				var objOffsetLeft = e.target.offsetLeft;
				var objOffsetHeight = e.target.offsetHeight;
				var objBotton = screenClientHeight - (objOffsetTop + objOffsetHeight + this.obj.behindTop - screenScrolTop);
				this.obj.calendar.style.display = 'block';
				this.obj.calendarHeight = this.$obj.offsetHeight;
				// 设置插件point位置
				if (this.config.calendarName.indexOf('DOUBLE') !== -1) {
					this.obj.calendar.style.left = objOffsetLeft + this.config.width + 'px';
				} else {
					this.obj.calendar.style.left = objOffsetLeft + 'px';
				};

				objBotton > this.obj.calendarHeight ?
				//插件在input框之下 
				this.obj.calendar.style.top = objOffsetTop + objOffsetHeight + this.obj.behindTop + 'px' :
				//插件在input框之上
				this.obj.calendar.style.top = objOffsetTop - this.obj.behindTop - this.obj.calendarHeight + 'px';
			}

			// 插件数据渲染

		}, {
			key: "getTimeDates",
			value: function getTimeDates(deraultDay) {
				var timeDatas = [];
				var date = deraultDay ? new Date(deraultDay) : new Date();
				var year = date.getFullYear();
				var month = date.getMonth() + 1;
				var toDate = date.getDate();
				var weekday = date.getDay();
				var hour = date.getHours();
				var minute = date.getMinutes();
				var second = date.getSeconds();
				month = (month + '').length < 2 ? '0' + month : month;
				toDate = (toDate + '').length < 2 ? '0' + toDate : toDate;
				hour = (hour + '').length < 2 ? '0' + hour : hour;
				minute = (minute + '').length < 2 ? '0' + minute : minute;
				second = (second + '').length < 2 ? '0' + second : second;

				// 计算当前这个月的天数
				var monTotalDay = new Date(year, month, 0).getDate();

				// 计算第一天是周几
				var firstDayMeek = new Date(year + "/" + month + "/1").getDay();
				var lastDayMeek = new Date(year + "/" + month + "/" + monTotalDay).getDay();
				var preweek = null;
				var preday = null;
				// 计算需要补充的时间
				if (firstDayMeek > 0) {
					var preMonTotalDay = new Date(year, month - 1, 0).getDate();
					var _preyear = year;
					var _premonth = month - 1;
					if (_premonth === 0) {
						_preyear = year - 1;
						_premonth = 12;
					}
					for (var i = 0, len = firstDayMeek; i < len; i++) {
						var day = preMonTotalDay - i;
						_premonth = (_premonth + '').length < 2 ? '0' + _premonth : _premonth;
						day = (day + '').length < 2 ? '0' + day : day;

						timeDatas.push({
							day: preMonTotalDay - i,
							week: len - 1 - i,
							class: 'light',
							daytype: "pre",
							fullday: _preyear + "/" + _premonth + "/" + day
						});
					}
				}
				timeDatas = timeDatas.reverse();
				for (var _i3 = 0, _len4 = monTotalDay; _i3 < _len4; _i3++) {
					var _weekday = (firstDayMeek + _i3) % 7;
					var _premonth2 = month;
					var _day = _i3 + 1;
					_premonth2 = (_premonth2 + '').length < 2 ? '0' + _premonth2 : _premonth2;
					_day = (_day + '').length < 2 ? '0' + _day : _day;

					timeDatas.push({
						day: _i3 + 1,
						week: _weekday,
						daytype: "now",
						fullday: year + "/" + _premonth2 + "/" + _day
					});
					if (_i3 === _len4 - 1) {
						preweek = _weekday;
						preday = _i3 + 1;
					}
				}

				var totalLength = timeDatas.length;
				var haveNeedLength = 42 - totalLength;

				var preyear = year;
				var premonth = parseInt(month) + 1;
				if (premonth === 13) {
					preyear = year + 1;
					premonth = 1;
				}

				for (var i = 0; i < haveNeedLength; i++) {
					var _weekday2 = (preweek + 1 + i) % 7;
					var _day2 = i + 1;
					premonth = (premonth + '').length < 2 ? '0' + premonth : premonth;
					_day2 = (_day2 + '').length < 2 ? '0' + _day2 : _day2;

					timeDatas.push({
						day: i + 1,
						week: _weekday2,
						class: 'light',
						daytype: "next",
						fullday: preyear + "/" + premonth + "/" + _day2
					});
				}
				return {
					year: year,
					month: month,
					today: toDate,
					hour: hour,
					minute: minute,
					second: second,
					datalist: timeDatas
				};
			}

			// 选择上一月

		}, {
			key: "preMonth",
			value: function preMonth(year, month) {
				month = month - 1;
				if (month == 0) {
					month = 12;
					year = year - 1;
				}
				var fulldate = year + "/" + month + "/" + this.obj.fulldatas.today;
				this.judgeCalendarRender('day', fulldate);
			}

			// 选择下一月

		}, {
			key: "nextMonth",
			value: function nextMonth(year, month) {
				month = month + 1;
				if (month == 13) {
					month = 1;
					year = year + 1;
				}
				var fulldate = year + "/" + month + "/" + this.obj.fulldatas.today;
				this.judgeCalendarRender('day', fulldate);
			}

			// 获得年月日,如果showtime=true,日期加样式，如果为false,直接设置当前选择的日期

		}, {
			key: "getDay",
			value: function getDay() {
				var _this = this;
				var objs = this.$obj.querySelector('.main-check-day').querySelectorAll('td');
				// 绑定单击
				this.on(objs, 'click', function (e) {
					if (!_this.hasClass(e.target, 'calendar-disabled')) {
						//有calendar-disabled样式的不赋予事件
						var dataTime = this.getAttribute('data-time');
						var arr = dataTime.split('/');
						_this.obj.fulldatas.year = arr[0];
						_this.obj.fulldatas.month = arr[1];
						_this.obj.fulldatas.today = arr[2];

						//选择具体日期添加样式
						_this.forEach(objs, function (index, item) {
							_this.removeClass(item, 'active');
						});
						_this.addClass(this, 'active');

						if (!_this.config.showtime) {
							var value = _this.obj.fulldatas.year + "/" + _this.obj.fulldatas.month + "/" + _this.obj.fulldatas.today;
							_this.getYearMonthAndDay(value);
						}
					}
				});
				// 绑定双击
				this.on(objs, 'dblclick', function (e) {
					if (e.type === 'dblclick') _this.makeSureSelectTime();
				});
			}

			// 获得年html

		}, {
			key: "getYearHtml",
			value: function getYearHtml(year) {
				year = year || new Date().getFullYear();
				var yearDatas = {
					nowyear: year,
					datalist: []
				};
				for (var i = 0; i < this.obj.totalYear; i++) {
					var getyear = year - Math.floor(this.obj.totalYear / 2) + i;
					if (i === 0) yearDatas.firstYear = getyear;
					if (i === this.obj.totalYear - 1) yearDatas.lastYear = getyear;
					yearDatas.datalist.push({
						class: '',
						year: getyear
					});
				}
				this.judgeCalendarRender('year', yearDatas);
			}

			// 上一年

		}, {
			key: "perYear",
			value: function perYear(year) {
				year = year - this.obj.totalYear;
				this.getYearHtml(year);
			}

			// 下一年

		}, {
			key: "nextYear",
			value: function nextYear(year) {
				year = year + this.obj.totalYear;
				this.getYearHtml(year);
			}

			// 获得年

		}, {
			key: "getYear",
			value: function getYear() {
				var _this = this;
				var objs = this.$obj.querySelector('.main-check-year').querySelectorAll('td');
				this.on(objs, 'click', function (e) {
					var year = e.target.getAttribute('data-year');

					var fulldate = year + "/" + _this.obj.fulldatas.month + "/" + _this.obj.fulldatas.today;
					if (_this.config.type === 'year') {
						_this.getYearMonthAndDay(year, false);
					} else {
						_this.judgeCalendarRender('day', fulldate);
					}
				});
			}

			// 获得month html

		}, {
			key: "getMonthHtml",
			value: function getMonthHtml(month) {
				var date = new Date();
				var year = this.obj.fulldatas.year || date.getFullYear();
				month = month || date.getMonth() + 1;

				var monthDatas = {
					nowmonth: month,
					year: year,
					datalist: this.obj.lang.month
				};
				this.judgeCalendarRender('month', monthDatas);
			}

			// 上一月

		}, {
			key: "perMonthYear",
			value: function perMonthYear(year, month) {
				var monthDatas = {
					nowmonth: month,
					year: year - 1,
					datalist: this.obj.lang.month
				};
				this.judgeCalendarRender('month', monthDatas);
			}

			// 下一月

		}, {
			key: "nextMonthYear",
			value: function nextMonthYear(year, month) {
				var monthDatas = {
					nowmonth: month,
					year: year + 1,
					datalist: this.obj.lang.month
				};
				this.judgeCalendarRender('month', monthDatas);
			}

			// 获得月

		}, {
			key: "getMonth",
			value: function getMonth() {
				var _this = this;
				var objs = this.$obj.querySelector('.main-check-month').querySelectorAll('td');
				this.on(objs, 'click', function (e) {
					var year = e.target.getAttribute('data-year');
					var month = e.target.getAttribute('data-month');

					var fulldate = year + "/" + month + "/" + _this.obj.fulldatas.today;
					if (_this.config.type === 'month') {
						_this.getYearMonthAndDay(month, false);
					} else {
						_this.judgeCalendarRender('day', fulldate);
					}
				});
			}

			// 选择时间

		}, {
			key: "getTimeHtml",
			value: function getTimeHtml() {
				var date = new Date();
				var hour = date.getHours();
				var minute = date.getMinutes();
				var second = date.getSeconds();
				hour = (hour + '').length < 2 ? '0' + hour : hour;
				minute = (minute + '').length < 2 ? '0' + minute : minute;
				second = (second + '').length < 2 ? '0' + second : second;

				this.obj.fulldatas.hour = this.obj.fulldatas.hour || hour;
				this.obj.fulldatas.minute = this.obj.fulldatas.hour || minute;
				this.obj.fulldatas.second = this.obj.fulldatas.hour || second;

				var datas = {
					hour: this.obj.fulldatas.hour,
					minute: this.obj.fulldatas.minute,
					second: this.obj.fulldatas.second,
					hours: [],
					minutes: [],
					seconds: []
				};
				for (var i = 0; i < 24; i++) {
					if (i < 10) {
						datas.hours.push('0' + i);
					} else {
						datas.hours.push(i + '');
					}
				}
				for (var i = 0; i < 60; i++) {
					if (i < 10) {
						datas.minutes.push('0' + i);
						datas.seconds.push('0' + i);
					} else {
						datas.minutes.push(i + '');
						datas.seconds.push(i + '');
					}
				}
				this.judgeCalendarRender('time', datas);
			}

			// 选择时间

		}, {
			key: "selectTime",
			value: function selectTime() {
				var _this = this;
				var hourObjs = this.$obj.querySelector('ul.hour').querySelectorAll('li');
				var minuteObjs = this.$obj.querySelector('ul.minute').querySelectorAll('li');
				var secondObjs = this.$obj.querySelector('ul.second').querySelectorAll('li');

				this.on(hourObjs, 'click', function (e) {
					_this.forEach(hourObjs, function (index, item) {
						_this.removeClass(item, 'active');
					});
					_this.addClass(this, 'active');
					_this.obj.fulldatas.hour = this.getAttribute('data-time');
				});

				this.on(minuteObjs, 'click', function (e) {
					_this.forEach(minuteObjs, function (index, item) {
						_this.removeClass(item, 'active');
					});
					_this.addClass(this, 'active');
					_this.obj.fulldatas.minute = this.getAttribute('data-time');
				});

				this.on(secondObjs, 'click', function (e) {
					_this.forEach(secondObjs, function (index, item) {
						_this.removeClass(item, 'active');
					});
					_this.addClass(this, 'active');
					_this.obj.fulldatas.second = this.getAttribute('data-time');
				});
			}

			// 返回日期

		}, {
			key: "backDateHtml",
			value: function backDateHtml() {
				this.obj.handleType = 'date';
				var bottomHTML = this.bottomCheckTimeHTML();
				this.$obj.querySelector('.btn-select-time').innerHTML = bottomHTML;
				this.showOrHide(this.$obj.querySelectorAll('.common-top'), 'hide');
				this.showOrHide(this.$obj.querySelectorAll('.common-main'), 'hide');
				this.$obj.querySelector('.main-check-day').style.display = 'block';
				this.$obj.querySelector('.top-check-day').style.display = 'block';
			}

			// 今天

		}, {
			key: "changeToToday",
			value: function changeToToday() {
				var json = this.getTimeDates();
				var value = null;
				var isFormat = true;
				if (this.config.showtime) {
					value = json.year + "/" + json.month + "/" + json.today + " " + json.hour + ":" + json.minute + ":" + json.second;
				} else if (this.config.type == 'time') {
					isFormat = false;
					value = json.hour + ":" + json.minute + ":" + json.second;
				} else {
					value = json.year + "/" + json.month + "/" + json.today;
				}
				this.getYearMonthAndDay(value, isFormat);
			}

			// 清空

		}, {
			key: "cleanInputVal",
			value: function cleanInputVal() {
				var value = "";
				this.getYearMonthAndDay(value, false);
			}

			// 确定

		}, {
			key: "makeSureSelectTime",
			value: function makeSureSelectTime() {
				var value = null;
				var isFormat = true;
				if (this.config.showtime) {
					value = this.obj.fulldatas.year + "/" + this.obj.fulldatas.month + "/" + this.obj.fulldatas.today + " " + this.obj.fulldatas.hour + ":" + this.obj.fulldatas.minute + ":" + this.obj.fulldatas.second;
				} else if (this.config.type == 'time') {
					isFormat = false;
					value = this.obj.fulldatas.hour + ":" + this.obj.fulldatas.minute + ":" + this.obj.fulldatas.second;
				} else {
					value = this.obj.fulldatas.year + "/" + this.obj.fulldatas.month + "/" + this.obj.fulldatas.today;
				}
				this.getYearMonthAndDay(value, isFormat);
			}

			// 确定年月日的值并在input里面显示，时间选择器隐藏

		}, {
			key: "getYearMonthAndDay",
			value: function getYearMonthAndDay(datatime) {
				var isFormat = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

				var formatTime = isFormat ? new Date(datatime).Format(this.config.format) : datatime;
				if (this.obj.input.nodeName !== 'INPUT') {
					this.obj.input.textContent = formatTime;
				} else {
					this.obj.input.value = formatTime;
				}
				this.$obj.style.display = "none";
				this.config.done && this.config.done(formatTime);
				if (this.obj.initVal != formatTime && this.config.change) this.config.change(formatTime);
			}

			// 判断插件渲染类型 day | year | month | time

		}, {
			key: "judgeCalendarRender",
			value: function judgeCalendarRender(type, any) {
				var mainHTML = void 0,
				    topHTML = void 0,
				    bottomHTML = void 0;
				switch (type) {
					case 'day':
						this.obj.handleType = 'day';
						var json = this.getTimeDates(any);
						this.obj.fulldatas = json;
						topHTML = this.topCheckDayHTML(json);
						mainHTML = this.mainCheckDayHTML(json);
						this.$obj.querySelector('.top-check-day').innerHTML = topHTML;
						this.$obj.querySelector('.main-check-day').innerHTML = mainHTML;
						this.showOrHide(this.$obj.querySelectorAll('.common-top'), 'hide');
						this.showOrHide(this.$obj.querySelectorAll('.common-main'), 'hide');
						this.$obj.querySelector('.main-check-day').style.display = 'block';
						this.$obj.querySelector('.top-check-day').style.display = 'block';
						// 计算表格高度
						this.countHeight('.main-check-day', 7);
						this.getDay();
						break;
					case 'year':
						this.obj.handleType = 'year';
						mainHTML = this.mainCheckYearHTML(any);
						topHTML = this.topCheckYearHTML(any);
						this.$obj.querySelector('.main-check-year').innerHTML = mainHTML;
						this.$obj.querySelector('.top-check-year').innerHTML = topHTML;
						this.showOrHide(this.$obj.querySelectorAll('.common-top'), 'hide');
						this.showOrHide(this.$obj.querySelectorAll('.common-main'), 'hide');
						this.$obj.querySelector('.main-check-year').style.display = 'block';
						this.$obj.querySelector('.top-check-year').style.display = 'block';
						// 计算表格高度
						this.countHeight('.main-check-year', 6);
						this.getYear();
						break;
					case 'month':
						this.obj.handleType = 'month';
						mainHTML = this.mainCheckMonthHTML(any);
						topHTML = this.topCheckMonthHTML(any);
						this.$obj.querySelector('.main-check-month').innerHTML = mainHTML;
						this.$obj.querySelector('.top-check-month').innerHTML = topHTML;
						this.showOrHide(this.$obj.querySelectorAll('.common-top'), 'hide');
						this.showOrHide(this.$obj.querySelectorAll('.common-main'), 'hide');
						this.$obj.querySelector('.main-check-month').style.display = 'block';
						this.$obj.querySelector('.top-check-month').style.display = 'block';
						// 计算表格高度
						this.countHeight('.main-check-month', 4);
						this.getMonth();
						break;
					case 'time':
						this.obj.handleType = 'time';
						mainHTML = this.mainCheckTimeHTML(any);
						topHTML = this.topCheckTimeHTML();
						bottomHTML = this.bottomCheckTimeHTML();
						this.$obj.querySelector('.main-check-time').innerHTML = mainHTML;
						this.$obj.querySelector('.top-check-time').innerHTML = topHTML;
						this.$obj.querySelector('.btn-select-time').innerHTML = bottomHTML;
						this.showOrHide(this.$obj.querySelectorAll('.common-top'), 'hide');
						this.showOrHide(this.$obj.querySelectorAll('.common-main'), 'hide');
						this.$obj.querySelector('.main-check-time').style.display = 'block';
						this.$obj.querySelector('.top-check-time').style.display = 'block';
						var hourScrollTop = this.$obj.querySelector('ul.hour').querySelector('li.active').offsetTop;
						var minuteScrollTop = this.$obj.querySelector('ul.minute').querySelector('li.active').offsetTop;
						var secondScrollTop = this.$obj.querySelector('ul.second').querySelector('li.active').offsetTop;
						this.$obj.querySelector('ul.hour').scrollTop = hourScrollTop - 150;
						this.$obj.querySelector('ul.minute').scrollTop = minuteScrollTop - 150;
						this.$obj.querySelector('ul.second').scrollTop = secondScrollTop - 150;
						this.selectTime();
						break;
				}
			}

			//插件自身点击阻止冒泡

		}, {
			key: "calendarClick",
			value: function calendarClick() {
				this.on(this.obj.calendar, 'click', function (e) {
					e.preventDefault();
					e.stopPropagation();
				});
			}

			// 继承方法

		}, {
			key: "extend",
			value: function extend(obj1, obj2) {
				return Object.assign(obj1, obj2);
			}
		}, {
			key: "hasClass",
			value: function hasClass(obj, cls) {
				return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
			}
		}, {
			key: "addClass",
			value: function addClass(obj, cls) {
				if (!this.hasClass(obj, cls)) obj.className += " " + cls;
			}
		}, {
			key: "removeClass",
			value: function removeClass(obj, cls) {
				if (this.hasClass(obj, cls)) {
					var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
					obj.className = obj.className.replace(reg, ' ');
				}
			}

			//对象遍历

		}, {
			key: "forEach",
			value: function forEach(obj, fn) {
				var key = void 0;
				if (typeof fn !== 'function') return this;
				obj = obj || [];
				if (Object.prototype.toString.call(obj) == '[object Object]') {
					for (key in obj) {
						if (fn.call(obj[key], key, obj[key])) break;
					}
				} else if (Object.prototype.toString.call(obj) == '[object NodeList]' || Object.prototype.toString.call(obj) == '[object Array]') {
					for (key = 0; key < obj.length; key++) {
						if (fn.call(obj[key], key, obj[key])) break;
					}
				} else {
					fn.call(obj, 0, obj);
				}
				return this;
			}
		}, {
			key: "on",


			//事件绑定
			value: function on(obj, eventName, fn) {
				return this.forEach(obj, function (index, item) {
					item.attachEvent ? item.attachEvent('on' + eventName, function (e) {
						e.target = e.srcElement;
						fn.call(item, e);
					}) : item.addEventListener(eventName, fn, false);
				});
			}
		}, {
			key: "weekToEn",


			//中英文月份枚举
			value: function weekToEn(val) {
				var num = typeof val == 'string' ? parseInt(val) : val;
				return this.obj.en.month[num - 1];
			}

			// 

		}, {
			key: "showOrHide",
			value: function showOrHide(obj, type) {
				for (var i = 0, len = obj.length; i < len; i++) {
					if (type === 'hide') {
						obj[i].style.display = 'none';
					} else {
						obj[i].style.display = 'block';
					}
				}
			}

			//解除事件

		}, {
			key: "off",
			value: function off(obj, eventName, fn) {
				return this.forEach(obj, function (index, item) {
					item.detachEvent ? item.detachEvent('on' + eventName, fn) : item.removeEventListener(eventName, fn, false);
				});
			}
		}, {
			key: "countHeight",


			// 计算table tr高度
			value: function countHeight(elename, length) {
				var mainH = this.$obj.querySelector('.main').offsetHeight;
				var trObj = this.$obj.querySelector(elename).querySelectorAll('tr');
				var itemH = Math.floor(mainH / length);
				this.forEach(trObj, function (index, item) {
					item.style.height = itemH + 'px';
				});
			}

			// document点击隐藏插件

		}, {
			key: "documentClick",
			value: function documentClick() {
				var _this3 = this;

				this.on(document, 'click', function (e) {
					if (!_this3.obj.calendar) return;
					_this3.obj.calendar.style.display = 'none';
				});
			}
		}]);

		return calendar;
	}();

	;

	// double 事件选择器

	var doubleCalendar = function doubleCalendar() {
		_classCallCheck(this, doubleCalendar);
	};

	// 实例化日期插件


	var zaneDate = function zaneDate(option) {
		option.type = option.type || 'day';

		if (option.type.indexOf('double') != -1) {
			option.type = 'day';
			createCalendar();
			createCalendar('DOUBLE');
		} else {
			createCalendar();
		}

		// 新建日期插件
		function createCalendar() {
			var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

			var calendarName = option.elem.substring(1);
			calendarName = calendarName.replace(/[_-]/g, '').toUpperCase();

			option.calendarName = calendarName + str;
			if (option.width) {
				option.width = option.width < 260 ? 260 : option.width;
				option.width = option.width > 500 ? 500 : option.width;
			}
			window[option.calendarName] = new calendar(option);
		}
	};
	if (!noGlobal) window.zaneDate = zaneDate;

	return zaneDate;
});