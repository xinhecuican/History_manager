
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

/*显示日历*/
function showCld(year, month, firstDay){
	$('#cldFrame').datepicker({
		changeMonth: true,
		changeYear: true,
		showButtonPanel: true,
		onSelect: function(dateText, inst){
			console.log(dateText);
			now_date = new Date(dateText);
			now_date.setDate(now_date.getDate() + 1);
			init();
			load();
		}
	});
    // var i;
    // var tagClass = "";
    // var nowDate = new Date();
    
    // var days;//从数组里取出该月的天数
    // if(month == 2){
    //     if(isLeap(year)){
    //         days = 29;
    //     }
    //     else{
    //         days = 28;
    //     }
    // }
    // else{
    //     days = monthDay[month-1];
    // }

    // /*当前显示月份添加至顶部*/
    // var topDate = document.getElementById('topDate');
	// if(curYear == curDate.getFullYear() && curMonth == curDate.getMonth() + 1)
	// {
	// 	topDate.style.color = "rgb(255, 0, 0)";
	// }
	// else
	// {
	// 	topDate.style.color = "rgb(0, 0, 0)";
	// }
	// topDate.appendChild(createList("date_year", "date_year_select", "year"));
	// topDate.appendChild(createList("date_month", "date_month_select", "month")); 

	// var tbody = document.getElementById('tbody');
	// tbody.innerHTML = "";
	// let tr = document.createElement("tr");
	// for(let i=0; i<firstDay; i++)
	// {
	// 	let td = document.createElement("td");
	// 	tr.appendChild(td);
	// }
	// let changLine = firstDay;
	// for(let i=1; i<=days; i++)
	// {
	// 	if(year == nowDate.getFullYear() && month == nowDate.getMonth()+1 && i == nowDate.getDate()) {
    //         tagClass = "curDate";//当前日期对应格子
    //     } 
    //     else{ 
    //         tagClass = "isDate";//普通日期对应格子，设置class便于与空白格子区分开来
    //     }  
	// 	let date_id = "day" + i;
	// 	let td = document.createElement("td");
	// 	td.className = tagClass;
	// 	td.id = date_id;
	// 	td.innerText = i;
	// 	td.addEventListener("click", function(){
	// 		now_date = new Date(curYear, curMonth-1, td.innerText, 23, 59, 59, 59);
	// 		init();
	// 		load();
	// 	});
	// 	tr.appendChild(td);
	// 	changLine = (changLine + 1) % 7;
	// 	if(changLine == 0 && i != days)//是否换行填充的判断
    //     {
	// 		tbody.appendChild(tr);
	// 		tr = document.createElement("tr");
	// 	}
	// }
	// if(changLine != 0)
	// {
	// 	for(let i=changLine; i<7; i++)
	// 	{
	// 		let td = document.createElement("td");
	// 		tr.appendChild(td);
	// 	}
	// }
	// tbody.appendChild(tr);
}

var curDate = new Date();
var curYear = curDate.getFullYear();
var curMonth = curDate.getMonth() + 1;
showCld(curYear,curMonth,whatDay(curYear,curMonth));

function nextMonth(){
	curMonth = curMonth + 1;
	if(curMonth > 12)
	{
		curMonth = 1;
		curYear++;
	}
    document.getElementById('topDate').innerHTML = '';
    showCld(curYear, curMonth, whatDay(curYear, curMonth));
}
function preMonth(){
    curMonth = curMonth - 1;
	if(curMonth < 1)
	{
		curMonth = 12;
		curYear--;
	}
    document.getElementById('topDate').innerHTML = '';
    showCld(curYear, curMonth, whatDay(curYear, curMonth));
}

// document.getElementById('right').onclick = function(){
//     nextMonth();
// }
// document.getElementById('left').onclick = function(){
//     preMonth();
// }