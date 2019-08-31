// ==UserScript==
// @name         translate-json
// @namespace    https://github.com/tarkant
// @version      1.0
// @description  Translate JSON files directley in the page without messing up your JSON's structure.
// @licence      https://creativecommons.org/licenses/by-nc/2.0/
// @author       tarkant
// @match        https://translate.google.com/
// @include      /(www\.deepl\.com(\/.+){0,1}(\/translator).*)/
// @grant        none
// @updateURL   https://github.com/tarkant/translate-json/raw/master/translate-json.user.js
// @downloadURL https://github.com/tarkant/translate-json/raw/master/translate-json.user.js
// ==/UserScript==

(function() {
  "use strict";
  /**
   * Websites consts containing the input/output and container useful for the code injection
   */
  const GOOGL = {
    site: `googl`,
    content: `.homepage-content-wrap`,
    input: `.tlid-source-text-input`,
    output: `.result-shield-container`
  };

  const DPL = {
    site: `dpl`,
    content: `#dl_translator`,
    input: `[dl-test="translator-source-input"]`,
    output: `[dl-test="translator-target-input"]`
  };

  let currentSite;

  function detectSite() {
    if (window.location.href.indexOf(`google.com`) > -1) {
      currentSite = GOOGL;
    } else {
      currentSite = DPL;
    }
  }
  detectSite();

  function createJSONInputOutputContainer() {
    var container = document.querySelector(currentSite.content);
    var div = document.createElement("div");
    div.setAttribute("class", "trj-container");
    div.innerHTML = `
        <div class="trj-txtareas-wrapper">
            <div class="trj-txtarea trj-txtarea-input">
                <label>Input JSON:</label>
                <textarea class="trj-input"></textarea>
            </div>
            <div class="trj-txtarea trj-txtarea-output">
                <label>Output JSON:</label>
                <textarea class="trj-output"></textarea>
            </div>
            <div class="trj-controls">
                <button class="trj-button">Translate JSON</button>
                <progress value="0" max="100"></progress>
            </div>
        </div>
        <div class="trj-options">
            <label>Delay interval:</label>
            <input type="number" step="100" class="trj-dly-input" value="2000">
        </div>`;
    container.prepend(div);
    container
      .querySelector(".trj-button")
      .addEventListener("click", startTranslation);
  }
  createJSONInputOutputContainer();

  function startTranslation() {
    const progress = document.querySelector(".trj-controls progress");
    const translateBtn = document.querySelector(".trj-button");
    const inputInterval = document.querySelector(".trj-dly-input").value;
    let delay = 2000;
    if (!isNaN(Number.parseInt(inputInterval))) {
      delay = Number.parseInt(inputInterval);
    }
    progress.classList.add("display");
    translateBtn.setAttribute("disabled", "disabled");

    function inputInField(value) {
      var inputField = document.querySelector(currentSite.input);
      inputField.value = value;
      inputField.dispatchEvent(
        new Event("input", {
          bubbles: true,
          cancelable: true
        })
      );
    }

    function getOutputField() {
      if (currentSite.site === "dpl") {
        var outputField = document.querySelector(currentSite.output);
        return outputField.value;
      }
      var outputField = document.querySelector(currentSite.output);
      return outputField.innerText;
    }

    /**
     * Flatten a JSON recursively to get a namespace followed by the text to translate
     * https://www.freecodecamp.org/forum/t/possible-to-iterate-through-a-json-object-and-return-values-of-each-property/133649/3
     * @param {*} obj the parsed JSON
     * @param {*} indent the separator for the namespace
     */
    let flatJSON = [];
    let outputFlatJSON = [];

    function extractJSON(obj, indent) {
      for (const i in obj) {
        if (Array.isArray(obj[i]) || typeof obj[i] === "object") {
          extractJSON(obj[i], indent + i + ".");
        } else {
          flatJSON.push({
            key: indent + i,
            value: obj[i]
          });
        }
      }
    }

    try {
      let x = JSON.parse(document.querySelector(".trj-input").value);
      extractJSON(x, "");

      let index = 0;
      progress.value = 0;
      let interval = setInterval(() => {
        if (flatJSON.length > index) {
          inputInField(flatJSON[index].value);
          setTimeout(() => {
            outputFlatJSON[index] = {
              key: flatJSON[index].key,
              value: getOutputField()
            };
            index++;
            progress.value = (index / flatJSON.length) * 100;
          }, delay);
        } else {
          clearInterval(interval);
          translateBtn.removeAttribute("disabled");
          document.querySelector(".trj-output").value = JSON.stringify(
            outputToJson(outputFlatJSON),
            null,
            " "
          );
        }
      }, delay + 250);
    } catch (e) {
      translateBtn.removeAttribute("disabled");
      progress.classList.remove("display");
      document.querySelector(".trj-output").value =
        "Please check your JSON, it appears to be invalid";
    }
  }

  function outputToJson(flatJSON) {
    var result = {};
    function createNodes(obj, array, value) {
      var key = array.shift();
      if (key !== undefined) {
        if (obj[key] === undefined) {
          if (array.length > 0) {
            obj[key] = {};
          } else {
            obj[key] = value;
          }
        }
        createNodes(obj[key], array, value);
      }
    }
    flatJSON.map(item => createNodes(result, item.key.split("."), item.value));
    return result;
  }

  const addCSS = s =>
    ((d, e) => {
      e = d.createElement("style");
      e.innerHTML = s;
      d.head.appendChild(e);
    })(document);
  // Spice up things with some CSS
  addCSS(`
.trj-container {
    background: white;
    border: solid 1px #bababa;
    border-radius: .35rem;
    padding: .75rem;
    margin-bottom: 1rem;
}

.trj-txtareas-wrapper {
    display: flex;
    flex-flow: row;
    align-items: center;
}

.trj-txtarea {
    width: 50%;
    display: flex;
    flex-flow: column;
    padding-right: .75rem;
}

.trj-txtarea textarea {
    height: 10rem;
    border: solid 1px #bababa;
    border-radius: .35rem;
    font-family: monospace;
}

.trj-txtarea label {
    padding-bottom: .5rem;
}

.trj-button {
    cursor: pointer;
    color: white;
    font-weight: bold;
    text-transform: uppercase;
    border: none;
    background: #1799ff;
    height: 4rem;
    border-radius: .35rem;
    transition: .15s linear;
}

.trj-button[disabled] {
    background: #bababa;
    color: #333;
}

.trj-button:hover {
    background: #1683d8;
}

.trj-options {
    display: flex;
    margin-top: 1rem;
}

.trj-dly-input {
    border: solid 1px #bababa;
    border-radius: .35rem;
    margin-left: 1rem;
    font-family: monospace;
    padding: .15rem 0 .15rem .5rem;
}
.trj-controls progress {
    width: 100%;
    height: .75rem;
    -webkit-appearance: none;
    appearance: none;
    opacity: 0;
    transition: .15s linear;
}
.trj-controls progress.display {
    opacity: 1;
}
.trj-controls progress[value]::-webkit-progress-bar {
  background-color: #eee;
  border-radius: .25rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25) inset;
}

.trj-controls progress[value]::-webkit-progress-value {
  background-image:
	   -webkit-linear-gradient(135deg, #1799ff,#85f401);
    border-radius: .25rem;
}
`);
})();
