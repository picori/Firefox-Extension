var EXPORTED_SYMBOLS = ["Affiliate"];
var Affiliate = {};
(function(Affiliate){
	Components.utils.import("resource://modules/util.js");
	var cookieManager2 = Utils.getService("@mozilla.org/cookiemanager;1","nsICookieManager2"),
	    converter = Utils.getService("@mozilla.org/intl/scriptableunicodeconverter","nsIScriptableUnicodeConverter"),
	    istream = Utils.getService("@mozilla.org/io/string-input-stream;1","nsIStringInputStream"),
        timer = Utils.getService("@mozilla.org/timer;1","nsITimer");
    converter.charset = "UTF-8";
    
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
                        Utils.log("parse json error");
                        return;
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
	    if(!Affiliate._hasCookie(merchant)){
	        Affiliate.notify(aBrowser,merchant,PopupNotifications);
	    }
        return true;
	};
    Affiliate._hasCookie  = function(merchant){
        return Utils.every(merchant[3],function(cookieName,cookieInfo){
            if(!cookieInfo[1])
                return true;
            for (var e = cookieManager2.getCookiesFromHost(merchant.host); e.hasMoreElements();) {
                var cookie = e.getNext().QueryInterface(Components.interfaces.nsICookie2);
                if(cookie.name === cookieName && new RegExp(cookieInfo[1]).test(cookie.value)){
                    Utils.log(cookie.name+"\t"+cookie.value+"\n");
                    return true;
                }
            }
            return false;
        });
    };
    Affiliate.notify = function(aBrowser,merchant,PopupNotifications){
        var popupNotifications,
            Affiliate = this;
        switch(Utils.getPreference("notificationMode")){
            case 1:
                this.hack(merchant);
                break;
            case 2:
                popupNotifications = PopupNotifications.show(
                    aBrowser,
                    'AffiliateDigger',
                    converter.ConvertToUnicode(merchant[1]+"网站发现有利可图,是否图了他?"),
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
                    converter.ConvertToUnicode(merchant[1]+"网站发现有利可图,自动图了他！"),
                    null,
                    null,
                    null,
                    null
                );
                timer.initWithCallback(function(){PopupNotifications.remove(popupNotifications);Affiliate.hack(merchant);},3000,0);
        }
	    
    };
    Affiliate.fetchURI = function(merchant){
        var Affiliate = this,
            params = Affiliate.params.map(function(pName){
                return pName+"="+Utils.getPreference(Affiliate.affiliateName.toLowerCase()+"."+pName);
            });
        Utils.forEach(merchant[2],function(value,name){
            params.push(name+"="+value);
        });
        return Affiliate.redirectPath + params.join("&");
    };
    Affiliate.hack = function(merchant){
        var Affiliate = this,
            channel = NetUtil.newChannel(Affiliate.fetchURI(merchant)+"&t="+Date.now(), "UTF-8", null);
        channel.notificationCallbacks = {
            asyncOnChannelRedirect:function(aOldChannel, aNewChannel,flag){
                var queryString = aNewChannel.URI.path.split("?")[1];
                Utils.forEach(merchant[3],function(cValue,cName){
                    cookieManager2.add(
                        merchant.host,
                        '/',
                        cName,
                        cValue[0].replace(/\[([^\]]+)\]/g,function(pName){
                            var patten = new RegExp(RegExp.$1+"=([^&]*)");
                            Utils.log(queryString.match(patten)[1]);
                            return queryString.match(patten)[1];
                        }),
                        false,
                        false,
                        false,
                        Math.floor(Date.now()/1000+86400*365)
                    );
                });
                aNewChannel.cancel(Components.results.NS_BINDING_REDIRECTED);
            },
            getInterface: function (aIID) {
                try {
                    return this.QueryInterface(aIID);
                } catch (e) {
                    throw Components.results.NS_NOINTERFACE;
                }
            },
            // nsIProgressEventSink (not implementing will cause annoying exceptions)
            onProgress : function (aRequest, aContext, aProgress, aProgressMax) { },
            onStatus : function (aRequest, aContext, aStatus, aStatusArg) { },

            // nsIHttpEventSink (not implementing will cause annoying exceptions)
            onRedirect : function (aOldChannel, aNewChannel) { },
            QueryInterface : function(aIID) {
                if (aIID.equals(Components.interfaces.nsISupports) ||
                    aIID.equals(Components.interfaces.nsIInterfaceRequestor) ||
                    aIID.equals(Components.interfaces.nsIChannelEventSink) || 
                    aIID.equals(Components.interfaces.nsIProgressEventSink) ||
                    aIID.equals(Components.interfaces.nsIHttpEventSink) ||
                    aIID.equals(Components.interfaces.nsIStreamListener))
                        return this;
                throw Components.results.NS_NOINTERFACE;
            }
        };
        channel.asyncOpen({
            onStartRequest:function(){},
            onDataAvailable:function(){},
            onStopRequest:function(){}
        },null);
    };
    Affiliate.getMerchant = function(host){
        var Affiliate = this;
        return Utils.first(Affiliate.merchants,function(value,name){
            return host.indexOf(name)>-1 && (value.host = value.host || name);
        });
	};
})(Affiliate);