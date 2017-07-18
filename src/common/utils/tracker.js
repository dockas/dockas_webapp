/* globals woopra */

export default class Tracker {
    static track(evt, data) {
        woopra.track(evt, data)
    }

    static pageview() {
        woopra.track("pv", {
            url: window.location.pathname,
            title: document.title
        })
    }

    static identify(user) {
        woopra.identify({
            email: user.email,
            name: user.fullName
        })

        woopra.track()
    }
}