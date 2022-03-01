
var historyDiv = document.getElementById('history_panel');
const kColors = ['#4688F1', '#E8453C', '#F9BB2D', '#3AA757'];
var MIN_CACHE_SIZE = 150;
var DAY = 24 * 60 * 60 * 1000;
var monthDay = [31,0,31,30,31,30,31,31,30,31,30,31];
var now_date = new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000 - 1);
var block_id = 0;
var history_days = [];
var cache_days = [];
var cache_sum = 0;
var is_searching = false;
var loadable = true;

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
}

function create_day_block()
{
	let history_day = new History_day(block_id, now_date);
	block_id++;
	cache_days.push(history_day);
	return history_day;
}

function add_data_to_cache(result)
{
	let temp_date = new Date(result.lastVisitTime);
	if(now_date < temp_date)
	{
		return;
	}
	cache_sum++;
	let domain = result.url.split('/')[2];
	if( cache_days.length != 0 && is_same_day(now_date, temp_date))//不在同一天
	{
		
		let day = cache_days[cache_days.length-1];
		let item = day.data[day.data.length-1];
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
	else
	{
		now_date = temp_date;
		let day_block = create_day_block();
		let item = new History_item(domain);
		item.push(result);
		day_block.add_data(item);
	}
	now_date = temp_date;
}

function get_history(callback)
{
	let end_time = now_date.getTime()-1;
	console.log(now_date);
	query = {
		text: '',
		startTime: 0,
		endTime: end_time,
		maxResults: MIN_CACHE_SIZE+1
	};
	chrome.history.search(query, (results)=>{
		if(results.length != 0)
		{
			for(let result of results)
			{
				add_data_to_cache(result);
			}
			callback();
		}
	});
}

function load()
{
	if($("#history_panel").height() - $(window).scrollTop() - window.innerHeight < 300)
	{
		print_to_html();
	}
	if(cache_sum < MIN_CACHE_SIZE)
	{
		is_searching = true;
		get_history(load);
	}
	else
	{
		is_searching = false;
	}
}

function init()
{
	block_id = 0;
	history_days = [];
	historyDiv.innerHTML = '';
	cache_days = [];
	cache_sum = 0;
	loadable = true;
}

function first_load()
{
	init();
	let latest_history = chrome.extension.getBackgroundPage().latest_history;
	for(let i = (latest_history.tail-1 +latest_history.limit) % latest_history.limit; i!=latest_history.head; i=(i - 1 + latest_history.limit) % latest_history.limit)	
	{
		add_data_to_cache(latest_history.list[i]);
	}
	print_to_html();
	load();
}

document.addEventListener("DOMContentLoaded", first_load);

window.addEventListener("scroll", ()=>{
	if(!is_searching && loadable)
	{
		load();
	}
});

// search
function search_back(results)
{
	now_date = new Date();
	init();
	for(let result of results)
	{
		console.log(result);
		add_data_to_cache(result);
	}
	print_to_html();
	loadable = false;
}

document.getElementById("searchSubmit").addEventListener("click", (event)=>{
	let val = $("#searchInput").val();
	if(val != "")
	{
		chrome.history.search({text: val, startTime:0, maxResults: 1500}, search_back);
	}
	else
	{
		now_date = new Date();
		first_load();
	}
});