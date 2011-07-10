/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Bookmarks Sync.
 *
 * The Initial Developer of the Original Code is Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *  Dan Mills <thunder@mozilla.com>
 *  Richard Newman <rnewman@mozilla.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

const EXPORTED_SYMBOLS = ['Utils'];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

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
  }
};