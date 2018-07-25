
function messageRef(payload) {
  var tickCount = payload.tickCount;

  var agentList = getLinks(App.DNA.Hash, 'agent');
  var agentToMessage = agentList[tickCount % agentList.length];
  debug('Messaging: '+agentToMessage.Hash)
  send(agentToMessage.Hash, {}, {Callback: { Function: "responseCallback", ID:''+tickCount}});
  return true;
}


function responseCallback(response, id) {
  debug("response of message tick "+id+": "+response);
  commit('responseRecord', response);
}

function getResponses() {
  return query({
    Return: {
      Entries: true
    },
    Constrain: {
      EntryTypes: ["responseRecord"],
    }
  });
}


function genesis () {
  commit('agentLink', {
    Links: [{Base: App.DNA.Hash, Link: App.Key.Hash, Tag: 'agent'}]
  });
  return true;
}


function receive(from, message) {
  return App.Key.Hash;
}


/*=================================
=            Callbacks            =
=================================*/

function validateCommit (entryType, entry, header, pkg, sources) {
  return true;
}


function validatePut (entryType, entry, header, pkg, sources) {
  return true;
}

function validateLink(entryType, hash, links, pkg, sources) {
  return true;
}


function validateMod (entryType, entry, header, replaces, pkg, sources) {
  return true;
}


function validateDel (entryType, hash, pkg, sources) {
  return true;
}


function validatePutPkg (entryType) {
  return null;
}


function validateModPkg (entryType) {
  return null;
}


function validateDelPkg (entryType) {
  return null;
}

/*=====  End of Callbacks  ======*/