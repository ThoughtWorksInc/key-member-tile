var ReactDOM = require('react-dom');
var React = require('react');

var listMixin = {
  _hasOption : function(name) {return this.listOptions &&  typeof this.listOptions[name] != "undefined"},
  getInitialState: function() {
    if (this.listOptions && this.listOptions.model){
      return {items: this.props[this.listOptions.model]};
    }else {
      return {items: this.props.list || []};
    }
  },
  componentWillMount: function() {
    // Set movable props
    // This should transfer to `ItemComponent` in `ListComponent`
    this.movableProps = {
      bindMove: this.bindMove,
      unbindMove: this.unbindMove,
      resort: this.resort
    };
  },
  // movedComponent: component to move
  // moveElemEvent: mouse event object triggered on moveElem
  bindMove: function(movedComponent, moveElemEvent) {
    var moveElem =  ReactDOM.findDOMNode(movedComponent)
      , parentElem = moveElem.parentElement
      , placeholder = movedComponent.placeholder
      , parentPosition = moveElem.parentElement.getBoundingClientRect()
      , moveElemPosition = moveElem.getBoundingClientRect()
      , viewport = document.body.getBoundingClientRect()
      , maxOffset = viewport.right - parentPosition.left - moveElemPosition.width
      , offsetX = moveElemEvent.clientX - moveElemPosition.left
      , offsetY = moveElemEvent.clientY - moveElemPosition.top;

    // (Keep width) currently manually set in `onMoveBefore` if necessary,
    // due to unexpected css box model
    moveElem.style.width = moveElem.offsetWidth + 'px';
    moveElem.parentElement.style.position = 'relative';

    moveElem.style.position = 'absolute';
    moveElem.style.zIndex = '100';
    moveElem.style.userSelect = 'none';
    moveElem.style.cursor = 'move';

    // custom:  restrict select on whole page
    document.body.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mzUserSelect = 'none';
    document.body.cursor = 'move !important';


    // Keep the initialized position in DOM
    moveElem.style.left = (moveElemPosition.left - parentPosition.left) + 'px';
    moveElem.style.top = (moveElemPosition.top - parentPosition.top) + 'px';

    // Place here to customize/override styles
    if (this.onMoveBefore) {
      this.onMoveBefore(moveElem);
    }

    this.moveHandler = function(e) {
      var left = e.clientX - parentPosition.left - offsetX
        , top = e.clientY - parentPosition.top - offsetY
        , siblings
        , sibling
        , compareRect
        , i, len;

      if (left > maxOffset) {
        left = maxOffset;
      }

      // custom: spec of left
      if ( this._hasOption("left") ){
        moveElem.style.left = this.listOptions.left + 'px'
      }else {
        moveElem.style.left = left + 'px';
      }

      // restrict moveElem inside parent
      if ( this._hasOption('restrict') && this.listOptions.restrict == 'parent' ){
        top = Math.max(-2 * offsetY, top);
        top = Math.min(parentPosition.height - moveElemPosition.height + 2*offsetY, top);

        left = Math.max(-2 * offsetX, left);
        left = Math.min(parentPosition.width - moveElemPosition.width + 2*offsetX, left);
      }

      moveElem.style.top = top + 'px';
      // Loop all siblings to find intersected sibling
      siblings = moveElem.parentElement.children;

      // custom : check overlap on two sides
      const checkOverlap = function( mouse, targetRect, side ){
        var horizontal = mouse.clientX > targetRect.left && mouse.clientX < targetRect.right ;
        var vertical = mouse.clientY > targetRect.top && mouse.clientY < targetRect.bottom;

        if (side == "x" ){
          return horizontal;
        }else if( side == "y" ){
          return vertical;
        }else {
          return horizontal && vertical;
        }
      };

      for (i = 0, len = siblings.length; i < len; i++) {
        sibling = siblings[i];
        if (sibling !== this.intersectItem &&
          sibling !== moveElem) {
          compareRect = sibling.getBoundingClientRect();

          var hit = checkOverlap(e, compareRect, ( this.listOptions && this.listOptions.side ) ? this.listOptions.side : undefined);

          if (hit) {
            if (sibling !== placeholder) {
              movedComponent.insertPlaceHolder(sibling);
            }
            this.intersectItem = sibling;
            break;
          }
        }
      }
      e.stopPropagation();
    }.bind(this);

    // Stop move
    this.mouseupHandler = function() {
      var el = moveElem
        , parentElem = el.parentElement
        , children = parentElem.children
        , newIndex, elIndex;

      newIndex = Array.prototype.indexOf.call(children, placeholder);
      elIndex = Array.prototype.indexOf.call(children, el);
      // Subtract self
      if (newIndex > elIndex) {
        newIndex -= 1;
      }

      // Clean DOM
      el.removeAttribute('style');
      parentElem.removeAttribute('style');
      document.body.removeAttribute('style');
      parentElem.removeChild(placeholder);

      this.unbindMove();
      this.resort(movedComponent.props.index, newIndex);
    }.bind(this);

    // To make handler removable, DO NOT `.bind(this)` here, because
    // > A new function reference is created after .bind() is called!
    if (movedComponent.movable) {
      ReactDOM.findDOMNode(this).addEventListener('mousemove', this.moveHandler);
    }
    // Bind to `document` to be more robust
    document.addEventListener('mouseup', this.mouseupHandler);
  },
  unbindMove: function() {
    ReactDOM.findDOMNode(this).removeEventListener('mousemove', this.moveHandler);
    document.removeEventListener('mouseup', this.mouseupHandler);
    this.intersectItem = null;
    if (this.onMoveEnd) {
      this.onMoveEnd();
    }
  },
  resort: function(oldPosition, newPosition){
    if (this.listOptions && this.listOptions.resortFuncName ){
      (this[this.listOptions.resortFuncName])(oldPosition, newPosition);
    }else {
      var items, movedItem;
      if (oldPosition !== newPosition) {
        items = this.state.items;
        // First: remove item from old position
        movedItem = items.splice(oldPosition, 1)[0];
        // Then add to new position
        items.splice(newPosition, 0, movedItem);
        this.setState({'items': items});
        if (this.onResorted) {
          this.onResorted(items);
        }
      }
    }
  }
};

