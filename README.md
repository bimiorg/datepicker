# Substitute datepicker for pre-HTML5 browsers

[Live Demo Here](https://bimiorg.github.io/datepicker/index.html)

This commit is the improved datepicker based on [the original from Corion.net](http://www.corion.net/js/datepicker/index.html).

This improved version:
* attaches to <input type="date"> fields if the current browser does not have native support for date inputs.
* modifies webkit native date inputs with CSS to work more logically and be slightly less ugly (if native input is available).
* contains an extensive UI rework to simulate the Firefox 57 native datepicker.
* detects focus loss and hides the datepicker automatically.
* contains fixes and workarounds for all manner of inconsistent behaviour on legacy browsers:
  * supported on IE 6 - 11, Firefox 3.6 (manual attachment) - Firefox 56 (auto attachment), and Chrome 19.
* uses YYYY-MM-DD ISO format for compatibility with HTML5 native date inputs.
* and has [many more improvements](https://bimiorg.github.io/datepicker/changelog.html)....

[Live Demo Here](https://bimiorg.github.io/datepicker/index.html)

As the original author simply states "Artistic License", due to release dates it is assumed that the [Artistic License 1.0](LICENSE) is the applicable license.