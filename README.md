# translate-json

translate-json is a dirty and cheap injectable JavaScript code that will just help you translate those goddam JSON locales.

## Disclaimer

This script is for your own personal use. I'm not responsible of any misuse or ToS violation you might enfringe by using this script. This script is more for "educational purposes" than a professional tool you can rely on. If you need professionally done translations, there are a lot of services 100% more competent that a script I wront in half a day while getting bored.

## How does it work?

Simple, it will inject the script on your webpage and display a textarea, you paste your full JSON and click translate, the script will go through each entry, input it in your place copy the translate and associate it. The output JSON will then appear in the output textarea.
You can try the `example.json` if you want to see by yourself.

## How to use this script?

You'll need [TamperMonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) for Google Chrome or [GreaseMonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) for Firefox extension installed.
Once done, just [download the script here](https://github.com/tarkant/translate-json/raw/master/translate-json.user.js).
Then go to Google Translate or DeepL and try it.

## Options are possible

You can change the delay in the input that says delay, the script takes some time between each translate to take into account the time for translating and displaying the content. _Why not catch a change event?_ you'd ask, to this question I have three answers :

- You cannot listen to a change event in the output textarea since it's triggered by the internal script of the page.
- Google for example adds `...` while loading the translation which will fire a wrong event (even if I found out how).
- And finally, seriously, I made this to help me get my work done, not to create a high-end scalable app.

## Licence

[This script is under the CC-BY-NC 2.0 licence. You can read more about it over here](https://creativecommons.org/licenses/by-nc/2.0/).

## Contributions? Suggestions?

Just drop them in the issues, I'll be happy to discuss with you any ideas :) !
