var EXPORTED_SYMBOLS = ["Affiliate"];
var Affiliate = {};
(function(Affiliate){
	Components.utils.import("resource://modules/util.js");
	var cookieManager2 = Utils.getService("@mozilla.org/cookiemanager;1","nsICookieManager2"),
	    converter = Utils.getService("@mozilla.org/intl/scriptableunicodeconverter","nsIScriptableUnicodeConverter"),
	    istream = Utils.getService("@mozilla.org/io/string-input-stream;1","nsIStringInputStream"),
        timer = Utils.getService("@mozilla.org/timer;1","nsITimer");
    converter.charset = "UTF-8";
    
    Affiliate.affiliateName = "";
    Affiliate.initialized = false;
	Affiliate.params = {};
	Affiliate.merchants = {};
	Affiliate.updateURI = "";
	Affiliate._isUpToDate = false;
	Affiliate._isUpdating = false;
	Affiliate._callbackList = [];
    Affiliate.checkUpdate = function(callback){
		var Affiliate = this;
		typeof callback === "function" && Affiliate._callbackList.push(callback);
		if(Affiliate._isUpdating){
			return;
		}
		Affiliate._isUpdating = true;
		if(Affiliate._isUpToDate){
			Utils.log(Affiliate.affiliateName+" is uptodate ");
			Affiliate._callbackList.forEach(function(callback){callback();});
			return Affiliate._isUpdating = false,Affiliate._isUpToDate;
		}
//		var channel = NetUtil.newChannel("http://localhost/html/Affiliate.json", "UTF-8", null);
//		var lastModified ;
//		var listener = {
//		    observe : function(aSubject, aTopic, aData) {
//		    // Make sure it is our connection first.
//		    	if (aSubject == channel) {
//			        var httpChannel = aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);
//			        if (aTopic == "http-on-examine-response") {
//						channel.QueryInterface(Components.interfaces.nsIHttpChannel);
//						lastModified = channel.getResponseHeader("Last-Modified");
//						Utils.log(lastModified);
//						if(lastModified != Utils.getPreference("Affiliate.json.lastModified")){
//							
//						}else{
//							Utils.jsonLoad("Affiliate",Affiliate,function(json){
//								if(json){
//							    	this.merchants = json;
//							    	this.initialized = true;
//							    	Utils.log("get merchants from file");
//							    }else{
//							    	Utils.log("get merchants from file failed");
//							    }
//							});
//							channel = null;
//						}
//			        }
//		     	}
//		  	},
//		  
//			QueryInterface : function(aIID) {
//			if (aIID.equals(Components.interfaces.nsISupports) ||
//			    aIID.equals(Components.interfaces.nsIObserver))
//			  return this;
//			throw Components.results.NS_NOINTERFACE;
//			}
//		};
//		var observerService = Components.classes["@mozilla.org/observer-service;1"]
//	                                .getService(Components.interfaces.nsIObserverService);
//	    observerService.addObserver(listener, "http-on-examine-response", false);
//		NetUtil.asyncFetch(channel,function(aInputStream,aResult,aRequest){
//			if (!Components.isSuccessCode(aResult)) {
//				return;
//			}
//			var json = NetUtil.readInputStreamToString(aInputStream,aInputStream.available());
//			try {
//				json = JSON.parse(json);
//                json = JSON.stringify(Affiliate.merchants =json);//minify the json data
//			} catch (ex) {
//                return;
//				Utils.log("parse json error");
//			}
//            Affiliate.initialized = true;
//            istream.setData(json,json.length);
//			Utils.jsonSave2("Affiliate",Affiliate,istream,function(){
//				Utils.setPreference("Affiliate.json.lastModified",lastModified);
//			});
//			Utils.log("get merchants from net");
//		});
		Utils.jsonLoad(Affiliate.affiliateName,Affiliate,function(json){
	        if(json){
	        	this.merchants = json;
	        	this._isUpToDate = true;
	        	Utils.log("get merchants from file ");
	        }else{
	        	var channel = NetUtil.newChannel(Affiliate.updateURI, "UTF-8", null);
				NetUtil.asyncFetch(channel,function(aInputStream,aResult,aRequest){
					if (!Components.isSuccessCode(aResult)) {
						return;
					}
					var json = NetUtil.readInputStreamToString(aInputStream,aInputStream.available());
					try {
						json = JSON.parse(json);
                        json = JSON.stringify(Affiliate.merchants =json);//minify the json data
					} catch (ex) {
                        return;
						Utils.log("parse json error");
					}
                    Affiliate._isUpToDate = true;
                    istream.setData(json,json.length);
					Utils.jsonSave2(Affiliate.affiliateName,Affiliate,istream,function(){});
					Utils.log("get merchants from net");
				});
	        }
	        Affiliate._callbackList.forEach(function(callback){callback();});
		});
		return Affiliate._isUpdating = false,Affiliate.isUpToDate;
	};
    Affiliate.analyze = function(aBrowser,webProgress,request,newLocation,PopupNotifications){
	    var Affiliate = this;
	    var merchant;
	    if(!Affiliate._isUpToDate || !(merchant = Affiliate.getMerchant(newLocation.host)))
	            return false;
	    var cookieFilter  = function(){
	        var name;
	        for (name in merchant.cookie){
	            var hasCookie = false;
	            for (var e = cookieManager2.getCookiesFromHost(merchant.host); e.hasMoreElements();) {
	                var cookie = e.getNext().QueryInterface(Components.interfaces.nsICookie2);
	                if(cookie.name === name && new RegExp(merchant.cookie[name]).test(cookie.value)){
	                    Utils.log(cookie.name+"\t"+cookie.value+"\n");
	                    hasCookie = true;
	                    break;
	                }
	            }
	            if(!hasCookie){
	                return true;
	            }
	        }
	        for (name in merchant.session){
	            var hasSession = false;
	            for (var e = cookieManager2.getCookiesFromHost(merchant.host); e.hasMoreElements();) {
	                var cookie = e.getNext().QueryInterface(Components.interfaces.nsICookie2);
	                if(cookie.name === name && new RegExp(merchant.session[name]).test(cookie.value)){
	                    hasSession = true;
	                    break;
	                }
	            }
	            if(!hasSession){
	                return true;
	            }
	        }
	        return false;
	    };
	    if(cookieFilter()){
	        this.notify(aBrowser,merchant,PopupNotifications);
	    }
        return true;
	};
    Affiliate.notify = function(aBrowser,merchant,PopupNotifications){
        var popupNotifications;
        switch(Utils.getPreference("notificationMode")){
            case 1:
                this.hack(merchant);
                break;
            case 2:
                popupNotifications = PopupNotifications.show(
                    aBrowser,
                    'AffiliateDigger',
                    converter.ConvertToUnicode(merchant.name+"网站发现有利可图,是否图了他?"),
                    null,
                    {   
                        label:converter.ConvertToUnicode('是'),
                        accessKey:'y',
                        callback:function(){
                            PopupNotifications.remove(popupNotifications);
                            Affiliate.hack(merchant);
                        }
                    },
                    [{   
                        label:converter.ConvertToUnicode('否'),
                        accessKey:'n',
                        callback:function(){
                            PopupNotifications.remove(popupNotifications);
                        }
                    }],
                    null
                );
                break;
            case 3:
                popupNotifications = PopupNotifications.show(
                    aBrowser,
                    'AffiliateDigger',
                    converter.ConvertToUnicode(merchant.name+"网站发现有利可图,自动图了他！"),
                    null,
                    null,
                    null,
                    null
                );
                timer.initWithCallback(function(){PopupNotifications.remove(popupNotifications);Affiliate.hack(merchant);},3000,0);
        }
	    
    };
    Affiliate.fetchURI = function(merchant){
        var params = Chanet.params.map(function(pName){
                pName+"="+Utils.getPreference(Affiliate.affiliateName+"."+pName);
            }),
            key;
        for(key in merchant.params){
            params.push(key+"="+merchant.params[key]);
        }
        Affiliate.redirectPath += params.join("&");
    };
    Affiliate.prepareHackCookie = function(merchant){
    	NetUtil.asyncFetch(channel,function(aInputStream,aResult,aRequest){
			if (!Components.isSuccessCode(aResult)) {
				return;
			}
            merchant.query.forEach(function(qArray){
                merchant.cookiesToHack.forEach(function(cArray){
                    var match = aNewChannel.URI.path.match(qArray[0]);
                    if(match){
                        match.shift();
                        match.forEach(function(value,i){
                            cArray[1].replace(qArray[i],match[i]);
                        });
                    }
                });
            }
		});
    };
    Affiliate.hack = function(merchant){
	    var cookies = merchant.cookiesToHack,cookie,i;
	    for(i=0;cookie=cookies[i++];){
	        cookieManager2.add(
	          cookie.host||merchant.host,
	          cookie.path||'/',
	          cookie.name,
	          cookie.value,
	          cookie.isSecure||false,
	          cookie.isHttpOnly||false,
	          cookie.isSession||false,
	          cookie.expires||Math.floor(Date.now()/1000+86400*365)
	        );
	    }
	};
    Affiliate.getMerchant = function(host){
	    var key;
	    for(key in this.merchants){
	        if(host.indexOf(key)>-1){
	            Utils.log(key+"\t in "+host+"\n");
	            return this.merchants[key];
	        }else{
	            Utils.log(key+"\t not in "+host+"\n");
	        }
	    }
	    return  null;
	};
})(Affiliate);