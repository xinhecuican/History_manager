
var historyDiv = document.getElementById('history_panel');
const kColors = ['#4688F1', '#E8453C', '#F9BB2D', '#3AA757'];
var MIN_CACHE_SIZE = 150;
var DAY = 24 * 60 * 60 * 1000;
var monthDay = [31,0,31,30,31,30,31,31,30,31,30,31];
var now_date = new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000 - 1);//当天23.59
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
	now_date = new Date(now_date.getTime() - DAY);
	block_id++;
	history_days.push(history_day);
	return history_day;
}

function get_day_history(callback)
{
	let end_time = now_date.getTime() + 1000 * 60;
	now_date = new Date(now_date.getTime() - DAY);
	query = {
		text: '',
		startTime: now_date.getTime(),
		endTime: end_time
	};
	chrome.history.search(query, (results)=>{
		if(results.length != 0)
		{
			let day = create_day_block();
			let domain = results[0].url.split('/')[2];
			let item = new History_item(domain);
			for(let result of results)
			{
				let result_domain = result.url.split('/');
				if(result_domain[2] != domain)
				{
					domain = result_domain[2];
					day.add_data(item);
					item = new History_item(domain);
					item.push(result);
				}
				else
				{
					item.push(result);
				}
			}
			day.add_data(item);
			cache_days.push(day);
			cache_sum += day.data.length;
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
		get_day_history(load);
	}
}

function init()
{
	now_date = new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000 - 1);
	block_id = 0;
	history_days = [];
	historyDiv.innerHTML = '';
	get_day_history(load);
}

document.addEventListener("DOMContentLoaded", function(){
	init();
});

window.addEventListener("scroll", ()=>{
	load();
});