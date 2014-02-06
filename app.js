var blacklist          = [ "viralnova.com", "upworthy.com", "buzzfeed.com", "reshareworthy.com", "youtube.com" ],
    blacklistRegex     = new RegExp(blacklist.join('|'), 'i'), 
    timeline           = document.querySelector('div[id^=topnews_main_stream_]'), 
    MutationObserver   = MutationObserver || WebKitMutationObserver,
    removedNodeMessage = "AntiViral removed a post containing the blocked site",
    removeWrapper      = false,
    debugMode          = true,
    contentSelector    = "div[data-ft*=mf_story_key]", 
    commentSelector    = "div.UFICommentContent",
    Settings           = {
      ExecutionMode: null,
      REMOVE:  "REMOVE",
      MESSAGE: "MESSAGE",
      DEBUG:   "DEBUG"
    };

function Antiviralize() {
  var wrapper; 
  [].slice
    // get all external links 
    .call(timeline.querySelectorAll('a[target=_blank]'))
    // filter to only process links on blacklist
    .filter(function(e){ return !!e.href.match(blacklistRegex); })
    .forEach( function(link) {       
      if (!ancestor(link, commentSelector) && (wrapper = ancestor(link, contentSelector))) {
        if (Settings.ExecutionMode === Settings.REMOVE && (!inoculated(wrapper.parentNode))) {
          markAsInoculated(wrapper.parentNode);
          wrapper.parentNode.removeChild(wrapper);
        }
        else if (!inoculated(wrapper)) {
          markAsInoculated(wrapper);

          if (Settings.ExecutionMode === Settings.DEBUG) { 
            wrapper.firstChild.style.display = 'none';
          } 
          else { 
            wrapper.removeChild(wrapper.firstChild);  
          }

          reportInoculation(link, wrapper); 
        }
      }
  });
}

function ancestor(elem, selector) {
  if (elem) {
    var matchesSelector = elem.matches || elem.webkitMatchesSelector || elem.mozMatchesSelector || elem.msMatchesSelector;
    elem = elem.parentNode;

    while (elem && elem !== document) {
      if (matchesSelector.bind(elem)(selector)) { 
        return elem;
      } 
      else {
        elem = elem.parentNode;
      }
    }
  }
  return null;
}

function reportInoculation(link, parent) {
  var report = [removedNodeMessage, link.href.match(blacklistRegex)[0]];
  
  if (Settings.ExecutionMode === Settings.DEBUG) {
    debug(report.join(' '));
    report.push("<a onclick='function(e) { alert(e); }' class='antiviral restore'>Restore</a>");
    var node = document.createElement('span');
    parent.appendChild(node);
    node.innerHTML = report.join(' ');
  }
  else {
    parent.innerHTML = report.join(' ');
  }
}

function markAsInoculated(elem) {
  if (elem.dataset) {
    elem.dataset.antiviral = "inoculated";
  }
  else {
    elem.setAttribute('data-antiviral', "inoculated");
  }
}

function inoculated(elem) {
  return !!(elem.dataset.antiviral || elem.getAttribute('data-antiviral'));
}

function debug() {
  if (Settings.ExecutionMode === Settings.DEBUG) {
    Array.prototype.slice.call(arguments).forEach(function(arg) {
      console.log(arg);
    });
  }
}

( function() { 
    Settings.ExecutionMode = debugMode 
      ? Settings.DEBUG : removeWrapper 
        ? Settings.REMOVE : Settings.MESSAGE;
        
    Antiviralize();  
    
    if (MutationObserver) {
      new MutationObserver(function(mutations) { 
        mutations.forEach(function(mutation) {
          // we only care that a mutation occured, not about the contents 
          Antiviralize();
        });
      }).observe(timeline, { childList: true, subtree: true });
    }
  }
)();