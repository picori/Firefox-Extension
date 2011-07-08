var EXPORTED_SYMBOLS = ["Affiliate"];
var Affiliate = Affiliate || {};
(function(AF){
//    var Cc = Components.classes;
//    var Ci = Components.interfaces;
//    function getLocalDirectory() {
//        var directoryService = Cc["@mozilla.org/file/directory_service;1"].
//            getService(Ci.nsIProperties);
//        // this is a reference to the profile dir (ProfD) now.
//        var localDir = directoryService.get("ProfD", Ci.nsIFile);
//        localDir.append("RebateRobot");
//        if (!localDir.exists() || !localDir.isDirectory()) {
//            // read and write permissions to owner and group, read-only for others.
//            localDir.create(Ci.nsIFile.DIRECTORY_TYPE, 0774);
//        }
//        return localDir;
//    };
    Components.utils.import("resource://gre/modules/PopupNotifications.jsm");
    var aConsoleService = Components.classes["@mozilla.org/consoleservice;1"].
                        getService(Components.interfaces.nsIConsoleService);
    AF.config = {
        engines:['chanet'],
        merchanet:[]
    }
    AF._getEngines = function(){
        var cookieManager2 = Components.classes["@mozilla.org/cookiemanager;1"]
                  .getService(Components.interfaces.nsICookieManager2);
        var cookieService = Components.classes["@mozilla.org/cookieService;1"]
                  .getService(Components.interfaces.nsICookieService);
        return {
            Chanet : {
                scheme  :   'https',
                host    :   'count.chanet.com.cn',
                path    :   '/click.cgi',
                params  :   {a:218},
                merchants    :   {},
                analyze :   function(aBrowser,webProgress,request,newLocation,PopupNotifications){
                    var Chanet = this;
                    var merchant = Chanet.getMerchant(newLocation.host);
//                    aConsoleService.logStringMessage(typeof PopupNotifications.show+"\n");
                    var cookieFilter  = function(){
                        for (key in merchant.cookie){
                            aConsoleService.logStringMessage(key+"\n");
                            var match = false;
                            for (var e = cookieManager2.getCookiesFromHost(merchant.domain); e.hasMoreElements();) {
                                var cookie = e.getNext().QueryInterface(Components.interfaces.nsICookie2);
                                if(cookie.name===key && merchant.cookie[key].test(cookie.value)){
                                    aConsoleService.logStringMessage(cookie.name+"\t"+cookie.value+"\n");
                                    match = true;
                                }
                            }
                            if(!match){
                                aConsoleService.logStringMessage("return by cookie \n");
                                return true;
                            }
                        }
                        for (key in merchant.session){
                            var match = false;
                            for (var e = cookieManager2.getCookiesFromHost(merchant.domain); e.hasMoreElements();) {
                                var cookie = e.getNext().QueryInterface(Components.interfaces.nsICookie2);
                                if(cookie.name===key && merchant.session[key].test(cookie.value)){
                                    match = true;
                                }
                            }
                            if(!match){
                                aConsoleService.logStringMessage("return by session \n");
                                return true;
                            }
                        }
                        return false;
                    };
                    var queryFilter =   function(){
                        return !!merchant && !merchant.query.test(newLocation.spec);
                    };
                    if(cookieFilter(merchant)){
//                        if(queryFilter(newLocation,merchant)){
//                            request.suspend();
                            var popupNotifications;
                            popupNotifications = PopupNotifications.show(
                                aBrowser,
                                'alert',
                                'This location '+newLocation.asciiSpec+' have rebate.Do you need Rebate automatically?',
                                null,
                                {   
                                    label:'ok',
                                    accessKey:'alt',
                                    callback:function(){
                                        PopupNotifications.remove(popupNotifications);
                                        merchant.hack(cookieManager2);
//                                        request.resume();
//                                        Chanet.changeURI(aBrowser,merchant);
                                    }
                                },
                                null,
                                {timeout:Date.now() + 30000}
                            );
//                        }else{
//                            //nothing
//                        }
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
                
                sessionFilter  :   function(){
                    
                },
                
                uriHack :   function(){
                    
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
        AF.engines.Chanet.merchants = {
            'vancl.com':{
                domain:'vancl.com',
                name:'·²¿Í',
                params:{d:196669},
//                session:{WebSourceTemp:/chanet\$\d+\|\d+/},
                cookie:{union_visited:/1/,WebSource:/chanet\$\d+\|\d+/},
                query:/Source=chanet&SourceSunInfo=(\d+)\|(\d+)/,
                hack:function(cookieManager2){
//                    chanet$6974562887|218
                    cookieManager2.add(
                      'vancl.com',
                      '/',
                      'WebSource',
                      'chanet$6974562887|218',
                      false,
                      false,
                      false,
                      Date.now()+86400*365
                    );
                    cookieManager2.add(
                      'vancl.com',
                      '/',
                      'union_visited',
                      '1',
                      false,
                      false,
                      false,
                      Date.now()+86400*365
                    );
                }
            },
            'dangdang.com':{
                domain:'dangdang.com',
                name:'µ±µ±',
                params:{d:161780},
                cookie:{from:/430\-\d+\-\d+/}
            }
        };
    };
    AF._getMerchants();
})(Affiliate);
