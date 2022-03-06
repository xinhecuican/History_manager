
/*判断某年是否是闰年*/
function isLeap(year) {
    if((year%4==0 && year%100!=0) || year%400==0){
        return true;
    }
    else{
        return false; 
    }
}
/*判断某年某月某日是星期几，默认日为1号*/
function whatDay(year, month, day=1) {
    var sum = 0;
    sum += (year-1)*365+Math.floor((year-1)/4)-Math.floor((year-1)/100)+Math.floor((year-1)/400)+day;
    for(var i=0; i<month-1; i++){
        sum += monthDay[i];
    }
    if(month > 2){
        if(isLeap(year)){ 
            sum += 29; 
        }
        else{
             sum += 28; 
        }
    }
    return sum%7;      //余数为0代表那天是周日，为1代表是周一，以此类推
}

function initCld()
{
	$('#cldFrame').datepicker({
		changeMonth: true,
		changeYear: true,
		showButtonPanel: true,
		onSelect: function(dateText, inst){
			now_date = new Date(dateText);
			now_date.setDate(now_date.getDate() + 1);
			init();
			load();
		}
	});
}

/*显示日历*/
function showCld(date){
	console.log(date);
	$('#cldFrame').datepicker("setDate", date);
}

var curDate = new Date();
var curYear = curDate.getFullYear();
var curMonth = curDate.getMonth() + 1;
initCld();
showCld(curDate);