var latest_day = null;
var aside = document.getElementById("aside");
var post = document.getElementById("post");
var context_target = null;
var type_search = false;

function search_day(id)
{
	for(let day of history_days)
	{
		if(day.id == id)
		{
			return day;
		}
	}
	return null;
}

function create_day_div(day)
{
	let div = document.createElement('div');
	div.id = "b" + day.id.toString();
	div.className = "panel_day";
	let title = document.createElement("h3");
	title.innerText = day.date.toDateString();
	if(history_days.length == 0)
	{
		title.id = "active_day";
	}
	var dic = document.createElement('div');
    dic.className = "history_list";
	div.appendChild(title);
    div.appendChild(dic);
    history_panel.appendChild(div);
    history_days.push(day);
	latest_day = div;
	return dic;
}

function faviconURL(u) {
  const url = new URL(chrome.runtime.getURL('/_favicon/'));
  url.searchParams.set('pageUrl', u); // this encodes the URL as well
  return url.toString();
}

function create_item_div(list, day, item)
{
	let div = document.createElement('div');
	div.id = "b" + day.id.toString() + "i" + day.inhtml_sum.toString();
	day.inhtml_sum++;
	div.className = "panel_item";
	let info = getItemInfo(item.items[0], item.domain);
	let inner_html = '';
	inner_html += '<img class="panel_item_delete" src="../img/delete.png" width="16" height="16" style="display: none;"/>';
	if(item.is_multi())
		inner_html += '<img class="panel_item_add" src="../img/add.png"/>';
	else
		inner_html += '<img class="panel_item_add" height="16" width="16"/>';
	inner_html += `
						<span class="panel_item_time">${dateFormat("hh:mm:ss", info['time'])}</span>
						<span class="panel_item_title" id="${"text" + div.id}" style="background-image: url(${faviconURL(item.url)});">
						  <a title="${info['title']}" target="_blank" href="${item.url}">${info['title']}</a>
						  <text class="panel_item_url">${info['url']}</text> 
						  <div class="item_children" style="display: none;"></div>
						</span>
					  `;
	div.innerHTML = inner_html;
	div.firstElementChild.onclick = function(e){
		for(let ele of item.items)
		{
			chrome.history.deleteUrl({url: ele.url});
		}
		list.removeChild(div);
	};
	let children = div.lastElementChild.lastElementChild;
	if(item.is_multi())
	{
		div.children[1].onclick = function(e){
			
			if(children.style.display == "none")
			{
				children.style.display = "block";
			}
			else
			{
				children.style.display = "none";
			}
		};
	}
	for(let data of item.items)
	{
		info = getItemInfo(data, data.url);
		let children_div = document.createElement('div');
		children_div.className = "panel_item";
		inner_html =  `
						<span class="panel_item_time">${dateFormat("hh:mm:ss", info['time'])}</span>
						<span class="panel_item_title" style="background-image: url(chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${item.url});">
						  <a title="${info['title']}" target="_blank" href="${data.url}">${info['title']}</a>
						  <text class="panel_item_url">${info['url']}</text>
						</span>
					  `;
		children_div.innerHTML = inner_html;
		children.appendChild(children_div);
	}
	list.appendChild(div);
}

function createRecentTabDiv(list, day, tabs){
	let div = document.createElement('div');
	div.id = "recentTab";
	let innerHTML = '<img class="panel_item_add" src="../img/add.png"/>';
	innerHTML += 	`
						<span class="panel_item_title" id="${"text" + div.id}">
						  <a title="最近关闭的${tabs.length}个标签页" target="_blank">最近关闭的${tabs.length}个标签页</a>
						  <div class="item_children" style="display: none;"></div>
						</span>
					`;
	div.innerHTML = innerHTML
	let children = div.lastElementChild.lastElementChild;
	div.children[0].onclick = function(e){
		if(children.style.display == "none")
			children.style.display = "block";
		else
			children.style.display = "none";
	};
	let link = div.lastElementChild.firstElementChild
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
	for(let data of tabs){
		let children_div = document.createElement('div');
		children_div.className = "panel_item";
		innerHTML =  `
						<span class="panel_item_title" style="background-image: url(chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${data.url});">
						  <a title="${data.title}" target="_blank" href="${data.url}">${data.title}}</a>
						  <text class="panel_item_url">${data.url}</text>
						</span>
					  `;
		children_div.innerHTML = innerHTML;
		children.appendChild(children_div);
	}
	list.insertBefore(div, list.firstElementChild)
}

