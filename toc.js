/*
 * version: 2010.10.23
 * toc.js - the content-scripts of TableOfContents-extension.
 *
 * Copyright (C) 2010 Kaseluris-Nikos-1959,
 * nikkas@otenet.gr
 * users.otenet.gr/~nikkas/
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
var tocNoPowerstate=0;
var tocElBodyInner=document.body.innerHTML;

/* toc-tree variables */
var tocImgFolder='http://htmlmgr.sourceforge.net/law/';
var tocImgItem='toc-img-item.png';
var tocImgPlus='toc-img-plus.png';
var tocImgMinus='toc-img-minus.png';
var tocNoIdTreeLi;

/* this is the page-listener */
chrome.extension.onRequest.addListener(
  function (request,sender,p){
    if (request.type==="toggleState"){
      if (tocNoPowerstate===0){tocNoPowerstate=1}
      else if (tocNoPowerstate==1){tocNoPowerstate=0}
      chrome.extension.sendRequest({type:"setStateText",value:tocNoPowerstate});

      /* create toc */
      if(tocNoPowerstate===1){
        tocNoIdTreeLi=0;
        var elBody=document.body;
        /* set on cntnt the old-body */
        var tocElDivCntnt=document.createElement("div");
        tocElDivCntnt.id="idTocDivCntnt";
        tocElDivCntnt.innerHTML=tocElBodyInner;
        /* remove from old-body its elements */
        elBody.innerHTML="";
        elBody.appendChild(tocElDivCntnt);
        /* insert toc */
        var tocElDivToc=document.createElement("div");
        tocElDivToc.id="idTocDivToc";
        var elOutline=fH5oGetOutlineHtml();
        tocElDivToc.innerHTML=elOutline;
        tocElDivToc.getElementsByTagName("ul")[0].setAttribute('id','idTocTree');
//        $(tocElDivToc).find("ul").attr('id','idTocTree');
        /* insert collaplse-button */
        var elClpsAll=document.createElement("input");
        elClpsAll.setAttribute("type","button");
        elClpsAll.setAttribute("value","Collapse-All");
        $(elClpsAll).click(
          function(event){
            fCollapseAll('idTocTree');
          });
        tocElDivToc.insertBefore(elClpsAll,tocElDivToc.firstChild);
        /* insert expand-button */
        var elExpAll=document.createElement("input");
        elExpAll.setAttribute("type","button");
        elExpAll.setAttribute("value","Expand-All");
        $(elExpAll).click(
          function(event){
            fExpandAll('idTocTree');
          });
        tocElDivToc.insertBefore(elExpAll,tocElDivToc.firstChild);
        /* insert title-element */
        var elP=document.createElement("p");
        elP.innerHTML="ToC: "+document.title;
        elP.title="© 2010 Kaseluris-Nikos-1959";
        tocElDivToc.insertBefore(elP,tocElDivToc.firstChild);
//        tocElDivToc.getElementById("p").style.textDecoration="underline";
        $(tocElDivToc).find("p").css('font-size','16px');
        $(tocElDivToc).find("a").each(
          /* what to do on clicking a link in toc */
          function(){
            $(this).click(
              function(event){
                event.preventDefault();
                var id=$(event.target).attr("href").split('#')[1];
                fH5oGotoId(id);
                fHighlightItem(tocElDivToc,this);
                return false
              }
            )
            /* sets as title-attribute the text of a-element */
            var txt=$(this).text();
            $(this).attr('title',txt);
          }
        );
        /* on content get-id */
        $(tocElDivCntnt).find("*[id]").each(
//        $(tocElDivCntnt).find("*[id^='h5o-']").each(
          function(){
            $(this).click(
              function(event){
                if (event.stopPropagation){
                  event.stopPropagation();
                }else{
                  event.cancelBubble=true;
                }
                var sID="#"+$(this).attr('id');
                $(tocElDivToc).find("a").each(
                  function(){
                    if($(this).attr('href')===sID){
//                      fExpandAll('idTocTree');
                      fCollapseAll('idTocTree');
                      fHighlightItem(tocElDivToc,this);
                      fExpandParent(this);
                      /* scroll to this element */
//                      this.scrollIntoView(true);
                    }
                  });
              }
            )
          }
        );
        elBody.insertBefore(tocElDivToc,elBody.firstChild);
        fInitTree();
        /* go to existing-address */
        var sUrl=document.URL;
        if(sUrl.indexOf("#")>=0){
          location.href="#"+sUrl.split('#')[1];
        }
      }
      else if(tocNoPowerstate===0){
        document.body.innerHTML=tocElBodyInner;
      }
    } else if (request.type==="requestState"){
      chrome.extension.sendRequest({type:"setStateText",value:tocNoPowerstate});
    }
  }
);

