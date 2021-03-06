// ==UserScript==
// @name         BigCommerce Auto Puller
// @namespace    https://github.com/D3strukt0r/
// @version      0.1
// @description  Automaticall trigger all pulls
// @author       D3strukt0r
// @include      /^https?://(www\.)?bcm[0-9]{5}\.com/
// @icon         https://icons.duckduckgo.com/ip2/bcm78789.com.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // https://stackoverflow.com/questions/6390341/how-to-detect-if-url-has-changed-after-hash-in-javascript
    history.pushState = (f => function pushState(){
        var ret = f.apply(this, arguments);
        window.dispatchEvent(new Event('pushstate'));
        window.dispatchEvent(new Event('locationchange'));
        return ret;
    })(history.pushState);

    history.replaceState = (f => function replaceState(){
        var ret = f.apply(this, arguments);
        window.dispatchEvent(new Event('replacestate'));
        window.dispatchEvent(new Event('locationchange'));
        return ret;
    })(history.replaceState);

    window.addEventListener('popstate',()=>{
        window.dispatchEvent(new Event('locationchange'))
    });
    // END

    // https://stackoverflow.com/questions/39538473/using-settimeout-on-promise-chain
    function delay(t, v) {
        return new Promise(function(resolve) {
            setTimeout(resolve.bind(null, v), t)
        });
    }
    // END

    // https://stackoverflow.com/questions/36532307/rem-px-in-javascript
    function convertRemToPixels(rem) {
        return rem * 16;
    }
    // END

    let pullButton = null;
    let autoGrabRunning = false;
    let observer = null;

    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'c' && autoGrabRunning) {
            console.log('Disable auto grab');

            // Use CTRL + C to turn off auto grab
            autoGrabRunning = false;
            document.body.removeChild(autoGrabNote);
        }
    });

    const autoGrabNote = document.createElement('div');
    autoGrabNote.innerHTML = `Auto Grab Running. CTRL + C to quit`;
    autoGrabNote.style.position = 'fixed';
    autoGrabNote.style.top = `${convertRemToPixels(5)}px`;
    autoGrabNote.style.right = `${convertRemToPixels(2)}px`;
    autoGrabNote.style.backgroundColor = 'rgb(34, 34, 34)';
    autoGrabNote.style.color = 'rgb(255, 255, 255)';
    autoGrabNote.style.padding = `${convertRemToPixels(1)}px ${convertRemToPixels(2)}px`;
    autoGrabNote.style.zIndex = 1;

    if (window.location.hash.substring(1).startsWith('/grab')) {
        console.log('Already on /grab. Finding button ...');
        findGrabButton();
    }
    window.addEventListener('locationchange', function(){
        // Puts hash in variable, and removes the # character
        const hash = window.location.hash.substring(1);
        if (hash.startsWith('/grab')) {
            // Initialize once we are on /grab
            console.log('Switched to /grab. Finding button ...');
            findGrabButton();
        } else {
            pullButton = null;
        }
    });
    function findGrabButton() {
        // Check for button each X seconds until Vue.js has updated the DOM
        delay(250).then(() => {
            pullButton = document.querySelector('.grab_content .btns .bg-blue');
            if (pullButton === null) {
                findGrabButton();
            } else {
                console.log('Found button:');
                addGrabClickEvent(pullButton);
            }
        });
    }
    function addGrabClickEvent(el) {
        console.log(el);

        // Check for product image update to initiate next grab
        observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                console.log('Product image changed to:')
                console.log(mutation.target)
                if (
                    autoGrabRunning
                    && mutation.type === 'attributes'
                    && !mutation.target.getAttribute('imgurl').startsWith('/img/sucai_lihe')
                ) {
                    // Use a delay or grab doesn't get triggered
                    console.log('Click on grab and disconnecting ...');
                    observer.disconnect();

                    delay(250).then(() => {
                        pullButton.click();
                    });
                }
            });
        });
        console.log('Connecting Observer ...');
        observer.observe(document.querySelector('.animation_layout'), {
            attributes: true, // configure it to listen to attribute changes
        });

        // Start Auto Grabber by clicking "Automatic grab"
        el.addEventListener('click', (e) => {
            console.log('Start auto puller ...')
            autoGrabRunning = true;

            // Notify aubout auto grabber running
            document.body.appendChild(autoGrabNote);

            // Wait 5 seconds for animation to end
            // TODO: Get rid of animation instead
            delay(5000).then(() => {
                findSubmitButton();
            });
        }, { once: true });
    }
    function findSubmitButton() {
        // Check for button each X seconds until Vue.js has updated the DOM
        if (autoGrabRunning) { // Use if instead of while. "while" gets stuck
            delay(250).then(() => {
                console.log('Finding submit button ...')
                const submitModal = document.querySelector('.check_order');
                // If submit is triggered too early it's disabled (sent but cannot continue)
                if (submitModal && window.getComputedStyle(submitModal).display === 'block') {
                    const submitButton = submitModal.querySelector('.btns .btn.submit:not(.disabled)');
                    if (submitButton === null) {
                        findSubmitButton();
                    } else {
                        // Click submit after X seconds of the modal appearing
                        delay(250).then(() => {
                            console.log('Found submit button');
                            console.log(submitButton);
                            submitButton.click();

                            delay(5000).then(() => {
                                // Observer seems to be automatically removed so re-add for next grab
                                console.log('Connecting Observer ...');
                                observer.observe(document.querySelector('.animation_layout'), {
                                    attributes: true, // configure it to listen to attribute changes
                                });

                                // Find submit for next grab
                                findSubmitButton();
                            });
                        });
                    }
                } else {
                    findSubmitButton();
                }
            });
        }
    }
})();
