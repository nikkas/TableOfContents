/*
 * version.last: 2014.01.10.16 toc on hovering
 * version.previous: 2013.11.11.15 »«
 * version.previous: 2013.11.3.12 △▽
 * version.previous: 2013.10.12.11
 * version.previous: 2013.9.6.10
 * version.previous: 2013.7.28.9
 * version.previous: 2013.7.20.8
 * version.previous: 2013.7.1.7
 * version.previous: 2013.6.21.5
 * version.previous: 2013.6.20.4
 * version.previous: 2010.12.6.3
 * version.previous: 2010.11.14.2
 * version.previous: 2010.10.23.1
 * toc.js - the content-scripts of Table-of-contents-chrome-extension.
 *
 * Copyright (C) 2010-2014 Kaseluris.Nikos.1959,
 * kaseluris.nikos@gmail.com
 * synagonism.net
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 *
 ***************************** HTML5-outliner ****************************
 * https://chrome.google.com/extensions/detail/afoibpobokebhgfnknfndkgemglggomo
 *
 * The MIT License
 * Copyright (c) 2010 Dominykas Blyžė
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 ***************************** DHTMLgoodies *****************************
 *
 * To create the expandable-tree I modified code from
 * http://www.dhtmlgoodies.com/
 */

var tocNoPowerstate = 0,
  contentOriginal = document.body.innerHTML,
  tocNoIdTreeLi;

/* Returns an html-ul-element that holds the outline.
 * <ul id = "idCrxTocTree">
 *   <li id = "idCrxTocTreeLI1"><img src = "...png"><a href = "#h5o-1" title = "...">...</a>
 *   ...
 *   </li>
 * </ul>
 * From HTML5-Outliner: https://chrome.google.com/extensions/detail/afoibpobokebhgfnknfndkgemglggomo */