var itemMixin = {
  _hasItemOption: function(name){
    return this.itemOptions && typeof this.itemOptions[name] !== "undefined";
  },
  componentDidMount: function() {
    if ( !(this.itemOptions && this.itemOptions.movable === false) ) {

      var handle = (this._hasItemOption('handle')) ? this.refs[this.itemOptions.handle] : this;
      if (typeof handle !== "undefined" ){
        ReactDOM.findDOMNode(handle).addEventListener('mousedown', this.moveSetup);
        this.setMovable(true);
      }
    }
  },
  insertPlaceHolder: function(el) {
    // Move forward, insert before `el`
    // Move afterward, insert after `el`
    var parentEl = el.parentElement
      , elIndex = Array.prototype.indexOf.call(parentEl.children, el)
      , newIndex = Array.prototype.indexOf.call(parentEl.children, this.placeholder);
    parentEl.insertBefore(this.placeholder,
      newIndex > elIndex ? el : el.nextSibling);
  },
  createPlaceHolder: function(el) {
    el = el ||  ReactDOM.findDOMNode(this);


    this.placeholder = el.cloneNode(true);
    this.placeholder.style.opacity = '0.4';

    // custom: placeholder style of jive

    if ( this._hasItemOption('placeholder') && this.itemOptions.placeholder == "dashed" ){
      this.placeholder = document.createElement('div');
      var currentStyle = window.getComputedStyle(el);

      this.placeholder.parentElement = el.parentElement;
      this.placeholder.style.display = "block";
      this.placeholder.style.width = currentStyle.width;
      this.placeholder.style.height = currentStyle.height;
      this.placeholder.style.top = currentStyle.top;
      this.placeholder.style.left = currentStyle.left;
      this.placeholder.style.margin = currentStyle.margin;
      this.placeholder.style.backgroundColor = "#eaeaea";
      this.placeholder.style.border = "2px #979797 dashed";
      this.placeholder.style.borderRadius = "3px";
    }
  },
  moveSetup: function(e) {
    if ( !(this.itemOptions && this.itemOptions.movable === false) ) {
      var el =  ReactDOM.findDOMNode(this);
      this.createPlaceHolder(el);

      this.props.bindMove(this, e);
      this.insertPlaceHolder(el);
      this.intersectItem = null;
      // For nested movable list
      e.stopPropagation();
    }
  },
  setMovable: function(movable) {
    this.movable = movable;
  }
};

exports.ListMixin = listMixin;
exports.ItemMixin = itemMixin;
