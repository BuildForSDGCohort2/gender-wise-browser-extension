const launchGW = (elements = []) => {
  const api = string =>
    new Promise((resolve, reject) => {
      fetch(`https://gender-wise.herokuapp.com/api/v1/words/word/${string}`)
        .then(word => word.json())
        .then(word => {
          if (word.genderwise) resolve(word.genderwise);
        })
        .catch(console.log);
    });
  const registerBox = (textarea, regex) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("gw-container");
    const container = document.createElement("div");
    container.classList.add("gw-dialogue", "gw-hidden");
    const trigger = document.createElement("p");
    trigger.classList.add("gw-trigger");
    trigger.innerHTML = "G";
    const list = document.createElement("ul");
    list.classList.add("gw-content");
    container.append(trigger, list);
    textarea.replaceWith(wrapper);
    wrapper.append(container, textarea);
    const ignoreList = [];
    const populateIgnore = string => ignoreList.push(string);
    const replaceString = async string => {
      const res = await api(string.toLowerCase());
      if (res) {
        const reg = new RegExp(string, "gi");
        if (textarea.value) {
          textarea.value = textarea.value.replace(reg, res);
        } else {
          textarea.innerText = textarea.innerText.replace(reg, res);
        }
        doCheck(textarea.value || textarea.innerText);
      }
    };
    const populateUl = arr => {
      list.innerHTML = "";
      arr.forEach(string => {
        const li = document.createElement("li");
        const offender = document.createElement("div");
        offender.innerHTML = string;
        const actions = document.createElement("div");
        const replace = document.createElement("p");
        replace.innerHTML = "Replace";
        const ignore = document.createElement("p");
        ignore.innerHTML = "Ignore";
        ignore.addEventListener("click", () => {
          populateIgnore(string);
          doCheck(textarea.value || textarea.innerText);
        });
        replace.addEventListener("click", () => {
          replaceString(string);
        });
        actions.append(replace);
        actions.append(ignore);
        li.append(offender);
        li.append(actions);
        list.append(li);
      });
    };
    const doCheck = value => {
      let matches = value.match(regex);
      matches =
        matches &&
        matches.filter(
          (elem, i) =>
            ignoreList.indexOf(elem) === -1 && matches.indexOf(elem) === i
        );
      if (matches && matches.length > 0) {
        trigger.innerHTML = matches.length;
        container.classList.add("gw-corrupted");
        populateUl(matches);
      } else {
        trigger.innerHTML = "G";
        container.classList.add("gw-hidden");
        container.classList.remove("gw-corrupted");
        populateUl([]);
      }
    };

    trigger.addEventListener("click", function(e) {
      if (!(textarea.value || textarea.innerText).match(regex)) {
        return;
      }
      container.classList.toggle("gw-hidden");
    });
    textarea.addEventListener("input", function(e) {
      const value = e.target.value || e.target.innerText;
      doCheck(value);
    });
  };

  fetch("https://gender-wise.herokuapp.com/api/v1/regex")
    .then(res => res.json())
    .then(regex => {
      regex = regex.data.replace(/\\/g, "\\\\");
      if (!regex) return;
      Array.prototype.forEach.call(
        document.querySelectorAll("textarea"),
        textarea => {
          if (!elements.find(e => e === textarea)) {
            elements.push(textarea);
            registerBox(textarea, new RegExp(regex, "gi"));
          }
        }
      );
      Array.prototype.forEach.call(
        document.querySelectorAll("div[contenteditable=true]"),
        textarea => {
          if (!elements.find(e => e === textarea)) {
            elements.push(textarea);
            registerBox(textarea, new RegExp(regex, "gi"));
          }
        }
      );
    })
    .catch(console.log);
  setTimeout(launchGW, 3000, elements);
};
window.addEventListener("load", () => {
  launchGW([]);
  const style = document.createElement("style");
  style.textContent = `
    .gw-container {
      position: relative !important;
      width: fit-content !important;
    }
    .gw-dialogue {
      position: absolute !important;
      right: 5px !important;
      bottom: 5px !important;
      padding: 5px !important;
      z-index: 9999999999999999999999999999999 !important;
    }
    .gw-dialogue div p {
      cursor: pointer  !important;
      display: inline-block !important;
      padding: 5px 8px !important;
      background: blue !important;
      margin-right: .5rem !important;
      border-radius: 5px !important;
    }
    .gw-trigger {
      width: 30px !important;
      position: relative !important;
      height: 30px !important;
      border-radius: 50% !important;
      border: none !important;
      background: blue !important;
      outline: none !important !important;
      color: #fff !important;
      padding: 2px;
      line-height: 1rem;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }
    .gw-content {
      position: absolute !important;
      width: 300px !important;
      background: blue !important;
      color: #fff !important;
      list-style: none !important;
      border-radius: 10px !important;
      padding: 1rem 0.5rem !important;
      margin: 0 !important;
      top: 100% !important;
    }

    .gw-corrupted .gw-content {
      background: red !important;
    }
    .gw-hidden .gw-content {
      display: none !important;
    }
    .gw-corrupted .gw-trigger {
      background: red !important;
    }
    .gw-corrupted.gw-hidden .gw-trigger::after {
      content: "" !important;
      width: 0;
      height: 0;
      border: 1px solid red !important;
      position: absolute !important;
      border-radius: 50% !important;
      left: 50% !important;
      top: 50% !important;
      transform: translate(-50%, -50%) !important;
      animation: waves 2s infinite ease-in-out !important;
    }
    @keyframes waves {
      0% {
        width: 20px;
        height: 20px;
        opacity: 1;
      }
      50% {
        width: 100px;
        height: 100px;
        opacity: 0;
      }
      100% {
        width: 100px;
        height: 100px;
        opacity: 0;
      }
    }
  `;
  document.head.append(style);
});