function fcnH5oGet_outlineHtml() {
  var h5oElmCurrentOutlinee, h5oElmDocumentRoot, h5oSemSectionCurrent,
    h5oArStack, h5oNoCounterLink, objOutline;

  function fnH5oIsElement(obj) {
    return obj && obj.tagName;
  }

  /* minifiers will love this more than using el.tagName.toUpperCase() directly */
  function fnH5oGetTagName(elm) {
    return elm.tagName.toUpperCase();
    /* upper casing due to http://ejohn.org/blog/nodename-case-sensitivity/ */
  }

  /* http://dev.w3.org/html5/spec/Overview.html#sectioning-root */
  function fnH5oIsElmSectioningRoot(elm) {
    return fnH5oIsElement(elm) &&
           (new RegExp('^BLOCKQUOTE|BODY|DETAILS|FIELDSET|FIGURE|TD$', "i")).test(fnH5oGetTagName(elm));
  }

  /* http://dev.w3.org/html5/spec/Overview.html#sectioning-content */
  function fnH5oIsElmSectioningContent(elm) {
    return fnH5oIsElement(elm) &&
            (new RegExp('^ARTICLE|ASIDE|NAV|SECTION$', "i")).test(fnH5oGetTagName(elm));
  }

  /* http://dev.w3.org/html5/spec/Overview.html#heading-content */
  function fnH5oIsElmHeading(elm) {
    return fnH5oIsElement(elm) &&
            (new RegExp('^H[1-6]|HGROUP$', "i")).test(fnH5oGetTagName(elm));
  }

  function fnH5oGetHeadingElmRank(el) {
    var elTagName = fnH5oGetTagName(el), i;
    if (elTagName === 'HGROUP') {
      /* The rank of an hgroup element is the rank of the highest-ranked
       * h1-h6 element descendant of the hgroup element,
       * if there are any such elements, or otherwise the same as for
       * an h1 element (the highest rank). */
      for (i = 1; i <= 6; i += 1) {
        if (el.getElementsByTagName('H' + i).length > 0) {
          return -i;
        }
      }
    } else {
      return -parseInt(elTagName.substr(1), null);
    }
  }

  /* returns the text of heading of a sem-section */
  function fnH5oGetSectionHeadingText(eltHeading) {
    var sEmpty = '', sTxt;
    if (fnH5oIsElmHeading(eltHeading)) {
      if (fnH5oGetTagName(eltHeading) === 'HGROUP') {
        eltHeading = eltHeading.getElementsByTagName('h' + (-fnH5oGetHeadingElmRank(eltHeading)))[0];
      }
      /* @todo: try to resolve text content from img[alt] or *[title] */
      sTxt = eltHeading.textContent;
      /* removes from heading the "classHide" content */
      sTxt = sTxt.replace(/\n *¶$/, "");
      /* wikipedia specific */
      sTxt = sTxt.replace(/\[edit\]$/, "");
      sTxt = sTxt.replace(/\[edit.*\]$/, "");
      sTxt = sTxt.replace(/\[Επεξεργασία.*\]$/, "");
      return sTxt
        || eltHeading.innerText
        || "<i>No text content inside " + eltHeading.nodeName + "</i>";
    }
    return sEmpty + eltHeading;
  }

  /* sets an id in an element, if it does not has one */
  function fnH5oGenerateId(elm) {
    var id = elm.getAttribute('id');
    if (id) {
      return id;
    }

    /* toc-extension has 2 div-elm, one for toc and one to content.
     * this way the begining of content is NOT the body-element.
     * Thus I put the first id, in its first heading-element. */
    if (fnH5oGetTagName(elm) === 'BODY') {
      id = 'h5o-1';
      if (elm.getElementsByTagName("header").length > 0) {
        elm.getElementsByTagName("header")[0].setAttribute('id', id);
      } else if (elm.getElementsByTagName('h1').length > 0) {
        elm.getElementsByTagName('h1')[0].setAttribute('id', id);
      } else if (elm.getElementsByTagName('h2').length > 0) {
        elm.getElementsByTagName('h2')[0].setAttribute('id', id);
      }
      return id;
    }

    do {
      id = 'h5o-' + (h5oNoCounterLink += 1);
    } while (h5oElmDocumentRoot.getElementById(id));
    elm.setAttribute('id', id);
    return id;
  }

  function fnH5oGetSectionListAsHtml(sections) {
    var retval = '', i;
    for (i = 0; i < sections.length; i += 1) {
      retval += '<li>' + sections[i].ssFAsHTML() + '</li>';
    }
    return (retval === '' ? retval : '<ul>' + retval + '</ul>');
  }

  /* A semantic-section (ss) class */
  function FunH5oSemSection(eltStart) {
    this.ssArSections = [];
    this.ssElmStart = eltStart;
    /* the heading-element of this semantic-section */
    this.ssElmHeading = false;

    this.ssFAppend = function (what) {
      what.container = this;
      this.ssArSections.push(what);
    };
    this.ssFAsHTML = function () {
      var headingText = fnH5oGetSectionHeadingText(this.ssElmHeading);
      headingText = '<a href = "#' + fnH5oGenerateId(this.ssElmStart) + '">'
                    + headingText
                    + '</a>';
      return headingText + fnH5oGetSectionListAsHtml(this.ssArSections);
    };
  }

  function fnH5oGetSectionHeadingRank(semSection) {
    var eltHeading = semSection.ssElmHeading;
    return fnH5oIsElmHeading(eltHeading)
          ? fnH5oGetHeadingElmRank(eltHeading)
          : 1; /* is this true? TODO: find a reference... */
  }

  /* http://dev.w3.org/html5/spec/Overview.html#outlines */
  function fnH5oWalk(elRoot, fnH5oEnterNode, fnH5oExitNode) {
    var elm = elRoot;
start:
    while (elm) {
      fnH5oEnterNode(elm);
      if (elm.firstChild) {
        elm = elm.firstChild;
        continue start;
      }
      while (elm) {
        fnH5oExitNode(elm);
        if (elm.nextSibling) {
          elm = elm.nextSibling;
          continue start;
        }
        if (elm === elRoot) {
          elm = null;
        } else {
          elm = elm.parentNode;
        }
      }
    }
  }

  function fnH5oGetArrayLastItem(arr) {
    return arr[arr.length - 1];
  }

  function fnH5oLastSection(outlineOrSSection) {
    /* from a ssection or eltOutline object */
    if (outlineOrSSection && outlineOrSSection.elStartingNode) {
      return fnH5oGetArrayLastItem(outlineOrSSection.elArSections);
    }
    return fnH5oGetArrayLastItem(outlineOrSSection.ssArSections);
  }

  function fnH5oEnterNode(elm) {
    /* If the top of the stack is a heading-content-element - do nothing */
    if (fnH5oIsElmHeading(fnH5oGetArrayLastItem(h5oArStack))) {
      return;
    }
    /* When entering a sectioning-content-element or a sectioning-root-element */
    if (fnH5oIsElmSectioningContent(elm) || fnH5oIsElmSectioningRoot(elm)) {
      /* If current-outlinee is not null, and the current-section has no heading,
       * create an implied heading and let that be the heading
       * for the current-section. */
      // if (h5oElmCurrentOutlinee != null && !h5oSemSectionCurrent.ssElmHeading) {
        /*
          TODO: is this really the way it should be done?
          In my implementation, "implied heading" is always created (section.ssElmHeading = false by default)
          If I DO "create" something else here, the algorithm goes very wrong, as there's a place
          where you have to check whether a "heading exists" - so - does the "implied heading" mean
          there is a heading or not?
        */
      // }
      /* If current-outlinee is not null, push current-outlinee onto the stack. */
      if (h5oElmCurrentOutlinee !== null) {
        h5oArStack.push(h5oElmCurrentOutlinee);
      }
      /* Let current-outlinee be the element that is being entered. */
      h5oElmCurrentOutlinee = elm;
      /* Let current-section be a newly created section for
       * the current-outlinee element. */
      h5oSemSectionCurrent = new FunH5oSemSection(elm);
      /* Let there be a new outline for the new current-outlinee,
       * initialized with just the new current-section as the only
       * section in the outline. */
      h5oElmCurrentOutlinee.eltOutline = {
        elArSections: [h5oSemSectionCurrent],
        elStartingNode: elm,
        elFAsHtml: function () {
          return fnH5oGetSectionListAsHtml(this.elArSections);
        }
      };
      return;
    }
    /* If the current-outlinee is null, do nothing */
    if (h5oElmCurrentOutlinee === null) {
      return;
    }
    /* When entering a heading-content-element */
    if (fnH5oIsElmHeading(elm)) {
      var h5oSemSectionNew, bAbourtSubsteps, h5oSemSectionCandidate,
        newCandidateSection;
      /* If the current-section has no heading, let the element being entered
       * be the heading for the current-section. */
      if (!h5oSemSectionCurrent.ssElmHeading) {
        h5oSemSectionCurrent.ssElmHeading = elm;
        /* Otherwise, if the element being entered has a rank equal to
         * or greater than the heading of the last section of the outline
         * of the current-outlinee, */
      } else if (fnH5oGetHeadingElmRank(elm) >=
          fnH5oGetSectionHeadingRank(fnH5oLastSection(h5oElmCurrentOutlinee.eltOutline))) {
        /* create a new section and */
        h5oSemSectionNew = new FunH5oSemSection(elm);
        /* append it to the outline of the current-outlinee element,
         * so that this new section is the new last section of that outline. */
        h5oElmCurrentOutlinee.eltOutline.elArSections.push(h5oSemSectionNew);
        /* Let current-section be that new section. */
        h5oSemSectionCurrent = h5oSemSectionNew;
        /* Let the element being entered be the new heading for the current-section. */
        h5oSemSectionCurrent.ssElmHeading = elm;
      /* Otherwise, run these substeps: */
      } else {
        bAbourtSubsteps = false;
        /* 1. Let candidate-section be current-section. */
        h5oSemSectionCandidate = h5oSemSectionCurrent;
        do {
          /* 2. If the element being entered has a rank lower than
           * the rank of the heading of the candidate-section, */
          if (fnH5oGetHeadingElmRank(elm) < fnH5oGetSectionHeadingRank(h5oSemSectionCandidate)) {
            /* create a new section, */
            h5oSemSectionNew = new FunH5oSemSection(elm);
            /* and append it to candidate-section. (This does not change which section is the last section in the outline.) */
            h5oSemSectionCandidate.ssFAppend(h5oSemSectionNew);
            /* Let current-section be this new section. */
            h5oSemSectionCurrent = h5oSemSectionNew;
            /* Let the element being entered be the new heading
             * for the current-section. */
            h5oSemSectionCurrent.ssElmHeading = elm;
            /* Abort these substeps. */
            bAbourtSubsteps = true;
          }
          /* 3. Let new candidate-section be the section
           * that contains candidate-section in the outline of current-outlinee. */
          newCandidateSection = h5oSemSectionCandidate.container;
          /* 4. Let candidate-section be new candidate-section. */
          h5oSemSectionCandidate = newCandidateSection;
          /* 5. Return to step 2. */
        } while (!bAbourtSubsteps);
      }
      /* Push the element being entered onto the stack.
       * (This causes the algorithm to skip any descendants of the element.) */
      h5oArStack.push(elm);
      return;
    }
    /* Do nothing. */
  }

  function fnH5oExitNode(elm) {
    /* If the top of the stack is an element, and you are exiting that element
     *    Note: The element being exited is a heading-content-element.
     *    Pop that element from the stack.
     * If the top of the stack is a heading-content-element - do nothing */
    var stackTop = fnH5oGetArrayLastItem(h5oArStack), i;
    if (fnH5oIsElmHeading(stackTop)) {
      if (stackTop === elm) {
        h5oArStack.pop();
      }
      return;
    }
    /************ MODIFICATION OF ORIGINAL ALGORITHM *****************/
    /* existing sectioning content or sectioning root
     * this means, h5oSemSectionCurrent will change
     * (and we won't get back to it) */
    if ((fnH5oIsElmSectioningContent(elm) || fnH5oIsElmSectioningRoot(elm))
           && !h5oSemSectionCurrent.ssElmHeading) {
      h5oSemSectionCurrent.ssElmHeading =
        '<i>Untitled ' + fnH5oGetTagName(elm) + '</i>';
    }
    /************ END MODIFICATION ***********************************/
    /* When exiting a sectioning-content-element, if the stack is not empty */
    if (fnH5oIsElmSectioningContent(elm) && h5oArStack.length > 0) {
      /* Pop the top element from the stack,
       *and let the current-outlinee be that element. */
      h5oElmCurrentOutlinee = h5oArStack.pop();
      /* Let current-section be the last section
       * in the outline of the current-outlinee element. */
      h5oSemSectionCurrent = fnH5oLastSection(h5oElmCurrentOutlinee.eltOutline);
      /* Append the outline of the sectioning-content-element being exited
       * to the current-section.
       * (This does not change which section is the last section in the outline.) */
      for (i = 0; i < elm.eltOutline.elArSections.length; i += 1) {
        h5oSemSectionCurrent.ssFAppend(elm.eltOutline.elArSections[i]);
      }
      return;
    }
    /* When exiting a sectioning-root-element, if the stack is not empty */
    if (fnH5oIsElmSectioningRoot(elm) && h5oArStack.length > 0) {
      /* Pop the top element from the stack,
       * and let the current-outlinee be that element. */
      h5oElmCurrentOutlinee = h5oArStack.pop();
      /* Let current-section be the last section
       * in the outline of the current-outlinee element. */
      h5oSemSectionCurrent = fnH5oLastSection(h5oElmCurrentOutlinee.eltOutline);
      /* Finding the deepest child:
       * If current-section has no child sections, stop these steps. */
      while (h5oSemSectionCurrent.ssArSections.length > 0) {
        /* Let current-section be the last child section
         * of the current current-section. */
        h5oSemSectionCurrent = fnH5oLastSection(h5oSemSectionCurrent);
        /* Go back to the substep labeled finding the deepest child. */
      }
      return;
    }
    /* When exiting a sectioning-content-element or a sectioning-root-element */
    if (fnH5oIsElmSectioningContent(elm) || fnH5oIsElmSectioningRoot(elm)) {
      /* Let current-section be the first section in the outline of the current-outlinee element. */
      h5oSemSectionCurrent = h5oElmCurrentOutlinee.eltOutline.elArSections[0];
      /* Skip to the next step in the overall set of steps. (The walk is over.) */
      return;
    }
    /* If the current-outlinee is null, do nothing */
    /* Do nothing */
  }

  /* returns the outline-object of an element */
  function fnH5oGetOutlineObject(eltStart) {
    h5oNoCounterLink = 0;
    /* we need a document, to be able to use getElementById
     * - @todo: figure out a better way, if there is one */
    h5oElmDocumentRoot = eltStart.ownerDocument || window.document;
    /* @todo: how will this work in, say, Rhino, for outlining fragments?
     * Let current-outlinee be null.
     * (It holds the element whose outline is being created.) */
    h5oElmCurrentOutlinee = null;
    /* Let current-section be null.
     * (It holds a pointer to a section,
     * so that elements in the DOM can all be associated with a section.) */
    h5oSemSectionCurrent = null;
    /* Create a stack to hold elements, which is used to handle nesting.
     * Initialize this stack to empty. */
    h5oArStack = [];
    /* As you walk over the DOM in tree order, trigger the first relevant step
     * below for each element as you enter and exit it. */
    fnH5oWalk(eltStart, fnH5oEnterNode, fnH5oExitNode);
    /* If the current-outlinee is null,
     * then there was no sectioning-content-element or sectioning-root-element
     * in the DOM. There is no outline. Abort these steps. */
    /*
    if (h5oElmCurrentOutlinee != null) {
      Associate any nodes that were not associated with a section
        in the steps above with current-outlinee as their section.
      Associate all nodes with the heading of the section with which
        they are associated, if any.
      If current-outlinee is the body element, then the outline created
        for that element is the outline of the entire document.
    }
    */
    return h5oElmCurrentOutlinee !== null ? h5oElmCurrentOutlinee.eltOutline : null;
  }

  objOutline = fnH5oGetOutlineObject(document.body);
  return objOutline ? objOutline.elFAsHtml(true) : "No outline - is there a FRAMESET?";
}

