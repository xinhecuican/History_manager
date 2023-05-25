var latest_day = null;
function create_day_div(day)
{
	let div = document.createElement('div');
	div.id = "b" + day.id.toString();
	div.className = "panel_day";
	var dic = document.createElement('div');
    dic.className = "history_list";
    div.appendChild(dic);
    history_panel.appendChild(div);
    history_days.push(day);
	latest_day = div;
	return dic;
}

function getDeltaTime(time)
{
	let date = new Date();
	date = date.getTime();
	let delta = parseInt(date-time);
	if(delta < 60 * 1000)
		return "刚才";
	else if(delta < 3600 * 1000)
		return (parseInt(delta/(60 * 1000))).toString() + "分钟前";
	else if(delta < 24 * 3600 * 1000)
		return (parseInt(delta/(3600 * 1000))).toString() + "小时前";
	else if(delta < 30 * 24 * 3600 * 1000)
		return (parseInt(delta/(24 * 3600 * 1000))).toString() + "天前";
	else if(delta < 365 * 24 * 3600 * 1000)
		return (parseInt(delta/(30 * 24 * 3600 * 1000))).toString() + "月前";
	else
		return (parseInt(delta/(365 * 24 * 3600 * 1000))).toString() + "年前";
}

function create_item_div(list, day, item)
{
	let div = document.createElement('div');
	div.id = "b" + day.id.toString() + "i" + day.inhtml_sum.toString();
	day.inhtml_sum++;
	div.className = "panel_pop_item";
	let info = getItemInfo(item, item.url);
	let time_str = getDeltaTime(item.lastVisitTime);
	let inner_html = '';
	inner_html += ``;
	inner_html += `<a title="${info['title']}" href="${item.url}">
						<span class="panel_item_pop_time">${time_str}</span>
						<span class="panel_item_pop_title" id="${"text" + div.id}" style="background-image: url(http://www.google.com/s2/favicons?domain_url=${item.url});">
						  ${info['title']}
						</span>
					</a>
					  `;
	div.innerHTML = inner_html;
	let a = div.querySelector('a');
	a.addEventListener('click', onClick);
	div.onmouseover = function(e){
			div.firstElementChild.firstElementChild.style.display = "block";
	};
	div.onmouseout = function(e){
		div.firstElementChild.firstElementChild.style.display = "none";
	}
	list.appendChild(div);
}

function create_list_items_div(list, day, items)
{
	for(let item of items)
	{
		for(let ele of item.items)
		{
			create_item_div(list, day, ele);
		}
	}
}

function createRecentTabDiv(list, day, tabs){
	let div = document.createElement('div');
	div.id = "recentTab";
	innerHTML = `<a title="最近关闭的${tabs.length}个标签页" target="_blank">
						<span class="panel_item_pop_title" id="${"text" + div.id}">
						  最近关闭的${tabs.length}个标签页
						</span>
					</a>`
	div.innerHTML = innerHTML
	let link = div.firstElementChild
	link.onclick = function(e){
		chrome.tabs.query({}, (tabs)=>{
			for(let tab of tabs){
				chrome.tabs.remove(tab.id)
			}
		})
		for(let tab of tabs){
			chrome.tabs.create({'url': tab.url})
			// window.open(tab.url, "_blank"); 
		}
	}
	list.insertBefore(div, list.firstElementChild)
}

function print_to_html()
{
	if(cache_days.length != 0 && history_days.length != 0)
	{
		while(cache_days.length != 0 && is_same_day(cache_days[0].date, history_days[history_days.length-1].date))
		{
			for(let data of cache_days[0].data)
			{
				history_days[history_days.length-1].add_data(data);
			}
			create_list_items_div(latest_day.children[0], history_days[history_days.length-1], cache_days[0].data);
			cache_days.shift();
		}
	}
	for(let day of cache_days)
	{
		let list = create_day_div(day);
		create_list_items_div(list, day, day.data);
	}
	cache_days.length = 0;
	cache_sum = 0;
}

function printRecentCloseTabs(tabs){
	if(history_days.length != 0){
		let searchDiv = `#b${history_days[0].id.toString()} .history_list`
		let topDay = $(searchDiv)[0]
		createRecentTabDiv(topDay, history_days[0], tabs)
	}
}

function onClick(event) {
	chrome.tabs.create({
		selected: true,
		url: event.currentTarget.href
	});
	return;
}

document.getElementById("brand").addEventListener("click", function(e){
	chrome.tabs.create({
		selected: true,
		url: "chrome://history"
	});
	return;
});