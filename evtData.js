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
    function Evt(raw, id) {
        _.extend(this, raw);
        this.eId = id;
        this._moment = toDate(this[startDateProp]);
        this._entityId = this[entityIdProp];
        this._eventName = this[eventNameProp];
    }
    Evt.prototype.id = function() {
        fail('fix ref to _startDate');
        return [this._entityId, this._eventName, this._startDate].join('/');
    }
    Evt.prototype.dt = 
    Evt.prototype.startDate = function() {
        return this._moment;
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
        var dur = duration(this.startDate() - 
                this.timeline().startDate());
        return dur.report(unit);
    };
    Evt.prototype.timeTo = function(otherEvt, unit) {
        return duration(otherEvt.dt() - this.dt()).report(unit);
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
    Timeline.prototype.startDate = function() {
        return this.records[0].startDate();
    };
    Timeline.prototype.endDate = function() {
        return this.records[this.records.length - 1].startDate();
    };
    Timeline.prototype.duration = function(unit) {
        return duration(this.endDate() - this.startDate());
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
        return timelines;
    }
    Timelines.prototype.maxDuration = function (unit, recalc) {
        if (typeof this._maxDuration === "undefined" || recalc)
            this._maxDuration = this.invoke('duration').max();
        return this._maxDuration.report(unit);
    }
    Timelines.prototype.wholeSetDuration = function (unit, recalc) {
        if (typeof this._setDuration === "undefined" || recalc)
            this._setDuration = duration(
                this.invoke('startDate').max() -
                this.invoke('endDate').min());
        return this._setDuration.report(unit);
    };
    Timelines.prototype.universeUnit = function (recalc) {
        if (typeof this._universeUnit === "undefined" || recalc)
            this._universeUnit = edata.durationUnits(
                    this.wholeSetDuration(recalc));
        return this._universeUnit;
    };
    Timelines.prototype.timelineUnit = function (recalc) {
        if (typeof this._timelineUnit === "undefined" || recalc)
            this._timelineUnit = edata.durationUnits(
                    this.maxDuration(recalc));
        return this._timelineUnit;
    };
    Evt.prototype.unit = function(unit) {
        return this.timeline().unit(unit);
    };
    Timeline.prototype.unit = function(unit) {
        return this.timelines().unit(unit);
    };
    Timelines.prototype.unit = function(unit) {
        if (unit === "universe")
            return this.universeUnit();
        if (unit === "timeline")
            return this.timelineUnit();
        if (typeof unit === "string")
            return unit;
        return this.unitSettings().unit;
    };
    Timelines.prototype.unitSettings = function (opts) {
        if (!arguments.length) return this._unitSettings;
        this._unitSettingsStack.push(_.clone(this._unitSettings));
         _.extend(this._unitSettings, opts);
        return this;
    };
    Timelines.prototype.unitSettingsRestore = function () {
        return this._unitSettingsStack.pop() || edata.unitSettings();
    };
    Evt.prototype.report = function(unit) {
        return this.timeline().report(unit);
    };
    Timeline.prototype.report = function(unit) {
        return this.timelines().report(unit);
    };
    // @method report
    // report durations according to current settings
    // @param {number} num the duration to express in certain units
    // @param {string} [unit=default unitSettings.unit, ms unless specified earlier], one of: universe, timeline, year, month, day, hour, minute, second, ms
    // @param {boolean} [justNumber] return the number as opposed to the whole moment.duration.humanize string
    // @return {string or number}
    Timelines.prototype.report = function(num, unit, justNumber, round) {
        var dur = duration(num);
        var u = this.unit(unit);
        var res = round ? Math.round(dur.as(u)) : dur.as(u);
        if (justNumber)
            return res;
        var ustr = (u === 'ms') ? 'milisecond' : u;
        if (res !== 1)
            ustr = ustr + 's';
        return res + ' ' + ustr;
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
    function duration(num) {
        return moment.duration(num);
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
        var unit = duration(dur).humanize();
        moment.lang(lang);
        return unit;
    };
    edata.Evt = Evt;
    edata.Timeline = Timeline;
    edata.Timelines = Timelines;
    edata.makeTimelines = makeTimelines;
    return edata;
}
