const EXPORTED_SYMBOLS = ['Utils','NetUtil'];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

// File IO Flags
const MODE_RDONLY = 0x01;
const MODE_WRONLY = 0x02;
const MODE_CREATE = 0x08;
const MODE_APPEND = 0x10;
const MODE_TRUNCATE = 0x20;

// File Permission flags
const PERMS_FILE = 0644;
const PERMS_PASSFILE = 0600;
const PERMS_DIRECTORY = 0755;

let NetUtil;
try {
  let ns = {};
  Cu.import("resource://gre/modules/NetUtil.jsm", ns);
  NetUtil = ns.NetUtil;
} catch (ex) {
  // Firefox 3.5 :(
}

/*
 * Utility functions
 */

let Utils = {
	
  // Returns a nsILocalFile representing a file relative to the
  // current user's profile directory.  If the argument is a string,
  // it should be a string with unix-style slashes for directory names
  // (these slashes are automatically converted to platform-specific
  // path separators).
  //
  // Alternatively, if the argument is an object, it should contain
  // the following attributes:
  //
  //   path: the path to the file, relative to the current user's
  //   profile dir.
  //
  //   autoCreate: whether or not the file should be created if it
  //   doesn't already exist.
  getProfileFile: function getProfileFile(arg) {
    if (typeof arg == "string")
      arg = {path: arg};

    let pathParts = arg.path.split("/");
    let directory = Cc["@mozilla.org/file/directory_service;1"]
                .getService(Components.interfaces.nsIProperties);
    let file = directory.get("ProfD", Ci.nsIFile);
    file.QueryInterface(Ci.nsILocalFile);
    for (let i = 0; i < pathParts.length; i++)
      file.append(pathParts[i]);
    if (arg.autoCreate && !file.exists())
      file.create(file.NORMAL_FILE_TYPE, PERMS_FILE);
    return file;
  },
	
  /**
   * Load a json object from disk
   *
   * @param filePath
   *        Json file path load from weave/[filePath].json
   * @param that
   *        Object to use for logging and "this" for callback
   * @param callback
   *        Function to process json object as its first parameter
   */
  jsonLoad: function Utils_jsonLoad(filePath, that, callback) {
    filePath = "rebaterobot/" + filePath + ".json";
    if (that._log)
      that._log.trace("Loading json from disk: " + filePath);

    let file = Utils.getProfileFile(filePath);
    
    if (!file.exists()) {
      callback.call(that);
      return;
    }
    
    // Gecko < 2.0
    if (!NetUtil || !NetUtil.newChannel) {
      let json;
      try {
        let [is] = Utils.open(file, "<");
        json = JSON.parse(Utils.readStream(is));
        is.close();
      } catch (ex) {
        if (that._log)
          that._log.debug("Failed to load json: " + Utils.exceptionStr(ex));
      }
      callback.call(that, json);
      return;
    }

    let channel = NetUtil.newChannel(file);
    channel.contentType = "application/json";

    NetUtil.asyncFetch(channel, function (is, result) {
      if (!Components.isSuccessCode(result)) {
        callback.call(that);
        return;
      }
      let string = NetUtil.readInputStreamToString(is, is.available());
      is.close();
      let json;
      try {
        json = JSON.parse(string);
      } catch (ex) {
        if (that._log)
          that._log.debug("Failed to load json: " + Utils.exceptionStr(ex));
      }
      
      callback.call(that, json);
    });
  },

  /**
   * Save a json-able object to disk
   *
   * @param filePath
   *        Json file path save to weave/[filePath].json
   * @param that
   *        Object to use for logging and "this" for callback
   * @param obj
   *        Function to provide json-able object to save. If this isn't a
   *        function, it'll be used as the object to make a json string.
   * @param callback
   *        Function called when the write has been performed. Optional.
   */
  jsonSave: function Utils_jsonSave(filePath, that, obj, callback) {
    filePath = "rebaterobot/" + filePath + ".json";
    if (that._log)
      that._log.trace("Saving json to disk: " + filePath);

    let file = Utils.getProfileFile({ autoCreate: true, path: filePath });
    let json = typeof obj == "function" ? obj.call(that) : obj;
    let out = JSON.stringify(json);

    // Firefox 3.5
    if (!NetUtil) {
      let [fos] = Utils.open(file, ">");
      fos.writeString(out);
      fos.close();
      if (typeof callback == "function") {
        callback.call(that);
      }
      return;
    }

    let fos = Cc["@mozilla.org/network/safe-file-output-stream;1"]
                .createInstance(Ci.nsIFileOutputStream);
    fos.init(file, MODE_WRONLY | MODE_CREATE | MODE_TRUNCATE, PERMS_FILE,
             fos.DEFER_OPEN || 0);
    let is = this._utf8Converter.convertToInputStream(out);
    NetUtil.asyncCopy(is, fos, function (result) {
      if (typeof callback == "function") {
        callback.call(that);        
      }
    });
  },
  jsonSave2: function Utils_jsonSave(filePath, that, aInputStream, callback) {
    filePath = "rebaterobot/" + filePath + ".json";
    if (that._log)
      that._log.trace("Saving json to disk: " + filePath);

    let file = Utils.getProfileFile({ autoCreate: true, path: filePath });

    // Firefox 3.5
    if (!NetUtil) {
      let [fos] = Utils.open(file, ">");
      fos.writeString(out);
      fos.close();
      if (typeof callback == "function") {
        callback.call(that);
      }
      return;
    }

    let fos = Cc["@mozilla.org/network/safe-file-output-stream;1"]
                .createInstance(Ci.nsIFileOutputStream);
    fos.init(file, MODE_WRONLY | MODE_CREATE | MODE_TRUNCATE, PERMS_FILE,
             fos.DEFER_OPEN || 0);
    NetUtil.asyncCopy(aInputStream, fos, function (result) {
      if (typeof callback == "function") {
        callback.call(that);        
      }
    });
  },

  // Gecko <2.0
  open: function open(pathOrFile, mode, perms) {
    let stream, file;

    if (pathOrFile instanceof Ci.nsIFile) {
      file = pathOrFile;
    } else {
      file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
      dump("PATH IS" + pathOrFile + "\n");
      file.initWithPath(pathOrFile);
    }

    if (!perms)
      perms = PERMS_FILE;

    switch(mode) {
    case "<": {
      if (!file.exists())
        throw "Cannot open file for reading, file does not exist";
      let fis = Cc["@mozilla.org/network/file-input-stream;1"].
        createInstance(Ci.nsIFileInputStream);
      fis.init(file, MODE_RDONLY, perms, 0);
      stream = Cc["@mozilla.org/intl/converter-input-stream;1"].
        createInstance(Ci.nsIConverterInputStream);
      stream.init(fis, "UTF-8", 4096,
                  Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
    } break;

    case ">": {
      let fos = Cc["@mozilla.org/network/file-output-stream;1"].
        createInstance(Ci.nsIFileOutputStream);
      fos.init(file, MODE_WRONLY | MODE_CREATE | MODE_TRUNCATE, perms, 0);
      stream = Cc["@mozilla.org/intl/converter-output-stream;1"]
        .createInstance(Ci.nsIConverterOutputStream);
      stream.init(fos, "UTF-8", 4096, 0x0000);
    } break;

    case ">>": {
      let fos = Cc["@mozilla.org/network/file-output-stream;1"].
        createInstance(Ci.nsIFileOutputStream);
      fos.init(file, MODE_WRONLY | MODE_CREATE | MODE_APPEND, perms, 0);
      stream = Cc["@mozilla.org/intl/converter-output-stream;1"]
        .createInstance(Ci.nsIConverterOutputStream);
      stream.init(fos, "UTF-8", 4096, 0x0000);
    } break;

    default:
      throw "Illegal mode to open(): " + mode;
    }

    return [stream, file];
  },
  
  _utf8Converter:(function() {
	let converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"]
                      .createInstance(Ci.nsIScriptableUnicodeConverter);
    converter.charset = "UTF-8";
    return converter;
  }()),
  
  
  setPreference : function(name,value){
      return this.getService("@mozilla.org/fuel/application;1","fuelIApplication").prefs.setValue("extensions.rebaterobot."+name,value);
  },
  getPreference : function(name,value){
      return this.getService("@mozilla.org/fuel/application;1","fuelIApplication").prefs.getValue("extensions.rebaterobot."+name,value);
  },
  
  // Works on frames or exceptions, munges file:// URIs to shorten the paths
  // FIXME: filename munging is sort of hackish, might be confusing if
  // there are multiple extensions with similar filenames
  formatFrame: function Utils_formatFrame(frame) {
    let tmp = "<file:unknown>";

    let file = frame.filename || frame.fileName;
    if (file)
      tmp = file.replace(/^(?:chrome|file):.*?([^\/\.]+\.\w+)$/, "$1");

    if (frame.lineNumber)
      tmp += ":" + frame.lineNumber;
    if (frame.name)
      tmp = frame.name + "()@" + tmp;

    return tmp;
  },

  exceptionStr: function Weave_exceptionStr(e) {
    let message = e.message ? e.message : e;
    return message + " " + Utils.stackTrace(e);
  },

  stackTraceFromFrame: function Weave_stackTraceFromFrame(frame) {
    let output = [];
    while (frame) {
      let str = Utils.formatFrame(frame);
      if (str)
        output.push(str);
      frame = frame.caller;
    }
    return output.join(" < ");
  },

  stackTrace: function Weave_stackTrace(e) {
    // Wrapped nsIException
    if (e.location)
      return "Stack trace: " + Utils.stackTraceFromFrame(e.location);

    // Standard JS exception
    if (e.stack)
      return "JS Stack trace: " + e.stack.trim().replace(/\n/g, " < ").
        replace(/@[^@]*?([^\/\.]+\.\w+:)/g, "@$1");

    return "No traceback available";
  },
  
  
  log:function(msg){
      return this.getService("@mozilla.org/consoleservice;1","nsIConsoleService").logStringMessage(msg);
  },
  
  getService:function(cid,iface){
  	  Svc[cid] =  Svc[cid] || {};
  	  Svc[cid][iface] = Svc[cid][iface] || Cc[cid].getService(Ci[iface]);
  	  return Svc[cid][iface];
  }
  
  
};

var Svc = {};