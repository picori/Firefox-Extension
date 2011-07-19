var RebateRobot = RebateRobot || {};
RebateRobot.XUL = RebateRobot.XUL || {};
RebateRobot.XUL.Menu = {};
(function(Menu){
    Components.utils.import("resource://modules/util.js");
    
    Menu.init = function(event){
        if(RebateRobot.initialized === true){
            document.getElementById("rebaterobot_enable").setAttribute("checked",Utils.getPreference("enable"));
            Menu.initialized = true;
        }else{
        	event.preventDefault();
            setTimeout(Menu.init,1000);
        }
	};
    Menu.setting = function(event){
        window.openDialog("chrome://rebaterobot/content/setting.xul","setting_dialog");
	};
    Menu.enable = function(event){
    	var enable = !!event.target.getAttribute("checked");
        Utils.setPreference("enable",enable)
        RebateRobot.toggleTabsProgressListener(enable);
    };
})(RebateRobot.XUL.Menu);