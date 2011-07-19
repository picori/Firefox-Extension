var RebateRobot = RebateRobot || {};
RebateRobot.XUL = RebateRobot.XUL || {};
RebateRobot.XUL.Dialog = {};
(function(Dialog){
    Components.utils.import("resource://modules/util.js");
    
    Dialog.init = function(event){
    	var affiliates = Utils.getPreference("affiliate").split(","),i,tab,tabpanel,checkbox;
    	var tabs = document.getElementById("affiliate_list").getElementsByTagName("tabs")[0];
    	var tabpanels = document.getElementById("affiliate_list").getElementsByTagName("tabpanels")[0];
    	Utils.log(affiliates);
    	for(i=0;i<affiliates.length;i++){
//    		tab = document.createElement("tab");
//    		tab.setAttribute("label",affiliates[i]);
//            tab.setAttribute("id",affiliates[i].toLowerCase()+"_tab");
//    		tabs.appendChild(tab);
//            
//            tabpanel = document.createElement("tabpanel");
//            tabpanel.setAttribute("id",affiliates[i].toLowerCase()+"_tabpanel");
//    		tabpanels.appendChild(tabpanel);
    	}
	};
	Dialog.doSave = function(){
        Utils.setPreference("defaultAffiliate")
    };
	Dialog.doCancel = function(){};
	
})(RebateRobot.XUL.Dialog);