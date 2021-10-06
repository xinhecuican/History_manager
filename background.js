function History_items()
{
	this.domain = "";
	this.list = [];
}

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

History_pool.prototype.push = function(key, item)
{
	if(!this.empty())
	{
		let tail = (this.tail - 1 + this.limit) % this.limit;
		if(this.list[tail].domain == key)
		{
			this.list[tail].list.push(item);
			return false;
		}
		else
		{
			let items = new History_items();
			items.domain = key;
			items.list.push(item);
			if(this.full())
			{
				this.list[this.tail] = items;
				this.pop();
			}
			else
			{
				this.list[this.tail] = items;
			}
			this.tail_forward();
		}
	}
	else
	{
		let items = new History_items();
		items.domain = key;
		items.list.push(item);
		this.list[this.tail] = items;
		this.tail_forward();
	}
	return true;
}

History_pool.prototype.unshift = function(key, item)
{
	let head = (this.head - 1) < 0 ? this.limit-1 : this.head-1;
	if(!this.empty())
	{
		if(this.list[this.head].domain == key)
		{
			this.list[this.head].list.push(item);
			return false;
		}
		else
		{
			let items = new History_items();
			items.domain = key;
			items.list.push(item);
			if(this.full())
			{
				this.list[head] = items;
				this.tail = this.tail - 1 < 0 ? this.limit-1 : this.tail-1;
			}
			else
			{
				this.list[head] = items;
			}
			this.head = head;
		}
	}
	else
	{
		let items = new History_items();
		items.domain = key;
		items.list.push(item);
		this.list[head] = items;
		this.head = head;
	}
	return true;
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
latest_history.set_limit(10);

function reset(results)
{
	let count = 0;
	for(let result of results)
	{
		let domain = result.title;
		let ans = latest_history.unshift(domain, result);
		if(ans)
		{
			count++;
		}
		if(count >= latest_history.limit)
		{
			break;
		}
	}
	console.log(latest_history);
}

chrome.history.search({text:'', maxResults: 199}, reset);

chrome.history.onVisited.addListener(function(historyItem){
	latest_history.push(historyItem.title, historyItem);
	console.log(latest_history);
});

chrome.history.onVisitRemoved.addListener((result)=>{
	chrome.history.search({text:'', maxResults: 199}, reset);
})

