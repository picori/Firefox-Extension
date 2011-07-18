Components.utils.import("resource://gre/modules/PopupNotifications.jsm");
Components.utils.import("resource://modules/util.js");
Components.utils.import("resource://modules/Affiliate.jsm");
var RebateRobot = RebateRobot || {
    onLoad: function() {
        // initialization code
        this.toggleTabsProgressListener(Utils.getPreference("enable"));
        this.initialized = true;
    },
    listener:{
        onLocationChange:function(aBrowser,webProgress,request,newLocation){
            Affiliate.distribute(aBrowser,webProgress,request,newLocation,PopupNotifications);
        },
        onProgressChange:function(){},
        onSecurityChange:function(){},
        onStateChange:function(){}
    },
    toggleTabsProgressListener:function(status){
        gBrowser[(status ?"add":"remove")+"TabsProgressListener"](this.listener);
    }
};
//
window.addEventListener("load", function(e) {RebateRobot.onLoad(e);}, true); 
