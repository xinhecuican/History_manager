
function History_pool()
{
	this.list = [];
	this.limit = 0;
	this.head = 0;
	this.tail = 0;
}

Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
}

Array.prototype.replace = function(index, item)
{
	this.splice(index, 1, item);
}

History_pool.prototype.empty = function()
{
	return this.head == this.tail;
}

History_pool.prototype.set_limit = function(limit)
{
	this.limit = limit + 1;
	this.list = new Array(this.limit);
}

History_pool.prototype.remove = function(index)
{
	if(this.head <= this.tail && (index < this.head || index >=this.tail))
	{
		return undefined;
	}
	if(this.head > this.tail && (index < 0 || index >= this.limit || (index >= this.tail && index < this.head)))
	{
		return undefined;
	}
	let item = this.list[index];
	this.list.splice(index, 1);
	return item;
}

History_pool.prototype.full = function()
{
	return (this.tail + 1) % this.limit == this.head;
}

History_pool.prototype.head_forward = function()
{
	this.head = (this.head + 1) % this.limit;
}

History_pool.prototype.tail_forward = function()
{
	this.tail = (this.tail + 1) % this.limit;
}

History_pool.prototype.push = function(item)
{
	if(!this.full())
	{
		this.list.push(item);
		this.tail_forward();
	}
	else
	{
		this.list.push(item);
		this.head_forward();
		this.tail_forward();
	}
	
}

History_pool.prototype.unshift = function(item)
{
	let head = (this.head - 1) < 0 ? this.limit-1 : this.head-1;
	if(this.full())
	{
		this.list[head] = item;
		this.tail = this.tail - 1 < 0 ? this.limit - 1 : this.tail - 1;
	}
	else
	{
		this.list[head] = item;
	}
	this.head = head;
}

History_pool.prototype.pop = function()
{
	if(this.empty())
	{
		return;
	}
	this.head_forward();
}

var latest_history = new History_pool();
latest_history.set_limit(70);


function reset(results)
{
	latest_history.head = 0;
	latest_history.tail = 0;
	latest_history.list.length = 0;
	let count = 0;
	for(let result of results)
	{
		let ans = latest_history.unshift(result);
		count++;
		if(count >= latest_history.limit)
		{
			break;
		}
	}
}

chrome.history.search({text:'', maxResults: 1000}, reset);

chrome.history.onVisited.addListener(function(historyItem){
	latest_history.push(historyItem);
});

chrome.history.onVisitRemoved.addListener((result)=>{
	chrome.history.search({text:'', maxResults: 1000}, reset);
});