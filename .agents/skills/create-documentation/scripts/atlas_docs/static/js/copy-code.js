function initializeCopyCodeButtons() {
  document.querySelectorAll("pre").forEach(pre => {
    if (pre.querySelector(".copy-code-button")) return;
    const code = pre.querySelector("code");
    if (!code) return;

    if (!pre.dataset.lang) {
      const lang = [...code.classList].find(name => name.startsWith("language-"));
      if (lang) pre.dataset.lang = lang.replace("language-", "");
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "copy-code-button";
    button.textContent = "copy";
    button.addEventListener("click", async event => {
      event.preventDefault();
      event.stopPropagation();
      await navigator.clipboard.writeText(code.textContent.replace(/\n$/, ""));
      button.classList.add("copied");
      button.textContent = "copied!";
      window.setTimeout(() => {
        button.classList.remove("copied");
        button.textContent = "copy";
      }, 1200);
    });
    pre.appendChild(button);
  });
}
