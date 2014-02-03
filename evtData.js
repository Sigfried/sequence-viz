/**
 * ## evtData
 * ###Sigfried Gold <sigfried@sigfried.org>
 * [MIT license](http://sigfried.mit-license.org/)
 */

'use strict';
if (typeof(require) !== "undefined") {
    var _ = require('supergroup');
    var moment = require('moment');
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
