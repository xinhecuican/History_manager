var latest_day = null;


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
const observer = lozad(); // lazy loads elements with default selector as '.lozad'

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

function create_item_div(list, day, item)
{
	let div = document.createElement('div');
	div.id = "b" + day.id.toString() + "i" + day.inhtml_sum.toString();
	day.inhtml_sum++;
	div.className = "panel_item";
	div.setAttribute('data-id', item.id);
	let info = getItemInfo(item.items[0], item.domain);
	let inner_html = '';
	inner_html += '<img class="panel_item_delete" src="../img/delete.png" width="16" height="16" style="display: none;"/>';
	if(item.is_multi())
		inner_html += '<img class="panel_item_add" src="../img/add.png"/>';
	else
		inner_html += '<img class="panel_item_add" height="16" width="16"/>';
	inner_html += `
						<span class="panel_item_time">${dateFormat("hh:mm:ss", info['time'])}</span>
						<span class="panel_item_title lozad" id="${"text" + div.id}" style="background-image: url(http://www.google.com/s2/favicons?domain_url=${item.url});">
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
						<span class="panel_item_title lozad" style="background-image: url(http://www.google.com/s2/favicons?domain_url=${item.url});">
						  <a title="${info['title']}" target="_blank" href="${info['url']}">${info['title']}</a>
						  <text class="panel_item_url">${info['url']}</text>
						</span>
					  `;
		children_div.innerHTML = inner_html;
		children.appendChild(children_div);
	}
	list.appendChild(div);
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
