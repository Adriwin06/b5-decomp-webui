import * as library from '../../dist/b5-ui.js';
window.library = library;
window.ui = library.enhance(document.querySelector('#app'));
window.fixtureReady = true;
