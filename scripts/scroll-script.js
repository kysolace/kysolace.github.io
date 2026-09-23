```js
function updateMobileScrolling() {
  const isMobile = window.matchMedia("(max-width: 480px)").matches;

  const viewportHeight = window.visualViewport
    ? window.visualViewport.height
    : window.innerHeight;

  const documentHeight = document.documentElement.scrollHeight;

  const needsScroll = documentHeight > viewportHeight + 1;

  const noScroll = isMobile && !needsScroll;

  document.documentElement.classList.toggle(
    "mobile-no-scroll",
    noScroll
  );

  document.body.classList.toggle(
    "mobile-no-scroll",
    noScroll
  );

  if (noScroll) {
    window.scrollTo(0, 0);
  }
}

function preventMobileScroll(event) {
  if (
    document.documentElement.classList.contains("mobile-no-scroll") ||
    document.body.classList.contains("mobile-no-scroll")
  ) {
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
