```js
let mobileScrollLocked = false;
let lockedScrollY = 0;

function pageNeedsScrolling() {
  const isMobile = window.matchMedia("(max-width: 480px)").matches;

  if (!isMobile) {
    return false;
  }

  const viewportHeight = window.visualViewport
    ? window.visualViewport.height
    : window.innerHeight;

  const documentHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight
  );

  return documentHeight > viewportHeight + 2;
}

function updateMobileScrolling() {
  const shouldLock = !pageNeedsScrolling();

  if (shouldLock && !mobileScrollLocked) {
    lockedScrollY = window.scrollY;

    document.documentElement.classList.add("mobile-no-scroll");
    document.body.classList.add("mobile-no-scroll");

    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    window.scrollTo(0, 0);

    mobileScrollLocked = true;
  }

  if (!shouldLock && mobileScrollLocked) {
    document.documentElement.classList.remove("mobile-no-scroll");
    document.body.classList.remove("mobile-no-scroll");

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";

    window.scrollTo(0, lockedScrollY);

    mobileScrollLocked = false;
  }
}

function preventMobileScroll(event) {
  if (!mobileScrollLocked) {
    return;
  }

  if (event.cancelable) {
    event.preventDefault();
  }
}

function preventMobileGesture(event) {
  if (mobileScrollLocked && event.cancelable) {
    event.preventDefault();
  }
}

/* INITIAL CHECK */
window.addEventListener("load", updateMobileScrolling);

/* VIEWPORT CHANGES */
window.addEventListener("resize", updateMobileScrolling);
window.addEventListener("orientationchange", updateMobileScrolling);

if (window.visualViewport) {
  window.visualViewport.addEventListener(
    "resize",
    updateMobileScrolling
  );
}

/* WATCH FOR CONTENT CHANGES */
const observer = new MutationObserver(() => {
  updateMobileScrolling();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

/* BLOCK IOS TOUCH SCROLLING */
window.addEventListener("touchmove", preventMobileScroll, {
  passive: false,
  capture: true
});

document.addEventListener("touchmove", preventMobileScroll, {
  passive: false,
  capture: true
});

document.body.addEventListener("touchmove", preventMobileScroll, {
  passive: false,
  capture: true
});

/* BLOCK IOS GESTURE EVENTS */
document.addEventListener("gesturestart", preventMobileGesture, {
  passive: false
});

document.addEventListener("gesturechange", preventMobileGesture, {
  passive: false
});

document.addEventListener("gestureend", preventMobileGesture, {
  passive: false
});
```
