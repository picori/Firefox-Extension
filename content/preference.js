var RebateRobot = RebateRobot || {};
RebateRobot.XUL = RebateRobot.XUL || {};
RebateRobot.XUL.Preference = {};
(function(Preference){
    Components.utils.import("resource://modules/util.js");
    var converter = Utils.getService("@mozilla.org/intl/scriptableunicodeconverter","nsIScriptableUnicodeConverter");
    converter.charset = "UTF-8";
    Preference._modified = false;
    Preference.windowOnLoad = function(event){
    	window.centerWindowOnScreen();
//    	window.sizeToContent();
	};
	Preference.pref = {
		enableAffiliates:Utils.getPreference("enableAffiliates"),
        disableAffiliates:Utils.getPreference("disableAffiliates")
	};
	Preference.getNode = (function(){
		var nodes = {};
		return function(id){
			return nodes[id] = nodes[id] || document.getElementById(id);
		}
	})();
    Preference.globalPaneOnLoad = function(event){
        var listbox,listitem,listcell;
        ["enableAffiliates","disableAffiliates"].forEach(function(name){
            listbox = Preference.getNode(name);
            Preference.pref[name].split(',').forEach(function(affiliate){
            	listitem = document.createElement("listitem");
                listcell = document.createElement("listcell");
                listitem.setAttribute("label",affiliate);
    		    listbox.appendChild(listitem);
            });
        });
	};
	Preference.affiPaneOnLoad = function(event){
//		Preference.chanetTabOnLoad();
	};
	Preference.chanetTabOnLoad = function(){
		Components.utils.import("resource://modules/Chanet.jsm");
		Chanet.checkUpdate(function(){
			var merchants = Chanet.merchants,
				listbox = Preference.getNode("chanet.enableMerchant"),
				host,listitem;
			for(host in merchants){
				listitem = document.createElement("listitem");
                [converter.ConvertToUnicode(merchants[host].name),host].forEach(function(label){
                    listcell = document.createElement("listcell");
                    listcell.setAttribute("label",label); 
                    listitem.appendChild(listcell);
                });
				listbox.appendChild(listitem);
			}
		});
	}
    Preference.horizontalMove = function(from,to){
        var fromListBox = this.getNode(from),
        	toListBox = this.getNode(to),
			index = fromListBox.selectedIndex;
        index > -1 && toListBox.selectItem(toListBox.insertBefore(fromListBox.removeItemAt(index),null));
        this.flushAffiPref();
    };
    Preference.VerticalMove = function(box,direction){
        var listBox = this.getNode(box);
        var index = listBox.selectedIndex;
        index > -1 && listBox.selectItem(listBox.insertBefore(listBox.removeItemAt(index),listBox.getItemAtIndex(index+direction<0?0:index+direction)));
        this.flushAffiPref();
    };
    Preference.flushAffiPref = function(){
        this.pref.enableAffiliates = Array.prototype.map.call(this.getNode("enableAffiliates").childNodes,function(listitem){
        	return listitem.label;
        }).join(",");
        this.pref.disableAffiliates = Array.prototype.map.call(this.getNode("disableAffiliates").childNodes,function(listitem){
        	return listitem.label;
        }).join(",");
    };
	Preference.chanetPaneOnLoad = function(event){
	};
	Preference.doSave = function(){
		var key;
		this.flushAffiPref();
		for(key in this.pref){
			Utils.setPreference(key,this.pref[key]);
		}
		return true;
    };
	Preference.doCancel = function(){
		return true;
	};
	
})(RebateRobot.XUL.Preference);