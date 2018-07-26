
/*========================================
=            public functions            =
========================================*/

//called every tick interval by the UI or test framework
function gameTick(payload) {
  var tickCount = typeof payload.tickCount === 'string' ? parseInt(payload.tickCount) : payload.tickCount;
  var vote = payload.vote;

  // Was I the ref last tick? if so resolve the new game state
  if(tickCount > 0 && getCurrentRef(tickCount-1) === App.Key.Hash) {
    debug("I am di Ref!!");
    commitNewState(tickCount);
  }
  castVote(tickCount, vote); // cast a vote for the next state
  var state = getState(tickCount - 1);
  debug("state @ "+tickCount+": ");
  debug(state);
  return true;
}

// retrieve from local chain the votes sent to you, optionally at a specific tick count
function getReceivedVotes(tickCount) {
  var results = query({
    Return: {
      Entries: true
    },
    Constrain: {
      EntryTypes: ["voteRecord"]
    }
  });

  if (tickCount) {
    results = results.filter(function(elem) {
      return elem.tickCount === tickCount;
    });
  }

  debug("results:");
  debug(results);
  return results;
}


function getCurrentState() {
  var gameStates = getLinks(App.DNA.Hash, 'gameState');
  debug("game states: ");
  debug(gameStates);
  gameStates.sort(function (a, b) {
    return b.tickCount - a.tickCount;
  });
  return gameStates[0];
}

function getState(tickCount) {
  var gameStates = getLinks(App.DNA.Hash, 'gameState', {Load: true});
  debug("game states:");
  debug(gameStates);
  for (var i=0; i < gameStates.length; i++) {
    if (gameStates[i].Entry.tickCount === tickCount) {
      return gameStates[i].Entry;
    }
  }
}

/*=====  End of public functions  ======*/


// a ref should call this function after they have received all votes
// TODO: use a bundle to ensure all entries commit
function commitNewState(tickCount) {
  // var votes = getReceivedVotes(tickCount);
  // var oldState = getCurrentState();
  // var newState = stateTransition(oldState, votes);
  var newStateHash = commit('gameState', {tickCount: tickCount, state: {}});
  var linkHash = commit('link', {
    Links: [{Base: App.DNA.Hash, Link: newStateHash, Tag: 'gameState'}]
  });
}


// takes an old state and some votes to return a new state
// TODO: implement this
function stateTransition(oldState, votes) {
  return oldState;
}


function getCurrentRef(tickCount) {
  var agentList = getLinks(App.DNA.Hash, 'agent');
  debug("visible agents: "+agentList.length);
  return agentList[tickCount % agentList.length].Hash;
}


function castVote(tickCount, vote) {
  var ref = getCurrentRef(tickCount);
  debug('Messaging: ' + ref);
  var message = {tickCount: tickCount, vote: vote}
  send(ref,
    message,
    { Callback: { Function: "responseCallback", ID:''+tickCount} }
  );
}





/*=================================
=            Callbacks            =
=================================*/

// commit a voteRecord to local chain when received via messaging
// TODO: add validation
function receive(frm, message) {
  message.from = frm;
  debug('message received: ' + JSON.stringify(message));
  commit('voteRecord', message);
  return true;
}

// called on the response of a message. For //debug only at the moment
function responseCallback(response, id) {
  debug("response of message tick " + id + ": " + response);
}

// link key hash to chain on genesis
// also make sure the stateAnchor hash exists
function genesis () {
  commit('link', {
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