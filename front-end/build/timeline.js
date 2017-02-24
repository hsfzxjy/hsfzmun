define(['timeline-config', 'jquery', 'util/common'], function (_timelineConfig) {
    'use strict';

    var _timelineConfig2 = _interopRequireDefault(_timelineConfig);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var startReal = new Date(_timelineConfig2.default.start_real).valueOf(),
        startFake = new Date(_timelineConfig2.default.start_fake);

    var periods = _timelineConfig2.default.periods.map(function (item) {
        item.duration *= 1000;
        return item;
    });

    function getFakeTime() {
        var duration = new Date().valueOf() - startReal,
            fakeDuration = 0;

        if (duration < 0) return 'not-start';

        for (var i = 0, period; duration > 0 && i < periods.length; ++i) {
            period = periods[i];
            if (duration >= period.duration) {
                duration -= period.duration;
                fakeDuration += period.duration * period.speed;
            } else {
                fakeDuration += duration * period.speed;
                duration = 0;
            }
        }

        return duration > 0 ? 'end' : new Date(startFake.getTime() + fakeDuration);
    }

    var $timeDisplay = $('.timeline');
    var timer = void 0,
        lastTime = 'not-start';

    function formatDate(date) {
        return date.toISOString().split('.')[0].replace('T', ' ');
    }

    function timerCallback() {
        var fakeTime = getFakeTime();

        switch (fakeTime) {
            case 'not-start':
                break;
            case 'end':
                $timeDisplay.fadeOut(1000);
                clearInterval(timer);
                break;
            default:
                if (lastTime === 'not-start') $timeDisplay.fadeIn();
                $timeDisplay.find('span').html(formatDate(fakeTime));
        }

        lastTime = fakeTime;
    }

    //timer = setInterval(timerCallback, 100)

    // Animation

    $timeDisplay.click(function () {
        $timeDisplay.find('span').animate({
            width: 'toggle'
        }, {
            duration: 'slow',
            complete: function complete() {
                return $timeDisplay.find('i').toggleIcon();
            }
        });
    });
});
//# sourceMappingURL=__maps__/timeline.js.map
