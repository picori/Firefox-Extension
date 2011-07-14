var EXPORTED_SYMBOLS = ["Affiliate"];
var Affiliate = Affiliate || {};
(function(AF){
    var aConsoleService = Components.classes["@mozilla.org/consoleservice;1"].
                        getService(Components.interfaces.nsIConsoleService);
    var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
                .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    AF.config = {
        engines:['Chanet'],
        merchanet:[],
        aggressive:false
    };
    AF._getEngines = function(){
        var cookieManager2 = Components.classes["@mozilla.org/cookiemanager;1"]
                  .getService(Components.interfaces.nsICookieManager2);
        return {
            Chanet : {
                scheme  :   'https',
                host    :   'count.chanet.com.cn',
                path    :   '/click.cgi',
                params  :   {a:218},
                merchants    :   {},
                analyze :   function(aBrowser,webProgress,request,newLocation,PopupNotifications){
                    var Chanet = this;
                    var merchant;
                    if(!(merchant = Chanet.getMerchant(newLocation.host)))
                            return;//qucik return
                    var cookieFilter  = function(){
                        var name;
                        for (name in merchant.cookie){
                            var hasCookie = false;
                            var mCookieValueReg = new RegExp(merchant.cookie[name]);
                            for (var e = cookieManager2.getCookiesFromHost(merchant.host); e.hasMoreElements();) {
                                var cookie = e.getNext().QueryInterface(Components.interfaces.nsICookie2);
                                if(cookie.name === name && (typeof mCookieValueReg === 'object' ? mCookieValueReg.test(cookie.value) : mCookieValueReg === cookie.value)){
                                    aConsoleService.logStringMessage(cookie.name+"\t"+cookie.value+"\n");
                                    hasCookie = true;
                                    break;
                                }
                            }
                            if(!hasCookie){
                                aConsoleService.logStringMessage("return by cookie \n");
                                return true;
                            }
                        }
                        for (name in merchant.session){
                            var hasSession = false;
                            for (var e = cookieManager2.getCookiesFromHost(merchant.host); e.hasMoreElements();) {
                                var cookie = e.getNext().QueryInterface(Components.interfaces.nsICookie2);
                                if(cookie.name===key && merchant.session[name].test(cookie.value)){
                                    hasSession = true;
                                }
                            }
                            if(!hasSession){
                                return true;
                            }
                        }
                        return false;
                    };
                    var queryFilter =   function(){
                        return !!merchant && !merchant.query.test(newLocation.spec);
                    };
                    if(cookieFilter()){
                        request.suspend();
                        var popupNotifications;
                        converter.charset = "utf8";
                        aConsoleService.logStringMessage(converter.ConvertToUnicode(merchant.name+"网站发现有利可图,是否图了他?"));
                        popupNotifications = PopupNotifications.show(
                            aBrowser,
                            'alert',
                            converter.ConvertToUnicode(merchant.name+"网站发现有利可图,是否图了他?"),
                            null,
                            {   
                                label:converter.ConvertToUnicode('是'),
                                accessKey:'y',
                                callback:function(){
                                    PopupNotifications.remove(popupNotifications);
                                    Chanet.hack(merchant);
//                                        Chanet.changeURI(aBrowser,merchant);
                                }
                            },
                            [{   
                                label:converter.ConvertToUnicode('否'),
                                accessKey:'n',
                                callback:function(){
                                    PopupNotifications.remove(popupNotifications);
                                }
                            }],
                            null,
                            {timeout:Date.now() + 30000}
                        );
                        request.resume();
                    }
                },
                hack    :   function(merchant){
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
                },
                getMerchant :   function(host){
                    var key;
                    for(key in this.merchants){
                        if(host.indexOf(key)>-1){
                            aConsoleService.logStringMessage(key+"\t in "+host+"\n");
                            return this.merchants[key];
                        }else{
                            aConsoleService.logStringMessage(key+"\t not in "+host+"\n");
                        }
                    }
                    return  null;
                },
                changeURI   :   function(aBrowser,merchant){
                    var query='',key;
                    for(key in this.params){
                        query += (query ? '&':'?')+key+'='+this.params[key];
                    }
                    for(key in merchant.params){
                        query += (query ? '&':'?')+key+'='+merchant.params[key];
                    }
                    aBrowser.loadURI(this.scheme+'://'+this.host+this.path+query);
                }
            }
        };
    };
    AF.engines = AF._getEngines();
    AF._getMerchants = function(){
        var i,engines = this.config.engines,engine_name;
        Components.utils.import("resource://resource/util.js");
//        var file = Components.classes["@mozilla.org/file/directory_service;1"]
//                .getService(Components.interfaces.nsIProperties)
//        		.get("AChrom", Components.interfaces.nsIFile);
//		file.append("content");
        for(i = engines.length-1;i>=0;i--){
            Utils.jsonLoad(engine_name=engines[i],AF,function(json){
                this.engines[engine_name].merchants = json;
            });
        }
    };
    AF._getMerchants();
})(Affiliate);
