(function () {
    "use strict";
    require.config({
        paths: {
            CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v5.min",
        },
    });
    require(["CerosSDK"], function (CerosSDK) {
        CerosSDK.findExperience()
            .fail(function (error) {
                console.error(error);
            })
            .done(function (experience) {
                let animatedNumbers = experience.findComponentsByTag("timer");

                const animationToggleCallback = (anim, bool) => document.getElementById(anim.id).setAttribute("allow-timer-animation", bool);
                animatedNumbers.on(CerosSDK.EVENTS.SHOWN, function (animated) {
                    animationToggleCallback(animated, "no");
                });
                animatedNumbers.on(CerosSDK.EVENTS.HIDDEN, function (animated) {
                    animationToggleCallback(animated, "yes");
                });

                const animationStartedCallback = (a) => {
                    let textBox = document.getElementById(a.id);
                    if (textBox.getAttribute("allow-timer-animation") == null) textBox.setAttribute("allow-timer-animation", "yes");

                    if (textBox.getAttribute("allow-timer-animation") == "yes") {
                        // checking and setting delay
                        let keyframes = textBox.getAnimations()[0].effect.getKeyframes();
                        let animDuration = parseFloat(getComputedStyle(textBox).animationDuration);
                        let animDelay = keyframes.length > 2 ? animDuration * 1000 * keyframes[1].offset : 0;

                        // checking for specific tags
                        let tags = a.getTags();
                        let arr = [];
                        class TagToObject {
                            constructor(name, value) {
                                this.name = `${name}:`;
                                this.value = value;
                                arr.push(this);
                            }
                        }
                        let time = new TagToObject("time", null);
                        let extraText = new TagToObject("extra-text", "");
                        let endText = new TagToObject("end-text", "");
                        let fraction = new TagToObject("fraction", 0);
                        let colon = new TagToObject("colon", ":");
                        // ---
                        for (let tag of tags) {
                            for (let ar of arr) {
                                if (tag.includes(ar.name)) ar.value = tag.slice(ar.name.length, tag.length);
                            }
                        }
                        let timer = time.value.split(",");
                        timer = timer.map((t) => parseInt(t, 10));
                        let fra = parseInt(fraction.value, 10);
                        let clock = tags.includes("clock");
                        let col = colon.value.replaceAll("%20", " ");
                        let easingTime = "swing";

                        // checking if "timer" has at least 3 values
                        if (timer.length < 3) {
                            console.warn("'time' tag is incomplete");
                            return;
                        }

                        // checking if clock may require changing type of easing
                        if (clock) {
                            let duration = parseInt(timer[0] / 1000, 10);
                            if (duration == timer[1] || duration == timer[2]) easingTime = "linear";
                        }

                        // setting initial number to count from
                        let txt = textBox.querySelector("span") ?? textBox.querySelector("p");
                        txt.innerText = timer[1];

                        // counter
                        const getNumber = (countNum) => {
                            let num = (countNum / 10 ** fra).toFixed(fra);
                            num = num.toString();
                            if (clock) num = clockFunction(countNum, num, col);
                            txt.innerText = num + extraText.value;
                            return num;
                        };
                        $({ countNumber: timer[1] })
                            .delay(animDelay)
                            .animate(
                                {
                                    countNumber: timer[2],
                                },
                                {
                                    duration: timer[0],
                                    easing: easingTime,
                                    step: function () {
                                        let number = getNumber(this.countNumber);
                                        if (this.countNumber == timer[2] && endText.value != "") txt.innerText = number + endText.value;
                                    },
                                    complete: function () {
                                        let number = getNumber(this.countNumber);
                                        if (endText.value != "") txt.innerText = number + endText.value;
                                    },
                                }
                            );
                    }
                };
                animatedNumbers.on(CerosSDK.EVENTS.ANIMATION_STARTED, animationStartedCallback);
            });
    });
})();
const conversionFactor = (rest) => (rest < 10 ? `0${rest}` : rest);
const clockFunction = (count, n, c) => {
    let secs = conversionFactor(Math.floor(count % 60));
    let mins = conversionFactor(Math.floor(count / 60));
    n = (mins + c + secs).toString();
    return n;
};
