Components.utils.import("resource://gre/modules/PopupNotifications.jsm");
Components.utils.import("resource://modules/util.js");
var RebateRobot = RebateRobot || {
    onLoad: function() {
        // initialization code
        Components.utils.import("resource://modules/AffiliateManager.jsm",RebateRobot);
        gBrowser.addTabsProgressListener(this.listener);
        this.initialized = true;
    },
    listener:{
        onLocationChange:function(aBrowser,webProgress,request,newLocation){
            Utils.getPreference("enable") && RebateRobot.AffiliateManager.distribute(aBrowser,webProgress,request,newLocation,PopupNotifications);
        },
        onProgressChange:function(){},
        onSecurityChange:function(){},
        onStateChange:function(){}
    }
};
//
window.addEventListener("load", function(e) {RebateRobot.onLoad(e);}, true); 
