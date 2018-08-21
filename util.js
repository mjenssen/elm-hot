// inject the HMR code into the Elm compiler's JS output
function inject(hmrCode, originalElmCodeJS) {
    // attach a tag to Browser.Navigation.Key values. It's not really fair to call this a hack
    // as this entire project is a hack, but this is evil evil evil. We need to be able to find
    // the Browser.Navigation.Key in a user's model so that we do not swap out the new one for
    // the old. But as currently implemented (2018-08-19), there's no good way to detect it.
    // So we will add a property to the key immediately after it's created so that we can find it.
    const navKeyDefinition = "var key = function() { key.a(onUrlChange(_Browser_getUrl())); };";
    const navKeyTag = "key['elm-hot-nav-key'] = true";
    originalElmCodeJS = originalElmCodeJS.replace(navKeyDefinition, navKeyDefinition + "\n" + navKeyTag);

    // splice in the HMR code
    const regex = /(_Platform_export\([^]*)(}\(this\)\);)/;
    const match = regex.exec(originalElmCodeJS);

    if (match === null) {
        throw new Error("Compiled JS from the Elm compiler is not valid. Version mismatch?");
    }

    return originalElmCodeJS.slice(0, match.index)
        + match[1] + "\n\n" + hmrCode + "\n\n" + match[2];
}

module.exports = {
    inject: inject
};