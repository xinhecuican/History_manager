
const kColors = ['#4688F1', '#E8453C', '#F9BB2D', '#3AA757'];
var MIN_CACHE_SIZE = 100;
var MAX_CACHE_SIZE = 500;
var DAY = 24 * 60 * 60 * 1000;
var monthDay = [31,0,31,30,31,30,31,31,30,31,30,31];
var now_date = new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000 - 1);
var block_id = 0;
var history_days = [];
var cache_days = [];
var cache_sum = 0;
var pre_cache_days = [];
var pre_cache_sum = 0;
var cache_state = 0;
var is_searching = false;
var loadable = true;
var history_panel = document.getElementById("history_panel");
var same_times = 0;

class History_item
{
	
	constructor(domain)
	{
		this.id = 0;
		this.domain = domain;
		this.url = '';
		this.items = []
	}

	push(item)
	{
		if(this.url == '')
		{
			this.url = item.url;
		}
		this.items.push(item);
	}

	is_multi()
	{
		return this.items.length >= 2;
	}
}
class History_day
{
	constructor(id, date)
	{
		this.id = id;
		this.date = date;
		this.data = [];
		this.inhtml_sum = 0;
	}

	add_data(history_item)
	{
		history_item.id = this.data.length;
		this.data.push(history_item);
	}

	cacheSum()
	{
		let ans = 0;
		for(let ele of this.data)
		{
			ans += ele.items.length;
		}
		return ans;
	}
}

function create_day_block()
{
	let history_day = new History_day(block_id, now_date);
	block_id++;
	if(!cache_state)
		cache_days.push(history_day);
	else
	{
		cache_state = 1;
		pre_cache_days.push(history_day);
	}
	return history_day;
}

function decideState()
{
	if(cache_sum > MIN_CACHE_SIZE && cache_state == 0)
	{
		cache_state = 1;
	}
	else if(pre_cache_sum == 0 && cache_state == 1)
	{
		cache_state = 0;
	}
}

function add_data_to_cache(result)
{
	if(result == null)
		return;
	let temp_date = new Date(result.lastVisitTime);
	if(now_date.getTime() <= temp_date.getTime())
	{
		same_times++;
		return;
	}
	same_times = 0;
	decideState();
	let days = cache_state == 1 ? pre_cache_days : cache_days;
	let domain = result.url.split('/')[2];
	if( days.length != 0 && is_same_day(now_date, temp_date))//不在同一天
	{
		
		let day = days[days.length-1];
		let item = day.data[day.data.length-1];
		if(item.domain == domain)
		{
			day.data[day.data.length-1].push(result);
		}
		else
		{
			let ans_item = new History_item(domain);
			ans_item.push(result);
			days[days.length-1].add_data(ans_item);
		}
	}
	else
	{
		now_date = temp_date;
		let day_block = create_day_block();
		let item = new History_item(domain);
		item.push(result);
		day_block.add_data(item);
	}
	if(!cache_state)
		cache_sum++;
	else
		pre_cache_sum++;
	now_date = temp_date;
}

function get_history(callback, donefunc=null, begin_date=null)
{
	let end_time = now_date.getTime()-1;
	query = {
		text: '',
		startTime: 0,
		endTime: end_time,
		maxResults: MIN_CACHE_SIZE
	};
	chrome.history.search(query, (results)=>{
		if(results.length != 0)
		{
			for(let result of results)
			{
				// console.log(result.title, result.visitCount, result.typedCount);
				add_data_to_cache(result);
			}
			callback(donefunc, begin_date);
		}
		else
		{
			if(donefunc != null)
			{
				donefunc();
			}
			is_searching = false;
		}
	});
}

function load(donefunc=null, begin_date=null)
{
	if($("#history_panel").height() - $(window).scrollTop() - window.innerHeight < 1200
	||(begin_date != null && begin_date.getDay() == now_date.getDay()))
	{
		print_to_html();
	}
	while(cache_sum < MIN_CACHE_SIZE && pre_cache_sum != 0)
	{
		cache_days.push(pre_cache_days[0]);
		cache_sum += pre_cache_days[0].cacheSum();
		pre_cache_sum -= pre_cache_days[0].cacheSum();
		pre_cache_days.shift();                                        
	}
	if(pre_cache_sum < MAX_CACHE_SIZE && same_times < 50)
	{
		is_searching = true;
		get_history(load, donefunc, begin_date);
	}
	else
	{
		if(donefunc != null)
		{
			donefunc();
		}
		is_searching = false;
	}
}

function init()
{
	block_id = 0;
	history_days = [];
	history_panel.innerHTML = '';
	cache_days = [];
	cache_sum = 0;
	pre_cache_days = [];
	pre_cache_sum = 0;
	cache_state = 0;
	same_times = 0;
	loadable = true;
}

function first_load()
{
	init();
	chrome.runtime.sendMessage("history", (data)=>{
		if(data != null)
		{
			let latest_history=data.history;
			for(let i = (latest_history.tail-1 +latest_history.limit) % latest_history.limit; i!=latest_history.head; i=(i - 1 + latest_history.limit) % latest_history.limit)	
			{
				add_data_to_cache(latest_history.list[i]);
			}
		}
		print_to_html();
		if(data != null && data.loadTab){
			printRecentCloseTabs(data.tabs)
		}
		load();
	});

}

document.addEventListener("DOMContentLoaded", first_load);

window.addEventListener("scroll", throttle(()=>{
	if(!is_searching && loadable)
	{
		load();
	}
},100));

window.addEventListener('scroll', throttle(function(e){
	let top_location = $(window).scrollTop() + 40;
	let now_day = document.getElementById("active_day");
	if(now_day == null)
		return;
	let now_div = now_day.parentElement;
	if(top_location < getEleTop(now_day))
	{
		while(now_div.previousElementSibling != null)
		{
			now_div = now_div.previousElementSibling;
			let day = now_div.firstElementChild;
			if(top_location > getEleTop(day))
			{
				now_day.removeAttribute("id");
				day.id = "active_day";
				curDate = new Date(day.innerHTML);
				showCld(curDate);
				break;
			}
		}
	}
	else
	{
		while(now_div.nextElementSibling != null)
		{
			now_div = now_div.nextElementSibling;
			let day = now_div.firstElementChild;
			if(top_location < getEleTop(day))
			{
				day = now_div.previousElementSibling.firstElementChild;
				if(day.innerHTML == now_day.innerHTML)break;
				now_day.removeAttribute("id");
				day.id = "active_day";
				curDate = new Date(day.innerHTML);
				showCld(curDate);
				break;
			}
			else if(top_location > getEleTop(day) && now_div.nextElementSibling == null)
			{
				if(day.innerHTML == now_day.innerHTML)break;
				now_day.removeAttribute("id");
				day.id = "active_day";
				curDate = new Date(day.innerHTML);
				showCld(curDate);
			}

		}
	}
}, 100));

// search
function search_back(results)
{
	now_date = new Date();
	init();
	for(let result of results)
	{
		add_data_to_cache(result);
	}
	print_to_html();
	loadable = false;
}