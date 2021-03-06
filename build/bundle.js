(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const TabAccordionComponent = require("./tab_accordion");

// debounce function for window resize handling
function debounce(func, wait, immediate) {
  let timeout;
  return function () {
    const context = this,
      args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

let app;

function start() {
  app = new TabAccordionComponent(767);
  app.initComponent();
  app.handleResize();
  const dbcHandleResize = debounce(app.handleResize, 250);
  window.addEventListener("resize", dbcHandleResize);
  window.addEventListener("orientationchange", dbcHandleResize);
}

start();
},{"./tab_accordion":4}],2:[function(require,module,exports){
class Selectable {
  constructor(selectableElement) {
    this.element = selectableElement;
  }

  isActive() {
    return this.element.classList.contains("active");
  }

  activate() {
    this.element.classList.add("active");
  }

  deactivate() {
    this.element.classList.remove("active");
  }

  getButtonId() {
    return parseInt(this.element.dataset.buttonId);
  }
}

module.exports = Selectable;
},{}],3:[function(require,module,exports){
const Selectable = require("./selectable");

class SelectablesList {
  constructor(nodeList) {
    this.nodeList = nodeList;
    this.list = this.initList();
  }

  initList() {
    const selectablesArray = [];

    for (let i = 0; i < this.nodeList.length; i++) {
      const item = new Selectable(this.nodeList[i]);
      selectablesArray.push(item);
    }

    return selectablesArray;
  }

  activateIdx(buttonId) {
    this.list[buttonId].activate();
  }

  deactivateIdx(buttonId) {
    this.list[buttonId].deactivate();
  }

  deactivateAll() {
    this.list.forEach((selectable) => selectable.deactivate());
  }

  areAllInactive() {
    for (let i = 0; i < this.list.length; i++) {
      const selectable = this.list[i];
      if (selectable.isActive()) return false;
    }
    return true;
  }
}

module.exports = SelectablesList;
},{"./selectable":2}],4:[function(require,module,exports){
const Selectable = require("./selectable");
const SelectablesList = require("./selectables_list");

class TabAccordionComponent {
  constructor(breakpoint) {
    this.tabButtons = document.querySelectorAll(".tab-button");
    this.accButtons = document.querySelectorAll(".accordion-button");
    this.contents = document.querySelectorAll(".content");

    this.selectablesCollection = [
      new SelectablesList(this.tabButtons),
      new SelectablesList(this.accButtons),
      new SelectablesList(this.contents),
    ];

    this.breakpoint = breakpoint;
    this.isLargeScreen = window.innerWidth > this.breakpoint;

    this.handleTabClick = this.handleTabClick.bind(this);
    this.handleAccordionClick = this.handleAccordionClick.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  initComponent() {
    this.tabButtons.forEach((tab) =>
      tab.addEventListener("click", this.handleTabClick)
    );
    this.accButtons.forEach((acc) =>
      acc.addEventListener("click", this.handleAccordionClick)
    );
  }

  changeMode(buttonId) {
    this.deactivateAll();
    this.activateIdx(buttonId);
  }

  deactivateAll() {
    this.selectablesCollection.forEach((list) => list.deactivateAll());
  }

  activateIdx(buttonId) {
    this.selectablesCollection.forEach((list) => list.activateIdx(buttonId));
  }

  handleTabClick(e) {
    const clickedTab = new Selectable(e.target);

    // Do nothing if the clicked tab is already active (large screen).
    if (clickedTab.isActive()) return;

    this.changeMode(clickedTab.getButtonId());
  }

  handleAccordionClick(e) {
    const clickedAccordion = new Selectable(e.target);

    if (clickedAccordion.isActive()) {
      // Close all accordions if currently active one is clicked (small screen).
      this.deactivateAll();
    } else {
      this.changeMode(clickedAccordion.getButtonId());
    }
  }

  handleResize() {
    if (!this.isLargeScreen && window.innerWidth > this.breakpoint) {
      this.isLargeScreen = true;

      // If all accordions were closed when  moving back to large screen mode,
      // open the first tab by default.
      if (this.selectablesCollection[0].areAllInactive()) this.activateIdx(0);
    } else if (window.innerWidth <= this.breakpoint) {
      this.isLargeScreen = false;
    }
  }
}

module.exports = TabAccordionComponent;
},{"./selectable":2,"./selectables_list":3}]},{},[1]);