/*
 * Modified from http://www.dhtmlgoodies.com/ */
function fcnTocTreeShow_hide_node(e, inputId) {
  var nodeThis, parentNode;
  if (inputId) {
    if (!document.getElementById(inputId)) {
      return;
    }
    nodeThis = document.getElementById(inputId).getElementsByTagName('span')[0];
  } else {
    nodeThis = this;
    if (this.tagName === 'a') {
      nodeThis = this.parentNode.getElementsByTagName('span')[0];
    }
  }
  parentNode = nodeThis.parentNode;/* ▽△◇ ▼▲◆ ▶▷⊳ ▾▽∇ ◊*/
  if (nodeThis.innerHTML === '▽') {
    nodeThis.innerHTML = '△';
    nodeThis.setAttribute('class', 'clsIconListUpdown');
    parentNode.getElementsByTagName('ul')[0].style.display = 'block';
  } else if (nodeThis.innerHTML === '△') {
    nodeThis.innerHTML = '▽';
    nodeThis.setAttribute('class', 'clsIconListUpdown');
    parentNode.getElementsByTagName('ul')[0].style.display = 'none';
  }
  return false;
}

/* Makes the display-style: none.
 * Modified from http://www.dhtmlgoodies.com/ */
function fcnTocTreeCollapse_all(idTree) {
  var tocTreeLIs = document.getElementById(idTree).getElementsByTagName('li'),
    no,
    subItems;
  for (no = 0; no < tocTreeLIs.length; no += 1) {
    subItems = tocTreeLIs[no].getElementsByTagName('ul');
    if (subItems.length > 0 && subItems[0].style.display === 'block') {
      fcnTocTreeShow_hide_node(false, tocTreeLIs[no].id);
    }
  }
}