function create_list_items_div(list, day, items)
{
	let sum = 0;
	for(let item of items)
	{
		create_item_div(list, day, item);
	}
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
			create_list_items_div(latest_day.children[1], history_days[history_days.length-1], cache_days[0].data);
			cache_days.shift();
		}
	}
	for(let day of cache_days)
	{
		let list = create_day_div(day);
		create_list_items_div(list, day, day.data);
	}
	aside.style.height = post.offsetHeight;
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

document.getElementById("searchInput").addEventListener("keydown", function(e){
	if(e.key == "Enter")
	{
		onSearch();
	}
});

function onSearch()
{
	let val = $("#searchInput").val();
	if(val != "")
	{
		chrome.history.search({text: val, startTime:0, maxResults: 1500}, search_back);
		type_search = true;
	}
	else
	{
		now_date = new Date();
		first_load();
		type_search = false;
	}
	window.scrollTo(0, 0);
}

document.getElementById("delete_one").addEventListener("click", (e)=>{
	let items = document.getElementsByClassName('panel_item_delete');
	if(items[0].style.display == 'none')
	{
		for(let item of items)
		{
			item.style.display = 'block';
		}
	}
	else
	{
		for(let item of items)
		{
			item.style.display = 'none';
		}
	}
});

document.getElementById("delete_all").addEventListener("click", (e)=>{
	chrome.history.deleteAll(()=>{first_load();});
});

var scrollAction = {x: 'undefined', y: 'undefined'}, scrollDirection;
  
//判断页面滚动方向
function scrollFunc() {
    if (typeof scrollAction.x == 'undefined') {
      scrollAction.x = window.pageXOffset;
      scrollAction.y = window.pageYOffset;
    }
    let diffX = scrollAction.x - window.pageXOffset;
    let diffY = scrollAction.y - window.pageYOffset;
    if (diffX < 0) {
    // Scroll right
      scrollDirection = 'right';
    } else if (diffX > 0) {
    // Scroll left
      scrollDirection = 'left';
    } else if (diffY < 0) {
    // Scroll down
      scrollDirection = 'down';
    } else if (diffY > 0) {
    // Scroll up
      scrollDirection = 'up';
    } else {
    // First scroll event
    }
    scrollAction.x = window.pageXOffset;
    scrollAction.y = window.pageYOffset;
}

window.addEventListener("scroll", throttle((e)=>{
	let nav = document.getElementById("navbar");
	if($(window).scrollTop() < 1)
	{
		nav.style.boxShadow = "";
	}
	else
	{
		nav.style.boxShadow = "0 7px 5px -5px #333";
	}
},100));

document.addEventListener("contextmenu", (e)=>{
	context_target = e.target;
});

chrome.runtime.onMessage.addListener((message, sender, callback)=>{
	if(message == "context_menu")
	{
		if(context_target == null){return;}
		let item = context_target.parentNode.parentNode;
		let day = item.parentNode.parentNode;
		console.log(item.id)
		let pattern = /b(.*)i(.*)/;
		let day_data = search_day(parseInt(day.id.substring(1)));
		let item_data = day_data.data[item.id.split(pattern)[2]];
		let date = day_data.date;
		now_date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23 ,59 ,59, 0);
		init();
		showCld(now_date)
		load(()=>{
			if(!type_search)
			{
				let new_item = $(`#b0${item.id.substring(2)}`)[0];
				if(new_item != null)
				{
					new_item.scrollIntoView()
				}
			}
			else
			{
				for(let item of history_days[0].data)
				{
					for(let ele of item.items)
					{
						if(ele.id == item_data.items[0].id)
						{
							let new_item = $(`#b0i${item.id}`)[0];
							if(new_item != null)
							{
								new_item.scrollIntoView();
							}
							break;
						}
					}
				}
				type_search = false;
			}
		}, now_date);
	}
	callback()
});
