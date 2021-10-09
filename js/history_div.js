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
    return newStr;
}

function create_day_div(day)
{
	let div = document.createElement('div');
	div.id = "b" + day.id.toString();
	div.className = "panel_day";
	let title = document.createElement("h3");
	title.innerText = day.date.toDateString();
	var dic = document.createElement('dic');
    dic.className = "history_list";
	div.appendChild(title);
    div.appendChild(dic);
    document.getElementById("history_panel").appendChild(div);
    history_days.push(day);
	return dic;
}

function create_list_item_div(list, day)
{
	let sum = 0;
	for(let item of day.data)
	{
		let div = document.createElement('div');
		div.id = "b" + day.id.toString() + "i" + sum.toString();
		div.className = "panel_item";
		let show_url = item.is_multi() ? item.domain : item.url;
		let show_title = item.items[0].title;
		if(!show_title)
		{
			show_title = "无标题";
		}
		if(show_url.length > 42)
		{
			show_url = show_url.substring(0,35) + "..." + show_url.substring(url_length - 4,url_length);
		}
		let time = new Date(item.items[0].lastVisitTime);

		let inner_html = `<li>
							<span class="panel_item_title" id="${"text" + div.id}" style="background-image: url(chrome://favicon/${item.url})>
							  <a href="${item.url}">${show_title}</a>
							  <text class="panel_item_url">${show_url}</text>
							</span>
							<span class="panel_item_time">${time.toTimeString()}</span>
						  </li>`;
		div.innerHTML = inner_html;
		list.appendChild(div);
	}
}

function print_to_html()
{
	for(let day of cache_days)
	{
		let list = create_day_div(day);
		create_list_item_div(list, day);
	}
	cache_days.length = 0;
	cache_sum = 0;
}