/* Inserts images with onclick events, before a-elements.
 * Sets id on li-elements.
 * Modified from http://www.dhtmlgoodies.com/ */
function fcnTocTreeInit() {
  var tocTree = document.getElementById('idCrxTocTree'),
    tocTreeLIs = tocTree.getElementsByTagName('li'), /* Get an array of all menu items */
    no,
    subItems,
    eltSpan,
    aTag;
  for (no = 0; no < tocTreeLIs.length; no += 1) {
    tocNoIdTreeLi += 1;
    subItems = tocTreeLIs[no].getElementsByTagName('ul');
    eltSpan = document.createElement('span');
    eltSpan.innerHTML = '▽';
    eltSpan.onclick = fcnTocTreeShow_hide_node;
    eltSpan.setAttribute('class', 'clsIconListUpdown');
    if (subItems.length === 0) {
      eltSpan.innerHTML = '◇';
      eltSpan.removeAttribute('class');
      eltSpan.setAttribute('class', 'clsIconListDiamond');
    }
    aTag = tocTreeLIs[no].getElementsByTagName('a')[0];
    tocTreeLIs[no].insertBefore(eltSpan, aTag);
    if (!tocTreeLIs[no].id) {
      tocTreeLIs[no].id = 'idCrxTocTreeLI' + tocNoIdTreeLi;
    }
  }
}

