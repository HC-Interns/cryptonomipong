
function messageRef(payload) {
  var tickCount = typeof payload.tickCount === 'string' ? parseInt(payload.tickCount) : payload.tickCount;
  var vote = payload.vote;
  castVote(tickCount, vote);
  return true;
}

function getCurrentRef(tickCount) {
  var agentList = getLinks(App.DNA.Hash, 'agent');
  return agentList[tickCount % agentList.length].Hash;
}

function castVote(tickCount, vote) {
  var ref = getCurrentRef(tickCount);
  debug('Messaging: '+ref);
  var message = {tickCount: tickCount, vote: vote}
  send(ref, 
    message, 
    {Callback: { Function: "responseCallback", ID:''+tickCount}}
  );
}


function responseCallback(response, id) {
  debug("response of message tick "+id+": "+response);
}


function getResponses() {
  var result = query({
    Return: {
      Entries: true
    },
    Constrain: {
      EntryTypes: ["voteRecord"],
    }
  });
  debug(result);
  return result;
}

function receive(from, message) {
  debug('message received: ' +  JSON.stringify(message));
  commit('voteRecord', message);
  return true;
}


/*=================================
=            Callbacks            =
=================================*/

// link key hash to chain on genesis
function genesis () {
  commit('agentLink', {
    Links: [{Base: App.DNA.Hash, Link: App.Key.Hash, Tag: 'agent'}]
  });
  return true;
}


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