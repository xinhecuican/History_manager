function is_same_day(d1, d2)
{
	return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function dateFormat(fmt,date)   
{ //author: meizz   
  var o = {   
    "M+" : date.getMonth()+1,                 //月份   
    "d+" : date.getDate(),                    //日   
    "h+" : date.getHours(),                   //小时   
    "m+" : date.getMinutes(),                 //分   
    "s+" : date.getSeconds(),                 //秒   
    "q+" : Math.floor((date.getMonth()+3)/3), //季度   
    "S"  : date.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
} 

function throttle(func, wait, options) {
    let timeout, context, args
    let previous = 0
    if (!options) options = {}

    const later = function () {
      previous = options.leading === false ? 0 : new Date().getTime()
      timeout = null
      func.apply(context, args)
      if (!timeout) context = args = null
    }

    const throttled = function () {
      const now = new Date().getTime()
      if (!previous && options.leading === false) previous = now
      const remaining = wait - (now - previous)
      context = this
      args = arguments
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }
        previous = now
        func.apply(context, args)
        if (!timeout) context = args = null
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining)
      }
    }

    return throttled
  }

function getEleTop(ele){
	let actualTop = ele.offsetTop
	let current = ele.offsetParent

   	while (current !== null) {
    	actualTop += current.offsetTop
    	current = current.offsetParent
   	}
	return actualTop
}

function transformSpecialCharacter(str)
{
	let specialCharacterArray = [" ","<",">","&","\""];
	let specialCharacterCode = ["&nbsp;","&lt;","&gt;","&amp;","&quot;"];
	let newStr = "";
	let strLength = str.length;
	for(let i=0; i<strLength; i++)
	{
		let ch = str.substring(i, i+1);
		let is_specical = false;
		let loc = -1;
		for(let k=0; k<specialCharacterArray.length; k++)
		{
			if(specialCharacterArray[k] == ch)
			{
				is_specical = true;
				loc=  k;
				break;
			}
		}
		if(is_specical)
		{
			newStr += specialCharacterCode[loc];
		}
		else
		{
			newStr += ch;
		}
	}
	return newStr;
}

function getItemInfo(item, show_url)
{
	let show_title = item.title;
	if(!show_title)
	{
		show_title = "无标题";
	}
	if(show_title.length > 60)
	{
		show_title = show_title.substring(0, 60) + "...";
	}
	if(show_url.length > 42)
	{
		let url_length = show_url.length;
		show_url = show_url.substring(0,35) + "..." + show_url.substring(url_length - 4,url_length);
	}
	show_url = transformSpecialCharacter(show_url);
	show_title = transformSpecialCharacter(show_title);
	return {"url": show_url, "title": show_title, "time": new Date(item.lastVisitTime)};
}

function animateScroll(element,speed) {
    let rect=element.getBoundingClientRect();
    //获取元素相对窗口的top值，此处应加上窗口本身的偏移
    let top=window.pageYOffset+rect.top;
    let currentTop=0;
    let requestId;
    //采用requestAnimationFrame，平滑动画
    function step(timestamp) {
      currentTop+=speed;
      if(currentTop<=top){
        window.scrollTo(0,currentTop);
        requestId=window.requestAnimationFrame(step);
      }else{
        window.cancelAnimationFrame(requestId);
      }
    }
    window.requestAnimationFrame(step);
}