/* Highlights ONE item in toc-list */
function fcnTocTreeHighlight_item(eltSpliterLeftDiv, elm) {
  /* removes existing highlighting */
  var tocTreeAs = eltSpliterLeftDiv.getElementsByTagName('a'),
    no;
  for (no = 0; no < tocTreeAs.length; no += 1) {
    tocTreeAs[no].removeAttribute('class');
  }
  elm.setAttribute('class', 'clsCrxTocTreeHighlight');
}

/*
 * version: 2013.06.18
 *
 * jQuery.splitter.js
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * For more details see: http://methvin.com/splitter/
 *
 * @author Dave Methvin (dave.methvin@gmail.com)
 * @author Kaseluris-Nikos-1959
 */
/*global $, jQuery*/
jQuery.fn.fcnTocSpliting = function () {
  return this.each(function (e) {
    var posSplitCurrent = 222, /* setting */
      posSplitPrevious,
      eltSpliterDiv = $(this),
      eltSpliterChildren = eltSpliterDiv.children(),
      eltSpliterLeftDiv = eltSpliterChildren.first(),
      eltSpliterRightDiv = eltSpliterChildren.next(),
      eltSpliterBarDiv = $('<div></div>'),
      eltSpliterBarDivGhost,
      eltSpliterBarButonDiv = $('<div></div>');

    eltSpliterDiv.css({
      'position': 'absolute',
      'top': '0',
      'left': '0',
      'height': '100%',
      'width': '100%',
      'margin': '0',
      'padding': '0',
    });

    function fncDragPerform(e) {
      var incr = e.pageX;
      eltSpliterBarDivGhost.css('left', incr);
    }

    /* Perform actual splitting and animate it */
    function fcnTocSplitTo(nPos) {
      nPos = parseInt(nPos, null);
      posSplitPrevious = posSplitCurrent;
      posSplitCurrent = nPos;

      var sizeB = eltSpliterDiv.width() - nPos - 10 - 10; /* setting splitBar padding */
      eltSpliterLeftDiv.css({'width': nPos + 'px'});
      eltSpliterBarDiv.css({'left': nPos + 'px'});
      eltSpliterRightDiv.css({'width': sizeB + 'px', 'left': nPos + 10 + 'px'});

      eltSpliterDiv.queue(function () {
        setTimeout(function () {
          eltSpliterDiv.dequeue();
          eltSpliterChildren.trigger('resize');
        }, 22);
      });
      if (nPos === 0) {
        eltSpliterBarButonDiv.html('<span><br/>»</span>');
      } else {
        eltSpliterBarButonDiv.html('<span><br/>«</span>');
      }
      eltSpliterBarDiv.css({'background': 'linear-gradient(to left, #aaaaaa, #dddddd 100%)'});
    }

    function fncDragEnd(e) {
      var p = eltSpliterBarDivGhost.position();
      eltSpliterBarDivGhost.remove();
      eltSpliterBarDivGhost = null;
      eltSpliterChildren.css("-webkit-user-select", "text");
      $(document).unbind("mousemove", fncDragPerform)
        .unbind("mouseup", fncDragEnd);
      fcnTocSplitTo(p.left);
    }

    function fncDragStart(e) {
      if (e.target !== this) {
        return;
      }
      eltSpliterBarDivGhost = eltSpliterBarDiv.clone(false)
        .insertAfter(eltSpliterLeftDiv);
      eltSpliterBarDivGhost.attr({'id': 'idCrxTocSpliterBarDivGhost'})
        .css({
          'left': eltSpliterBarDiv.position().left,
        });
      eltSpliterChildren.css({
        '-webkit-user-select': 'none',
      });
      $(document).bind("mousemove", fncDragPerform).bind("mouseup", fncDragEnd);
    }

    eltSpliterBarDiv.attr({'id': 'idCrxTocSpliterBarDiv'})
      .css({
        'height': '100%',
      })
      .bind("mousedown", fncDragStart)
      .hover(
        function () {
          $(this).css({'background': '#cccccc'});
        },
        function () {
          $(this).css({'background': 'linear-gradient(to left, #aaaaaa, #dddddd 100%)'});
        }
      );
    eltSpliterBarDiv.insertAfter(eltSpliterLeftDiv);
    eltSpliterBarButonDiv.attr({'id': 'idCrxTocSpliterBarButonDiv'});
    eltSpliterBarDiv.append(eltSpliterBarButonDiv);
    eltSpliterBarButonDiv.mousedown(function (e) {
      fcnTocSplitTo((posSplitCurrent === 0) ? posSplitPrevious : 0);
      return false;
    });
    fcnTocSplitTo(posSplitCurrent);
  });
};

