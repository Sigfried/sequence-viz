/**
 * ## evtData
 * ###Sigfried Gold <sigfried@sigfried.org>
 * [MIT license](http://sigfried.mit-license.org/)
 */

'use strict';
if (typeof(require) !== "undefined") { // make it work in node or browsers or other contexts
    moment = require('moment.js'); // otherwise assume it was included by html file
}
var evtData = function() {
    /** @namespace evtData */
    // public
    var   entityIdProp
        , eventNameProp
        , startDateProp
        , timeUnit = 'ms'
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
            var cmp = a.startDate() - b.startDate();
            if (cmp === 0) {
                if (eventOrder) {
                    cmp = eventOrder.indexOf(a.eventName())
                        - eventOrder.indexOf(b.eventName())
                }
            }
            return cmp;
        })
    }
    function Timeline(tl) {
    }
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
    Timeline.prototype.startDate = function() {
        return this.records[0].startDate();
    };
    Timeline.prototype.endDate = function() {
        return this.records[this.records.length - 1].startDate();
    };
    Timeline.prototype.duration = function(unit) {
        return moment.duration(this.endDate().moment - this.moment);
    };
    function Evt(raw, id) {
        _.extend(this, raw);
        this.eId = id;
        this.moment = toDate(this[startDateProp]);
        this._entityId = this[entityIdProp];
        this._eventName = this[eventNameProp];
    }
    Evt.prototype.id = function() {
        fail('fix ref to _startDate');
        return [this._entityId, this._eventName, this._startDate].join('/');
    }
    Evt.prototype.dt = 
    Evt.prototype.startDate = function() {
        return this.moment;
        //return this._startDate;
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
        return this.hasNext() ? this.timeTo(this.next(), unit) : ifNoNext;
    };
    Evt.prototype.fromPrev = function(ifNoPrev, unit) {
        return this.hasPrev() ? this.prev().timeTo(this, unit) : ifNoPrev;
    };
    Evt.prototype.startIdx = function(unit) {
        var dur = moment.duration(this.startDate() - 
                this.timeline().startDate());
        return dur.as(unit || timeUnit);
    };
    Evt.prototype.timeTo = function(otherEvt, unit) {
        return moment.duration(otherEvt.dt() - this.dt()).as(unit || timeUnit);
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
    function Timelines() {
    }
    Timelines.prototype.maxDuration = function () {
        return _.max(this.map(function(d) {
                    return moment.duration(
                        d.records.last().moment - 
                        d.records.first().moment);
                }));
    }
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
    var makeTimelines = function(data) { // have some old code using this
        var evts = _(data).map(function(d,i) { return new Evt(d,i); });
        var timelines = _.supergroup(evts, entityIdProp);
        timelines = timelines
            .map(function(d,i) { 
                return makeTimeline(d);
            });
        timelines._evtData = evts;
        _.extend(timelines, new Timelines);
        return timelines;
    }
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
    edata.timeUnit = function (_) {
        if (!arguments.length) return timeUnit;
        timeUnit = _;
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
    edata.Evt = Evt;
    edata.Timeline = Timeline;
    edata.makeTimelines = makeTimelines;
    return edata;
}
