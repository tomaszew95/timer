(function() {
    "use strict";
    require.config({
        paths: {
            CerosSDK: '//sdk.ceros.com/standalone-player-sdk-v5.min'
        }
    });
    require(['CerosSDK'], function (CerosSDK) {
        CerosSDK.findExperience()
            .done(function(experience) { 
                let animatedNumbers = experience.findComponentsByTag("timer");

                animatedNumbers.on(CerosSDK.EVENTS.ANIMATION_STARTED, (component) => {
                    let textObject = document.getElementById(component.id);
                    let keyframes = textObject.getAnimations()[0].effect.getKeyframes();
                    let animDuration = parseFloat(textObject.style.getPropertyValue("animation-duration")[0]);
                    let animDelay;
                    if(keyframes.length >1){
                        animDelay = (animDuration*keyframes[1].offset);
                    }
                    console.log(parseFloat(getComputedStyle(textObject).animationDuration), getComputedStyle(textObject).animationDuration[0]);

                    let tags = component.getTags();
                    let timerDur;
                    let timerDuration = [];
                    let extraText = "", endText = "";
                    let easingTime = "swing";
                    let clock = false;
                    let fraction = 1;
                    let n = null;

                    _.forEach(tags, function(value, key){
                        if(value.indexOf("time:") > -1){
                            timerDur = value.slice(5, value.length);
                            timerDuration = timerDur.split(",");
                        }
                        if(value.indexOf("extra-text:") > -1){
                            extraText = value.slice(11, value.length);
                        }
                        if(value.indexOf("end-text:") > -1){
                            endText = value.slice(9, value.length);
                        }
                        if(value.indexOf("clock") > -1){
                            clock = true;
                        }
                        if(value.indexOf("fraction:") > -1){
                            n = parseInt(value.slice(9, value.length))
                            fraction = 10**n;
                        }
                    })

                    //check if clock may require changing 'easing'
                    if(clock==true){
                        if((timerDuration[0]/1000) == timerDuration[1] || (timerDuration[0]/1000) == timerDuration[2]){
                            easingTime = "linear";
                        }
                    }
                    //check if 'timerDuration' has at least 3 elements in Array 
                    if(timerDuration.length < 3){
                        console.warn("'time' tag is incomplete");
                        return;
                    }
                    //set initial number to count from
                    component.setText(timerDuration[1]);

                    //counter
                    $({ countNum: component.getText() }).delay(animDelay).animate(
                        {
                            countNum: parseInt(timerDuration[2])
                        },
                        {
                            duration: parseInt(timerDuration[0]),
                            easing: easingTime,
                            step: function() {
                                let numbers = Math.round(this.countNum);
                                let nums = ((numbers/fraction).toFixed(n)).toString();
                                if(clock === true){
                                    nums = clockk(numbers, nums);
                                }
                                component.setText(nums + extraText);
                                if(numbers == parseInt(timerDuration[2]) && endText != ""){
                                    component.setText(nums + endText);
                                }
                            },
                            complete: function() {
                                let numbers = this.countNum;
                                let nums = ((numbers/fraction).toFixed(n)).toString();
                                if(clock === true){
                                    nums = clockk(numbers, nums);
                                }
                                if(endText != ""){
                                    component.setText(nums + endText);
                                }
                                else if(extraText != ""){
                                    component.setText(nums + extraText);
                                }
                                else{
                                    component.setText(nums);
                                }
                            }
                        }
                    );
                });
            })
    });
})();
var clockk = (number,num) => {
    let sec = (number % 60);
    if(sec < 10){
        sec = "0" + (number % 60);
    }
    num = (Math.floor(number/60) + " " + sec).toString();
    return num;
}