/* Goes to Id, and blinks it. From HTML5-Outliner */
function fcnTocTreeGo_to_id(id) {
  var el, currentOpacity, currentTransition, duration, itr, blink;
  location.href = '#' + id;
  el = document.getElementById(id);
  currentOpacity = window.getComputedStyle(el).opacity;
  currentTransition = window.getComputedStyle(el).webkitTransition;
  duration = 200;
  itr = 0;
  el.style.webkitTransitionProperty = 'opacity';
  el.style.webkitTransitionDuration = duration + "ms";
  el.style.webkitTransitionTimingFunction = 'ease';
  blink = function () {
    el.style.opacity = (itr % 2 === 0 ? 0 : currentOpacity);
    if (itr < 3) {
      itr += 1;
      setTimeout(blink, duration);
    } else {
      el.style.webkitTransition = currentTransition;
    }
  };
  blink();
}


/* Makes the display-style: block.
 * Modified from http://www.dhtmlgoodies.com/ */
function fcnTocTreeExpand_all(idTree) {
  var tocTreeLIs = document.getElementById(idTree).getElementsByTagName('li'),
    no,
    subItems;
  for (no = 0; no < tocTreeLIs.length; no += 1) {
    subItems = tocTreeLIs[no].getElementsByTagName('ul');
    if (subItems.length > 0 && subItems[0].style.display !== 'block') {
      fcnTocTreeShow_hide_node(false, tocTreeLIs[no].id);
    }
  }
}

