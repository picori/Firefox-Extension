Components.utils.import("resource://gre/modules/PopupNotifications.jsm");
Components.utils.import("resource://resource/Affiliate.jsm");
var aConsoleService = Components.classes["@mozilla.org/consoleservice;1"].
                        getService(Components.interfaces.nsIConsoleService);
var RebateRobot = {
    onLoad: function() {
        // initialization code
        this.initialized = true;
        var container = gBrowser.tabContainer;
        gBrowser.addTabsProgressListener({
            onLocationChange:function(aBrowser,webProgress,request,newLocation){
                Affiliate.engines.Chanet.analyze(aBrowser,webProgress,request,newLocation,PopupNotifications);
            },
            onProgressChange:function(){},
            onSecurityChange:function(){},
            onStateChange:function(){}
        });
        //gBrowser.addTab("http://www.baidu.com");
    }
};

window.addEventListener("load", function(e) { RebateRobot.onLoad(e); }, true); 
