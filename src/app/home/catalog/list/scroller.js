import {LoggerFactory} from "darch/src/utils";

let Logger = new LoggerFactory("scroller", {level: "debug"});

export default class Scroller {
    constructor({
        onLoad=()=>{},
        direction="bottom",
        offset=100
    }) {
        this.onLoad = onLoad;
        this.direction = direction;
        this.offset = offset;
        this.count = 0;

        this.body = document.getElementsByTagName("body")[0];

        // Call bootstrap onLoad
        this.load();

        window.addEventListener("scroll", this.handleScroll);
    }

    destroy() {
        window.removeEventListener("scroll", this.handleScroll);
    }

    async load() {
        this.loading = true;
        await Promise.resolve(this.onLoad(++this.count));
        this.loading = false;
    }

    async handleScroll() {
        let logger = Logger.create("handleScroll");
        var doc = document.documentElement;

        let windowHeight = window.innerHeight || doc.clientHeight;
        let bodyHeight = this.body.clientHeight;
        let scrollTop = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
        let scrollBottom = scrollTop + windowHeight;
        let edgeY = bodyHeight - this.offset;

        logger.debug("enter", {windowHeight,bodyHeight,scrollBottom});

        // Check if we cross edgeY from top to bottom.
        if(!this.loading
        && this.lastScrollBottom
        && this.lastScrollBottom <= edgeY
        && scrollBottom > edgeY) {
            logger.debug("crossed the edge");
            this.load();
        }

        this.lastScrollBottom = scrollBottom;
    }
}