/* Goes to Id, and blinks it. From HTML5-Outliner */
function fH5oGotoId(id){
  location.href='#'+id;
  var el=document.getElementById(id);
  var currentOpacity=window.getComputedStyle(el).opacity,
    currentTransition=window.getComputedStyle(el).webkitTransition;
  var duration=200,
    itr=0;
  el.style.webkitTransitionProperty="opacity";
  el.style.webkitTransitionDuration=duration+"ms"
  el.style.webkitTransitionTimingFunction="ease";
  var blink=function()
  {
    el.style.opacity=(itr % 2 == 0 ? 0 : currentOpacity);
    if (itr < 3) {
      itr++;
      setTimeout(blink, duration);
    } else {
      el.style.webkitTransition=currentTransition;
    }
  }
  blink();
}


/* Returns an html-ul-element that holds the outline.
 * From HTML5-Outliner: https://chrome.google.com/extensions/detail/afoibpobokebhgfnknfndkgemglggomo */
function fH5oGetOutlineHtml(){
  var h5oElmCurrentOutlinee, h5oElmDocumentRoot, h5oSemSectionCurrent,
      h5oArStack, h5oNoCounterLink;

  /* http://dev.w3.org/html5/spec/Overview.html#sectioning-root */
  function fH5oIsElmSectioningRoot(elm){
    return fH5oIsElement(elm) &&
           (new RegExp('^BLOCKQUOTE|BODY|DETAILS|FIELDSET|FIGURE|TD$', "i")).test(fH5oGetTagName(elm));
  }

  /* http://dev.w3.org/html5/spec/Overview.html#sectioning-content */
  function fH5oIsElmSectioningContent(elm){
    return fH5oIsElement(elm) &&
            (new RegExp('^ARTICLE|ASIDE|NAV|SECTION$', "i")).test(fH5oGetTagName(elm));
  }

  /* http://dev.w3.org/html5/spec/Overview.html#heading-content */
  function fH5oIsElmHeading(elm){
    return fH5oIsElement(elm) &&
            (new RegExp('^H[1-6]|HGROUP$', "i")).test(fH5oGetTagName(elm));
  }

  function fH5oIsElement(obj){
    return obj && obj.tagName;
  }

  /* A semantic-section (ss) class */
  function fH5oSemSection(elmStart){
    this.ssArSections=[];
    this.ssElmStart=elmStart;
    /* the heading-element of this semantic-section */
    this.ssElmHeading=false;

    this.ssFAppend=function(what){
      what.container=this;
      this.ssArSections.push(what);
    };
    this.ssFAsHTML= function(){
      var headingText=fH5oGetSectionHeadingText(this.ssElmHeading);
      headingText='<a href="#'+fH5oGenerateId(this.ssElmStart)+'">'
                    + headingText
                    + '</a>';
      return headingText + fH5oGetSectionListAsHtml(this.ssArSections);
    };
  }

  function fH5oGetSectionListAsHtml(sections){
    var retval='';
    for (var i=0; i < sections.length; i++) {
      retval+='<li>'+sections[i].ssFAsHTML()+'</li>';
    }
    return (retval=='' ? retval : '<ul>'+retval+'</ul>');
  }

  function fH5oGetSectionHeadingRank(semSection){
    var elmHeading=semSection.ssElmHeading;
    return fH5oIsElmHeading(elmHeading)
          ? fH5oGetHeadingElmRank(elmHeading)
          : 1; /* is this true? TODO: find a reference... */
  }

  /* returns the text of heading of a sem-section */
  function fH5oGetSectionHeadingText(elmHeading){
    if (fH5oIsElmHeading(elmHeading)) {
      if (fH5oGetTagName(elmHeading)=='HGROUP') {
        elmHeading=elmHeading.getElementsByTagName('h'+(-fH5oGetHeadingElmRank(elmHeading)))[0];
      }
      /* @todo: try to resolve text content from img[alt] or *[title] */
      return elmHeading.textContent || elmHeading.innerText || "<i>No text content inside "+elmHeading.nodeName+"</i>";
    }
    return ""+elmHeading;
  }

  /* sets an id in an element, if it does not has one */
  function fH5oGenerateId(elm){
    var id=elm.getAttribute('id');
    if (id) return id;

    /* toc-extension has 2 div-elm, one for toc and one to content.
     * this way the begining of content is NOT the body-element.
     * Thus I put the first id, in its first heading-element. */
    if (fH5oGetTagName(elm)=='BODY'){
      id="h5o-1";
      if(elm.getElementsByTagName("header").length>0){
        elm.getElementsByTagName("header")[0].setAttribute('id',id);
      }else if(elm.getElementsByTagName("h1").length>0){
        elm.getElementsByTagName("h1")[0].setAttribute('id',id);
      }else if(elm.getElementsByTagName("h2").length>0){
        elm.getElementsByTagName("h2")[0].setAttribute('id',id);
      }
      return id;
    }

    do {
      id='h5o-'+(++h5oNoCounterLink);
    } while (h5oElmDocumentRoot.getElementById(id));
    elm.setAttribute('id', id);
    return id;
  }

  /* http://dev.w3.org/html5/spec/Overview.html#outlines */
  function fH5oWalk(elRoot, fH5oEnterNode, fH5oExitNode) {
    var elm=elRoot;
    start: while (elm) {
      fH5oEnterNode(elm);
      if (elm.firstChild) {
        elm=elm.firstChild;
        continue start;
      }
      while (elm) {
        fH5oExitNode(elm);
        if (elm.nextSibling) {
          elm=elm.nextSibling;
          continue start;
        }
        if (elm == elRoot)
          elm=null;
        else
          elm=elm.parentNode;
      }
    }
  }

  function fH5oEnterNode(elm){
    /* If the top of the stack is a heading-content-element - do nothing */
    if (fH5oIsElmHeading(fH5oGetArrayLastItem(h5oArStack))) {
      return;
    }
    /* When entering a sectioning-content-element or a sectioning-root-element */
    if (fH5oIsElmSectioningContent(elm) || fH5oIsElmSectioningRoot(elm)) {
      /* If current-outlinee is not null, and the current-section has no heading,
       * create an implied heading and let that be the heading
       * for the current-section. */
      // if (h5oElmCurrentOutlinee!=null && !h5oSemSectionCurrent.ssElmHeading) {
        /*
          TODO: is this really the way it should be done?
          In my implementation, "implied heading" is always created (section.ssElmHeading=false by default)
          If I DO "create" something else here, the algorithm goes very wrong, as there's a place
          where you have to check whether a "heading exists" - so - does the "implied heading" mean
          there is a heading or not?
        */
      // }
      /* If current-outlinee is not null, push current-outlinee onto the stack. */
      if (h5oElmCurrentOutlinee!=null) {
        h5oArStack.push(h5oElmCurrentOutlinee);
      }
      /* Let current-outlinee be the element that is being entered. */
      h5oElmCurrentOutlinee=elm;
      /* Let current-section be a newly created section for
       * the current-outlinee element. */
      h5oSemSectionCurrent=new fH5oSemSection(elm);
      /* Let there be a new outline for the new current-outlinee,
       * initialized with just the new current-section as the only
       * section in the outline. */
      h5oElmCurrentOutlinee.elmOutline={
        elArSections: [h5oSemSectionCurrent],
        elStartingNode: elm,
        elFAsHtml: function() {
          return fH5oGetSectionListAsHtml(this.elArSections);
        }
      }
      return;
    }
    /* If the current-outlinee is null, do nothing */
    if (h5oElmCurrentOutlinee==null) {
      return;
    }
    /* When entering a heading-content-element */
    if (fH5oIsElmHeading(elm)) {
      /* If the current-section has no heading, let the element being entered
       * be the heading for the current-section. */
      if (!h5oSemSectionCurrent.ssElmHeading) {
        h5oSemSectionCurrent.ssElmHeading=elm;
        /* Otherwise, if the element being entered has a rank equal to
         * or greater than the heading of the last section of the outline
         * of the current-outlinee, */
      } else if (fH5oGetHeadingElmRank(elm) >=
                 fH5oGetSectionHeadingRank(
                   fH5oLastSection(h5oElmCurrentOutlinee.elmOutline))) {
        /* create a new section and */
        var h5oSemSectionNew=new fH5oSemSection(elm);
        /* append it to the outline of the current-outlinee element,
         * so that this new section is the new last section of that outline. */
        h5oElmCurrentOutlinee.elmOutline.elArSections.push(h5oSemSectionNew);
        /* Let current-section be that new section. */
        h5oSemSectionCurrent=h5oSemSectionNew;
        /* Let the element being entered be the new heading for the current-section. */
        h5oSemSectionCurrent.ssElmHeading=elm;
      /* Otherwise, run these substeps: */
      } else {
        var bAbourtSubsteps=false;
        /* 1. Let candidate-section be current-section. */
        var h5oSemSectionCandidate=h5oSemSectionCurrent;
        do {
          /* 2. If the element being entered has a rank lower than
           * the rank of the heading of the candidate-section, */
          if (fH5oGetHeadingElmRank(elm) < fH5oGetSectionHeadingRank(h5oSemSectionCandidate)) {
            /* create a new section, */
            var h5oSemSectionNew=new fH5oSemSection(elm);
            /* and append it to candidate-section. (This does not change which section is the last section in the outline.) */
            h5oSemSectionCandidate.ssFAppend(h5oSemSectionNew);
            /* Let current-section be this new section. */
            h5oSemSectionCurrent=h5oSemSectionNew;
            /* Let the element being entered be the new heading
             * for the current-section. */
            h5oSemSectionCurrent.ssElmHeading=elm;
            /* Abort these substeps. */
            bAbourtSubsteps=true;
          }
          /* 3. Let new candidate-section be the section
           * that contains candidate-section in the outline of current-outlinee. */
          var newCandidateSection=h5oSemSectionCandidate.container;
          /* 4. Let candidate-section be new candidate-section. */
          h5oSemSectionCandidate=newCandidateSection;
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

  function fH5oExitNode(elm){
    /* If the top of the stack is an element, and you are exiting that element
     *    Note: The element being exited is a heading-content-element.
     *    Pop that element from the stack.
     * If the top of the stack is a heading-content-element - do nothing */
    var stackTop=fH5oGetArrayLastItem(h5oArStack);
    if (fH5oIsElmHeading(stackTop)) {
      if (stackTop == elm) {
        h5oArStack.pop();
      }
      return;
    }
    /************ MODIFICATION OF ORIGINAL ALGORITHM *****************/
    /* existing sectioning content or sectioning root
     * this means, h5oSemSectionCurrent will change
     * (and we won't get back to it) */
    if ((fH5oIsElmSectioningContent(elm)|| fH5oIsElmSectioningRoot(elm))
    	     && !h5oSemSectionCurrent.ssElmHeading) {
      h5oSemSectionCurrent.ssElmHeading=
        '<i>Untitled ' + fH5oGetTagName(elm) + '</i>';
    }
    /************ END MODIFICATION ***********************************/
    /* When exiting a sectioning-content-element, if the stack is not empty */
    if (fH5oIsElmSectioningContent(elm) && h5oArStack.length > 0) {
      /* Pop the top element from the stack,
       *and let the current-outlinee be that element. */
      h5oElmCurrentOutlinee=h5oArStack.pop();
      /* Let current-section be the last section
       * in the outline of the current-outlinee element. */
      h5oSemSectionCurrent=fH5oLastSection(h5oElmCurrentOutlinee.elmOutline);
      /* Append the outline of the sectioning-content-element being exited
       * to the current-section.
       * (This does not change which section is the last section in the outline.) */
      for (var i=0; i < elm.elmOutline.elArSections.length; i++) {
        h5oSemSectionCurrent.ssFAppend(elm.elmOutline.elArSections[i]);
      }
      return;
    }
    /* When exiting a sectioning-root-element, if the stack is not empty */
    if (fH5oIsElmSectioningRoot(elm) && h5oArStack.length > 0) {
      /* Pop the top element from the stack,
       * and let the current-outlinee be that element. */
      h5oElmCurrentOutlinee=h5oArStack.pop();
      /* Let current-section be the last section
       * in the outline of the current-outlinee element. */
      h5oSemSectionCurrent=fH5oLastSection(h5oElmCurrentOutlinee.elmOutline);
      /* Finding the deepest child:
       * If current-section has no child sections, stop these steps. */
      while (h5oSemSectionCurrent.ssArSections.length > 0) {
        /* Let current-section be the last child section
         * of the current current-section. */
        h5oSemSectionCurrent=fH5oLastSection(h5oSemSectionCurrent);
        /* Go back to the substep labeled finding the deepest child. */
      }
      return;
    }
    /* When exiting a sectioning-content-element or a sectioning-root-element */
    if (fH5oIsElmSectioningContent(elm) || fH5oIsElmSectioningRoot(elm)) {
      /* Let current-section be the first section in the outline of the current-outlinee element. */
      h5oSemSectionCurrent=h5oElmCurrentOutlinee.elmOutline.elArSections[0];
      /* Skip to the next step in the overall set of steps. (The walk is over.) */
      return;
    }
    /* If the current-outlinee is null, do nothing */
    /* Do nothing */
  }

  /* minifiers will love this more than using el.tagName.toUpperCase() directly */
  function fH5oGetTagName(elm){
    return elm.tagName.toUpperCase();
    /* upper casing due to http://ejohn.org/blog/nodename-case-sensitivity/ */
  }

  function fH5oGetHeadingElmRank(el){
    var elTagName=fH5oGetTagName(el);
    if (elTagName=='HGROUP') {
      /* The rank of an hgroup element is the rank of the highest-ranked
       * h1-h6 element descendant of the hgroup element,
       * if there are any such elements, or otherwise the same as for
       * an h1 element (the highest rank). */
      for (var i=1; i <= 6; i++) {
        if (el.getElementsByTagName('H'+i).length > 0)
          return -i;
      }
    } else {
      return -parseInt(elTagName.substr(1));
    }
  }

  function fH5oLastSection(outlineOrSSection){
    /* from a ssection or elmOutline object */
    if (outlineOrSSection && outlineOrSSection.elStartingNode){
      return fH5oGetArrayLastItem(outlineOrSSection.elArSections);
    }else{
      return fH5oGetArrayLastItem(outlineOrSSection.ssArSections);
    }
  }

  function fH5oGetArrayLastItem(arr){
    return arr[arr.length-1];
  }

  /* returns the outline-object of an element */
  function fH5oGetOutlineObject(elmStart){
    h5oNoCounterLink=0;
    /* we need a document, to be able to use getElementById
     * - @todo: figure out a better way, if there is one */
    h5oElmDocumentRoot=elmStart.ownerDocument || window.document;
    /* @todo: how will this work in, say, Rhino, for outlining fragments?
     * Let current-outlinee be null.
     * (It holds the element whose outline is being created.) */
    h5oElmCurrentOutlinee=null;
    /* Let current-section be null.
     * (It holds a pointer to a section,
     * so that elements in the DOM can all be associated with a section.) */
    h5oSemSectionCurrent=null;
    /* Create a stack to hold elements, which is used to handle nesting.
     * Initialize this stack to empty. */
    h5oArStack=[];
    /* As you walk over the DOM in tree order, trigger the first relevant step
     * below for each element as you enter and exit it. */
    fH5oWalk(elmStart, fH5oEnterNode, fH5oExitNode);
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
    return h5oElmCurrentOutlinee != null ? h5oElmCurrentOutlinee.elmOutline : null;
  }

  var objOutline=fH5oGetOutlineObject(document.body);
  return objOutline ? objOutline.elFAsHtml(true) : "No outline - is there a FRAMESET?";
}

/* *********************************************************** */

/* Makes the display-style: block.
 * Modified from http://www.dhtmlgoodies.com/ */
function fExpandAll(idTree){
  var tocTreeLIs=document.getElementById(idTree).getElementsByTagName('li');
  for(var no=0;no<tocTreeLIs.length;no++){
    var subItems=tocTreeLIs[no].getElementsByTagName('ul');
    if(subItems.length>0 && subItems[0].style.display!='block'){
      fShowHideNode(false,tocTreeLIs[no].id);
    }
  }
}

/* expands all the parents only, of an element */
function fExpandParent(elm){
  var elmImg;
  /** the parent of a-elm is li-elm with parent a ul-elm. */
  var elmUl=elm.parentNode.parentNode;
  while (elmUl.tagName==="UL"){
    elmUl.style.display='block';
    /* the parent is li-elm, its first-child is img */
    elmImg=elmUl.parentNode.firstChild;
    if(elmImg.tagName==="IMG" && elmImg.src.indexOf(tocImgPlus)>=0){
      elmImg.src=elmImg.src.replace(tocImgPlus,tocImgMinus);
    }
    elmUl=elmUl.parentNode.parentNode;
  }

}

/* Makes the display-style: none.
 * Modified from http://www.dhtmlgoodies.com/ */
function fCollapseAll(idTree){
  var tocTreeLIs=document.getElementById(idTree).getElementsByTagName('li');
  for(var no=0;no<tocTreeLIs.length;no++){
    var subItems=tocTreeLIs[no].getElementsByTagName('ul');
    if(subItems.length>0 && subItems[0].style.display=='block'){
      fShowHideNode(false,tocTreeLIs[no].id);
    }
  }
}

/*
 * Modified from http://www.dhtmlgoodies.com/ */
function fShowHideNode(e,inputId)
{
  if(inputId){
    if(!document.getElementById(inputId))
      return;
    thisNode=document.getElementById(inputId).getElementsByTagName('img')[0];
  }else{
    thisNode=this;
    if(this.tagName=='a')
      thisNode=this.parentNode.getElementsByTagName('img')[0];
  }
  var parentNode=thisNode.parentNode;
  if(thisNode.src.indexOf(tocImgPlus)>=0){
    thisNode.src=thisNode.src.replace(tocImgPlus,tocImgMinus);
    parentNode.getElementsByTagName('ul')[0].style.display='block';
  }else{
    thisNode.src=thisNode.src.replace(tocImgMinus,tocImgPlus);
    parentNode.getElementsByTagName('ul')[0].style.display='none';
  }
  return false;
}

/* Inserts images before a-elements win onclick events. Sets id on li.
 * Modified from http://www.dhtmlgoodies.com/ */
function fInitTree()
{
  var tocTree=document.getElementById('idTocTree');
  var tocTreeLIs=tocTree.getElementsByTagName('li'); // Get an array of all menu items
  for(var no=0;no<tocTreeLIs.length;no++){
    tocNoIdTreeLi++;
    var subItems=tocTreeLIs[no].getElementsByTagName('ul');
    var img=document.createElement('img');
    img.src=tocImgFolder + tocImgPlus;
    img.onclick=fShowHideNode;
    if(subItems.length==0)
      img.src=tocImgFolder + tocImgItem;
    var aTag=tocTreeLIs[no].getElementsByTagName('a')[0];
    tocTreeLIs[no].insertBefore(img,aTag);
    if(!tocTreeLIs[no].id)
      tocTreeLIs[no].id='idTocTreeLI' + tocNoIdTreeLi;
  }
}

/* Highlights ONE item in toc-list */
function fHighlightItem(tocElDivToc,elm){
  /* removes existing highlighting */
  var tocTreeAs=tocElDivToc.getElementsByTagName('a');
  for(var no=0;no<tocTreeAs.length;no++){
    tocTreeAs[no].removeAttribute("class");
  }
  elm.setAttribute('class','classTocTreeHighlight');
}