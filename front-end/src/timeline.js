import config from 'timeline-config'
import 'jquery'
import 'util/common'

const startReal = new Date(config.start_real).valueOf(), startFake = new Date(config.start_fake)

const periods = config.periods.map(item => {
    item.duration *= 1000
    return item
})

function getFakeTime () {
    let duration = ((new Date()).valueOf() - startReal), fakeDuration = 0

    if (duration < 0) return 'not-start'

    for (let i = 0, period; duration > 0 && i < periods.length; ++i) {
        period = periods[i]
        if (duration >= period.duration) {
            duration -= period.duration
            fakeDuration += period.duration * period.speed
        } else {
            fakeDuration += duration * period.speed
            duration = 0
        }
    }

    return (duration > 0) ? 'end' : new Date(startFake.getTime() + fakeDuration)
}

const $timeDisplay = $('.timeline')
let timer, lastTime = 'not-start'

function formatDate (date) {
    return date.toISOString().split('.')[0].replace('T', ' ')
}

function timerCallback () {
    let fakeTime = getFakeTime()

    switch (fakeTime) {
        case 'not-start':
            break
        case 'end':
            $timeDisplay.fadeOut(1000)
            clearInterval(timer)
            break
        default:
            if (lastTime === 'not-start') $timeDisplay.fadeIn()
            $timeDisplay.find('span').html(formatDate(fakeTime))
    }

    lastTime = fakeTime
}

timer = setInterval(timerCallback, 100)

// Animation

$timeDisplay.click(() => {
    $timeDisplay.find('span').animate({
        width: 'toggle'
    }, {
        duration: 'slow',
        complete: (() => $timeDisplay.find('i').toggleIcon())
    })
})
