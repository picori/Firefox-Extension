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
    		tab = document.createElement("tab");
    		tabpanel = document.createElement("tabpanel");
    		checkbox = document.createElement("checkbox");
    		tab.setAttribute("label",affiliates[i]);
    		tabs.appendChild(tab);
    		checkbox.setAttribute("label",affiliates[i]);
    		tabpanel.appendChild(checkbox);
    		tabpanels.appendChild(tabpanel);
    	}
	};
	Dialog.doSave = function(){};
	Dialog.doCancel = function(){};
	
})(RebateRobot.XUL.Dialog);