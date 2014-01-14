'use strict';
var lifeflowData = function () {
    function LifeflowNode() {};
    LifeflowNode.prototype.x = function(unit) {
        return timelines.dur(this._x, unit);
    };
    LifeflowNode.prototype.dx = function(unit) {
        return timelines.dur(this._dx, unit);
    };
    LifeflowNode.prototype.xLogical = function(unit) {
        return timelines.dur(this._xLogical, unit);
    };
    LifeflowNode.prototype.y = function() {
        return this._y;
    };
    LifeflowNode.prototype.dy = function() {
        return this._dy;
    };
    var 
        eventNameProp = null,
        timelines,  // just for date reporting context
        alignmentLineWidth = 0,
        eventNodeWidth = 0,
        endNodeWidth = 0,
        rectWidth = function(recs) {
            if (! (recs && recs.length)) return 0;
            var durations = recs
                .filter(function(d) { return d.hasNext() })
                .map(function(d) { 
                    var next = nextFunc(d);
                    // uses miliseconds
                    return next ? d.timeTo(next) : 0;
                });
            return durations.length ? durations.mean().valueOf() : 0;
        },
        nextFunc = function(d) { return d.next() }
            ;
    var makeNodes = function(startRecs, noflatten, backwards, maxDepth) {
        var groupKeyName = (backwards ? 'prev' : 'next') + '_' + eventNameProp;
        function preListRecsHook(records) { // group next records, not the ones we start with
            return _.chain(records)
                            //.tap(function(d) { console.log(d) })
                            .filter(nextFunc)
                            .map(nextFunc)
                            .value();
        }
        function addChildren(list, notRoot) {
            if (maxDepth && list.length && list[0].depth && list[0].depth >= maxDepth)
                return;
            if (!notRoot) {
                list = _.supergroup(startRecs, eventNameProp);
                list.sort(function(a,b) {
                            return b.records.length - a.records.length
                        })
            }
            _.each(list, function(d) { 
                //d.depth = d.parent ? d.parent.depth + 1 : 0;
                d.addLevel(eventNameProp, {
                    preListRecsHook:preListRecsHook,
                    childProp:'children'})
                addChildren(d.children, true);
                d.children.sort(function(a,b) {
                            return b.records.length - a.records.length
                        })
                })
            return list;
        }
        var lfnodes = addChildren(startRecs);
        var fakeRoot = supergroup.addListMethods([]).asRootVal();
        fakeRoot.children = lfnodes;
        //lfnodes = position({children:lfnodes,records:[]}).children;
        lfnodes = position(fakeRoot).children;

        var allNodes = lfnodes.flattenTree();
        allNodes.each(function(lfnode) {
            _.extend(lfnode, new LifeflowNode());
        });

        if (noflatten === "noflatten")
            return lfnodes;

        return allNodes;

        function position(lfnode, yOffset) {
            var children = lfnode.children;
            if (lfnode.parent) {
                lfnode._x = lfnode.parent._x + lfnode.parent._dx 
                    + eventNodeWidth;
                lfnode._xLogical = lfnode.parent._xLogical + lfnode.parent._dx;
                lfnode._y = lfnode.parent._y;
            } else {
                lfnode._x = alignmentLineWidth * (!backwards || -1);
                lfnode._xLogical = 0;
                lfnode._y = 0;
            }
            lfnode._y += (yOffset || 0);
            lfnode._dx = rectWidth(lfnode.records);
            
            lfnode._dy = lfnode.records.length;
            if (children && (n = children.length)) {
                var i = -1, c, yOffset = 0, n;
                while (++i < n) {
                    position(c = children[i], yOffset)
                    yOffset += c._dy;
                }
            }
            lfnode.backwards = !!backwards;
            return lfnode;
        }
    }
    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    makeNodes.eventNameProp = function (_) {
        if (!arguments.length) return eventNameProp;
        eventNameProp = _;
        return makeNodes;
    };
    makeNodes.alignmentLineWidth = function(_) {
        if (!arguments.length) return alignmentLineWidth;
        alignmentLineWidth = _;
        return makeNodes;
    };
    makeNodes.eventNodeWidth = function(_) {
        if (!arguments.length) return eventNodeWidth;
        eventNodeWidth = _;
        return makeNodes;
    };
    makeNodes.endNodeWidth = function(_) {
        if (!arguments.length) return endNodeWidth;
        endNodeWidth = _;
        return makeNodes;
    };
    makeNodes.rectWidth = function(_) {
        if (!arguments.length) return rectWidth;
        rectWidth = _;
        return makeNodes;
    };
    makeNodes.nextFunc = function(_) {
        if (!arguments.length) return nextFunc;
        nextFunc = _;
        return makeNodes;
    };
    makeNodes.timelines = function(_) {
        if (!arguments.length) return timelines;
        timelines = _;
        return makeNodes;
    };
    //============================================================
    function endNode(parent) {  // not using yet
        var enode = {
            parent:parent,
            next: function() { 
                return this },
            prev: function() { return this }
        };
        enode[eventNameProp] = 'END_NODE';
        return enode;
    }
    return makeNodes;
}
