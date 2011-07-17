var RebateRobot = RebateRobot || {};
RebateRobot.XUL = RebateRobot.XUL || {};
RebateRobot.XUL.Menu = {};
(function(Menu){
    Components.utils.import("resource://modules/util.js");
    
    Menu.init = function(){
        if(RebateRobot.initialized === true){
            document.getElementById("rebaterobot_enable").setAttribute("checked",Utils.preference("enable"));
            Menu.initialized = true;
        }else{
            setTimeout(Menu.init,1000);
        }
    }
    
    Menu.enable = function(event){
        Utils.preference("enable",!!event.target.getAttribute("checked"))
        RebateRobot.toggleTabsProgressListener(!!event.target.getAttribute("checked"));
    };
})(RebateRobot.XUL.Menu);