/* Expands the first children. */
function fcnTocTreeExpand_first(idTree) {
  var tocTreeLIs, subItems;
  tocTreeLIs = document.getElementById(idTree).getElementsByTagName('li');
  /* expand the first ul-element */
  subItems = tocTreeLIs[0].getElementsByTagName('ul');
  if (subItems.length > 0 && subItems[0].style.display !== 'block') {
    fcnTocTreeShow_hide_node(false, tocTreeLIs[0].id);
  }
}

/* expands all the parents only, of an element */
function fcnTocTreeExpand_parent(elm) {
  var eltSpan, eltUl;
  /** the parent of a-elm is li-elm with parent a ul-elm. */
  eltUl = elm.parentNode.parentNode;
  while (eltUl.tagName === 'UL') {
    eltUl.style.display = 'block';
    /* the parent is li-elm, its first-child is img */
    eltSpan = eltUl.parentNode.firstChild;
    if (eltSpan.tagName === 'SPAN' && eltSpan.innerHTML === '▽') {
      eltSpan.innerHTML = '△';
    }
    eltUl = eltUl.parentNode.parentNode;
  }
}


/* this is the page-listener */
/*global chrome*/
chrome.extension.onMessage.addListener(
  function (request, sender, p) {
    var
      eltBody = document.body,
      eltSpliterDiv = document.createElement('div'), /* the general container*/
      eltSpliterRightDiv = document.createElement('div'),
      eltSpliterLeftDiv = document.createElement('div'),
      eltTocBtnCollapse_All = document.createElement('input'),
      eltTocBtnExp_All = document.createElement('input'),
      eltPpath = document.createElement("p"),
      eltPNote = document.createElement("p");

    if (request.type === "toggleState") {
      if (tocNoPowerstate === 0) {
        tocNoPowerstate = 1;
      } else if (tocNoPowerstate === 1) {
        tocNoPowerstate = 0;
      }
      chrome.extension.sendMessage({
        type: "setStateText",
        value: tocNoPowerstate
      });

      /* create toc */
      if (tocNoPowerstate === 1) {
        tocNoIdTreeLi = 0;
        eltSpliterDiv.id = 'idCrxTocSpliterDiv';
        /* remove from old-body its elements */
        eltBody.innerHTML = '';
        eltBody.appendChild(eltSpliterDiv);

        /* set on right-splitter the old-body */
        eltSpliterRightDiv.id = 'idCrxTocSpliterRightDiv';
        eltSpliterRightDiv.innerHTML = contentOriginal;
        eltSpliterDiv.appendChild(eltSpliterRightDiv);

        /* insert toc */
        eltSpliterLeftDiv.id = 'idCrxTocSpliterLefDiv';
        eltSpliterLeftDiv.innerHTML = fcnH5oGet_outlineHtml();
        eltSpliterLeftDiv.getElementsByTagName("ul")[0].setAttribute('id', 'idCrxTocTree');
        /* insert collaplse-button */
        eltTocBtnCollapse_All.setAttribute('id', 'idBtnCollapse_All');
        eltTocBtnCollapse_All.setAttribute('type', 'button');
        eltTocBtnCollapse_All.setAttribute('value', '△');
        eltTocBtnCollapse_All.setAttribute('title', 'Collapse-All');
        eltTocBtnCollapse_All.setAttribute('class', 'clsCrxTocBtn');
        $(eltTocBtnCollapse_All).click(
          function (event) {
            fcnTocTreeCollapse_all('idCrxTocTree');
          }
        );
        eltSpliterLeftDiv.insertBefore(eltTocBtnCollapse_All, eltSpliterLeftDiv.firstChild);
        /* insert expand-button */
        eltTocBtnExp_All.setAttribute('id', 'idBtnExp_All');
        eltTocBtnExp_All.setAttribute('type', 'button');
        eltTocBtnExp_All.setAttribute('value', '▽');
        eltTocBtnExp_All.setAttribute('title', 'Expand-All');
        eltTocBtnExp_All.setAttribute('class', 'clsCrxTocBtn');
        $(eltTocBtnExp_All).click(
          function (event) {
            fcnTocTreeExpand_all('idCrxTocTree');
          }
        );
        eltSpliterLeftDiv.insertBefore(eltTocBtnExp_All, eltSpliterLeftDiv.firstChild);
        /* insert site-structure menu */
        /* insert page-path--element */
        eltPpath.setAttribute('title', "© 2010-2013 Kaseluris.Nikos.1959");
        eltPpath.innerHTML = '<span class="color-green style-b">ToC</span>: ' + document.title;
        eltSpliterLeftDiv.insertBefore(eltPpath, eltSpliterLeftDiv.firstChild);

        /* toc: add note at the end */
        eltPNote.innerHTML = '<span class="color-green">Note</span>: hovering a piece of text, you see its position (with some exceptions!!!) on ToC.';
        eltSpliterLeftDiv.appendChild(eltPNote);

        $(eltSpliterLeftDiv).find("li > a").each(
          /* what to do on clicking a link in toc */
          function () {
            $(this).click(
              function (event) {
                event.preventDefault();
                var id = $(event.target).attr("href").split('#')[1];
                fcnTocTreeGo_to_id(id);
                fcnTocTreeHighlight_item(eltSpliterLeftDiv, this);
                return false;
              }
            );
            /* sets as title-attribute the text of a-element */
            var txt = $(this).text();
            $(this).attr('title', txt);
          }
        );

        /* on content get-id */
        $(eltSpliterRightDiv).find('*').each(
          function () {
            $(this).mouseover(
              function (event) {
                if (event.stopPropagation) {
                  event.stopPropagation();
                } else {
                  event.cancelBubble = true;
                }

                /* find the id of closest header */
                var sID = 'to find heading id',
                  eltSec = $(this);

                /* if section exist, then find section's id */
                if ($("section").length > 1) {
                  while (!eltSec.get(0).tagName.match(/^SECTION/i)) {
                    eltSec = eltSec.parent();
                    if (eltSec.get(0).tagName.match(/^HEADER/i)) {
                      break;
                    }
                  }
                  if (eltSec.get(0).tagName.match(/^HEADER/i)) {
                    sID = '#h5o-1';
                  } else {
                    sID = '#' + eltSec.attr('id');
                  }
                  if (sID === "") {
                    sID = '#' + $(this).attr('id');
                  }
                } else {
                  if ($(this).get(0).tagName.match(/^H/)) {
                    sID = '#' + $(this).attr('id');
                  } else {
                    /* no section, then find previous header */
                    /* look at parent-elements */
                    sID = "#" + $(this).parents(':header').attr('id');
                    if (sID === '#undefined') {
                      /* look prev sibling elements */
                      sID = '#' + $(this).prevAll(':header').attr('id');
                    }
                    if (sID === '#undefined') {
                      /* find parent p AND then sibling */
                      sID = "#" + $(this).parents('p,table,ol,ul').prevAll(":header").attr('id');
                    }
                  }
                }

                $(eltSpliterLeftDiv).find('a').each(
                  function () {
                    var position, windowHeight;
                    if ($(this).attr('href') === sID) {
                      fcnTocTreeCollapse_all('idCrxTocTree');
                      fcnTocTreeHighlight_item(eltSpliterLeftDiv, this);
                      fcnTocTreeExpand_parent(this);
                      /* scroll to this element */
                      $(eltSpliterLeftDiv).scrollTop(0);
                      position = $(this).offset().top;
                      windowHeight = $(window).height();
                      $(eltSpliterLeftDiv).scrollTop(position - (windowHeight / 2));
                    }
                  }
                );
              }
            );
          }
        );
        eltSpliterDiv.insertBefore(eltSpliterLeftDiv, eltSpliterDiv.firstChild);

        $("#idCrxTocSpliterDiv").fcnTocSpliting();

        fcnTocTreeInit();
        fcnTocTreeExpand_all('idCrxTocTree');
        fcnTocTreeCollapse_all('idCrxTocTree');
        fcnTocTreeExpand_first('idCrxTocTree');

        /* focus div */
        $("#idCrxTocSpliterRightDiv").attr("tabindex", -1).focus();

      } else if (tocNoPowerstate === 0) {
        document.body.innerHTML = contentOriginal;
        /* splitter makes margin 0, default 8. */
        $("body").css('margin', '8px 0 8px 0px');
      }
    } else if (request.type === "requestState") {
      chrome.extension.sendMessage({type: "setStateText", value: tocNoPowerstate});
    }
  }
);
