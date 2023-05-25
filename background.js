
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
  
History_pool.prototype.tailElement = function()
{
	return this.list[(this.tail-1 < 0 ? this.limit : this.tail - 1)];
}

History_pool.prototype.length = function()
{
	return this.head < this.tail ? this.tail - this.head : this.tail + this.limit - this.head;
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
		this.list.replace(this.tail, item);
		this.tail_forward();
	}
	else
	{
		this.list.replace(this.tail, item);
		this.head_forward();
		this.tail_forward();
	}
	
}

History_pool.prototype.unshift = function(item)
{
	let head = (this.head - 1) < 0 ? this.limit - 1 : this.head-1;
	if(this.full())
	{
		this.list[head] = item;
		this.tail = this.tail - 1 < 0 ? this.limit - 1: this.tail-1;
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
var loading_history_num = 0;
var search_times = 0;

var tabToUrl = {};
var tabInfo = [];
var tabs = {"time": 0, "tabs": []}

function onSearch(results)
{
	for(let result of results)
	{
		latest_history.unshift(result);
		if(latest_history.full())
			break;
	}
	if(!latest_history.full())
	{
		search_times++;
		if(search_times < 50)
			chrome.history.search({text:'', maxResults: 100, startTime: 0, endTime: results[results.length-1].lastVisitTime}, onSearch);
	}
}

function reset(results)
{
	latest_history.head = 0;
	latest_history.tail = 0;
	latest_history.list.length = 0;
	for(let result of results)
	{
		let ans = latest_history.unshift(result);
		if(latest_history.full())
			break;
	}
	if(!latest_history.full())
	{
		search_times++;
		if(search_times < 50)
			chrome.history.search({text:'', maxResults: 100, startTime: 0, endTime: results[results.length-1].lastVisitTime}, onSearch);
	}
	else
		search_times=0;
}

function onVisitedFunc(results)
{
	reset(results);
	loading_history_num = 0;
}

chrome.history.search({text:'', maxResults: 100, startTime: 0}, reset);

chrome.history.onVisited.addListener(function(historyItem){
	loading_history_num++;
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	if("title" in changeInfo && loading_history_num != 0)
	{
		chrome.history.search({text:'', maxResults: 100, startTime: 0}, onVisitedFunc);
	}
});

chrome.history.onVisitRemoved.addListener((result)=>{
	chrome.history.search({text:'', maxResults: 100, startTime: 0}, reset);
});

chrome.runtime.onMessage.addListener((message, sender, callback)=>{
	if(message == "history")
	{
		let index = (latest_history.tail-1 +latest_history.limit) % latest_history.limit
		let historyTime = BigInt(Math.floor(latest_history.list[index].lastVisitTime))
		let tabTime = BigInt(tabs.time)
		let tmp1 = historyTime
		let tmp2 = tabTime
		let historyMax = 0n
		let tabMax = 0n
		while(tmp1 != 0 || tmp2 != 0){
			if(tmp1 != 0){
				historyMax = historyMax + 1n
				tmp1 = tmp1 / 10n
			}
			if(tmp2 != 0){
				tabMax = tabMax + 1n
				tmp2 = tmp2 / 10n
			}
		}
		let redress = (10n ** (historyMax - tabMax))
		let historyLimitTime = historyTime / redress
		let loadTab = tabTime > historyLimitTime

		
		callback({"history": latest_history, "loadTab": loadTab && tabs.tabs.length != 0, "tabs": tabs.tabs});
	}
});

chrome.runtime.onInstalled.addListener(function() {
	chrome.contextMenus.create(
	{ 
		id: "history_manager_context_menu",
		title: "查找当天历史",
		documentUrlPatterns: ["chrome-extension://jknaabndcfakbnnpcckffmoimpoagffo/history.html"],
		contexts: ['link']
	});
});

chrome.contextMenus.onClicked.addListener(function(info, tab){
	if(info.menuItemId == "history_manager_context_menu")
	{
		chrome.runtime.sendMessage("context_menu", ()=>{});
	}
})

// chrome.tabs.onActivated.addListener((activeInfo)=>{
// 	chrome.tabs.get(activeInfo.tabId, (tab)=>{
// 		if(tab.pendingUrl == "chrome://history/" || tab.url == "chrome://history/")
// 		{
// 			chrome.contextMenus.update("history_manager_context_menu", {visible: true})
// 		}
// 		else
// 		{
// 			chrome.contextMenus.update("history_manager_context_menu", {visible: false})
// 		}
// 	})
// })




chrome.windows.onCreated.addListener(function(windowId){
	chrome.sessions.getRecentlyClosed((sessions)=>{
		console.log(sessions)
		for(let session of sessions){
			if(session.window != undefined){
				tabs = {"time": session.lastModified, "tabs": session.window.tabs}
				console.log(tabs)
				break
			}
		}
	})
	// chrome.storage.local.get("history_tab_data", function(result){
	// 	tabs = result['history_tab_data'];
	// })
})

// chrome.windows.onRemoved.addListener(function(windowId){
// 	console.log(tabInfo);
// 	ans = []
// 	for(let info of tabInfo){
// 		if(info != undefined){
// 			ans.push(info)
// 		}
// 	}
// 	tabs = {"time": new Date().getTime(), "tabs": ans}
// 	chrome.storage.local.set({"history_tab_data": tabs})
// 	tabInfo = []
// })




// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//     tabToUrl[tabId] = {"url": tab.url, "title": tab.title};
// });

// chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
// 	if(removeInfo.isWindowClosing){
// 		tabInfo.push(tabToUrl[tabId])
// 	}
// 	delete tabToUrl[tabId]
// });