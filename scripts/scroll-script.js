```js
let mobileScrollLocked = false;
let lockedScrollY = 0;

function updateMobileScrolling() {
  const isMobile = window.matchMedia("(max-width: 480px)").matches;

  const viewportHeight = window.visualViewport
    ? window.visualViewport.height
    : window.innerHeight;

  const documentHeight = document.documentElement.scrollHeight;

  const needsScroll = documentHeight > viewportHeight + 1;
  const shouldLock = isMobile && !needsScroll;

  if (shouldLock && !mobileScrollLocked) {
    lockedScrollY = window.scrollY;

    document.documentElement.classList.add("mobile-no-scroll");
    document.body.classList.add("mobile-no-scroll");

    document.body.style.top = `-${lockedScrollY}px`;

    mobileScrollLocked = true;
  }

  if (!shouldLock && mobileScrollLocked) {
    document.documentElement.classList.remove("mobile-no-scroll");
    document.body.classList.remove("mobile-no-scroll");

    document.body.style.top = "";

    window.scrollTo(0, lockedScrollY);

    mobileScrollLocked = false;
  }
}

function preventMobileScroll(event) {
  if (mobileScrollLocked) {
    event.preventDefault();
  }
}

window.addEventListener("load", updateMobileScrolling);
window.addEventListener("resize", updateMobileScrolling);

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", updateMobileScrolling);
}

const observer = new MutationObserver(() => {
  updateMobileScrolling();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

document.addEventListener("touchmove", preventMobileScroll, {
  passive: false
});
```
