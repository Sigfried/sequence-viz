/******/ (function(modules) { // webpackBootstrap
/******/ 	// shortcut for better minimizing
/******/ 	var exports = "exports";
/******/ 	
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/ 	
/******/ 	// The require function
/******/ 	function require(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId][exports];
/******/ 		
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/ 		
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module[exports], module, module[exports], require);
/******/ 		
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 		
/******/ 		// Return the exports of the module
/******/ 		return module[exports];
/******/ 	}
/******/ 	
/******/ 	// The bundle contains no chunks. A empty chunk loading function.
/******/ 	require.e = function requireEnsure(_, callback) {
/******/ 		callback.call(null, this);
/******/ 	};
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	require.modules = modules;
/******/ 	
/******/ 	// expose the module cache
/******/ 	require.cache = installedModules;
/******/ 	
/******/ 	// __webpack_public_path__
/******/ 	require.p = "";
/******/ 	
/******/ 	
/******/ 	// Load entry module and return exports
/******/ 	return require(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, require) {

	
	module.exports = {
	    supergroup : require(9),
	    evtData : require(1),
	    lifeflow : require(2),
	    lifeflowChart : require(3),
	    lifeflowData : require(4),
	    lifeflowExtras : require(5),
	    timelines : require(6),
	    timelinesChart : require(7)
	}


/***/ },
/* 1 */
/***/ function(module, exports, require) {

	/**
	 * ## evtData
	 * ###Sigfried Gold <sigfried@sigfried.org>
	 * [MIT license](http://sigfried.mit-license.org/)
	 */

	'use strict';
	if (true) { // make it work in node or browsers or other contexts
	    var _ = require(9);
	    var moment = require(8); // otherwise assume it was included by html file
	}
	var evtData = function() {
	    /** @namespace evtData */
	    // public
	    var   entityIdProp
	        , eventNameProp
	        , startDateProp
	        , unitSettings = {unit: 'ms'}
	        , eventOrder
	        , filterFunc = function() { return true } // not used
	        ;
	    // private
	    /*
	    origData:       array of raw event objects, each expected to have an
	                    entityId, and eventName, and a start date string

	    timelineArray:  origData grouped by entityId. each entity has a records 
	                    array pointing to its raw event records and each of
	                    those should have a pointer back to the timeline and
	                    should be sorted in time order and should have
	                    nextEvt/prevEvt pointers as appropriate

	    */
	    function edata() {
	    };
	    function toDate(dateStr, fmt) { // storing dates as moment.js objects, at least for now
	        return moment(dateStr, fmt);
	    }
	    function sortEvts(list) {
	        return list.sort(function (a, b) {
	            var cmp = a.dt() - b.dt();
	            if (cmp === 0) {
	                if (eventOrder) {
	                    cmp = eventOrder.indexOf(a.eventName())
	                        - eventOrder.indexOf(b.eventName())
	                }
	            }
	            return cmp;
	        })
	    }
	    function Evt(raw, id) {
	        _.extend(this, raw);
	        this.eId = id;
	        this._moment = toDate(this[startDateProp]);
	        this._entityId = this[entityIdProp];
	        this._eventName = this[eventNameProp];
	    }
	    Evt.prototype.id = function() {
	        fail('fix ref to _dt');
	        return [this._entityId, this._eventName, this._dt].join('/');
	    }
	    Evt.prototype.dt = function() {
	        return this._moment;
	        //return this._startDate;
	    }
	    Evt.prototype.dtStr = function(unit) {
	        unit = this.unit(unit);
	        var fmt;
	        switch (unit) {
	            case 'year':
	                fmt = 'YYYY'; break;  // need a way to specify other fmts
	            case 'month':
	                fmt = 'MMM YYYY'; break;
	            case 'day':
	                fmt = 'MM/DD/YYYY'; break;
	            case 'hour':
	                fmt = 'MM/DD/YYYY hh:mma'; break;
	            case 'minute':
	                fmt = 'MM/DD/YYYY hh:mm:sa'; break;
	            default:
	                fmt = 'MM/DD/YYYY hh:mm:SSSa'; break;
	        }
	        return this._moment.format(fmt);
	    }
	    Evt.prototype.eventName = function() {
	        return this._eventName;
	    }
	    Evt.prototype.entityId = function() {
	        return this._entityId;
	    }
	    Evt.prototype.next = function() {
	        return this.timeline().records[this.evtIdx() + 1];
	    }
	    Evt.prototype.prev = function() {
	        return this.timeline().records[this.evtIdx() - 1];
	    }
	    Evt.prototype.hasNext = function() {
	        return !! this.next();
	    };
	    Evt.prototype.hasPrev = function() {
	        return !! this.prev();
	    };
	    Evt.prototype.toNext = function(ifNoNext, unit) {
	        if (ifNoNext && isNaN(parseInt(ifNoNext))) {
	            fail('bad ifNoNext param: ' + ifNoNext);
	        }
	        return this.hasNext() ? this.timeTo(this.next(), unit) : ifNoNext;
	    };
	    Evt.prototype.fromPrev = function(ifNoPrev, unit) {
	        if (ifNoPrev && isNaN(parseInt(ifNoPrev))) {
	            fail('bad ifNoPrev param: ' + ifNoPrev);
	        }
	        return this.hasPrev() ? this.prev().timeTo(this, unit) : ifNoPrev;
	    };
	    Evt.prototype.startIdx = function(unit) {
	        return this.timeline().firstEvt().timeTo(this, unit);
	    };
	    Evt.prototype.timeTo = function(otherEvt, unit) {
	        return this.dur(otherEvt.dt() - this.dt(), unit);
	    };
	    Evt.prototype.timeFrom = function(otherEvt, unit) {
	        return - this.timeTo(otherEvt, unit);
	    };
	    Evt.prototype.timeline = function (_) {
	        if (!arguments.length) return this._timeline;
	        this._timeline = _;
	        return this;
	    };
	    Evt.prototype.evtIdx = function (_) {
	        if (!arguments.length) return this._evtIdx;
	        this._evtIdx = _;
	        return this;
	    };
	    function Timeline(tl) { }
	    function makeTimeline(supergroupVal) {
	        var timeline = _.extend(supergroupVal, new Timeline());
	        sortEvts(timeline.records);
	        timeline._evtLookup = {};
	        _.each(timeline.records, function (evt, i) {
	            evt.timeline(timeline); // give each evt a ref to the timeline it's in
	            evt.evtIdx(i);    // tell each evt what position it has in the timeline
	            if (!_(timeline._evtLookup).has(evt.eventName())) {
	                timeline._evtLookup[evt.eventName()] = [i];
	            } else {
	                timeline._evtLookup[evt.eventName()].push(i);
	            }
	        })
	        return timeline;
	    }
	    Timeline.prototype.evtLookup = function(evtName, which) { // not being called at all right now?
	        console.log('FIX DUP PROBLEM!!!');  // just fixed, but not tested yet
	        if (_(this._evtLookup).has(evtName)) {
	            if (typeof(which) === "undefined") {
	                return this.records[this._evtLookup[which]]; // return evt at idx 0
	            }
	            if (!isNaN(which)) {
	                return this.records[this._evtLookup[which]]; // return evt at idx which
	            }
	            if (which === "all") {
	                return this.records[this._evtLookup[evtName]]; // return array
	            } 
	            fail("you didn't say which and there's more than one");
	        }
	        // if evtName isn't in the timeline at all, return undefined
	    };
	    Timeline.prototype.firstEvt = function() {
	        return this.records[0];
	    };
	    Timeline.prototype.lastEvt = function() {
	        return this.records[this.records.length - 1];
	    };
	    Timeline.prototype.startDate = function() {
	        return this.firstEvt().dt();
	    };
	    Timeline.prototype.endDate = function() {
	        return this.lastEvt().dt();
	        return this.records[this.records.length - 1].dt();
	    };
	    Timeline.prototype.duration = function(unit) {
	        return this.firstEvt().timeTo(this.lastEvt(), unit);
	    };
	    Timeline.prototype.timelines = function (_) {
	        if (!arguments.length) return this._timelines;
	        this._timelines = _;
	        return this;
	    };
	    // @method whatAmI
	    // @returns Timeline constructor
	    // since timelines are String or Number objects (to represent their entityId)
	    // and I don't have a great way to subclass native types, this is a
	    // little kind of class test
	    Timeline.prototype.whatAmI = function () {
	        return Timeline.prototype;
	    };

	    function Timelines() { }
	    var makeTimelines = function(data) { // have some old code using this
	        var evts = _(data).map(function(d,i) { return new Evt(d,i); });
	        var timelines = _.supergroup(evts, entityIdProp);
	        timelines = timelines
	            .map(function(d,i) { 
	                return makeTimeline(d);
	            });
	        timelines._evtData = evts;
	        _.extend(timelines, new Timelines);
	        timelines.each(function(timeline) {
	            timeline.timelines(timelines);
	        });
	        timelines._unitSettingsStack = [];
	        timelines.timelineUnit(true); // make sure they get set with all timelines in place
	        timelines.universeUnit(true);
	        return timelines;
	    }
	    Timelines.prototype.maxDuration = function (unit, recalc) {
	        if (typeof this._maxDuration === "undefined" || recalc)
	            // this .mox() is one of the places where
	            // underscore-unchained will bite you. moment.js doesn't
	            // like Number objects
	            this._maxDuration = this.invoke('duration', 'justNumber').max().valueOf();
	        return this.dur(this._maxDuration, unit);
	    }
	    Timelines.prototype.wholeSetDuration = function (unit, recalc) {
	        if (typeof this._setDuration === "undefined" || recalc)
	            this._setDuration = this.dur(
	                this.invoke('startDate').max().valueOf() -
	                this.invoke('endDate').min().valueOf(), 'justNumber');
	        return this.dur(this._setDuration, unit);
	    };
	    /*
	     * @method Timelines.universeUnit
	     * @param {string or boolean} [arg] falsy to get current val; String
	     * to set new val; true to recalculate
	     * @returns current val or object of method
	     */
	    Timelines.prototype.universeUnit = function (arg) {
	        if (_.isString(arg)) {
	            this._universeUnit = arg;
	            return this;
	        }
	        if (typeof this._universeUnit === "undefined" || arg)
	            this._universeUnit = edata.durationUnits(
	                    this.wholeSetDuration(null, arg));
	        return this._universeUnit;
	    };
	    Timelines.prototype.timelineUnit = function (arg) {
	        if (_.isString(arg)) {
	            this._timelineUnit = arg;
	            return this;
	        }
	        if (typeof this._timelineUnit === "undefined" || arg)
	            this._timelineUnit = edata.durationUnits(
	                    this.maxDuration(null, arg));
	        return this._timelineUnit;
	    };
	    Timelines.prototype.unit = function(unit) {
	        if (unit === "universe")
	            return this.universeUnit();
	        if (unit === "timeline")
	            return this.timelineUnit();
	        if (typeof unit === "string")
	            return unit;
	        var u = this.unitSettings().unit;
	        if (u === "universe")
	            return this.universeUnit();
	        if (u === "timeline")
	            return this.timelineUnit();
	        return u;
	    };
	    Evt.prototype.unit = function(unit) { return this.timeline().unit(unit) };
	    Timeline.prototype.unit = function(unit) { return this.timelines().unit(unit) };
	    // @method unitSettings
	    // @param {Object} [opts]
	    // @param {boolean} [opts.unit] set default units, otherwise defaults to what edata has, which defaults to ms
	    // @param {boolean} [opts.withUnit] whether to attach unit string to reported durations
	    // @param {boolean} [opts.round] whether to round reported durations
	    // if used as a getter, returns unitSettings object  
	    // if used as setter, returns 'this' (standard pattern to facilitate chaining, though it doesn't seem necessary here)  
	    // when setting, it pushes old settings on a stack so you can set things temporarily  
	    // you only have to supply the settings you want to change from the current settings  
	    Timelines.prototype.unitSettings = function (opts) {
	        if (typeof this._unitSettings === "undefined")
	            this._unitSettings = _.clone(edata.unitSettings());
	        if (!arguments.length || _.isEmpty(opts)) return this._unitSettings;
	        this._unitSettingsStack.push(_.clone(this._unitSettings));
	         _.extend(this._unitSettings, opts);
	        return this;
	    };
	    Evt.prototype.unitSettings = function(opts) { return this.timeline().unitSettings(opts) };
	    Timeline.prototype.unitSettings = function(opts) { return this.timelines().unitSettings(opts) };

	    Timelines.prototype.restoreUnitSettings = function () {
	        return this._unitSettings = 
	            this._unitSettingsStack.pop() || edata.unitSettings();
	    };
	    Evt.prototype.restoreUnitSettings = function() { return this.timeline().restoreUnitSettings() };
	    Timeline.prototype.restoreUnitSettings = function() { return this.timelines().restoreUnitSettings() };

	    Timelines.prototype.dur = function(num, unit) {
	        var tempSettings;
	        if (unit === 'justNumber') {
	            tempSettings = {withUnit: false};
	        } else if (_.isString(unit)) {
	            tempSettings = {unit: unit};
	        } else {
	            tempSettings = unit;
	        }
	        var result;
	        if (! _.isEmpty(unit)) {
	            this.unitSettings(tempSettings);
	            result = this.formatDur(num);
	            this.restoreUnitSettings();
	        } else {
	            result = this.formatDur(num);
	        }
	        return result;
	    }
	    Evt.prototype.dur = function(num,unit) { return this.timeline().dur(num,unit) };
	    Timeline.prototype.dur = function(num,unit) { return this.timelines().dur(num,unit) };
	    // @method formatDur
	    // report durations according to current settings
	    // @param {number} num the duration to express in certain units
	    // @return {string or number}
	    Timelines.prototype.formatDur = function(num) {
	        var settings = this.unitSettings();
	        var unit = this.unit(settings.unit);
	        var dur = settings.dontConvert ? 
	                    moment.duration(num, unit) :
	                    moment.duration(num);
	        var newNum = dur.as(unit);
	        var decimals = Number(settings.round) - 1;
	        if (settings.round) {
	            newNum = Math.round(newNum * Math.pow(10,decimals)) / Math.pow(10,decimals);
	        }
	        if (settings.withUnit) {
	            if (unit === 'ms')
	                unit = 'milisecond';
	            if (newNum !== 1)
	                unit = unit + 's';
	            return newNum + ' ' + unit;
	        }
	        return newNum;
	    };
	    moment.lang('relTime', {
	        relativeTime : {
	            future: "%s",
	            past:   "%s",
	            s:  "second",
	            m:  "second",
	            mm: "minute",
	            h:  "minute",
	            hh: "hour",
	            d:  "hour",
	            dd: "day",
	            M:  "day",
	            MM: "month",
	            y:  "month",
	            yy: "year"
	        }
	    });
	    moment.lang('en');
	    edata.durationUnits = function(dur) {
	        var lang = moment.lang();
	        moment.lang('relTime');
	        var unit = moment.duration(dur).humanize();
	        moment.lang(lang);
	        return unit;
	    };
	    Timelines.prototype.data = function () {
	        return this._evtData;
	    };
	    Timelines.prototype.sort = function (func) {
	        fail('is this called?'); // not from lifeflow...will test when i get to it
	        return supergroup.addListMethods(this.slice(0).sort(func));
	    };
	    Timelines.prototype.evtDurationSortFunc = function (func) {
	        return function(a,b) {
	            var arec = a.evtLookup(evtName);
	            var brec = b.evtLookup(evtName);
	            if (!arec && !brec) return 0;
	            if (!arec) return 1;
	            if (!brec) return -1;
	            var A = arec.toNext();
	            var B = brec.toNext();
	            A = isNaN(A) ? -Infinity : A;
	            B = isNaN(B) ? -Infinity : B;
	            return B - A;
	            if (B < A) return -1; // descending order
	            if (A < B) return 1;
	            if (A === B) return 0;
	            fail("what did I forget?")
	        }
	    };
	    Timelines.prototype.evtDurationSortFunc = function (evtName) {
	        return this.sort(this.evtDurationSortFunc(evtName));
	    };
	    // @method whatAmI
	    // @returns Timelines constructor
	    // since timelines are Arrays and I don't have a great way to 
	    // subclass native types, this is a little kind of class test
	    Timelines.prototype.whatAmI = function () {
	        return Timelines.prototype;
	    };
	    edata.entityIdProp = function (_) {
	        if (!arguments.length) return entityIdProp;
	        entityIdProp = _;
	        return edata;
	    };
	    edata.eventNameProp = function (_) {
	        if (!arguments.length) return eventNameProp;
	        eventNameProp = _;
	        return edata;
	    };
	    edata.startDateProp = function (_) {
	        if (!arguments.length) return startDateProp;
	        startDateProp = _;
	        return edata;
	    };
	    edata.unitSettings = function (_) {
	        if (!arguments.length) return unitSettings;
	        unitSettings = _;
	        return edata;
	    };
	    edata.eventOrder = function (_) {
	        if (!arguments.length) return eventOrder;
	        eventOrder = _;
	        return edata;
	    };
	    edata.filterFunc = function (_) {
	        fail("not being used anymore, but keeping just in case");
	        if (!arguments.length) return filterFunc;
	        filterFunc = _;
	        return edata;
	    };
	    function log(o) { console.log(o) };
	    function fail(thing) {
	        throw new Error(thing);
	    }
	    edata.Evt = Evt;
	    edata.Timeline = Timeline;
	    edata.Timelines = Timelines;
	    edata.makeTimelines = makeTimelines;
	    return edata;
	}


/***/ },
/* 2 */
/***/ function(module, exports, require) {

	/**
	 * @file Defines the lifeflow chart for {@link sequence-viz}
	 * @author Sigfried Gold <sigfried@sigfried.org>
	 * @license http://sigfried.mit-license.org/
	 * Don't trust this documentation yet. It's just beginning to be
	 * written.
	 */
	'use strict';
	var lifeflowBare = function () {
	    /** @namespace lifeflow */

	    //============================================================
	    // Public Variables with Default Settings
	    //------------------------------------------------------------

	    var margin = {
	        top: 0,
	        right: 0,
	        bottom: 0,
	        left: 0
	        }
	        , lifeflowData
	        , timelineData
	        , entityIdProp = null,
	        eventNameProp = null,
	        eventNames = null,
	        eventOrder = [],
	        alignChoices,
	        startDateProp = null,
	        endDateField = null,
	        defaultDuration = null,
	        alignmentLineWidth = 28,
	        eventNodeWidth = 0,
	        endNodeWidth = 0,
	        width,
	        height,
	        id = Math.floor(Math.random() * 10000) //Create semi-unique ID in case user doesn't select one
	        , x = d3.scale.linear()
	        , y = d3.scale.linear()
	        , relativeX 
	        //, color = nv.utils.defaultColor()
	        , color = d3.scale.category20()
	        , alignBy
	        //, dispatch = d3.dispatch('lifeflowMouseover', 'lifeflowMouseout');
	        , dispatch = d3.dispatch('chartClick', 'elementClick', 
	                'elementDblClick', 'elementMouseover', 'elementMouseout',
	                'toggleEvt','alignBy','selectRecs','doneDrawing'
	                ,'areaClick'

	                ,'tooltipHide','tooltipShow','lifeflowMouseover', 'lifeflowMouseout');
	            ;
	    //============================================================
	    function chart(selection) {
	        selection.each(function (data) {
	            lifeflowData = data;
	            y.range([0,height]);
	            x.range([0,width]);
	            x.domain([
	                            d3.min([0].concat(lifeflowData.map(function(d) { 
	                                return d.x() + d.dx()
	                            }))),
	                            d3.max([0].concat(lifeflowData.map(function(d) { 
	                                return d.x() + d.dx() 
	                            })))
	                        ]);
	            relativeX = d3.scale.linear()
	                                .range(x.range())
	                                .domain([0, x.domain()[1] - x.domain()[0]]);
	            var container = d3.select(this);
	            var nodes = container.selectAll('g.event-node')
	                .data(lifeflowData
	                    , function (d) {
	                        var id = chart.alignBy() + d.namePath({noRoot:false}) + d.backwards
	                        d.joinId = id;
	                        return id;
	                        // paths can be the same on either
	                        // side of an alignment, so include backwards flag
	                    })
	            y.domain([0, _(lifeflowData).reduce(
	                function(memo,node){
	                    return Math.max(memo, node.y() + node.dy())
	                },0)]);

	            enterNodes();
	            function xPos(lfnode) {
	                return x(lfnode.x() + lfnode.depth * eventNodeWidth
	                        + alignmentLineWidth);
	            }
	            function enterNodes() {
	                var enteringGs = nodes.enter()
	                    .append('g')
	                        .attr('class', 'event-node')
	                        .attr('depth', function(d) { return d.depth })
	                        .attr('path', function (d) {
	                            return d.namePath({noRoot:false}) // don't need noRoot anymore
	                        })
	                        .attr('transform', function (d) {
	                            return 'translate(' + xPos(d) + ',' + y(d.y()) + ')'
	                        })
	                        //.on("mouseover", gMouseover)
	                        //.on("mouseout", gMouseout)
	                var newRects = enteringGs
	                    //.filter(function(d) { return d.depth !== 0 })
	                    .append('rect')
	                        .attr('class', 'event-node')
	                        .attr('fill', function (d) {
	                            return color(d.valueOf())
	                        })
	                        //.attr('x', function(d) { return relativeX(d.dx())})
	                        .attr('width', eventNodeWidth)
	                        .attr('height', function (d) {
	                            //console.log(d.dy + '   ' + this.className.baseVal + '   ' + d.namePath())
	                            return y(d.dy())
	                        })
	                        //.attr('y', function(d) { return y(d.y) })
	                        .attr('height', function(d) { return y(d.dy()) })
	                        .on("mouseover", function(d,i) {
	                            dispatch.lifeflowMouseover(chart, this, d, i);
	                        })
	                        .on("mouseout", function(d,i) {
	                            dispatch.lifeflowMouseout(chart, this, d, i);
	                        })
	                    //.on("mouseover", rectMouseover)
	                    //.on("mouseout", rectMouseout)
	                /*
	                var fillRects = enteringGs
	                    .filter(function(d) { return d.parent })
	                    .append('rect')
	                        .attr('class', 'gap-fill')
	                        .attr('fill', function (d) {
	                            return color(d.parent.valueOf())
	                        })
	                        .attr('stroke', '#888')
	                        .attr('stroke-width', '1px')
	                        .attr('opacity', .5)
	                        .attr('width', 0)
	                        .attr('height', function (d) {
	                            //console.log(d.dy + '   ' + this.className.baseVal + '   ' + d.namePath())
	                            return y(d.dy)
	                        })
	                    .on("mouseover", rectMouseover)
	                    .on("mouseout", rectMouseout)
	                * /
	                var fmt = d3.format('5.0f');
	                nodes.attr('transform', function (d) {
	                            var xpos = x(d.x())
	                            return 'translate(' + xpos + ',' + y(d.y()) + ')'
	                        })
	                nodes.select('rect.event-node')
	                    .attr('height', function (d) {
	                        //console.log(d.dy + '   ' + this.className.baseVal + '   ' + d.namePath())
	                        return y(d.dy())
	                    })
	                nodes.select('rect.gap-fill')
	                    .attr('height', function (d) {
	                        //console.log(d.dy + '   ' + this.className.baseVal + '   ' + d.namePath())
	                        return y(d.dy())
	                    })
	                    .attr('x', function(d) { 
	                        var shift = d.backwards ?  d.parent.dx() :
	                                -d.parent.dx() + eventNodeWidth;
	                        return relativeX(shift)
	                    })
	                    .attr('width', function(d) { 
	                        return Math.max(relativeX( Math.abs(d.parent.dx()) 
	                                - eventNodeWidth), 0);
	                    })
	                    //.attr('y', function(d) { return y(d.y) })
	                    .attr('height', function(d) { return y(d.dy()) })
	                */
	            }
	        });
	        return chart;
	    }

	    //============================================================
	    // mouseover code. tooltips broken for now
	    // distribution lines still working
	    //------------------------------------------------------------

	    /*
	            function rectMouseover(d, i) {
	                console.log("not connected right now")
	                d3.select(this)
	                    .classed('hover', true)
	                var path = d.namePath({noRoot:false})
	                //var avgDays = d3.mean(_(d.records).invoke('fromPrev'));
	                var avg = Math.round(d3.mean(_.chain(d.records).invoke('timeline').invoke('duration').value()));
	                var tt = d.toString() + ', ' + d.records.length + ' timelines with ';
	                tt += avg + ' mean duration';
	                dispatch.lifeflowMouseover({
	                    value: d,
	                    text: tt,
	                    series: _(d.pedigree({asValues:true}))
	                        .map(function(lfnode) {
	                            return {
	                                key: lfnode.toString(),
	                                value: Math.round(d3.mean(_(lfnode.records).invoke('toNext'))),
	                                color: color(lfnode.toString())
	                            }
	                        }),
	                    e: d3.event
	                });
	            }
	            function rectMouseout(d, i) {
	                dispatch.lifeflowMouseout();
	            }
	            function gMouseout(d, i) {
	                d3.select(this).selectAll('rect.gap-fill').attr('opacity',.5)
	                var path = d3.select(this).selectAll('path');
	                //path.remove();
	                path.transition().duration(4000).style('opacity', 0).remove()
	                var circle = d3.select(this).selectAll('circle');
	                //circle.remove();
	                circle.transition().duration(4000).style('opacity', 0).remove()
	                    /*
	                d3.selectAll('rect.gap-fill')
	                    .transition().delay(3000).duration(700)
	                    .attr('opacity', 0.5);
	                d3.selectAll('rect.event-node')
	                    .transition().delay(3000).duration(700)
	                    .attr('opacity', 0.5);
	                    * /
	            }
	            var nodesWithDistributionsShowing = [];
	            function gMouseover(lfnode, i) {
	                throw new Error("shouldn't be working now");
	                /*
	                d3.selectAll('rect')
	                    .transition().duration(700)
	                    .attr('opacity', 0.4);
	                    * / 
	                console.log('mouse over ' + nodesWithDistributionsShowing.length);
	                console.log(nodesWithDistributionsShowing);
	                var alreadyDisplayed = false;
	                _(nodesWithDistributionsShowing).each(function(d) {
	                    if (d === lfnode) {
	                        alreadyDisplayed = true;
	                        return;
	                    }
	                    d.distCircles.remove();
	                    d.distPath.remove();
	                    delete d.distCircles;
	                    delete d.distPath;
	                });
	                nodesWithDistributionsShowing.length = 0;
	                if (alreadyDisplayed) {
	                    nodesWithDistributionsShowing.push(lfnode);
	                }
	                d3.select(this).selectAll('rect.gap-fill').attr('opacity',1)
	                var recs, xFunc;
	                if (!lfnode.parent) {
	                    recs = [];
	                } else if (lfnode.backwards) {
	                    recs = lfnode.records.sort(function (a, b) {
	                        return a.toNext() - b.toNext();
	                    });
	                    //xFunc = function(d) { return relativeX(-d.toNext()) };
	                    xFunc = function(d) {
	                            return relativeX(-lfnode.parent.dx() -
	                                    d.toNext())
	                    };
	                } else {
	                    recs = lfnode.records.sort(function (a, b) {
	                        return a.fromPrev() - b.fromPrev();
	                    });
	                    xFunc = function(d) {
	                        return relativeX(d.fromPrev())
	                    };
	                }
	                var line = d3.svg.line()
	                    .x(xFunc)
	                    .y(function (d, i) {
	                        return y(i)
	                    });
	                var path = d3.select(this).selectAll('path')
	                    .data([recs])
	                path.enter()
	                    .append('path')
	                    .attr('d', line)
	                path.attr('fill-opacity', 0)
	                    .attr('stroke', 'black')
	                    .style('pointer-events', 'none')
	                    .style('stroke-opacity', 1)
	                var circle = d3.select(this).selectAll('circle')
	                    .data(recs)
	                circle.enter()
	                    .append('circle')
	                    .attr('cx', xFunc)
	                    .attr('cy', function (d, i) {
	                        return y(i)
	                    })
	                    .attr('r', 4)
	                    .on("mouseover", function (d, i) {
	                        d3.select(this).classed('hover', true)
	                        var fmt = d3.time.format('%Y-%m-%d');
	                        dispatch.lifeflowMouseover({
	                            value: d,
	                            text: d.timeline() + ': ' + d.eventName() + 
	                                ' - ' + d.toNext() + ' of ' +
	                                d.timeline().duration() + ' total ' + timeUnit,
	                            series: _(d.timeline().records).map(function(rec) {
	                                return {
	                                    key: rec.eventName(),
	                                    value: fmt(rec.startDate()),
	                                    color: color(rec.eventName())
	                                }
	                            }),
	                            e: d3.event
	                        });
	                    })
	                circle.style('fill-opacity', 0)
	                //.style('stroke-opacity',1)
	                //.style('pointer-events','none')
	                .attr('stroke', 'black')
	                    .attr('stroke-opacity', 0.2)
	                //.attr('stroke', function() { return color(d.valueOf()) })
	                if (alreadyDisplayed) {
	                    if (!_(lfnode).has('distCircles'))
	                        throw new Error('what up');
	                } else {
	                    lfnode.distCircles = circle;
	                    lfnode.distPath = path;
	                    nodesWithDistributionsShowing.push(lfnode);
	                }
	            }
	            */
	    //============================================================
	    // Expose Public Variables
	    //------------------------------------------------------------
	    chart.dispatch = dispatch;

	    /*
	    chart.entityIdProp = function (_) {
	        if (!arguments.length) return entityIdProp;
	        entityIdProp = _;
	        return chart;
	    };
	    chart.eventNameProp = function (_) {
	        if (!arguments.length) return eventNameProp;
	        eventNameProp = _;
	        return chart;
	    };
	    chart.eventOrder = function (_) {
	        if (!arguments.length) return eventOrder;
	        eventOrder = _;
	        return chart;
	    };
	    chart.startDateProp = function (_) {
	        if (!arguments.length) return startDateProp;
	        startDateProp = _;
	        return chart;
	    };
	    chart.endDateField = function (_) {
	        if (!arguments.length) return endDateField;
	        endDateField = _;
	        return chart;
	    };
	    chart.defaultDuration = function (_) {
	        if (!arguments.length) return defaultDuration;
	        defaultDuration = _;
	        return chart;
	    };
	    */
	    chart.margin = function (_) {
	        if (!arguments.length) return margin;
	        margin.top = typeof _.top != 'undefined' ? _.top : margin.top;
	        margin.right = typeof _.right != 'undefined' ? _.right : margin.right;
	        margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
	        margin.left = typeof _.left != 'undefined' ? _.left : margin.left;
	        return chart;
	    };

	    chart.eventNames = function (_) {
	        if (!arguments.length) return eventNames;
	        eventNames = _;
	        return chart;
	    };
	    chart.timelineData = function (_) {
	        if (!arguments.length) return timelineData;
	        timelineData = _;
	        return chart;
	    };
	    chart.width = function (_) {
	        if (!arguments.length) return width;
	        width = _;
	        return chart;
	    };

	    chart.height = function (_) {
	        if (!arguments.length) return height;
	        height = _;
	        return chart;
	    };

	    chart.xScale = function (_) {
	        if (!arguments.length) return x;
	        x = _;
	        return chart;
	    };
	    chart.relativeX = function (_) {
	        if (!arguments.length) return relativeX;
	        relativeX = _;
	        return chart;
	    };

	    chart.yScale = function (_) {
	        if (!arguments.length) return y;
	        y = _;
	        return chart;
	    };

	    chart.color = function (_) {
	        if (!arguments.length) return color;
	        //color = nv.utils.getColor(_);
	        color = _;
	        return chart;
	    };

	    chart.id = function (_) {
	        if (!arguments.length) return id;
	        id = _;
	        return chart;
	    };

	    chart.alignBy = function (_) {
	        if (!arguments.length) return alignBy;
	        alignBy = _;
	        return chart;
	    };
	    chart.xAxis = function (_) {
	        if (!arguments.length) return xAxis;
	        xAxis = _;
	        return chart;
	    };
	    chart.lifeflowData = function (_) {
	        if (!arguments.length) return lifeflowData;
	        lifeflowData = _;
	        return chart;
	    };
	    chart.alignChoices = function (_) {
	        if (!arguments.length) return alignChoices;
	        alignChoices = _;
	        return chart;
	    };
	    chart.eventNodeWidth = function(_) {
	        if (!arguments.length) return eventNodeWidth;
	        eventNodeWidth = _;
	        return chart;
	    };
	    /*
	    chart.alignmentLineWidth = function(_) {
	        if (!arguments.length) return alignmentLineWidth;
	        alignmentLineWidth = _;
	        return chart;
	    };
	    chart.endNodeWidth = function(_) {
	        if (!arguments.length) return endNodeWidth;
	        endNodeWidth = _;
	        return chart;
	    };
	    */
	    return chart;
	}


/***/ },
/* 3 */
/***/ function(module, exports, require) {

	nv.models.lifeflowChart = function () {
	    //============================================================
	    // Public Variables with Default Settings
	    //------------------------------------------------------------
	    var lifeflow = nv.models.lifeflow(),
	        xAxis = nv.models.axis(),
	        yAxis = nv.models.axis(),
	        tip = nv.models.tooltip().gravity('w').distance(23),
	        legendHeight = 15,
	        hideLegend = nv.models.legend()
	            .height(legendHeight)
	            .updateState(false)
	            .key(function(d) { return d.valueOf() })
	            .label('Hide'),
	        alignLegend = nv.models.legend().height(legendHeight)
	            .updateState(false)
	            .radioButtonMode(true)
	            .label('Align')
	            .key(function(d) { return d.valueOf() })
	            ;

	    var margin = {
	            top: 25,
	            right: 20,
	            bottom: 0,
	            left: 60
	        }
	        , width = null
	        , height = null
	        , edata
	        , timelines
	        , entities
	        , showLegend = true
	        , stacked = false
	        , tooltips = true
	        , tooltip = function(key, x, y, e, graph) {
	            return '<h3>' + key + ' - ' + x + '</h3>' +
	                '<p>' +  y + '</p>'
	        }
	        , state = {
	            stacked: stacked
	        }
	        , defaultState = null
	        , noData = 'No Data Available.'
	        , dispatch = d3.dispatch( 'tooltipShow', 'tooltipHide', 
	                //'elementMouseover','elementMouseout',
	                'stateChange', 'changeState'
	                //,'doneDrawing'
	                );
	    ;
	    //============================================================


	    //============================================================
	    // Private Variables
	    //------------------------------------------------------------

	    var showTooltip = function(e, offsetElement) {
	        tip
	            .gravity('e')
	            .position({ left: e.e.clientX, top: e.e.clientY })
	            .data(
	                {
	                    value: e.text,
	                    series: e.series,
	                })();
	    };
	    var svgHead, svgChart, svgFoot;
	    //============================================================
	    var rangeLower = new Date('01/01/1980');
	    var rangeUpper = new Date('01/01/2030');
	    var enddateStuff = _.once(function (data) {
	        data.forEach(function (d) {
	            d.endDate = new Date(d[chart.endDateField()]);
	            if (!(d.endDate > rangeLower && d.endDate < rangeUpper)) {
	                d.endDate = null;
	            }
	        });
	    })

	    function chart(selection) {
	        selection.each(function (data) {
	            var container = d3.select(this),
	                that = this;

	            var chartFullWidth = (chart.width() || parseInt(container.style('width')) || 960),
	                chartGraphWidth = chartFullWidth - margin.left - margin.right;
	                chartFullHeight = (chart.height() || parseInt(container.style('height')) || 400),
	                chartGraphHeight = chartFullHeight - margin.top - margin.bottom;
	            chart.width(chartFullWidth);
	            chart.height(chartFullHeight);

	            if (!data || !data.length) {
	                var noDataText = container.selectAll('.nv-noData').data([noData]);
	                noDataText.enter().append('p')
	                    .attr('class', 'nvd3 nv-noData')
	                    .style('text-align', 'center')
	                    .style('top', '200px')
	                    .text(function (d) {
	                        return d
	                    });
	                return chart;
	            } else {
	                container.selectAll('.nv-noData').remove();
	            }
	            lifeflow.xScale(d3.scale.linear().range([0, chartGraphWidth]));
	            lifeflow.yScale(d3.scale.linear()
	                        .range([0, chartGraphHeight]));

	            // Setup containers and skeleton of chart
	            container.selectAll('svg.svg-head')
	                .data(['stub']).enter()
	                .append('svg').attr('class', 'svg-head')
	                    //.attr('width', availableWidth)
	                .attr('height', legendHeight * 3)
	            var svgHead = container.select('svg.svg-head');

	            var svgChart = container.selectAll('svg.svg-chart').data(['stub'])
	            var gEnter = svgChart.enter()
	                            .append('div')
	                                //.style('width', availableWidth)
	                                .style('height', chartFullHeight)
	                                .style('overflow-y', 'scroll')
	                            .append('svg').attr('class', 'svg-chart')
	                                //.attr('width', availableWidth)
	                                .attr('height', chartFullHeight)

	            gEnter.append('g').attr('class', 'nv-x nv-axis')
	            gEnter
	                .append('g').attr('class', 'nvd3 nv-wrap nv-evt-chart')

	            svgChart.select('g.nv-evt-chart')
	                    .attr('transform', 'translate(' + margin.left + ',' +
	                                margin.top + ')')
	                    .append('g').attr('class', 'nv-y nv-axis');

	            chart.update = function () {
	                container.call(chart)
	            };
	            chart.svgChart = this;
	            //------------------------------------------------------------
	            // Legend
	            var gHead = svgHead.selectAll('g').data(['stub']).enter().append('g')
	                .each(function (d) {
	                    var head = d3.select(this);
	                    head.append('g')
	                        .attr('class', 'nv-legendWrap evt-chart hide-legend')
	                    head.append('g')
	                        .attr('class', 'nv-legendWrap evt-chart align-legend')
	                        .attr('transform', 'translate(0,' + legendHeight + ')')
	                });
	            gHead.selectAll('g.nv-series')
	                .attr('evt-name', function (d) {
	                    return d.valueOf()
	                })


	            hideLegend.dispatch.on('legendClick', function (e, i) {
	                lifeflow.dispatch.toggleEvt(e,i);
	                chart.update();
	            });

	            /*
	            hideLegend.dispatch.on('legendDblclick', function (d) {
	                //Double clicking should always enable current series, and disable all others.
	                data.forEach(function (d) { // broken
	                    d.disabled = true;
	                });
	                d.disabled = false;

	                //state.disabled = data.map(function(d) { return !!d.disabled });
	                dispatch.stateChange(state);
	                chart.update();
	            });
	            */
	            alignLegend.dispatch.on('legendClick', function (d, i) {
	                if (!!d.disabled) {
	                    lifeflow.alignChoices().forEach(function (d) {
	                        d.disabled = true;
	                    });
	                    chart.alignBy(d.valueOf());
	                    d.disabled = false;
	                } else {
	                    d.disabled = true;
	                    // default is align by start
	                    lifeflow.alignChoices()[0].disabled = false;
	                    chart.alignBy(lifeflow.alignChoices()[0].valueOf());
	                }
	                //lifeflow.dispatch.alignBy(d,i);
	                chart.update();
	            });

	            //------------------------------------------------------------
	            //------------------------------------------------------------
	            // Main Chart Component(s)


	            lifeflow 
	                //.disabled(data.map(function (series) { return series.disabled })) // commented out with no apparent effect
	                .width(chartGraphWidth)
	                .height(chartGraphHeight)
	            //.color(data.map(function(d,i) { return d.color || chart.color()(d, i); }) .filter(function(d,i) { return !data[i].disabled }))
	            svgChart.select('g.nv-evt-chart')
	                    .datum(data)
	                    //.transition()
	                    .call(lifeflow);

	            hideLegend.color(lifeflow.color());
	            alignLegend.color(lifeflow.color());
	            hideLegend.width(chartFullWidth);
	            alignLegend.width(chartFullWidth);

	            svgHead.selectAll('g.hide-legend')
	                .data([lifeflow.eventNames()])
	                .call(hideLegend);
	            svgHead.select('g.align-legend')
	                .data([lifeflow.alignChoices()])
	                .call(alignLegend);
	            yAxis
	                .orient('left')
	                .tickPadding(5)
	                .highlightZero(false)
	                .showMaxMin(false)
	                .tickFormat(d3.format('5,'))
	            //.tickFormat(function(d) { return d })
	            ;
	            xAxis
	                .orient('top')
	                .tickPadding(15)
	                .highlightZero(false)
	                .showMaxMin(false)
	                .tickFormat(d3.format('5,'))

	            yAxis.scale(lifeflow.yScale())
	                .ticks(chartGraphHeight / 24)
	                .tickSize(-chartFullWidth, 0);
	            xAxis.scale(lifeflow.xScale())
	                .ticks(chartGraphWidth / 55)
	                .tickSize(-chartGraphHeight, 0)

	            d3.transition()
	                .duration(2000)
	                .each(function() {
	                    svgChart.select('.nv-y.nv-axis')
	                    .call(yAxis);
	                });
	            var yTicks = svgChart.select('.nv-y.nv-axis').selectAll('g');
	            yTicks
	                .selectAll('line, text')
	                .style('opacity', 1)

	            svgChart.select('.nv-x.nv-axis')
	                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
	                .call(xAxis);
	            //------------------------------------------------------------



	            //============================================================
	            // Event Handling/Dispatching (in chart's scope)
	            //------------------------------------------------------------

	            // Update chart from a state object passed to event handler
	            /*
	            dispatch.on('tooltipShow', function(e) {
	                if (tooltips) showTooltip(e, that.parentNode);
	            });
	            dispatch.on('changeState', function(e) {

	                if (typeof e.disabled !== 'undefined') {
	                data.forEach(function(series,i) {
	                    series.disabled = e.disabled[i];
	                });

	                state.disabled = e.disabled;
	                }

	                if (typeof e.stacked !== 'undefined') {
	                lifeflow.stacked(e.stacked);
	                state.stacked = e.stacked;
	                }

	                selection.call(chart);
	            });
	            */
	            //============================================================
	            return;

	            //------------------------------------------------------------
	            /*
	            var svgFoot = container.selectAll('svg.svg-foot')
	                            .data([eventNames])
	            svgFoot.enter()
	                .append('svg')
	                    .attr('class', 'svg-foot')
	                    //.attr('width', availableWidth)
	                    .attr('height', margin.bottom)
	                .append('g')
	                    .attr('transform', 'translate(' + margin.left + ',0)')
	                    .attr('class', 'nv-x nv-axis');
	            svgFoot = container.select('svg.svg-foot>g')
	            */

	            //chart.update = function() { container.transition().call(chart) };

	            //set state.disabled
	            /*
	            state.disabled = data.map(function(d) { return !!d.disabled });

	            if (!defaultState) {
	                var key;
	                defaultState = {};
	                for (key in state) {
	                if (state[key] instanceof Array)
	                    defaultState[key] = state[key].slice(0);
	                else
	                    defaultState[key] = state[key];
	                }
	            }
	            */
	            /*
	            if (lifeflow.barColor())
	                data.forEach(function(series,i) {
	                //series.color = d3.rgb('#ccc').darker(i * 1.5).toString();
	                })
	            */

	            /*
	            if ( margin.top != legend.height()) {
	                margin.top = legend.height();
	                availableHeight = (height || parseInt(svgHead.style('height')) || 400)
	                                    - margin.top - margin.bottom;
	            }
	            gHead.select('.nv-legendWrap')
	                .attr('transform', 'translate(0' + 
	                    ',' + (-margin.top) +')');
	            */


	        });

	        return chart;
	    }


	        //============================================================
	        // Event Handling/Dispatching (out of chart's scope)
	        //------------------------------------------------------------

	        lifeflow.dispatch.on('elementMouseover.tooltip', function(e) {
	            //e.pos = [e.pos[0] +  margin.left, e.pos[1] + margin.top];
	            dispatch.tooltipShow(e);
	        });
	        lifeflow.dispatch.on('elementMouseout.tooltip', function(e) {
	            dispatch.tooltipHide(e);
	        });
	        dispatch.on('tooltipShow', function(e) {
	            if (tooltips) showTooltip(e);
	        });
	        dispatch.on('tooltipHide', function() {
	            if (tooltips) nv.tooltip.cleanup();
	        });
	        lifeflow.dispatch.on('doneDrawing', function(e) {
	            // false && 
	            $("g.event-node rect").contextMenu('context-menu-1', {
	                    'hide these': {
	                        click: function(element){  // element is the jquery obj clicked on when context menu launched
	                            var node = element[0].__data__;
	                            var timelineRecords = 
	                                _.chain(node.records)
	                                    .invoke('timeline')
	                                    .pluck('records')
	                                    .flatten()
	                                    .value();
	                            var remaining = _.difference(
	                                lifeflow.timelineData().data(), timelineRecords);
	                            lifeflow.dispatch.selectRecs(remaining);
	                            if (chart.alignBy() && chart.alignBy() !== node.toString()) {
	                                // keep alignBy
	                            } else {
	                                chart.alignBy(undefined);
	                            }
	                            chart.update();
	                            //element.css({backgroundColor: 'pink'}); // just as example the clicked items backgorund is changed
	                        },
	                        klass: "filter-this"
	                    },
	                    'Show only this sequence': {
	                        click: function(element){  // element is the jquery obj clicked on when context menu launched
	                            var node = element[0].__data__;
	                            var timelineRecords = 
	                                _.chain(node.records)
	                                    .invoke('timeline')
	                                    .pluck('records')
	                                    .flatten()
	                                    .value();
	                            lifeflow.dispatch.selectRecs(timelineRecords);
	                            chart.alignBy(node.parent ?  node.parent.toString() : node.toString());
	                            chart.update();
	                            //element.css({backgroundColor: 'pink'}); // just as example the clicked items backgorund is changed
	                        },
	                        klass: "filter-others" // a custom css class for this menu item (usable for styling)
	                    },
	                    'Show timelines, sort by evt duration': {
	                        click: _.partial(showTimelines, 'eventDur'),
	                        klass: "show-timelines" // a custom css class for this menu item (usable for styling)
	                    },
	                    'Show timelines, sort by timeline duration': {
	                        click: _.partial(showTimelines, 'timelineDur'),
	                        klass: "show-timelines" // a custom css class for this menu item (usable for styling)
	                    },
	                }
	                ,{
	                    //delegateEventTo: 'childrenSelector',
	                    disable_native_context_menu: true,
	                    showMenu: function(element) { 
	                        var node = element[0].__data__;
	                        var desc = 
	                            '<b>' + node.namePath({noRoot:true}) + '</b>'
	                            + ' (' + node.records.length + ' records)';
	                        this.find('li.filter-this>a').html('Hide this sequence: ' + desc);
	                        //this.find('li.filter-others>a').html('Show only this sequence');
	                    },
	                    //hideMenu: function() { alert("Hiding menu"); },
	                    //leftClick: true // trigger on left click instead of right click
	                }
	            );
	        });
	        function showTimelines(sortOrder, element) {  // element is the jquery obj clicked on when context menu launched
	            var node = element[0].__data__;
	            var children = node.descendants();
	            _(children).each(function(d) { 
	                d3.select(d.domNode).remove();
	                if (d.parent) d3.select(d.parent.domNode).remove();
	            })
	            var ht = parseFloat(d3.select(element[0]).attr('height'));
	            var align = node.parent || node;
	            var tmChart = nv.models.timelines()
	                .xScale(lifeflow.xScale())
	                .height(ht)
	                .width(width)
	                .eventNames(lifeflow.eventNames())
	                .startDateProp(lifeflow.startDateProp())
	                .entityIdProp(lifeflow.entityIdProp())
	                .eventNameProp(lifeflow.eventNameProp())
	                .color(lifeflow.color())
	            if (sortOrder === 'eventDur') 
	                tmChart.alignBy(align.toString()).sort('asc');
	            if (sortOrder === 'timelineDur') 
	                tmChart.alignBy('Start')

	            element[0].__data__.domNode;
	            //tlNode = d3.select(element[0].__data__.domNode.parentElement)
	            tlNode = d3.select(align.domNode)
	                .append('g')
	                    .attr('class', 'lf-timelines')
	                    .attr('transform','translate(' + 
	                        lifeflow.relativeX()(lifeflow.eventNodeWidth()) + ',0)');
	                    //.attr('transform', d3.select(element[0].__data__.domNode) .attr('transform'))
	            var recs = _.chain(node.records)
	                .map(function(rec) {
	                    var toEnd = [rec.prev()||rec];
	                    var n = toEnd[0];
	                    while (n = n.next()) {
	                        toEnd.push(n)
	                    }
	                    return toEnd;
	                })
	                .flatten()
	                .value();
	            tmChart.yScaleLinear(d3.scale.linear()
	                    .domain([0,recs.length])
	                    .range([0,ht]));
	            tmChart.yScaleOrdinal(d3.scale.ordinal()
	                    .range([0,ht]));
	            tmChart.dispatch.on('elementMouseover.tooltip', function(e) {
	                dispatch.tooltipShow(e);
	            });
	            tmChart.dispatch.on('elementMouseout.tooltip', function(e) {
	                dispatch.tooltipHide(e);
	            });
	            tlNode.datum(recs)
	                .call(tmChart);
	    }
	    //============================================================
	    // Expose Public Variables
	    //------------------------------------------------------------

	    // expose chart's sub-components
	    chart.dispatch = dispatch;
	    chart.lifeflow = lifeflow;
	    //chart.legend = legend;
	    chart.yAxis = yAxis;
	    chart.xAxis = xAxis;

	    d3.rebind(chart, lifeflow, 'clipEdge', 'id', 'delay', 'showValues', 'valueFormat', 'barColor', 'entityIdProp', 'eventNameProp', 'eventOrder', 'startDateProp', 'endDateField', 'defaultDuration', 'color', 'eventNames', 'alignBy', 'xAxis','unitProp');
	    chart.margin = function (_) {
	        if (!arguments.length) return margin;
	        margin.top = typeof _.top != 'undefined' ? _.top : margin.top;
	        margin.right = typeof _.right != 'undefined' ? _.right : margin.right;
	        margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
	        margin.left = typeof _.left != 'undefined' ? _.left : margin.left;
	        return chart;
	    };

	    chart.width = function (_) {
	        if (!arguments.length) return width;
	        width = _;
	        return chart;
	    };

	    chart.height = function (_) {
	        if (!arguments.length) return height;
	        height = _;
	        return chart;
	    };

	    chart.showLegend = function (_) {
	        if (!arguments.length) return showLegend;
	        showLegend = _;
	        return chart;
	    };

	    chart.tooltip = function(_) {
	        if (!arguments.length) return tooltip;
	        tooltip = _;
	        return chart;
	    };

	    chart.tooltips = function(_) {
	        if (!arguments.length) return tooltips;
	        tooltips = _;
	        return chart;
	    };

	    chart.tooltipContent = function(_) {
	        if (!arguments.length) return tooltip;
	        tooltip = _;
	        return chart;
	    };

	    chart.state = function (_) {
	        if (!arguments.length) return state;
	        state = _;
	        return chart;
	    };

	    chart.defaultState = function (_) {
	        if (!arguments.length) return defaultState;
	        defaultState = _;
	        return chart;
	    };

	    chart.noData = function (_) {
	        if (!arguments.length) return noData;
	        noData = _;
	        return chart;
	    };

	    //============================================================


	    return chart;
	}


/***/ },
/* 4 */
/***/ function(module, exports, require) {

	'use strict';
	var lifeflowData = function () {
	    function LifeflowNode() {};
	    LifeflowNode.prototype.x = function(unit) {
	        return timelines.dur(this._x, unit);
	    };
	    LifeflowNode.prototype.dx = function(unit) {
	        return timelines.dur(this._dx, unit);
	    };
	    LifeflowNode.prototype.y = function() {
	        return this._y;
	    };
	    LifeflowNode.prototype.dy = function() {
	        return this._dy;
	    };
	    LifeflowNode.prototype.recs = function() {
	        var lfnode = this;
	        return lfnode.records.map(function(evt) {
	            var rec = {
	                toEvtInParent: toEvtInParent(lfnode, evt),
	                evt: evt
	            };
	            rec.offset = rec.toEvtInParent - lfnode.dx() * 
	                (lfnode.backwards ? -1 : 1);
	            return rec;
	        }).sortBy('offset');
	    };
	    var dumpOpts = {
	                logFunc: function(o) { console.log(o) },
	                unit: { unit: 'timeline',
	                        withUnit: false,
	                        round: false },
	                path: true,
	                coords: true,
	                parentCoords: true,
	                stringifyReturn: false,
	                stringifyLog: false,
	                recsFromPrev: true,
	                recsToNext: true
	            };
	    LifeflowNode.prototype.dump = function(opts) {
	        var holdUnit = opts && opts.unit;
	        opts = _.extend(_.clone(dumpOpts), opts);
	        opts.unit = _.extend(_.clone(opts.unit), holdUnit);
	        var res = {};
	        if (opts.path) {
	            res.namePath = this.namePath();
	            res.depth = this.depth;
	        }
	        if (opts.coords) {
	            res.x = this.x(opts.unit);
	            res.dx = this.dx(opts.unit);
	            res.y = this.y();
	            res.dy = this.dy();
	        }
	        if (opts.parentCoords && this.parent) {
	            var p = this.parent;
	            res.parentNamePath = p.namePath(),
	            res.parentDepth = p.depth,
	            res.parent_x = p.x(opts.unit);
	            res.parent_dx = p.dx(opts.unit);
	            res.parent_y = p.y();
	            res.parent_dy = p.dy();
	        }
	        if (opts.recsFromPrev) {
	            res.fromPrev = this.records.invoke('fromPrev', 0, opts.unit).sort();
	            res.fromPrevMin = res.fromPrev.min().valueOf();
	            res.fromPrevMax = res.fromPrev.max().valueOf();
	            res.fromPrevMean = res.fromPrev.mean().valueOf();
	            res.fromPrevMedian = res.fromPrev.median().valueOf();
	        }
	        if (opts.recsToNext) {
	            res.toNext = this.records.invoke('toNext', 0, opts.unit).sort();
	            res.toNextMin = res.toNext.min().valueOf();
	            res.toNextMax = res.toNext.max().valueOf();
	            res.toNextMean = res.toNext.mean().valueOf();
	            res.toNextMedian = res.toNext.median().valueOf();
	        }
	        opts.logFunc(opts.stringifyLog ? JSON.stringify(res) : res);
	        return opts.stringifyReturn ? JSON.stringify(res) : res;
	    };
	    function toEvtInParent(lfnode, evt) {
	        if (lfnode.backwards)
	            return evt.toNext();
	        return evt.fromPrev();
	    }
	    var 
	        eventNameProp = null,
	        timelines,  // just for date reporting context
	        rectWidth = function(lfnode) {
	            var recs = lfnode.records;
	            if (! (recs && recs.length)) return 0;
	            var durations = recs
	                .map(function(rec) { return toEvtInParent(lfnode,rec); })
	                //.invoke('fromPrev')
	                .compact()
	            return durations.length ? durations.mean().valueOf() : 0;
	        },
	        nextFunc = function(d) { return d.prev() };
	    var makeNodes = function(startRecs, noflatten, backwards, maxDepth) {
	        var groupKeyName = (backwards ? 'prev' : 'next') + '_' + eventNameProp;
	        function preListRecsHook(records) { // group next records, not the ones we start with
	            return records.invoke('next').compact();
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
	        //lfnodes = position({children:lfnodes,records:[]}).children;
	        var allNodes = lfnodes.flattenTree();
	        allNodes.each(function(lfnode) {
	            _.extend(lfnode, new LifeflowNode());
	        });
	        var fakeRoot = supergroup.addListMethods([]).asRootVal();
	        _.extend(fakeRoot, new LifeflowNode());
	        fakeRoot.children = lfnodes;
	        lfnodes.each(function(d) { d.parent = fakeRoot; });
	        lfnodes = position(fakeRoot).children;
	        lfnodes.each(function(d) { delete d.parent; });


	        if (noflatten === "noflatten")
	            return lfnodes;

	        return allNodes;

	        function position(lfnode, yOffset) {
	            var children = lfnode.children;
	            lfnode._dy = lfnode.records.length;
	            if (lfnode.parent) {
	                lfnode._dx = rectWidth(lfnode); // fromPrev
	                lfnode._x = lfnode.parent.x() + lfnode.dx();
	                lfnode._y = lfnode.parent.y() + (yOffset || 0);
	            } else {
	                lfnode._dx = 0;
	                lfnode._x = lfnode.dx();
	                lfnode._y = 0;
	            }
	            
	            if (children && (n = children.length)) {
	                var i = -1, c, yOffset = 0, n;
	                while (++i < n) {
	                    position(c = children[i], yOffset)
	                    yOffset += c.dy();
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


/***/ },
/* 5 */
/***/ function(module, exports, require) {

	'use strict';

	window.nv = nv || {models:{}, utils:{}};
	var lifeflowExtras = function() {
	    var exp = function() {}; // export container
	    /* menu/control ideas....
	     *
	     *  Filter out
	     *  Filter in
	     *  Align by
	     *      start, end, evtType
	     *  GraphType
	     *      lifeflow, timelines, icicle
	     *  Show legend, Hide legend
	     *  Lifeflow Settings
	     *      fill gap from previous event 
	     *      show distribution on mouseover
	     *          do/don't hide on mouseout so evt mouseover will work
	     */
	    var dispatch = exp.dispatch = d3.dispatch('refresh', 'distNodeMouseover');

	    exp.menu = function(targetSelection, menuData) {
	        targetSelection.selectAll('ul').data([1]).enter()
	                    .append('div').attr('id','cssmenu') 
	                    .append('ul');
	        var div = targetSelection.select('div#cssmenu');
	        var topULs = div.selectAll('ul').filter(function() { 
	            return this.parentNode===targetSelection.select('div#cssmenu').node() 
	        })
	        menuRecurse(topULs, menuData);

	        // fill filter subs
	    }
	    var tip;
	    var showTooltip = exp.showTooltip = function(e, offsetElement) {
	        exp.tip = tip = tip || window.nv.models.tooltip().gravity('w').distance(23);
	        tip
	            .gravity('e')
	            .position({ left: e.e.clientX, top: e.e.clientY })
	            .data(
	                {
	                    value: e.text,
	                    series: e.series,
	                })();
	    };
	    var hideTooltip = function() {
	        nv.tooltip.cleanup();
	    };
	    function menuRecurse(d3Node, menuItems) {
	        var newLIs = d3Node.selectAll('li')
	                    .data(menuItems).enter()
	                    .append('li')
	                        .classed('active', function(d) { return d.active })
	        newLIs.append('a').attr('href','#')
	            .append('span').text(function(d) { return d.label })
	        newLIs.filter(function(d) { return d.action })
	            .selectAll('a')
	            .on('click',function(d) {
	                if (d.refresh) dispatch.refresh();
	                d.action.apply(this, arguments)
	            })
	        newLIs.filter(function(d) { return !d.action })
	            .selectAll('a')
	            .style('cursor','default')
	        d3Node.selectAll('li').each(function(d) {
	            d3.select(this).classed('has-sub', d.subs && d.subs.length);
	            if (d.subs && d.subs.length) {
	                d3.select(this).selectAll('ul')
	                            .data([1]).enter().append('ul')
	                menuRecurse(d3.select(this).select('ul'), d.subs);
	            }
	            if (d.LIprops)
	                for (var p in d.LIprops) {
	                    d3.select(this).attr(p, d.LIprops[p])
	                }
	        })
	    }




	    var nodesWithDistributionsShowing = [];
	    exp.mouseout = function(lfChart, context, lfnode, i) {
	        hideTooltip();
	    };
	    exp.nodeTooltip = function(lfChart, context, lfnode, i) {
	        var tl = lfnode.records[0].timeline();
	        tl.unitSettings({unit:'timeline', withUnit:true, round:true});
	        showTooltip({
	            value: lfnode,
	            text: lfnode.namePath(),
	            series: lfnode.pedigree().map(function(node, i) {
	                return {
	                    key: i,
	                    value: [
	                        i ? node.dx() : '',
	                        i ?  '&nbsp;&rarr;&nbsp;' : '',
	                        node.toString(),
	                        node.records.length + ' evts'
	                    ],
	                    color: lfChart.color()(node.toString())
	                }
	            }),
	            e: d3.event
	        });
	        tl.restoreUnitSettings();
	    };
	    exp.nodeDumpTooltip = function(lfChart, context, lfnode, i) {
	        showTooltip({
	            value: lfnode,
	            text: lfnode.namePath(),
	            series: _.unchain(
	                lfnode.dump( {unit:{unit:'timeline', 
	                    withUnit:true, round:true}}))
	                .pairs()
	                .map(function(p) {
	                    return {key:p[0],value:p[1]};
	                })
	                .extend({color:lfChart.color()(lfnode.toString())}),
	            e: d3.event
	        });
	    };
	    exp.distNodeTooltip = function (lfChart, node, rec, i) {
	        var lfnode = node.parentNode.__data__;
	        d3.select(node).classed('hover', true)
	        var fmt = d3.time.format('%Y-%m-%d');
	        var tl = rec.evt.timeline();
	        tl.unitSettings({unit:'timeline', withUnit:true, round:true});
	        showTooltip({
	            value: rec.evt,
	            text: tl + ': ' + rec.evt.eventName() + 
	                ' - ' + rec.evt.toNext() + ' of ' +
	                rec.evt.timeline().duration(),
	            series: _(rec.evt.timeline().records).map(function(rec, i) {
	                var evtName = rec.eventName();
	                if (i > lfnode.depth) {
	                    evtName = '(' + evtName + ')';
	                }
	                return {
	                    key: evtName,
	                    value: rec.dtStr(),
	                    color: lfChart.color()(rec.eventName())
	                }
	            }),
	            e: d3.event
	        });
	        tl.restoreUnitSettings();
	    };
	    exp.showEvtDistribution = function(lfChart, context, lfnode, i) {
	        /*
	        d3.selectAll('rect')
	            .transition().duration(700)
	            .attr('opacity', 0.4);
	            */
	        console.log('mouse over ' + nodesWithDistributionsShowing.length);
	        console.log(nodesWithDistributionsShowing);
	        //lfnode.dump({stringifyLog:false});
	        var alreadyDisplayed = false;
	        _(nodesWithDistributionsShowing).each(function(d) {
	            if (d === lfnode) {
	                alreadyDisplayed = true;
	                return;
	            }
	            d.distCircles.remove();
	            d.distPath.remove();
	            delete d.distCircles;
	            delete d.distPath;
	        });
	        nodesWithDistributionsShowing.length = 0;
	        if (alreadyDisplayed) {
	            nodesWithDistributionsShowing.push(lfnode);
	        }
	        d3.select(context).selectAll('rect.gap-fill').attr('opacity',1)
	        var recs, xFunc;
	        if (!lfnode.parent) {
	            recs = [];
	        } else {
	            recs = lfnode.recs();
	        }
	        /*
	         else if (lfnode.backwards) {
	            recs = lfnode.records.sort(function (a, b) {
	                return a.toNext() - b.toNext();
	            });
	            //xFunc = function(d) { return lfChart.relativeX()(-d.toNext()) };
	            xFunc = function(d) {
	                    return lfChart.relativeX()(-lfnode.parent.dx -
	                            d.toNext())
	            };
	        } else {
	            recs = lfnode.records.sort(function (a, b) {
	                return a.fromPrev() - b.fromPrev();
	            });
	            xFunc = function(d) {
	                return lfChart.relativeX()(d.fromPrev())
	            };
	        }
	        */
	        var line = d3.svg.line()
	            //.x(xFunc)
	            .x(function(rec) {
	                return lfChart.relativeX()(rec.offset); })
	            .y(function (d, i) {
	                return lfChart.yScale()(i + 0.5)
	            });
	        var path = d3.select(context).selectAll('path')
	            .data([recs])
	        path.enter()
	            .append('path')
	            .attr('d', line)
	        path.attr('fill-opacity', 0)
	            .attr('stroke', 'black')
	            .style('pointer-events', 'none')
	            .style('stroke-opacity', 1)
	        var circle = d3.select(context).selectAll('circle')
	            .data(recs)
	        circle.enter()
	            .append('circle')
	            .attr('cx', function(rec) {
	                return lfChart.relativeX()(rec.offset); })
	            .attr('cy', function (rec, i) {
	                return lfChart.yScale()(i + 0.5)
	            })
	            .attr('r', 4)
	            .on("mouseover", function(d, i) {
	                dispatch.distNodeMouseover(lfChart, this, d, i);
	            });
	        circle.style('fill-opacity', 0)
	        //.style('stroke-opacity',1)
	        //.style('pointer-events','none')
	        .attr('stroke', 'black')
	            .attr('stroke-opacity', 0.2)
	        //.attr('stroke', function() { return color(d.valueOf()) })
	        if (alreadyDisplayed) {
	            if (!_(lfnode).has('distCircles'))
	                throw new Error('what up');
	        } else {
	            lfnode.distCircles = circle;
	            lfnode.distPath = path;
	            nodesWithDistributionsShowing.push(lfnode);
	        }
	    }
	    exp.xAxis = function(container) {
	            var gEnter = svgChart.enter()
	                            .append('div')
	                                //.style('width', availableWidth)
	                                .style('height', chartFullHeight)
	                                .style('overflow-y', 'scroll')
	                            .append('svg').attr('class', 'svg-chart')
	                                //.attr('width', availableWidth)
	                                .attr('height', chartFullHeight)

	            gEnter.append('g').attr('class', 'nv-x nv-axis')
	            gEnter
	                .append('g').attr('class', 'nvd3 nv-wrap nv-evt-chart')

	    };
	    return exp;
	}


/***/ },
/* 6 */
/***/ function(module, exports, require) {

	'use strict';
	var timelineChart = function () {

	    //============================================================
	    // Public Variables with Default Settings
	    //------------------------------------------------------------

	    var margin = {
	            top: 0,
	            right: 0,
	            bottom: 0,
	            left: 0
	        }
	        , edata, entityIdProp = null
	        , timelineData
	        , eventNameProp = null
	        , eventNames = null
	        , eventOrder = []
	        , alignChoices
	        , startDateProp = null
	        , unitProp
	        , timeUnit
	        , defaultDuration = null
	        , sortParam
	        , width = 960
	        , height = 500
	        , id = Math.floor(Math.random() * 10000) //Create semi-unique ID in case user doesn't select one
	        , x = d3.scale.linear()
	        , y = d3.scale.linear()
	        , yOrd = d3.scale.ordinal()
	        //, color = nv.utils.defaultColor()
	        , color = d3.scale.category20()
	        , showValues = false
	        , valuePadding = 60
	        , valueFormat = d3.format(',.2f')
	        , delay = 1200
	        , dispatch = d3.dispatch('chartClick', 'elementClick', 
	                'elementDblClick', 'elementMouseover', 'elementMouseout',
	                'toggleEvt','alignBy')
	        , controlsData
	        , alignBy
	        , level = true
	        , sortFunc
	            ;
	    var lifeflow = nv.models.lifeflow();
	    var evtLFMap;
	    //============================================================
	    var domIds = 1;
	    var lfnodes;  // move this!!!

	    function chart(selection) {
	        selection.each(function (timelineData) {
	            var container = d3.select(this);
	            x = d3.scale.linear().range([0,width])
	            y = d3.scale.linear().range([0,height])
	                    .domain([0,timelineData.length])
	            var fmt = d3.format('15.0f');
	            if (alignBy === "Lifeflow") {
	                //lfnodes = edata.nodes('first', true);
	                var startRecs = _.chain(timelineData)
	                                    .pluck('records')
	                                    .map(_.first)
	                                    .value();
	                x = d3.scale.linear()
	                        .range(x.range())
	                        .domain([0,
	                            d3.max(_(timelineData).map(function(d) {
	                                return d.duration()
	                            })) ]);
	                var xDayScale = d3.scale.linear()
	                        .range(x.range())
	                        .domain([0, (x.domain()[1] -x.domain()[0])]);
	                var xx = function(d) {
	                    return x(d.startIdx())
	                }
	                sortFunc = function(a,b) {
	                    return a.records[a.records.length-1].lfnode(lfnodes).lfIdx - 
	                           b.records[b.records.length-1].lfnode(lfnodes).lfIdx
	                }
	                evtLFMap = {};
	                lifeflow
	                    .width(width)
	                    .height(height)
	                    .eventNames(eventNames)
	                    .startDateProp(startDateProp)
	                    .entityIdProp(entityIdProp)
	                    .eventNameProp(eventNameProp)
	                    .color(color)

	                //_.sortBy(timelineData, 'lforder');

	                // next two lines duplicate general case
	                y.domain([0, timelineData.length]);
	                var lineHeight = (y.range()[1] - y.range()[0]) / timelineData.length;
	                //lfnodes = edata.nodes('first', true);
	                lifeflow
	                    .xScale(x)
	                    //.yScale(d3.scale.linear() .range([0, height]))
	                    .yScale(y)
	                lfnodes = lifeflow.makeLifeflowNodes(startRecs,
	                    function(d) { return d.next() });
	                _(lfnodes).each(function(lfnode) {
	                    _(lfnode.records).each(function(evt, i) {
	                        if (evtLFMap[evt.evtIdx() + '_' + evt.id()]) throw new Error("dup")
	                        evtLFMap[evt.evtIdx() + '_' + evt.id()] = {idx:i, lfnode:lfnode};
	                    })
	                })
	                x.domain([
	                                d3.min([0].concat(lfnodes.map(function(d) { 
	                                    return d.x + d.dx
	                                }))),
	                                d3.max([0].concat(lfnodes.map(function(d) { 
	                                    return d.x + d.dx 
	                                })))
	                            ]);
	                var maxSequenceLength = d3.max(
	                        _.chain(timelineData).pluck('records')
	                        .flatten().invoke('evtIdx').value());
	                var timelines = container.selectAll('g.rect');
	                var evts = timelines.selectAll('rect');
	                var dur = 5000;
	                var lfNodeOfEvt = function(evt) {
	                    return evtLFMap[evt.evtIdx() + '_' + evt.id()].lfnode;
	                }
	                var tlSortFunc = function(a,b) {
	                        var A = lfNodeOfEvt(_(a.records).last());
	                        var B = lfNodeOfEvt(_(b.records).last());
	                        return (A.y + A.dy) - (B.y + B.dy)
	                    }
	                timelines.on("mouseover", null);
	                evts.on("mouseover", function (evt, i) {
	                        var tl = evt.timeline();
	                        d3.select(this).classed('hover', true)
	                        var fmt = d3.time.format('%Y-%m-%d');
	                        dispatch.elementMouseover({
	                            value: tl,
	                            text: tl.toString() + ' - ' + tl.duration() + ' ' + timeUnit + ' ' +
	                                    lfNodeOfEvt(evt).namePath() + ' ' +
	                                    lfNodeOfEvt(evt).y + ':' +
	                                    lfNodeOfEvt(evt).dy,
	                            series: _(tl.records).map(function(rec) {
	                                return {
	                                    key: rec.eventName(),
	                                    value: fmt(rec.startDate()),
	                                    color: color(rec.eventName())
	                                }
	                            }),
	                            e: d3.event
	                        });
	                    })
	                evts.attr('stroke-width',0)
	                            .attr('rx', 0)
	                            .attr('height', lineHeight)
	                            .attr('y', 0)
	                var maxDepth = _.max(lfnodes.pluck('depth'));
	                var durScale = d3.scale.pow().domain([0,1]).range([0,dur])
	                var durFunc = function(level) { 
	                    return durScale(1/(level+1)) };
	                var delayFunc = function(level) { 
	                    return _.chain(_.range(1,(level+1))).map(
	                        function(d) { return durScale(1/d) }).reduce(
	                        function(prev, cur) { return prev + cur; },0).value() }

	                _.each(_.range(0,maxDepth), function(level) {
	                    var lfn = lifeflow.makeLifeflowNodes(startRecs,
	                        function(d) { return d.next() }, false, level);
	                    evtLFMap = {};
	                    _(lfn).each(function(lfnode) {
	                        _(lfnode.records).each(function(evt, i) {
	                            if (evtLFMap[evt.evtIdx() + '_' + evt.id()]) throw new Error("dup")
	                            evtLFMap[evt.evtIdx() + '_' + evt.id()] = {idx:i, lfnode:lfnode};
	                        })
	                    })
	                    var sortedTLs = timelineData.sortBy(function(tl) {
	                        var evt = tl.records[Math.min(level, tl.records.length-1)];
	                        var lfnode = lfNodeOfEvt(evt)
	                        return lfnode.y + lfnode.dy
	                    })

	                    var timelines = container.selectAll('g.rect')
	                        .data(sortedTLs, function(d) { return d.toString() })
	                    //timelines.exit().remove();
	                    timelines
	                        .order()
	                        .transition().duration(durFunc(level)).delay(delayFunc(level))
	                        .attr('transform', function(tl,i) {
	                            return 'translate(' + 0 + ',' + y(i) + ')';
	                        })

	                    evts.transition().duration(durFunc(level)).delay(delayFunc(level))
	                        .attr('x', function(evt, i, j) {
	                            var newX = _.chain(
	                                evt.timeline().records.slice(0,evt.evtIdx()))
	                                .map(function(e) {
	                                    if (_(evtLFMap).has(e.evtIdx() + '_' + e.id()))
	                                        return evtLFMap[e.evtIdx() + '_' + e.id()].lfnode.dx
	                                    else
	                                        return e.toNext()
	                                })
	                            /*
	                                .tap(function(d) {
	                                    var newX = _.reduce(d,function(prev, cur) { return prev + cur; },0)
	                                    if (evt.id()==="A5030/In Development/Fri Jun 12 1998 00:00:00 GMT-0400 (EDT)")
	                            console.log(level + ' -- ' + i + ':' + j + ', new: ' + newX + ' ' + d)
	                                })
	                            */
	                                .reduce(function(prev, cur) { return prev + cur; },0)
	                                .value()
	                            return xDayScale(newX);
	                        })
	                        .attr('width', function(evt) {
	                            var w;
	                            if (evt.evtIdx() <= level && _(evtLFMap).has(evt.evtIdx() + '_' + evt.id()))
	                                w = xDayScale(evtLFMap[evt.evtIdx() + '_' + evt.id()].lfnode.dx)
	                            else
	                                w = xDayScale(evt.toNext())
	                            if (isNaN(w)) w = 5;
	                            return w
	                        })
	                })
	                return;
	            } else if (alignBy === "Icicle") {
	                var evtNames = enlightenedData.group(timelineData
	                        .pluck('records').flatten(), eventNameProp)
	                    .sort(function(a,b) {
	                        return eventOrder.indexOf(a.toString()) -
	                            eventOrder.indexOf(b.toString())
	                    })
	                evtNames.each(function(evtName, i) {
	                    evtName.x = i ? (evtNames[i-1].x + evtNames[i-1].width) : 0;
	                    evtName.width = d3.max(evtName.records.invoke('toNext'))
	                    evtName.records.sort(function(a,b) { 
	                        return (b.toNext()||0) - (a.toNext()||0) })
	                })
	                y.domain([0, timelineData.length]);
	                var lineHeight = (y.range()[1] - y.range()[0]) / timelineData.length;
	                container.selectAll('g.rect')
	                    .each(function(g, i) {
	                        d3.select(this).selectAll('rect')
	                            .attr('y', y(i))
	                    })
	                    .attr('transform',null)
	                x = d3.scale.linear()
	                        .range(x.range())
	                        .domain([0, _.max(evtNames.map(function(d) {
	                            return d.x + d.width }))])
	                evtNames.each(function(evtName) {
	                    var evts = container.selectAll('g.rect>rect')
	                        .data(evtName.records, function(evt) { return evt.id() });
	                    evts
	                        .attr('stroke-width',0)
	                        .attr('rx', 0)
	                        .attr('height', lineHeight)
	                        .on("mouseover", function (d, i) {
	                            container.selectAll('g.rect>rect')
	                                .attr('opacity', 0.5)
	                                .attr('height', lineHeight)
	                                .filter(function(evt) {
	                                    return evt.timeline().toString() === d.timeline().toString()
	                                })
	                                .attr('opacity', 1)
	                                .attr('height', Math.max(lineHeight, 5))
	                        })
	                        .on("mouseout", function (d, i) {
	                            container.selectAll('g.rect>rect')
	                                .attr('opacity', 1)
	                                .attr('height', lineHeight)
	                        })
	                        .transition().duration(3000)
	                        .attr('x', function(evt) {
	                            return x(evtNames.lookup(evt.eventName()).x)
	                        })
	                        .attr('width', function(evt) {
	                            return x(evt.toNext() || 5)
	                        })
	                        .attr('y', function(evt, i) {
	                            return y(i)
	                        })
	                })
	                return;
	            } else if (alignBy) {
	                var alignDayIdx = function(tl) {
	                    var alignRec = tl.evtLookup(alignBy);
	                    return alignRec ? alignRec.startIdx() : 0;
	                }
	                x = d3.scale.linear()
	                        .range(x.range())
	                        .domain([
	                            -d3.max(_(timelineData).map(alignDayIdx)),
	                            d3.max(_(timelineData).map(function(d) {
	                                return d.duration() - alignDayIdx(d)
	                            })) ]);
	                var xDayScale = d3.scale.linear()
	                        .range(x.range())
	                        .domain([0, (x.domain()[1] -x.domain()[0])]);
	                var xx = function(d) {
	                    return x(d.startIdx() - alignDayIdx(d.timeline()))
	                }
	                if (alignBy === 'Start') {
	                    sortFunc = function(a,b) {
	                        return b.duration() - a.duration();
	                    };
	                    var xx = function(d) {
	                        return x(d.startIdx())
	                    }
	                } else if (alignBy === 'End') {
	                    sortFunc = function(a,b) {
	                        return b.duration() - a.duration();
	                    };
	                    var xx = function(d) {
	                        return x(d.startIdx() - d.timeline().duration()) +
	                            x.range()[1]
	                    }
	                } else {
	                    sortFunc = timelineData.evtDurationSortFunc(alignBy);
	                }
	            } else {
	                x = d3.time.scale()
	                        .range(x.range())
	                        .domain([
	                            d3.min(_(timelineData).invoke('startDate')), 
	                            d3.max(_(timelineData).invoke('endDate')), 
	                        ]);
	                xDayScale = d3.scale.linear().range(x.range())
	                                .domain([0, (x.domain()[1] -x.domain()[0]) / 
	                                            chart.unitProp()]);
	                var xx = function(d) {
	                    return x(d.startDate());
	                }
	                /* can't do this anymore with immutable data
	                _.each(timelineData, function(d) {
	                    d.sortVal = d.sortVal ? ('.'+d.sortVal) : '';
	                    d.sortVal = fmt(d.startDate()) + d.sortVal;
	                });
	                timelineData.sort(function(a,b) { 
	                    return d3.ascending(a.sortVal,b.sortVal);
	                });
	                */
	                sortFunc = function(a,b) { 
	                    return d3.ascending(a.startDate(),b.startDate());
	                };
	            }
	            y.domain([0, timelineData.length]);
	            var lineHeight = (y.range()[1] - y.range()[0]) / timelineData.length;
	            // lineHeight should be same as yOrd.rangeBand(), right?




	            var sortedTimelines = timelineData.sort(sortFunc);
	            if (sortParam === 'asc') sortedTimelines.reverse();
	            yOrd.domain(sortedTimelines.rawValues());


	            var tlnodes = container.selectAll('g.rect')
	                .data(sortedTimelines, function (d) { return d })
	                .order()
	            tlnodes.exit()
	                .transition()
	                .duration(2000)
	                .attr('transform', function (d) {
	                    var ptr = d,
	                        backwardsPath = [];
	                    while (ptr.parent) {
	                        backwardsPath.push(ptr);
	                        ptr = ptr.parent;
	                    }
	                    var startX = 0;
	                    for (var i = backwardsPath.length - 1; i >= 0; i--) {
	                        var ptr = backwardsPath[i];
	                        startX = ptr.x;
	                        if (eventNames.lookup(ptr.valueOf()) &&
	                            eventNames.lookup(ptr.valueOf()).disabled)
	                            break;
	                    }
	                    return 'translate(' + x(startX) + ',' + y(d.y) + ')'
	                })
	            tlnodes.exit().select('rect')
	                .transition()
	                .duration(2000)
	                .attr('width', 0)
	            tlnodes.exit()
	                .transition().delay(2000)
	                .remove();
	            tlnodes.enter().append('g')
	                    .attr('class', 'rect')
	                    .attr('path', function (d) {
	                        return d.valueOf()
	                    })
	                    .attr('transform', function (d,i) {
	                        return 'translate(0,' + y(i) + ')'
	                    })
	                .on("mouseout", function (d, i) {
	                    d3.select(this).classed('hover', false)
	                    dispatch.elementMouseout(d,i);
	                })
	                .on("mouseover", function (d, i) {
	                    d3.select(this).classed('hover', true)
	                    var fmt = d3.time.format('%Y-%m-%d');
	                    dispatch.elementMouseover({
	                        value: d,
	                        text: d.toString() + ' - ' + d.duration() + ' ' + timeUnit,
	                        series: _(d.records).map(function(rec) {
	                            return {
	                                key: rec.eventName(),
	                                value: (rec.toNext()||0) + ' ' + timeUnit + ' ' +
	                                        fmt(rec.startDate()) ,
	                                color: color(rec.eventName())
	                            }
	                        }),
	                        e: d3.event
	                    });
	                })
	            var rects = tlnodes.selectAll('rect')
	                    .data(function(d) { return d.records }
	                            , function(d) { 
	                                return d.id() }
	                            )
	            rects.exit()
	                .transition()
	                .duration(1000)
	                .attr('width', 0)
	                .remove();
	            rects.enter()
	                .append('rect')
	                    .attr('height', lineHeight)
	                    .attr('width', 0)
	                    .attr('fill', function (d) {
	                        return color(d[eventNameProp])
	                    })
	            rects
	                .transition()
	                .duration(2000)
	                .attr('x', function (d,i) {
	                    //console.log(d[entityIdProp] + ' ' + d.EVENT + ' ' + d.startIdx())
	                    return xx(d) - (d.next() ? 0 : lineHeight);
	                })
	                .attr('width', function (d) {
	                    //console.log(d.timeline() + ' ' + d.EVENT + ' ' )
	                    var w = xDayScale(d.toNext()) || 0;
	                    if (w < 0 || isNaN(w)) throw new Error("wrong")
	                    //if (w > 10000) throw new Error("something going on?");
	                    if (w === 0) {
	                        d3.select(this)
	                            .attr('stroke-width',1)
	                            .attr('stroke','black')
	                            //.attr('rx', Math.max(lineHeight/2, 3))
	                            .attr('rx', lineHeight)
	                            .attr('height', lineHeight * 2)
	                            .attr('y', d3.select(this).attr('y') - lineHeight / 3)
	                        return lineHeight * 2;
	                    } else {
	                        return w;
	                    }
	                })
	            tlnodes
	                .transition()
	                .delay(2000)
	                .duration(2000)
	                    .attr('transform', function (d,i) {
	                        return 'translate(0,' + y(i) + ')'
	                    })
	            chart.dispatch.on('toggleEvt', function (evtName) {
	                evtName.disabled = !evtName.disabled;
	                var recs = _(data).filter(function(d) {
	                    return !eventNames.lookup(d[eventNameProp]).disabled;
	                });
	                timelineData = edata.makeTimelines(recs);
	            });
	            return;
	            rects
	                .on('mouseout', function (d, i) {
	                    d3.select(this).classed('hover', false);
	                    dispatch.elementMouseout({
	                        value: getY(d, i),
	                        point: d,
	                        series: data[d.series],
	                        pointIndex: i,
	                        seriesIndex: d.series,
	                        e: d3.event
	                    });
	                })
	                .on('click', function (d, i) {
	                    dispatch.elementClick({
	                        value: getY(d, i),
	                        point: d,
	                        series: data[d.series],
	                        pos: [
	                            x(getX(d, i)),
	                            y(getY(d, i)) + (y.rangeBand() * d.series + .5 / data.length)
	                        ], // TODO: Figure out why the value appears to be shifted
	                        pointIndex: i,
	                        seriesIndex: d.series,
	                        e: d3.event
	                    });
	                    d3.event.stopPropagation();
	                })
	                .on('dblclick', function (d, i) {
	                    dispatch.elementDblClick({
	                        value: getY(d, i),
	                        point: d,
	                        series: data[d.series],
	                        pos: [
	                            x(getX(d, i)),
	                            y(getY(d, i)) + (y.rangeBand() * d.series + .5 / data.length)
	                        ],
	                        pointIndex: i,
	                        seriesIndex: d.series,
	                        e: d3.event
	                    });
	                    d3.event.stopPropagation();
	                });


	        });
	        return chart;
	    }
	    function setEventNames(data) {
	        eventNames = enlightenedData.group(data, eventNameProp)
	                .sort(function(a,b) {
	                    return eventOrder.indexOf(a.toString()) -
	                           eventOrder.indexOf(b.toString())
	                });
	        if (eventOrder.length) {
	            if (_.difference(eventNames.rawValues(), eventOrder).length) {
	                throw new Error("found unexpected eventNames")
	            }
	        } else {
	            eventOrder = eventNames
	                            // this sort not tested
	                            .sortBy(function(d) { return d.records.length })
	                            .rawValues();
	        }
	        alignChoices = [new String('Start'),
	                        new String('End'),
	                        new String('Lifeflow'),
	                        new String('Icicle')
	                            ]
	                .concat(eventNames.map(function(d) { 
	                    return new String(d.valueOf())}));
	        _.each(alignChoices, function(d) { d.disabled = true });
	        alignChoices[0].disabled = false;
	        var evtColor = d3.scale.category20()
	            .domain(eventNames.rawValues().concat(['Start','End','Lifeflow','Icicle']));
	        chart.color(evtColor);
	    }

	    //============================================================
	    // Expose Public Variables
	    //------------------------------------------------------------

	    chart.dispatch = dispatch;

	    chart.entityIdProp = function (_) {
	        if (!arguments.length) return entityIdProp;
	        entityIdProp = _;
	        return chart;
	    };
	    chart.eventNameProp = function (_) {
	        if (!arguments.length) return eventNameProp;
	        eventNameProp = _;
	        return chart;
	    };
	    chart.eventOrder = function (_) {
	        if (!arguments.length) return eventOrder;
	        eventOrder = _;
	        return chart;
	    };
	    chart.startDateProp = function (_) {
	        if (!arguments.length) return startDateProp;
	        startDateProp = _;
	        return chart;
	    };
	    chart.endDateField = function (_) {
	        if (!arguments.length) return endDateField;
	        endDateField = _;
	        return chart;
	    };
	    chart.defaultDuration = function (_) {
	        if (!arguments.length) return defaultDuration;
	        defaultDuration = _;
	        return chart;
	    };
	    chart.margin = function (_) {
	        if (!arguments.length) return margin;
	        margin.top = typeof _.top != 'undefined' ? _.top : margin.top;
	        margin.right = typeof _.right != 'undefined' ? _.right : margin.right;
	        margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
	        margin.left = typeof _.left != 'undefined' ? _.left : margin.left;
	        return chart;
	    };

	    chart.eventNames = function (_) {
	        if (!arguments.length) return eventNames;
	        eventNames = _;
	        return chart;
	    };
	    chart.width = function (_) {
	        if (!arguments.length) return width;
	        width = _;
	        return chart;
	    };

	    chart.height = function (_) {
	        if (!arguments.length) return height;
	        height = _;
	        return chart;
	    };

	    chart.xScale = function (_) {
	        if (!arguments.length) return x;
	        x = _;
	        return chart;
	    };

	    chart.yScaleLinear = function (_) {
	        if (!arguments.length) return y;
	        y = _;
	        return chart;
	    };
	    chart.yScaleOrdinal = function (_) {
	        if (!arguments.length) return yOrd;
	        yOrd = _;
	        return chart;
	    };

	    chart.color = function (_) {
	        if (!arguments.length) return color;
	        color = _;
	        return chart;
	    };

	    chart.disabled = function (_) {
	        if (!arguments.length) return disabled;
	        disabled = _;
	        return chart;
	    };

	    chart.id = function (_) {
	        if (!arguments.length) return id;
	        id = _;
	        return chart;
	    };

	    chart.delay = function (_) {
	        if (!arguments.length) return delay;
	        delay = _;
	        return chart;
	    };

	    chart.showValues = function (_) {
	        if (!arguments.length) return showValues;
	        showValues = _;
	        return chart;
	    };

	    chart.valueFormat = function (_) {
	        if (!arguments.length) return valueFormat;
	        valueFormat = _;
	        return chart;
	    };

	    chart.valuePadding = function (_) {
	        if (!arguments.length) return valuePadding;
	        valuePadding = _;
	        return chart;
	    };

	    chart.controlsData = function (_) {
	        if (!arguments.length) return controlsData;
	        controlsData = _;
	        return chart;
	    };
	    chart.alignBy = function (_) {
	        if (!arguments.length) return alignBy;
	        alignBy = _;
	        return chart;
	    };
	    chart.level = function (_) {
	        if (!arguments.length) return level;
	        level = _;
	        return chart;
	    };
	    chart.evtData = function (_) {
	        if (!arguments.length) return edata;
	        edata = _;
	        return chart;
	    };
	    chart.alignChoices = function (_) {
	        if (!arguments.length) return alignChoices;
	        alignChoices = _;
	        return chart;
	    };
	    chart.timelineData = function (_) {
	        if (!arguments.length) return timelineData;
	        timelineData = _;
	        return chart;
	    };
	    chart.unitProp = function(_) {
	        if (!arguments.length) return unitProp;
	        unitProp = _;
	        timeUnit = 'units';
	        if (unitProp === 1) timeUnit = 'miliseconds';
	        if (unitProp === 1000) timeUnit = 'seconds';
	        if (unitProp === 1000*60) timeUnit = 'minutes';
	        if (unitProp === 1000*60*60) timeUnit = 'hours';
	        if (unitProp === 1000*60*60*24) timeUnit = 'days';
	        if (unitProp === 1000*60*60*24*7) timeUnit = 'weeks';
	        if (unitProp === 1000*60*60*24*365.25) timeUnit = 'years';
	        if (unitProp === 1000*60*60*24*365.25/12) timeUnit = 'months';
	        return chart;
	    };
	    chart.sort = function (_) {
	        if (!arguments.length) return sortParam;
	        sortParam = _;
	        return chart;
	    };

	    function makeGetterSetter(obj, prop) { // might be nice
	        // but lose the link to enclosed public vars
	        var closureVals = {};
	        obj[prop] = function (_) {
	            if (!arguments.length) console.log('getting ' + prop + ': ' + closureVals[prop]);
	            if (!arguments.length) return closureVals[prop];
	            console.log('setting ' + prop + ': ' + _);
	            closureVals[prop] = _;
	            return obj;
	        };
	    }
	    //============================================================


	    return chart;
	}


/***/ },
/* 7 */
/***/ function(module, exports, require) {

	'use strict';
	nv.models.timelinesChart = function () {
	    var HIDE_Y_AXIS = true;
	    //============================================================
	    // Public Variables with Default Settings
	    //------------------------------------------------------------
	    var timelines = timelineChart(),
	        xAxis = nv.models.axis(),
	        yAxis = nv.models.axis(),
	        tip = nv.models.tooltip().gravity('w').distance(23),
	        legendHeight = 15,
	        hideLegend = nv.models.legend()
	            .height(legendHeight)
	            .updateState(false)
	            .key(function(d) { return d.valueOf() })
	            .label('Hide'),
	        alignLegend = nv.models.legend().height(legendHeight)
	                        .updateState(false)
	                        .radioButtonMode(true)
	                        .label('Align')
	            .key(function(d) { return d.valueOf() })
	            ;

	    var margin = {
	            top: 25,
	            right: 20,
	            bottom: 0,
	            left: 60
	        }
	        , width = null
	        , height = null
	        , edata
	        , lifeflowNodes
	        , entities
	        , showLegend = true
	        , stacked = false
	        , tooltips = true
	        , state = {
	            stacked: stacked
	        }
	        , defaultState = null
	        , noData = 'No Data Available.'
	        , dispatch = d3.dispatch( 'tooltipShow', 'tooltipHide', 
	                'elementMouseover','elementMouseout',
	                'stateChange', 'changeState');
	    ;
	    //============================================================


	    //============================================================
	    // Private Variables
	    //------------------------------------------------------------

	    var showTooltip = function(e, offsetElement) {
	        tip
	            .gravity('e')
	            .position({ left: e.e.clientX, top: e.e.clientY })
	            .data(
	                {
	                    value: e.text,
	                    series: e.series
	                })();
	    };
	    var svgHead, svgChart, svgFoot;
	    //============================================================
	    var rangeLower = new Date('01/01/1980');
	    var rangeUpper = new Date('01/01/2030');
	    var enddateStuff = _.once(function (data) {
	        data.forEach(function (d) {
	            d.endDate = new Date(d[chart.endDateField()]);
	            if (!(d.endDate > rangeLower && d.endDate < rangeUpper)) {
	                d.endDate = null;
	            }
	        });
	    })

	    function chart(selection) {
	        selection.each(function (data) {
	            var container = d3.select(this),
	                that = this;

	            var chartFullWidth = (chart.width() || parseInt(container.style('width')) || 960),
	                chartGraphWidth = chartFullWidth - margin.left - margin.right,
	                chartFullHeight = (chart.height() || parseInt(container.style('height')) || 400),
	                chartGraphHeight = chartFullHeight - margin.top - margin.bottom;
	            chart.width(chartFullWidth);
	            chart.height(chartFullHeight);

	            if (!data || !data.length) {
	                var noDataText = container.selectAll('.nv-noData').data([noData]);
	                noDataText.enter().append('p')
	                    .attr('class', 'nvd3 nv-noData')
	                    .style('text-align', 'center')
	                    .style('top', '200px')
	                    .text(function (d) {
	                        return d
	                    });
	                return chart;
	            } else {
	                container.selectAll('.nv-noData').remove();
	            }
	            tlChart.xScale(d3.scale.linear().range([0, chartGraphWidth]));
	            tlChart.yScaleLinear(d3.scale.linear().range([0, chartGraphHeight]))
	            tlChart.yScaleOrdinal(d3.scale.ordinal().rangeBands([0, chartGraphHeight]))

	            // Setup containers and skeleton of chart
	            container.selectAll('svg.svg-head')
	                .data(['stub']).enter()
	                .append('svg').attr('class', 'svg-head')
	                    //.attr('width', availableWidth)
	                .attr('height', legendHeight * 3)
	            var svgHead = container.select('svg.svg-head');

	            var svgChart = container.selectAll('svg.svg-chart').data(['stub'])
	            var gEnter = svgChart.enter()
	                            .append('div')
	                                //.style('width', availableWidth)
	                                .style('height', chartFullHeight)
	                                .style('overflow-y', 'scroll')
	                            .append('svg').attr('class', 'svg-chart')
	                                //.attr('width', availableWidth)
	                                .attr('height', chartFullHeight)

	            gEnter.append('g').attr('class', 'nv-x nv-axis')
	            gEnter
	                .append('g').attr('class', 'nvd3 nv-wrap nv-evt-chart')

	            svgChart.select('g.nv-evt-chart')
	                    .attr('transform', 'translate(' + margin.left + ',' +
	                                margin.top + ')')
	                    .append('g').attr('class', 'nv-y nv-axis');

	            chart.update = function () {
	                container.call(chart)
	            };
	            chart.svgChart = this;
	            //------------------------------------------------------------
	            // Legend
	            var gHead = svgHead.selectAll('g').data(['stub']).enter().append('g')
	                .each(function (d) {
	                    var head = d3.select(this);
	                    head.append('g')
	                        .attr('class', 'nv-legendWrap evt-chart hide-legend')
	                    head.append('g')
	                        .attr('class', 'nv-legendWrap evt-chart align-legend')
	                        .attr('transform', 'translate(0,' + legendHeight + ')')
	                });
	            gHead.selectAll('g.nv-series')
	                .attr('evt-name', function (d) {
	                    return d.valueOf()
	                })


	            hideLegend.dispatch.on('legendClick', function (e, i) {
	                tlChart.dispatch.toggleEvt(e,i);
	                chart.update();
	            });

	            /*
	            hideLegend.dispatch.on('legendDblclick', function (d) {
	                //Double clicking should always enable current series, and disable all others.
	                data.forEach(function (d) { // broken
	                    d.disabled = true;
	                });
	                d.disabled = false;

	                //state.disabled = data.map(function(d) { return !!d.disabled });
	                dispatch.stateChange(state);
	                chart.update();
	            });
	            */
	            alignLegend.dispatch.on('legendClick', function (d, i) {
	                if (!!d.disabled) {
	                    tlChart.alignChoices().forEach(function (d) {
	                        d.disabled = true;
	                    });
	                    chart.alignBy(d.valueOf());
	                    d.disabled = false;
	                } else {
	                    d.disabled = true;
	                    // default is align by start
	                    tlChart.alignChoices()[0].disabled = false;
	                    chart.alignBy(tlChart.alignChoices()[0].valueOf());
	                }
	                chart.update();
	            });

	            //------------------------------------------------------------
	            //------------------------------------------------------------
	            // Main Chart Component(s)


	            tlChart 
	                //.disabled(data.map(function (series) { return series.disabled })) // commented out with no apparent effect
	                .width(chartGraphWidth)
	                .height(chartGraphHeight)
	            //.color(data.map(function(d,i) { return d.color || chart.color()(d, i); }) .filter(function(d,i) { return !data[i].disabled }))
	            svgChart.select('g.nv-evt-chart')
	                    .datum(data)
	                    //.transition()
	                    .call(tlChart);

	            hideLegend.color(tlChart.color());
	            alignLegend.color(tlChart.color());
	            hideLegend.width(chartFullWidth);
	            alignLegend.width(chartFullWidth);

	            svgHead.selectAll('g.hide-legend')
	                .data([tlChart.eventNames()])
	                .call(hideLegend);
	            svgHead.select('g.align-legend')
	                .data([tlChart.alignChoices()])
	                .call(alignLegend);
	            yAxis
	                .orient('left')
	                .tickPadding(5)
	                .highlightZero(false)
	                .showMaxMin(false)
	                //.tickFormat(d3.format('5,'))
	            //.tickFormat(function(d) { return d })
	            ;
	            xAxis
	                .orient('top')
	                .tickPadding(15)
	                .highlightZero(false)
	                .showMaxMin(false)
	            if (chart.alignBy()) {
	                xAxis.tickFormat(d3.format('5,'));
	            } else {
	                xAxis.tickFormat(d3.time.format('%Y'));
	            }

	            if (!HIDE_Y_AXIS) {
	                yAxis.scale(tlChart.yScaleOrdinal())
	                    .ticks(chartGraphHeight / 24)
	                    .tickSize(-chartFullWidth, 0);
	                d3.transition()
	                    .duration(2000)
	                    .each(function() {
	                        svgChart.select('.nv-y.nv-axis')
	                        .call(yAxis);
	                    });
	                var yTicks = svgChart.select('.nv-y.nv-axis').selectAll('g');
	                yTicks
	                    .selectAll('line, text')
	                    .style('opacity', 1)
	            }

	            xAxis.scale(tlChart.xScale())
	                .ticks(chartGraphWidth / 55)
	                .tickSize(-chartGraphHeight, 0)

	            svgChart.select('.nv-x.nv-axis')
	                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
	                .call(xAxis);
	            //============================================================
	            // Event Handling/Dispatching (in chart's scope)
	            //------------------------------------------------------------
	            // has to be in scope just because showTooltip is
	            dispatch.on('tooltipShow', function(e) {
	                if (tooltips) showTooltip(e, that.parentNode);
	            });

	            return;
	        });

	        return chart;
	    }
	    //===========================================================
	    // Event Handling/Dispatching (out of chart's scope)
	    //------------------------------------------------------------

	    tlChart.dispatch.on('elementMouseover.tooltip', function(e) {
	        //e.pos = [e.pos[0] +  margin.left, e.pos[1] + margin.top];
	        dispatch.tooltipShow(e);
	    });
	    tlChart.dispatch.on('elementMouseout.tooltip', function(e) {
	        dispatch.tooltipHide(e);
	    });
	    dispatch.on('tooltipHide', function() {
	        if (tooltips) nv.tooltip.cleanup();
	    });
	    //============================================================
	    // Expose Public Variables
	    //------------------------------------------------------------
	    // expose chart's sub-components
	    chart.dispatch = dispatch;
	    //chart.timelines = timelines;
	    //chart.legend = legend;
	    chart.yAxis = yAxis;
	    chart.xAxis = xAxis;

	    d3.rebind(chart, /*timelines, */ 'clipEdge', 'id', 'delay', 'showValues', 'valueFormat', 'barColor', 'entityIdProp', 'eventNameProp', 'eventOrder', 'startDateProp', 'endDateField', 'defaultDuration', 'color', 'eventNames', 'alignBy', 'xAxis', 'evtData','unitProp');
	    chart.margin = function (_) {
	        if (!arguments.length) return margin;
	        margin.top = typeof _.top != 'undefined' ? _.top : margin.top;
	        margin.right = typeof _.right != 'undefined' ? _.right : margin.right;
	        margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
	        margin.left = typeof _.left != 'undefined' ? _.left : margin.left;
	        return chart;
	    };

	    chart.width = function (_) {
	        if (!arguments.length) return width;
	        width = _;
	        return chart;
	    };

	    chart.height = function (_) {
	        if (!arguments.length) return height;
	        height = _;
	        return chart;
	    };

	    chart.showLegend = function (_) {
	        if (!arguments.length) return showLegend;
	        showLegend = _;
	        return chart;
	    };

	    chart.tooltips = function(_) {
	        if (!arguments.length) return tooltips;
	        tooltips = _;
	        return chart;
	    };

	    chart.state = function (_) {
	        if (!arguments.length) return state;
	        state = _;
	        return chart;
	    };

	    chart.defaultState = function (_) {
	        if (!arguments.length) return defaultState;
	        defaultState = _;
	        return chart;
	    };

	    chart.noData = function (_) {
	        if (!arguments.length) return noData;
	        noData = _;
	        return chart;
	    };

	    //============================================================


	    return chart;
	}


/***/ },
/* 8 */
/***/ function(module, exports, require) {

	/* WEBPACK VAR INJECTION */(function(require, module) {var __WEBPACK_AMD_DEFINE_RESULT__;//! moment.js
	//! version : 2.5.1
	//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
	//! license : MIT
	//! momentjs.com

	(function (undefined) {

	    /************************************
	        Constants
	    ************************************/

	    var moment,
	        VERSION = "2.5.1",
	        global = this,
	        round = Math.round,
	        i,

	        YEAR = 0,
	        MONTH = 1,
	        DATE = 2,
	        HOUR = 3,
	        MINUTE = 4,
	        SECOND = 5,
	        MILLISECOND = 6,

	        // internal storage for language config files
	        languages = {},

	        // moment internal properties
	        momentProperties = {
	            _isAMomentObject: null,
	            _i : null,
	            _f : null,
	            _l : null,
	            _strict : null,
	            _isUTC : null,
	            _offset : null,  // optional. Combine with _isUTC
	            _pf : null,
	            _lang : null  // optional
	        },

	        // check for nodeJS
	        hasModule = (typeof module !== 'undefined' && module.exports && 'function' !== 'undefined'),

	        // ASP.NET json date format regex
	        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
	        aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,

	        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
	        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
	        isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,

	        // format tokens
	        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g,
	        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,

	        // parsing token regexes
	        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
	        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
	        parseTokenOneToFourDigits = /\d{1,4}/, // 0 - 9999
	        parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
	        parseTokenDigits = /\d+/, // nonzero number of digits
	        parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.
	        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
	        parseTokenT = /T/i, // T (ISO separator)
	        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123

	        //strict parsing regexes
	        parseTokenOneDigit = /\d/, // 0 - 9
	        parseTokenTwoDigits = /\d\d/, // 00 - 99
	        parseTokenThreeDigits = /\d{3}/, // 000 - 999
	        parseTokenFourDigits = /\d{4}/, // 0000 - 9999
	        parseTokenSixDigits = /[+-]?\d{6}/, // -999,999 - 999,999
	        parseTokenSignedNumber = /[+-]?\d+/, // -inf - inf

	        // iso 8601 regex
	        // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
	        isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,

	        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

	        isoDates = [
	            ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
	            ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
	            ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
	            ['GGGG-[W]WW', /\d{4}-W\d{2}/],
	            ['YYYY-DDD', /\d{4}-\d{3}/]
	        ],

	        // iso time formats and regexes
	        isoTimes = [
	            ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d{1,3}/],
	            ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
	            ['HH:mm', /(T| )\d\d:\d\d/],
	            ['HH', /(T| )\d\d/]
	        ],

	        // timezone chunker "+10:00" > ["10", "00"] or "-1530" > ["-15", "30"]
	        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

	        // getter and setter names
	        proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
	        unitMillisecondFactors = {
	            'Milliseconds' : 1,
	            'Seconds' : 1e3,
	            'Minutes' : 6e4,
	            'Hours' : 36e5,
	            'Days' : 864e5,
	            'Months' : 2592e6,
	            'Years' : 31536e6
	        },

	        unitAliases = {
	            ms : 'millisecond',
	            s : 'second',
	            m : 'minute',
	            h : 'hour',
	            d : 'day',
	            D : 'date',
	            w : 'week',
	            W : 'isoWeek',
	            M : 'month',
	            y : 'year',
	            DDD : 'dayOfYear',
	            e : 'weekday',
	            E : 'isoWeekday',
	            gg: 'weekYear',
	            GG: 'isoWeekYear'
	        },

	        camelFunctions = {
	            dayofyear : 'dayOfYear',
	            isoweekday : 'isoWeekday',
	            isoweek : 'isoWeek',
	            weekyear : 'weekYear',
	            isoweekyear : 'isoWeekYear'
	        },

	        // format function strings
	        formatFunctions = {},

	        // tokens to ordinalize and pad
	        ordinalizeTokens = 'DDD w W M D d'.split(' '),
	        paddedTokens = 'M D H h m s w W'.split(' '),

	        formatTokenFunctions = {
	            M    : function () {
	                return this.month() + 1;
	            },
	            MMM  : function (format) {
	                return this.lang().monthsShort(this, format);
	            },
	            MMMM : function (format) {
	                return this.lang().months(this, format);
	            },
	            D    : function () {
	                return this.date();
	            },
	            DDD  : function () {
	                return this.dayOfYear();
	            },
	            d    : function () {
	                return this.day();
	            },
	            dd   : function (format) {
	                return this.lang().weekdaysMin(this, format);
	            },
	            ddd  : function (format) {
	                return this.lang().weekdaysShort(this, format);
	            },
	            dddd : function (format) {
	                return this.lang().weekdays(this, format);
	            },
	            w    : function () {
	                return this.week();
	            },
	            W    : function () {
	                return this.isoWeek();
	            },
	            YY   : function () {
	                return leftZeroFill(this.year() % 100, 2);
	            },
	            YYYY : function () {
	                return leftZeroFill(this.year(), 4);
	            },
	            YYYYY : function () {
	                return leftZeroFill(this.year(), 5);
	            },
	            YYYYYY : function () {
	                var y = this.year(), sign = y >= 0 ? '+' : '-';
	                return sign + leftZeroFill(Math.abs(y), 6);
	            },
	            gg   : function () {
	                return leftZeroFill(this.weekYear() % 100, 2);
	            },
	            gggg : function () {
	                return leftZeroFill(this.weekYear(), 4);
	            },
	            ggggg : function () {
	                return leftZeroFill(this.weekYear(), 5);
	            },
	            GG   : function () {
	                return leftZeroFill(this.isoWeekYear() % 100, 2);
	            },
	            GGGG : function () {
	                return leftZeroFill(this.isoWeekYear(), 4);
	            },
	            GGGGG : function () {
	                return leftZeroFill(this.isoWeekYear(), 5);
	            },
	            e : function () {
	                return this.weekday();
	            },
	            E : function () {
	                return this.isoWeekday();
	            },
	            a    : function () {
	                return this.lang().meridiem(this.hours(), this.minutes(), true);
	            },
	            A    : function () {
	                return this.lang().meridiem(this.hours(), this.minutes(), false);
	            },
	            H    : function () {
	                return this.hours();
	            },
	            h    : function () {
	                return this.hours() % 12 || 12;
	            },
	            m    : function () {
	                return this.minutes();
	            },
	            s    : function () {
	                return this.seconds();
	            },
	            S    : function () {
	                return toInt(this.milliseconds() / 100);
	            },
	            SS   : function () {
	                return leftZeroFill(toInt(this.milliseconds() / 10), 2);
	            },
	            SSS  : function () {
	                return leftZeroFill(this.milliseconds(), 3);
	            },
	            SSSS : function () {
	                return leftZeroFill(this.milliseconds(), 3);
	            },
	            Z    : function () {
	                var a = -this.zone(),
	                    b = "+";
	                if (a < 0) {
	                    a = -a;
	                    b = "-";
	                }
	                return b + leftZeroFill(toInt(a / 60), 2) + ":" + leftZeroFill(toInt(a) % 60, 2);
	            },
	            ZZ   : function () {
	                var a = -this.zone(),
	                    b = "+";
	                if (a < 0) {
	                    a = -a;
	                    b = "-";
	                }
	                return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
	            },
	            z : function () {
	                return this.zoneAbbr();
	            },
	            zz : function () {
	                return this.zoneName();
	            },
	            X    : function () {
	                return this.unix();
	            },
	            Q : function () {
	                return this.quarter();
	            }
	        },

	        lists = ['months', 'monthsShort', 'weekdays', 'weekdaysShort', 'weekdaysMin'];

	    function defaultParsingFlags() {
	        // We need to deep clone this object, and es5 standard is not very
	        // helpful.
	        return {
	            empty : false,
	            unusedTokens : [],
	            unusedInput : [],
	            overflow : -2,
	            charsLeftOver : 0,
	            nullInput : false,
	            invalidMonth : null,
	            invalidFormat : false,
	            userInvalidated : false,
	            iso: false
	        };
	    }

	    function padToken(func, count) {
	        return function (a) {
	            return leftZeroFill(func.call(this, a), count);
	        };
	    }
	    function ordinalizeToken(func, period) {
	        return function (a) {
	            return this.lang().ordinal(func.call(this, a), period);
	        };
	    }

	    while (ordinalizeTokens.length) {
	        i = ordinalizeTokens.pop();
	        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
	    }
	    while (paddedTokens.length) {
	        i = paddedTokens.pop();
	        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
	    }
	    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


	    /************************************
	        Constructors
	    ************************************/

	    function Language() {

	    }

	    // Moment prototype object
	    function Moment(config) {
	        checkOverflow(config);
	        extend(this, config);
	    }

	    // Duration Constructor
	    function Duration(duration) {
	        var normalizedInput = normalizeObjectUnits(duration),
	            years = normalizedInput.year || 0,
	            months = normalizedInput.month || 0,
	            weeks = normalizedInput.week || 0,
	            days = normalizedInput.day || 0,
	            hours = normalizedInput.hour || 0,
	            minutes = normalizedInput.minute || 0,
	            seconds = normalizedInput.second || 0,
	            milliseconds = normalizedInput.millisecond || 0;

	        // representation for dateAddRemove
	        this._milliseconds = +milliseconds +
	            seconds * 1e3 + // 1000
	            minutes * 6e4 + // 1000 * 60
	            hours * 36e5; // 1000 * 60 * 60
	        // Because of dateAddRemove treats 24 hours as different from a
	        // day when working around DST, we need to store them separately
	        this._days = +days +
	            weeks * 7;
	        // It is impossible translate months into days without knowing
	        // which months you are are talking about, so we have to store
	        // it separately.
	        this._months = +months +
	            years * 12;

	        this._data = {};

	        this._bubble();
	    }

	    /************************************
	        Helpers
	    ************************************/


	    function extend(a, b) {
	        for (var i in b) {
	            if (b.hasOwnProperty(i)) {
	                a[i] = b[i];
	            }
	        }

	        if (b.hasOwnProperty("toString")) {
	            a.toString = b.toString;
	        }

	        if (b.hasOwnProperty("valueOf")) {
	            a.valueOf = b.valueOf;
	        }

	        return a;
	    }

	    function cloneMoment(m) {
	        var result = {}, i;
	        for (i in m) {
	            if (m.hasOwnProperty(i) && momentProperties.hasOwnProperty(i)) {
	                result[i] = m[i];
	            }
	        }

	        return result;
	    }

	    function absRound(number) {
	        if (number < 0) {
	            return Math.ceil(number);
	        } else {
	            return Math.floor(number);
	        }
	    }

	    // left zero fill a number
	    // see http://jsperf.com/left-zero-filling for performance comparison
	    function leftZeroFill(number, targetLength, forceSign) {
	        var output = '' + Math.abs(number),
	            sign = number >= 0;

	        while (output.length < targetLength) {
	            output = '0' + output;
	        }
	        return (sign ? (forceSign ? '+' : '') : '-') + output;
	    }

	    // helper function for _.addTime and _.subtractTime
	    function addOrSubtractDurationFromMoment(mom, duration, isAdding, ignoreUpdateOffset) {
	        var milliseconds = duration._milliseconds,
	            days = duration._days,
	            months = duration._months,
	            minutes,
	            hours;

	        if (milliseconds) {
	            mom._d.setTime(+mom._d + milliseconds * isAdding);
	        }
	        // store the minutes and hours so we can restore them
	        if (days || months) {
	            minutes = mom.minute();
	            hours = mom.hour();
	        }
	        if (days) {
	            mom.date(mom.date() + days * isAdding);
	        }
	        if (months) {
	            mom.month(mom.month() + months * isAdding);
	        }
	        if (milliseconds && !ignoreUpdateOffset) {
	            moment.updateOffset(mom);
	        }
	        // restore the minutes and hours after possibly changing dst
	        if (days || months) {
	            mom.minute(minutes);
	            mom.hour(hours);
	        }
	    }

	    // check if is an array
	    function isArray(input) {
	        return Object.prototype.toString.call(input) === '[object Array]';
	    }

	    function isDate(input) {
	        return  Object.prototype.toString.call(input) === '[object Date]' ||
	                input instanceof Date;
	    }

	    // compare two arrays, return the number of differences
	    function compareArrays(array1, array2, dontConvert) {
	        var len = Math.min(array1.length, array2.length),
	            lengthDiff = Math.abs(array1.length - array2.length),
	            diffs = 0,
	            i;
	        for (i = 0; i < len; i++) {
	            if ((dontConvert && array1[i] !== array2[i]) ||
	                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
	                diffs++;
	            }
	        }
	        return diffs + lengthDiff;
	    }

	    function normalizeUnits(units) {
	        if (units) {
	            var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
	            units = unitAliases[units] || camelFunctions[lowered] || lowered;
	        }
	        return units;
	    }

	    function normalizeObjectUnits(inputObject) {
	        var normalizedInput = {},
	            normalizedProp,
	            prop;

	        for (prop in inputObject) {
	            if (inputObject.hasOwnProperty(prop)) {
	                normalizedProp = normalizeUnits(prop);
	                if (normalizedProp) {
	                    normalizedInput[normalizedProp] = inputObject[prop];
	                }
	            }
	        }

	        return normalizedInput;
	    }

	    function makeList(field) {
	        var count, setter;

	        if (field.indexOf('week') === 0) {
	            count = 7;
	            setter = 'day';
	        }
	        else if (field.indexOf('month') === 0) {
	            count = 12;
	            setter = 'month';
	        }
	        else {
	            return;
	        }

	        moment[field] = function (format, index) {
	            var i, getter,
	                method = moment.fn._lang[field],
	                results = [];

	            if (typeof format === 'number') {
	                index = format;
	                format = undefined;
	            }

	            getter = function (i) {
	                var m = moment().utc().set(setter, i);
	                return method.call(moment.fn._lang, m, format || '');
	            };

	            if (index != null) {
	                return getter(index);
	            }
	            else {
	                for (i = 0; i < count; i++) {
	                    results.push(getter(i));
	                }
	                return results;
	            }
	        };
	    }

	    function toInt(argumentForCoercion) {
	        var coercedNumber = +argumentForCoercion,
	            value = 0;

	        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
	            if (coercedNumber >= 0) {
	                value = Math.floor(coercedNumber);
	            } else {
	                value = Math.ceil(coercedNumber);
	            }
	        }

	        return value;
	    }

	    function daysInMonth(year, month) {
	        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
	    }

	    function daysInYear(year) {
	        return isLeapYear(year) ? 366 : 365;
	    }

	    function isLeapYear(year) {
	        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	    }

	    function checkOverflow(m) {
	        var overflow;
	        if (m._a && m._pf.overflow === -2) {
	            overflow =
	                m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH :
	                m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE :
	                m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR :
	                m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE :
	                m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND :
	                m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND :
	                -1;

	            if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
	                overflow = DATE;
	            }

	            m._pf.overflow = overflow;
	        }
	    }

	    function isValid(m) {
	        if (m._isValid == null) {
	            m._isValid = !isNaN(m._d.getTime()) &&
	                m._pf.overflow < 0 &&
	                !m._pf.empty &&
	                !m._pf.invalidMonth &&
	                !m._pf.nullInput &&
	                !m._pf.invalidFormat &&
	                !m._pf.userInvalidated;

	            if (m._strict) {
	                m._isValid = m._isValid &&
	                    m._pf.charsLeftOver === 0 &&
	                    m._pf.unusedTokens.length === 0;
	            }
	        }
	        return m._isValid;
	    }

	    function normalizeLanguage(key) {
	        return key ? key.toLowerCase().replace('_', '-') : key;
	    }

	    // Return a moment from input, that is local/utc/zone equivalent to model.
	    function makeAs(input, model) {
	        return model._isUTC ? moment(input).zone(model._offset || 0) :
	            moment(input).local();
	    }

	    /************************************
	        Languages
	    ************************************/


	    extend(Language.prototype, {

	        set : function (config) {
	            var prop, i;
	            for (i in config) {
	                prop = config[i];
	                if (typeof prop === 'function') {
	                    this[i] = prop;
	                } else {
	                    this['_' + i] = prop;
	                }
	            }
	        },

	        _months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
	        months : function (m) {
	            return this._months[m.month()];
	        },

	        _monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
	        monthsShort : function (m) {
	            return this._monthsShort[m.month()];
	        },

	        monthsParse : function (monthName) {
	            var i, mom, regex;

	            if (!this._monthsParse) {
	                this._monthsParse = [];
	            }

	            for (i = 0; i < 12; i++) {
	                // make the regex if we don't have it already
	                if (!this._monthsParse[i]) {
	                    mom = moment.utc([2000, i]);
	                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
	                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
	                }
	                // test the regex
	                if (this._monthsParse[i].test(monthName)) {
	                    return i;
	                }
	            }
	        },

	        _weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
	        weekdays : function (m) {
	            return this._weekdays[m.day()];
	        },

	        _weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
	        weekdaysShort : function (m) {
	            return this._weekdaysShort[m.day()];
	        },

	        _weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
	        weekdaysMin : function (m) {
	            return this._weekdaysMin[m.day()];
	        },

	        weekdaysParse : function (weekdayName) {
	            var i, mom, regex;

	            if (!this._weekdaysParse) {
	                this._weekdaysParse = [];
	            }

	            for (i = 0; i < 7; i++) {
	                // make the regex if we don't have it already
	                if (!this._weekdaysParse[i]) {
	                    mom = moment([2000, 1]).day(i);
	                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
	                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
	                }
	                // test the regex
	                if (this._weekdaysParse[i].test(weekdayName)) {
	                    return i;
	                }
	            }
	        },

	        _longDateFormat : {
	            LT : "h:mm A",
	            L : "MM/DD/YYYY",
	            LL : "MMMM D YYYY",
	            LLL : "MMMM D YYYY LT",
	            LLLL : "dddd, MMMM D YYYY LT"
	        },
	        longDateFormat : function (key) {
	            var output = this._longDateFormat[key];
	            if (!output && this._longDateFormat[key.toUpperCase()]) {
	                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
	                    return val.slice(1);
	                });
	                this._longDateFormat[key] = output;
	            }
	            return output;
	        },

	        isPM : function (input) {
	            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
	            // Using charAt should be more compatible.
	            return ((input + '').toLowerCase().charAt(0) === 'p');
	        },

	        _meridiemParse : /[ap]\.?m?\.?/i,
	        meridiem : function (hours, minutes, isLower) {
	            if (hours > 11) {
	                return isLower ? 'pm' : 'PM';
	            } else {
	                return isLower ? 'am' : 'AM';
	            }
	        },

	        _calendar : {
	            sameDay : '[Today at] LT',
	            nextDay : '[Tomorrow at] LT',
	            nextWeek : 'dddd [at] LT',
	            lastDay : '[Yesterday at] LT',
	            lastWeek : '[Last] dddd [at] LT',
	            sameElse : 'L'
	        },
	        calendar : function (key, mom) {
	            var output = this._calendar[key];
	            return typeof output === 'function' ? output.apply(mom) : output;
	        },

	        _relativeTime : {
	            future : "in %s",
	            past : "%s ago",
	            s : "a few seconds",
	            m : "a minute",
	            mm : "%d minutes",
	            h : "an hour",
	            hh : "%d hours",
	            d : "a day",
	            dd : "%d days",
	            M : "a month",
	            MM : "%d months",
	            y : "a year",
	            yy : "%d years"
	        },
	        relativeTime : function (number, withoutSuffix, string, isFuture) {
	            var output = this._relativeTime[string];
	            return (typeof output === 'function') ?
	                output(number, withoutSuffix, string, isFuture) :
	                output.replace(/%d/i, number);
	        },
	        pastFuture : function (diff, output) {
	            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
	            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
	        },

	        ordinal : function (number) {
	            return this._ordinal.replace("%d", number);
	        },
	        _ordinal : "%d",

	        preparse : function (string) {
	            return string;
	        },

	        postformat : function (string) {
	            return string;
	        },

	        week : function (mom) {
	            return weekOfYear(mom, this._week.dow, this._week.doy).week;
	        },

	        _week : {
	            dow : 0, // Sunday is the first day of the week.
	            doy : 6  // The week that contains Jan 1st is the first week of the year.
	        },

	        _invalidDate: 'Invalid date',
	        invalidDate: function () {
	            return this._invalidDate;
	        }
	    });

	    // Loads a language definition into the `languages` cache.  The function
	    // takes a key and optionally values.  If not in the browser and no values
	    // are provided, it will load the language file module.  As a convenience,
	    // this function also returns the language values.
	    function loadLang(key, values) {
	        values.abbr = key;
	        if (!languages[key]) {
	            languages[key] = new Language();
	        }
	        languages[key].set(values);
	        return languages[key];
	    }

	    // Remove a language from the `languages` cache. Mostly useful in tests.
	    function unloadLang(key) {
	        delete languages[key];
	    }

	    // Determines which language definition to use and returns it.
	    //
	    // With no parameters, it will return the global language.  If you
	    // pass in a language key, such as 'en', it will return the
	    // definition for 'en', so long as 'en' has already been loaded using
	    // moment.lang.
	    function getLangDefinition(key) {
	        var i = 0, j, lang, next, split,
	            get = function (k) {
	                if (!languages[k] && hasModule) {
	                    try {
	                        require(10)("./" + k);
	                    } catch (e) { }
	                }
	                return languages[k];
	            };

	        if (!key) {
	            return moment.fn._lang;
	        }

	        if (!isArray(key)) {
	            //short-circuit everything else
	            lang = get(key);
	            if (lang) {
	                return lang;
	            }
	            key = [key];
	        }

	        //pick the language from the array
	        //try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
	        //substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
	        while (i < key.length) {
	            split = normalizeLanguage(key[i]).split('-');
	            j = split.length;
	            next = normalizeLanguage(key[i + 1]);
	            next = next ? next.split('-') : null;
	            while (j > 0) {
	                lang = get(split.slice(0, j).join('-'));
	                if (lang) {
	                    return lang;
	                }
	                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
	                    //the next array item is better than a shallower substring of this one
	                    break;
	                }
	                j--;
	            }
	            i++;
	        }
	        return moment.fn._lang;
	    }

	    /************************************
	        Formatting
	    ************************************/


	    function removeFormattingTokens(input) {
	        if (input.match(/\[[\s\S]/)) {
	            return input.replace(/^\[|\]$/g, "");
	        }
	        return input.replace(/\\/g, "");
	    }

	    function makeFormatFunction(format) {
	        var array = format.match(formattingTokens), i, length;

	        for (i = 0, length = array.length; i < length; i++) {
	            if (formatTokenFunctions[array[i]]) {
	                array[i] = formatTokenFunctions[array[i]];
	            } else {
	                array[i] = removeFormattingTokens(array[i]);
	            }
	        }

	        return function (mom) {
	            var output = "";
	            for (i = 0; i < length; i++) {
	                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
	            }
	            return output;
	        };
	    }

	    // format date using native date object
	    function formatMoment(m, format) {

	        if (!m.isValid()) {
	            return m.lang().invalidDate();
	        }

	        format = expandFormat(format, m.lang());

	        if (!formatFunctions[format]) {
	            formatFunctions[format] = makeFormatFunction(format);
	        }

	        return formatFunctions[format](m);
	    }

	    function expandFormat(format, lang) {
	        var i = 5;

	        function replaceLongDateFormatTokens(input) {
	            return lang.longDateFormat(input) || input;
	        }

	        localFormattingTokens.lastIndex = 0;
	        while (i >= 0 && localFormattingTokens.test(format)) {
	            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
	            localFormattingTokens.lastIndex = 0;
	            i -= 1;
	        }

	        return format;
	    }


	    /************************************
	        Parsing
	    ************************************/


	    // get the regex to find the next token
	    function getParseRegexForToken(token, config) {
	        var a, strict = config._strict;
	        switch (token) {
	        case 'DDDD':
	            return parseTokenThreeDigits;
	        case 'YYYY':
	        case 'GGGG':
	        case 'gggg':
	            return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
	        case 'Y':
	        case 'G':
	        case 'g':
	            return parseTokenSignedNumber;
	        case 'YYYYYY':
	        case 'YYYYY':
	        case 'GGGGG':
	        case 'ggggg':
	            return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
	        case 'S':
	            if (strict) { return parseTokenOneDigit; }
	            /* falls through */
	        case 'SS':
	            if (strict) { return parseTokenTwoDigits; }
	            /* falls through */
	        case 'SSS':
	            if (strict) { return parseTokenThreeDigits; }
	            /* falls through */
	        case 'DDD':
	            return parseTokenOneToThreeDigits;
	        case 'MMM':
	        case 'MMMM':
	        case 'dd':
	        case 'ddd':
	        case 'dddd':
	            return parseTokenWord;
	        case 'a':
	        case 'A':
	            return getLangDefinition(config._l)._meridiemParse;
	        case 'X':
	            return parseTokenTimestampMs;
	        case 'Z':
	        case 'ZZ':
	            return parseTokenTimezone;
	        case 'T':
	            return parseTokenT;
	        case 'SSSS':
	            return parseTokenDigits;
	        case 'MM':
	        case 'DD':
	        case 'YY':
	        case 'GG':
	        case 'gg':
	        case 'HH':
	        case 'hh':
	        case 'mm':
	        case 'ss':
	        case 'ww':
	        case 'WW':
	            return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
	        case 'M':
	        case 'D':
	        case 'd':
	        case 'H':
	        case 'h':
	        case 'm':
	        case 's':
	        case 'w':
	        case 'W':
	        case 'e':
	        case 'E':
	            return parseTokenOneOrTwoDigits;
	        default :
	            a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), "i"));
	            return a;
	        }
	    }

	    function timezoneMinutesFromString(string) {
	        string = string || "";
	        var possibleTzMatches = (string.match(parseTokenTimezone) || []),
	            tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],
	            parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
	            minutes = +(parts[1] * 60) + toInt(parts[2]);

	        return parts[0] === '+' ? -minutes : minutes;
	    }

	    // function to convert string input to date
	    function addTimeToArrayFromToken(token, input, config) {
	        var a, datePartArray = config._a;

	        switch (token) {
	        // MONTH
	        case 'M' : // fall through to MM
	        case 'MM' :
	            if (input != null) {
	                datePartArray[MONTH] = toInt(input) - 1;
	            }
	            break;
	        case 'MMM' : // fall through to MMMM
	        case 'MMMM' :
	            a = getLangDefinition(config._l).monthsParse(input);
	            // if we didn't find a month name, mark the date as invalid.
	            if (a != null) {
	                datePartArray[MONTH] = a;
	            } else {
	                config._pf.invalidMonth = input;
	            }
	            break;
	        // DAY OF MONTH
	        case 'D' : // fall through to DD
	        case 'DD' :
	            if (input != null) {
	                datePartArray[DATE] = toInt(input);
	            }
	            break;
	        // DAY OF YEAR
	        case 'DDD' : // fall through to DDDD
	        case 'DDDD' :
	            if (input != null) {
	                config._dayOfYear = toInt(input);
	            }

	            break;
	        // YEAR
	        case 'YY' :
	            datePartArray[YEAR] = toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
	            break;
	        case 'YYYY' :
	        case 'YYYYY' :
	        case 'YYYYYY' :
	            datePartArray[YEAR] = toInt(input);
	            break;
	        // AM / PM
	        case 'a' : // fall through to A
	        case 'A' :
	            config._isPm = getLangDefinition(config._l).isPM(input);
	            break;
	        // 24 HOUR
	        case 'H' : // fall through to hh
	        case 'HH' : // fall through to hh
	        case 'h' : // fall through to hh
	        case 'hh' :
	            datePartArray[HOUR] = toInt(input);
	            break;
	        // MINUTE
	        case 'm' : // fall through to mm
	        case 'mm' :
	            datePartArray[MINUTE] = toInt(input);
	            break;
	        // SECOND
	        case 's' : // fall through to ss
	        case 'ss' :
	            datePartArray[SECOND] = toInt(input);
	            break;
	        // MILLISECOND
	        case 'S' :
	        case 'SS' :
	        case 'SSS' :
	        case 'SSSS' :
	            datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
	            break;
	        // UNIX TIMESTAMP WITH MS
	        case 'X':
	            config._d = new Date(parseFloat(input) * 1000);
	            break;
	        // TIMEZONE
	        case 'Z' : // fall through to ZZ
	        case 'ZZ' :
	            config._useUTC = true;
	            config._tzm = timezoneMinutesFromString(input);
	            break;
	        case 'w':
	        case 'ww':
	        case 'W':
	        case 'WW':
	        case 'd':
	        case 'dd':
	        case 'ddd':
	        case 'dddd':
	        case 'e':
	        case 'E':
	            token = token.substr(0, 1);
	            /* falls through */
	        case 'gg':
	        case 'gggg':
	        case 'GG':
	        case 'GGGG':
	        case 'GGGGG':
	            token = token.substr(0, 2);
	            if (input) {
	                config._w = config._w || {};
	                config._w[token] = input;
	            }
	            break;
	        }
	    }

	    // convert an array to a date.
	    // the array should mirror the parameters below
	    // note: all values past the year are optional and will default to the lowest possible value.
	    // [year, month, day , hour, minute, second, millisecond]
	    function dateFromConfig(config) {
	        var i, date, input = [], currentDate,
	            yearToUse, fixYear, w, temp, lang, weekday, week;

	        if (config._d) {
	            return;
	        }

	        currentDate = currentDateArray(config);

	        //compute day of the year from weeks and weekdays
	        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
	            fixYear = function (val) {
	                var int_val = parseInt(val, 10);
	                return val ?
	                  (val.length < 3 ? (int_val > 68 ? 1900 + int_val : 2000 + int_val) : int_val) :
	                  (config._a[YEAR] == null ? moment().weekYear() : config._a[YEAR]);
	            };

	            w = config._w;
	            if (w.GG != null || w.W != null || w.E != null) {
	                temp = dayOfYearFromWeeks(fixYear(w.GG), w.W || 1, w.E, 4, 1);
	            }
	            else {
	                lang = getLangDefinition(config._l);
	                weekday = w.d != null ?  parseWeekday(w.d, lang) :
	                  (w.e != null ?  parseInt(w.e, 10) + lang._week.dow : 0);

	                week = parseInt(w.w, 10) || 1;

	                //if we're parsing 'd', then the low day numbers may be next week
	                if (w.d != null && weekday < lang._week.dow) {
	                    week++;
	                }

	                temp = dayOfYearFromWeeks(fixYear(w.gg), week, weekday, lang._week.doy, lang._week.dow);
	            }

	            config._a[YEAR] = temp.year;
	            config._dayOfYear = temp.dayOfYear;
	        }

	        //if the day of the year is set, figure out what it is
	        if (config._dayOfYear) {
	            yearToUse = config._a[YEAR] == null ? currentDate[YEAR] : config._a[YEAR];

	            if (config._dayOfYear > daysInYear(yearToUse)) {
	                config._pf._overflowDayOfYear = true;
	            }

	            date = makeUTCDate(yearToUse, 0, config._dayOfYear);
	            config._a[MONTH] = date.getUTCMonth();
	            config._a[DATE] = date.getUTCDate();
	        }

	        // Default to current date.
	        // * if no year, month, day of month are given, default to today
	        // * if day of month is given, default month and year
	        // * if month is given, default only year
	        // * if year is given, don't default anything
	        for (i = 0; i < 3 && config._a[i] == null; ++i) {
	            config._a[i] = input[i] = currentDate[i];
	        }

	        // Zero out whatever was not defaulted, including time
	        for (; i < 7; i++) {
	            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
	        }

	        // add the offsets to the time to be parsed so that we can have a clean array for checking isValid
	        input[HOUR] += toInt((config._tzm || 0) / 60);
	        input[MINUTE] += toInt((config._tzm || 0) % 60);

	        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
	    }

	    function dateFromObject(config) {
	        var normalizedInput;

	        if (config._d) {
	            return;
	        }

	        normalizedInput = normalizeObjectUnits(config._i);
	        config._a = [
	            normalizedInput.year,
	            normalizedInput.month,
	            normalizedInput.day,
	            normalizedInput.hour,
	            normalizedInput.minute,
	            normalizedInput.second,
	            normalizedInput.millisecond
	        ];

	        dateFromConfig(config);
	    }

	    function currentDateArray(config) {
	        var now = new Date();
	        if (config._useUTC) {
	            return [
	                now.getUTCFullYear(),
	                now.getUTCMonth(),
	                now.getUTCDate()
	            ];
	        } else {
	            return [now.getFullYear(), now.getMonth(), now.getDate()];
	        }
	    }

	    // date from string and format string
	    function makeDateFromStringAndFormat(config) {

	        config._a = [];
	        config._pf.empty = true;

	        // This array is used to make a Date, either with `new Date` or `Date.UTC`
	        var lang = getLangDefinition(config._l),
	            string = '' + config._i,
	            i, parsedInput, tokens, token, skipped,
	            stringLength = string.length,
	            totalParsedInputLength = 0;

	        tokens = expandFormat(config._f, lang).match(formattingTokens) || [];

	        for (i = 0; i < tokens.length; i++) {
	            token = tokens[i];
	            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
	            if (parsedInput) {
	                skipped = string.substr(0, string.indexOf(parsedInput));
	                if (skipped.length > 0) {
	                    config._pf.unusedInput.push(skipped);
	                }
	                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
	                totalParsedInputLength += parsedInput.length;
	            }
	            // don't parse if it's not a known token
	            if (formatTokenFunctions[token]) {
	                if (parsedInput) {
	                    config._pf.empty = false;
	                }
	                else {
	                    config._pf.unusedTokens.push(token);
	                }
	                addTimeToArrayFromToken(token, parsedInput, config);
	            }
	            else if (config._strict && !parsedInput) {
	                config._pf.unusedTokens.push(token);
	            }
	        }

	        // add remaining unparsed input length to the string
	        config._pf.charsLeftOver = stringLength - totalParsedInputLength;
	        if (string.length > 0) {
	            config._pf.unusedInput.push(string);
	        }

	        // handle am pm
	        if (config._isPm && config._a[HOUR] < 12) {
	            config._a[HOUR] += 12;
	        }
	        // if is 12 am, change hours to 0
	        if (config._isPm === false && config._a[HOUR] === 12) {
	            config._a[HOUR] = 0;
	        }

	        dateFromConfig(config);
	        checkOverflow(config);
	    }

	    function unescapeFormat(s) {
	        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
	            return p1 || p2 || p3 || p4;
	        });
	    }

	    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
	    function regexpEscape(s) {
	        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	    }

	    // date from string and array of format strings
	    function makeDateFromStringAndArray(config) {
	        var tempConfig,
	            bestMoment,

	            scoreToBeat,
	            i,
	            currentScore;

	        if (config._f.length === 0) {
	            config._pf.invalidFormat = true;
	            config._d = new Date(NaN);
	            return;
	        }

	        for (i = 0; i < config._f.length; i++) {
	            currentScore = 0;
	            tempConfig = extend({}, config);
	            tempConfig._pf = defaultParsingFlags();
	            tempConfig._f = config._f[i];
	            makeDateFromStringAndFormat(tempConfig);

	            if (!isValid(tempConfig)) {
	                continue;
	            }

	            // if there is any input that was not parsed add a penalty for that format
	            currentScore += tempConfig._pf.charsLeftOver;

	            //or tokens
	            currentScore += tempConfig._pf.unusedTokens.length * 10;

	            tempConfig._pf.score = currentScore;

	            if (scoreToBeat == null || currentScore < scoreToBeat) {
	                scoreToBeat = currentScore;
	                bestMoment = tempConfig;
	            }
	        }

	        extend(config, bestMoment || tempConfig);
	    }

	    // date from iso format
	    function makeDateFromString(config) {
	        var i, l,
	            string = config._i,
	            match = isoRegex.exec(string);

	        if (match) {
	            config._pf.iso = true;
	            for (i = 0, l = isoDates.length; i < l; i++) {
	                if (isoDates[i][1].exec(string)) {
	                    // match[5] should be "T" or undefined
	                    config._f = isoDates[i][0] + (match[6] || " ");
	                    break;
	                }
	            }
	            for (i = 0, l = isoTimes.length; i < l; i++) {
	                if (isoTimes[i][1].exec(string)) {
	                    config._f += isoTimes[i][0];
	                    break;
	                }
	            }
	            if (string.match(parseTokenTimezone)) {
	                config._f += "Z";
	            }
	            makeDateFromStringAndFormat(config);
	        }
	        else {
	            config._d = new Date(string);
	        }
	    }

	    function makeDateFromInput(config) {
	        var input = config._i,
	            matched = aspNetJsonRegex.exec(input);

	        if (input === undefined) {
	            config._d = new Date();
	        } else if (matched) {
	            config._d = new Date(+matched[1]);
	        } else if (typeof input === 'string') {
	            makeDateFromString(config);
	        } else if (isArray(input)) {
	            config._a = input.slice(0);
	            dateFromConfig(config);
	        } else if (isDate(input)) {
	            config._d = new Date(+input);
	        } else if (typeof(input) === 'object') {
	            dateFromObject(config);
	        } else {
	            config._d = new Date(input);
	        }
	    }

	    function makeDate(y, m, d, h, M, s, ms) {
	        //can't just apply() to create a date:
	        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
	        var date = new Date(y, m, d, h, M, s, ms);

	        //the date constructor doesn't accept years < 1970
	        if (y < 1970) {
	            date.setFullYear(y);
	        }
	        return date;
	    }

	    function makeUTCDate(y) {
	        var date = new Date(Date.UTC.apply(null, arguments));
	        if (y < 1970) {
	            date.setUTCFullYear(y);
	        }
	        return date;
	    }

	    function parseWeekday(input, language) {
	        if (typeof input === 'string') {
	            if (!isNaN(input)) {
	                input = parseInt(input, 10);
	            }
	            else {
	                input = language.weekdaysParse(input);
	                if (typeof input !== 'number') {
	                    return null;
	                }
	            }
	        }
	        return input;
	    }

	    /************************************
	        Relative Time
	    ************************************/


	    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
	    function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
	        return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
	    }

	    function relativeTime(milliseconds, withoutSuffix, lang) {
	        var seconds = round(Math.abs(milliseconds) / 1000),
	            minutes = round(seconds / 60),
	            hours = round(minutes / 60),
	            days = round(hours / 24),
	            years = round(days / 365),
	            args = seconds < 45 && ['s', seconds] ||
	                minutes === 1 && ['m'] ||
	                minutes < 45 && ['mm', minutes] ||
	                hours === 1 && ['h'] ||
	                hours < 22 && ['hh', hours] ||
	                days === 1 && ['d'] ||
	                days <= 25 && ['dd', days] ||
	                days <= 45 && ['M'] ||
	                days < 345 && ['MM', round(days / 30)] ||
	                years === 1 && ['y'] || ['yy', years];
	        args[2] = withoutSuffix;
	        args[3] = milliseconds > 0;
	        args[4] = lang;
	        return substituteTimeAgo.apply({}, args);
	    }


	    /************************************
	        Week of Year
	    ************************************/


	    // firstDayOfWeek       0 = sun, 6 = sat
	    //                      the day of the week that starts the week
	    //                      (usually sunday or monday)
	    // firstDayOfWeekOfYear 0 = sun, 6 = sat
	    //                      the first week is the week that contains the first
	    //                      of this day of the week
	    //                      (eg. ISO weeks use thursday (4))
	    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
	        var end = firstDayOfWeekOfYear - firstDayOfWeek,
	            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
	            adjustedMoment;


	        if (daysToDayOfWeek > end) {
	            daysToDayOfWeek -= 7;
	        }

	        if (daysToDayOfWeek < end - 7) {
	            daysToDayOfWeek += 7;
	        }

	        adjustedMoment = moment(mom).add('d', daysToDayOfWeek);
	        return {
	            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
	            year: adjustedMoment.year()
	        };
	    }

	    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
	    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
	        var d = makeUTCDate(year, 0, 1).getUTCDay(), daysToAdd, dayOfYear;

	        weekday = weekday != null ? weekday : firstDayOfWeek;
	        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
	        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;

	        return {
	            year: dayOfYear > 0 ? year : year - 1,
	            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
	        };
	    }

	    /************************************
	        Top Level Functions
	    ************************************/

	    function makeMoment(config) {
	        var input = config._i,
	            format = config._f;

	        if (input === null) {
	            return moment.invalid({nullInput: true});
	        }

	        if (typeof input === 'string') {
	            config._i = input = getLangDefinition().preparse(input);
	        }

	        if (moment.isMoment(input)) {
	            config = cloneMoment(input);

	            config._d = new Date(+input._d);
	        } else if (format) {
	            if (isArray(format)) {
	                makeDateFromStringAndArray(config);
	            } else {
	                makeDateFromStringAndFormat(config);
	            }
	        } else {
	            makeDateFromInput(config);
	        }

	        return new Moment(config);
	    }

	    moment = function (input, format, lang, strict) {
	        var c;

	        if (typeof(lang) === "boolean") {
	            strict = lang;
	            lang = undefined;
	        }
	        // object construction must be done this way.
	        // https://github.com/moment/moment/issues/1423
	        c = {};
	        c._isAMomentObject = true;
	        c._i = input;
	        c._f = format;
	        c._l = lang;
	        c._strict = strict;
	        c._isUTC = false;
	        c._pf = defaultParsingFlags();

	        return makeMoment(c);
	    };

	    // creating with utc
	    moment.utc = function (input, format, lang, strict) {
	        var c;

	        if (typeof(lang) === "boolean") {
	            strict = lang;
	            lang = undefined;
	        }
	        // object construction must be done this way.
	        // https://github.com/moment/moment/issues/1423
	        c = {};
	        c._isAMomentObject = true;
	        c._useUTC = true;
	        c._isUTC = true;
	        c._l = lang;
	        c._i = input;
	        c._f = format;
	        c._strict = strict;
	        c._pf = defaultParsingFlags();

	        return makeMoment(c).utc();
	    };

	    // creating with unix timestamp (in seconds)
	    moment.unix = function (input) {
	        return moment(input * 1000);
	    };

	    // duration
	    moment.duration = function (input, key) {
	        var duration = input,
	            // matching against regexp is expensive, do it on demand
	            match = null,
	            sign,
	            ret,
	            parseIso;

	        if (moment.isDuration(input)) {
	            duration = {
	                ms: input._milliseconds,
	                d: input._days,
	                M: input._months
	            };
	        } else if (typeof input === 'number') {
	            duration = {};
	            if (key) {
	                duration[key] = input;
	            } else {
	                duration.milliseconds = input;
	            }
	        } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
	            sign = (match[1] === "-") ? -1 : 1;
	            duration = {
	                y: 0,
	                d: toInt(match[DATE]) * sign,
	                h: toInt(match[HOUR]) * sign,
	                m: toInt(match[MINUTE]) * sign,
	                s: toInt(match[SECOND]) * sign,
	                ms: toInt(match[MILLISECOND]) * sign
	            };
	        } else if (!!(match = isoDurationRegex.exec(input))) {
	            sign = (match[1] === "-") ? -1 : 1;
	            parseIso = function (inp) {
	                // We'd normally use ~~inp for this, but unfortunately it also
	                // converts floats to ints.
	                // inp may be undefined, so careful calling replace on it.
	                var res = inp && parseFloat(inp.replace(',', '.'));
	                // apply sign while we're at it
	                return (isNaN(res) ? 0 : res) * sign;
	            };
	            duration = {
	                y: parseIso(match[2]),
	                M: parseIso(match[3]),
	                d: parseIso(match[4]),
	                h: parseIso(match[5]),
	                m: parseIso(match[6]),
	                s: parseIso(match[7]),
	                w: parseIso(match[8])
	            };
	        }

	        ret = new Duration(duration);

	        if (moment.isDuration(input) && input.hasOwnProperty('_lang')) {
	            ret._lang = input._lang;
	        }

	        return ret;
	    };

	    // version number
	    moment.version = VERSION;

	    // default format
	    moment.defaultFormat = isoFormat;

	    // This function will be called whenever a moment is mutated.
	    // It is intended to keep the offset in sync with the timezone.
	    moment.updateOffset = function () {};

	    // This function will load languages and then set the global language.  If
	    // no arguments are passed in, it will simply return the current global
	    // language key.
	    moment.lang = function (key, values) {
	        var r;
	        if (!key) {
	            return moment.fn._lang._abbr;
	        }
	        if (values) {
	            loadLang(normalizeLanguage(key), values);
	        } else if (values === null) {
	            unloadLang(key);
	            key = 'en';
	        } else if (!languages[key]) {
	            getLangDefinition(key);
	        }
	        r = moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);
	        return r._abbr;
	    };

	    // returns language data
	    moment.langData = function (key) {
	        if (key && key._lang && key._lang._abbr) {
	            key = key._lang._abbr;
	        }
	        return getLangDefinition(key);
	    };

	    // compare moment object
	    moment.isMoment = function (obj) {
	        return obj instanceof Moment ||
	            (obj != null &&  obj.hasOwnProperty('_isAMomentObject'));
	    };

	    // for typechecking Duration objects
	    moment.isDuration = function (obj) {
	        return obj instanceof Duration;
	    };

	    for (i = lists.length - 1; i >= 0; --i) {
	        makeList(lists[i]);
	    }

	    moment.normalizeUnits = function (units) {
	        return normalizeUnits(units);
	    };

	    moment.invalid = function (flags) {
	        var m = moment.utc(NaN);
	        if (flags != null) {
	            extend(m._pf, flags);
	        }
	        else {
	            m._pf.userInvalidated = true;
	        }

	        return m;
	    };

	    moment.parseZone = function (input) {
	        return moment(input).parseZone();
	    };

	    /************************************
	        Moment Prototype
	    ************************************/


	    extend(moment.fn = Moment.prototype, {

	        clone : function () {
	            return moment(this);
	        },

	        valueOf : function () {
	            return +this._d + ((this._offset || 0) * 60000);
	        },

	        unix : function () {
	            return Math.floor(+this / 1000);
	        },

	        toString : function () {
	            return this.clone().lang('en').format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
	        },

	        toDate : function () {
	            return this._offset ? new Date(+this) : this._d;
	        },

	        toISOString : function () {
	            var m = moment(this).utc();
	            if (0 < m.year() && m.year() <= 9999) {
	                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
	            } else {
	                return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
	            }
	        },

	        toArray : function () {
	            var m = this;
	            return [
	                m.year(),
	                m.month(),
	                m.date(),
	                m.hours(),
	                m.minutes(),
	                m.seconds(),
	                m.milliseconds()
	            ];
	        },

	        isValid : function () {
	            return isValid(this);
	        },

	        isDSTShifted : function () {

	            if (this._a) {
	                return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
	            }

	            return false;
	        },

	        parsingFlags : function () {
	            return extend({}, this._pf);
	        },

	        invalidAt: function () {
	            return this._pf.overflow;
	        },

	        utc : function () {
	            return this.zone(0);
	        },

	        local : function () {
	            this.zone(0);
	            this._isUTC = false;
	            return this;
	        },

	        format : function (inputString) {
	            var output = formatMoment(this, inputString || moment.defaultFormat);
	            return this.lang().postformat(output);
	        },

	        add : function (input, val) {
	            var dur;
	            // switch args to support add('s', 1) and add(1, 's')
	            if (typeof input === 'string') {
	                dur = moment.duration(+val, input);
	            } else {
	                dur = moment.duration(input, val);
	            }
	            addOrSubtractDurationFromMoment(this, dur, 1);
	            return this;
	        },

	        subtract : function (input, val) {
	            var dur;
	            // switch args to support subtract('s', 1) and subtract(1, 's')
	            if (typeof input === 'string') {
	                dur = moment.duration(+val, input);
	            } else {
	                dur = moment.duration(input, val);
	            }
	            addOrSubtractDurationFromMoment(this, dur, -1);
	            return this;
	        },

	        diff : function (input, units, asFloat) {
	            var that = makeAs(input, this),
	                zoneDiff = (this.zone() - that.zone()) * 6e4,
	                diff, output;

	            units = normalizeUnits(units);

	            if (units === 'year' || units === 'month') {
	                // average number of days in the months in the given dates
	                diff = (this.daysInMonth() + that.daysInMonth()) * 432e5; // 24 * 60 * 60 * 1000 / 2
	                // difference in months
	                output = ((this.year() - that.year()) * 12) + (this.month() - that.month());
	                // adjust by taking difference in days, average number of days
	                // and dst in the given months.
	                output += ((this - moment(this).startOf('month')) -
	                        (that - moment(that).startOf('month'))) / diff;
	                // same as above but with zones, to negate all dst
	                output -= ((this.zone() - moment(this).startOf('month').zone()) -
	                        (that.zone() - moment(that).startOf('month').zone())) * 6e4 / diff;
	                if (units === 'year') {
	                    output = output / 12;
	                }
	            } else {
	                diff = (this - that);
	                output = units === 'second' ? diff / 1e3 : // 1000
	                    units === 'minute' ? diff / 6e4 : // 1000 * 60
	                    units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
	                    units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
	                    units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
	                    diff;
	            }
	            return asFloat ? output : absRound(output);
	        },

	        from : function (time, withoutSuffix) {
	            return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
	        },

	        fromNow : function (withoutSuffix) {
	            return this.from(moment(), withoutSuffix);
	        },

	        calendar : function () {
	            // We want to compare the start of today, vs this.
	            // Getting start-of-today depends on whether we're zone'd or not.
	            var sod = makeAs(moment(), this).startOf('day'),
	                diff = this.diff(sod, 'days', true),
	                format = diff < -6 ? 'sameElse' :
	                    diff < -1 ? 'lastWeek' :
	                    diff < 0 ? 'lastDay' :
	                    diff < 1 ? 'sameDay' :
	                    diff < 2 ? 'nextDay' :
	                    diff < 7 ? 'nextWeek' : 'sameElse';
	            return this.format(this.lang().calendar(format, this));
	        },

	        isLeapYear : function () {
	            return isLeapYear(this.year());
	        },

	        isDST : function () {
	            return (this.zone() < this.clone().month(0).zone() ||
	                this.zone() < this.clone().month(5).zone());
	        },

	        day : function (input) {
	            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
	            if (input != null) {
	                input = parseWeekday(input, this.lang());
	                return this.add({ d : input - day });
	            } else {
	                return day;
	            }
	        },

	        month : function (input) {
	            var utc = this._isUTC ? 'UTC' : '',
	                dayOfMonth;

	            if (input != null) {
	                if (typeof input === 'string') {
	                    input = this.lang().monthsParse(input);
	                    if (typeof input !== 'number') {
	                        return this;
	                    }
	                }

	                dayOfMonth = this.date();
	                this.date(1);
	                this._d['set' + utc + 'Month'](input);
	                this.date(Math.min(dayOfMonth, this.daysInMonth()));

	                moment.updateOffset(this);
	                return this;
	            } else {
	                return this._d['get' + utc + 'Month']();
	            }
	        },

	        startOf: function (units) {
	            units = normalizeUnits(units);
	            // the following switch intentionally omits break keywords
	            // to utilize falling through the cases.
	            switch (units) {
	            case 'year':
	                this.month(0);
	                /* falls through */
	            case 'month':
	                this.date(1);
	                /* falls through */
	            case 'week':
	            case 'isoWeek':
	            case 'day':
	                this.hours(0);
	                /* falls through */
	            case 'hour':
	                this.minutes(0);
	                /* falls through */
	            case 'minute':
	                this.seconds(0);
	                /* falls through */
	            case 'second':
	                this.milliseconds(0);
	                /* falls through */
	            }

	            // weeks are a special case
	            if (units === 'week') {
	                this.weekday(0);
	            } else if (units === 'isoWeek') {
	                this.isoWeekday(1);
	            }

	            return this;
	        },

	        endOf: function (units) {
	            units = normalizeUnits(units);
	            return this.startOf(units).add((units === 'isoWeek' ? 'week' : units), 1).subtract('ms', 1);
	        },

	        isAfter: function (input, units) {
	            units = typeof units !== 'undefined' ? units : 'millisecond';
	            return +this.clone().startOf(units) > +moment(input).startOf(units);
	        },

	        isBefore: function (input, units) {
	            units = typeof units !== 'undefined' ? units : 'millisecond';
	            return +this.clone().startOf(units) < +moment(input).startOf(units);
	        },

	        isSame: function (input, units) {
	            units = units || 'ms';
	            return +this.clone().startOf(units) === +makeAs(input, this).startOf(units);
	        },

	        min: function (other) {
	            other = moment.apply(null, arguments);
	            return other < this ? this : other;
	        },

	        max: function (other) {
	            other = moment.apply(null, arguments);
	            return other > this ? this : other;
	        },

	        zone : function (input) {
	            var offset = this._offset || 0;
	            if (input != null) {
	                if (typeof input === "string") {
	                    input = timezoneMinutesFromString(input);
	                }
	                if (Math.abs(input) < 16) {
	                    input = input * 60;
	                }
	                this._offset = input;
	                this._isUTC = true;
	                if (offset !== input) {
	                    addOrSubtractDurationFromMoment(this, moment.duration(offset - input, 'm'), 1, true);
	                }
	            } else {
	                return this._isUTC ? offset : this._d.getTimezoneOffset();
	            }
	            return this;
	        },

	        zoneAbbr : function () {
	            return this._isUTC ? "UTC" : "";
	        },

	        zoneName : function () {
	            return this._isUTC ? "Coordinated Universal Time" : "";
	        },

	        parseZone : function () {
	            if (this._tzm) {
	                this.zone(this._tzm);
	            } else if (typeof this._i === 'string') {
	                this.zone(this._i);
	            }
	            return this;
	        },

	        hasAlignedHourOffset : function (input) {
	            if (!input) {
	                input = 0;
	            }
	            else {
	                input = moment(input).zone();
	            }

	            return (this.zone() - input) % 60 === 0;
	        },

	        daysInMonth : function () {
	            return daysInMonth(this.year(), this.month());
	        },

	        dayOfYear : function (input) {
	            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
	            return input == null ? dayOfYear : this.add("d", (input - dayOfYear));
	        },

	        quarter : function () {
	            return Math.ceil((this.month() + 1.0) / 3.0);
	        },

	        weekYear : function (input) {
	            var year = weekOfYear(this, this.lang()._week.dow, this.lang()._week.doy).year;
	            return input == null ? year : this.add("y", (input - year));
	        },

	        isoWeekYear : function (input) {
	            var year = weekOfYear(this, 1, 4).year;
	            return input == null ? year : this.add("y", (input - year));
	        },

	        week : function (input) {
	            var week = this.lang().week(this);
	            return input == null ? week : this.add("d", (input - week) * 7);
	        },

	        isoWeek : function (input) {
	            var week = weekOfYear(this, 1, 4).week;
	            return input == null ? week : this.add("d", (input - week) * 7);
	        },

	        weekday : function (input) {
	            var weekday = (this.day() + 7 - this.lang()._week.dow) % 7;
	            return input == null ? weekday : this.add("d", input - weekday);
	        },

	        isoWeekday : function (input) {
	            // behaves the same as moment#day except
	            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
	            // as a setter, sunday should belong to the previous week.
	            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
	        },

	        get : function (units) {
	            units = normalizeUnits(units);
	            return this[units]();
	        },

	        set : function (units, value) {
	            units = normalizeUnits(units);
	            if (typeof this[units] === 'function') {
	                this[units](value);
	            }
	            return this;
	        },

	        // If passed a language key, it will set the language for this
	        // instance.  Otherwise, it will return the language configuration
	        // variables for this instance.
	        lang : function (key) {
	            if (key === undefined) {
	                return this._lang;
	            } else {
	                this._lang = getLangDefinition(key);
	                return this;
	            }
	        }
	    });

	    // helper for adding shortcuts
	    function makeGetterAndSetter(name, key) {
	        moment.fn[name] = moment.fn[name + 's'] = function (input) {
	            var utc = this._isUTC ? 'UTC' : '';
	            if (input != null) {
	                this._d['set' + utc + key](input);
	                moment.updateOffset(this);
	                return this;
	            } else {
	                return this._d['get' + utc + key]();
	            }
	        };
	    }

	    // loop through and add shortcuts (Month, Date, Hours, Minutes, Seconds, Milliseconds)
	    for (i = 0; i < proxyGettersAndSetters.length; i ++) {
	        makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase().replace(/s$/, ''), proxyGettersAndSetters[i]);
	    }

	    // add shortcut for year (uses different syntax than the getter/setter 'year' == 'FullYear')
	    makeGetterAndSetter('year', 'FullYear');

	    // add plural methods
	    moment.fn.days = moment.fn.day;
	    moment.fn.months = moment.fn.month;
	    moment.fn.weeks = moment.fn.week;
	    moment.fn.isoWeeks = moment.fn.isoWeek;

	    // add aliased format methods
	    moment.fn.toJSON = moment.fn.toISOString;

	    /************************************
	        Duration Prototype
	    ************************************/


	    extend(moment.duration.fn = Duration.prototype, {

	        _bubble : function () {
	            var milliseconds = this._milliseconds,
	                days = this._days,
	                months = this._months,
	                data = this._data,
	                seconds, minutes, hours, years;

	            // The following code bubbles up values, see the tests for
	            // examples of what that means.
	            data.milliseconds = milliseconds % 1000;

	            seconds = absRound(milliseconds / 1000);
	            data.seconds = seconds % 60;

	            minutes = absRound(seconds / 60);
	            data.minutes = minutes % 60;

	            hours = absRound(minutes / 60);
	            data.hours = hours % 24;

	            days += absRound(hours / 24);
	            data.days = days % 30;

	            months += absRound(days / 30);
	            data.months = months % 12;

	            years = absRound(months / 12);
	            data.years = years;
	        },

	        weeks : function () {
	            return absRound(this.days() / 7);
	        },

	        valueOf : function () {
	            return this._milliseconds +
	              this._days * 864e5 +
	              (this._months % 12) * 2592e6 +
	              toInt(this._months / 12) * 31536e6;
	        },

	        humanize : function (withSuffix) {
	            var difference = +this,
	                output = relativeTime(difference, !withSuffix, this.lang());

	            if (withSuffix) {
	                output = this.lang().pastFuture(difference, output);
	            }

	            return this.lang().postformat(output);
	        },

	        add : function (input, val) {
	            // supports only 2.0-style add(1, 's') or add(moment)
	            var dur = moment.duration(input, val);

	            this._milliseconds += dur._milliseconds;
	            this._days += dur._days;
	            this._months += dur._months;

	            this._bubble();

	            return this;
	        },

	        subtract : function (input, val) {
	            var dur = moment.duration(input, val);

	            this._milliseconds -= dur._milliseconds;
	            this._days -= dur._days;
	            this._months -= dur._months;

	            this._bubble();

	            return this;
	        },

	        get : function (units) {
	            units = normalizeUnits(units);
	            return this[units.toLowerCase() + 's']();
	        },

	        as : function (units) {
	            units = normalizeUnits(units);
	            return this['as' + units.charAt(0).toUpperCase() + units.slice(1) + 's']();
	        },

	        lang : moment.fn.lang,

	        toIsoString : function () {
	            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
	            var years = Math.abs(this.years()),
	                months = Math.abs(this.months()),
	                days = Math.abs(this.days()),
	                hours = Math.abs(this.hours()),
	                minutes = Math.abs(this.minutes()),
	                seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);

	            if (!this.asSeconds()) {
	                // this is the same as C#'s (Noda) and python (isodate)...
	                // but not other JS (goog.date)
	                return 'P0D';
	            }

	            return (this.asSeconds() < 0 ? '-' : '') +
	                'P' +
	                (years ? years + 'Y' : '') +
	                (months ? months + 'M' : '') +
	                (days ? days + 'D' : '') +
	                ((hours || minutes || seconds) ? 'T' : '') +
	                (hours ? hours + 'H' : '') +
	                (minutes ? minutes + 'M' : '') +
	                (seconds ? seconds + 'S' : '');
	        }
	    });

	    function makeDurationGetter(name) {
	        moment.duration.fn[name] = function () {
	            return this._data[name];
	        };
	    }

	    function makeDurationAsGetter(name, factor) {
	        moment.duration.fn['as' + name] = function () {
	            return +this / factor;
	        };
	    }

	    for (i in unitMillisecondFactors) {
	        if (unitMillisecondFactors.hasOwnProperty(i)) {
	            makeDurationAsGetter(i, unitMillisecondFactors[i]);
	            makeDurationGetter(i.toLowerCase());
	        }
	    }

	    makeDurationAsGetter('Weeks', 6048e5);
	    moment.duration.fn.asMonths = function () {
	        return (+this - this.years() * 31536e6) / 2592e6 + this.years() * 12;
	    };


	    /************************************
	        Default Lang
	    ************************************/


	    // Set default language, other languages will inherit from English.
	    moment.lang('en', {
	        ordinal : function (number) {
	            var b = number % 10,
	                output = (toInt(number % 100 / 10) === 1) ? 'th' :
	                (b === 1) ? 'st' :
	                (b === 2) ? 'nd' :
	                (b === 3) ? 'rd' : 'th';
	            return number + output;
	        }
	    });

	    /* EMBED_LANGUAGES */

	    /************************************
	        Exposing Moment
	    ************************************/

	    function makeGlobal(deprecate) {
	        var warned = false, local_moment = moment;
	        /*global ender:false */
	        if (typeof ender !== 'undefined') {
	            return;
	        }
	        // here, `this` means `window` in the browser, or `global` on the server
	        // add `moment` as a global object via a string identifier,
	        // for Closure Compiler "advanced" mode
	        if (deprecate) {
	            global.moment = function () {
	                if (!warned && console && console.warn) {
	                    warned = true;
	                    console.warn(
	                            "Accessing Moment through the global scope is " +
	                            "deprecated, and will be removed in an upcoming " +
	                            "release.");
	                }
	                return local_moment.apply(null, arguments);
	            };
	            extend(global.moment, local_moment);
	        } else {
	            global['moment'] = moment;
	        }
	    }

	    // CommonJS module is defined
	    if (hasModule) {
	        module.exports = moment;
	        makeGlobal(true);
	    } else if (true) {
	        !(__WEBPACK_AMD_DEFINE_RESULT__ = (function (require, exports, module) {
	            if (module.config && module.config() && module.config().noGlobal !== true) {
	                // If user provided noGlobal, he is aware of global
	                makeGlobal(module.config().noGlobal === undefined);
	            }

	            return moment;
	        }.call(exports, require, exports, module)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else {
	        makeGlobal();
	    }
	}).call(this);
	
	/* WEBPACK VAR INJECTION */}.call(exports, require, require(11)(module)))

/***/ },
/* 9 */
/***/ function(module, exports, require) {

	/*
	 * # supergroup.js
	 * Author: [Sigfried Gold](http://sigfried.org)  
	 * License: [MIT](http://sigfried.mit-license.org/)  
	 *
	 * usage examples at [http://sigfried.github.io/blog/supergroup](http://sigfried.github.io/blog/supergroup)
	 */
	; // jshint -W053

	'use strict()';
	if (true) { // make it work in node or browsers or other contexts
	    _ = require(81); // otherwise assume it was included by html file
	    require(82); // adds unchain as an Underscore mixin
	    require(80); // adds mean, median, etc. as mixins
	}
	var supergroup = (function() {
	    var e = {}; // local reference to supergroup namespace
	    // @class List
	    // @description Native Array of groups with various added methods and properties.
	    // Methods described below.
	    function List() {}
	    // @class Value
	    // @description Supergroup Lists are composed of Values which are
	    // String or Number objects representing group values.
	    // Methods described below.
	    function Value() {}

	    /* @exported function supergroup.group(recs, dim, opts)
	     * @param {Object[]} recs list of records to be grouped
	     * @param {string or Function} dim either the property name to
	        group by or a function returning a group by string or number
	     * @param {Object} [opts]
	     * @param {String} opts.childProp='children' If group ends up being
	        * hierarchical, this will be the property name of any children
	     * @param {String[]} [opts.excludeValues] to exlude specific group values
	     * @param {function} [opts.preListRecsHook] run recs through this
	        * function before continuing processing
	     * @param {function} [opts.dimName] defaults to the value of `dim`.
	        * If `dim` is a function, the dimName will be ugly.
	     * @return {Array of Values} enhanced with all the List methods
	     *
	     * Avaailable as _.supergroup, Underscore mixin
	     */
	    e.group = function(recs, dim, opts) {
	        if (_(dim).isArray()) return e.multiDimList(recs, dim, opts); // handoff to multiDimmList if dim is an array
	        opts = opts || {};
	        recs = opts.preListRecsHook ? opts.preListRecsHook(recs) : recs;
	        childProp = opts.childProp || childProp;
	        var groups = _.groupBy(recs, dim); // use Underscore's groupBy: http://underscorejs.org/#groupBy
	        if (opts.excludeValues) {
	            _(opts.excludeValues).each(function(d) {
	                delete groups[d];
	            });
	        }
	        var isNumeric = wholeListNumeric(groups); // does every group Value look like a number or a missing value?
	        var groups = _.map(_.pairs(groups), function(pair, i) { // setup Values for each group in List
	            var rawVal = pair[0];
	            var val;
	            if(isNumeric) {
	                val = makeNumberValue(rawVal); // either everything's a Number
	            } else {
	                val = makeStringValue(rawVal); // or everything's a String
	            }
	            /* The original records in this group are stored as an Array in 
	             * the records property (should probably be a getter method).
	             */
	            val.records = pair[1];
	            /* val.records is enhanced with Underscore methods for
	             * convenience, but also with the supergroup method that's
	             * been mixed in to Underscore. So you can group this specific
	             * subset like: val.records.supergroup
	             * on                                       FIX!!!!!!
	             */
	            _.unchain(val.records, {cloneFrozenVals:true});
	            val.dim = (opts.dimName) ? opts.dimName : dim;
	            val.records.parentVal = val; // NOT TESTED, NOT USED, PROBABLY WRONG
	            if (opts.parent)
	                val.parent = opts.parent;
	            if (val.parent) {
	                if ('depth' in val.parent) {
	                    val.depth = val.parent.depth + 1;
	                } else {
	                    val.parent.depth = 0;
	                    val.depth = 1;
	                }
	            } else {
	                val.depth = 0;
	            }
	            return val;
	        });
	        groups = makeList(groups);
	        groups.records = recs; // NOT TESTED, NOT USED, PROBABLY WRONG
	        groups.dim = (opts.dimName) ? opts.dimName : dim;
	        groups.isNumeric = isNumeric;
	        _(groups).each(function(group) { 
	            group.parentList = groups;
	        });
	        // pointless without recursion
	        //if (opts.postListListHook) groups = opts.postListListHook(groups);
	        return groups;
	    };
	    e.multiDimList = function(recs, dims, opts) {
	        var groups = e.group(recs, dims[0], opts);
	        _.chain(dims).rest().each(function(dim) {
	            groups.addLevel(dim, opts);
	        });
	        return groups;
	    };

	    List.prototype.asRootVal = function(name, dimName) {
	        name = name || 'Root';
	        var val = makeValue(name);
	        val.records = this; // is this wrong?
	        val[childProp]= this;
	        val.descendants().each(function(d) { d.depth = d.depth + 1; });
	        val.depth = 0;
	        val.dim = dimName || 'root';
	        return val;
	    };
	    List.prototype.leafNodes = function(level) {
	        return this.invoke('leafNodes').flatten();
	    };
	    List.prototype.rawValues = function() {
	        return _(this).map(function(d) { return d.valueOf(); });
	    };
	    List.prototype.lookup = function(query) {
	        if (_.isArray(query)) {
	            // if group has children, can search down the tree
	            var values = query.slice(0);
	            var list = this;
	            var ret;
	            while(values.length) {
	                ret = list.singleLookup(values.shift());
	                list = ret[childProp];
	            }
	            return ret;
	        } else {
	            return this.singleLookup(query);
	        }
	    };
	    List.prototype.singleLookup = function(query) {
	        var that = this;
	        if (! ('lookupMap' in this)) {
	            this.lookupMap = {};
	            this.forEach(function(d) {
	                that.lookupMap[d] = d;
	            });
	        }
	        if (query in this.lookupMap)
	            return this.lookupMap[query];
	    };
	    List.prototype.flattenTree = function() {
	        return _.chain(this)
	                    .map(function(d) {
	                        var desc = d.descendants();
	                        return [d].concat(desc);
	                    })
	                    .flatten()
	                    .filter(_.identity) // expunge nulls
	                    .tap(e.addListMethods)
	                    .value();
	    };
	    List.prototype.addLevel = function(dim, opts) {
	        _(this).each(function(val) {
	            val.addLevel(dim, opts);
	        });
	    };
	    
	    function makeList(arr_arg) {
	        var arr = [ ];
	        arr.push.apply(arr, arr_arg);
	        //arr.__proto__ = List.prototype;
	        for(var method in List.prototype) {
	            Object.defineProperty(arr, method, {
	                value: List.prototype[method]
	            });
	        }
	        _.unchain(arr);
	        return arr;
	    }

	    /** Enhance arrays with {@link http://underscorejs.org/ Underscore} functions 
	     * that work on arrays. 
	     * @param {Array} arr
	     * @return {Array} now enhanced
	     *
	     * Now can call Underscore functions as methods on the array, and if
	     * the return value is an array, it will also be enhanced.
	     *
	     * @example
	     * `enlightenedData.addUnderscoreMethods(['a','bb','ccc'])
	     *      .pluck('length')
	     *      .
	     * group.where({foo:bar}).invoke('baz')
	     * @returns {whatever the underscore function would return}
	     *
	     * @memberof enlightenedData 
	     */
	    /*
	    e.addUnderscoreMethods = function(arr) {
	        _(e.underscoreMethodsToAddToArrays).each(function(methodName) {
	            if (_(arr).has(methodName)) return;
	            Object.defineProperty(arr, methodName, {
	                value: function() {
	                    var part = _.partial(_[methodName], arr);
	                    var result = part.apply(null, _.toArray(arguments));
	                    if (_.isArray(result)) e.addListMethods(result);
	                    return result;
	                }});
	        });
	        return arr;
	    };
	    e.underscoreMethodsToAddToArrays = [ 
	            "each",
	            "map",
	            "reduce",
	            "find",
	            "filter",
	            "reject",
	            "all",
	            "every",
	            "any",
	            "some",
	            "contains",
	            "invoke",
	            "pluck",
	            "where",
	            "findWhere",
	            "max",
	            "min",
	            "shuffle",
	            "sortBy",
	            "groupBy",
	            "countBy",
	            "sortedIndex",
	            "size",
	            "first",
	            "initial",
	            "last",
	            "rest",
	            "compact",
	            "flatten",
	            "without",
	            "uniq",
	            "union",
	            "intersection",
	            "difference",
	            "zip",
	            "unzip",
	            //"object",
	            "indexOf",
	            "lastIndexOf",
	            "chain",
	            "result"
	            ];
	    */
	    function makeValue(v_arg) {
	        if (isNaN(v_arg)) {
	            return makeStringValue(v_arg);
	        } else {
	            return makeNumberValue(v_arg);
	        }
	    }
	    function StringValue() {}
	    //StringValue.prototype = new String;
	    function makeStringValue(s_arg) {
	        var S = new String(s_arg);
	        //S.__proto__ = StringValue.prototype; // won't work in IE10
	        for(var method in StringValue.prototype) {
	            Object.defineProperty(S, method, {
	                value: StringValue.prototype[method]
	            });
	        }
	        return S;
	    }
	    function NumberValue() {}
	    //NumberValue.prototype = new Number;
	    function makeNumberValue(n_arg) {
	        var N = new Number(n_arg);
	        //N.__proto__ = NumberValue.prototype;
	        for(var method in NumberValue.prototype) {
	            Object.defineProperty(N, method, {
	                value: NumberValue.prototype[method]
	            });
	        }
	        return N;
	    }
	    function wholeListNumeric(groups) {
	        var isNumeric = _.every(_.keys(groups), function(k) {
	            return      k === null ||
	                        k === undefined ||
	                        (!isNaN(Number(k))) ||
	                        ["null", ".", "undefined"].indexOf(k.toLowerCase()) > -1;
	        });
	        if (isNumeric) {
	            _.each(_.keys(groups), function(k) {
	                if (isNaN(k)) {
	                    delete groups[k];        // getting rid of NULL values in dim list!!
	                }
	            });
	        }
	        return isNumeric;
	    }
	    var childProp = 'children';

	    Value.prototype.extendGroupBy = // backward compatibility
	    Value.prototype.addLevel = function(dim, opts) {
	        opts = opts || {};
	        _.each(this.leafNodes(), function(d) {
	            opts.parent = d;
	            if (d.in && d.in === "both") {
	                d[childProp] = e.diffList(d.from, d.to, dim, opts);
	            } else {
	                d[childProp] = e.group(d.records, dim, opts);
	                if (d.in ) {
	                    _(d[childProp]).each(function(c) {
	                        c.in = d.in;
	                        c[d.in] = d[d.in];
	                    });
	                }
	            }
	            d[childProp].parentVal = d; // NOT TESTED, NOT USED, PROBABLY WRONG!!!
	        });
	    };
	    Value.prototype.leafNodes = function(level) {
	        var ret = [this];
	        if (typeof level === "undefined") {
	            level = Infinity;
	        }
	        if (level !== 0 && this[childProp] && this[childProp].length && (!level || this.depth < level)) {
	            ret = _.flatten(_.map(this[childProp], function(c) {
	                return c.leafNodes(level);
	            }), true);
	        }
	        return makeList(ret);
	    };
	    /*  didn't make this yet, just copied from above
	    Value.prototype.descendants = function(level) {
	        var ret = [this];
	        if (level !== 0 && this[childProp] && (!level || this.depth < level))
	            ret = _.flatten(_.map(this[childProp], function(c) {
	                return c.leafNodes(level);
	            }), true);
	        return makeList(ret);
	    };
	    */
	    function delimOpts(opts) {
	        if (typeof opts === "string") opts = {delim: opts};
	        opts = opts || {};
	        if (!_(opts).has('delim')) opts.delim = '/';
	        return opts;
	    }
	    Value.prototype.dimPath = function(opts) {
	        opts = delimOpts(opts);
	        opts.dimName = true;
	        return this.namePath(opts);
	    };
	    Value.prototype.namePath = function(opts) {
	        opts = delimOpts(opts);
	        var path = this.pedigree(opts);
	        if (opts.noRoot) path.shift();
	        if (opts.backwards || this.backwards) path.reverse(); //kludgy?
	        if (opts.dimName) path = _(path).pluck('dim');
	        if (opts.asArray) return path;
	        return path.join(opts.delim);
	        /*
	        var delim = opts.delim || '/';
	        return (this.parent ? 
	                this.parent.namePath(_.extend({},opts,{notLeaf:true})) : '') +
	            ((opts.noRoot && this.depth===0) ? '' : 
	                (this + (opts.notLeaf ? delim : ''))
	             )
	        */
	    };
	    Value.prototype.pedigree = function(opts) {
	        var path = [];
	        if (!(opts && opts.notThis)) path.push(this);
	        var ptr = this;
	        while ((ptr = ptr.parent)) {
	            path.unshift(ptr);
	        }
	        return path;
	        // CHANGING -- HOPE THIS DOESN'T BREAK STUFF (pedigree isn't
	        // documented yet)
	        if (!(opts && opts.asValues)) return _(path).invoke('valueOf');
	        return path;
	    };
	    Value.prototype.descendants = function(opts) {
	        return this[childProp] ? this[childProp].flattenTree() : undefined;
	    };
	    Value.prototype.lookup = function(query) {
	        if (_.isArray(query)) {
	            if (this.valueOf() == query[0]) { // allow string/num comparison to succeed?
	                query = query.slice(1);
	                if (query.length === 0)
	                    return this;
	            }
	        } else if (_.isString(query)) {
	            if (this.valueOf() == query) {
	                return this;
	            }
	        } else {
	            throw new Error("invalid param: " + query);
	        }
	        if (!this[childProp])
	            throw new Error("can only call lookup on Values with kids");
	        return this[childProp].lookup(query);
	    };
	    Value.prototype.pct = function() {
	        return this.records.length / this.parentList.records.length;
	    };

	    /** Summarize records by a dimension
	     *
	     * @param {list} Records to be summarized
	     * @param {numericDim} Dimension to summarize by
	     *
	     * @memberof supergroup
	     */
	    e.aggregate = function(list, numericDim) { 
	        if (numericDim) {
	            list = _(list).pluck(numericDim);
	        }
	        return _(list).reduce(function(memo,num){
	                    memo.sum+=num;
	                    memo.cnt++;
	                    memo.avg=memo.sum/memo.cnt; 
	                    memo.max = Math.max(memo.max, num);
	                    return memo;
	                },{sum:0,cnt:0,max:-Infinity});
	    }; 
	    /** Compare groups across two similar root notes
	     *
	     * @param {from} ...
	     * @param {to} ...
	     * @param {dim} ...
	     * @param {opts} ...
	     *
	     * used by treelike and some earlier code
	     *
	     * @memberof supergroup
	     */
	    e.diffList = function(from, to, dim, opts) {
	        var fromList = e.group(from.records, dim, opts);
	        var toList = e.group(to.records, dim, opts);
	        var list = makeList(e.compare(fromList, toList, dim));
	        list.dim = (opts && opts.dimName) ? opts.dimName : dim;
	        return list;
	    };

	    /** Compare two groups by a dimension
	     *
	     * @param {A} ...
	     * @param {B} ...
	     * @param {dim} ...
	     *
	     * @memberof supergroup
	     */
	    e.compare = function(A, B, dim) {
	        var a = _(A).map(function(d) { return d+''; });
	        var b = _(B).map(function(d) { return d+''; });
	        var comp = {};
	        _(A).each(function(d, i) {
	            comp[d+''] = {
	                name: d+'',
	                in: 'from',
	                from: d,
	                fromIdx: i,
	                dim: dim
	            };
	        });
	        _(B).each(function(d, i) {
	            if ((d+'') in comp) {
	                var c = comp[d+''];
	                c.in = "both";
	                c.to = d;
	                c.toIdx = i;
	            } else {
	                comp[d+''] = {
	                    name: d+'',
	                    in: 'to',
	                    to: d,
	                    toIdx: i,
	                    dim: dim
	                };
	            }
	        });
	        var list = _(comp).values().sort(function(a,b) {
	            return (a.fromIdx - b.fromIdx) || (a.toIdx - b.toIdx);
	        }).map(function(d) {
	            var val = makeValue(d.name);
	            _.extend(val, d);
	            val.records = [];
	            if ('from' in d)
	                val.records = val.records.concat(d.from.records);
	            if ('to' in d)
	                val.records = val.records.concat(d.to.records);
	            return val;
	        });
	        _(list).map(function(d) {
	            d.parentList = list; // NOT TESTED, NOT USED, PROBABLY WRONG
	            d.records.parentVal = d; // NOT TESTED, NOT USED, PROBABLY WRONG
	        });
	        return list;
	    };

	    /** Concatenate two Values into a new one (??)
	     *
	     * @param {from} ...
	     * @param {to} ...
	     *
	     * @memberof supergroup
	     */
	    e.compareValue = function(from, to) {
	        if (from.dim !== to.dim) {
	            throw new Error("not sure what you're trying to do");
	        }
	        var name = from + ' to ' + to;
	        var val = makeValue(name);
	        val.from = from;
	        val.to = to;
	        val.depth = 0;
	        val.in = "both";
	        val.records = [].concat(from.records,to.records);
	        val.records.parentVal = val; // NOT TESTED, NOT USED, PROBABLY WRONG
	        val.dim = from.dim;
	        return val;
	    };
	    _.extend(StringValue.prototype, Value.prototype);
	    _.extend(NumberValue.prototype, Value.prototype);

	    /** Sometimes a List gets turned into a standard array,
	     *  e.g., through slicing or sorting or filtering. 
	     *  addListMethods turns it back into a List
	     *
	     * `List` would be a constructor if IE10 supported
	     * \_\_proto\_\_, so it pretends to be one instead.
	     *
	     * @param {Array} Array to be extended
	     *
	     * @memberof supergroup
	     */
	    e.addListMethods = function(arr) {
	        for(var method in List.prototype) {
	            Object.defineProperty(arr, method, {
	                value: List.prototype[method]
	            });
	        }
	        _.unchain(arr);
	        return arr;
	    };
	    return e;
	}());

	_.mixin({supergroup: supergroup.group});

	if (true) {   // not sure if this is all right
	    if (typeof module !== 'undefined' && module.exports) {
	        module.exports = _;
	    }
	    exports._ = _;
	} else if (typeof define === 'function' && define.amd) {
	    // Register as a named module with AMD.
	    define('_', [], function() {
	        return nester;
	    });
	}


/***/ },
/* 10 */
/***/ function(module, exports, require) {

	var map = {
		"./ar": 13,
		"./ar-ma": 12,
		"./ar-ma.js": 12,
		"./ar.js": 13,
		"./bg": 14,
		"./bg.js": 14,
		"./br": 15,
		"./br.js": 15,
		"./bs": 16,
		"./bs.js": 16,
		"./ca": 17,
		"./ca.js": 17,
		"./cs": 18,
		"./cs.js": 18,
		"./cv": 19,
		"./cv.js": 19,
		"./cy": 20,
		"./cy.js": 20,
		"./da": 21,
		"./da.js": 21,
		"./de": 22,
		"./de.js": 22,
		"./el": 23,
		"./el.js": 23,
		"./en-au": 24,
		"./en-au.js": 24,
		"./en-ca": 25,
		"./en-ca.js": 25,
		"./en-gb": 26,
		"./en-gb.js": 26,
		"./eo": 27,
		"./eo.js": 27,
		"./es": 28,
		"./es.js": 28,
		"./et": 29,
		"./et.js": 29,
		"./eu": 30,
		"./eu.js": 30,
		"./fa": 31,
		"./fa.js": 31,
		"./fi": 32,
		"./fi.js": 32,
		"./fo": 33,
		"./fo.js": 33,
		"./fr": 35,
		"./fr-ca": 34,
		"./fr-ca.js": 34,
		"./fr.js": 35,
		"./gl": 36,
		"./gl.js": 36,
		"./he": 37,
		"./he.js": 37,
		"./hi": 38,
		"./hi.js": 38,
		"./hr": 39,
		"./hr.js": 39,
		"./hu": 40,
		"./hu.js": 40,
		"./hy-am": 41,
		"./hy-am.js": 41,
		"./id": 42,
		"./id.js": 42,
		"./is": 43,
		"./is.js": 43,
		"./it": 44,
		"./it.js": 44,
		"./ja": 45,
		"./ja.js": 45,
		"./ka": 46,
		"./ka.js": 46,
		"./ko": 47,
		"./ko.js": 47,
		"./lb": 48,
		"./lb.js": 48,
		"./lt": 49,
		"./lt.js": 49,
		"./lv": 50,
		"./lv.js": 50,
		"./mk": 51,
		"./mk.js": 51,
		"./ml": 52,
		"./ml.js": 52,
		"./mr": 53,
		"./mr.js": 53,
		"./ms-my": 54,
		"./ms-my.js": 54,
		"./nb": 55,
		"./nb.js": 55,
		"./ne": 56,
		"./ne.js": 56,
		"./nl": 57,
		"./nl.js": 57,
		"./nn": 58,
		"./nn.js": 58,
		"./pl": 59,
		"./pl.js": 59,
		"./pt": 61,
		"./pt-br": 60,
		"./pt-br.js": 60,
		"./pt.js": 61,
		"./ro": 62,
		"./ro.js": 62,
		"./rs": 63,
		"./rs.js": 63,
		"./ru": 64,
		"./ru.js": 64,
		"./sk": 65,
		"./sk.js": 65,
		"./sl": 66,
		"./sl.js": 66,
		"./sq": 67,
		"./sq.js": 67,
		"./sv": 68,
		"./sv.js": 68,
		"./ta": 69,
		"./ta.js": 69,
		"./th": 70,
		"./th.js": 70,
		"./tl-ph": 71,
		"./tl-ph.js": 71,
		"./tr": 72,
		"./tr.js": 72,
		"./tzm": 74,
		"./tzm-la": 73,
		"./tzm-la.js": 73,
		"./tzm.js": 74,
		"./uk": 75,
		"./uk.js": 75,
		"./uz": 76,
		"./uz.js": 76,
		"./vn": 77,
		"./vn.js": 77,
		"./zh-cn": 78,
		"./zh-cn.js": 78,
		"./zh-tw": 79,
		"./zh-tw.js": 79
	};
	function webpackContext(req) {
		return require(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;


/***/ },
/* 11 */
/***/ function(module, exports, require) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 12 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : Moroccan Arabic (ar-ma)
	// author : ElFadili Yassine : https://github.com/ElFadiliY
	// author : Abdel Said : https://github.com/abdelsaid

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('ar-ma', {
	        months : "يناير_فبراير_مارس_أبريل_ماي_يونيو_يوليوز_غشت_شتنبر_أكتوبر_نونبر_دجنبر".split("_"),
	        monthsShort : "يناير_فبراير_مارس_أبريل_ماي_يونيو_يوليوز_غشت_شتنبر_أكتوبر_نونبر_دجنبر".split("_"),
	        weekdays : "الأحد_الإتنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت".split("_"),
	        weekdaysShort : "احد_اتنين_ثلاثاء_اربعاء_خميس_جمعة_سبت".split("_"),
	        weekdaysMin : "ح_ن_ث_ر_خ_ج_س".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd D MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay: "[اليوم على الساعة] LT",
	            nextDay: '[غدا على الساعة] LT',
	            nextWeek: 'dddd [على الساعة] LT',
	            lastDay: '[أمس على الساعة] LT',
	            lastWeek: 'dddd [على الساعة] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : "في %s",
	            past : "منذ %s",
	            s : "ثوان",
	            m : "دقيقة",
	            mm : "%d دقائق",
	            h : "ساعة",
	            hh : "%d ساعات",
	            d : "يوم",
	            dd : "%d أيام",
	            M : "شهر",
	            MM : "%d أشهر",
	            y : "سنة",
	            yy : "%d سنوات"
	        },
	        week : {
	            dow : 6, // Saturday is the first day of the week.
	            doy : 12  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 13 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : Arabic (ar)
	// author : Abdel Said : https://github.com/abdelsaid
	// changes in months, weekdays : Ahmed Elkhatib

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('ar', {
	        months : "يناير/ كانون الثاني_فبراير/ شباط_مارس/ آذار_أبريل/ نيسان_مايو/ أيار_يونيو/ حزيران_يوليو/ تموز_أغسطس/ آب_سبتمبر/ أيلول_أكتوبر/ تشرين الأول_نوفمبر/ تشرين الثاني_ديسمبر/ كانون الأول".split("_"),
	        monthsShort : "يناير/ كانون الثاني_فبراير/ شباط_مارس/ آذار_أبريل/ نيسان_مايو/ أيار_يونيو/ حزيران_يوليو/ تموز_أغسطس/ آب_سبتمبر/ أيلول_أكتوبر/ تشرين الأول_نوفمبر/ تشرين الثاني_ديسمبر/ كانون الأول".split("_"),
	        weekdays : "الأحد_الإثنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت".split("_"),
	        weekdaysShort : "الأحد_الإثنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت".split("_"),
	        weekdaysMin : "ح_ن_ث_ر_خ_ج_س".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd D MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay: "[اليوم على الساعة] LT",
	            nextDay: '[غدا على الساعة] LT',
	            nextWeek: 'dddd [على الساعة] LT',
	            lastDay: '[أمس على الساعة] LT',
	            lastWeek: 'dddd [على الساعة] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : "في %s",
	            past : "منذ %s",
	            s : "ثوان",
	            m : "دقيقة",
	            mm : "%d دقائق",
	            h : "ساعة",
	            hh : "%d ساعات",
	            d : "يوم",
	            dd : "%d أيام",
	            M : "شهر",
	            MM : "%d أشهر",
	            y : "سنة",
	            yy : "%d سنوات"
	        },
	        week : {
	            dow : 6, // Saturday is the first day of the week.
	            doy : 12  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 14 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : bulgarian (bg)
	// author : Krasen Borisov : https://github.com/kraz

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('bg', {
	        months : "януари_февруари_март_април_май_юни_юли_август_септември_октомври_ноември_декември".split("_"),
	        monthsShort : "янр_фев_мар_апр_май_юни_юли_авг_сеп_окт_ное_дек".split("_"),
	        weekdays : "неделя_понеделник_вторник_сряда_четвъртък_петък_събота".split("_"),
	        weekdaysShort : "нед_пон_вто_сря_чет_пет_съб".split("_"),
	        weekdaysMin : "нд_пн_вт_ср_чт_пт_сб".split("_"),
	        longDateFormat : {
	            LT : "H:mm",
	            L : "D.MM.YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd, D MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay : '[Днес в] LT',
	            nextDay : '[Утре в] LT',
	            nextWeek : 'dddd [в] LT',
	            lastDay : '[Вчера в] LT',
	            lastWeek : function () {
	                switch (this.day()) {
	                case 0:
	                case 3:
	                case 6:
	                    return '[В изминалата] dddd [в] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[В изминалия] dddd [в] LT';
	                }
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "след %s",
	            past : "преди %s",
	            s : "няколко секунди",
	            m : "минута",
	            mm : "%d минути",
	            h : "час",
	            hh : "%d часа",
	            d : "ден",
	            dd : "%d дни",
	            M : "месец",
	            MM : "%d месеца",
	            y : "година",
	            yy : "%d години"
	        },
	        ordinal : function (number) {
	            var lastDigit = number % 10,
	                last2Digits = number % 100;
	            if (number === 0) {
	                return number + '-ев';
	            } else if (last2Digits === 0) {
	                return number + '-ен';
	            } else if (last2Digits > 10 && last2Digits < 20) {
	                return number + '-ти';
	            } else if (lastDigit === 1) {
	                return number + '-ви';
	            } else if (lastDigit === 2) {
	                return number + '-ри';
	            } else if (lastDigit === 7 || lastDigit === 8) {
	                return number + '-ми';
	            } else {
	                return number + '-ти';
	            }
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 15 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : breton (br)
	// author : Jean-Baptiste Le Duigou : https://github.com/jbleduigou

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    function relativeTimeWithMutation(number, withoutSuffix, key) {
	        var format = {
	            'mm': "munutenn",
	            'MM': "miz",
	            'dd': "devezh"
	        };
	        return number + ' ' + mutation(format[key], number);
	    }

	    function specialMutationForYears(number) {
	        switch (lastNumber(number)) {
	        case 1:
	        case 3:
	        case 4:
	        case 5:
	        case 9:
	            return number + ' bloaz';
	        default:
	            return number + ' vloaz';
	        }
	    }

	    function lastNumber(number) {
	        if (number > 9) {
	            return lastNumber(number % 10);
	        }
	        return number;
	    }

	    function mutation(text, number) {
	        if (number === 2) {
	            return softMutation(text);
	        }
	        return text;
	    }

	    function softMutation(text) {
	        var mutationTable = {
	            'm': 'v',
	            'b': 'v',
	            'd': 'z'
	        };
	        if (mutationTable[text.charAt(0)] === undefined) {
	            return text;
	        }
	        return mutationTable[text.charAt(0)] + text.substring(1);
	    }

	    return moment.lang('br', {
	        months : "Genver_C'hwevrer_Meurzh_Ebrel_Mae_Mezheven_Gouere_Eost_Gwengolo_Here_Du_Kerzu".split("_"),
	        monthsShort : "Gen_C'hwe_Meu_Ebr_Mae_Eve_Gou_Eos_Gwe_Her_Du_Ker".split("_"),
	        weekdays : "Sul_Lun_Meurzh_Merc'her_Yaou_Gwener_Sadorn".split("_"),
	        weekdaysShort : "Sul_Lun_Meu_Mer_Yao_Gwe_Sad".split("_"),
	        weekdaysMin : "Su_Lu_Me_Mer_Ya_Gw_Sa".split("_"),
	        longDateFormat : {
	            LT : "h[e]mm A",
	            L : "DD/MM/YYYY",
	            LL : "D [a viz] MMMM YYYY",
	            LLL : "D [a viz] MMMM YYYY LT",
	            LLLL : "dddd, D [a viz] MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay : '[Hiziv da] LT',
	            nextDay : '[Warc\'hoazh da] LT',
	            nextWeek : 'dddd [da] LT',
	            lastDay : '[Dec\'h da] LT',
	            lastWeek : 'dddd [paset da] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "a-benn %s",
	            past : "%s 'zo",
	            s : "un nebeud segondennoù",
	            m : "ur vunutenn",
	            mm : relativeTimeWithMutation,
	            h : "un eur",
	            hh : "%d eur",
	            d : "un devezh",
	            dd : relativeTimeWithMutation,
	            M : "ur miz",
	            MM : relativeTimeWithMutation,
	            y : "ur bloaz",
	            yy : specialMutationForYears
	        },
	        ordinal : function (number) {
	            var output = (number === 1) ? 'añ' : 'vet';
	            return number + output;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 16 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : bosnian (bs)
	// author : Nedim Cholich : https://github.com/frontyard
	// based on (hr) translation by Bojan Marković

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {

	    function translate(number, withoutSuffix, key) {
	        var result = number + " ";
	        switch (key) {
	        case 'm':
	            return withoutSuffix ? 'jedna minuta' : 'jedne minute';
	        case 'mm':
	            if (number === 1) {
	                result += 'minuta';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'minute';
	            } else {
	                result += 'minuta';
	            }
	            return result;
	        case 'h':
	            return withoutSuffix ? 'jedan sat' : 'jednog sata';
	        case 'hh':
	            if (number === 1) {
	                result += 'sat';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'sata';
	            } else {
	                result += 'sati';
	            }
	            return result;
	        case 'dd':
	            if (number === 1) {
	                result += 'dan';
	            } else {
	                result += 'dana';
	            }
	            return result;
	        case 'MM':
	            if (number === 1) {
	                result += 'mjesec';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'mjeseca';
	            } else {
	                result += 'mjeseci';
	            }
	            return result;
	        case 'yy':
	            if (number === 1) {
	                result += 'godina';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'godine';
	            } else {
	                result += 'godina';
	            }
	            return result;
	        }
	    }

	    return moment.lang('bs', {
			months : "januar_februar_mart_april_maj_juni_juli_avgust_septembar_oktobar_novembar_decembar".split("_"),
			monthsShort : "jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.".split("_"),
	        weekdays : "nedjelja_ponedjeljak_utorak_srijeda_četvrtak_petak_subota".split("_"),
	        weekdaysShort : "ned._pon._uto._sri._čet._pet._sub.".split("_"),
	        weekdaysMin : "ne_po_ut_sr_če_pe_su".split("_"),
	        longDateFormat : {
	            LT : "H:mm",
	            L : "DD. MM. YYYY",
	            LL : "D. MMMM YYYY",
	            LLL : "D. MMMM YYYY LT",
	            LLLL : "dddd, D. MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay  : '[danas u] LT',
	            nextDay  : '[sutra u] LT',

	            nextWeek : function () {
	                switch (this.day()) {
	                case 0:
	                    return '[u] [nedjelju] [u] LT';
	                case 3:
	                    return '[u] [srijedu] [u] LT';
	                case 6:
	                    return '[u] [subotu] [u] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[u] dddd [u] LT';
	                }
	            },
	            lastDay  : '[jučer u] LT',
	            lastWeek : function () {
	                switch (this.day()) {
	                case 0:
	                case 3:
	                    return '[prošlu] dddd [u] LT';
	                case 6:
	                    return '[prošle] [subote] [u] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[prošli] dddd [u] LT';
	                }
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "za %s",
	            past   : "prije %s",
	            s      : "par sekundi",
	            m      : translate,
	            mm     : translate,
	            h      : translate,
	            hh     : translate,
	            d      : "dan",
	            dd     : translate,
	            M      : "mjesec",
	            MM     : translate,
	            y      : "godinu",
	            yy     : translate
	        },
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 17 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : catalan (ca)
	// author : Juan G. Hurtado : https://github.com/juanghurtado

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('ca', {
	        months : "gener_febrer_març_abril_maig_juny_juliol_agost_setembre_octubre_novembre_desembre".split("_"),
	        monthsShort : "gen._febr._mar._abr._mai._jun._jul._ag._set._oct._nov._des.".split("_"),
	        weekdays : "diumenge_dilluns_dimarts_dimecres_dijous_divendres_dissabte".split("_"),
	        weekdaysShort : "dg._dl._dt._dc._dj._dv._ds.".split("_"),
	        weekdaysMin : "Dg_Dl_Dt_Dc_Dj_Dv_Ds".split("_"),
	        longDateFormat : {
	            LT : "H:mm",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd D MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay : function () {
	                return '[avui a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
	            },
	            nextDay : function () {
	                return '[demà a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
	            },
	            nextWeek : function () {
	                return 'dddd [a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
	            },
	            lastDay : function () {
	                return '[ahir a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
	            },
	            lastWeek : function () {
	                return '[el] dddd [passat a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "en %s",
	            past : "fa %s",
	            s : "uns segons",
	            m : "un minut",
	            mm : "%d minuts",
	            h : "una hora",
	            hh : "%d hores",
	            d : "un dia",
	            dd : "%d dies",
	            M : "un mes",
	            MM : "%d mesos",
	            y : "un any",
	            yy : "%d anys"
	        },
	        ordinal : '%dº',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 18 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : czech (cs)
	// author : petrbela : https://github.com/petrbela

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    var months = "leden_únor_březen_duben_květen_červen_červenec_srpen_září_říjen_listopad_prosinec".split("_"),
	        monthsShort = "led_úno_bře_dub_kvě_čvn_čvc_srp_zář_říj_lis_pro".split("_");

	    function plural(n) {
	        return (n > 1) && (n < 5) && (~~(n / 10) !== 1);
	    }

	    function translate(number, withoutSuffix, key, isFuture) {
	        var result = number + " ";
	        switch (key) {
	        case 's':  // a few seconds / in a few seconds / a few seconds ago
	            return (withoutSuffix || isFuture) ? 'pár vteřin' : 'pár vteřinami';
	        case 'm':  // a minute / in a minute / a minute ago
	            return withoutSuffix ? 'minuta' : (isFuture ? 'minutu' : 'minutou');
	        case 'mm': // 9 minutes / in 9 minutes / 9 minutes ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'minuty' : 'minut');
	            } else {
	                return result + 'minutami';
	            }
	            break;
	        case 'h':  // an hour / in an hour / an hour ago
	            return withoutSuffix ? 'hodina' : (isFuture ? 'hodinu' : 'hodinou');
	        case 'hh': // 9 hours / in 9 hours / 9 hours ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'hodiny' : 'hodin');
	            } else {
	                return result + 'hodinami';
	            }
	            break;
	        case 'd':  // a day / in a day / a day ago
	            return (withoutSuffix || isFuture) ? 'den' : 'dnem';
	        case 'dd': // 9 days / in 9 days / 9 days ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'dny' : 'dní');
	            } else {
	                return result + 'dny';
	            }
	            break;
	        case 'M':  // a month / in a month / a month ago
	            return (withoutSuffix || isFuture) ? 'měsíc' : 'měsícem';
	        case 'MM': // 9 months / in 9 months / 9 months ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'měsíce' : 'měsíců');
	            } else {
	                return result + 'měsíci';
	            }
	            break;
	        case 'y':  // a year / in a year / a year ago
	            return (withoutSuffix || isFuture) ? 'rok' : 'rokem';
	        case 'yy': // 9 years / in 9 years / 9 years ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'roky' : 'let');
	            } else {
	                return result + 'lety';
	            }
	            break;
	        }
	    }

	    return moment.lang('cs', {
	        months : months,
	        monthsShort : monthsShort,
	        monthsParse : (function (months, monthsShort) {
	            var i, _monthsParse = [];
	            for (i = 0; i < 12; i++) {
	                // use custom parser to solve problem with July (červenec)
	                _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
	            }
	            return _monthsParse;
	        }(months, monthsShort)),
	        weekdays : "neděle_pondělí_úterý_středa_čtvrtek_pátek_sobota".split("_"),
	        weekdaysShort : "ne_po_út_st_čt_pá_so".split("_"),
	        weekdaysMin : "ne_po_út_st_čt_pá_so".split("_"),
	        longDateFormat : {
	            LT: "H:mm",
	            L : "DD.MM.YYYY",
	            LL : "D. MMMM YYYY",
	            LLL : "D. MMMM YYYY LT",
	            LLLL : "dddd D. MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay: "[dnes v] LT",
	            nextDay: '[zítra v] LT',
	            nextWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[v neděli v] LT';
	                case 1:
	                case 2:
	                    return '[v] dddd [v] LT';
	                case 3:
	                    return '[ve středu v] LT';
	                case 4:
	                    return '[ve čtvrtek v] LT';
	                case 5:
	                    return '[v pátek v] LT';
	                case 6:
	                    return '[v sobotu v] LT';
	                }
	            },
	            lastDay: '[včera v] LT',
	            lastWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[minulou neděli v] LT';
	                case 1:
	                case 2:
	                    return '[minulé] dddd [v] LT';
	                case 3:
	                    return '[minulou středu v] LT';
	                case 4:
	                case 5:
	                    return '[minulý] dddd [v] LT';
	                case 6:
	                    return '[minulou sobotu v] LT';
	                }
	            },
	            sameElse: "L"
	        },
	        relativeTime : {
	            future : "za %s",
	            past : "před %s",
	            s : translate,
	            m : translate,
	            mm : translate,
	            h : translate,
	            hh : translate,
	            d : translate,
	            dd : translate,
	            M : translate,
	            MM : translate,
	            y : translate,
	            yy : translate
	        },
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 19 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : chuvash (cv)
	// author : Anatoly Mironov : https://github.com/mirontoli

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('cv', {
	        months : "кăрлач_нарăс_пуш_ака_май_çĕртме_утă_çурла_авăн_юпа_чӳк_раштав".split("_"),
	        monthsShort : "кăр_нар_пуш_ака_май_çĕр_утă_çур_ав_юпа_чӳк_раш".split("_"),
	        weekdays : "вырсарникун_тунтикун_ытларикун_юнкун_кĕçнерникун_эрнекун_шăматкун".split("_"),
	        weekdaysShort : "выр_тун_ытл_юн_кĕç_эрн_шăм".split("_"),
	        weekdaysMin : "вр_тн_ыт_юн_кç_эр_шм".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD-MM-YYYY",
	            LL : "YYYY [çулхи] MMMM [уйăхĕн] D[-мĕшĕ]",
	            LLL : "YYYY [çулхи] MMMM [уйăхĕн] D[-мĕшĕ], LT",
	            LLLL : "dddd, YYYY [çулхи] MMMM [уйăхĕн] D[-мĕшĕ], LT"
	        },
	        calendar : {
	            sameDay: '[Паян] LT [сехетре]',
	            nextDay: '[Ыран] LT [сехетре]',
	            lastDay: '[Ĕнер] LT [сехетре]',
	            nextWeek: '[Çитес] dddd LT [сехетре]',
	            lastWeek: '[Иртнĕ] dddd LT [сехетре]',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : function (output) {
	                var affix = /сехет$/i.exec(output) ? "рен" : /çул$/i.exec(output) ? "тан" : "ран";
	                return output + affix;
	            },
	            past : "%s каялла",
	            s : "пĕр-ик çеккунт",
	            m : "пĕр минут",
	            mm : "%d минут",
	            h : "пĕр сехет",
	            hh : "%d сехет",
	            d : "пĕр кун",
	            dd : "%d кун",
	            M : "пĕр уйăх",
	            MM : "%d уйăх",
	            y : "пĕр çул",
	            yy : "%d çул"
	        },
	        ordinal : '%d-мĕш',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 20 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : Welsh (cy)
	// author : Robert Allen

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang("cy", {
	        months: "Ionawr_Chwefror_Mawrth_Ebrill_Mai_Mehefin_Gorffennaf_Awst_Medi_Hydref_Tachwedd_Rhagfyr".split("_"),
	        monthsShort: "Ion_Chwe_Maw_Ebr_Mai_Meh_Gor_Aws_Med_Hyd_Tach_Rhag".split("_"),
	        weekdays: "Dydd Sul_Dydd Llun_Dydd Mawrth_Dydd Mercher_Dydd Iau_Dydd Gwener_Dydd Sadwrn".split("_"),
	        weekdaysShort: "Sul_Llun_Maw_Mer_Iau_Gwe_Sad".split("_"),
	        weekdaysMin: "Su_Ll_Ma_Me_Ia_Gw_Sa".split("_"),
	        // time formats are the same as en-gb
	        longDateFormat: {
	            LT: "HH:mm",
	            L: "DD/MM/YYYY",
	            LL: "D MMMM YYYY",
	            LLL: "D MMMM YYYY LT",
	            LLLL: "dddd, D MMMM YYYY LT"
	        },
	        calendar: {
	            sameDay: '[Heddiw am] LT',
	            nextDay: '[Yfory am] LT',
	            nextWeek: 'dddd [am] LT',
	            lastDay: '[Ddoe am] LT',
	            lastWeek: 'dddd [diwethaf am] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: "mewn %s",
	            past: "%s yn àl",
	            s: "ychydig eiliadau",
	            m: "munud",
	            mm: "%d munud",
	            h: "awr",
	            hh: "%d awr",
	            d: "diwrnod",
	            dd: "%d diwrnod",
	            M: "mis",
	            MM: "%d mis",
	            y: "blwyddyn",
	            yy: "%d flynedd"
	        },
	        // traditional ordinal numbers above 31 are not commonly used in colloquial Welsh
	        ordinal: function (number) {
	            var b = number,
	                output = '',
	                lookup = [
	                    '', 'af', 'il', 'ydd', 'ydd', 'ed', 'ed', 'ed', 'fed', 'fed', 'fed', // 1af to 10fed
	                    'eg', 'fed', 'eg', 'eg', 'fed', 'eg', 'eg', 'fed', 'eg', 'fed' // 11eg to 20fed
	                ];

	            if (b > 20) {
	                if (b === 40 || b === 50 || b === 60 || b === 80 || b === 100) {
	                    output = 'fed'; // not 30ain, 70ain or 90ain
	                } else {
	                    output = 'ain';
	                }
	            } else if (b > 0) {
	                output = lookup[b];
	            }

	            return number + output;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 21 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : danish (da)
	// author : Ulrik Nielsen : https://github.com/mrbase

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('da', {
	        months : "januar_februar_marts_april_maj_juni_juli_august_september_oktober_november_december".split("_"),
	        monthsShort : "jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec".split("_"),
	        weekdays : "søndag_mandag_tirsdag_onsdag_torsdag_fredag_lørdag".split("_"),
	        weekdaysShort : "søn_man_tir_ons_tor_fre_lør".split("_"),
	        weekdaysMin : "sø_ma_ti_on_to_fr_lø".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd D. MMMM, YYYY LT"
	        },
	        calendar : {
	            sameDay : '[I dag kl.] LT',
	            nextDay : '[I morgen kl.] LT',
	            nextWeek : 'dddd [kl.] LT',
	            lastDay : '[I går kl.] LT',
	            lastWeek : '[sidste] dddd [kl] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "om %s",
	            past : "%s siden",
	            s : "få sekunder",
	            m : "et minut",
	            mm : "%d minutter",
	            h : "en time",
	            hh : "%d timer",
	            d : "en dag",
	            dd : "%d dage",
	            M : "en måned",
	            MM : "%d måneder",
	            y : "et år",
	            yy : "%d år"
	        },
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 22 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : german (de)
	// author : lluchs : https://github.com/lluchs
	// author: Menelion Elensúle: https://github.com/Oire

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    function processRelativeTime(number, withoutSuffix, key, isFuture) {
	        var format = {
	            'm': ['eine Minute', 'einer Minute'],
	            'h': ['eine Stunde', 'einer Stunde'],
	            'd': ['ein Tag', 'einem Tag'],
	            'dd': [number + ' Tage', number + ' Tagen'],
	            'M': ['ein Monat', 'einem Monat'],
	            'MM': [number + ' Monate', number + ' Monaten'],
	            'y': ['ein Jahr', 'einem Jahr'],
	            'yy': [number + ' Jahre', number + ' Jahren']
	        };
	        return withoutSuffix ? format[key][0] : format[key][1];
	    }

	    return moment.lang('de', {
	        months : "Januar_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember".split("_"),
	        monthsShort : "Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.".split("_"),
	        weekdays : "Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag".split("_"),
	        weekdaysShort : "So._Mo._Di._Mi._Do._Fr._Sa.".split("_"),
	        weekdaysMin : "So_Mo_Di_Mi_Do_Fr_Sa".split("_"),
	        longDateFormat : {
	            LT: "H:mm [Uhr]",
	            L : "DD.MM.YYYY",
	            LL : "D. MMMM YYYY",
	            LLL : "D. MMMM YYYY LT",
	            LLLL : "dddd, D. MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay: "[Heute um] LT",
	            sameElse: "L",
	            nextDay: '[Morgen um] LT',
	            nextWeek: 'dddd [um] LT',
	            lastDay: '[Gestern um] LT',
	            lastWeek: '[letzten] dddd [um] LT'
	        },
	        relativeTime : {
	            future : "in %s",
	            past : "vor %s",
	            s : "ein paar Sekunden",
	            m : processRelativeTime,
	            mm : "%d Minuten",
	            h : processRelativeTime,
	            hh : "%d Stunden",
	            d : processRelativeTime,
	            dd : processRelativeTime,
	            M : processRelativeTime,
	            MM : processRelativeTime,
	            y : processRelativeTime,
	            yy : processRelativeTime
	        },
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 23 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : modern greek (el)
	// author : Aggelos Karalias : https://github.com/mehiel

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('el', {
	        monthsNominativeEl : "Ιανουάριος_Φεβρουάριος_Μάρτιος_Απρίλιος_Μάιος_Ιούνιος_Ιούλιος_Αύγουστος_Σεπτέμβριος_Οκτώβριος_Νοέμβριος_Δεκέμβριος".split("_"),
	        monthsGenitiveEl : "Ιανουαρίου_Φεβρουαρίου_Μαρτίου_Απριλίου_Μαΐου_Ιουνίου_Ιουλίου_Αυγούστου_Σεπτεμβρίου_Οκτωβρίου_Νοεμβρίου_Δεκεμβρίου".split("_"),
	        months : function (momentToFormat, format) {
	            if (/D/.test(format.substring(0, format.indexOf("MMMM")))) { // if there is a day number before 'MMMM'
	                return this._monthsGenitiveEl[momentToFormat.month()];
	            } else {
	                return this._monthsNominativeEl[momentToFormat.month()];
	            }
	        },
	        monthsShort : "Ιαν_Φεβ_Μαρ_Απρ_Μαϊ_Ιουν_Ιουλ_Αυγ_Σεπ_Οκτ_Νοε_Δεκ".split("_"),
	        weekdays : "Κυριακή_Δευτέρα_Τρίτη_Τετάρτη_Πέμπτη_Παρασκευή_Σάββατο".split("_"),
	        weekdaysShort : "Κυρ_Δευ_Τρι_Τετ_Πεμ_Παρ_Σαβ".split("_"),
	        weekdaysMin : "Κυ_Δε_Τρ_Τε_Πε_Πα_Σα".split("_"),
	        meridiem : function (hours, minutes, isLower) {
	            if (hours > 11) {
	                return isLower ? 'μμ' : 'ΜΜ';
	            } else {
	                return isLower ? 'πμ' : 'ΠΜ';
	            }
	        },
	        longDateFormat : {
	            LT : "h:mm A",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd, D MMMM YYYY LT"
	        },
	        calendarEl : {
	            sameDay : '[Σήμερα {}] LT',
	            nextDay : '[Αύριο {}] LT',
	            nextWeek : 'dddd [{}] LT',
	            lastDay : '[Χθες {}] LT',
	            lastWeek : '[την προηγούμενη] dddd [{}] LT',
	            sameElse : 'L'
	        },
	        calendar : function (key, mom) {
	            var output = this._calendarEl[key],
	                hours = mom && mom.hours();

	            return output.replace("{}", (hours % 12 === 1 ? "στη" : "στις"));
	        },
	        relativeTime : {
	            future : "σε %s",
	            past : "%s πριν",
	            s : "δευτερόλεπτα",
	            m : "ένα λεπτό",
	            mm : "%d λεπτά",
	            h : "μία ώρα",
	            hh : "%d ώρες",
	            d : "μία μέρα",
	            dd : "%d μέρες",
	            M : "ένας μήνας",
	            MM : "%d μήνες",
	            y : "ένας χρόνος",
	            yy : "%d χρόνια"
	        },
	        ordinal : function (number) {
	            return number + 'η';
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 24 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : australian english (en-au)

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('en-au', {
	        months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
	        monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
	        weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
	        weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
	        weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
	        longDateFormat : {
	            LT : "h:mm A",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd, D MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay : '[Today at] LT',
	            nextDay : '[Tomorrow at] LT',
	            nextWeek : 'dddd [at] LT',
	            lastDay : '[Yesterday at] LT',
	            lastWeek : '[Last] dddd [at] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "in %s",
	            past : "%s ago",
	            s : "a few seconds",
	            m : "a minute",
	            mm : "%d minutes",
	            h : "an hour",
	            hh : "%d hours",
	            d : "a day",
	            dd : "%d days",
	            M : "a month",
	            MM : "%d months",
	            y : "a year",
	            yy : "%d years"
	        },
	        ordinal : function (number) {
	            var b = number % 10,
	                output = (~~ (number % 100 / 10) === 1) ? 'th' :
	                (b === 1) ? 'st' :
	                (b === 2) ? 'nd' :
	                (b === 3) ? 'rd' : 'th';
	            return number + output;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 25 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : canadian english (en-ca)
	// author : Jonathan Abourbih : https://github.com/jonbca

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('en-ca', {
	        months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
	        monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
	        weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
	        weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
	        weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
	        longDateFormat : {
	            LT : "h:mm A",
	            L : "YYYY-MM-DD",
	            LL : "D MMMM, YYYY",
	            LLL : "D MMMM, YYYY LT",
	            LLLL : "dddd, D MMMM, YYYY LT"
	        },
	        calendar : {
	            sameDay : '[Today at] LT',
	            nextDay : '[Tomorrow at] LT',
	            nextWeek : 'dddd [at] LT',
	            lastDay : '[Yesterday at] LT',
	            lastWeek : '[Last] dddd [at] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "in %s",
	            past : "%s ago",
	            s : "a few seconds",
	            m : "a minute",
	            mm : "%d minutes",
	            h : "an hour",
	            hh : "%d hours",
	            d : "a day",
	            dd : "%d days",
	            M : "a month",
	            MM : "%d months",
	            y : "a year",
	            yy : "%d years"
	        },
	        ordinal : function (number) {
	            var b = number % 10,
	                output = (~~ (number % 100 / 10) === 1) ? 'th' :
	                (b === 1) ? 'st' :
	                (b === 2) ? 'nd' :
	                (b === 3) ? 'rd' : 'th';
	            return number + output;
	        }
	    });
	}));


/***/ },
/* 26 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : great britain english (en-gb)
	// author : Chris Gedrim : https://github.com/chrisgedrim

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('en-gb', {
	        months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
	        monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
	        weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
	        weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
	        weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd, D MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay : '[Today at] LT',
	            nextDay : '[Tomorrow at] LT',
	            nextWeek : 'dddd [at] LT',
	            lastDay : '[Yesterday at] LT',
	            lastWeek : '[Last] dddd [at] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "in %s",
	            past : "%s ago",
	            s : "a few seconds",
	            m : "a minute",
	            mm : "%d minutes",
	            h : "an hour",
	            hh : "%d hours",
	            d : "a day",
	            dd : "%d days",
	            M : "a month",
	            MM : "%d months",
	            y : "a year",
	            yy : "%d years"
	        },
	        ordinal : function (number) {
	            var b = number % 10,
	                output = (~~ (number % 100 / 10) === 1) ? 'th' :
	                (b === 1) ? 'st' :
	                (b === 2) ? 'nd' :
	                (b === 3) ? 'rd' : 'th';
	            return number + output;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 27 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : esperanto (eo)
	// author : Colin Dean : https://github.com/colindean
	// komento: Mi estas malcerta se mi korekte traktis akuzativojn en tiu traduko.
	//          Se ne, bonvolu korekti kaj avizi min por ke mi povas lerni!

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('eo', {
	        months : "januaro_februaro_marto_aprilo_majo_junio_julio_aŭgusto_septembro_oktobro_novembro_decembro".split("_"),
	        monthsShort : "jan_feb_mar_apr_maj_jun_jul_aŭg_sep_okt_nov_dec".split("_"),
	        weekdays : "Dimanĉo_Lundo_Mardo_Merkredo_Ĵaŭdo_Vendredo_Sabato".split("_"),
	        weekdaysShort : "Dim_Lun_Mard_Merk_Ĵaŭ_Ven_Sab".split("_"),
	        weekdaysMin : "Di_Lu_Ma_Me_Ĵa_Ve_Sa".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "YYYY-MM-DD",
	            LL : "D[-an de] MMMM, YYYY",
	            LLL : "D[-an de] MMMM, YYYY LT",
	            LLLL : "dddd, [la] D[-an de] MMMM, YYYY LT"
	        },
	        meridiem : function (hours, minutes, isLower) {
	            if (hours > 11) {
	                return isLower ? 'p.t.m.' : 'P.T.M.';
	            } else {
	                return isLower ? 'a.t.m.' : 'A.T.M.';
	            }
	        },
	        calendar : {
	            sameDay : '[Hodiaŭ je] LT',
	            nextDay : '[Morgaŭ je] LT',
	            nextWeek : 'dddd [je] LT',
	            lastDay : '[Hieraŭ je] LT',
	            lastWeek : '[pasinta] dddd [je] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "je %s",
	            past : "antaŭ %s",
	            s : "sekundoj",
	            m : "minuto",
	            mm : "%d minutoj",
	            h : "horo",
	            hh : "%d horoj",
	            d : "tago",//ne 'diurno', ĉar estas uzita por proksimumo
	            dd : "%d tagoj",
	            M : "monato",
	            MM : "%d monatoj",
	            y : "jaro",
	            yy : "%d jaroj"
	        },
	        ordinal : "%da",
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 28 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : spanish (es)
	// author : Julio Napurí : https://github.com/julionc

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('es', {
	        months : "enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre".split("_"),
	        monthsShort : "ene._feb._mar._abr._may._jun._jul._ago._sep._oct._nov._dic.".split("_"),
	        weekdays : "domingo_lunes_martes_miércoles_jueves_viernes_sábado".split("_"),
	        weekdaysShort : "dom._lun._mar._mié._jue._vie._sáb.".split("_"),
	        weekdaysMin : "Do_Lu_Ma_Mi_Ju_Vi_Sá".split("_"),
	        longDateFormat : {
	            LT : "H:mm",
	            L : "DD/MM/YYYY",
	            LL : "D [de] MMMM [de] YYYY",
	            LLL : "D [de] MMMM [de] YYYY LT",
	            LLLL : "dddd, D [de] MMMM [de] YYYY LT"
	        },
	        calendar : {
	            sameDay : function () {
	                return '[hoy a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
	            },
	            nextDay : function () {
	                return '[mañana a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
	            },
	            nextWeek : function () {
	                return 'dddd [a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
	            },
	            lastDay : function () {
	                return '[ayer a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
	            },
	            lastWeek : function () {
	                return '[el] dddd [pasado a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "en %s",
	            past : "hace %s",
	            s : "unos segundos",
	            m : "un minuto",
	            mm : "%d minutos",
	            h : "una hora",
	            hh : "%d horas",
	            d : "un día",
	            dd : "%d días",
	            M : "un mes",
	            MM : "%d meses",
	            y : "un año",
	            yy : "%d años"
	        },
	        ordinal : '%dº',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 29 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : estonian (et)
	// author : Henry Kehlmann : https://github.com/madhenry
	// improvements : Illimar Tambek : https://github.com/ragulka

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    function processRelativeTime(number, withoutSuffix, key, isFuture) {
	        var format = {
	            's' : ['mõne sekundi', 'mõni sekund', 'paar sekundit'],
	            'm' : ['ühe minuti', 'üks minut'],
	            'mm': [number + ' minuti', number + ' minutit'],
	            'h' : ['ühe tunni', 'tund aega', 'üks tund'],
	            'hh': [number + ' tunni', number + ' tundi'],
	            'd' : ['ühe päeva', 'üks päev'],
	            'M' : ['kuu aja', 'kuu aega', 'üks kuu'],
	            'MM': [number + ' kuu', number + ' kuud'],
	            'y' : ['ühe aasta', 'aasta', 'üks aasta'],
	            'yy': [number + ' aasta', number + ' aastat']
	        };
	        if (withoutSuffix) {
	            return format[key][2] ? format[key][2] : format[key][1];
	        }
	        return isFuture ? format[key][0] : format[key][1];
	    }

	    return moment.lang('et', {
	        months        : "jaanuar_veebruar_märts_aprill_mai_juuni_juuli_august_september_oktoober_november_detsember".split("_"),
	        monthsShort   : "jaan_veebr_märts_apr_mai_juuni_juuli_aug_sept_okt_nov_dets".split("_"),
	        weekdays      : "pühapäev_esmaspäev_teisipäev_kolmapäev_neljapäev_reede_laupäev".split("_"),
	        weekdaysShort : "P_E_T_K_N_R_L".split("_"),
	        weekdaysMin   : "P_E_T_K_N_R_L".split("_"),
	        longDateFormat : {
	            LT   : "H:mm",
	            L    : "DD.MM.YYYY",
	            LL   : "D. MMMM YYYY",
	            LLL  : "D. MMMM YYYY LT",
	            LLLL : "dddd, D. MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay  : '[Täna,] LT',
	            nextDay  : '[Homme,] LT',
	            nextWeek : '[Järgmine] dddd LT',
	            lastDay  : '[Eile,] LT',
	            lastWeek : '[Eelmine] dddd LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "%s pärast",
	            past   : "%s tagasi",
	            s      : processRelativeTime,
	            m      : processRelativeTime,
	            mm     : processRelativeTime,
	            h      : processRelativeTime,
	            hh     : processRelativeTime,
	            d      : processRelativeTime,
	            dd     : '%d päeva',
	            M      : processRelativeTime,
	            MM     : processRelativeTime,
	            y      : processRelativeTime,
	            yy     : processRelativeTime
	        },
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 30 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : euskara (eu)
	// author : Eneko Illarramendi : https://github.com/eillarra

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('eu', {
	        months : "urtarrila_otsaila_martxoa_apirila_maiatza_ekaina_uztaila_abuztua_iraila_urria_azaroa_abendua".split("_"),
	        monthsShort : "urt._ots._mar._api._mai._eka._uzt._abu._ira._urr._aza._abe.".split("_"),
	        weekdays : "igandea_astelehena_asteartea_asteazkena_osteguna_ostirala_larunbata".split("_"),
	        weekdaysShort : "ig._al._ar._az._og._ol._lr.".split("_"),
	        weekdaysMin : "ig_al_ar_az_og_ol_lr".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "YYYY-MM-DD",
	            LL : "YYYY[ko] MMMM[ren] D[a]",
	            LLL : "YYYY[ko] MMMM[ren] D[a] LT",
	            LLLL : "dddd, YYYY[ko] MMMM[ren] D[a] LT",
	            l : "YYYY-M-D",
	            ll : "YYYY[ko] MMM D[a]",
	            lll : "YYYY[ko] MMM D[a] LT",
	            llll : "ddd, YYYY[ko] MMM D[a] LT"
	        },
	        calendar : {
	            sameDay : '[gaur] LT[etan]',
	            nextDay : '[bihar] LT[etan]',
	            nextWeek : 'dddd LT[etan]',
	            lastDay : '[atzo] LT[etan]',
	            lastWeek : '[aurreko] dddd LT[etan]',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "%s barru",
	            past : "duela %s",
	            s : "segundo batzuk",
	            m : "minutu bat",
	            mm : "%d minutu",
	            h : "ordu bat",
	            hh : "%d ordu",
	            d : "egun bat",
	            dd : "%d egun",
	            M : "hilabete bat",
	            MM : "%d hilabete",
	            y : "urte bat",
	            yy : "%d urte"
	        },
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 31 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : Persian Language
	// author : Ebrahim Byagowi : https://github.com/ebraminio

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    var symbolMap = {
	        '1': '۱',
	        '2': '۲',
	        '3': '۳',
	        '4': '۴',
	        '5': '۵',
	        '6': '۶',
	        '7': '۷',
	        '8': '۸',
	        '9': '۹',
	        '0': '۰'
	    }, numberMap = {
	        '۱': '1',
	        '۲': '2',
	        '۳': '3',
	        '۴': '4',
	        '۵': '5',
	        '۶': '6',
	        '۷': '7',
	        '۸': '8',
	        '۹': '9',
	        '۰': '0'
	    };

	    return moment.lang('fa', {
	        months : 'ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر'.split('_'),
	        monthsShort : 'ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر'.split('_'),
	        weekdays : 'یک\u200cشنبه_دوشنبه_سه\u200cشنبه_چهارشنبه_پنج\u200cشنبه_جمعه_شنبه'.split('_'),
	        weekdaysShort : 'یک\u200cشنبه_دوشنبه_سه\u200cشنبه_چهارشنبه_پنج\u200cشنبه_جمعه_شنبه'.split('_'),
	        weekdaysMin : 'ی_د_س_چ_پ_ج_ش'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd, D MMMM YYYY LT'
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 12) {
	                return "قبل از ظهر";
	            } else {
	                return "بعد از ظهر";
	            }
	        },
	        calendar : {
	            sameDay : '[امروز ساعت] LT',
	            nextDay : '[فردا ساعت] LT',
	            nextWeek : 'dddd [ساعت] LT',
	            lastDay : '[دیروز ساعت] LT',
	            lastWeek : 'dddd [پیش] [ساعت] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'در %s',
	            past : '%s پیش',
	            s : 'چندین ثانیه',
	            m : 'یک دقیقه',
	            mm : '%d دقیقه',
	            h : 'یک ساعت',
	            hh : '%d ساعت',
	            d : 'یک روز',
	            dd : '%d روز',
	            M : 'یک ماه',
	            MM : '%d ماه',
	            y : 'یک سال',
	            yy : '%d سال'
	        },
	        preparse: function (string) {
	            return string.replace(/[۰-۹]/g, function (match) {
	                return numberMap[match];
	            }).replace(/،/g, ',');
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            }).replace(/,/g, '،');
	        },
	        ordinal : '%dم',
	        week : {
	            dow : 6, // Saturday is the first day of the week.
	            doy : 12 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 32 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : finnish (fi)
	// author : Tarmo Aidantausta : https://github.com/bleadof

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    var numbers_past = 'nolla yksi kaksi kolme neljä viisi kuusi seitsemän kahdeksan yhdeksän'.split(' '),
	        numbers_future = ['nolla', 'yhden', 'kahden', 'kolmen', 'neljän', 'viiden', 'kuuden',
	                          numbers_past[7], numbers_past[8], numbers_past[9]];

	    function translate(number, withoutSuffix, key, isFuture) {
	        var result = "";
	        switch (key) {
	        case 's':
	            return isFuture ? 'muutaman sekunnin' : 'muutama sekunti';
	        case 'm':
	            return isFuture ? 'minuutin' : 'minuutti';
	        case 'mm':
	            result = isFuture ? 'minuutin' : 'minuuttia';
	            break;
	        case 'h':
	            return isFuture ? 'tunnin' : 'tunti';
	        case 'hh':
	            result = isFuture ? 'tunnin' : 'tuntia';
	            break;
	        case 'd':
	            return isFuture ? 'päivän' : 'päivä';
	        case 'dd':
	            result = isFuture ? 'päivän' : 'päivää';
	            break;
	        case 'M':
	            return isFuture ? 'kuukauden' : 'kuukausi';
	        case 'MM':
	            result = isFuture ? 'kuukauden' : 'kuukautta';
	            break;
	        case 'y':
	            return isFuture ? 'vuoden' : 'vuosi';
	        case 'yy':
	            result = isFuture ? 'vuoden' : 'vuotta';
	            break;
	        }
	        result = verbal_number(number, isFuture) + " " + result;
	        return result;
	    }

	    function verbal_number(number, isFuture) {
	        return number < 10 ? (isFuture ? numbers_future[number] : numbers_past[number]) : number;
	    }

	    return moment.lang('fi', {
	        months : "tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kesäkuu_heinäkuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu".split("_"),
	        monthsShort : "tammi_helmi_maalis_huhti_touko_kesä_heinä_elo_syys_loka_marras_joulu".split("_"),
	        weekdays : "sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai".split("_"),
	        weekdaysShort : "su_ma_ti_ke_to_pe_la".split("_"),
	        weekdaysMin : "su_ma_ti_ke_to_pe_la".split("_"),
	        longDateFormat : {
	            LT : "HH.mm",
	            L : "DD.MM.YYYY",
	            LL : "Do MMMM[ta] YYYY",
	            LLL : "Do MMMM[ta] YYYY, [klo] LT",
	            LLLL : "dddd, Do MMMM[ta] YYYY, [klo] LT",
	            l : "D.M.YYYY",
	            ll : "Do MMM YYYY",
	            lll : "Do MMM YYYY, [klo] LT",
	            llll : "ddd, Do MMM YYYY, [klo] LT"
	        },
	        calendar : {
	            sameDay : '[tänään] [klo] LT',
	            nextDay : '[huomenna] [klo] LT',
	            nextWeek : 'dddd [klo] LT',
	            lastDay : '[eilen] [klo] LT',
	            lastWeek : '[viime] dddd[na] [klo] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "%s päästä",
	            past : "%s sitten",
	            s : translate,
	            m : translate,
	            mm : translate,
	            h : translate,
	            hh : translate,
	            d : translate,
	            dd : translate,
	            M : translate,
	            MM : translate,
	            y : translate,
	            yy : translate
	        },
	        ordinal : "%d.",
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 33 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : faroese (fo)
	// author : Ragnar Johannesen : https://github.com/ragnar123

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('fo', {
	        months : "januar_februar_mars_apríl_mai_juni_juli_august_september_oktober_november_desember".split("_"),
	        monthsShort : "jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des".split("_"),
	        weekdays : "sunnudagur_mánadagur_týsdagur_mikudagur_hósdagur_fríggjadagur_leygardagur".split("_"),
	        weekdaysShort : "sun_mán_týs_mik_hós_frí_ley".split("_"),
	        weekdaysMin : "su_má_tý_mi_hó_fr_le".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd D. MMMM, YYYY LT"
	        },
	        calendar : {
	            sameDay : '[Í dag kl.] LT',
	            nextDay : '[Í morgin kl.] LT',
	            nextWeek : 'dddd [kl.] LT',
	            lastDay : '[Í gjár kl.] LT',
	            lastWeek : '[síðstu] dddd [kl] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "um %s",
	            past : "%s síðani",
	            s : "fá sekund",
	            m : "ein minutt",
	            mm : "%d minuttir",
	            h : "ein tími",
	            hh : "%d tímar",
	            d : "ein dagur",
	            dd : "%d dagar",
	            M : "ein mánaði",
	            MM : "%d mánaðir",
	            y : "eitt ár",
	            yy : "%d ár"
	        },
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 34 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : canadian french (fr-ca)
	// author : Jonathan Abourbih : https://github.com/jonbca

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('fr-ca', {
	        months : "janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre".split("_"),
	        monthsShort : "janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.".split("_"),
	        weekdays : "dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),
	        weekdaysShort : "dim._lun._mar._mer._jeu._ven._sam.".split("_"),
	        weekdaysMin : "Di_Lu_Ma_Me_Je_Ve_Sa".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "YYYY-MM-DD",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd D MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay: "[Aujourd'hui à] LT",
	            nextDay: '[Demain à] LT',
	            nextWeek: 'dddd [à] LT',
	            lastDay: '[Hier à] LT',
	            lastWeek: 'dddd [dernier à] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : "dans %s",
	            past : "il y a %s",
	            s : "quelques secondes",
	            m : "une minute",
	            mm : "%d minutes",
	            h : "une heure",
	            hh : "%d heures",
	            d : "un jour",
	            dd : "%d jours",
	            M : "un mois",
	            MM : "%d mois",
	            y : "un an",
	            yy : "%d ans"
	        },
	        ordinal : function (number) {
	            return number + (number === 1 ? 'er' : '');
	        }
	    });
	}));


/***/ },
/* 35 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : french (fr)
	// author : John Fischer : https://github.com/jfroffice

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('fr', {
	        months : "janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre".split("_"),
	        monthsShort : "janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.".split("_"),
	        weekdays : "dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),
	        weekdaysShort : "dim._lun._mar._mer._jeu._ven._sam.".split("_"),
	        weekdaysMin : "Di_Lu_Ma_Me_Je_Ve_Sa".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd D MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay: "[Aujourd'hui à] LT",
	            nextDay: '[Demain à] LT',
	            nextWeek: 'dddd [à] LT',
	            lastDay: '[Hier à] LT',
	            lastWeek: 'dddd [dernier à] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : "dans %s",
	            past : "il y a %s",
	            s : "quelques secondes",
	            m : "une minute",
	            mm : "%d minutes",
	            h : "une heure",
	            hh : "%d heures",
	            d : "un jour",
	            dd : "%d jours",
	            M : "un mois",
	            MM : "%d mois",
	            y : "un an",
	            yy : "%d ans"
	        },
	        ordinal : function (number) {
	            return number + (number === 1 ? 'er' : '');
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 36 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : galician (gl)
	// author : Juan G. Hurtado : https://github.com/juanghurtado

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('gl', {
	        months : "Xaneiro_Febreiro_Marzo_Abril_Maio_Xuño_Xullo_Agosto_Setembro_Outubro_Novembro_Decembro".split("_"),
	        monthsShort : "Xan._Feb._Mar._Abr._Mai._Xuñ._Xul._Ago._Set._Out._Nov._Dec.".split("_"),
	        weekdays : "Domingo_Luns_Martes_Mércores_Xoves_Venres_Sábado".split("_"),
	        weekdaysShort : "Dom._Lun._Mar._Mér._Xov._Ven._Sáb.".split("_"),
	        weekdaysMin : "Do_Lu_Ma_Mé_Xo_Ve_Sá".split("_"),
	        longDateFormat : {
	            LT : "H:mm",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd D MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay : function () {
	                return '[hoxe ' + ((this.hours() !== 1) ? 'ás' : 'á') + '] LT';
	            },
	            nextDay : function () {
	                return '[mañá ' + ((this.hours() !== 1) ? 'ás' : 'á') + '] LT';
	            },
	            nextWeek : function () {
	                return 'dddd [' + ((this.hours() !== 1) ? 'ás' : 'a') + '] LT';
	            },
	            lastDay : function () {
	                return '[onte ' + ((this.hours() !== 1) ? 'á' : 'a') + '] LT';
	            },
	            lastWeek : function () {
	                return '[o] dddd [pasado ' + ((this.hours() !== 1) ? 'ás' : 'a') + '] LT';
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : function (str) {
	                if (str === "uns segundos") {
	                    return "nuns segundos";
	                }
	                return "en " + str;
	            },
	            past : "hai %s",
	            s : "uns segundos",
	            m : "un minuto",
	            mm : "%d minutos",
	            h : "unha hora",
	            hh : "%d horas",
	            d : "un día",
	            dd : "%d días",
	            M : "un mes",
	            MM : "%d meses",
	            y : "un ano",
	            yy : "%d anos"
	        },
	        ordinal : '%dº',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 37 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : Hebrew (he)
	// author : Tomer Cohen : https://github.com/tomer
	// author : Moshe Simantov : https://github.com/DevelopmentIL
	// author : Tal Ater : https://github.com/TalAter

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('he', {
	        months : "ינואר_פברואר_מרץ_אפריל_מאי_יוני_יולי_אוגוסט_ספטמבר_אוקטובר_נובמבר_דצמבר".split("_"),
	        monthsShort : "ינו׳_פבר׳_מרץ_אפר׳_מאי_יוני_יולי_אוג׳_ספט׳_אוק׳_נוב׳_דצמ׳".split("_"),
	        weekdays : "ראשון_שני_שלישי_רביעי_חמישי_שישי_שבת".split("_"),
	        weekdaysShort : "א׳_ב׳_ג׳_ד׳_ה׳_ו׳_ש׳".split("_"),
	        weekdaysMin : "א_ב_ג_ד_ה_ו_ש".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD/MM/YYYY",
	            LL : "D [ב]MMMM YYYY",
	            LLL : "D [ב]MMMM YYYY LT",
	            LLLL : "dddd, D [ב]MMMM YYYY LT",
	            l : "D/M/YYYY",
	            ll : "D MMM YYYY",
	            lll : "D MMM YYYY LT",
	            llll : "ddd, D MMM YYYY LT"
	        },
	        calendar : {
	            sameDay : '[היום ב־]LT',
	            nextDay : '[מחר ב־]LT',
	            nextWeek : 'dddd [בשעה] LT',
	            lastDay : '[אתמול ב־]LT',
	            lastWeek : '[ביום] dddd [האחרון בשעה] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "בעוד %s",
	            past : "לפני %s",
	            s : "מספר שניות",
	            m : "דקה",
	            mm : "%d דקות",
	            h : "שעה",
	            hh : function (number) {
	                if (number === 2) {
	                    return "שעתיים";
	                }
	                return number + " שעות";
	            },
	            d : "יום",
	            dd : function (number) {
	                if (number === 2) {
	                    return "יומיים";
	                }
	                return number + " ימים";
	            },
	            M : "חודש",
	            MM : function (number) {
	                if (number === 2) {
	                    return "חודשיים";
	                }
	                return number + " חודשים";
	            },
	            y : "שנה",
	            yy : function (number) {
	                if (number === 2) {
	                    return "שנתיים";
	                }
	                return number + " שנים";
	            }
	        }
	    });
	}));


/***/ },
/* 38 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : hindi (hi)
	// author : Mayank Singhal : https://github.com/mayanksinghal

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    var symbolMap = {
	        '1': '१',
	        '2': '२',
	        '3': '३',
	        '4': '४',
	        '5': '५',
	        '6': '६',
	        '7': '७',
	        '8': '८',
	        '9': '९',
	        '0': '०'
	    },
	    numberMap = {
	        '१': '1',
	        '२': '2',
	        '३': '3',
	        '४': '4',
	        '५': '5',
	        '६': '6',
	        '७': '7',
	        '८': '8',
	        '९': '9',
	        '०': '0'
	    };

	    return moment.lang('hi', {
	        months : 'जनवरी_फ़रवरी_मार्च_अप्रैल_मई_जून_जुलाई_अगस्त_सितम्बर_अक्टूबर_नवम्बर_दिसम्बर'.split("_"),
	        monthsShort : 'जन._फ़र._मार्च_अप्रै._मई_जून_जुल._अग._सित._अक्टू._नव._दिस.'.split("_"),
	        weekdays : 'रविवार_सोमवार_मंगलवार_बुधवार_गुरूवार_शुक्रवार_शनिवार'.split("_"),
	        weekdaysShort : 'रवि_सोम_मंगल_बुध_गुरू_शुक्र_शनि'.split("_"),
	        weekdaysMin : 'र_सो_मं_बु_गु_शु_श'.split("_"),
	        longDateFormat : {
	            LT : "A h:mm बजे",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY, LT",
	            LLLL : "dddd, D MMMM YYYY, LT"
	        },
	        calendar : {
	            sameDay : '[आज] LT',
	            nextDay : '[कल] LT',
	            nextWeek : 'dddd, LT',
	            lastDay : '[कल] LT',
	            lastWeek : '[पिछले] dddd, LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "%s में",
	            past : "%s पहले",
	            s : "कुछ ही क्षण",
	            m : "एक मिनट",
	            mm : "%d मिनट",
	            h : "एक घंटा",
	            hh : "%d घंटे",
	            d : "एक दिन",
	            dd : "%d दिन",
	            M : "एक महीने",
	            MM : "%d महीने",
	            y : "एक वर्ष",
	            yy : "%d वर्ष"
	        },
	        preparse: function (string) {
	            return string.replace(/[१२३४५६७८९०]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },
	        // Hindi notation for meridiems are quite fuzzy in practice. While there exists
	        // a rigid notion of a 'Pahar' it is not used as rigidly in modern Hindi.
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 4) {
	                return "रात";
	            } else if (hour < 10) {
	                return "सुबह";
	            } else if (hour < 17) {
	                return "दोपहर";
	            } else if (hour < 20) {
	                return "शाम";
	            } else {
	                return "रात";
	            }
	        },
	        week : {
	            dow : 0, // Sunday is the first day of the week.
	            doy : 6  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 39 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : hrvatski (hr)
	// author : Bojan Marković : https://github.com/bmarkovic

	// based on (sl) translation by Robert Sedovšek

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {

	    function translate(number, withoutSuffix, key) {
	        var result = number + " ";
	        switch (key) {
	        case 'm':
	            return withoutSuffix ? 'jedna minuta' : 'jedne minute';
	        case 'mm':
	            if (number === 1) {
	                result += 'minuta';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'minute';
	            } else {
	                result += 'minuta';
	            }
	            return result;
	        case 'h':
	            return withoutSuffix ? 'jedan sat' : 'jednog sata';
	        case 'hh':
	            if (number === 1) {
	                result += 'sat';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'sata';
	            } else {
	                result += 'sati';
	            }
	            return result;
	        case 'dd':
	            if (number === 1) {
	                result += 'dan';
	            } else {
	                result += 'dana';
	            }
	            return result;
	        case 'MM':
	            if (number === 1) {
	                result += 'mjesec';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'mjeseca';
	            } else {
	                result += 'mjeseci';
	            }
	            return result;
	        case 'yy':
	            if (number === 1) {
	                result += 'godina';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'godine';
	            } else {
	                result += 'godina';
	            }
	            return result;
	        }
	    }

	    return moment.lang('hr', {
	        months : "sječanj_veljača_ožujak_travanj_svibanj_lipanj_srpanj_kolovoz_rujan_listopad_studeni_prosinac".split("_"),
	        monthsShort : "sje._vel._ožu._tra._svi._lip._srp._kol._ruj._lis._stu._pro.".split("_"),
	        weekdays : "nedjelja_ponedjeljak_utorak_srijeda_četvrtak_petak_subota".split("_"),
	        weekdaysShort : "ned._pon._uto._sri._čet._pet._sub.".split("_"),
	        weekdaysMin : "ne_po_ut_sr_če_pe_su".split("_"),
	        longDateFormat : {
	            LT : "H:mm",
	            L : "DD. MM. YYYY",
	            LL : "D. MMMM YYYY",
	            LLL : "D. MMMM YYYY LT",
	            LLLL : "dddd, D. MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay  : '[danas u] LT',
	            nextDay  : '[sutra u] LT',

	            nextWeek : function () {
	                switch (this.day()) {
	                case 0:
	                    return '[u] [nedjelju] [u] LT';
	                case 3:
	                    return '[u] [srijedu] [u] LT';
	                case 6:
	                    return '[u] [subotu] [u] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[u] dddd [u] LT';
	                }
	            },
	            lastDay  : '[jučer u] LT',
	            lastWeek : function () {
	                switch (this.day()) {
	                case 0:
	                case 3:
	                    return '[prošlu] dddd [u] LT';
	                case 6:
	                    return '[prošle] [subote] [u] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[prošli] dddd [u] LT';
	                }
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "za %s",
	            past   : "prije %s",
	            s      : "par sekundi",
	            m      : translate,
	            mm     : translate,
	            h      : translate,
	            hh     : translate,
	            d      : "dan",
	            dd     : translate,
	            M      : "mjesec",
	            MM     : translate,
	            y      : "godinu",
	            yy     : translate
	        },
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 40 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : hungarian (hu)
	// author : Adam Brunner : https://github.com/adambrunner

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    var weekEndings = 'vasárnap hétfőn kedden szerdán csütörtökön pénteken szombaton'.split(' ');

	    function translate(number, withoutSuffix, key, isFuture) {
	        var num = number,
	            suffix;

	        switch (key) {
	        case 's':
	            return (isFuture || withoutSuffix) ? 'néhány másodperc' : 'néhány másodperce';
	        case 'm':
	            return 'egy' + (isFuture || withoutSuffix ? ' perc' : ' perce');
	        case 'mm':
	            return num + (isFuture || withoutSuffix ? ' perc' : ' perce');
	        case 'h':
	            return 'egy' + (isFuture || withoutSuffix ? ' óra' : ' órája');
	        case 'hh':
	            return num + (isFuture || withoutSuffix ? ' óra' : ' órája');
	        case 'd':
	            return 'egy' + (isFuture || withoutSuffix ? ' nap' : ' napja');
	        case 'dd':
	            return num + (isFuture || withoutSuffix ? ' nap' : ' napja');
	        case 'M':
	            return 'egy' + (isFuture || withoutSuffix ? ' hónap' : ' hónapja');
	        case 'MM':
	            return num + (isFuture || withoutSuffix ? ' hónap' : ' hónapja');
	        case 'y':
	            return 'egy' + (isFuture || withoutSuffix ? ' év' : ' éve');
	        case 'yy':
	            return num + (isFuture || withoutSuffix ? ' év' : ' éve');
	        }

	        return '';
	    }

	    function week(isFuture) {
	        return (isFuture ? '' : '[múlt] ') + '[' + weekEndings[this.day()] + '] LT[-kor]';
	    }

	    return moment.lang('hu', {
	        months : "január_február_március_április_május_június_július_augusztus_szeptember_október_november_december".split("_"),
	        monthsShort : "jan_feb_márc_ápr_máj_jún_júl_aug_szept_okt_nov_dec".split("_"),
	        weekdays : "vasárnap_hétfő_kedd_szerda_csütörtök_péntek_szombat".split("_"),
	        weekdaysShort : "vas_hét_kedd_sze_csüt_pén_szo".split("_"),
	        weekdaysMin : "v_h_k_sze_cs_p_szo".split("_"),
	        longDateFormat : {
	            LT : "H:mm",
	            L : "YYYY.MM.DD.",
	            LL : "YYYY. MMMM D.",
	            LLL : "YYYY. MMMM D., LT",
	            LLLL : "YYYY. MMMM D., dddd LT"
	        },
	        calendar : {
	            sameDay : '[ma] LT[-kor]',
	            nextDay : '[holnap] LT[-kor]',
	            nextWeek : function () {
	                return week.call(this, true);
	            },
	            lastDay : '[tegnap] LT[-kor]',
	            lastWeek : function () {
	                return week.call(this, false);
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "%s múlva",
	            past : "%s",
	            s : translate,
	            m : translate,
	            mm : translate,
	            h : translate,
	            hh : translate,
	            d : translate,
	            dd : translate,
	            M : translate,
	            MM : translate,
	            y : translate,
	            yy : translate
	        },
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 41 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : Armenian (hy-am)
	// author : Armendarabyan : https://github.com/armendarabyan

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {

	    function monthsCaseReplace(m, format) {
	        var months = {
	            'nominative': 'հունվար_փետրվար_մարտ_ապրիլ_մայիս_հունիս_հուլիս_օգոստոս_սեպտեմբեր_հոկտեմբեր_նոյեմբեր_դեկտեմբեր'.split('_'),
	            'accusative': 'հունվարի_փետրվարի_մարտի_ապրիլի_մայիսի_հունիսի_հուլիսի_օգոստոսի_սեպտեմբերի_հոկտեմբերի_նոյեմբերի_դեկտեմբերի'.split('_')
	        },

	        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
	            'accusative' :
	            'nominative';

	        return months[nounCase][m.month()];
	    }

	    function monthsShortCaseReplace(m, format) {
	        var monthsShort = 'հնվ_փտր_մրտ_ապր_մյս_հնս_հլս_օգս_սպտ_հկտ_նմբ_դկտ'.split('_');

	        return monthsShort[m.month()];
	    }

	    function weekdaysCaseReplace(m, format) {
	        var weekdays = 'կիրակի_երկուշաբթի_երեքշաբթի_չորեքշաբթի_հինգշաբթի_ուրբաթ_շաբաթ'.split('_');

	        return weekdays[m.day()];
	    }

	    return moment.lang('hy-am', {
	        months : monthsCaseReplace,
	        monthsShort : monthsShortCaseReplace,
	        weekdays : weekdaysCaseReplace,
	        weekdaysShort : "կրկ_երկ_երք_չրք_հնգ_ուրբ_շբթ".split("_"),
	        weekdaysMin : "կրկ_երկ_երք_չրք_հնգ_ուրբ_շբթ".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD.MM.YYYY",
	            LL : "D MMMM YYYY թ.",
	            LLL : "D MMMM YYYY թ., LT",
	            LLLL : "dddd, D MMMM YYYY թ., LT"
	        },
	        calendar : {
	            sameDay: '[այսօր] LT',
	            nextDay: '[վաղը] LT',
	            lastDay: '[երեկ] LT',
	            nextWeek: function () {
	                return 'dddd [օրը ժամը] LT';
	            },
	            lastWeek: function () {
	                return '[անցած] dddd [օրը ժամը] LT';
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : "%s հետո",
	            past : "%s առաջ",
	            s : "մի քանի վայրկյան",
	            m : "րոպե",
	            mm : "%d րոպե",
	            h : "ժամ",
	            hh : "%d ժամ",
	            d : "օր",
	            dd : "%d օր",
	            M : "ամիս",
	            MM : "%d ամիս",
	            y : "տարի",
	            yy : "%d տարի"
	        },

	        meridiem : function (hour) {
	            if (hour < 4) {
	                return "գիշերվա";
	            } else if (hour < 12) {
	                return "առավոտվա";
	            } else if (hour < 17) {
	                return "ցերեկվա";
	            } else {
	                return "երեկոյան";
	            }
	        },

	        ordinal: function (number, period) {
	            switch (period) {
	            case 'DDD':
	            case 'w':
	            case 'W':
	            case 'DDDo':
	                if (number === 1) {
	                    return number + '-ին';
	                }
	                return number + '-րդ';
	            default:
	                return number;
	            }
	        },

	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 42 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : Bahasa Indonesia (id)
	// author : Mohammad Satrio Utomo : https://github.com/tyok
	// reference: http://id.wikisource.org/wiki/Pedoman_Umum_Ejaan_Bahasa_Indonesia_yang_Disempurnakan

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('id', {
	        months : "Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_November_Desember".split("_"),
	        monthsShort : "Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nov_Des".split("_"),
	        weekdays : "Minggu_Senin_Selasa_Rabu_Kamis_Jumat_Sabtu".split("_"),
	        weekdaysShort : "Min_Sen_Sel_Rab_Kam_Jum_Sab".split("_"),
	        weekdaysMin : "Mg_Sn_Sl_Rb_Km_Jm_Sb".split("_"),
	        longDateFormat : {
	            LT : "HH.mm",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY [pukul] LT",
	            LLLL : "dddd, D MMMM YYYY [pukul] LT"
	        },
	        meridiem : function (hours, minutes, isLower) {
	            if (hours < 11) {
	                return 'pagi';
	            } else if (hours < 15) {
	                return 'siang';
	            } else if (hours < 19) {
	                return 'sore';
	            } else {
	                return 'malam';
	            }
	        },
	        calendar : {
	            sameDay : '[Hari ini pukul] LT',
	            nextDay : '[Besok pukul] LT',
	            nextWeek : 'dddd [pukul] LT',
	            lastDay : '[Kemarin pukul] LT',
	            lastWeek : 'dddd [lalu pukul] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "dalam %s",
	            past : "%s yang lalu",
	            s : "beberapa detik",
	            m : "semenit",
	            mm : "%d menit",
	            h : "sejam",
	            hh : "%d jam",
	            d : "sehari",
	            dd : "%d hari",
	            M : "sebulan",
	            MM : "%d bulan",
	            y : "setahun",
	            yy : "%d tahun"
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 43 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : icelandic (is)
	// author : Hinrik Örn Sigurðsson : https://github.com/hinrik

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    function plural(n) {
	        if (n % 100 === 11) {
	            return true;
	        } else if (n % 10 === 1) {
	            return false;
	        }
	        return true;
	    }

	    function translate(number, withoutSuffix, key, isFuture) {
	        var result = number + " ";
	        switch (key) {
	        case 's':
	            return withoutSuffix || isFuture ? 'nokkrar sekúndur' : 'nokkrum sekúndum';
	        case 'm':
	            return withoutSuffix ? 'mínúta' : 'mínútu';
	        case 'mm':
	            if (plural(number)) {
	                return result + (withoutSuffix || isFuture ? 'mínútur' : 'mínútum');
	            } else if (withoutSuffix) {
	                return result + 'mínúta';
	            }
	            return result + 'mínútu';
	        case 'hh':
	            if (plural(number)) {
	                return result + (withoutSuffix || isFuture ? 'klukkustundir' : 'klukkustundum');
	            }
	            return result + 'klukkustund';
	        case 'd':
	            if (withoutSuffix) {
	                return 'dagur';
	            }
	            return isFuture ? 'dag' : 'degi';
	        case 'dd':
	            if (plural(number)) {
	                if (withoutSuffix) {
	                    return result + 'dagar';
	                }
	                return result + (isFuture ? 'daga' : 'dögum');
	            } else if (withoutSuffix) {
	                return result + 'dagur';
	            }
	            return result + (isFuture ? 'dag' : 'degi');
	        case 'M':
	            if (withoutSuffix) {
	                return 'mánuður';
	            }
	            return isFuture ? 'mánuð' : 'mánuði';
	        case 'MM':
	            if (plural(number)) {
	                if (withoutSuffix) {
	                    return result + 'mánuðir';
	                }
	                return result + (isFuture ? 'mánuði' : 'mánuðum');
	            } else if (withoutSuffix) {
	                return result + 'mánuður';
	            }
	            return result + (isFuture ? 'mánuð' : 'mánuði');
	        case 'y':
	            return withoutSuffix || isFuture ? 'ár' : 'ári';
	        case 'yy':
	            if (plural(number)) {
	                return result + (withoutSuffix || isFuture ? 'ár' : 'árum');
	            }
	            return result + (withoutSuffix || isFuture ? 'ár' : 'ári');
	        }
	    }

	    return moment.lang('is', {
	        months : "janúar_febrúar_mars_apríl_maí_júní_júlí_ágúst_september_október_nóvember_desember".split("_"),
	        monthsShort : "jan_feb_mar_apr_maí_jún_júl_ágú_sep_okt_nóv_des".split("_"),
	        weekdays : "sunnudagur_mánudagur_þriðjudagur_miðvikudagur_fimmtudagur_föstudagur_laugardagur".split("_"),
	        weekdaysShort : "sun_mán_þri_mið_fim_fös_lau".split("_"),
	        weekdaysMin : "Su_Má_Þr_Mi_Fi_Fö_La".split("_"),
	        longDateFormat : {
	            LT : "H:mm",
	            L : "DD/MM/YYYY",
	            LL : "D. MMMM YYYY",
	            LLL : "D. MMMM YYYY [kl.] LT",
	            LLLL : "dddd, D. MMMM YYYY [kl.] LT"
	        },
	        calendar : {
	            sameDay : '[í dag kl.] LT',
	            nextDay : '[á morgun kl.] LT',
	            nextWeek : 'dddd [kl.] LT',
	            lastDay : '[í gær kl.] LT',
	            lastWeek : '[síðasta] dddd [kl.] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "eftir %s",
	            past : "fyrir %s síðan",
	            s : translate,
	            m : translate,
	            mm : translate,
	            h : "klukkustund",
	            hh : translate,
	            d : translate,
	            dd : translate,
	            M : translate,
	            MM : translate,
	            y : translate,
	            yy : translate
	        },
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 44 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : italian (it)
	// author : Lorenzo : https://github.com/aliem
	// author: Mattia Larentis: https://github.com/nostalgiaz

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('it', {
	        months : "Gennaio_Febbraio_Marzo_Aprile_Maggio_Giugno_Luglio_Agosto_Settembre_Ottobre_Novembre_Dicembre".split("_"),
	        monthsShort : "Gen_Feb_Mar_Apr_Mag_Giu_Lug_Ago_Set_Ott_Nov_Dic".split("_"),
	        weekdays : "Domenica_Lunedì_Martedì_Mercoledì_Giovedì_Venerdì_Sabato".split("_"),
	        weekdaysShort : "Dom_Lun_Mar_Mer_Gio_Ven_Sab".split("_"),
	        weekdaysMin : "D_L_Ma_Me_G_V_S".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd, D MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay: '[Oggi alle] LT',
	            nextDay: '[Domani alle] LT',
	            nextWeek: 'dddd [alle] LT',
	            lastDay: '[Ieri alle] LT',
	            lastWeek: '[lo scorso] dddd [alle] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : function (s) {
	                return ((/^[0-9].+$/).test(s) ? "tra" : "in") + " " + s;
	            },
	            past : "%s fa",
	            s : "alcuni secondi",
	            m : "un minuto",
	            mm : "%d minuti",
	            h : "un'ora",
	            hh : "%d ore",
	            d : "un giorno",
	            dd : "%d giorni",
	            M : "un mese",
	            MM : "%d mesi",
	            y : "un anno",
	            yy : "%d anni"
	        },
	        ordinal: '%dº',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 45 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : japanese (ja)
	// author : LI Long : https://github.com/baryon

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('ja', {
	        months : "1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),
	        monthsShort : "1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),
	        weekdays : "日曜日_月曜日_火曜日_水曜日_木曜日_金曜日_土曜日".split("_"),
	        weekdaysShort : "日_月_火_水_木_金_土".split("_"),
	        weekdaysMin : "日_月_火_水_木_金_土".split("_"),
	        longDateFormat : {
	            LT : "Ah時m分",
	            L : "YYYY/MM/DD",
	            LL : "YYYY年M月D日",
	            LLL : "YYYY年M月D日LT",
	            LLLL : "YYYY年M月D日LT dddd"
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 12) {
	                return "午前";
	            } else {
	                return "午後";
	            }
	        },
	        calendar : {
	            sameDay : '[今日] LT',
	            nextDay : '[明日] LT',
	            nextWeek : '[来週]dddd LT',
	            lastDay : '[昨日] LT',
	            lastWeek : '[前週]dddd LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "%s後",
	            past : "%s前",
	            s : "数秒",
	            m : "1分",
	            mm : "%d分",
	            h : "1時間",
	            hh : "%d時間",
	            d : "1日",
	            dd : "%d日",
	            M : "1ヶ月",
	            MM : "%dヶ月",
	            y : "1年",
	            yy : "%d年"
	        }
	    });
	}));


/***/ },
/* 46 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : Georgian (ka)
	// author : Irakli Janiashvili : https://github.com/irakli-janiashvili

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {

	    function monthsCaseReplace(m, format) {
	        var months = {
	            'nominative': 'იანვარი_თებერვალი_მარტი_აპრილი_მაისი_ივნისი_ივლისი_აგვისტო_სექტემბერი_ოქტომბერი_ნოემბერი_დეკემბერი'.split('_'),
	            'accusative': 'იანვარს_თებერვალს_მარტს_აპრილის_მაისს_ივნისს_ივლისს_აგვისტს_სექტემბერს_ოქტომბერს_ნოემბერს_დეკემბერს'.split('_')
	        },

	        nounCase = (/D[oD] *MMMM?/).test(format) ?
	            'accusative' :
	            'nominative';

	        return months[nounCase][m.month()];
	    }

	    function weekdaysCaseReplace(m, format) {
	        var weekdays = {
	            'nominative': 'კვირა_ორშაბათი_სამშაბათი_ოთხშაბათი_ხუთშაბათი_პარასკევი_შაბათი'.split('_'),
	            'accusative': 'კვირას_ორშაბათს_სამშაბათს_ოთხშაბათს_ხუთშაბათს_პარასკევს_შაბათს'.split('_')
	        },

	        nounCase = (/(წინა|შემდეგ)/).test(format) ?
	            'accusative' :
	            'nominative';

	        return weekdays[nounCase][m.day()];
	    }

	    return moment.lang('ka', {
	        months : monthsCaseReplace,
	        monthsShort : "იან_თებ_მარ_აპრ_მაი_ივნ_ივლ_აგვ_სექ_ოქტ_ნოე_დეკ".split("_"),
	        weekdays : weekdaysCaseReplace,
	        weekdaysShort : "კვი_ორშ_სამ_ოთხ_ხუთ_პარ_შაბ".split("_"),
	        weekdaysMin : "კვ_ორ_სა_ოთ_ხუ_პა_შა".split("_"),
	        longDateFormat : {
	            LT : "h:mm A",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd, D MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay : '[დღეს] LT[-ზე]',
	            nextDay : '[ხვალ] LT[-ზე]',
	            lastDay : '[გუშინ] LT[-ზე]',
	            nextWeek : '[შემდეგ] dddd LT[-ზე]',
	            lastWeek : '[წინა] dddd LT-ზე',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : function (s) {
	                return (/(წამი|წუთი|საათი|წელი)/).test(s) ?
	                    s.replace(/ი$/, "ში") :
	                    s + "ში";
	            },
	            past : function (s) {
	                if ((/(წამი|წუთი|საათი|დღე|თვე)/).test(s)) {
	                    return s.replace(/(ი|ე)$/, "ის წინ");
	                }
	                if ((/წელი/).test(s)) {
	                    return s.replace(/წელი$/, "წლის წინ");
	                }
	            },
	            s : "რამდენიმე წამი",
	            m : "წუთი",
	            mm : "%d წუთი",
	            h : "საათი",
	            hh : "%d საათი",
	            d : "დღე",
	            dd : "%d დღე",
	            M : "თვე",
	            MM : "%d თვე",
	            y : "წელი",
	            yy : "%d წელი"
	        },
	        ordinal : function (number) {
	            if (number === 0) {
	                return number;
	            }

	            if (number === 1) {
	                return number + "-ლი";
	            }

	            if ((number < 20) || (number <= 100 && (number % 20 === 0)) || (number % 100 === 0)) {
	                return "მე-" + number;
	            }

	            return number + "-ე";
	        },
	        week : {
	            dow : 1,
	            doy : 7
	        }
	    });
	}));


/***/ },
/* 47 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : korean (ko)
	//
	// authors 
	//
	// - Kyungwook, Park : https://github.com/kyungw00k
	// - Jeeeyul Lee <jeeeyul@gmail.com>
	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('ko', {
	        months : "1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월".split("_"),
	        monthsShort : "1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월".split("_"),
	        weekdays : "일요일_월요일_화요일_수요일_목요일_금요일_토요일".split("_"),
	        weekdaysShort : "일_월_화_수_목_금_토".split("_"),
	        weekdaysMin : "일_월_화_수_목_금_토".split("_"),
	        longDateFormat : {
	            LT : "A h시 mm분",
	            L : "YYYY.MM.DD",
	            LL : "YYYY년 MMMM D일",
	            LLL : "YYYY년 MMMM D일 LT",
	            LLLL : "YYYY년 MMMM D일 dddd LT"
	        },
	        meridiem : function (hour, minute, isUpper) {
	            return hour < 12 ? '오전' : '오후';
	        },
	        calendar : {
	            sameDay : '오늘 LT',
	            nextDay : '내일 LT',
	            nextWeek : 'dddd LT',
	            lastDay : '어제 LT',
	            lastWeek : '지난주 dddd LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "%s 후",
	            past : "%s 전",
	            s : "몇초",
	            ss : "%d초",
	            m : "일분",
	            mm : "%d분",
	            h : "한시간",
	            hh : "%d시간",
	            d : "하루",
	            dd : "%d일",
	            M : "한달",
	            MM : "%d달",
	            y : "일년",
	            yy : "%d년"
	        },
	        ordinal : '%d일',
	        meridiemParse : /(오전|오후)/,
	        isPM : function (token) {
	            return token === "오후";
	        }
	    });
	}));


/***/ },
/* 48 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : Luxembourgish (lb)
	// author : mweimerskirch : https://github.com/mweimerskirch

	// Note: Luxembourgish has a very particular phonological rule ("Eifeler Regel") that causes the
	// deletion of the final "n" in certain contexts. That's what the "eifelerRegelAppliesToWeekday"
	// and "eifelerRegelAppliesToNumber" methods are meant for

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    function processRelativeTime(number, withoutSuffix, key, isFuture) {
	        var format = {
	            'm': ['eng Minutt', 'enger Minutt'],
	            'h': ['eng Stonn', 'enger Stonn'],
	            'd': ['een Dag', 'engem Dag'],
	            'dd': [number + ' Deeg', number + ' Deeg'],
	            'M': ['ee Mount', 'engem Mount'],
	            'MM': [number + ' Méint', number + ' Méint'],
	            'y': ['ee Joer', 'engem Joer'],
	            'yy': [number + ' Joer', number + ' Joer']
	        };
	        return withoutSuffix ? format[key][0] : format[key][1];
	    }

	    function processFutureTime(string) {
	        var number = string.substr(0, string.indexOf(' '));
	        if (eifelerRegelAppliesToNumber(number)) {
	            return "a " + string;
	        }
	        return "an " + string;
	    }

	    function processPastTime(string) {
	        var number = string.substr(0, string.indexOf(' '));
	        if (eifelerRegelAppliesToNumber(number)) {
	            return "viru " + string;
	        }
	        return "virun " + string;
	    }

	    function processLastWeek(string1) {
	        var weekday = this.format('d');
	        if (eifelerRegelAppliesToWeekday(weekday)) {
	            return '[Leschte] dddd [um] LT';
	        }
	        return '[Leschten] dddd [um] LT';
	    }

	    /**
	     * Returns true if the word before the given week day loses the "-n" ending.
	     * e.g. "Leschten Dënschdeg" but "Leschte Méindeg"
	     *
	     * @param weekday {integer}
	     * @returns {boolean}
	     */
	    function eifelerRegelAppliesToWeekday(weekday) {
	        weekday = parseInt(weekday, 10);
	        switch (weekday) {
	        case 0: // Sonndeg
	        case 1: // Méindeg
	        case 3: // Mëttwoch
	        case 5: // Freideg
	        case 6: // Samschdeg
	            return true;
	        default: // 2 Dënschdeg, 4 Donneschdeg
	            return false;
	        }
	    }

	    /**
	     * Returns true if the word before the given number loses the "-n" ending.
	     * e.g. "an 10 Deeg" but "a 5 Deeg"
	     *
	     * @param number {integer}
	     * @returns {boolean}
	     */
	    function eifelerRegelAppliesToNumber(number) {
	        number = parseInt(number, 10);
	        if (isNaN(number)) {
	            return false;
	        }
	        if (number < 0) {
	            // Negative Number --> always true
	            return true;
	        } else if (number < 10) {
	            // Only 1 digit
	            if (4 <= number && number <= 7) {
	                return true;
	            }
	            return false;
	        } else if (number < 100) {
	            // 2 digits
	            var lastDigit = number % 10, firstDigit = number / 10;
	            if (lastDigit === 0) {
	                return eifelerRegelAppliesToNumber(firstDigit);
	            }
	            return eifelerRegelAppliesToNumber(lastDigit);
	        } else if (number < 10000) {
	            // 3 or 4 digits --> recursively check first digit
	            while (number >= 10) {
	                number = number / 10;
	            }
	            return eifelerRegelAppliesToNumber(number);
	        } else {
	            // Anything larger than 4 digits: recursively check first n-3 digits
	            number = number / 1000;
	            return eifelerRegelAppliesToNumber(number);
	        }
	    }

	    return moment.lang('lb', {
	        months: "Januar_Februar_Mäerz_Abrëll_Mee_Juni_Juli_August_September_Oktober_November_Dezember".split("_"),
	        monthsShort: "Jan._Febr._Mrz._Abr._Mee_Jun._Jul._Aug._Sept._Okt._Nov._Dez.".split("_"),
	        weekdays: "Sonndeg_Méindeg_Dënschdeg_Mëttwoch_Donneschdeg_Freideg_Samschdeg".split("_"),
	        weekdaysShort: "So._Mé._Dë._Më._Do._Fr._Sa.".split("_"),
	        weekdaysMin: "So_Mé_Dë_Më_Do_Fr_Sa".split("_"),
	        longDateFormat: {
	            LT: "H:mm [Auer]",
	            L: "DD.MM.YYYY",
	            LL: "D. MMMM YYYY",
	            LLL: "D. MMMM YYYY LT",
	            LLLL: "dddd, D. MMMM YYYY LT"
	        },
	        calendar: {
	            sameDay: "[Haut um] LT",
	            sameElse: "L",
	            nextDay: '[Muer um] LT',
	            nextWeek: 'dddd [um] LT',
	            lastDay: '[Gëschter um] LT',
	            lastWeek: processLastWeek
	        },
	        relativeTime: {
	            future: processFutureTime,
	            past: processPastTime,
	            s: "e puer Sekonnen",
	            m: processRelativeTime,
	            mm: "%d Minutten",
	            h: processRelativeTime,
	            hh: "%d Stonnen",
	            d: processRelativeTime,
	            dd: processRelativeTime,
	            M: processRelativeTime,
	            MM: processRelativeTime,
	            y: processRelativeTime,
	            yy: processRelativeTime
	        },
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 49 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : Lithuanian (lt)
	// author : Mindaugas Mozūras : https://github.com/mmozuras

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    var units = {
	        "m" : "minutė_minutės_minutę",
	        "mm": "minutės_minučių_minutes",
	        "h" : "valanda_valandos_valandą",
	        "hh": "valandos_valandų_valandas",
	        "d" : "diena_dienos_dieną",
	        "dd": "dienos_dienų_dienas",
	        "M" : "mėnuo_mėnesio_mėnesį",
	        "MM": "mėnesiai_mėnesių_mėnesius",
	        "y" : "metai_metų_metus",
	        "yy": "metai_metų_metus"
	    },
	    weekDays = "pirmadienis_antradienis_trečiadienis_ketvirtadienis_penktadienis_šeštadienis_sekmadienis".split("_");

	    function translateSeconds(number, withoutSuffix, key, isFuture) {
	        if (withoutSuffix) {
	            return "kelios sekundės";
	        } else {
	            return isFuture ? "kelių sekundžių" : "kelias sekundes";
	        }
	    }

	    function translateSingular(number, withoutSuffix, key, isFuture) {
	        return withoutSuffix ? forms(key)[0] : (isFuture ? forms(key)[1] : forms(key)[2]);
	    }

	    function special(number) {
	        return number % 10 === 0 || (number > 10 && number < 20);
	    }

	    function forms(key) {
	        return units[key].split("_");
	    }

	    function translate(number, withoutSuffix, key, isFuture) {
	        var result = number + " ";
	        if (number === 1) {
	            return result + translateSingular(number, withoutSuffix, key[0], isFuture);
	        } else if (withoutSuffix) {
	            return result + (special(number) ? forms(key)[1] : forms(key)[0]);
	        } else {
	            if (isFuture) {
	                return result + forms(key)[1];
	            } else {
	                return result + (special(number) ? forms(key)[1] : forms(key)[2]);
	            }
	        }
	    }

	    function relativeWeekDay(moment, format) {
	        var nominative = format.indexOf('dddd LT') === -1,
	            weekDay = weekDays[moment.weekday()];

	        return nominative ? weekDay : weekDay.substring(0, weekDay.length - 2) + "į";
	    }

	    return moment.lang("lt", {
	        months : "sausio_vasario_kovo_balandžio_gegužės_biržėlio_liepos_rugpjūčio_rugsėjo_spalio_lapkričio_gruodžio".split("_"),
	        monthsShort : "sau_vas_kov_bal_geg_bir_lie_rgp_rgs_spa_lap_grd".split("_"),
	        weekdays : relativeWeekDay,
	        weekdaysShort : "Sek_Pir_Ant_Tre_Ket_Pen_Šeš".split("_"),
	        weekdaysMin : "S_P_A_T_K_Pn_Š".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "YYYY-MM-DD",
	            LL : "YYYY [m.] MMMM D [d.]",
	            LLL : "YYYY [m.] MMMM D [d.], LT [val.]",
	            LLLL : "YYYY [m.] MMMM D [d.], dddd, LT [val.]",
	            l : "YYYY-MM-DD",
	            ll : "YYYY [m.] MMMM D [d.]",
	            lll : "YYYY [m.] MMMM D [d.], LT [val.]",
	            llll : "YYYY [m.] MMMM D [d.], ddd, LT [val.]"
	        },
	        calendar : {
	            sameDay : "[Šiandien] LT",
	            nextDay : "[Rytoj] LT",
	            nextWeek : "dddd LT",
	            lastDay : "[Vakar] LT",
	            lastWeek : "[Praėjusį] dddd LT",
	            sameElse : "L"
	        },
	        relativeTime : {
	            future : "po %s",
	            past : "prieš %s",
	            s : translateSeconds,
	            m : translateSingular,
	            mm : translate,
	            h : translateSingular,
	            hh : translate,
	            d : translateSingular,
	            dd : translate,
	            M : translateSingular,
	            MM : translate,
	            y : translateSingular,
	            yy : translate
	        },
	        ordinal : function (number) {
	            return number + '-oji';
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 50 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : latvian (lv)
	// author : Kristaps Karlsons : https://github.com/skakri

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    var units = {
	        'mm': 'minūti_minūtes_minūte_minūtes',
	        'hh': 'stundu_stundas_stunda_stundas',
	        'dd': 'dienu_dienas_diena_dienas',
	        'MM': 'mēnesi_mēnešus_mēnesis_mēneši',
	        'yy': 'gadu_gadus_gads_gadi'
	    };

	    function format(word, number, withoutSuffix) {
	        var forms = word.split('_');
	        if (withoutSuffix) {
	            return number % 10 === 1 && number !== 11 ? forms[2] : forms[3];
	        } else {
	            return number % 10 === 1 && number !== 11 ? forms[0] : forms[1];
	        }
	    }

	    function relativeTimeWithPlural(number, withoutSuffix, key) {
	        return number + ' ' + format(units[key], number, withoutSuffix);
	    }

	    return moment.lang('lv', {
	        months : "janvāris_februāris_marts_aprīlis_maijs_jūnijs_jūlijs_augusts_septembris_oktobris_novembris_decembris".split("_"),
	        monthsShort : "jan_feb_mar_apr_mai_jūn_jūl_aug_sep_okt_nov_dec".split("_"),
	        weekdays : "svētdiena_pirmdiena_otrdiena_trešdiena_ceturtdiena_piektdiena_sestdiena".split("_"),
	        weekdaysShort : "Sv_P_O_T_C_Pk_S".split("_"),
	        weekdaysMin : "Sv_P_O_T_C_Pk_S".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD.MM.YYYY",
	            LL : "YYYY. [gada] D. MMMM",
	            LLL : "YYYY. [gada] D. MMMM, LT",
	            LLLL : "YYYY. [gada] D. MMMM, dddd, LT"
	        },
	        calendar : {
	            sameDay : '[Šodien pulksten] LT',
	            nextDay : '[Rīt pulksten] LT',
	            nextWeek : 'dddd [pulksten] LT',
	            lastDay : '[Vakar pulksten] LT',
	            lastWeek : '[Pagājušā] dddd [pulksten] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "%s vēlāk",
	            past : "%s agrāk",
	            s : "dažas sekundes",
	            m : "minūti",
	            mm : relativeTimeWithPlural,
	            h : "stundu",
	            hh : relativeTimeWithPlural,
	            d : "dienu",
	            dd : relativeTimeWithPlural,
	            M : "mēnesi",
	            MM : relativeTimeWithPlural,
	            y : "gadu",
	            yy : relativeTimeWithPlural
	        },
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 51 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : macedonian (mk)
	// author : Borislav Mickov : https://github.com/B0k0

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('mk', {
	        months : "јануари_февруари_март_април_мај_јуни_јули_август_септември_октомври_ноември_декември".split("_"),
	        monthsShort : "јан_фев_мар_апр_мај_јун_јул_авг_сеп_окт_ное_дек".split("_"),
	        weekdays : "недела_понеделник_вторник_среда_четврток_петок_сабота".split("_"),
	        weekdaysShort : "нед_пон_вто_сре_чет_пет_саб".split("_"),
	        weekdaysMin : "нe_пo_вт_ср_че_пе_сa".split("_"),
	        longDateFormat : {
	            LT : "H:mm",
	            L : "D.MM.YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd, D MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay : '[Денес во] LT',
	            nextDay : '[Утре во] LT',
	            nextWeek : 'dddd [во] LT',
	            lastDay : '[Вчера во] LT',
	            lastWeek : function () {
	                switch (this.day()) {
	                case 0:
	                case 3:
	                case 6:
	                    return '[Во изминатата] dddd [во] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[Во изминатиот] dddd [во] LT';
	                }
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "после %s",
	            past : "пред %s",
	            s : "неколку секунди",
	            m : "минута",
	            mm : "%d минути",
	            h : "час",
	            hh : "%d часа",
	            d : "ден",
	            dd : "%d дена",
	            M : "месец",
	            MM : "%d месеци",
	            y : "година",
	            yy : "%d години"
	        },
	        ordinal : function (number) {
	            var lastDigit = number % 10,
	                last2Digits = number % 100;
	            if (number === 0) {
	                return number + '-ев';
	            } else if (last2Digits === 0) {
	                return number + '-ен';
	            } else if (last2Digits > 10 && last2Digits < 20) {
	                return number + '-ти';
	            } else if (lastDigit === 1) {
	                return number + '-ви';
	            } else if (lastDigit === 2) {
	                return number + '-ри';
	            } else if (lastDigit === 7 || lastDigit === 8) {
	                return number + '-ми';
	            } else {
	                return number + '-ти';
	            }
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 52 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : malayalam (ml)
	// author : Floyd Pink : https://github.com/floydpink

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('ml', {
	        months : 'ജനുവരി_ഫെബ്രുവരി_മാർച്ച്_ഏപ്രിൽ_മേയ്_ജൂൺ_ജൂലൈ_ഓഗസ്റ്റ്_സെപ്റ്റംബർ_ഒക്ടോബർ_നവംബർ_ഡിസംബർ'.split("_"),
	        monthsShort : 'ജനു._ഫെബ്രു._മാർ._ഏപ്രി._മേയ്_ജൂൺ_ജൂലൈ._ഓഗ._സെപ്റ്റ._ഒക്ടോ._നവം._ഡിസം.'.split("_"),
	        weekdays : 'ഞായറാഴ്ച_തിങ്കളാഴ്ച_ചൊവ്വാഴ്ച_ബുധനാഴ്ച_വ്യാഴാഴ്ച_വെള്ളിയാഴ്ച_ശനിയാഴ്ച'.split("_"),
	        weekdaysShort : 'ഞായർ_തിങ്കൾ_ചൊവ്വ_ബുധൻ_വ്യാഴം_വെള്ളി_ശനി'.split("_"),
	        weekdaysMin : 'ഞാ_തി_ചൊ_ബു_വ്യാ_വെ_ശ'.split("_"),
	        longDateFormat : {
	            LT : "A h:mm -നു",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY, LT",
	            LLLL : "dddd, D MMMM YYYY, LT"
	        },
	        calendar : {
	            sameDay : '[ഇന്ന്] LT',
	            nextDay : '[നാളെ] LT',
	            nextWeek : 'dddd, LT',
	            lastDay : '[ഇന്നലെ] LT',
	            lastWeek : '[കഴിഞ്ഞ] dddd, LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "%s കഴിഞ്ഞ്",
	            past : "%s മുൻപ്",
	            s : "അൽപ നിമിഷങ്ങൾ",
	            m : "ഒരു മിനിറ്റ്",
	            mm : "%d മിനിറ്റ്",
	            h : "ഒരു മണിക്കൂർ",
	            hh : "%d മണിക്കൂർ",
	            d : "ഒരു ദിവസം",
	            dd : "%d ദിവസം",
	            M : "ഒരു മാസം",
	            MM : "%d മാസം",
	            y : "ഒരു വർഷം",
	            yy : "%d വർഷം"
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 4) {
	                return "രാത്രി";
	            } else if (hour < 12) {
	                return "രാവിലെ";
	            } else if (hour < 17) {
	                return "ഉച്ച കഴിഞ്ഞ്";
	            } else if (hour < 20) {
	                return "വൈകുന്നേരം";
	            } else {
	                return "രാത്രി";
	            }
	        }
	    });
	}));


/***/ },
/* 53 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : Marathi (mr)
	// author : Harshad Kale : https://github.com/kalehv

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    var symbolMap = {
	        '1': '१',
	        '2': '२',
	        '3': '३',
	        '4': '४',
	        '5': '५',
	        '6': '६',
	        '7': '७',
	        '8': '८',
	        '9': '९',
	        '0': '०'
	    },
	    numberMap = {
	        '१': '1',
	        '२': '2',
	        '३': '3',
	        '४': '4',
	        '५': '5',
	        '६': '6',
	        '७': '7',
	        '८': '8',
	        '९': '9',
	        '०': '0'
	    };

	    return moment.lang('mr', {
	        months : 'जानेवारी_फेब्रुवारी_मार्च_एप्रिल_मे_जून_जुलै_ऑगस्ट_सप्टेंबर_ऑक्टोबर_नोव्हेंबर_डिसेंबर'.split("_"),
	        monthsShort: 'जाने._फेब्रु._मार्च._एप्रि._मे._जून._जुलै._ऑग._सप्टें._ऑक्टो._नोव्हें._डिसें.'.split("_"),
	        weekdays : 'रविवार_सोमवार_मंगळवार_बुधवार_गुरूवार_शुक्रवार_शनिवार'.split("_"),
	        weekdaysShort : 'रवि_सोम_मंगळ_बुध_गुरू_शुक्र_शनि'.split("_"),
	        weekdaysMin : 'र_सो_मं_बु_गु_शु_श'.split("_"),
	        longDateFormat : {
	            LT : "A h:mm वाजता",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY, LT",
	            LLLL : "dddd, D MMMM YYYY, LT"
	        },
	        calendar : {
	            sameDay : '[आज] LT',
	            nextDay : '[उद्या] LT',
	            nextWeek : 'dddd, LT',
	            lastDay : '[काल] LT',
	            lastWeek: '[मागील] dddd, LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "%s नंतर",
	            past : "%s पूर्वी",
	            s : "सेकंद",
	            m: "एक मिनिट",
	            mm: "%d मिनिटे",
	            h : "एक तास",
	            hh : "%d तास",
	            d : "एक दिवस",
	            dd : "%d दिवस",
	            M : "एक महिना",
	            MM : "%d महिने",
	            y : "एक वर्ष",
	            yy : "%d वर्षे"
	        },
	        preparse: function (string) {
	            return string.replace(/[१२३४५६७८९०]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },
	        meridiem: function (hour, minute, isLower)
	        {
	            if (hour < 4) {
	                return "रात्री";
	            } else if (hour < 10) {
	                return "सकाळी";
	            } else if (hour < 17) {
	                return "दुपारी";
	            } else if (hour < 20) {
	                return "सायंकाळी";
	            } else {
	                return "रात्री";
	            }
	        },
	        week : {
	            dow : 0, // Sunday is the first day of the week.
	            doy : 6  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 54 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : Bahasa Malaysia (ms-MY)
	// author : Weldan Jamili : https://github.com/weldan

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('ms-my', {
	        months : "Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember".split("_"),
	        monthsShort : "Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis".split("_"),
	        weekdays : "Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu".split("_"),
	        weekdaysShort : "Ahd_Isn_Sel_Rab_Kha_Jum_Sab".split("_"),
	        weekdaysMin : "Ah_Is_Sl_Rb_Km_Jm_Sb".split("_"),
	        longDateFormat : {
	            LT : "HH.mm",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY [pukul] LT",
	            LLLL : "dddd, D MMMM YYYY [pukul] LT"
	        },
	        meridiem : function (hours, minutes, isLower) {
	            if (hours < 11) {
	                return 'pagi';
	            } else if (hours < 15) {
	                return 'tengahari';
	            } else if (hours < 19) {
	                return 'petang';
	            } else {
	                return 'malam';
	            }
	        },
	        calendar : {
	            sameDay : '[Hari ini pukul] LT',
	            nextDay : '[Esok pukul] LT',
	            nextWeek : 'dddd [pukul] LT',
	            lastDay : '[Kelmarin pukul] LT',
	            lastWeek : 'dddd [lepas pukul] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "dalam %s",
	            past : "%s yang lepas",
	            s : "beberapa saat",
	            m : "seminit",
	            mm : "%d minit",
	            h : "sejam",
	            hh : "%d jam",
	            d : "sehari",
	            dd : "%d hari",
	            M : "sebulan",
	            MM : "%d bulan",
	            y : "setahun",
	            yy : "%d tahun"
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 55 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : norwegian bokmål (nb)
	// authors : Espen Hovlandsdal : https://github.com/rexxars
	//           Sigurd Gartmann : https://github.com/sigurdga

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('nb', {
	        months : "januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember".split("_"),
	        monthsShort : "jan._feb._mars_april_mai_juni_juli_aug._sep._okt._nov._des.".split("_"),
	        weekdays : "søndag_mandag_tirsdag_onsdag_torsdag_fredag_lørdag".split("_"),
	        weekdaysShort : "sø._ma._ti._on._to._fr._lø.".split("_"),
	        weekdaysMin : "sø_ma_ti_on_to_fr_lø".split("_"),
	        longDateFormat : {
	            LT : "H.mm",
	            L : "DD.MM.YYYY",
	            LL : "D. MMMM YYYY",
	            LLL : "D. MMMM YYYY [kl.] LT",
	            LLLL : "dddd D. MMMM YYYY [kl.] LT"
	        },
	        calendar : {
	            sameDay: '[i dag kl.] LT',
	            nextDay: '[i morgen kl.] LT',
	            nextWeek: 'dddd [kl.] LT',
	            lastDay: '[i går kl.] LT',
	            lastWeek: '[forrige] dddd [kl.] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : "om %s",
	            past : "for %s siden",
	            s : "noen sekunder",
	            m : "ett minutt",
	            mm : "%d minutter",
	            h : "en time",
	            hh : "%d timer",
	            d : "en dag",
	            dd : "%d dager",
	            M : "en måned",
	            MM : "%d måneder",
	            y : "ett år",
	            yy : "%d år"
	        },
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 56 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : nepali/nepalese
	// author : suvash : https://github.com/suvash

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    var symbolMap = {
	        '1': '१',
	        '2': '२',
	        '3': '३',
	        '4': '४',
	        '5': '५',
	        '6': '६',
	        '7': '७',
	        '8': '८',
	        '9': '९',
	        '0': '०'
	    },
	    numberMap = {
	        '१': '1',
	        '२': '2',
	        '३': '3',
	        '४': '4',
	        '५': '5',
	        '६': '6',
	        '७': '7',
	        '८': '8',
	        '९': '9',
	        '०': '0'
	    };

	    return moment.lang('ne', {
	        months : 'जनवरी_फेब्रुवरी_मार्च_अप्रिल_मई_जुन_जुलाई_अगष्ट_सेप्टेम्बर_अक्टोबर_नोभेम्बर_डिसेम्बर'.split("_"),
	        monthsShort : 'जन._फेब्रु._मार्च_अप्रि._मई_जुन_जुलाई._अग._सेप्ट._अक्टो._नोभे._डिसे.'.split("_"),
	        weekdays : 'आइतबार_सोमबार_मङ्गलबार_बुधबार_बिहिबार_शुक्रबार_शनिबार'.split("_"),
	        weekdaysShort : 'आइत._सोम._मङ्गल._बुध._बिहि._शुक्र._शनि.'.split("_"),
	        weekdaysMin : 'आइ._सो._मङ्_बु._बि._शु._श.'.split("_"),
	        longDateFormat : {
	            LT : "Aको h:mm बजे",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY, LT",
	            LLLL : "dddd, D MMMM YYYY, LT"
	        },
	        preparse: function (string) {
	            return string.replace(/[१२३४५६७८९०]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 3) {
	                return "राती";
	            } else if (hour < 10) {
	                return "बिहान";
	            } else if (hour < 15) {
	                return "दिउँसो";
	            } else if (hour < 18) {
	                return "बेलुका";
	            } else if (hour < 20) {
	                return "साँझ";
	            } else {
	                return "राती";
	            }
	        },
	        calendar : {
	            sameDay : '[आज] LT',
	            nextDay : '[भोली] LT',
	            nextWeek : '[आउँदो] dddd[,] LT',
	            lastDay : '[हिजो] LT',
	            lastWeek : '[गएको] dddd[,] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "%sमा",
	            past : "%s अगाडी",
	            s : "केही समय",
	            m : "एक मिनेट",
	            mm : "%d मिनेट",
	            h : "एक घण्टा",
	            hh : "%d घण्टा",
	            d : "एक दिन",
	            dd : "%d दिन",
	            M : "एक महिना",
	            MM : "%d महिना",
	            y : "एक बर्ष",
	            yy : "%d बर्ष"
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 57 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : dutch (nl)
	// author : Joris Röling : https://github.com/jjupiter

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    var monthsShortWithDots = "jan._feb._mrt._apr._mei_jun._jul._aug._sep._okt._nov._dec.".split("_"),
	        monthsShortWithoutDots = "jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec".split("_");

	    return moment.lang('nl', {
	        months : "januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december".split("_"),
	        monthsShort : function (m, format) {
	            if (/-MMM-/.test(format)) {
	                return monthsShortWithoutDots[m.month()];
	            } else {
	                return monthsShortWithDots[m.month()];
	            }
	        },
	        weekdays : "zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag".split("_"),
	        weekdaysShort : "zo._ma._di._wo._do._vr._za.".split("_"),
	        weekdaysMin : "Zo_Ma_Di_Wo_Do_Vr_Za".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD-MM-YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd D MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay: '[vandaag om] LT',
	            nextDay: '[morgen om] LT',
	            nextWeek: 'dddd [om] LT',
	            lastDay: '[gisteren om] LT',
	            lastWeek: '[afgelopen] dddd [om] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : "over %s",
	            past : "%s geleden",
	            s : "een paar seconden",
	            m : "één minuut",
	            mm : "%d minuten",
	            h : "één uur",
	            hh : "%d uur",
	            d : "één dag",
	            dd : "%d dagen",
	            M : "één maand",
	            MM : "%d maanden",
	            y : "één jaar",
	            yy : "%d jaar"
	        },
	        ordinal : function (number) {
	            return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de');
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 58 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : norwegian nynorsk (nn)
	// author : https://github.com/mechuwind

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('nn', {
	        months : "januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember".split("_"),
	        monthsShort : "jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des".split("_"),
	        weekdays : "sundag_måndag_tysdag_onsdag_torsdag_fredag_laurdag".split("_"),
	        weekdaysShort : "sun_mån_tys_ons_tor_fre_lau".split("_"),
	        weekdaysMin : "su_må_ty_on_to_fr_lø".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD.MM.YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd D MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay: '[I dag klokka] LT',
	            nextDay: '[I morgon klokka] LT',
	            nextWeek: 'dddd [klokka] LT',
	            lastDay: '[I går klokka] LT',
	            lastWeek: '[Føregående] dddd [klokka] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : "om %s",
	            past : "for %s siden",
	            s : "noen sekund",
	            m : "ett minutt",
	            mm : "%d minutt",
	            h : "en time",
	            hh : "%d timar",
	            d : "en dag",
	            dd : "%d dagar",
	            M : "en månad",
	            MM : "%d månader",
	            y : "ett år",
	            yy : "%d år"
	        },
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 59 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : polish (pl)
	// author : Rafal Hirsz : https://github.com/evoL

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    var monthsNominative = "styczeń_luty_marzec_kwiecień_maj_czerwiec_lipiec_sierpień_wrzesień_październik_listopad_grudzień".split("_"),
	        monthsSubjective = "stycznia_lutego_marca_kwietnia_maja_czerwca_lipca_sierpnia_września_października_listopada_grudnia".split("_");

	    function plural(n) {
	        return (n % 10 < 5) && (n % 10 > 1) && ((~~(n / 10) % 10) !== 1);
	    }

	    function translate(number, withoutSuffix, key) {
	        var result = number + " ";
	        switch (key) {
	        case 'm':
	            return withoutSuffix ? 'minuta' : 'minutę';
	        case 'mm':
	            return result + (plural(number) ? 'minuty' : 'minut');
	        case 'h':
	            return withoutSuffix  ? 'godzina'  : 'godzinę';
	        case 'hh':
	            return result + (plural(number) ? 'godziny' : 'godzin');
	        case 'MM':
	            return result + (plural(number) ? 'miesiące' : 'miesięcy');
	        case 'yy':
	            return result + (plural(number) ? 'lata' : 'lat');
	        }
	    }

	    return moment.lang('pl', {
	        months : function (momentToFormat, format) {
	            if (/D MMMM/.test(format)) {
	                return monthsSubjective[momentToFormat.month()];
	            } else {
	                return monthsNominative[momentToFormat.month()];
	            }
	        },
	        monthsShort : "sty_lut_mar_kwi_maj_cze_lip_sie_wrz_paź_lis_gru".split("_"),
	        weekdays : "niedziela_poniedziałek_wtorek_środa_czwartek_piątek_sobota".split("_"),
	        weekdaysShort : "nie_pon_wt_śr_czw_pt_sb".split("_"),
	        weekdaysMin : "N_Pn_Wt_Śr_Cz_Pt_So".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD.MM.YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd, D MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay: '[Dziś o] LT',
	            nextDay: '[Jutro o] LT',
	            nextWeek: '[W] dddd [o] LT',
	            lastDay: '[Wczoraj o] LT',
	            lastWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[W zeszłą niedzielę o] LT';
	                case 3:
	                    return '[W zeszłą środę o] LT';
	                case 6:
	                    return '[W zeszłą sobotę o] LT';
	                default:
	                    return '[W zeszły] dddd [o] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : "za %s",
	            past : "%s temu",
	            s : "kilka sekund",
	            m : translate,
	            mm : translate,
	            h : translate,
	            hh : translate,
	            d : "1 dzień",
	            dd : '%d dni',
	            M : "miesiąc",
	            MM : translate,
	            y : "rok",
	            yy : translate
	        },
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 60 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : brazilian portuguese (pt-br)
	// author : Caio Ribeiro Pereira : https://github.com/caio-ribeiro-pereira

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('pt-br', {
	        months : "Janeiro_Fevereiro_Março_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro".split("_"),
	        monthsShort : "Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez".split("_"),
	        weekdays : "Domingo_Segunda-feira_Terça-feira_Quarta-feira_Quinta-feira_Sexta-feira_Sábado".split("_"),
	        weekdaysShort : "Dom_Seg_Ter_Qua_Qui_Sex_Sáb".split("_"),
	        weekdaysMin : "Dom_2ª_3ª_4ª_5ª_6ª_Sáb".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD/MM/YYYY",
	            LL : "D [de] MMMM [de] YYYY",
	            LLL : "D [de] MMMM [de] YYYY LT",
	            LLLL : "dddd, D [de] MMMM [de] YYYY LT"
	        },
	        calendar : {
	            sameDay: '[Hoje às] LT',
	            nextDay: '[Amanhã às] LT',
	            nextWeek: 'dddd [às] LT',
	            lastDay: '[Ontem às] LT',
	            lastWeek: function () {
	                return (this.day() === 0 || this.day() === 6) ?
	                    '[Último] dddd [às] LT' : // Saturday + Sunday
	                    '[Última] dddd [às] LT'; // Monday - Friday
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : "em %s",
	            past : "%s atrás",
	            s : "segundos",
	            m : "um minuto",
	            mm : "%d minutos",
	            h : "uma hora",
	            hh : "%d horas",
	            d : "um dia",
	            dd : "%d dias",
	            M : "um mês",
	            MM : "%d meses",
	            y : "um ano",
	            yy : "%d anos"
	        },
	        ordinal : '%dº'
	    });
	}));


/***/ },
/* 61 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : portuguese (pt)
	// author : Jefferson : https://github.com/jalex79

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('pt', {
	        months : "Janeiro_Fevereiro_Março_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro".split("_"),
	        monthsShort : "Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez".split("_"),
	        weekdays : "Domingo_Segunda-feira_Terça-feira_Quarta-feira_Quinta-feira_Sexta-feira_Sábado".split("_"),
	        weekdaysShort : "Dom_Seg_Ter_Qua_Qui_Sex_Sáb".split("_"),
	        weekdaysMin : "Dom_2ª_3ª_4ª_5ª_6ª_Sáb".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD/MM/YYYY",
	            LL : "D [de] MMMM [de] YYYY",
	            LLL : "D [de] MMMM [de] YYYY LT",
	            LLLL : "dddd, D [de] MMMM [de] YYYY LT"
	        },
	        calendar : {
	            sameDay: '[Hoje às] LT',
	            nextDay: '[Amanhã às] LT',
	            nextWeek: 'dddd [às] LT',
	            lastDay: '[Ontem às] LT',
	            lastWeek: function () {
	                return (this.day() === 0 || this.day() === 6) ?
	                    '[Último] dddd [às] LT' : // Saturday + Sunday
	                    '[Última] dddd [às] LT'; // Monday - Friday
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : "em %s",
	            past : "%s atrás",
	            s : "segundos",
	            m : "um minuto",
	            mm : "%d minutos",
	            h : "uma hora",
	            hh : "%d horas",
	            d : "um dia",
	            dd : "%d dias",
	            M : "um mês",
	            MM : "%d meses",
	            y : "um ano",
	            yy : "%d anos"
	        },
	        ordinal : '%dº',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 62 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : romanian (ro)
	// author : Vlad Gurdiga : https://github.com/gurdiga
	// author : Valentin Agachi : https://github.com/avaly

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    function relativeTimeWithPlural(number, withoutSuffix, key) {
	        var format = {
	            'mm': 'minute',
	            'hh': 'ore',
	            'dd': 'zile',
	            'MM': 'luni',
	            'yy': 'ani'
	        },
	            separator = ' ';
	        if (number % 100 >= 20 || (number >= 100 && number % 100 === 0)) {
	            separator = ' de ';
	        }

	        return number + separator + format[key];
	    }

	    return moment.lang('ro', {
	        months : "ianuarie_februarie_martie_aprilie_mai_iunie_iulie_august_septembrie_octombrie_noiembrie_decembrie".split("_"),
	        monthsShort : "ian_feb_mar_apr_mai_iun_iul_aug_sep_oct_noi_dec".split("_"),
	        weekdays : "duminică_luni_marți_miercuri_joi_vineri_sâmbătă".split("_"),
	        weekdaysShort : "Dum_Lun_Mar_Mie_Joi_Vin_Sâm".split("_"),
	        weekdaysMin : "Du_Lu_Ma_Mi_Jo_Vi_Sâ".split("_"),
	        longDateFormat : {
	            LT : "H:mm",
	            L : "DD.MM.YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY H:mm",
	            LLLL : "dddd, D MMMM YYYY H:mm"
	        },
	        calendar : {
	            sameDay: "[azi la] LT",
	            nextDay: '[mâine la] LT',
	            nextWeek: 'dddd [la] LT',
	            lastDay: '[ieri la] LT',
	            lastWeek: '[fosta] dddd [la] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : "peste %s",
	            past : "%s în urmă",
	            s : "câteva secunde",
	            m : "un minut",
	            mm : relativeTimeWithPlural,
	            h : "o oră",
	            hh : relativeTimeWithPlural,
	            d : "o zi",
	            dd : relativeTimeWithPlural,
	            M : "o lună",
	            MM : relativeTimeWithPlural,
	            y : "un an",
	            yy : relativeTimeWithPlural
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 63 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : serbian (rs)
	// author : Limon Monte : https://github.com/limonte
	// based on (bs) translation by Nedim Cholich

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {

	    function translate(number, withoutSuffix, key) {
	        var result = number + " ";
	        switch (key) {
	        case 'm':
	            return withoutSuffix ? 'jedna minuta' : 'jedne minute';
	        case 'mm':
	            if (number === 1) {
	                result += 'minuta';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'minute';
	            } else {
	                result += 'minuta';
	            }
	            return result;
	        case 'h':
	            return withoutSuffix ? 'jedan sat' : 'jednog sata';
	        case 'hh':
	            if (number === 1) {
	                result += 'sat';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'sata';
	            } else {
	                result += 'sati';
	            }
	            return result;
	        case 'dd':
	            if (number === 1) {
	                result += 'dan';
	            } else {
	                result += 'dana';
	            }
	            return result;
	        case 'MM':
	            if (number === 1) {
	                result += 'mesec';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'meseca';
	            } else {
	                result += 'meseci';
	            }
	            return result;
	        case 'yy':
	            if (number === 1) {
	                result += 'godina';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'godine';
	            } else {
	                result += 'godina';
	            }
	            return result;
	        }
	    }

	    return moment.lang('rs', {
	        months : "januar_februar_mart_april_maj_jun_jul_avgust_septembar_oktobar_novembar_decembar".split("_"),
	        monthsShort : "jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.".split("_"),
	        weekdays : "nedelja_ponedeljak_utorak_sreda_četvrtak_petak_subota".split("_"),
	        weekdaysShort : "ned._pon._uto._sre._čet._pet._sub.".split("_"),
	        weekdaysMin : "ne_po_ut_sr_če_pe_su".split("_"),
	        longDateFormat : {
	            LT : "H:mm",
	            L : "DD. MM. YYYY",
	            LL : "D. MMMM YYYY",
	            LLL : "D. MMMM YYYY LT",
	            LLLL : "dddd, D. MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay  : '[danas u] LT',
	            nextDay  : '[sutra u] LT',

	            nextWeek : function () {
	                switch (this.day()) {
	                case 0:
	                    return '[u] [nedelju] [u] LT';
	                case 3:
	                    return '[u] [sredu] [u] LT';
	                case 6:
	                    return '[u] [subotu] [u] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[u] dddd [u] LT';
	                }
	            },
	            lastDay  : '[juče u] LT',
	            lastWeek : function () {
	                switch (this.day()) {
	                case 0:
	                case 3:
	                    return '[prošlu] dddd [u] LT';
	                case 6:
	                    return '[prošle] [subote] [u] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[prošli] dddd [u] LT';
	                }
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "za %s",
	            past   : "pre %s",
	            s      : "par sekundi",
	            m      : translate,
	            mm     : translate,
	            h      : translate,
	            hh     : translate,
	            d      : "dan",
	            dd     : translate,
	            M      : "mesec",
	            MM     : translate,
	            y      : "godinu",
	            yy     : translate
	        },
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 64 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : russian (ru)
	// author : Viktorminator : https://github.com/Viktorminator
	// Author : Menelion Elensúle : https://github.com/Oire

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    function plural(word, num) {
	        var forms = word.split('_');
	        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
	    }

	    function relativeTimeWithPlural(number, withoutSuffix, key) {
	        var format = {
	            'mm': 'минута_минуты_минут',
	            'hh': 'час_часа_часов',
	            'dd': 'день_дня_дней',
	            'MM': 'месяц_месяца_месяцев',
	            'yy': 'год_года_лет'
	        };
	        if (key === 'm') {
	            return withoutSuffix ? 'минута' : 'минуту';
	        }
	        else {
	            return number + ' ' + plural(format[key], +number);
	        }
	    }

	    function monthsCaseReplace(m, format) {
	        var months = {
	            'nominative': 'январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь'.split('_'),
	            'accusative': 'января_февраля_марта_апреля_мая_июня_июля_августа_сентября_октября_ноября_декабря'.split('_')
	        },

	        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
	            'accusative' :
	            'nominative';

	        return months[nounCase][m.month()];
	    }

	    function monthsShortCaseReplace(m, format) {
	        var monthsShort = {
	            'nominative': 'янв_фев_мар_апр_май_июнь_июль_авг_сен_окт_ноя_дек'.split('_'),
	            'accusative': 'янв_фев_мар_апр_мая_июня_июля_авг_сен_окт_ноя_дек'.split('_')
	        },

	        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
	            'accusative' :
	            'nominative';

	        return monthsShort[nounCase][m.month()];
	    }

	    function weekdaysCaseReplace(m, format) {
	        var weekdays = {
	            'nominative': 'воскресенье_понедельник_вторник_среда_четверг_пятница_суббота'.split('_'),
	            'accusative': 'воскресенье_понедельник_вторник_среду_четверг_пятницу_субботу'.split('_')
	        },

	        nounCase = (/\[ ?[Вв] ?(?:прошлую|следующую)? ?\] ?dddd/).test(format) ?
	            'accusative' :
	            'nominative';

	        return weekdays[nounCase][m.day()];
	    }

	    return moment.lang('ru', {
	        months : monthsCaseReplace,
	        monthsShort : monthsShortCaseReplace,
	        weekdays : weekdaysCaseReplace,
	        weekdaysShort : "вс_пн_вт_ср_чт_пт_сб".split("_"),
	        weekdaysMin : "вс_пн_вт_ср_чт_пт_сб".split("_"),
	        monthsParse : [/^янв/i, /^фев/i, /^мар/i, /^апр/i, /^ма[й|я]/i, /^июн/i, /^июл/i, /^авг/i, /^сен/i, /^окт/i, /^ноя/i, /^дек/i],
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD.MM.YYYY",
	            LL : "D MMMM YYYY г.",
	            LLL : "D MMMM YYYY г., LT",
	            LLLL : "dddd, D MMMM YYYY г., LT"
	        },
	        calendar : {
	            sameDay: '[Сегодня в] LT',
	            nextDay: '[Завтра в] LT',
	            lastDay: '[Вчера в] LT',
	            nextWeek: function () {
	                return this.day() === 2 ? '[Во] dddd [в] LT' : '[В] dddd [в] LT';
	            },
	            lastWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[В прошлое] dddd [в] LT';
	                case 1:
	                case 2:
	                case 4:
	                    return '[В прошлый] dddd [в] LT';
	                case 3:
	                case 5:
	                case 6:
	                    return '[В прошлую] dddd [в] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : "через %s",
	            past : "%s назад",
	            s : "несколько секунд",
	            m : relativeTimeWithPlural,
	            mm : relativeTimeWithPlural,
	            h : "час",
	            hh : relativeTimeWithPlural,
	            d : "день",
	            dd : relativeTimeWithPlural,
	            M : "месяц",
	            MM : relativeTimeWithPlural,
	            y : "год",
	            yy : relativeTimeWithPlural
	        },

	        // M. E.: those two are virtually unused but a user might want to implement them for his/her website for some reason

	        meridiem : function (hour, minute, isLower) {
	            if (hour < 4) {
	                return "ночи";
	            } else if (hour < 12) {
	                return "утра";
	            } else if (hour < 17) {
	                return "дня";
	            } else {
	                return "вечера";
	            }
	        },

	        ordinal: function (number, period) {
	            switch (period) {
	            case 'M':
	            case 'd':
	            case 'DDD':
	                return number + '-й';
	            case 'D':
	                return number + '-го';
	            case 'w':
	            case 'W':
	                return number + '-я';
	            default:
	                return number;
	            }
	        },

	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 65 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : slovak (sk)
	// author : Martin Minka : https://github.com/k2s
	// based on work of petrbela : https://github.com/petrbela

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    var months = "január_február_marec_apríl_máj_jún_júl_august_september_október_november_december".split("_"),
	        monthsShort = "jan_feb_mar_apr_máj_jún_júl_aug_sep_okt_nov_dec".split("_");

	    function plural(n) {
	        return (n > 1) && (n < 5);
	    }

	    function translate(number, withoutSuffix, key, isFuture) {
	        var result = number + " ";
	        switch (key) {
	        case 's':  // a few seconds / in a few seconds / a few seconds ago
	            return (withoutSuffix || isFuture) ? 'pár sekúnd' : 'pár sekundami';
	        case 'm':  // a minute / in a minute / a minute ago
	            return withoutSuffix ? 'minúta' : (isFuture ? 'minútu' : 'minútou');
	        case 'mm': // 9 minutes / in 9 minutes / 9 minutes ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'minúty' : 'minút');
	            } else {
	                return result + 'minútami';
	            }
	            break;
	        case 'h':  // an hour / in an hour / an hour ago
	            return withoutSuffix ? 'hodina' : (isFuture ? 'hodinu' : 'hodinou');
	        case 'hh': // 9 hours / in 9 hours / 9 hours ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'hodiny' : 'hodín');
	            } else {
	                return result + 'hodinami';
	            }
	            break;
	        case 'd':  // a day / in a day / a day ago
	            return (withoutSuffix || isFuture) ? 'deň' : 'dňom';
	        case 'dd': // 9 days / in 9 days / 9 days ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'dni' : 'dní');
	            } else {
	                return result + 'dňami';
	            }
	            break;
	        case 'M':  // a month / in a month / a month ago
	            return (withoutSuffix || isFuture) ? 'mesiac' : 'mesiacom';
	        case 'MM': // 9 months / in 9 months / 9 months ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'mesiace' : 'mesiacov');
	            } else {
	                return result + 'mesiacmi';
	            }
	            break;
	        case 'y':  // a year / in a year / a year ago
	            return (withoutSuffix || isFuture) ? 'rok' : 'rokom';
	        case 'yy': // 9 years / in 9 years / 9 years ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'roky' : 'rokov');
	            } else {
	                return result + 'rokmi';
	            }
	            break;
	        }
	    }

	    return moment.lang('sk', {
	        months : months,
	        monthsShort : monthsShort,
	        monthsParse : (function (months, monthsShort) {
	            var i, _monthsParse = [];
	            for (i = 0; i < 12; i++) {
	                // use custom parser to solve problem with July (červenec)
	                _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
	            }
	            return _monthsParse;
	        }(months, monthsShort)),
	        weekdays : "nedeľa_pondelok_utorok_streda_štvrtok_piatok_sobota".split("_"),
	        weekdaysShort : "ne_po_ut_st_št_pi_so".split("_"),
	        weekdaysMin : "ne_po_ut_st_št_pi_so".split("_"),
	        longDateFormat : {
	            LT: "H:mm",
	            L : "DD.MM.YYYY",
	            LL : "D. MMMM YYYY",
	            LLL : "D. MMMM YYYY LT",
	            LLLL : "dddd D. MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay: "[dnes o] LT",
	            nextDay: '[zajtra o] LT',
	            nextWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[v nedeľu o] LT';
	                case 1:
	                case 2:
	                    return '[v] dddd [o] LT';
	                case 3:
	                    return '[v stredu o] LT';
	                case 4:
	                    return '[vo štvrtok o] LT';
	                case 5:
	                    return '[v piatok o] LT';
	                case 6:
	                    return '[v sobotu o] LT';
	                }
	            },
	            lastDay: '[včera o] LT',
	            lastWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[minulú nedeľu o] LT';
	                case 1:
	                case 2:
	                    return '[minulý] dddd [o] LT';
	                case 3:
	                    return '[minulú stredu o] LT';
	                case 4:
	                case 5:
	                    return '[minulý] dddd [o] LT';
	                case 6:
	                    return '[minulú sobotu o] LT';
	                }
	            },
	            sameElse: "L"
	        },
	        relativeTime : {
	            future : "za %s",
	            past : "pred %s",
	            s : translate,
	            m : translate,
	            mm : translate,
	            h : translate,
	            hh : translate,
	            d : translate,
	            dd : translate,
	            M : translate,
	            MM : translate,
	            y : translate,
	            yy : translate
	        },
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 66 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : slovenian (sl)
	// author : Robert Sedovšek : https://github.com/sedovsek

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    function translate(number, withoutSuffix, key) {
	        var result = number + " ";
	        switch (key) {
	        case 'm':
	            return withoutSuffix ? 'ena minuta' : 'eno minuto';
	        case 'mm':
	            if (number === 1) {
	                result += 'minuta';
	            } else if (number === 2) {
	                result += 'minuti';
	            } else if (number === 3 || number === 4) {
	                result += 'minute';
	            } else {
	                result += 'minut';
	            }
	            return result;
	        case 'h':
	            return withoutSuffix ? 'ena ura' : 'eno uro';
	        case 'hh':
	            if (number === 1) {
	                result += 'ura';
	            } else if (number === 2) {
	                result += 'uri';
	            } else if (number === 3 || number === 4) {
	                result += 'ure';
	            } else {
	                result += 'ur';
	            }
	            return result;
	        case 'dd':
	            if (number === 1) {
	                result += 'dan';
	            } else {
	                result += 'dni';
	            }
	            return result;
	        case 'MM':
	            if (number === 1) {
	                result += 'mesec';
	            } else if (number === 2) {
	                result += 'meseca';
	            } else if (number === 3 || number === 4) {
	                result += 'mesece';
	            } else {
	                result += 'mesecev';
	            }
	            return result;
	        case 'yy':
	            if (number === 1) {
	                result += 'leto';
	            } else if (number === 2) {
	                result += 'leti';
	            } else if (number === 3 || number === 4) {
	                result += 'leta';
	            } else {
	                result += 'let';
	            }
	            return result;
	        }
	    }

	    return moment.lang('sl', {
	        months : "januar_februar_marec_april_maj_junij_julij_avgust_september_oktober_november_december".split("_"),
	        monthsShort : "jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.".split("_"),
	        weekdays : "nedelja_ponedeljek_torek_sreda_četrtek_petek_sobota".split("_"),
	        weekdaysShort : "ned._pon._tor._sre._čet._pet._sob.".split("_"),
	        weekdaysMin : "ne_po_to_sr_če_pe_so".split("_"),
	        longDateFormat : {
	            LT : "H:mm",
	            L : "DD. MM. YYYY",
	            LL : "D. MMMM YYYY",
	            LLL : "D. MMMM YYYY LT",
	            LLLL : "dddd, D. MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay  : '[danes ob] LT',
	            nextDay  : '[jutri ob] LT',

	            nextWeek : function () {
	                switch (this.day()) {
	                case 0:
	                    return '[v] [nedeljo] [ob] LT';
	                case 3:
	                    return '[v] [sredo] [ob] LT';
	                case 6:
	                    return '[v] [soboto] [ob] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[v] dddd [ob] LT';
	                }
	            },
	            lastDay  : '[včeraj ob] LT',
	            lastWeek : function () {
	                switch (this.day()) {
	                case 0:
	                case 3:
	                case 6:
	                    return '[prejšnja] dddd [ob] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[prejšnji] dddd [ob] LT';
	                }
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "čez %s",
	            past   : "%s nazaj",
	            s      : "nekaj sekund",
	            m      : translate,
	            mm     : translate,
	            h      : translate,
	            hh     : translate,
	            d      : "en dan",
	            dd     : translate,
	            M      : "en mesec",
	            MM     : translate,
	            y      : "eno leto",
	            yy     : translate
	        },
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 67 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : Albanian (sq)
	// author : Flakërim Ismani : https://github.com/flakerimi
	// author: Menelion Elensúle: https://github.com/Oire (tests)

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('sq', {
	        months : "Janar_Shkurt_Mars_Prill_Maj_Qershor_Korrik_Gusht_Shtator_Tetor_Nëntor_Dhjetor".split("_"),
	        monthsShort : "Jan_Shk_Mar_Pri_Maj_Qer_Kor_Gus_Sht_Tet_Nën_Dhj".split("_"),
	        weekdays : "E Diel_E Hënë_E Marte_E Mërkure_E Enjte_E Premte_E Shtunë".split("_"),
	        weekdaysShort : "Die_Hën_Mar_Mër_Enj_Pre_Sht".split("_"),
	        weekdaysMin : "D_H_Ma_Më_E_P_Sh".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd, D MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay : '[Sot në] LT',
	            nextDay : '[Neser në] LT',
	            nextWeek : 'dddd [në] LT',
	            lastDay : '[Dje në] LT',
	            lastWeek : 'dddd [e kaluar në] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "në %s",
	            past : "%s me parë",
	            s : "disa sekonda",
	            m : "një minut",
	            mm : "%d minuta",
	            h : "një orë",
	            hh : "%d orë",
	            d : "një ditë",
	            dd : "%d ditë",
	            M : "një muaj",
	            MM : "%d muaj",
	            y : "një vit",
	            yy : "%d vite"
	        },
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 68 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : swedish (sv)
	// author : Jens Alm : https://github.com/ulmus

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('sv', {
	        months : "januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december".split("_"),
	        monthsShort : "jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec".split("_"),
	        weekdays : "söndag_måndag_tisdag_onsdag_torsdag_fredag_lördag".split("_"),
	        weekdaysShort : "sön_mån_tis_ons_tor_fre_lör".split("_"),
	        weekdaysMin : "sö_må_ti_on_to_fr_lö".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "YYYY-MM-DD",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd D MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay: '[Idag] LT',
	            nextDay: '[Imorgon] LT',
	            lastDay: '[Igår] LT',
	            nextWeek: 'dddd LT',
	            lastWeek: '[Förra] dddd[en] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : "om %s",
	            past : "för %s sedan",
	            s : "några sekunder",
	            m : "en minut",
	            mm : "%d minuter",
	            h : "en timme",
	            hh : "%d timmar",
	            d : "en dag",
	            dd : "%d dagar",
	            M : "en månad",
	            MM : "%d månader",
	            y : "ett år",
	            yy : "%d år"
	        },
	        ordinal : function (number) {
	            var b = number % 10,
	                output = (~~ (number % 100 / 10) === 1) ? 'e' :
	                (b === 1) ? 'a' :
	                (b === 2) ? 'a' :
	                (b === 3) ? 'e' : 'e';
	            return number + output;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 69 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : tamil (ta)
	// author : Arjunkumar Krishnamoorthy : https://github.com/tk120404

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    /*var symbolMap = {
	            '1': '௧',
	            '2': '௨',
	            '3': '௩',
	            '4': '௪',
	            '5': '௫',
	            '6': '௬',
	            '7': '௭',
	            '8': '௮',
	            '9': '௯',
	            '0': '௦'
	        },
	        numberMap = {
	            '௧': '1',
	            '௨': '2',
	            '௩': '3',
	            '௪': '4',
	            '௫': '5',
	            '௬': '6',
	            '௭': '7',
	            '௮': '8',
	            '௯': '9',
	            '௦': '0'
	        }; */

	    return moment.lang('ta', {
	        months : 'ஜனவரி_பிப்ரவரி_மார்ச்_ஏப்ரல்_மே_ஜூன்_ஜூலை_ஆகஸ்ட்_செப்டெம்பர்_அக்டோபர்_நவம்பர்_டிசம்பர்'.split("_"),
	        monthsShort : 'ஜனவரி_பிப்ரவரி_மார்ச்_ஏப்ரல்_மே_ஜூன்_ஜூலை_ஆகஸ்ட்_செப்டெம்பர்_அக்டோபர்_நவம்பர்_டிசம்பர்'.split("_"),
	        weekdays : 'ஞாயிற்றுக்கிழமை_திங்கட்கிழமை_செவ்வாய்கிழமை_புதன்கிழமை_வியாழக்கிழமை_வெள்ளிக்கிழமை_சனிக்கிழமை'.split("_"),
	        weekdaysShort : 'ஞாயிறு_திங்கள்_செவ்வாய்_புதன்_வியாழன்_வெள்ளி_சனி'.split("_"),
	        weekdaysMin : 'ஞா_தி_செ_பு_வி_வெ_ச'.split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY, LT",
	            LLLL : "dddd, D MMMM YYYY, LT"
	        },
	        calendar : {
	            sameDay : '[இன்று] LT',
	            nextDay : '[நாளை] LT',
	            nextWeek : 'dddd, LT',
	            lastDay : '[நேற்று] LT',
	            lastWeek : '[கடந்த வாரம்] dddd, LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "%s இல்",
	            past : "%s முன்",
	            s : "ஒரு சில விநாடிகள்",
	            m : "ஒரு நிமிடம்",
	            mm : "%d நிமிடங்கள்",
	            h : "ஒரு மணி நேரம்",
	            hh : "%d மணி நேரம்",
	            d : "ஒரு நாள்",
	            dd : "%d நாட்கள்",
	            M : "ஒரு மாதம்",
	            MM : "%d மாதங்கள்",
	            y : "ஒரு வருடம்",
	            yy : "%d ஆண்டுகள்"
	        },
	/*        preparse: function (string) {
	            return string.replace(/[௧௨௩௪௫௬௭௮௯௦]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },*/
	        ordinal : function (number) {
	            return number + 'வது';
	        },


	// refer http://ta.wikipedia.org/s/1er1      

	        meridiem : function (hour, minute, isLower) {
	            if (hour >= 6 && hour <= 10) {
	                return " காலை";
	            } else   if (hour >= 10 && hour <= 14) {
	                return " நண்பகல்";
	            } else    if (hour >= 14 && hour <= 18) {
	                return " எற்பாடு";
	            } else   if (hour >= 18 && hour <= 20) {
	                return " மாலை";
	            } else  if (hour >= 20 && hour <= 24) {
	                return " இரவு";
	            } else  if (hour >= 0 && hour <= 6) {
	                return " வைகறை";
	            }
	        },
	        week : {
	            dow : 0, // Sunday is the first day of the week.
	            doy : 6  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 70 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : thai (th)
	// author : Kridsada Thanabulpong : https://github.com/sirn

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('th', {
	        months : "มกราคม_กุมภาพันธ์_มีนาคม_เมษายน_พฤษภาคม_มิถุนายน_กรกฎาคม_สิงหาคม_กันยายน_ตุลาคม_พฤศจิกายน_ธันวาคม".split("_"),
	        monthsShort : "มกรา_กุมภา_มีนา_เมษา_พฤษภา_มิถุนา_กรกฎา_สิงหา_กันยา_ตุลา_พฤศจิกา_ธันวา".split("_"),
	        weekdays : "อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัสบดี_ศุกร์_เสาร์".split("_"),
	        weekdaysShort : "อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัส_ศุกร์_เสาร์".split("_"), // yes, three characters difference
	        weekdaysMin : "อา._จ._อ._พ._พฤ._ศ._ส.".split("_"),
	        longDateFormat : {
	            LT : "H นาฬิกา m นาที",
	            L : "YYYY/MM/DD",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY เวลา LT",
	            LLLL : "วันddddที่ D MMMM YYYY เวลา LT"
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 12) {
	                return "ก่อนเที่ยง";
	            } else {
	                return "หลังเที่ยง";
	            }
	        },
	        calendar : {
	            sameDay : '[วันนี้ เวลา] LT',
	            nextDay : '[พรุ่งนี้ เวลา] LT',
	            nextWeek : 'dddd[หน้า เวลา] LT',
	            lastDay : '[เมื่อวานนี้ เวลา] LT',
	            lastWeek : '[วัน]dddd[ที่แล้ว เวลา] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "อีก %s",
	            past : "%sที่แล้ว",
	            s : "ไม่กี่วินาที",
	            m : "1 นาที",
	            mm : "%d นาที",
	            h : "1 ชั่วโมง",
	            hh : "%d ชั่วโมง",
	            d : "1 วัน",
	            dd : "%d วัน",
	            M : "1 เดือน",
	            MM : "%d เดือน",
	            y : "1 ปี",
	            yy : "%d ปี"
	        }
	    });
	}));


/***/ },
/* 71 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : Tagalog/Filipino (tl-ph)
	// author : Dan Hagman

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('tl-ph', {
	        months : "Enero_Pebrero_Marso_Abril_Mayo_Hunyo_Hulyo_Agosto_Setyembre_Oktubre_Nobyembre_Disyembre".split("_"),
	        monthsShort : "Ene_Peb_Mar_Abr_May_Hun_Hul_Ago_Set_Okt_Nob_Dis".split("_"),
	        weekdays : "Linggo_Lunes_Martes_Miyerkules_Huwebes_Biyernes_Sabado".split("_"),
	        weekdaysShort : "Lin_Lun_Mar_Miy_Huw_Biy_Sab".split("_"),
	        weekdaysMin : "Li_Lu_Ma_Mi_Hu_Bi_Sab".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "MM/D/YYYY",
	            LL : "MMMM D, YYYY",
	            LLL : "MMMM D, YYYY LT",
	            LLLL : "dddd, MMMM DD, YYYY LT"
	        },
	        calendar : {
	            sameDay: "[Ngayon sa] LT",
	            nextDay: '[Bukas sa] LT',
	            nextWeek: 'dddd [sa] LT',
	            lastDay: '[Kahapon sa] LT',
	            lastWeek: 'dddd [huling linggo] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : "sa loob ng %s",
	            past : "%s ang nakalipas",
	            s : "ilang segundo",
	            m : "isang minuto",
	            mm : "%d minuto",
	            h : "isang oras",
	            hh : "%d oras",
	            d : "isang araw",
	            dd : "%d araw",
	            M : "isang buwan",
	            MM : "%d buwan",
	            y : "isang taon",
	            yy : "%d taon"
	        },
	        ordinal : function (number) {
	            return number;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 72 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : turkish (tr)
	// authors : Erhan Gundogan : https://github.com/erhangundogan,
	//           Burak Yiğit Kaya: https://github.com/BYK

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {

	    var suffixes = {
	        1: "'inci",
	        5: "'inci",
	        8: "'inci",
	        70: "'inci",
	        80: "'inci",

	        2: "'nci",
	        7: "'nci",
	        20: "'nci",
	        50: "'nci",

	        3: "'üncü",
	        4: "'üncü",
	        100: "'üncü",

	        6: "'ncı",

	        9: "'uncu",
	        10: "'uncu",
	        30: "'uncu",

	        60: "'ıncı",
	        90: "'ıncı"
	    };

	    return moment.lang('tr', {
	        months : "Ocak_Şubat_Mart_Nisan_Mayıs_Haziran_Temmuz_Ağustos_Eylül_Ekim_Kasım_Aralık".split("_"),
	        monthsShort : "Oca_Şub_Mar_Nis_May_Haz_Tem_Ağu_Eyl_Eki_Kas_Ara".split("_"),
	        weekdays : "Pazar_Pazartesi_Salı_Çarşamba_Perşembe_Cuma_Cumartesi".split("_"),
	        weekdaysShort : "Paz_Pts_Sal_Çar_Per_Cum_Cts".split("_"),
	        weekdaysMin : "Pz_Pt_Sa_Ça_Pe_Cu_Ct".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD.MM.YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd, D MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay : '[bugün saat] LT',
	            nextDay : '[yarın saat] LT',
	            nextWeek : '[haftaya] dddd [saat] LT',
	            lastDay : '[dün] LT',
	            lastWeek : '[geçen hafta] dddd [saat] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "%s sonra",
	            past : "%s önce",
	            s : "birkaç saniye",
	            m : "bir dakika",
	            mm : "%d dakika",
	            h : "bir saat",
	            hh : "%d saat",
	            d : "bir gün",
	            dd : "%d gün",
	            M : "bir ay",
	            MM : "%d ay",
	            y : "bir yıl",
	            yy : "%d yıl"
	        },
	        ordinal : function (number) {
	            if (number === 0) {  // special case for zero
	                return number + "'ıncı";
	            }
	            var a = number % 10,
	                b = number % 100 - a,
	                c = number >= 100 ? 100 : null;

	            return number + (suffixes[a] || suffixes[b] || suffixes[c]);
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 73 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : Morocco Central Atlas Tamaziɣt in Latin (tzm-la)
	// author : Abdel Said : https://github.com/abdelsaid

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('tzm-la', {
	        months : "innayr_brˤayrˤ_marˤsˤ_ibrir_mayyw_ywnyw_ywlywz_ɣwšt_šwtanbir_ktˤwbrˤ_nwwanbir_dwjnbir".split("_"),
	        monthsShort : "innayr_brˤayrˤ_marˤsˤ_ibrir_mayyw_ywnyw_ywlywz_ɣwšt_šwtanbir_ktˤwbrˤ_nwwanbir_dwjnbir".split("_"),
	        weekdays : "asamas_aynas_asinas_akras_akwas_asimwas_asiḍyas".split("_"),
	        weekdaysShort : "asamas_aynas_asinas_akras_akwas_asimwas_asiḍyas".split("_"),
	        weekdaysMin : "asamas_aynas_asinas_akras_akwas_asimwas_asiḍyas".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd D MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay: "[asdkh g] LT",
	            nextDay: '[aska g] LT',
	            nextWeek: 'dddd [g] LT',
	            lastDay: '[assant g] LT',
	            lastWeek: 'dddd [g] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : "dadkh s yan %s",
	            past : "yan %s",
	            s : "imik",
	            m : "minuḍ",
	            mm : "%d minuḍ",
	            h : "saɛa",
	            hh : "%d tassaɛin",
	            d : "ass",
	            dd : "%d ossan",
	            M : "ayowr",
	            MM : "%d iyyirn",
	            y : "asgas",
	            yy : "%d isgasn"
	        },
	        week : {
	            dow : 6, // Saturday is the first day of the week.
	            doy : 12  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 74 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : Morocco Central Atlas Tamaziɣt (tzm)
	// author : Abdel Said : https://github.com/abdelsaid

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('tzm', {
	        months : "ⵉⵏⵏⴰⵢⵔ_ⴱⵕⴰⵢⵕ_ⵎⴰⵕⵚ_ⵉⴱⵔⵉⵔ_ⵎⴰⵢⵢⵓ_ⵢⵓⵏⵢⵓ_ⵢⵓⵍⵢⵓⵣ_ⵖⵓⵛⵜ_ⵛⵓⵜⴰⵏⴱⵉⵔ_ⴽⵟⵓⴱⵕ_ⵏⵓⵡⴰⵏⴱⵉⵔ_ⴷⵓⵊⵏⴱⵉⵔ".split("_"),
	        monthsShort : "ⵉⵏⵏⴰⵢⵔ_ⴱⵕⴰⵢⵕ_ⵎⴰⵕⵚ_ⵉⴱⵔⵉⵔ_ⵎⴰⵢⵢⵓ_ⵢⵓⵏⵢⵓ_ⵢⵓⵍⵢⵓⵣ_ⵖⵓⵛⵜ_ⵛⵓⵜⴰⵏⴱⵉⵔ_ⴽⵟⵓⴱⵕ_ⵏⵓⵡⴰⵏⴱⵉⵔ_ⴷⵓⵊⵏⴱⵉⵔ".split("_"),
	        weekdays : "ⴰⵙⴰⵎⴰⵙ_ⴰⵢⵏⴰⵙ_ⴰⵙⵉⵏⴰⵙ_ⴰⴽⵔⴰⵙ_ⴰⴽⵡⴰⵙ_ⴰⵙⵉⵎⵡⴰⵙ_ⴰⵙⵉⴹⵢⴰⵙ".split("_"),
	        weekdaysShort : "ⴰⵙⴰⵎⴰⵙ_ⴰⵢⵏⴰⵙ_ⴰⵙⵉⵏⴰⵙ_ⴰⴽⵔⴰⵙ_ⴰⴽⵡⴰⵙ_ⴰⵙⵉⵎⵡⴰⵙ_ⴰⵙⵉⴹⵢⴰⵙ".split("_"),
	        weekdaysMin : "ⴰⵙⴰⵎⴰⵙ_ⴰⵢⵏⴰⵙ_ⴰⵙⵉⵏⴰⵙ_ⴰⴽⵔⴰⵙ_ⴰⴽⵡⴰⵙ_ⴰⵙⵉⵎⵡⴰⵙ_ⴰⵙⵉⴹⵢⴰⵙ".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "dddd D MMMM YYYY LT"
	        },
	        calendar : {
	            sameDay: "[ⴰⵙⴷⵅ ⴴ] LT",
	            nextDay: '[ⴰⵙⴽⴰ ⴴ] LT',
	            nextWeek: 'dddd [ⴴ] LT',
	            lastDay: '[ⴰⵚⴰⵏⵜ ⴴ] LT',
	            lastWeek: 'dddd [ⴴ] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : "ⴷⴰⴷⵅ ⵙ ⵢⴰⵏ %s",
	            past : "ⵢⴰⵏ %s",
	            s : "ⵉⵎⵉⴽ",
	            m : "ⵎⵉⵏⵓⴺ",
	            mm : "%d ⵎⵉⵏⵓⴺ",
	            h : "ⵙⴰⵄⴰ",
	            hh : "%d ⵜⴰⵙⵙⴰⵄⵉⵏ",
	            d : "ⴰⵙⵙ",
	            dd : "%d oⵙⵙⴰⵏ",
	            M : "ⴰⵢoⵓⵔ",
	            MM : "%d ⵉⵢⵢⵉⵔⵏ",
	            y : "ⴰⵙⴳⴰⵙ",
	            yy : "%d ⵉⵙⴳⴰⵙⵏ"
	        },
	        week : {
	            dow : 6, // Saturday is the first day of the week.
	            doy : 12  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 75 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : ukrainian (uk)
	// author : zemlanin : https://github.com/zemlanin
	// Author : Menelion Elensúle : https://github.com/Oire

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    function plural(word, num) {
	        var forms = word.split('_');
	        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
	    }

	    function relativeTimeWithPlural(number, withoutSuffix, key) {
	        var format = {
	            'mm': 'хвилина_хвилини_хвилин',
	            'hh': 'година_години_годин',
	            'dd': 'день_дні_днів',
	            'MM': 'місяць_місяці_місяців',
	            'yy': 'рік_роки_років'
	        };
	        if (key === 'm') {
	            return withoutSuffix ? 'хвилина' : 'хвилину';
	        }
	        else if (key === 'h') {
	            return withoutSuffix ? 'година' : 'годину';
	        }
	        else {
	            return number + ' ' + plural(format[key], +number);
	        }
	    }

	    function monthsCaseReplace(m, format) {
	        var months = {
	            'nominative': 'січень_лютий_березень_квітень_травень_червень_липень_серпень_вересень_жовтень_листопад_грудень'.split('_'),
	            'accusative': 'січня_лютого_березня_квітня_травня_червня_липня_серпня_вересня_жовтня_листопада_грудня'.split('_')
	        },

	        nounCase = (/D[oD]? *MMMM?/).test(format) ?
	            'accusative' :
	            'nominative';

	        return months[nounCase][m.month()];
	    }

	    function weekdaysCaseReplace(m, format) {
	        var weekdays = {
	            'nominative': 'неділя_понеділок_вівторок_середа_четвер_п’ятниця_субота'.split('_'),
	            'accusative': 'неділю_понеділок_вівторок_середу_четвер_п’ятницю_суботу'.split('_'),
	            'genitive': 'неділі_понеділка_вівторка_середи_четверга_п’ятниці_суботи'.split('_')
	        },

	        nounCase = (/(\[[ВвУу]\]) ?dddd/).test(format) ?
	            'accusative' :
	            ((/\[?(?:минулої|наступної)? ?\] ?dddd/).test(format) ?
	                'genitive' :
	                'nominative');

	        return weekdays[nounCase][m.day()];
	    }

	    function processHoursFunction(str) {
	        return function () {
	            return str + 'о' + (this.hours() === 11 ? 'б' : '') + '] LT';
	        };
	    }

	    return moment.lang('uk', {
	        months : monthsCaseReplace,
	        monthsShort : "січ_лют_бер_квіт_трав_черв_лип_серп_вер_жовт_лист_груд".split("_"),
	        weekdays : weekdaysCaseReplace,
	        weekdaysShort : "нд_пн_вт_ср_чт_пт_сб".split("_"),
	        weekdaysMin : "нд_пн_вт_ср_чт_пт_сб".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD.MM.YYYY",
	            LL : "D MMMM YYYY р.",
	            LLL : "D MMMM YYYY р., LT",
	            LLLL : "dddd, D MMMM YYYY р., LT"
	        },
	        calendar : {
	            sameDay: processHoursFunction('[Сьогодні '),
	            nextDay: processHoursFunction('[Завтра '),
	            lastDay: processHoursFunction('[Вчора '),
	            nextWeek: processHoursFunction('[У] dddd ['),
	            lastWeek: function () {
	                switch (this.day()) {
	                case 0:
	                case 3:
	                case 5:
	                case 6:
	                    return processHoursFunction('[Минулої] dddd [').call(this);
	                case 1:
	                case 2:
	                case 4:
	                    return processHoursFunction('[Минулого] dddd [').call(this);
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : "за %s",
	            past : "%s тому",
	            s : "декілька секунд",
	            m : relativeTimeWithPlural,
	            mm : relativeTimeWithPlural,
	            h : "годину",
	            hh : relativeTimeWithPlural,
	            d : "день",
	            dd : relativeTimeWithPlural,
	            M : "місяць",
	            MM : relativeTimeWithPlural,
	            y : "рік",
	            yy : relativeTimeWithPlural
	        },

	        // M. E.: those two are virtually unused but a user might want to implement them for his/her website for some reason

	        meridiem : function (hour, minute, isLower) {
	            if (hour < 4) {
	                return "ночі";
	            } else if (hour < 12) {
	                return "ранку";
	            } else if (hour < 17) {
	                return "дня";
	            } else {
	                return "вечора";
	            }
	        },

	        ordinal: function (number, period) {
	            switch (period) {
	            case 'M':
	            case 'd':
	            case 'DDD':
	            case 'w':
	            case 'W':
	                return number + '-й';
	            case 'D':
	                return number + '-го';
	            default:
	                return number;
	            }
	        },

	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 76 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : uzbek
	// author : Sardor Muminov : https://github.com/muminoff

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('uz', {
	        months : "январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь".split("_"),
	        monthsShort : "янв_фев_мар_апр_май_июн_июл_авг_сен_окт_ноя_дек".split("_"),
	        weekdays : "Якшанба_Душанба_Сешанба_Чоршанба_Пайшанба_Жума_Шанба".split("_"),
	        weekdaysShort : "Якш_Душ_Сеш_Чор_Пай_Жум_Шан".split("_"),
	        weekdaysMin : "Як_Ду_Се_Чо_Па_Жу_Ша".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM YYYY",
	            LLL : "D MMMM YYYY LT",
	            LLLL : "D MMMM YYYY, dddd LT"
	        },
	        calendar : {
	            sameDay : '[Бугун соат] LT [да]',
	            nextDay : '[Эртага] LT [да]',
	            nextWeek : 'dddd [куни соат] LT [да]',
	            lastDay : '[Кеча соат] LT [да]',
	            lastWeek : '[Утган] dddd [куни соат] LT [да]',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : "Якин %s ичида",
	            past : "Бир неча %s олдин",
	            s : "фурсат",
	            m : "бир дакика",
	            mm : "%d дакика",
	            h : "бир соат",
	            hh : "%d соат",
	            d : "бир кун",
	            dd : "%d кун",
	            M : "бир ой",
	            MM : "%d ой",
	            y : "бир йил",
	            yy : "%d йил"
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 77 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : vietnamese (vn)
	// author : Bang Nguyen : https://github.com/bangnk

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('vn', {
	        months : "tháng 1_tháng 2_tháng 3_tháng 4_tháng 5_tháng 6_tháng 7_tháng 8_tháng 9_tháng 10_tháng 11_tháng 12".split("_"),
	        monthsShort : "Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12".split("_"),
	        weekdays : "chủ nhật_thứ hai_thứ ba_thứ tư_thứ năm_thứ sáu_thứ bảy".split("_"),
	        weekdaysShort : "CN_T2_T3_T4_T5_T6_T7".split("_"),
	        weekdaysMin : "CN_T2_T3_T4_T5_T6_T7".split("_"),
	        longDateFormat : {
	            LT : "HH:mm",
	            L : "DD/MM/YYYY",
	            LL : "D MMMM [năm] YYYY",
	            LLL : "D MMMM [năm] YYYY LT",
	            LLLL : "dddd, D MMMM [năm] YYYY LT",
	            l : "DD/M/YYYY",
	            ll : "D MMM YYYY",
	            lll : "D MMM YYYY LT",
	            llll : "ddd, D MMM YYYY LT"
	        },
	        calendar : {
	            sameDay: "[Hôm nay lúc] LT",
	            nextDay: '[Ngày mai lúc] LT',
	            nextWeek: 'dddd [tuần tới lúc] LT',
	            lastDay: '[Hôm qua lúc] LT',
	            lastWeek: 'dddd [tuần rồi lúc] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : "%s tới",
	            past : "%s trước",
	            s : "vài giây",
	            m : "một phút",
	            mm : "%d phút",
	            h : "một giờ",
	            hh : "%d giờ",
	            d : "một ngày",
	            dd : "%d ngày",
	            M : "một tháng",
	            MM : "%d tháng",
	            y : "một năm",
	            yy : "%d năm"
	        },
	        ordinal : function (number) {
	            return number;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 78 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : chinese
	// author : suupic : https://github.com/suupic
	// author : Zeno Zeng : https://github.com/zenozeng

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('zh-cn', {
	        months : "一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),
	        monthsShort : "1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),
	        weekdays : "星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),
	        weekdaysShort : "周日_周一_周二_周三_周四_周五_周六".split("_"),
	        weekdaysMin : "日_一_二_三_四_五_六".split("_"),
	        longDateFormat : {
	            LT : "Ah点mm",
	            L : "YYYY-MM-DD",
	            LL : "YYYY年MMMD日",
	            LLL : "YYYY年MMMD日LT",
	            LLLL : "YYYY年MMMD日ddddLT",
	            l : "YYYY-MM-DD",
	            ll : "YYYY年MMMD日",
	            lll : "YYYY年MMMD日LT",
	            llll : "YYYY年MMMD日ddddLT"
	        },
	        meridiem : function (hour, minute, isLower) {
	            var hm = hour * 100 + minute;
	            if (hm < 600) {
	                return "凌晨";
	            } else if (hm < 900) {
	                return "早上";
	            } else if (hm < 1130) {
	                return "上午";
	            } else if (hm < 1230) {
	                return "中午";
	            } else if (hm < 1800) {
	                return "下午";
	            } else {
	                return "晚上";
	            }
	        },
	        calendar : {
	            sameDay : function () {
	                return this.minutes() === 0 ? "[今天]Ah[点整]" : "[今天]LT";
	            },
	            nextDay : function () {
	                return this.minutes() === 0 ? "[明天]Ah[点整]" : "[明天]LT";
	            },
	            lastDay : function () {
	                return this.minutes() === 0 ? "[昨天]Ah[点整]" : "[昨天]LT";
	            },
	            nextWeek : function () {
	                var startOfWeek, prefix;
	                startOfWeek = moment().startOf('week');
	                prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? '[下]' : '[本]';
	                return this.minutes() === 0 ? prefix + "dddAh点整" : prefix + "dddAh点mm";
	            },
	            lastWeek : function () {
	                var startOfWeek, prefix;
	                startOfWeek = moment().startOf('week');
	                prefix = this.unix() < startOfWeek.unix()  ? '[上]' : '[本]';
	                return this.minutes() === 0 ? prefix + "dddAh点整" : prefix + "dddAh点mm";
	            },
	            sameElse : 'LL'
	        },
	        ordinal : function (number, period) {
	            switch (period) {
	            case "d":
	            case "D":
	            case "DDD":
	                return number + "日";
	            case "M":
	                return number + "月";
	            case "w":
	            case "W":
	                return number + "周";
	            default:
	                return number;
	            }
	        },
	        relativeTime : {
	            future : "%s内",
	            past : "%s前",
	            s : "几秒",
	            m : "1分钟",
	            mm : "%d分钟",
	            h : "1小时",
	            hh : "%d小时",
	            d : "1天",
	            dd : "%d天",
	            M : "1个月",
	            MM : "%d个月",
	            y : "1年",
	            yy : "%d年"
	        },
	        week : {
	            // GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	}));


/***/ },
/* 79 */
/***/ function(module, exports, require) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// moment.js language configuration
	// language : traditional chinese (zh-tw)
	// author : Ben : https://github.com/ben-lin

	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [require(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (factory.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD
	    } else if (typeof exports === 'object') {
	        module.exports = factory(require('../moment')); // Node
	    } else {
	        factory(window.moment); // Browser global
	    }
	}(function (moment) {
	    return moment.lang('zh-tw', {
	        months : "一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),
	        monthsShort : "1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),
	        weekdays : "星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),
	        weekdaysShort : "週日_週一_週二_週三_週四_週五_週六".split("_"),
	        weekdaysMin : "日_一_二_三_四_五_六".split("_"),
	        longDateFormat : {
	            LT : "Ah點mm",
	            L : "YYYY年MMMD日",
	            LL : "YYYY年MMMD日",
	            LLL : "YYYY年MMMD日LT",
	            LLLL : "YYYY年MMMD日ddddLT",
	            l : "YYYY年MMMD日",
	            ll : "YYYY年MMMD日",
	            lll : "YYYY年MMMD日LT",
	            llll : "YYYY年MMMD日ddddLT"
	        },
	        meridiem : function (hour, minute, isLower) {
	            var hm = hour * 100 + minute;
	            if (hm < 900) {
	                return "早上";
	            } else if (hm < 1130) {
	                return "上午";
	            } else if (hm < 1230) {
	                return "中午";
	            } else if (hm < 1800) {
	                return "下午";
	            } else {
	                return "晚上";
	            }
	        },
	        calendar : {
	            sameDay : '[今天]LT',
	            nextDay : '[明天]LT',
	            nextWeek : '[下]ddddLT',
	            lastDay : '[昨天]LT',
	            lastWeek : '[上]ddddLT',
	            sameElse : 'L'
	        },
	        ordinal : function (number, period) {
	            switch (period) {
	            case "d" :
	            case "D" :
	            case "DDD" :
	                return number + "日";
	            case "M" :
	                return number + "月";
	            case "w" :
	            case "W" :
	                return number + "週";
	            default :
	                return number;
	            }
	        },
	        relativeTime : {
	            future : "%s內",
	            past : "%s前",
	            s : "幾秒",
	            m : "一分鐘",
	            mm : "%d分鐘",
	            h : "一小時",
	            hh : "%d小時",
	            d : "一天",
	            dd : "%d天",
	            M : "一個月",
	            MM : "%d個月",
	            y : "一年",
	            yy : "%d年"
	        }
	    });
	}));


/***/ },
/* 80 */
/***/ function(module, exports, require) {

	// underscore addon with sum, mean, median and nrange function
	// see details below

	_.mixin({
	  
	  // Return sum of the elements
	  sum : function(obj, iterator, context) {
	    if (!iterator && _.isEmpty(obj)) return 0;
	    var result = 0;
	    if (!iterator && _.isArray(obj)){
	      for(var i=obj.length-1;i>-1;i-=1){
	        result += obj[i];
	      };
	      return result;
	    };
	    each(obj, function(value, index, list) {
	      var computed = iterator ? iterator.call(context, value, index, list) : value;
	      result += computed;
	    });
	    return result;
	  },
	  
	  // Return aritmethic mean of the elements
	  // if an iterator function is given, it is applied before
	  mean : function(obj, iterator, context) {
	    if (!iterator && _.isEmpty(obj)) return Infinity;
	    if (!iterator && _.isArray(obj)) return _.sum(obj)/obj.length;
	    if (_.isArray(obj) && !_.isEmpty(obj)) return _.sum(obj, iterator, context)/obj.length;
	  },
	  
	  // Return median of the elements 
	  // if the object element number is odd the median is the 
	  // object in the "middle" of a sorted array
	  // in case of an even number, the arithmetic mean of the two elements
	  // in the middle (in case of characters or strings: obj[n/2-1] ) is returned.
	  // if an iterator function is provided, it is applied before
	  median : function(obj, iterator, context) {
	    if (_.isEmpty(obj)) return Infinity;
	    var tmpObj = [];
	    if (!iterator && _.isArray(obj)){
	      tmpObj = _.clone(obj);
	      tmpObj.sort(function(f,s){return f-s;});
	    }else{
	      _.isArray(obj) && each(obj, function(value, index, list) {
	        tmpObj.push(iterator ? iterator.call(context, value, index, list) : value);
	        tmpObj.sort();
	      });
	    };
	    return tmpObj.length%2 ? tmpObj[Math.floor(tmpObj.length/2)] : (_.isNumber(tmpObj[tmpObj.length/2-1]) && _.isNumber(tmpObj[tmpObj.length/2])) ? (tmpObj[tmpObj.length/2-1]+tmpObj[tmpObj.length/2]) /2 : tmpObj[tmpObj.length/2-1];
	  },
	  
	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  // replacement of old _.range() faster + incl. convenience operations: 
	  //    _.nrange(start, stop) will automatically set step to +1/-1 
	  //    _.nrange(+/- stop) will automatically start = 0 and set step to +1/-1
	  nrange : function(start, stop, step) {
	    if (arguments.length <= 1) {
	      if (start === 0)
	        return [];
	      stop = start || 0;
	      start = 0;
	    }
	    step = arguments[2] || 1*(start < stop) || -1;
	    
	    var len = Math.max(Math.ceil((stop - start) / step), 0);
	    var idx = 0;
	    var range = new Array(len);

	    do {
	      range[idx] = start;
	      start += step;
	    } while((idx += 1) < len);
	    
	    return range;
	  }

	})

/***/ },
/* 81 */
/***/ function(module, exports, require) {

	//     Underscore.js 1.4.4
	//     http://underscorejs.org
	//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
	//     Underscore may be freely distributed under the MIT license.

	(function() {

	  // Baseline setup
	  // --------------

	  // Establish the root object, `window` in the browser, or `global` on the server.
	  var root = this;

	  // Save the previous value of the `_` variable.
	  var previousUnderscore = root._;

	  // Establish the object that gets returned to break out of a loop iteration.
	  var breaker = {};

	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	  // Create quick reference variables for speed access to core prototypes.
	  var push             = ArrayProto.push,
	      slice            = ArrayProto.slice,
	      concat           = ArrayProto.concat,
	      toString         = ObjProto.toString,
	      hasOwnProperty   = ObjProto.hasOwnProperty;

	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var
	    nativeForEach      = ArrayProto.forEach,
	    nativeMap          = ArrayProto.map,
	    nativeReduce       = ArrayProto.reduce,
	    nativeReduceRight  = ArrayProto.reduceRight,
	    nativeFilter       = ArrayProto.filter,
	    nativeEvery        = ArrayProto.every,
	    nativeSome         = ArrayProto.some,
	    nativeIndexOf      = ArrayProto.indexOf,
	    nativeLastIndexOf  = ArrayProto.lastIndexOf,
	    nativeIsArray      = Array.isArray,
	    nativeKeys         = Object.keys,
	    nativeBind         = FuncProto.bind;

	  // Create a safe reference to the Underscore object for use below.
	  var _ = function(obj) {
	    if (obj instanceof _) return obj;
	    if (!(this instanceof _)) return new _(obj);
	    this._wrapped = obj;
	  };

	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for the old `require()` API. If we're in
	  // the browser, add `_` as a global object via a string identifier,
	  // for Closure Compiler "advanced" mode.
	  if (true) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }

	  // Current version.
	  _.VERSION = '1.4.4';

	  // Collection Functions
	  // --------------------

	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles objects with the built-in `forEach`, arrays, and raw objects.
	  // Delegates to **ECMAScript 5**'s native `forEach` if available.
	  var each = _.each = _.forEach = function(obj, iterator, context) {
	    if (obj == null) return;
	    if (nativeForEach && obj.forEach === nativeForEach) {
	      obj.forEach(iterator, context);
	    } else if (obj.length === +obj.length) {
	      for (var i = 0, l = obj.length; i < l; i++) {
	        if (iterator.call(context, obj[i], i, obj) === breaker) return;
	      }
	    } else {
	      for (var key in obj) {
	        if (_.has(obj, key)) {
	          if (iterator.call(context, obj[key], key, obj) === breaker) return;
	        }
	      }
	    }
	  };

	  // Return the results of applying the iterator to each element.
	  // Delegates to **ECMAScript 5**'s native `map` if available.
	  _.map = _.collect = function(obj, iterator, context) {
	    var results = [];
	    if (obj == null) return results;
	    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
	    each(obj, function(value, index, list) {
	      results[results.length] = iterator.call(context, value, index, list);
	    });
	    return results;
	  };

	  var reduceError = 'Reduce of empty array with no initial value';

	  // **Reduce** builds up a single result from a list of values, aka `inject`,
	  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
	  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
	    var initial = arguments.length > 2;
	    if (obj == null) obj = [];
	    if (nativeReduce && obj.reduce === nativeReduce) {
	      if (context) iterator = _.bind(iterator, context);
	      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
	    }
	    each(obj, function(value, index, list) {
	      if (!initial) {
	        memo = value;
	        initial = true;
	      } else {
	        memo = iterator.call(context, memo, value, index, list);
	      }
	    });
	    if (!initial) throw new TypeError(reduceError);
	    return memo;
	  };

	  // The right-associative version of reduce, also known as `foldr`.
	  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
	  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
	    var initial = arguments.length > 2;
	    if (obj == null) obj = [];
	    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
	      if (context) iterator = _.bind(iterator, context);
	      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
	    }
	    var length = obj.length;
	    if (length !== +length) {
	      var keys = _.keys(obj);
	      length = keys.length;
	    }
	    each(obj, function(value, index, list) {
	      index = keys ? keys[--length] : --length;
	      if (!initial) {
	        memo = obj[index];
	        initial = true;
	      } else {
	        memo = iterator.call(context, memo, obj[index], index, list);
	      }
	    });
	    if (!initial) throw new TypeError(reduceError);
	    return memo;
	  };

	  // Return the first value which passes a truth test. Aliased as `detect`.
	  _.find = _.detect = function(obj, iterator, context) {
	    var result;
	    any(obj, function(value, index, list) {
	      if (iterator.call(context, value, index, list)) {
	        result = value;
	        return true;
	      }
	    });
	    return result;
	  };

	  // Return all the elements that pass a truth test.
	  // Delegates to **ECMAScript 5**'s native `filter` if available.
	  // Aliased as `select`.
	  _.filter = _.select = function(obj, iterator, context) {
	    var results = [];
	    if (obj == null) return results;
	    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
	    each(obj, function(value, index, list) {
	      if (iterator.call(context, value, index, list)) results[results.length] = value;
	    });
	    return results;
	  };

	  // Return all the elements for which a truth test fails.
	  _.reject = function(obj, iterator, context) {
	    return _.filter(obj, function(value, index, list) {
	      return !iterator.call(context, value, index, list);
	    }, context);
	  };

	  // Determine whether all of the elements match a truth test.
	  // Delegates to **ECMAScript 5**'s native `every` if available.
	  // Aliased as `all`.
	  _.every = _.all = function(obj, iterator, context) {
	    iterator || (iterator = _.identity);
	    var result = true;
	    if (obj == null) return result;
	    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
	    each(obj, function(value, index, list) {
	      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
	    });
	    return !!result;
	  };

	  // Determine if at least one element in the object matches a truth test.
	  // Delegates to **ECMAScript 5**'s native `some` if available.
	  // Aliased as `any`.
	  var any = _.some = _.any = function(obj, iterator, context) {
	    iterator || (iterator = _.identity);
	    var result = false;
	    if (obj == null) return result;
	    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
	    each(obj, function(value, index, list) {
	      if (result || (result = iterator.call(context, value, index, list))) return breaker;
	    });
	    return !!result;
	  };

	  // Determine if the array or object contains a given value (using `===`).
	  // Aliased as `include`.
	  _.contains = _.include = function(obj, target) {
	    if (obj == null) return false;
	    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
	    return any(obj, function(value) {
	      return value === target;
	    });
	  };

	  // Invoke a method (with arguments) on every item in a collection.
	  _.invoke = function(obj, method) {
	    var args = slice.call(arguments, 2);
	    var isFunc = _.isFunction(method);
	    return _.map(obj, function(value) {
	      return (isFunc ? method : value[method]).apply(value, args);
	    });
	  };

	  // Convenience version of a common use case of `map`: fetching a property.
	  _.pluck = function(obj, key) {
	    return _.map(obj, function(value){ return value[key]; });
	  };

	  // Convenience version of a common use case of `filter`: selecting only objects
	  // containing specific `key:value` pairs.
	  _.where = function(obj, attrs, first) {
	    if (_.isEmpty(attrs)) return first ? null : [];
	    return _[first ? 'find' : 'filter'](obj, function(value) {
	      for (var key in attrs) {
	        if (attrs[key] !== value[key]) return false;
	      }
	      return true;
	    });
	  };

	  // Convenience version of a common use case of `find`: getting the first object
	  // containing specific `key:value` pairs.
	  _.findWhere = function(obj, attrs) {
	    return _.where(obj, attrs, true);
	  };

	  // Return the maximum element or (element-based computation).
	  // Can't optimize arrays of integers longer than 65,535 elements.
	  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
	  _.max = function(obj, iterator, context) {
	    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
	      return Math.max.apply(Math, obj);
	    }
	    if (!iterator && _.isEmpty(obj)) return -Infinity;
	    var result = {computed : -Infinity, value: -Infinity};
	    each(obj, function(value, index, list) {
	      var computed = iterator ? iterator.call(context, value, index, list) : value;
	      computed >= result.computed && (result = {value : value, computed : computed});
	    });
	    return result.value;
	  };

	  // Return the minimum element (or element-based computation).
	  _.min = function(obj, iterator, context) {
	    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
	      return Math.min.apply(Math, obj);
	    }
	    if (!iterator && _.isEmpty(obj)) return Infinity;
	    var result = {computed : Infinity, value: Infinity};
	    each(obj, function(value, index, list) {
	      var computed = iterator ? iterator.call(context, value, index, list) : value;
	      computed < result.computed && (result = {value : value, computed : computed});
	    });
	    return result.value;
	  };

	  // Shuffle an array.
	  _.shuffle = function(obj) {
	    var rand;
	    var index = 0;
	    var shuffled = [];
	    each(obj, function(value) {
	      rand = _.random(index++);
	      shuffled[index - 1] = shuffled[rand];
	      shuffled[rand] = value;
	    });
	    return shuffled;
	  };

	  // An internal function to generate lookup iterators.
	  var lookupIterator = function(value) {
	    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
	  };

	  // Sort the object's values by a criterion produced by an iterator.
	  _.sortBy = function(obj, value, context) {
	    var iterator = lookupIterator(value);
	    return _.pluck(_.map(obj, function(value, index, list) {
	      return {
	        value : value,
	        index : index,
	        criteria : iterator.call(context, value, index, list)
	      };
	    }).sort(function(left, right) {
	      var a = left.criteria;
	      var b = right.criteria;
	      if (a !== b) {
	        if (a > b || a === void 0) return 1;
	        if (a < b || b === void 0) return -1;
	      }
	      return left.index < right.index ? -1 : 1;
	    }), 'value');
	  };

	  // An internal function used for aggregate "group by" operations.
	  var group = function(obj, value, context, behavior) {
	    var result = {};
	    var iterator = lookupIterator(value || _.identity);
	    each(obj, function(value, index) {
	      var key = iterator.call(context, value, index, obj);
	      behavior(result, key, value);
	    });
	    return result;
	  };

	  // Groups the object's values by a criterion. Pass either a string attribute
	  // to group by, or a function that returns the criterion.
	  _.groupBy = function(obj, value, context) {
	    return group(obj, value, context, function(result, key, value) {
	      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
	    });
	  };

	  // Counts instances of an object that group by a certain criterion. Pass
	  // either a string attribute to count by, or a function that returns the
	  // criterion.
	  _.countBy = function(obj, value, context) {
	    return group(obj, value, context, function(result, key) {
	      if (!_.has(result, key)) result[key] = 0;
	      result[key]++;
	    });
	  };

	  // Use a comparator function to figure out the smallest index at which
	  // an object should be inserted so as to maintain order. Uses binary search.
	  _.sortedIndex = function(array, obj, iterator, context) {
	    iterator = iterator == null ? _.identity : lookupIterator(iterator);
	    var value = iterator.call(context, obj);
	    var low = 0, high = array.length;
	    while (low < high) {
	      var mid = (low + high) >>> 1;
	      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
	    }
	    return low;
	  };

	  // Safely convert anything iterable into a real, live array.
	  _.toArray = function(obj) {
	    if (!obj) return [];
	    if (_.isArray(obj)) return slice.call(obj);
	    if (obj.length === +obj.length) return _.map(obj, _.identity);
	    return _.values(obj);
	  };

	  // Return the number of elements in an object.
	  _.size = function(obj) {
	    if (obj == null) return 0;
	    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
	  };

	  // Array Functions
	  // ---------------

	  // Get the first element of an array. Passing **n** will return the first N
	  // values in the array. Aliased as `head` and `take`. The **guard** check
	  // allows it to work with `_.map`.
	  _.first = _.head = _.take = function(array, n, guard) {
	    if (array == null) return void 0;
	    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
	  };

	  // Returns everything but the last entry of the array. Especially useful on
	  // the arguments object. Passing **n** will return all the values in
	  // the array, excluding the last N. The **guard** check allows it to work with
	  // `_.map`.
	  _.initial = function(array, n, guard) {
	    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
	  };

	  // Get the last element of an array. Passing **n** will return the last N
	  // values in the array. The **guard** check allows it to work with `_.map`.
	  _.last = function(array, n, guard) {
	    if (array == null) return void 0;
	    if ((n != null) && !guard) {
	      return slice.call(array, Math.max(array.length - n, 0));
	    } else {
	      return array[array.length - 1];
	    }
	  };

	  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	  // Especially useful on the arguments object. Passing an **n** will return
	  // the rest N values in the array. The **guard**
	  // check allows it to work with `_.map`.
	  _.rest = _.tail = _.drop = function(array, n, guard) {
	    return slice.call(array, (n == null) || guard ? 1 : n);
	  };

	  // Trim out all falsy values from an array.
	  _.compact = function(array) {
	    return _.filter(array, _.identity);
	  };

	  // Internal implementation of a recursive `flatten` function.
	  var flatten = function(input, shallow, output) {
	    each(input, function(value) {
	      if (_.isArray(value)) {
	        shallow ? push.apply(output, value) : flatten(value, shallow, output);
	      } else {
	        output.push(value);
	      }
	    });
	    return output;
	  };

	  // Return a completely flattened version of an array.
	  _.flatten = function(array, shallow) {
	    return flatten(array, shallow, []);
	  };

	  // Return a version of the array that does not contain the specified value(s).
	  _.without = function(array) {
	    return _.difference(array, slice.call(arguments, 1));
	  };

	  // Produce a duplicate-free version of the array. If the array has already
	  // been sorted, you have the option of using a faster algorithm.
	  // Aliased as `unique`.
	  _.uniq = _.unique = function(array, isSorted, iterator, context) {
	    if (_.isFunction(isSorted)) {
	      context = iterator;
	      iterator = isSorted;
	      isSorted = false;
	    }
	    var initial = iterator ? _.map(array, iterator, context) : array;
	    var results = [];
	    var seen = [];
	    each(initial, function(value, index) {
	      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
	        seen.push(value);
	        results.push(array[index]);
	      }
	    });
	    return results;
	  };

	  // Produce an array that contains the union: each distinct element from all of
	  // the passed-in arrays.
	  _.union = function() {
	    return _.uniq(concat.apply(ArrayProto, arguments));
	  };

	  // Produce an array that contains every item shared between all the
	  // passed-in arrays.
	  _.intersection = function(array) {
	    var rest = slice.call(arguments, 1);
	    return _.filter(_.uniq(array), function(item) {
	      return _.every(rest, function(other) {
	        return _.indexOf(other, item) >= 0;
	      });
	    });
	  };

	  // Take the difference between one array and a number of other arrays.
	  // Only the elements present in just the first array will remain.
	  _.difference = function(array) {
	    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
	    return _.filter(array, function(value){ return !_.contains(rest, value); });
	  };

	  // Zip together multiple lists into a single array -- elements that share
	  // an index go together.
	  _.zip = function() {
	    var args = slice.call(arguments);
	    var length = _.max(_.pluck(args, 'length'));
	    var results = new Array(length);
	    for (var i = 0; i < length; i++) {
	      results[i] = _.pluck(args, "" + i);
	    }
	    return results;
	  };

	  // Converts lists into objects. Pass either a single array of `[key, value]`
	  // pairs, or two parallel arrays of the same length -- one of keys, and one of
	  // the corresponding values.
	  _.object = function(list, values) {
	    if (list == null) return {};
	    var result = {};
	    for (var i = 0, l = list.length; i < l; i++) {
	      if (values) {
	        result[list[i]] = values[i];
	      } else {
	        result[list[i][0]] = list[i][1];
	      }
	    }
	    return result;
	  };

	  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
	  // we need this function. Return the position of the first occurrence of an
	  // item in an array, or -1 if the item is not included in the array.
	  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
	  // If the array is large and already in sort order, pass `true`
	  // for **isSorted** to use binary search.
	  _.indexOf = function(array, item, isSorted) {
	    if (array == null) return -1;
	    var i = 0, l = array.length;
	    if (isSorted) {
	      if (typeof isSorted == 'number') {
	        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
	      } else {
	        i = _.sortedIndex(array, item);
	        return array[i] === item ? i : -1;
	      }
	    }
	    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
	    for (; i < l; i++) if (array[i] === item) return i;
	    return -1;
	  };

	  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
	  _.lastIndexOf = function(array, item, from) {
	    if (array == null) return -1;
	    var hasIndex = from != null;
	    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
	      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
	    }
	    var i = (hasIndex ? from : array.length);
	    while (i--) if (array[i] === item) return i;
	    return -1;
	  };

	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  _.range = function(start, stop, step) {
	    if (arguments.length <= 1) {
	      stop = start || 0;
	      start = 0;
	    }
	    step = arguments[2] || 1;

	    var len = Math.max(Math.ceil((stop - start) / step), 0);
	    var idx = 0;
	    var range = new Array(len);

	    while(idx < len) {
	      range[idx++] = start;
	      start += step;
	    }

	    return range;
	  };

	  // Function (ahem) Functions
	  // ------------------

	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = function(func, context) {
	    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
	    var args = slice.call(arguments, 2);
	    return function() {
	      return func.apply(context, args.concat(slice.call(arguments)));
	    };
	  };

	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context.
	  _.partial = function(func) {
	    var args = slice.call(arguments, 1);
	    return function() {
	      return func.apply(this, args.concat(slice.call(arguments)));
	    };
	  };

	  // Bind all of an object's methods to that object. Useful for ensuring that
	  // all callbacks defined on an object belong to it.
	  _.bindAll = function(obj) {
	    var funcs = slice.call(arguments, 1);
	    if (funcs.length === 0) funcs = _.functions(obj);
	    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
	    return obj;
	  };

	  // Memoize an expensive function by storing its results.
	  _.memoize = function(func, hasher) {
	    var memo = {};
	    hasher || (hasher = _.identity);
	    return function() {
	      var key = hasher.apply(this, arguments);
	      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
	    };
	  };

	  // Delays a function for the given number of milliseconds, and then calls
	  // it with the arguments supplied.
	  _.delay = function(func, wait) {
	    var args = slice.call(arguments, 2);
	    return setTimeout(function(){ return func.apply(null, args); }, wait);
	  };

	  // Defers a function, scheduling it to run after the current call stack has
	  // cleared.
	  _.defer = function(func) {
	    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
	  };

	  // Returns a function, that, when invoked, will only be triggered at most once
	  // during a given window of time.
	  _.throttle = function(func, wait) {
	    var context, args, timeout, result;
	    var previous = 0;
	    var later = function() {
	      previous = new Date;
	      timeout = null;
	      result = func.apply(context, args);
	    };
	    return function() {
	      var now = new Date;
	      var remaining = wait - (now - previous);
	      context = this;
	      args = arguments;
	      if (remaining <= 0) {
	        clearTimeout(timeout);
	        timeout = null;
	        previous = now;
	        result = func.apply(context, args);
	      } else if (!timeout) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };
	  };

	  // Returns a function, that, as long as it continues to be invoked, will not
	  // be triggered. The function will be called after it stops being called for
	  // N milliseconds. If `immediate` is passed, trigger the function on the
	  // leading edge, instead of the trailing.
	  _.debounce = function(func, wait, immediate) {
	    var timeout, result;
	    return function() {
	      var context = this, args = arguments;
	      var later = function() {
	        timeout = null;
	        if (!immediate) result = func.apply(context, args);
	      };
	      var callNow = immediate && !timeout;
	      clearTimeout(timeout);
	      timeout = setTimeout(later, wait);
	      if (callNow) result = func.apply(context, args);
	      return result;
	    };
	  };

	  // Returns a function that will be executed at most one time, no matter how
	  // often you call it. Useful for lazy initialization.
	  _.once = function(func) {
	    var ran = false, memo;
	    return function() {
	      if (ran) return memo;
	      ran = true;
	      memo = func.apply(this, arguments);
	      func = null;
	      return memo;
	    };
	  };

	  // Returns the first function passed as an argument to the second,
	  // allowing you to adjust arguments, run code before and after, and
	  // conditionally execute the original function.
	  _.wrap = function(func, wrapper) {
	    return function() {
	      var args = [func];
	      push.apply(args, arguments);
	      return wrapper.apply(this, args);
	    };
	  };

	  // Returns a function that is the composition of a list of functions, each
	  // consuming the return value of the function that follows.
	  _.compose = function() {
	    var funcs = arguments;
	    return function() {
	      var args = arguments;
	      for (var i = funcs.length - 1; i >= 0; i--) {
	        args = [funcs[i].apply(this, args)];
	      }
	      return args[0];
	    };
	  };

	  // Returns a function that will only be executed after being called N times.
	  _.after = function(times, func) {
	    if (times <= 0) return func();
	    return function() {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };

	  // Object Functions
	  // ----------------

	  // Retrieve the names of an object's properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`
	  _.keys = nativeKeys || function(obj) {
	    if (obj !== Object(obj)) throw new TypeError('Invalid object');
	    var keys = [];
	    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
	    return keys;
	  };

	  // Retrieve the values of an object's properties.
	  _.values = function(obj) {
	    var values = [];
	    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
	    return values;
	  };

	  // Convert an object into a list of `[key, value]` pairs.
	  _.pairs = function(obj) {
	    var pairs = [];
	    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
	    return pairs;
	  };

	  // Invert the keys and values of an object. The values must be serializable.
	  _.invert = function(obj) {
	    var result = {};
	    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
	    return result;
	  };

	  // Return a sorted list of the function names available on the object.
	  // Aliased as `methods`
	  _.functions = _.methods = function(obj) {
	    var names = [];
	    for (var key in obj) {
	      if (_.isFunction(obj[key])) names.push(key);
	    }
	    return names.sort();
	  };

	  // Extend a given object with all the properties in passed-in object(s).
	  _.extend = function(obj) {
	    each(slice.call(arguments, 1), function(source) {
	      if (source) {
	        for (var prop in source) {
	          obj[prop] = source[prop];
	        }
	      }
	    });
	    return obj;
	  };

	  // Return a copy of the object only containing the whitelisted properties.
	  _.pick = function(obj) {
	    var copy = {};
	    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
	    each(keys, function(key) {
	      if (key in obj) copy[key] = obj[key];
	    });
	    return copy;
	  };

	   // Return a copy of the object without the blacklisted properties.
	  _.omit = function(obj) {
	    var copy = {};
	    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
	    for (var key in obj) {
	      if (!_.contains(keys, key)) copy[key] = obj[key];
	    }
	    return copy;
	  };

	  // Fill in a given object with default properties.
	  _.defaults = function(obj) {
	    each(slice.call(arguments, 1), function(source) {
	      if (source) {
	        for (var prop in source) {
	          if (obj[prop] == null) obj[prop] = source[prop];
	        }
	      }
	    });
	    return obj;
	  };

	  // Create a (shallow-cloned) duplicate of an object.
	  _.clone = function(obj) {
	    if (!_.isObject(obj)) return obj;
	    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	  };

	  // Invokes interceptor with the obj, and then returns obj.
	  // The primary purpose of this method is to "tap into" a method chain, in
	  // order to perform operations on intermediate results within the chain.
	  _.tap = function(obj, interceptor) {
	    interceptor(obj);
	    return obj;
	  };

	  // Internal recursive comparison function for `isEqual`.
	  var eq = function(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
	    if (a === b) return a !== 0 || 1 / a == 1 / b;
	    // A strict comparison is necessary because `null == undefined`.
	    if (a == null || b == null) return a === b;
	    // Unwrap any wrapped objects.
	    if (a instanceof _) a = a._wrapped;
	    if (b instanceof _) b = b._wrapped;
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className != toString.call(b)) return false;
	    switch (className) {
	      // Strings, numbers, dates, and booleans are compared by value.
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return a == String(b);
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
	        // other numeric values.
	        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
	      case '[object Date]':
	      case '[object Boolean]':
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a == +b;
	      // RegExps are compared by their source patterns and flags.
	      case '[object RegExp]':
	        return a.source == b.source &&
	               a.global == b.global &&
	               a.multiline == b.multiline &&
	               a.ignoreCase == b.ignoreCase;
	    }
	    if (typeof a != 'object' || typeof b != 'object') return false;
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] == a) return bStack[length] == b;
	    }
	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);
	    var size = 0, result = true;
	    // Recursively compare objects and arrays.
	    if (className == '[object Array]') {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      size = a.length;
	      result = size == b.length;
	      if (result) {
	        // Deep compare the contents, ignoring non-numeric properties.
	        while (size--) {
	          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
	        }
	      }
	    } else {
	      // Objects with different constructors are not equivalent, but `Object`s
	      // from different frames are.
	      var aCtor = a.constructor, bCtor = b.constructor;
	      if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
	                               _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
	        return false;
	      }
	      // Deep compare objects.
	      for (var key in a) {
	        if (_.has(a, key)) {
	          // Count the expected number of properties.
	          size++;
	          // Deep compare each member.
	          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
	        }
	      }
	      // Ensure that both objects contain the same number of properties.
	      if (result) {
	        for (key in b) {
	          if (_.has(b, key) && !(size--)) break;
	        }
	        result = !size;
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return result;
	  };

	  // Perform a deep comparison to check if two objects are equal.
	  _.isEqual = function(a, b) {
	    return eq(a, b, [], []);
	  };

	  // Is a given array, string, or object empty?
	  // An "empty" object has no enumerable own-properties.
	  _.isEmpty = function(obj) {
	    if (obj == null) return true;
	    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
	    for (var key in obj) if (_.has(obj, key)) return false;
	    return true;
	  };

	  // Is a given value a DOM element?
	  _.isElement = function(obj) {
	    return !!(obj && obj.nodeType === 1);
	  };

	  // Is a given value an array?
	  // Delegates to ECMA5's native Array.isArray
	  _.isArray = nativeIsArray || function(obj) {
	    return toString.call(obj) == '[object Array]';
	  };

	  // Is a given variable an object?
	  _.isObject = function(obj) {
	    return obj === Object(obj);
	  };

	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
	  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
	    _['is' + name] = function(obj) {
	      return toString.call(obj) == '[object ' + name + ']';
	    };
	  });

	  // Define a fallback version of the method in browsers (ahem, IE), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function(obj) {
	      return !!(obj && _.has(obj, 'callee'));
	    };
	  }

	  // Optimize `isFunction` if appropriate.
	  if (true) {
	    _.isFunction = function(obj) {
	      return typeof obj === 'function';
	    };
	  }

	  // Is a given object a finite number?
	  _.isFinite = function(obj) {
	    return isFinite(obj) && !isNaN(parseFloat(obj));
	  };

	  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
	  _.isNaN = function(obj) {
	    return _.isNumber(obj) && obj != +obj;
	  };

	  // Is a given value a boolean?
	  _.isBoolean = function(obj) {
	    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
	  };

	  // Is a given value equal to null?
	  _.isNull = function(obj) {
	    return obj === null;
	  };

	  // Is a given variable undefined?
	  _.isUndefined = function(obj) {
	    return obj === void 0;
	  };

	  // Shortcut function for checking if an object has a given property directly
	  // on itself (in other words, not on a prototype).
	  _.has = function(obj, key) {
	    return hasOwnProperty.call(obj, key);
	  };

	  // Utility Functions
	  // -----------------

	  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	  // previous owner. Returns a reference to the Underscore object.
	  _.noConflict = function() {
	    root._ = previousUnderscore;
	    return this;
	  };

	  // Keep the identity function around for default iterators.
	  _.identity = function(value) {
	    return value;
	  };

	  // Run a function **n** times.
	  _.times = function(n, iterator, context) {
	    var accum = Array(n);
	    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
	    return accum;
	  };

	  // Return a random integer between min and max (inclusive).
	  _.random = function(min, max) {
	    if (max == null) {
	      max = min;
	      min = 0;
	    }
	    return min + Math.floor(Math.random() * (max - min + 1));
	  };

	  // List of HTML entities for escaping.
	  var entityMap = {
	    escape: {
	      '&': '&amp;',
	      '<': '&lt;',
	      '>': '&gt;',
	      '"': '&quot;',
	      "'": '&#x27;',
	      '/': '&#x2F;'
	    }
	  };
	  entityMap.unescape = _.invert(entityMap.escape);

	  // Regexes containing the keys and values listed immediately above.
	  var entityRegexes = {
	    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
	    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
	  };

	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  _.each(['escape', 'unescape'], function(method) {
	    _[method] = function(string) {
	      if (string == null) return '';
	      return ('' + string).replace(entityRegexes[method], function(match) {
	        return entityMap[method][match];
	      });
	    };
	  });

	  // If the value of the named property is a function then invoke it;
	  // otherwise, return it.
	  _.result = function(object, property) {
	    if (object == null) return null;
	    var value = object[property];
	    return _.isFunction(value) ? value.call(object) : value;
	  };

	  // Add your own custom functions to the Underscore object.
	  _.mixin = function(obj) {
	    each(_.functions(obj), function(name){
	      var func = _[name] = obj[name];
	      _.prototype[name] = function() {
	        var args = [this._wrapped];
	        push.apply(args, arguments);
	        return result.call(this, func.apply(_, args));
	      };
	    });
	  };

	  // Generate a unique integer id (unique within the entire client session).
	  // Useful for temporary DOM ids.
	  var idCounter = 0;
	  _.uniqueId = function(prefix) {
	    var id = ++idCounter + '';
	    return prefix ? prefix + id : id;
	  };

	  // By default, Underscore uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  _.templateSettings = {
	    evaluate    : /<%([\s\S]+?)%>/g,
	    interpolate : /<%=([\s\S]+?)%>/g,
	    escape      : /<%-([\s\S]+?)%>/g
	  };

	  // When customizing `templateSettings`, if you don't want to define an
	  // interpolation, evaluation or escaping regex, we need one that is
	  // guaranteed not to match.
	  var noMatch = /(.)^/;

	  // Certain characters need to be escaped so that they can be put into a
	  // string literal.
	  var escapes = {
	    "'":      "'",
	    '\\':     '\\',
	    '\r':     'r',
	    '\n':     'n',
	    '\t':     't',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  _.template = function(text, data, settings) {
	    var render;
	    settings = _.defaults({}, settings, _.templateSettings);

	    // Combine delimiters into one regular expression via alternation.
	    var matcher = new RegExp([
	      (settings.escape || noMatch).source,
	      (settings.interpolate || noMatch).source,
	      (settings.evaluate || noMatch).source
	    ].join('|') + '|$', 'g');

	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset)
	        .replace(escaper, function(match) { return '\\' + escapes[match]; });

	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      }
	      if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      }
	      if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }
	      index = offset + match.length;
	      return match;
	    });
	    source += "';\n";

	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

	    source = "var __t,__p='',__j=Array.prototype.join," +
	      "print=function(){__p+=__j.call(arguments,'');};\n" +
	      source + "return __p;\n";

	    try {
	      render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }

	    if (data) return render(data, _);
	    var template = function(data) {
	      return render.call(this, data, _);
	    };

	    // Provide the compiled function source as a convenience for precompilation.
	    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

	    return template;
	  };

	  // Add a "chain" function, which will delegate to the wrapper.
	  _.chain = function(obj) {
	    return _(obj).chain();
	  };

	  // OOP
	  // ---------------
	  // If Underscore is called as a function, it returns a wrapped object that
	  // can be used OO-style. This wrapper holds altered versions of all the
	  // underscore functions. Wrapped objects may be chained.

	  // Helper function to continue chaining intermediate results.
	  var result = function(obj) {
	    return this._chain ? _(obj).chain() : obj;
	  };

	  // Add all of the Underscore functions to the wrapper object.
	  _.mixin(_);

	  // Add all mutator Array functions to the wrapper.
	  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
	      return result.call(this, obj);
	    };
	  });

	  // Add all accessor Array functions to the wrapper.
	  each(['concat', 'join', 'slice'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      return result.call(this, method.apply(this._wrapped, arguments));
	    };
	  });

	  _.extend(_.prototype, {

	    // Start chaining a wrapped Underscore object.
	    chain: function() {
	      this._chain = true;
	      return this;
	    },

	    // Extracts the result from a wrapped and chained object.
	    value: function() {
	      return this._wrapped;
	    }

	  });

	}).call(this);


/***/ },
/* 82 */
/***/ function(module, exports, require) {

	'use strict()';
	if (true) 
	    _ = require(81); // otherwise assume it was included by html file

	_.mixin({
	/* ## _.unchain(obj, magicPowers)
	_enhance arrays and other objects with Underscore methods so you don't need 
	to mess with _.chain() and .value() every time you do two Underscore methods in sequence._

	    @param {Object} obj The Object to be enhanced, usually an array.
	    @param {Object} [magicPowers]
	    @param {String[]} [magicPowers.include] Defaults to all the Underscore functions.
	        Use an empty array if you don't want any Underscore functions.
	    @param {String[]} [magicPowers.exclude] any Underscore functions you don't want.
	    @param {Object} [magicPowers.more] map of any other methodNames and functions you'd like thrown in.
	    @param {Object} [magicPowers.plainPrimitives=false] if true, don't turn primitive data types into Objects for enhancement.
	    @param {Object} [magicPowers.cloneFrozenVals=false] if true and return vals are unextensible, clone them for enhancement.
	    @return {Object} enhanced with methods which all return similarly enhanced results
	    @example ```
	_.unchain(['a','bb','ccc'])
	     .pluck('length')
	     .last()
	     .range()
	=> [0, 1, 2]

	_.unchain(['a','bb','ccc'],{plainPrimitives:true})
	     .pluck('length')
	     .last()
	     .range()
	=> TypeError: Object 3 has no method 'range'
	```
	    */
	    unchain: function(obj, magicPowers) {
	        var map = {};
	        var plainPrimitives = magicPowers && magicPowers.plainPrimitives;
	        var cloneFrozenVals = magicPowers && magicPowers.cloneFrozenVals;
	        var unames = magicPowers && magicPowers.include || 
	            Object.getOwnPropertyNames(_)
	                .filter(function(d) { return _.isFunction(_[d]) });
	        _(unames).each(function(underscoreFuncName) {
	            map[underscoreFuncName] = _[underscoreFuncName];
	        });
	        if (magicPowers && magicPowers.more)
	            _.extend(map, magicPowers.more);
	        return enhance(obj, map, plainPrimitives, cloneFrozenVals);
	    },
	/*
	## _.prometheus(obj, magicPowers)
	_Defy the gods and bring the full power of Underscore to *ALL* your Arrays, Objects, or whatever.
	Also works with constructors of user-defined classes. Use at your own risk._
	    @example ```
	_.prometheus(Array);
	['a','bb','ccc'].pluck('length').last().range()
	=> [0, 1, 2]
	```

	 */
	    prometheus: function(obj, magicPowers) {
	        return _.unchain(obj.prototype, magicPowers);
	    },
	    round: Math.round,
	    mapScalar: function(scalar, func) {
	        return func(scalar);
	    }
	});

	function enhance(obj, funcsAndNames, plainPrimitives, cloneFrozenVals) {
	    try {
	        _.chain(funcsAndNames).pairs().each(function(pair) {
	            var methodName = pair[0], func = pair[1];
	            if (obj.hasOwnProperty(methodName)) return;
	            Object.defineProperty(obj, methodName, {
	                value: function() {
	                    try {
	                        var result = func.apply(_, [this].concat(_.toArray(arguments)));
	                    } catch(e) {
	                        console.log("failed to apply " + methodName);
	                        console.log(e.stack);
	                        throw e;
	                    }
	                    if (result instanceof Object && result.constructor === obj.constructor) { // if result is same type as obj, just keep obj's methods
	                        _.chain(Object.getOwnPropertyNames(obj))
	                            .filter(function(d) { return typeof(obj[d]) === "function"})
	                            .each(function(p) {
	                                Object.defineProperty(result, p, {
	                                    value: obj[p]
	                                });
	                            });
	                        return result;
	                    }
	                    if (result instanceof Object)
	                        return enhance(result, funcsAndNames, plainPrimitives, cloneFrozenVals);
	                    if (plainPrimitives)
	                        return result;
	                    return enhance(new Object(result), funcsAndNames, plainPrimitives, cloneFrozenVals);
	                }
	            });
	        });
	    }
	    catch(e) {
	        if (e.message.substr(-25) === "object is not extensible." && cloneFrozenVals) {
	            obj = _.clone(obj);
	            enhance(obj, funcsAndNames, plainPrimitives, cloneFrozenVals);
	        } else {
	            console.log(e.stack);
	        }
	    }
	    finally {
	        return obj;
	    }
	}
	if (true) {   // not sure if this is all right
	    if (typeof module !== 'undefined' && module.exports) {
	        module.exports = _;
	    }
	    exports._ = _;
	} else if (typeof define === 'function' && define.amd) {
	    // Register as a named module with AMD.
	    define('_', [], function() {
	        return nester;
	    });
	}


/***/ }
/******/ ])