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
                var animatedNumbers = experience.findComponentsByTag("timer");
                var animatedNumLayers = animatedNumbers.layers;
                let source = {'allow-timer-animation':true};

                var layerShownCallback = (component) => {
                    let animatedNumLayer = document.getElementById(component.id);
                    // source = {'allow-timer-animation':true};
                    animatedNumLayer.setAttribute('allow-timer-animation', 'false');
                    console.log(component.getAttribute('allow-timer-animation'));
                }
                var layerHiddenCallback = (component) => {
                    let animatedNumLayer = document.getElementById(component.id);
                    // source = {'allow-timer-animation':false};
                    animatedNumLayer.setAttribute('allow-timer-animation', 'true');
                }

                for(let i = 0; i<animatedNumLayers.length;i++){
                    animatedNumLayers[i].on(CerosSDK.EVENTS.SHOWN, layerShownCallback);
                    animatedNumLayers[i].on(CerosSDK.EVENTS.HIDDEN, layerHiddenCallback);
                }

                var animationStartedCallback = (component) => {
                    let textObject = document.getElementById(component.id);
                    if(textObject.getAttribute('allow-timer-animation') ==null){
                        textObject.setAttribute('allow-timer-animation', 'true');
                    }
                    console.log(component,textObject.getAttribute('allow-timer-animation'));
                
                    if(textObject.getAttribute('allow-timer-animation')==true){
                        //checking and setting delay
                        let keyframes = textObject.getAnimations()[0].effect.getKeyframes();
                        let animDuration = parseFloat(getComputedStyle(textObject).animationDuration);
                        let animDelay;
                        if(keyframes.length >1){
                            animDelay = (animDuration*1000*keyframes[1].offset);
                        }
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
                    }
                }

                animatedNumbers.on(CerosSDK.EVENTS.ANIMATION_STARTED, animationStartedCallback);
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
