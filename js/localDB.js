




const LocalDB = new function() {
  const DBName = "financeDB";
  let DBVersion = 2;
  let DB;
  

  this.setup = async function() {
    return new Promise(function (resolve, error) {
      const request = indexedDB.open(DBName, DBVersion);

      request.onupgradeneeded = function(_e) { // create object stores
        DB = _e.target.result;

        const transactions     = DB.createObjectStore("transactions");
        const tags             = DB.createObjectStore("tags");
      }

      request.onsuccess = function(_e) {
        DB = _e.target.result;
        resolve();
      }

      request.onerror = function(_e) {
        console.warn("error", _e);
        indexedDB.deleteDatabase(DBName);
        error();
      }
    });
  }


  this.getData = function(_key) {
    return new Promise(function (resolve, error) {
      let store = DB.transaction(_key, "readonly").objectStore(_key);

      let request = store.get("IDENTIFIER");
      
      request.onsuccess = function(_e) {
        let data = request.result;
        if (typeof data != "object") data = [];
        resolve(data);
      }
    });
  }

  this.setData = function(_key, _value) {
    return new Promise(function (resolve, error) {
      const transaction = DB.transaction(_key, "readwrite");
      transaction.onerror = error;
      const store = transaction.objectStore(_key);
      let trans2 = store.put(JSON.parse(JSON.stringify(_value)), "IDENTIFIER");
      resolve();
    });
  }


  this.removeData = function(_key) {
    return new Promise(function (resolve, error) {
      const transaction = DB.transaction(_key, "readwrite");
      transaction.onerror = error;

      const store = transaction.objectStore(_key);

      let request = store.delete(This.id);
      request.onerror = error;
      request.onsuccess = function(event) {
        resolve(true);
      }
    });
  }
}


