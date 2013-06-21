//contains extension's only functionality.
var tocCurrent_tab_id = null;

chrome.browserAction.setBadgeBackgroundColor({color:[0,0,255,255]});

/**
 *
 *
 * @modified 2013.06.17
 * @since 2010.10.03 (v1)
 * @author HoKoNoUmo
 */
chrome.browserAction.onClicked.addListener(
  function(tab){
    tocCurrent_tab_id=tab.id;
    chrome.tabs.sendMessage(tab.id, {type:"toggleState"});
  }
);

/**
 * Changes the on/off badge-text, listening from pages.
 *
 * @modified 2013.06.17
 * @since 2010.10.03 (v1)
 * @author HoKoNoUmo
 */
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (tocCurrent_tab_id !== sender.tab.id) {
      return;
    }
    if (request.type === "setStateText") {
      fnSet_state_text(request.value);
    }
  }
);

/**
 *
 * @modified 2013.06.20
 * @since 2010.10.03 (v1)
 * @author HoKoNoUmo
 */
chrome.tabs.onRemoved.addListener(
  function(idTab){
    tocCurrent_tab_id = null;
    fnSet_state_text(0);
  }
);

/**
 *
 *
 * @modified 2013.06.20
 * @since 2010.10.03 (v1)
 * @author HoKoNoUmo
 */
chrome.tabs.onSelectionChanged.addListener(
  function (tabId, selectInfo) {
//    fnSet_state_text(0);
  }
);

/**
 * On non-current-tab, do nothing.<br/>
 * On current-tab, on "reload" set off-state. On click, set
 * the existing-state.
 *
 * @modified 2013.06.17
 * @since 2010.10.03 (v1)
 * @author HoKoNoUmo
 */
chrome.tabs.onUpdated.addListener(
  function (tabId, changeInfo, tab) {
    if (tocCurrent_tab_id !== tab.id) {
      return;
    }
    fnSet_state_text(0);
    chrome.tabs.sendMessage(tabId,{type:"requestState"});
  }
);


/**
 * Will display a BadgeText if we can display or no the ToC
 *
 * @modified 2013.06.18
 * @since 2010.10.03 (v1)
 * @author HoKoNoUmo
 */
function fnSet_state_text(nPower_state) {
  switch (nPower_state) {
    case 0:
      chrome.browserAction.setBadgeText({text: ""});//OFF STATE
      break;
    case 1:
      chrome.browserAction.setBadgeText({text: "on"});
      break;
  }
}
