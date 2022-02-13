import Debug from './debug';

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

// eslint-disable-next-line camelcase, no-undef
GM_config.init({
    id: 'BigCommerce Auto Grabber',
    title: 'Script Settings',
    fields: {
        Debug: {
            label: 'Enable debugging',
            type: 'checkbox',
            default: false,
        },
    },
});

let pullButton: HTMLElement | null = null;
let autoGrabRunning = false;
let observer: MutationObserver | null = null;

// Notification element
const autoGrabNote = document.createElement('div');
autoGrabNote.innerHTML = `Auto Grab Running. CTRL + C to quit`;
autoGrabNote.style.position = 'fixed';
autoGrabNote.style.top = `${5 * 16}px`;
autoGrabNote.style.right = `${2 * 16}px`;
autoGrabNote.style.backgroundColor = 'rgb(34, 34, 34)';
autoGrabNote.style.color = 'rgb(255, 255, 255)';
autoGrabNote.style.padding = `${1 * 16}px ${2 * 16}px`;
autoGrabNote.style.zIndex = '1';

// Add shortcut to disable auto grabber
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'c' && autoGrabRunning) {
        Debug.log('Disable auto grab');

        // Use CTRL + C to turn off auto grab
        autoGrabRunning = false;
        document.body.removeChild(autoGrabNote);
    } else if (e.ctrlKey && e.key === ',') {
        // eslint-disable-next-line camelcase, no-undef
        GM_config.open();
    }
});

async function findSubmitButton() {
    // Check for button each X seconds until Vue.js has updated the DOM
    if (autoGrabRunning) {
        // Use if instead of while. "while" gets stuck
        await delay(250);
        Debug.log('Finding submit button ...');
        const submitModal = document.querySelector('.check_order');
        // If submit is triggered too early it's disabled (sent but cannot continue)
        if (
            submitModal &&
            window.getComputedStyle(submitModal).display === 'block'
        ) {
            const submitButton = submitModal.querySelector<HTMLElement>(
                '.btns .btn.submit:not(.disabled)'
            );
            if (submitButton === null) {
                await findSubmitButton();
            } else {
                // Click submit after X seconds of the modal appearing
                await delay(250);
                Debug.log('Found submit button');
                Debug.log(submitButton);
                submitButton.click();

                await delay(5000);
                // Observer seems to be automatically removed so re-add for next grab
                Debug.log('Connecting Observer ...');
                observer!.observe(
                    document.querySelector('.animation_layout')!,
                    {
                        attributes: true, // configure it to listen to attribute changes
                    }
                );

                // Find submit for next grab
                await findSubmitButton();
            }
        } else {
            await findSubmitButton();
        }
    }
}

function addGrabClickEvent(el: Element) {
    Debug.log(el);

    // Check for product image update to initiate next grab
    observer = new MutationObserver((mutations) => {
        (async () => {
            for await (const mutation of mutations) {
                Debug.log('Product image changed to:');
                Debug.log(mutation.target);
                if (
                    autoGrabRunning &&
                    mutation.type === 'attributes' &&
                    !(mutation.target as HTMLElement)
                        .getAttribute('imgurl')!
                        .startsWith('/img/sucai_lihe')
                ) {
                    // Use a delay or grab doesn't get triggered
                    Debug.log('Click on grab and disconnecting ...');
                    observer!.disconnect();

                    await delay(250);
                    pullButton!.click();
                }
            }
        })().catch((e) => {
            Debug.error(e);
        });
    });
    Debug.log('Connecting Observer ...');
    observer.observe(document.querySelector('.animation_layout')!, {
        attributes: true, // configure it to listen to attribute changes
    });

    // Start Auto Grabber by clicking "Automatic grab"
    el.addEventListener(
        'click',
        () => {
            (async () => {
                Debug.log('Start auto puller ...');
                autoGrabRunning = true;

                // Notify aubout auto grabber running
                document.body.appendChild(autoGrabNote);

                // Wait 5 seconds for animation to end
                // TODO: Get rid of animation instead
                await delay(5000);
                await findSubmitButton();
            })().catch((e) => {
                Debug.error(e);
            });
        },
        { once: true }
    );
}

async function findGrabButton() {
    // Check for button each X seconds until Vue.js has updated the DOM
    await delay(250);

    pullButton = document.querySelector('.grab_content .btns .bg-blue');
    if (pullButton === null) {
        await findGrabButton();
    } else {
        Debug.log('Found button:');
        addGrabClickEvent(pullButton);
    }
}

// https://stackoverflow.com/questions/6390341/how-to-detect-if-url-has-changed-after-hash-in-javascript
window.history.pushState = ((f) =>
    function pushState(...args) {
        const ret = f(...args);
        window.dispatchEvent(new Event('pushstate'));
        window.dispatchEvent(new Event('locationchange'));
        return ret;
        // eslint-disable-next-line @typescript-eslint/unbound-method
    })(window.history.pushState);

window.history.replaceState = ((f) =>
    function replaceState(...args) {
        const ret = f(...args);
        window.dispatchEvent(new Event('replacestate'));
        window.dispatchEvent(new Event('locationchange'));
        return ret;
        // eslint-disable-next-line @typescript-eslint/unbound-method
    })(window.history.replaceState);

window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'));
});
// END

// Initialize auto grabber if we are on the right page
async function checkUrlAndBind() {
    // Puts hash in variable, and removes the # character
    const hash = window.location.hash.substring(1);
    if (hash.startsWith('/grab')) {
        // Initialize once we are on /grab
        Debug.log('Switched to/Already on /grab. Finding button ...');
        await findGrabButton();
    } else {
        pullButton = null;
    }
}

(async () => {
    await checkUrlAndBind();
})().catch((e) => {
    Debug.error(e);
});
window.addEventListener('locationchange', () => {
    (async () => {
        await checkUrlAndBind();
    })().catch((e) => {
        Debug.error(e);
    });
});
