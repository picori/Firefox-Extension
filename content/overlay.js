Components.utils.import("resource://gre/modules/PopupNotifications.jsm");
Components.utils.import("resource://modules/util.js");
Components.utils.import("resource://modules/AffiliateManager.jsm");
var RebateRobot = RebateRobot || {
    onLoad: function() {
        // initialization code
        gBrowser.addTabsProgressListener(this.listener);
        this.initialized = true;
    },
    listener:{
        onLocationChange:function(aBrowser,webProgress,request,newLocation){
            Utils.getPreference("enable") && AffiliateManager.distribute(aBrowser,webProgress,request,newLocation,PopupNotifications);
        },
        onProgressChange:function(){},
        onSecurityChange:function(){},
        onStateChange:function(){}
    }
};
//
window.addEventListener("load", function(e) {RebateRobot.onLoad(e);}, true); 
