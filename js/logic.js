
var historyDiv = document.getElementById('history_panel');
const kColors = ['#4688F1', '#E8453C', '#F9BB2D', '#3AA757'];
var MIN_CACHE_SIZE = 150;
var DAY = 24 * 60 * 60 * 1000;
var monthDay = [31,0,31,30,31,30,31,31,30,31,30,31];
var now_date = new Date();
var block_id = 0;
var history_days = [];
var cache_days = [];
var cache_sum = 0;

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
		if(this.url = '')
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
		this.date = new Date(date.setHours(0, 0, 0, 0));
		this.data = [];
	}

	add_data(history_item)
	{
		history_item.id = this.data.length;
		this.data.push(history_item);
	}
}

function create_day_block()
{
	let history_day = new History_day(block_id, now_date);
	now_date = new Date(now_date.getTime());
	block_id++;
	cache_days.push(history_day);
	return history_day;
}

function add_data_to_cache(result)
{
	let temp_date = result.lastVisitTime;
	if(now_date.getTime() < temp_date)
	{
		return;
	}
	cache_sum++;
	let domain = result.url.split('/')[2];
	if( cache_days.length == 0 || !is_same_day(cache_days[cache_days-1].date, new Date(result.lastVisitTime)))//不在同一天
	{
		now_date = result;
		let day_block = create_day_block();
		let item = new History_item(domain);
		item.push(result);
		day_block.add_data(item);
	}
	else
	{
		let day = cache_days[cache_days.length-1];
		let item = day.data[data.data.length-1];
		if(item.domain == domain)
		{
			day.data[day.data.length-1].push(result);
		}
		else
		{
			let ans_item = new History_item(domain);
			ans_item.push(result);
			cache_days[cache_days.length-1].add_data(ans_item);
		}
	}
}

function get_history(callback)
{
	let end_time = now_date.getTime();
	query = {
		text: '',
		endTime: end_time,
		maxResults: MIN_CACHE_SIZE
	};
	chrome.history.search(query, (results)=>{
		if(results.length != 0)
		{
			for(let result of results)
			{
				add_data_to_cache(result);
			}
		}
		callback();
	});
}

function load()
{
	if($(document).height() - $(window).scrollTop() - window.innerHeight < 300)
	{
		print_to_html();
	}
	if(cache_sum < MIN_CACHE_SIZE)
	{
		get_history(load);
	}
}

function init()
{
	now_date = new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000 - 1);
	block_id = 0;
	history_days = [];
	historyDiv.innerHTML = '';
}

document.addEventListener("DOMContentLoaded", function(){
	init();
	let latest_history = chrome.extension.getBackgroundPage().latest_history;
	console.log(latest_history);
	for(let i = latest_history.tail-1; i!=latest_history.head; i=(i - 1 + latest_history.limit) % latest_history.limit)	
	{
		add_data_to_cache(latest_history.list[i]);
	}
});

window.addEventListener("scroll", ()=>{
	load();
});