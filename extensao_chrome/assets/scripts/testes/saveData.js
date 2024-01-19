//  Globally

document.getElementById("dados").innerHTML = '';

chrome.storage.sync.set({ "yourBody": "myBody" }, function(){});

chrome.storage.sync.get(["yourBody"], function(items){
    //items = [ { "yourBody": "myBody" } ]

    document.getElementById("dados").innerHTML += items.yourBody;
});

//  Local

chrome.storage.local.set({ "phasersTo": "awesome" }, function(){ });

chrome.storage.local.get(/* String or Array */["phasersTo"], function(items){
    //items = [ { "phasersTo": "awesome" } ]

    document.getElementById("dados").innerHTML += '<br />' + items.phasersTo;
});

// localStorage
localStorage["inputText"] = 'MEU VALOR'; 
document.getElementById("dados").innerHTML += '<br />' + localStorage["inputText"];