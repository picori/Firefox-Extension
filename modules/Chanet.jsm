var EXPORTED_SYMBOLS = ["Chanet"];
var Chanet = {};
(function(Chanet){
	Components.utils.import("resource://modules/Affiliate.jsm");
    
    Chanet.affiliateName = "Chanet";
    Chanet.initialized = false;
    Chanet.scheme = 'https';
	Chanet.host = 'count.chanet.com.cn';
	Chanet.path = '/click.cgi';
	Chanet.params = {a:218};
	Chanet.merchants = {};
	Chanet.updateURI = "http://localhost/html/Chanet.json";
	Chanet.__proto__ = Affiliate;
})(Chanet);