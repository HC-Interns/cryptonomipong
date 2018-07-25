
/*========================================
=            public functions            =
========================================*/

function messageRef(payload) {
  var tickCount = typeof payload.tickCount === 'string' ? parseInt(payload.tickCount) : payload.tickCount;
  var vote = payload.vote;
  castVote(tickCount, vote);
  return true;
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


function getCurrentState() {
  var gameStates = getLinks(makeHash('anchor', 'stateAnchor'), 'gameState');
  gameStates.sort(function (a, b) {
    return b.tickCount - a.tickCount;
  });
  return gameStates[0];
}

/*=====  End of public functions  ======*/


// a ref should call this function after they have received all votes
// TODO: use a bundle to ensure all entries commit
function commitNewState(tickCount) {
  var votes = getReceivedVotes(tickCount);
  var oldState = getCurrentState();
  var newState = stateTransition(oldState, votes);
  var stateAnchorHash = makeHash('anchor', 'stateAnchor');
  var newStateHash = commit('gameState', {tickCount: tickCount, state: newState});
  commit('link', {
    Links: [{Base: stateAnchorHash, Link: newStateHash, Tag: 'gameState'}]
  });
}


// takes an old state and some votes to return a new state
// TODO: implement this
function stateTransition(oldState, votes) {
  return oldState;
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
    { Callback: { Function: "responseCallback", ID:''+tickCount} }
  );
}


// retrieve from local chain the votes sent to you at a specific tick count
function getReceivedVotes(tickCount) {
  var result = query({
    Return: {
      Entries: true
    },
    Constrain: {
      EntryTypes: ["voteRecord"],
      Contains: "{\"tickCount\": \""+tickCount+"\"}"
    }
  });
  debug(result);
  return result;
}


/*=================================
=            Callbacks            =
=================================*/

// commit a voteRecord to local chain when received via messaging
// TODO: add validation
function receive(from, message) {
  debug('message received: ' +  JSON.stringify(message));
  commit('voteRecord', message);
  return true;
}

// called on the response of a message. For debug only at the moment
function responseCallback(response, id) {
  debug("response of message tick "+id+": "+response);
}

// link key hash to chain on genesis
// also make sure the stateAnchor hash exists
function genesis () {
  commit('link', {
    Links: [{Base: App.DNA.Hash, Link: App.Key.Hash, Tag: 'agent'}]
  });
  commit('anchor', 'stateAnchor');
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